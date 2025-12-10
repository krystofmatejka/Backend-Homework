import { ObjectId } from 'mongodb';
import { getDb } from '../lib/database.js';
import { NotFoundException } from '../lib/exceptions.js';

export async function getUserById(userId) {
  const mongodb = getDb();
  const user = await mongodb.collection('users').findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throw new NotFoundException(`User with ID ${userId} not found`);
  }

  return user;
}

export async function getUsers(cursor, limit) {
  const mongodb = getDb();

  const query = cursor ? { _id: { $lt: new ObjectId(cursor) } } : {};

  const users = await mongodb.collection('users').find(query).sort({ _id: -1 }).limit(limit + 1).toArray();

  const hasNextPage = users.length > limit;
  if (hasNextPage) {
    users.pop();
  }

  const nextCursor = hasNextPage ? users[users.length - 1]._id.toString() : null;

  return {
    users,
    pagination: {
      hasNextPage,
      nextCursor
    }
  }
}

export async function createUser(name, email) {
  const mongodb = getDb();
  const now = new Date();
  const newUser = {
    name,
    email,
    is_active: true,
    created_at: now,
    updated_at: now
  }

  const result = await mongodb.collection('users').insertOne(newUser);

  return {
    _id: result.insertedId,
    ...newUser,
  };
}