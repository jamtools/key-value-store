import Knex from 'knex';
import { MongoClient } from 'mongodb';
import { SQLWrapper } from './sqlWrapper';
import { MongoWrapper } from './mongoWrapper';
import {DataAPI} from './api';

// Testing SQL (SQLite)
const knex = Knex({
  client: 'sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true
});

const dataAPI = {} as DataAPI;

(async () => {
  // Setup SQLite table
  await knex.schema.createTable('kv_store', (table) => {
    table.string('key').primary();
    table.json('value');
  });

  const userData = {
    preferences: {
      theme: 'dark',
      notifications: true,
    },
  } as const;

  // Inserting data for the 'user' namespace
  await dataAPI.insert('user', 'user_collection', 'user_1', userData);

  // Filter users by preferences
  // const filters = { 'preferences.theme': 'dark' } as const;
  // const users = await userData.findByKeyPrefixAndJsonFields('user_', { 'preferences.theme': 'dark' });
  const users = await dataAPI.findByKeyPrefixAndJsonFields('user', 'user_collection', 'user_', { 'preferences.theme': 'dark' });

  console.log(users);

  await dataAPI.update('user', 'user_collection', 'user_1', {
    preferences: {
      theme: 'light',
      notifications: true,
    },
  });

  // Deleting data for the 'user' namespace
  await dataAPI.delete('user', 'user_collection', 'user_1');

  await knex.destroy();
})();

// Testing MongoDB
(async () => {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('test');
  const mongoAPI = new MongoWrapper<'user'>({ db });

  // Insert test data
  await mongoAPI.insert('user_1', { preferences: { theme: 'dark', notifications: true } });
  await mongoAPI.insert('user_2', { preferences: { theme: 'light', notifications: false } });

  // Test filtering
  const users = await mongoAPI.findByKeyPrefixAndJsonFields('user_', { 'preferences.theme': 'dark' });
  console.log('MongoDB Users with dark theme:', users);

  // Clean up
  await db.dropDatabase();
  await client.close();
})();
