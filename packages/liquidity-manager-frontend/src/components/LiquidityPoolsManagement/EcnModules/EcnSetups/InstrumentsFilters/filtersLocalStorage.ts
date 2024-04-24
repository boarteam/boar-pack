export const defaultFiltersState: FiltersState = {
  values: []
}

export interface FiltersState {
  values: string[];
}

class FiltersLocalStorage {
  private FILTERS_LOCAL_STORAGE_KEY = 'setupInstrumentsFilters';

  public getFilters(): FiltersState {
    const filtersString = localStorage.getItem(this.FILTERS_LOCAL_STORAGE_KEY);
    if (!filtersString) {
      return defaultFiltersState;
    }

    try {
      const filters = JSON.parse(filtersString);

      let values: string[];
      if (!Array.isArray(filters.values) || !filters.values.every((i: unknown) => typeof i === 'string')) {
        values = defaultFiltersState.values;
      } else {
        values = filters.values;
      }

      return { values };
    } catch (e) {
      return defaultFiltersState;
    }
  }

  public saveFilters(filters: FiltersState) {
    localStorage.setItem(this.FILTERS_LOCAL_STORAGE_KEY, JSON.stringify({
      values: filters.values,
    }));
  }

  public clearFilters() {
    localStorage.removeItem(this.FILTERS_LOCAL_STORAGE_KEY);
  }
}

const filtersLocalStorage = new FiltersLocalStorage();

export default filtersLocalStorage;
