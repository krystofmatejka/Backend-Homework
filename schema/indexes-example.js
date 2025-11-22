const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB indexes example with Users and Lists relationship
async function demonstrateIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    
    const db = client.db(process.env.MONGO_INITDB_DATABASE);
    
    // Clear existing data and indexes for clean demo
    await db.collection('users').drop().catch(() => {});
    await db.collection('lists').drop().catch(() => {});
    
    console.log('\n=== CREATING INDEXES ===');
    await createIndexes(db);
    
    console.log('\n=== INSERTING SAMPLE DATA ===');
    await insertSampleData(db);
    
    console.log('\n=== DEMONSTRATING INDEX USAGE ===');
    await demonstrateIndexUsage(db);
    
    console.log('\n=== INDEX STATISTICS ===');
    await showIndexStats(db);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

async function createIndexes(db) {
  const users = db.collection('users');
  const lists = db.collection('lists');
  
  // === USERS COLLECTION INDEXES ===
  
  // 1. Single field index on email (unique)
  await users.createIndex({ email: 1 }, { unique: true });
  console.log('✓ Created unique index on users.email');
  
  // 2. Single field index on name
  await users.createIndex({ name: 1 });
  console.log('✓ Created index on users.name');
  
  // 3. Compound index on name and created date
  await users.createIndex({ name: 1, created: -1 });
  console.log('✓ Created compound index on users.name + created');
  
  // 4. Text index for full-text search
  await users.createIndex({ name: 'text', bio: 'text' });
  console.log('✓ Created text index on users.name + bio');
  
  // === LISTS COLLECTION INDEXES ===
  
  // 1. Foreign key index (most important for relationships!)
  await lists.createIndex({ userId: 1 });
  console.log('✓ Created index on lists.userId (foreign key)');
  
  // 2. Compound index on userId and name
  await lists.createIndex({ userId: 1, name: 1 });
  console.log('✓ Created compound index on lists.userId + name');
  
  // 3. Index on list name for searching
  await lists.createIndex({ name: 1 });
  console.log('✓ Created index on lists.name');
  
  // 4. Compound index on userId and created date (for sorting user's lists)
  await lists.createIndex({ userId: 1, created: -1 });
  console.log('✓ Created compound index on lists.userId + created');
  
  // 5. Multikey index on items array
  await lists.createIndex({ items: 1 });
  console.log('✓ Created multikey index on lists.items array');
  
  // 6. Text index for searching list content
  await lists.createIndex({ name: 'text', items: 'text' });
  console.log('✓ Created text index on lists.name + items');
  
  // 7. TTL index for automatic cleanup (optional)
  await lists.createIndex({ created: 1 }, { expireAfterSeconds: 86400 * 30 }); // 30 days
  console.log('✓ Created TTL index on lists.created (30 days expiry)');
}

async function insertSampleData(db) {
  const users = db.collection('users');
  const lists = db.collection('lists');
  
  // Insert users
  const usersData = [
    { name: 'Alice Johnson', email: 'alice@example.com', bio: 'Software engineer', created: new Date() },
    { name: 'Bob Smith', email: 'bob@example.com', bio: 'Product manager', created: new Date() },
    { name: 'Charlie Brown', email: 'charlie@example.com', bio: 'Designer and artist', created: new Date() },
    { name: 'Diana Prince', email: 'diana@example.com', bio: 'Data scientist', created: new Date() },
    { name: 'Eve Wilson', email: 'eve@example.com', bio: 'Marketing specialist', created: new Date() }
  ];
  
  const userResults = await users.insertMany(usersData);
  const userIds = Object.values(userResults.insertedIds);
  console.log(`Inserted ${userIds.length} users`);
  
  // Insert lists with relationships
  const listsData = [];
  userIds.forEach((userId, index) => {
    listsData.push(
      {
        name: `Shopping List ${index + 1}`,
        userId: userId,
        items: ['Milk', 'Eggs', 'Bread', 'Cheese'],
        created: new Date(Date.now() - Math.random() * 86400000) // Random date within last day
      },
      {
        name: `Todo List ${index + 1}`,
        userId: userId,
        items: ['Learn MongoDB', 'Build app', 'Deploy to production'],
        created: new Date(Date.now() - Math.random() * 86400000)
      },
      {
        name: `Work Tasks ${index + 1}`,
        userId: userId,
        items: ['Review code', 'Update documentation', 'Fix bugs'],
        created: new Date(Date.now() - Math.random() * 86400000)
      }
    );
  });
  
  await lists.insertMany(listsData);
  console.log(`Inserted ${listsData.length} lists`);
}

async function demonstrateIndexUsage(db) {
  const users = db.collection('users');
  const lists = db.collection('lists');
  
  // 1. Fast lookup by email (unique index)
  console.log('\n1. Finding user by email (using unique index):');
  const user = await users.findOne({ email: 'alice@example.com' });
  console.log(`Found: ${user.name}`);
  
  // 2. Fast lookup of user's lists (using foreign key index)
  console.log('\n2. Finding all lists for a user (using userId index):');
  const userLists = await lists.find({ userId: user._id }).toArray();
  console.log(`User has ${userLists.length} lists`);
  
  // 3. Fast sorted query (using compound index)
  console.log('\n3. Finding user\'s lists sorted by creation date (using compound index):');
  const sortedLists = await lists
    .find({ userId: user._id })
    .sort({ created: -1 })
    .toArray();
  console.log(`Latest list: "${sortedLists[0].name}"`);
  
  // 4. Text search (using text index)
  console.log('\n4. Full-text search across lists (using text index):');
  const searchResults = await lists
    .find({ $text: { $search: 'MongoDB app' } })
    .toArray();
  console.log(`Found ${searchResults.length} lists containing "MongoDB app"`);
  
  // 5. Array element search (using multikey index)
  console.log('\n5. Finding lists containing specific items (using multikey index):');
  const milkLists = await lists.find({ items: 'Milk' }).toArray();
  console.log(`Found ${milkLists.length} lists containing "Milk"`);
  
  // 6. Compound query optimization
  console.log('\n6. Finding user\'s shopping lists (using compound index):');
  const shoppingLists = await lists
    .find({ 
      userId: user._id, 
      name: { $regex: /shopping/i } 
    })
    .toArray();
  console.log(`Found ${shoppingLists.length} shopping lists for user`);
  
  // 7. Aggregation with index usage
  console.log('\n7. Aggregation: Count lists per user (using indexes):');
  const listCounts = await lists.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { userName: '$user.name', listCount: '$count' } }
  ]).toArray();
  
  listCounts.forEach(item => {
    console.log(`  ${item.userName}: ${item.listCount} lists`);
  });
}

async function showIndexStats(db) {
  const users = db.collection('users');
  const lists = db.collection('lists');
  
  console.log('\n=== USERS COLLECTION INDEXES ===');
  const userIndexes = await users.indexes();
  userIndexes.forEach(index => {
    console.log(`${index.name}: ${JSON.stringify(index.key)}`);
  });
  
  console.log('\n=== LISTS COLLECTION INDEXES ===');
  const listIndexes = await lists.indexes();
  listIndexes.forEach(index => {
    console.log(`${index.name}: ${JSON.stringify(index.key)}`);
  });
  
  // Show index usage statistics (requires MongoDB 4.4+)
  try {
    console.log('\n=== INDEX USAGE STATS ===');
    const stats = await db.runCommand({ collStats: 'lists', indexDetails: true });
    console.log('Collection stats available - check MongoDB Compass for detailed index usage');
  } catch (error) {
    console.log('Index usage stats require MongoDB 4.4+ and appropriate permissions');
  }
}

// Function to explain query performance (useful for development)
async function explainQuery(db) {
  const lists = db.collection('lists');
  const users = db.collection('users');
  
  // Get a user ID for testing
  const user = await users.findOne();
  
  console.log('\n=== QUERY EXPLANATION ===');
  
  // Explain a query that uses index
  const explanation = await lists
    .find({ userId: user._id })
    .explain('executionStats');
    
  console.log('Query execution stats:');
  console.log(`- Execution time: ${explanation.executionStats.executionTimeMillis}ms`);
  console.log(`- Documents examined: ${explanation.executionStats.totalDocsExamined}`);
  console.log(`- Documents returned: ${explanation.executionStats.totalDocsReturned}`);
  console.log(`- Index used: ${explanation.executionStats.winningPlan.inputStage?.indexName || 'No index'}`);
}

// Run the demonstration
demonstrateIndexes();