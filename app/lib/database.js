import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

async function initIndexes(mongodb) {
  const collection = mongodb.collection('shopping_lists');

  await collection.createIndex(
    { owner_id: 1, archived_at: 1, _id: -1 },
    { name: 'owner_archived_id_idx' }
  );

  await collection.createIndex(
    { member_ids: 1, archived_at: 1, _id: -1 },
    { name: 'members_archived_id_idx' }
  );

  await collection.createIndex(
    { archived_at: 1, owner_id: 1 },
    { name: 'archived_owner_idx' }
  );

  await collection.createIndex(
    { member_ids: 1 },
    { name: 'members_idx' }
  );

  await collection.createIndex(
    { 'items._id': 1 },
    { name: 'items_id_idx' }
  );

  await collection.createIndex(
    { archived_at: 1, member_ids: 1 },
    { name: 'archived_members_idx' }
  );
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const mongodb = client.db(process.env.MONGO_INITDB_DATABASE);

await initIndexes(mongodb);

export const getDb = () => mongodb;
