export type FlattenKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? `${K}.${FlattenKeys<T[K]>}` | K
    : K;
}[keyof T & string];

export type ValueAtPath<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? ValueAtPath<T[Key], Rest>
    : never
  : Path extends keyof T
  ? T[Path]
  : never;

  export interface DataAPI {
  findByKeyPrefixAndJsonFields<K extends keyof DataNamespace, FK extends FlattenKeys<DataNamespace[K]>>(
    key: K,
    collectionName: string,
    keyPrefix: string,
    filters: Partial<Record<FK, ValueAtPath<DataNamespace[K], FK>>>
  ): Promise<DataNamespace[K][]>;

  insert<K extends keyof DataNamespace>(
    key: K,
    collectionName: string,
    recordKey: string,
    value: DataNamespace[K]
  ): Promise<void>;

  update<K extends keyof DataNamespace>(
    key: K,
    collectionName: string,
    recordKey: string,
    updateValue: Partial<DataNamespace[K]>
  ): Promise<void>;

  delete<K extends keyof DataNamespace>(
    key: K,
    collectionName: string,
    recordKey: string
  ): Promise<void>;
}

type User = {
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export interface DataNamespace {
  user: User;
}

export interface DataNamespace {
  settings: {
    darkMode: boolean;
    autoSave: boolean;
  };
}
