import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProColumns } from '@ant-design/pro-components';
import { useImportExport } from './useImportExport';
import { TRelationalFields } from '../ChangesModal';

const { readMock, sheetToJsonMock } = vi.hoisted(() => ({
  readMock: vi.fn(),
  sheetToJsonMock: vi.fn(),
}));

vi.mock('xlsx', () => ({
  read: readMock,
  utils: { sheet_to_json: sheetToJsonMock },
}));

type Entity = {
  id: string;
  name: string;
  note: string;
  role: string;
  amount: number;
  active: boolean;
  openedAt: string;
};

const columns: ProColumns<Entity>[] = [
  { dataIndex: 'id' },
  { dataIndex: 'name' },
  { dataIndex: 'note', valueType: 'text' },
  { dataIndex: 'role', valueType: 'select' },
  { dataIndex: 'amount', valueType: 'digit' },
  { dataIndex: 'active', valueType: 'switch' },
  { dataIndex: 'openedAt', valueType: 'dateTime' },
];

function Harness({ relationalFields }: { relationalFields?: TRelationalFields }) {
  const { importButton, diffResult } = useImportExport<Entity>({
    exportUrl: '/api/entities/export',
    columns,
    changedRecordsColumnsConfig: columns,
    relationalFields,
  });

  return (
    <>
      {importButton}
      <span data-testid="diff">{diffResult ? JSON.stringify(diffResult) : ''}</span>
    </>
  );
}

/** Feeds the two CSVs the hook compares: the one it fetches, and the one the user picks. */
function importFile(
  container: HTMLElement,
  before: Record<string, unknown>[],
  after: Record<string, unknown>[],
) {
  sheetToJsonMock.mockReturnValueOnce(before).mockReturnValueOnce(after);

  const input = container.querySelector('input[type="file"]')!;
  fireEvent.change(input, {
    target: { files: [{ arrayBuffer: async () => new ArrayBuffer(0) }] },
  });
}

const readDiff = async () => {
  await waitFor(() => expect(screen.getByTestId('diff')).not.toBeEmptyDOMElement());
  return JSON.parse(screen.getByTestId('diff').textContent!);
};

beforeEach(() => {
  readMock.mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })),
  );
  vi.spyOn(console, 'time').mockImplementation(() => {});
  vi.spyOn(console, 'timeEnd').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('useImportExport', () => {
  describe('row normalization', () => {
    it('normalizes each value by the valueType of its column', async () => {
      const { container } = render(<Harness />);

      importFile(
        container,
        [],
        [
          {
            // no id — the row is reported as created, with its normalized values
            name: 123,
            note: 5,
            role: 7,
            amount: '42',
            active: 'TRUE',
            openedAt: 20240101,
            unknownColumn: 9,
            emptyString: '',
            nullString: 'null',
            missing: null,
          },
        ],
      );

      const { created } = await readDiff();

      expect(created).toEqual([
        {
          // text columns and columns without a valueType are compared as strings
          name: '123',
          note: '5',
          // other valueTypes keep the type their own handling gave them
          role: 7,
          amount: 42,
          active: true,
          openedAt: 20240101,
          // keys with no column at all have no declared valueType either
          unknownColumn: '9',
          emptyString: null,
          nullString: null,
          missing: null,
        },
      ]);
    });

    it('resolves relational ids into their dictionary entry', async () => {
      const relationalFields: TRelationalFields = new Map([
        [
          'role',
          {
            key: 'role',
            data: { 7: { id: 7, name: 'Manager' } },
          },
        ],
      ]);
      const { container } = render(<Harness relationalFields={relationalFields} />);

      importFile(
        container,
        [],
        [
          { name: 'Foo', role_id: 7 },
          { name: 'Bar', role_id: 404 },
        ],
      );

      const { created } = await readDiff();

      expect(created[0].role).toEqual({ id: 7, name: 'Manager' });
      expect(created[1].role).toBeNull();
    });
  });

  describe('diffing', () => {
    it('ignores values that only differ in type between the two files', async () => {
      const { container } = render(<Harness />);

      // the fetched export is parsed with type inference, the imported file is parsed raw
      importFile(
        container,
        [{ id: 1, version: 1, name: 'Foo', note: 7, amount: 42 }],
        [{ id: '1', version: '1', name: 'Foo', note: '7', amount: '42' }],
      );

      const diff = await readDiff();

      expect(diff.updated).toEqual([]);
      expect(diff.tableData).toEqual([]);
      expect(diff.created).toEqual([]);
    });

    it('reports changed fields with the new value and the current version', async () => {
      const { container } = render(<Harness />);

      importFile(
        container,
        [{ id: 1, version: 1, name: 'Foo', amount: 42 }],
        [{ id: '1', version: '2', name: 'Bar', amount: '43' }],
      );

      const diff = await readDiff();

      expect(diff.updated).toEqual([{ id: '1', version: '2', name: 'Bar', amount: 43 }]);
      expect(diff.tableData).toHaveLength(1);
      expect(diff.tableData[0]).toMatchObject({ id: '1', name: 'Bar', amount: 43 });
    });
  });
});
