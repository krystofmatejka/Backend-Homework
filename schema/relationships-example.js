const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB relationship example - Users has many Lists
async function demonstrateRelationships() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    
    const db = client.db(process.env.MONGO_INITDB_DATABASE);
    
    // Clear existing data for clean demo
    await db.collection('users').deleteMany({});
    await db.collection('lists').deleteMany({});
    
    console.log('\n=== APPROACH 1: EMBEDDED DOCUMENTS ===');
    await demonstrateEmbeddedApproach(db);
    
    console.log('\n=== APPROACH 2: REFERENCED DOCUMENTS ===');
    await demonstrateReferencedApproach(db);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Approach 1: Embed lists directly in user documents
async function demonstrateEmbeddedApproach(db) {
  const users = db.collection('users_embedded');
  
  // Create user with embedded lists
  const user = {
    name: 'Big Boi',
    email: 'bigboi@example.com',
    created: new Date(),
    lists: [  // Lists are embedded in the user document
      {
        _id: new ObjectId(),
        name: 'My Shopping List',
        items: ['Milk', 'Eggs', 'Bread'],
        created: new Date()
      },
      {
        _id: new ObjectId(),
        name: 'My Todo List',
        items: ['Learn MongoDB', 'Build app', 'Deploy'],
        created: new Date()
      }
    ]
  };
  
  const result = await users.insertOne(user);
  console.log('Created user with embedded lists:', result.insertedId);
  
  // Find user with all their lists
  const userWithLists = await users.findOne({ _id: result.insertedId });
  console.log(`User "${userWithLists.name}" has ${userWithLists.lists.length} lists`);
  
  // Add a new list to existing user
  await users.updateOne(
    { _id: result.insertedId },
    { 
      $push: { 
        lists: {
          _id: new ObjectId(),
          name: 'My Work List',
          items: ['Finish project', 'Review code'],
          created: new Date()
        }
      }
    }
  );
  console.log('Added new list to user');
  
  // Find users with specific list criteria
  const usersWithShoppingLists = await users.find({
    'lists.name': { $regex: /shopping/i }
  }).toArray();
  console.log('Users with shopping lists:', usersWithShoppingLists.length);
}

// Approach 2: Separate collections with references
async function demonstrateReferencedApproach(db) {
  const users = db.collection('users');
  const lists = db.collection('lists');
  
  // Create user
  const user = {
    name: 'Big Boi',
    email: 'bigboi@example.com',
    created: new Date()
  };
  
  const userResult = await users.insertOne(user);
  const userId = userResult.insertedId;
  console.log('Created user:', userId);
  
  // Create lists that reference the user
  const userLists = [
    {
      name: 'My Shopping List',
      userId: userId,  // Reference to user
      items: ['Milk', 'Eggs', 'Bread'],
      created: new Date()
    },
    {
      name: 'My Todo List', 
      userId: userId,  // Reference to user
      items: ['Learn MongoDB', 'Build app', 'Deploy'],
      created: new Date()
    },
    {
      name: 'My Work List',
      userId: userId,  // Reference to user
      items: ['Finish project', 'Review code'],
      created: new Date()
    }
  ];
  
  const listsResult = await lists.insertMany(userLists);
  console.log('Created lists:', Object.keys(listsResult.insertedIds).length);
  
  // Find user and their lists (requires two queries or aggregation)
  const userData = await users.findOne({ _id: userId });
  const userListsData = await lists.find({ userId: userId }).toArray();
  
  console.log(`User "${userData.name}" has ${userListsData.length} lists`);
  userListsData.forEach(list => {
    console.log(`  - ${list.name} (${list.items.length} items)`);
  });
  
  // Alternative: Use aggregation to join data in one query
  const userWithListsAggregation = await users.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: 'lists',
        localField: '_id',
        foreignField: 'userId',
        as: 'lists'
      }
    }
  ]).toArray();
  
  console.log('User with lists (via aggregation):');
  const userWithLists = userWithListsAggregation[0];
  console.log(`  ${userWithLists.name} has ${userWithLists.lists.length} lists`);
  
  // Add a new list to existing user
  await lists.insertOne({
    name: 'My Hobby List',
    userId: userId,
    items: ['Photography', 'Cooking', 'Reading'],
    created: new Date()
  });
  console.log('Added new list to user');
  
  // Find all lists for a user
  const allUserLists = await lists.find({ userId: userId }).toArray();
  console.log(`User now has ${allUserLists.length} lists total`);
}

demonstrateRelationships();