import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const mongodb = client.db(process.env.MONGO_INITDB_DATABASE);

export const getDb = () => mongodb;
