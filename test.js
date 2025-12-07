import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();
const db = client.db(process.env.MONGO_INITDB_DATABASE);

await db.collection('users').insertOne({
  name: 'John Doe',
  email: 'john.doe@example.com',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
})

const collections = await db.collections()
console.log("Collections in DB:", collections.map(c => c.collectionName));

const users = await db.collection('users').find();
console.log("Users in DB:", await users.toArray());

await client.close();
