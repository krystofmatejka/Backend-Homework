const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection configuration
const config = {
  uri: process.env.MONGODB_URI,
  database: process.env.MONGO_INITDB_DATABASE,
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT
};

console.log('MongoDB Configuration:');
console.log(`Host: ${config.host}`);
console.log(`Port: ${config.port}`);
console.log(`Database: ${config.database}`);
console.log(`URI: ${config.uri}`);
console.log('---');

// Create MongoDB client
const client = new MongoClient(config.uri, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    // Verify connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database reference
    const db = client.db(config.database);
    console.log(`📁 Using database: ${config.database}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 Collections in database: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('Existing collections:');
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    } else {
      console.log('No collections found in database');
    }
    
    return { client, db };
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    throw error;
  }
}

async function testDatabaseOperations(db) {
  try {
    console.log('\n🧪 Testing basic database operations...');
    
    // Create a test collection
    const testCollection = db.collection('test');
    
    // Insert a test document
    const testDoc = {
      message: 'Hello MongoDB!',
      timestamp: new Date(),
      nodeVersion: process.version,
      environment: 'development'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Inserted test document with ID: ${insertResult.insertedId}`);
    
    // Read the document back
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Retrieved document:', foundDoc);
    
    // Count documents in collection
    const count = await testCollection.countDocuments();
    console.log(`📊 Total documents in test collection: ${count}`);
    
    // Clean up - remove test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('🧹 Cleaned up test document');
    
  } catch (error) {
    console.error('❌ Error during database operations:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Connect to MongoDB
    const { client, db } = await connectToMongoDB();
    
    // Test basic operations
    await testDatabaseOperations(db);
    
    console.log('\n🎉 All operations completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Application failed:', error.message);
    process.exit(1);
  } finally {
    // Always close the connection
    try {
      await client.close();
      console.log('👋 Disconnected from MongoDB');
    } catch (error) {
      console.error('Error closing connection:', error.message);
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing MongoDB connection...');
  try {
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error closing connection:', error.message);
  }
  process.exit(0);
});

// Export for use in other modules
module.exports = {
  connectToMongoDB,
  testDatabaseOperations,
  client,
  config
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}