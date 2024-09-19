import { Db } from 'mongodb';
import {DataAPI, DataNamespace, FlattenKeys, ValueAtPath} from './api';

export class MongoWrapper<T extends keyof DataNamespace> implements DataAPI<T> {
  private collection: string = 'kv_store';

  constructor(private deps: { db: Db }) {}

  // Find records by key prefix and filter using dot notation
  async findByKeyPrefixAndJsonFields<K extends FlattenKeys<DataNamespace[T]>>(
    keyPrefix: string,
    filters: Partial<Record<K, ValueAtPath<DataNamespace[T], K>>>
  ): Promise<DataNamespace[T][]> {
    const query = {
      key: { $regex: `^${keyPrefix}` },
      ...filters
    };

    const results = await this.deps.db.collection(this.collection).find(query).toArray();

    // Cast the result to DataNamespace[T][] explicitly
    return results as unknown as DataNamespace[T][];
  }

  // Insert a new record into the MongoDB collection
  async insert<K extends keyof DataNamespace[T]>(key: string, value: DataNamespace[T]): Promise<void> {
    await this.deps.db.collection(this.collection).insertOne({ key, value });
  }

  // Update an existing record
  async update<K extends keyof DataNamespace[T]>(key: string, updateValue: Partial<DataNamespace[T]>): Promise<void> {
    await this.deps.db.collection(this.collection).updateOne({ key }, { $set: { value: updateValue } });
  }

  // Delete a record by key
  async delete(key: string): Promise<void> {
    await this.deps.db.collection(this.collection).deleteOne({ key });
  }
}
