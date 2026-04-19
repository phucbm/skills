# Dexie.js — Local-First Patterns

## Why Dexie

- Wraps IndexedDB with a clean Promise/async-await API
- `useLiveQuery()` auto-rerenders React components on data changes (no extra state management)
- Schema versioning with `.upgrade()` handles migrations for existing user data
- Typed tables via `Table<T, PrimaryKey>` — full TypeScript support
- IndexedDB storage cap: gigabytes (vs localStorage ~5 MB)

## Setup

```bash
pnpm add dexie dexie-react-hooks
```

## Database definition (`lib/db.ts`)

```ts
import Dexie, { type Table } from 'dexie';

export interface Item {
  id?: number;
  name: string;
  createdAt: number;
}

class AppDatabase extends Dexie {
  items!: Table<Item, number>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      items: '++id, name',
    });
  }
}

export const db = new AppDatabase();
```

- `++id` — auto-increment primary key
- Only index fields you query/sort by; non-indexed fields are still stored

## Schema migration

```ts
this.version(1).stores({ items: '++id, name' });

this.version(2).stores({ items: '++id, name, category' }).upgrade(tx =>
  tx.table('items').toCollection().modify(item => {
    item.category = item.category ?? 'uncategorized';
  })
);
```

- Always keep old versions — Dexie runs upgrades sequentially for users on older versions
- `.modify()` mutates in place; return value is ignored

## Querying

```ts
const all = await db.items.toArray();
const filtered = await db.items.where('name').equals('foo').toArray();
const sorted = await db.items.orderBy('createdAt').toArray();
const one = await db.items.get(id);
```

## Writes

```ts
const id = await db.items.add({ name: 'Foo', createdAt: Date.now() });
await db.items.update(id, { name: 'Bar' });
await db.items.put({ id: 1, name: 'Bar', createdAt: Date.now() }); // upsert
await db.items.delete(id);
```

## React integration — `useLiveQuery`

```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export function ItemList() {
  const items = useLiveQuery(() => db.items.toArray(), []);

  if (!items) return <p>Loading…</p>;
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
}
```

- Returns `undefined` on first render — use as loading state
- Second arg is dependency array — include any variables used inside the query
- Re-renders automatically whenever the queried table changes

## Transactions

```ts
await db.transaction('rw', db.items, async () => {
  await db.items.add({ ... });
  await db.items.update(someId, { ... });
});
```

## Next.js / SSR constraint

- Dexie only runs client-side — use `'use client'` directive or guard with `typeof window !== 'undefined'`
- Never call `db.*` in server components or static data-fetching functions

## Gotchas

- **Index only what you filter/sort on** — over-indexing wastes space and slows writes
- **`useLiveQuery` returns `undefined` initially** — always handle the loading state
- **Compound index**: `'[field1+field2]'` in `.stores()` for multi-field queries
- **Bulk ops**: `db.items.bulkAdd([...])` / `db.items.bulkDelete([...])` for batch writes
- **Version must only increase** — never reuse or decrement a version number

## References

- Docs: https://dexie.org/docs/
- React hooks: https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
