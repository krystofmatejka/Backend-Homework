import { ObjectId } from "mongodb";
import { getDb } from "../lib/database.js";

export async function usersSeed() {
  const mongodb = getDb();

  await mongodb.collection('users').drop();

  const now = new Date();

  const usersToInsert = [
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
      name: 'John Smith',
      email: 'john.smith@example.com',
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9c02'),
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9c03'),
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9c04'),
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      is_active: false,
      created_at: now,
      updated_at: now
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9c05'),
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];

  await mongodb.collection('users').insertMany(usersToInsert);

  const users = await mongodb.collection('users').countDocuments();
  console.log("Number of users in DB:", users);
}