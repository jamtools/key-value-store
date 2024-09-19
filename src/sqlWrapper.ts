import Knex from 'knex';
import {DataAPI, DataNamespace, FlattenKeys, ValueAtPath} from './api';

export class SQLWrapper<T extends keyof DataNamespace> implements DataAPI<T> {
  private table: string = 'kv_store';

  constructor(private deps: {knex: typeof Knex}) { }

  // Find records by key prefix and filter using JSON paths
  async findByKeyPrefixAndJsonFields<K extends FlattenKeys<DataNamespace[T]>>(
    keyPrefix: string,
    filters: Partial<Record<K, ValueAtPath<DataNamespace[T], K>>>
  ): Promise<DataNamespace[T][]> {
    let query = this.deps.knex(this.table).where('key', 'like', `${keyPrefix}%`);

    Object.entries(filters).forEach(([field, value]) => {
      if (typeof value === 'boolean') {
        query = query.whereRaw(`CAST(json_extract(value, '$.${field}') AS boolean) = ?`, [value]);
      } else if (typeof value === 'string') {
        query = query.whereRaw(`json_extract(value, '$.${field}') = ?`, [value]);
      } else if (typeof value === 'number') {
        query = query.whereRaw(`CAST(json_extract(value, '$.${field}') AS integer) = ?`, [value]);
      }
    });

    return query.select();
  }

  // Insert a new record into the kv_store table
  async insert<K extends keyof DataNamespace[T]>(key: string, value: DataNamespace[T]): Promise<void> {
    await this.deps.knex(this.table).insert({key, value: JSON.stringify(value)});
  }

  // Update an existing record
  async update<K extends keyof DataNamespace[T]>(key: string, updateValue: Partial<DataNamespace[T]>): Promise<void> {
    await this.deps.knex(this.table).where('key', key).update({value: JSON.stringify(updateValue)});
  }

  // Delete a record by key
  async delete(key: string): Promise<void> {
    await this.deps.knex(this.table).where('key', key).delete();
  }
}
