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

export interface DataAPI<T extends keyof DataNamespace> {
  findByKeyPrefixAndJsonFields<K extends FlattenKeys<DataNamespace[T]>>(
    keyPrefix: string,
    filters: Partial<Record<K, ValueAtPath<DataNamespace[T], K>>>
  ): Promise<DataNamespace[T][]>;

  insert<K extends keyof DataNamespace[T]>(key: string, value: DataNamespace[T]): Promise<void>;

  update<K extends keyof DataNamespace[T]>(key: string, updateValue: Partial<DataNamespace[T]>): Promise<void>;

  delete(key: string): Promise<void>;
}

export interface DataNamespace {
  user: {
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
}

export interface DataNamespace {
  settings: {
    darkMode: boolean;
    autoSave: boolean;
  };
}
