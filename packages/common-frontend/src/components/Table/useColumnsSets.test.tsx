import { ProColumns } from '@ant-design/pro-components';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useColumnsSets, { TColumnsSet } from './useColumnsSets';

type Entity = {
  id: string;
  name: string;
  info?: unknown;
  price: number;
  details: string;
};

// A flat pair of columns plus a grouped column with two children, mirroring
// how pro-table group columns are declared.
const columns: ProColumns<Entity>[] = [
  { title: 'Id', dataIndex: 'id' },
  { title: 'Name', dataIndex: 'name' },
  {
    title: 'Info',
    dataIndex: 'info',
    children: [
      { title: 'Price', dataIndex: 'price' },
      { title: 'Details', dataIndex: 'details' },
    ],
  },
];

const columnsSets: TColumnsSet<Entity>[] = [
  { name: 'Main', columns: ['id', 'name'] },
  { name: 'Pricing', columns: ['id', 'price'] },
];

// The hook stores only the hidden columns ({ show: false }); shown columns are
// simply absent from the state.
const mainState = {
  price: { show: false },
  details: { show: false },
  info: { show: false },
};
// 'info' is kept visible because one of its children ('price') is shown.
const pricingState = {
  name: { show: false },
  details: { show: false },
};

const renderColumnsSets = (props: Partial<Parameters<typeof useColumnsSets<Entity>>[0]> = {}) =>
  renderHook(() => useColumnsSets<Entity>({ columns, columnsSets, ...props }));

describe('useColumnsSets', () => {
  describe('initial state', () => {
    it('chooses the first set by default and hides every column outside it', () => {
      const { result } = renderColumnsSets();

      expect(result.current.chosenColumnsSet).toEqual(mainState);
      expect(result.current.columnsState.value).toEqual(mainState);
    });

    it('chooses the set named by defaultColumnState', () => {
      const { result } = renderColumnsSets({ defaultColumnState: 'Pricing' });

      expect(result.current.chosenColumnsSet).toEqual(pricingState);
    });

    it('keeps a group column visible when at least one of its children is shown', () => {
      const { result } = renderColumnsSets({ defaultColumnState: 'Pricing' });

      // 'price' (child of 'info') is in the set, so neither of them is hidden.
      expect(result.current.chosenColumnsSet).not.toHaveProperty('price');
      expect(result.current.chosenColumnsSet).not.toHaveProperty('info');
      expect(result.current.chosenColumnsSet).toHaveProperty('details', { show: false });
    });

    it('falls back to no chosen set for an unknown defaultColumnState', () => {
      const { result } = renderColumnsSets({ defaultColumnState: 'Nope' });

      expect(result.current.chosenColumnsSet).toBeUndefined();
    });

    it('has no chosen set and no select without columnsSets', () => {
      const { result } = renderHook(() => useColumnsSets<Entity>({ columns }));

      expect(result.current.chosenColumnsSet).toBeUndefined();
      expect(result.current.columnsSetSelect()).toBeNull();
    });

    it('joins array dataIndex keys with commas', () => {
      type E = Record<string, unknown>;
      const nestedColumns = [
        { title: 'Id', dataIndex: 'id' },
        { title: 'Nested', dataIndex: ['a', 'b'] },
      ] as ProColumns<E>[];

      const { result } = renderHook(() =>
        useColumnsSets<E>({
          columns: nestedColumns,
          columnsSets: [
            { name: 'OnlyId', columns: ['id'] },
            { name: 'OnlyNested', columns: ['a,b'] },
          ],
        }),
      );

      expect(result.current.chosenColumnsSet).toEqual({ 'a,b': { show: false } });

      act(() => {
        result.current.setChosenColumnsSetByName('OnlyNested');
      });
      expect(result.current.chosenColumnsSet).toEqual({ id: { show: false } });
    });

    it('throws on an empty columnsSets array (current behavior)', () => {
      // `columnsSets?.[0].name` only guards against undefined, not [], so an
      // empty array crashes the hook while resolving the default set name.
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        expect(() =>
          renderHook(() => useColumnsSets<Entity>({ columns, columnsSets: [] })),
        ).toThrow(TypeError);
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('setChosenColumnsSetByName', () => {
    it('switches the active state to the named set', () => {
      const { result } = renderColumnsSets();

      act(() => {
        result.current.setChosenColumnsSetByName('Pricing');
      });

      expect(result.current.chosenColumnsSet).toEqual(pricingState);
      expect(result.current.columnsState.value).toEqual(pricingState);
    });

    it('clears the state for an unknown set name (current behavior)', () => {
      const { result } = renderColumnsSets();

      act(() => {
        result.current.setChosenColumnsSetByName('Nope');
      });

      expect(result.current.chosenColumnsSet).toBeUndefined();
    });
  });

  describe('columnsState.onChange', () => {
    it('stores the new state and re-shows a group column when a child becomes visible', () => {
      const { result } = renderColumnsSets();

      act(() => {
        result.current.columnsState.onChange!({
          id: { show: false },
          price: { show: true },
        });
      });

      expect(result.current.chosenColumnsSet).toEqual({
        id: { show: false },
        price: { show: true },
        info: { show: true },
      });
    });

    it('does not touch group columns when no child is shown', () => {
      const { result } = renderColumnsSets();

      act(() => {
        result.current.columnsState.onChange!({ name: { show: false } });
      });

      expect(result.current.chosenColumnsSet).toEqual({ name: { show: false } });
    });
  });

  describe('columnsSetSelect', () => {
    const messages = {
      'tables.columnsSetSelect.hint.title': 'Columns sets',
      'tables.columnsSetSelect.hint.message': 'Use {gearIcon} to adjust columns',
    };

    let hook: ReturnType<typeof useColumnsSets<Entity>>;

    // antd v5 injects `:has(+ .ant-select-item-option-selected...)` rules that
    // jsdom's nwsapi engine cannot evaluate: computing any style then throws a
    // SyntaxError from deep inside rc-motion when the dropdown closes. Fall
    // back to an empty style declaration when jsdom's implementation chokes.
    beforeEach(() => {
      const original = window.getComputedStyle.bind(window);
      vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
        try {
          return original(element, pseudo);
        } catch {
          return { getPropertyValue: () => '' } as unknown as CSSStyleDeclaration;
        }
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    function Harness({ sets = columnsSets }: { sets?: TColumnsSet<Entity>[] }) {
      hook = useColumnsSets<Entity>({ columns, columnsSets: sets });
      return <>{hook.columnsSetSelect()}</>;
    }

    const renderHarness = (sets?: TColumnsSet<Entity>[]) =>
      render(
        <IntlProvider locale="en" messages={messages}>
          <Harness sets={sets} />
        </IntlProvider>,
      );

    it('renders nothing for a single set', () => {
      const { container } = renderHarness([columnsSets[0]]);

      expect(container).toBeEmptyDOMElement();
    });

    it('renders a select with the chosen set and switches sets on selection', async () => {
      renderHarness();

      // The current set is displayed in the closed select.
      expect(screen.getByTitle('Main')).toBeInTheDocument();

      // fireEvent instead of userEvent: userEvent's style checks make jsdom
      // parse antd's CSS-in-JS selectors, which its nwsapi engine rejects.
      fireEvent.mouseDown(screen.getByRole('combobox'));
      fireEvent.click(await screen.findByTitle('Pricing'));

      expect(hook.chosenColumnsSet).toEqual(pricingState);
    });
  });
});
