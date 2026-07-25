import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNewId, isRecordNew, KEY_SYMBOL, useCreation } from './useCreation';
import { ApiError } from '../../tools/ApiError';

// The real CreateEntityModal drags in ProDescriptions; stub it and capture the
// props so the hook's submit/cancel wiring can be driven directly.
let modalProps: any;
vi.mock('./CreateEntityModal', () => ({
  CreateEntityModal: (props: any) => {
    modalProps = props;
    return <div data-testid="create-modal" data-open={String(props.entity !== undefined)} />;
  },
}));

type Entity = { id: string; name: string; email: string };

const messages = { 'table.newButton': 'New' };

const makeActionRef = () => ({
  current: {
    reload: vi.fn(),
    addEditRecord: vi.fn(),
  } as any,
});

function Harness({
  onCreate,
  actionRef,
  popupCreation,
  createNewDefaultParams,
  pathParams = {},
}: {
  onCreate?: (params: any) => Promise<Entity>;
  actionRef?: any;
  popupCreation?: boolean;
  createNewDefaultParams?: Partial<Entity>;
  pathParams?: Record<string, string>;
}) {
  const { createButton, creationModal } = useCreation<
    Entity,
    Partial<Entity>,
    Record<string, string>
  >({
    title: 'Create entity',
    columns: [],
    idColumnName: 'id',
    onCreate,
    pathParams,
    entityToCreateDto: (entity) => ({ name: entity.name, email: entity.email }),
    actionRef,
    createButtonSize: 'small',
    popupCreation,
    createNewDefaultParams,
  });

  return (
    <>
      {createButton}
      {creationModal}
    </>
  );
}

const renderHarness = (props: React.ComponentProps<typeof Harness>) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      <Harness {...props} />
    </IntlProvider>,
  );

const makeApiError = (statusCode: number, errors: { field: string; message: string }[]) => {
  const error = new ApiError('Validation failed');
  Object.assign(error, {
    status: statusCode,
    statusText: 'Bad Request',
    url: '/api/entities',
    body: { statusCode, message: 'Validation failed', errors },
  });
  return error;
};

beforeEach(() => {
  modalProps = undefined;
});

describe('getNewId', () => {
  it('returns unique NEW_RECORD-prefixed ids', () => {
    const first = getNewId();
    const second = getNewId();

    expect(first).toMatch(/^NEW_RECORD\d+$/);
    expect(second).toMatch(/^NEW_RECORD\d+$/);
    expect(second).not.toBe(first);
  });
});

describe('isRecordNew', () => {
  it('detects new records by the KEY_SYMBOL key', () => {
    expect(isRecordNew({ [KEY_SYMBOL]: getNewId() })).toBe(true);
    expect(isRecordNew({ [KEY_SYMBOL]: 'saved-key' })).toBe(false);
  });

  it('detects new records by a NEW_RECORD id', () => {
    expect(isRecordNew({ id: 'NEW_RECORD3' })).toBe(true);
    expect(isRecordNew({ id: 'abc' })).toBe(false);
  });

  it('returns false for saved records, numeric ids and empty records', () => {
    expect(isRecordNew({ id: 42 })).toBe(false);
    expect(isRecordNew({})).toBe(false);
    expect(isRecordNew({ [KEY_SYMBOL]: undefined, id: undefined })).toBe(false);
  });
});

describe('useCreation', () => {
  describe('create button (inline mode)', () => {
    it('adds an editable record at the top with a fresh new id and defaults', async () => {
      const user = userEvent.setup();
      const actionRef = makeActionRef();

      renderHarness({ actionRef, createNewDefaultParams: { name: 'Default name' } });

      await user.click(screen.getByText('New'));

      expect(actionRef.current.addEditRecord).toHaveBeenCalledTimes(1);
      const [record, options] = actionRef.current.addEditRecord.mock.calls[0];
      expect(record[KEY_SYMBOL]).toMatch(/^NEW_RECORD\d+$/);
      expect(isRecordNew(record)).toBe(true);
      expect(record.name).toBe('Default name');
      expect(options).toEqual({ position: 'top' });
    });
  });

  describe('popup mode', () => {
    it('opens the modal with default params and closes it on cancel', async () => {
      const user = userEvent.setup();

      renderHarness({ popupCreation: true, createNewDefaultParams: { name: 'Prefilled' } });

      expect(modalProps.entity).toBeUndefined();
      expect(screen.getByTestId('create-modal')).toHaveAttribute('data-open', 'false');

      await user.click(screen.getByText('New'));

      expect(modalProps.entity).toEqual({ name: 'Prefilled' });
      expect(screen.getByTestId('create-modal')).toHaveAttribute('data-open', 'true');

      act(() => {
        modalProps.onCancel();
      });
      expect(modalProps.entity).toBeUndefined();
    });

    it('does not open the modal without createNewDefaultParams (current behavior)', async () => {
      // popupCreation sets the popup data to createNewDefaultParams as-is, so when
      // no defaults are configured the New button leaves the modal closed.
      const user = userEvent.setup();

      renderHarness({ popupCreation: true });

      await user.click(screen.getByText('New'));

      expect(modalProps.entity).toBeUndefined();
      expect(screen.getByTestId('create-modal')).toHaveAttribute('data-open', 'false');
    });

    it('submits the entity through onCreate with pathParams and the create DTO, then reloads', async () => {
      const user = userEvent.setup();
      const actionRef = makeActionRef();
      const onCreate = vi.fn().mockResolvedValue({ id: '1', name: 'Zed', email: 'z@x.io' });
      const descriptionsRef = { current: { setFieldErrors: vi.fn() } } as any;

      renderHarness({
        popupCreation: true,
        actionRef,
        onCreate,
        pathParams: { org: 'o1' },
        createNewDefaultParams: {},
      });
      await user.click(screen.getByText('New'));

      await act(async () => {
        await modalProps.onSubmit(
          { name: 'Zed', email: 'z@x.io', junk: 'dropped' },
          descriptionsRef,
        );
      });

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate.mock.calls[0][0]).toEqual({
        org: 'o1',
        requestBody: { name: 'Zed', email: 'z@x.io' },
      });
      expect(actionRef.current.reload).toHaveBeenCalledTimes(1);
      expect(descriptionsRef.current.setFieldErrors).not.toHaveBeenCalled();
      // The popup closes after a successful submit.
      expect(modalProps.entity).toBeUndefined();
    });

    describe('error handling', () => {
      let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterEach(() => {
        consoleErrorSpy.mockRestore();
      });

      it('maps an ApiError 400 body to form field errors and keeps the popup open', async () => {
        const user = userEvent.setup();
        const actionRef = makeActionRef();
        const onCreate = vi.fn().mockRejectedValue(
          makeApiError(400, [
            { field: 'name', message: 'Name is required' },
            { field: 'email', message: 'Email must be valid' },
          ]),
        );
        const descriptionsRef = { current: { setFieldErrors: vi.fn() } } as any;

        renderHarness({ popupCreation: true, actionRef, onCreate, createNewDefaultParams: {} });
        await user.click(screen.getByText('New'));

        await act(async () => {
          await modalProps.onSubmit({ name: '', email: 'nope' }, descriptionsRef);
        });

        expect(descriptionsRef.current.setFieldErrors).toHaveBeenCalledTimes(1);
        expect(descriptionsRef.current.setFieldErrors).toHaveBeenCalledWith([
          { name: 'name', errors: ['Name is required'] },
          { name: 'email', errors: ['Email must be valid'] },
        ]);
        expect(actionRef.current.reload).not.toHaveBeenCalled();
        // The popup stays open so the user can fix the fields.
        expect(modalProps.entity).toBeDefined();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      it('does not map field errors for non-400 ApiErrors', async () => {
        const user = userEvent.setup();
        const onCreate = vi
          .fn()
          .mockRejectedValue(makeApiError(500, [{ field: 'name', message: 'Server exploded' }]));
        const descriptionsRef = { current: { setFieldErrors: vi.fn() } } as any;

        renderHarness({ popupCreation: true, onCreate, createNewDefaultParams: {} });
        await user.click(screen.getByText('New'));

        await act(async () => {
          await modalProps.onSubmit({ name: 'x' }, descriptionsRef);
        });

        expect(descriptionsRef.current.setFieldErrors).not.toHaveBeenCalled();
        expect(modalProps.entity).toBeDefined();
      });

      it('swallows plain errors without an ApiError body', async () => {
        const user = userEvent.setup();
        const onCreate = vi.fn().mockRejectedValue(new Error('network down'));
        const descriptionsRef = { current: { setFieldErrors: vi.fn() } } as any;

        renderHarness({ popupCreation: true, onCreate, createNewDefaultParams: {} });
        await user.click(screen.getByText('New'));

        await expect(
          act(async () => {
            await modalProps.onSubmit({ name: 'x' }, descriptionsRef);
          }),
        ).resolves.not.toThrow();

        expect(descriptionsRef.current.setFieldErrors).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });
});
