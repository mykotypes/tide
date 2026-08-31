import { useState } from 'react';

import { createModuleStore } from '@/lib/create-module-store';

export interface CatalogOption<Id extends string> {
  id: Id;
  label: string;
}

export interface SelectableCatalog<Id extends string> {
  getId: () => Id;
  setId: (id: Id) => void;
  subscribe: (listener: (id: Id) => void) => () => void;
  useSelected: () => [Id, (id: Id) => void];
}

export function createSelectableCatalog<Id extends string>(defaultId: Id): SelectableCatalog<Id> {
  const store = createModuleStore<Id>(defaultId);

  function useSelected(): [Id, (id: Id) => void] {
    const [id, setLocalId] = useState<Id>(store.get());

    function select(next: Id) {
      store.set(next);
      setLocalId(next);
    }

    return [id, select];
  }

  return { getId: store.get, setId: store.set, subscribe: store.subscribe, useSelected };
}
