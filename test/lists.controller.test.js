import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Override the database name to use test database BEFORE importing modules
const originalDbName = process.env.MONGO_INITDB_DATABASE;
process.env.MONGO_INITDB_DATABASE = `${originalDbName}_test`;

// Import app and database modules
const { app } = await import('../server.js');
const { getDb, getClient } = await import('../app/lib/database.js');

// Test server setup
const TEST_PORT = 3002;
let server;
let mongodb;

const BASE_URL = `http://localhost:${TEST_PORT}`;

// Test API keys from auth.middleware.js
const TEST_API_KEY_1 = 'key-ghi789'; // User ID: 674e1a2b3c4d5e6f7a8b9c03
const TEST_API_KEY_2 = 'key-jkl012'; // User ID: 674e1a2b3c4d5e6f7a8b9c04
const TEST_USER_ID_1 = '674e1a2b3c4d5e6f7a8b9c03';
const TEST_USER_ID_2 = '674e1a2b3c4d5e6f7a8b9c04';

// Setup test server
before(async () => {
  console.log('Setting up lists test environment...');
  
  // Get the already connected database instance
  mongodb = getDb();
  
  // Start server with imported app
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });
  
  console.log(`Lists test server started on port ${TEST_PORT}`);
});

// Cleanup after all tests
after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('Lists test server closed');
  }
  
  // Close MongoDB connection
  const client = getClient();
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  
  console.log('Lists test cleanup complete');
});

// Clean database before each test
beforeEach(async () => {
  await mongodb.collection('shopping_lists').deleteMany({});
});

describe('Lists Controller', () => {
  describe('POST /api/v1/lists', () => {
    it('should create a new shopping list with valid data', async () => {
      const listData = {
        title: 'Grocery Shopping'
      };

      const response = await fetch(`${BASE_URL}/api/v1/lists`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify(listData)
      });

      assert.strictEqual(response.status, 201);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Create shopping list');
      assert.strictEqual(result.data.title, listData.title);
      assert.ok(result.data._id);
      assert.ok(result.data.created_at);
      assert.strictEqual(result.data.archived_at, null);
      assert.strictEqual(result.data.owner_id.toString(), TEST_USER_ID_1);
    });

    it('should return 400 when title is missing', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/lists`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({})
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Bad Request');
      assert.ok(result.errors.some(e => e.includes('Title')));
    });

    it('should return 400 when title is empty string', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/lists`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ title: '   ' })
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.ok(result.errors.some(e => e.includes('Title')));
    });

    it('should return 401 without API key', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' })
      });

      assert.strictEqual(response.status, 401);
    });
  });

  describe('GET /api/v1/lists/:listId', () => {
    it('should get a list by id when user is owner', async () => {
      // Setup: Insert test list
      const testList = {
        title: 'My List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      // Test
      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Get shopping list');
      assert.strictEqual(result.data._id.toString(), listId);
      assert.strictEqual(result.data.title, testList.title);
    });

    it('should get a list by id when user is member', async () => {
      // Setup: Insert test list with user 2 as member
      const testList = {
        title: 'Shared List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [new ObjectId(TEST_USER_ID_2)],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      // Test with user 2
      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        headers: { 'x-api-key': TEST_API_KEY_2 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.data._id.toString(), listId);
    });

    it('should return 400 when list not found or access denied', async () => {
      const nonExistentId = new ObjectId().toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${nonExistentId}`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Entity Not Found');
    });

    it('should not access archived lists', async () => {
      // Setup: Insert archived list
      const testList = {
        title: 'Archived List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: new Date()
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('GET /api/v1/lists', () => {
    it('should get all lists for user (owned + member)', async () => {
      // Setup: Insert test lists
      const lists = [
        {
          title: 'My Own List',
          owner_id: new ObjectId(TEST_USER_ID_1),
          member_ids: [],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        },
        {
          title: 'Shared with me',
          owner_id: new ObjectId(TEST_USER_ID_2),
          member_ids: [new ObjectId(TEST_USER_ID_1)],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        }
      ];
      await mongodb.collection('shopping_lists').insertMany(lists);

      const response = await fetch(`${BASE_URL}/api/v1/lists`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Get shopping lists');
      assert.strictEqual(result.data.length, 2);
      assert.ok(result.pagination);
    });

    it('should filter lists by "mine" - only owned lists', async () => {
      // Setup
      await mongodb.collection('shopping_lists').insertMany([
        {
          title: 'My List',
          owner_id: new ObjectId(TEST_USER_ID_1),
          member_ids: [],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        },
        {
          title: 'Shared List',
          owner_id: new ObjectId(TEST_USER_ID_2),
          member_ids: [new ObjectId(TEST_USER_ID_1)],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        }
      ]);

      const response = await fetch(`${BASE_URL}/api/v1/lists?filter=mine`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      const result = await response.json();
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.data[0].title, 'My List');
    });

    it('should filter lists by "shared" - only member lists', async () => {
      // Setup
      await mongodb.collection('shopping_lists').insertMany([
        {
          title: 'My List',
          owner_id: new ObjectId(TEST_USER_ID_1),
          member_ids: [],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        },
        {
          title: 'Shared List',
          owner_id: new ObjectId(TEST_USER_ID_2),
          member_ids: [new ObjectId(TEST_USER_ID_1)],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        }
      ]);

      const response = await fetch(`${BASE_URL}/api/v1/lists?filter=shared`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      const result = await response.json();
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.data[0].title, 'Shared List');
    });

    it('should not return archived lists', async () => {
      await mongodb.collection('shopping_lists').insertMany([
        {
          title: 'Active List',
          owner_id: new ObjectId(TEST_USER_ID_1),
          member_ids: [],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: null
        },
        {
          title: 'Archived List',
          owner_id: new ObjectId(TEST_USER_ID_1),
          member_ids: [],
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
          archived_at: new Date()
        }
      ]);

      const response = await fetch(`${BASE_URL}/api/v1/lists`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      const result = await response.json();
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.data[0].title, 'Active List');
    });

    it('should paginate lists with limit', async () => {
      // Setup: Insert 15 test lists
      const lists = Array.from({ length: 15 }, (_, i) => ({
        title: `List ${i}`,
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      }));
      await mongodb.collection('shopping_lists').insertMany(lists);

      // First page
      const response1 = await fetch(`${BASE_URL}/api/v1/lists?limit=5`, {
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });
      const result1 = await response1.json();

      assert.strictEqual(result1.data.length, 5);
      assert.strictEqual(result1.pagination.hasNextPage, true);
      assert.ok(result1.pagination.nextCursor);

      // Second page
      const response2 = await fetch(
        `${BASE_URL}/api/v1/lists?limit=5&cursor=${result1.pagination.nextCursor}`,
        { headers: { 'x-api-key': TEST_API_KEY_1 } }
      );
      const result2 = await response2.json();

      assert.strictEqual(result2.data.length, 5);
      assert.strictEqual(result2.pagination.hasNextPage, true);
    });
  });

  describe('PATCH /api/v1/lists/:listId', () => {
    it('should update list title as owner', async () => {
      // Setup
      const testList = {
        title: 'Original Title',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ title: 'Updated Title' })
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.data.title, 'Updated Title');
    });

    it('should update member_ids as owner', async () => {
      // Setup
      const testList = {
        title: 'Test List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ member_ids: [TEST_USER_ID_2] })
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.data.member_ids.length, 1);
      assert.strictEqual(result.data.member_ids[0].toString(), TEST_USER_ID_2);
    });

    it('should return 400 when non-owner tries to update', async () => {
      // Setup
      const testList = {
        title: 'Owner List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      // Try to update with different user
      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_2
        },
        body: JSON.stringify({ title: 'Hacked Title' })
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('PATCH /api/v1/lists/:listId/leave', () => {
    it('should allow member to leave list', async () => {
      // Setup
      const testList = {
        title: 'Shared List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [new ObjectId(TEST_USER_ID_2)],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/leave`, {
        method: 'PATCH',
        headers: { 'x-api-key': TEST_API_KEY_2 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.data.member_ids.length, 0);
    });

    it('should return 400 when user is not a member', async () => {
      // Setup
      const testList = {
        title: 'Private List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/leave`, {
        method: 'PATCH',
        headers: { 'x-api-key': TEST_API_KEY_2 }
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('PATCH /api/v1/lists/:listId/archive', () => {
    it('should archive list as owner', async () => {
      // Setup
      const testList = {
        title: 'To Archive',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/archive`, {
        method: 'PATCH',
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.ok(result.data.archived_at);
    });

    it('should return 400 when non-owner tries to archive', async () => {
      // Setup
      const testList = {
        title: 'Protected List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/archive`, {
        method: 'PATCH',
        headers: { 'x-api-key': TEST_API_KEY_2 }
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('DELETE /api/v1/lists/:listId', () => {
    it('should delete list as owner', async () => {
      // Setup
      const testList = {
        title: 'To Delete',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.data.success, true);
      assert.strictEqual(result.data.deletedId, listId);

      // Verify deletion
      const deleted = await mongodb.collection('shopping_lists')
        .findOne({ _id: new ObjectId(listId) });
      assert.strictEqual(deleted, null);
    });

    it('should return 400 when non-owner tries to delete', async () => {
      // Setup
      const testList = {
        title: 'Protected List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY_2 }
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('POST /api/v1/lists/:listId/item', () => {
    it('should add item to list as owner', async () => {
      // Setup
      const testList = {
        title: 'Shopping List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ name: 'Milk', quantity: 2 })
      });

      assert.strictEqual(response.status, 201);
      
      const result = await response.json();
      assert.strictEqual(result.data.items.length, 1);
      assert.strictEqual(result.data.items[0].name, 'Milk');
      assert.strictEqual(result.data.items[0].quantity, 2);
    });

    it('should add item to list as member', async () => {
      // Setup
      const testList = {
        title: 'Shared List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [new ObjectId(TEST_USER_ID_2)],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_2
        },
        body: JSON.stringify({ name: 'Bread', quantity: 1 })
      });

      assert.strictEqual(response.status, 201);
      
      const result = await response.json();
      assert.strictEqual(result.data.items.length, 1);
    });

    it('should use default quantity of 1 when not provided', async () => {
      // Setup
      const testList = {
        title: 'Shopping List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ name: 'Eggs' })
      });

      assert.strictEqual(response.status, 201);
      
      const result = await response.json();
      assert.strictEqual(result.data.items[0].quantity, 1);
    });

    it('should return 400 when name is missing', async () => {
      // Setup
      const testList = {
        title: 'Shopping List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ quantity: 5 })
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.ok(result.errors.some(e => e.includes('Name')));
    });
  });

  describe('PATCH /api/v1/lists/:listId/item/:itemId', () => {
    it('should update item in list', async () => {
      // Setup
      const itemId = new ObjectId();
      const testList = {
        title: 'Shopping List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [{
          _id: itemId,
          name: 'Milk',
          quantity: 1,
          purchased_at: null,
          created_by_user_id: new ObjectId(TEST_USER_ID_1),
          created_at: new Date(),
          updated_at: new Date()
        }],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item/${itemId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ name: 'Whole Milk', quantity: 2, purchased: true })
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      const updatedItem = result.data.items[0];
      assert.strictEqual(updatedItem.name, 'Whole Milk');
      assert.strictEqual(updatedItem.quantity, 2);
      assert.ok(updatedItem.purchased_at);
    });

    it('should mark item as purchased', async () => {
      // Setup
      const itemId = new ObjectId();
      const testList = {
        title: 'Shopping List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [{
          _id: itemId,
          name: 'Bread',
          quantity: 1,
          purchased_at: null,
          created_by_user_id: new ObjectId(TEST_USER_ID_1),
          created_at: new Date(),
          updated_at: new Date()
        }],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item/${itemId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': TEST_API_KEY_1
        },
        body: JSON.stringify({ name: 'Bread', quantity: 1, purchased: true })
      });

      const result = await response.json();
      assert.ok(result.data.items[0].purchased_at);
    });
  });

  describe('DELETE /api/v1/lists/:listId/item/:itemId', () => {
    it('should remove item from list', async () => {
      // Setup
      const itemId = new ObjectId();
      const testList = {
        title: 'Shopping List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [],
        items: [{
          _id: itemId,
          name: 'Old Item',
          quantity: 1,
          purchased_at: null,
          created_by_user_id: new ObjectId(TEST_USER_ID_1),
          created_at: new Date(),
          updated_at: new Date()
        }],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY_1 }
      });

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.data.items.length, 0);
    });

    it('should allow member to remove items', async () => {
      // Setup
      const itemId = new ObjectId();
      const testList = {
        title: 'Shared List',
        owner_id: new ObjectId(TEST_USER_ID_1),
        member_ids: [new ObjectId(TEST_USER_ID_2)],
        items: [{
          _id: itemId,
          name: 'Item',
          quantity: 1,
          purchased_at: null,
          created_by_user_id: new ObjectId(TEST_USER_ID_1),
          created_at: new Date(),
          updated_at: new Date()
        }],
        created_at: new Date(),
        updated_at: new Date(),
        archived_at: null
      };
      const insertResult = await mongodb.collection('shopping_lists').insertOne(testList);
      const listId = insertResult.insertedId.toString();

      const response = await fetch(`${BASE_URL}/api/v1/lists/${listId}/item/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-api-key': TEST_API_KEY_2 }
      });

      assert.strictEqual(response.status, 200);
    });
  });
});
