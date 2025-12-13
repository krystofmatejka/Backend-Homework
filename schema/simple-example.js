import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Simple MongoDB connection example
async function simpleConnect() {
    const client = new MongoClient(process.env.MONGODB_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB!');

        const db = client.db(process.env.MONGO_INITDB_DATABASE);

        // Example: Insert a document
        const users = db.collection('users');
        await users.insertOne({
            name: 'Big Boi',
            email: 'bigboi@example.com',
            password: 'supersecretpassword',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        });

        const lists = db.collection('shopping_lists');
        await lists.insertOne({
            title: 'My Big List',
            owner_id: '12345',
            member_ids: ['12345', '67890'],
            items: [
                { _id: new ObjectId(),name: 'Milk', quantity: 2, purchased_at: null, created_by_user_id: '12345', created_at: new Date(), updated_at: new Date() },
                { _id: new ObjectId(),name: 'Bread', quantity: 1, purchased_at: null, created_by_user_id: '12345', created_at: new Date(), updated_at: new Date() }
            ],
            created_at: new Date(),
            updated_at: new Date(),
            archived_at: null
        });

        console.log('Document inserted successfully');

        // indexes
        await users.createIndex({ email: 1 }, { unique: true });
        await lists.createIndex({ owner_id: 1 });
        await lists.createIndex({ member_ids: 1 });

        // sorting
        await lists.createIndex({ created_at: -1 });
        await lists.createIndex({ updated_at: -1 });
        await lists.createIndex({ archived_at: 1 });

        // full text
        await lists.createIndex({ title: 'text', 'items.name': 'text' }, {
            name: 'TextIndexOnTitleAndItems',
            weights: { title: 10, 'items.name': 1 }
        });

        // Example: Find documents
        const docs = await users.find({}).toArray();
        console.log('Found documents:', docs.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

simpleConnect();