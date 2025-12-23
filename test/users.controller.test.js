import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Override the database name to use test database BEFORE importing modules
const originalDbName = process.env.MONGO_INITDB_DATABASE;
process.env.MONGO_INITDB_DATABASE = `${originalDbName}_test`;

// Now import modules that use the database
const express = (await import('express')).default;
const { default: usersController } = await import('../app/users/users.controller.js');
const { errorHandlerMiddleware } = await import('../app/middleware/error-handler.middleware.js');
const { getDb, getClient } = await import('../app/lib/database.js');

// Test server setup
const TEST_PORT = 3001;
let app;
let server;
let mongodb;

const BASE_URL = `http://localhost:${TEST_PORT}`;

// Setup test server
before(async () => {
  console.log('Setting up test environment...');
  
  // Get the already connected database instance
  mongodb = getDb();
  
  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api/v1/users', usersController);
  app.use(errorHandlerMiddleware);
  
  // Start server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, resolve);
  });
  
  console.log(`Test server started on port ${TEST_PORT}`);
});

// Cleanup after all tests
after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('Test server closed');
  }
  
  // Close MongoDB connection
  const client = getClient();
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  
  console.log('Test cleanup complete');
});

// Clean database before each test
beforeEach(async () => {
  await mongodb.collection('users').deleteMany({});
});

describe('Users Controller', () => {
  describe('POST /api/v1/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com'
      };

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      assert.strictEqual(response.status, 201);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Create user');
      assert.strictEqual(result.data.name, userData.name);
      assert.strictEqual(result.data.email, userData.email);
      assert.ok(result.data._id);
      assert.ok(result.data.created_at);
      assert.strictEqual(result.data.is_active, true);

      // Verify in database
      const dbUser = await mongodb.collection('users')
        .findOne({ _id: new ObjectId(result.data._id) });
      assert.ok(dbUser);
      assert.strictEqual(dbUser.email, userData.email);
    });

    it('should return 400 when name is missing', async () => {
      const userData = {
        email: 'john.doe@example.com'
      };

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Bad Request');
      assert.ok(Array.isArray(result.errors));
      assert.ok(result.errors.some(e => e.includes('Name')));
    });

    it('should return 400 when email is missing', async () => {
      const userData = {
        name: 'John Doe'
      };

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Bad Request');
      assert.ok(result.errors.some(e => e.includes('Email')));
    });

    it('should return 400 when email is invalid', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.ok(result.errors.some(e => e.includes('valid email')));
    });

    it('should return 400 when name is empty string', async () => {
      const userData = {
        name: '   ',
        email: 'john.doe@example.com'
      };

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.ok(result.errors.some(e => e.includes('Name')));
    });

    it('should return 400 when both name and email are invalid', async () => {
      const userData = {
        name: '',
        email: 'invalid'
      };

      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.strictEqual(result.errors.length, 2);
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    it('should get a user by id', async () => {
      // Setup: Insert test user
      const testUser = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      const insertResult = await mongodb.collection('users').insertOne(testUser);
      const userId = insertResult.insertedId.toString();

      // Test
      const response = await fetch(`${BASE_URL}/api/v1/users/${userId}`);

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Get user');
      assert.strictEqual(result.data._id.toString(), userId);
      assert.strictEqual(result.data.name, testUser.name);
      assert.strictEqual(result.data.email, testUser.email);
    });

    it('should return 400 when user not found', async () => {
      const nonExistentId = new ObjectId().toString();

      const response = await fetch(`${BASE_URL}/api/v1/users/${nonExistentId}`);

      assert.strictEqual(response.status, 400);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Entity Not Found');
    });

    it('should return error for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await fetch(`${BASE_URL}/api/v1/users/${invalidId}`);

      // This will throw an error from MongoDB, caught by error handler
      assert.strictEqual(response.status, 500);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get users with default pagination', async () => {
      // Setup: Insert test users
      const users = Array.from({ length: 5 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await mongodb.collection('users').insertMany(users);

      // Test
      const response = await fetch(`${BASE_URL}/api/v1/users`);

      assert.strictEqual(response.status, 200);
      
      const result = await response.json();
      assert.strictEqual(result.message, 'Get users');
      assert.ok(Array.isArray(result.data));
      assert.strictEqual(result.data.length, 5);
      assert.ok(result.pagination);
      assert.strictEqual(result.pagination.hasNextPage, false);
      assert.strictEqual(result.pagination.nextCursor, null);
    });

    it('should paginate users with limit', async () => {
      // Setup: Insert 15 test users
      const users = Array.from({ length: 15 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await mongodb.collection('users').insertMany(users);

      // Test: Get first page
      const response1 = await fetch(`${BASE_URL}/api/v1/users?limit=5`);
      const result1 = await response1.json();

      assert.strictEqual(result1.data.length, 5);
      assert.strictEqual(result1.pagination.hasNextPage, true);
      assert.ok(result1.pagination.nextCursor);

      // Test: Get second page
      const response2 = await fetch(
        `${BASE_URL}/api/v1/users?limit=5&cursor=${result1.pagination.nextCursor}`
      );
      const result2 = await response2.json();

      assert.strictEqual(result2.data.length, 5);
      assert.strictEqual(result2.pagination.hasNextPage, true);
      
      // Verify no duplicate users
      const firstPageIds = result1.data.map(u => u._id.toString());
      const secondPageIds = result2.data.map(u => u._id.toString());
      const intersection = firstPageIds.filter(id => secondPageIds.includes(id));
      assert.strictEqual(intersection.length, 0);
    });

    it('should clamp limit to maximum of 10', async () => {
      // Setup: Insert 20 users
      const users = Array.from({ length: 20 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await mongodb.collection('users').insertMany(users);

      // Test with limit > 10
      const response = await fetch(`${BASE_URL}/api/v1/users?limit=100`);
      const result = await response.json();

      assert.strictEqual(result.data.length, 10);
      assert.strictEqual(result.pagination.hasNextPage, true);
    });

    it('should clamp limit to minimum of 1', async () => {
      // Setup: Insert users
      const users = Array.from({ length: 5 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await mongodb.collection('users').insertMany(users);

      // Test with limit < 1
      const response = await fetch(`${BASE_URL}/api/v1/users?limit=0`);
      const result = await response.json();

      assert.strictEqual(result.data.length, 1);
    });

    it('should return empty array when no users exist', async () => {
      const response = await fetch(`${BASE_URL}/api/v1/users`);
      const result = await response.json();

      assert.strictEqual(result.data.length, 0);
      assert.strictEqual(result.pagination.hasNextPage, false);
    });

    it('should handle cursor pagination correctly through all pages', async () => {
      // Setup: Insert 12 users
      const users = Array.from({ length: 12 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await mongodb.collection('users').insertMany(users);

      // Page 1
      const response1 = await fetch(`${BASE_URL}/api/v1/users?limit=5`);
      const result1 = await response1.json();
      assert.strictEqual(result1.data.length, 5);
      assert.strictEqual(result1.pagination.hasNextPage, true);

      // Page 2
      const response2 = await fetch(
        `${BASE_URL}/api/v1/users?limit=5&cursor=${result1.pagination.nextCursor}`
      );
      const result2 = await response2.json();
      assert.strictEqual(result2.data.length, 5);
      assert.strictEqual(result2.pagination.hasNextPage, true);

      // Page 3 (last page with 2 items)
      const response3 = await fetch(
        `${BASE_URL}/api/v1/users?limit=5&cursor=${result2.pagination.nextCursor}`
      );
      const result3 = await response3.json();
      assert.strictEqual(result3.data.length, 2);
      assert.strictEqual(result3.pagination.hasNextPage, false);
      assert.strictEqual(result3.pagination.nextCursor, null);
    });

    it('should use default limit of 10 when limit not specified', async () => {
      // Setup: Insert 15 users
      const users = Array.from({ length: 15 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }));
      await mongodb.collection('users').insertMany(users);

      const response = await fetch(`${BASE_URL}/api/v1/users`);
      const result = await response.json();

      assert.strictEqual(result.data.length, 10);
      assert.strictEqual(result.pagination.hasNextPage, true);
    });
  });
});
