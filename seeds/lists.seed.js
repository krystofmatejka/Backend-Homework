import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function listsSeeds() {
  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();
  const db = client.db(process.env.MONGO_INITDB_DATABASE);

  await db.collection('shopping_lists').drop();

  await db.collection('shopping_lists').insertOne({
    title: 'Grocery Shopping',
    owner_id: new ObjectId("69357514b81ab26be6c45ad4"),
    member_ids: [],
    items: [
      {
        name: 'Milk',
        quantity: 1,
        purchased_at: null,
        created_by_user_id: new ObjectId("69357514b81ab26be6c45ad4"),
        created_at: new Date('2025-11-20T09:00:00Z'),
        updated_at: new Date('2025-11-20T09:00:00Z')
      }
    ],
    created_at: new Date('2025-11-20T09:00:00Z'),
    updated_at: new Date('2025-11-20T09:00:00Z'),
    archived_at: null
  });

  await db.collection('shopping_lists').insertOne({
    title: 'Hardware Shopping',
    owner_id: new ObjectId("693571565915bbf489840f2a"),
    member_ids: [new ObjectId("69357514b81ab26be6c45ad4")],
    items: [
      {
        name: 'Hammer',
        quantity: 1,
        purchased_at: null,
        created_by_user_id: new ObjectId("693571565915bbf489840f2a"),
        created_at: new Date('2025-11-20T09:00:00Z'),
        updated_at: new Date('2025-11-20T09:00:00Z')
      }
    ],
    created_at: new Date('2025-11-20T09:00:00Z'),
    updated_at: new Date('2025-11-20T09:00:00Z'),
    archived_at: null
  });

  await db.collection('shopping_lists').insertOne({
    title: 'Shopping for fun',
    owner_id: new ObjectId("693571565915bbf489840f2a"),
    member_ids: [],
    items: [
      {
        name: 'Huge diamond',
        quantity: 1,
        purchased_at: null,
        created_by_user_id: new ObjectId("693571565915bbf489840f2a"),
        created_at: new Date('2025-11-20T09:00:00Z'),
        updated_at: new Date('2025-11-20T09:00:00Z')
      }
    ],
    created_at: new Date('2025-11-20T09:00:00Z'),
    updated_at: new Date('2025-11-20T09:00:00Z'),
    archived_at: null
  });

  await client.close();
}

listsSeeds().catch(err => {
  console.error('Error seeding lists:', err);
  process.exit(1);
});