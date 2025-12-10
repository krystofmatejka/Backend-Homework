import { ObjectId } from 'mongodb';
import { getDb } from '../lib/database.js';
import { NotFound } from '../lib/errors.js';

export async function getListById(listId, userId) {
  const mongodb = getDb();
  const list = await mongodb.collection('shopping_lists').findOne({
    _id: new ObjectId(listId),
    $or: [
      { owner_id: new ObjectId(userId) },
      { member_ids: new ObjectId(userId) },
    ]
  });

  if (!list) {
    throw new NotFound(`Shopping List ID ${listId} not found or access denied.`);
  }

  return list;
}

export async function getLists(filter, cursor, limit, userId) {
  const mongodb = getDb();

  let filters = {}
  if (filter === 'mine') {
    filters = { owner_id: new ObjectId(userId) };
  } else if (filter === 'shared') {
    filters = { member_ids: new ObjectId(userId), owner_id: { $ne: new ObjectId(userId) } };
  } else if (filter === 'all') {
    filters = { $or: [{ owner_id: new ObjectId(userId) }, { member_ids: new ObjectId(userId) }] };
  }

  if (cursor) {
    filters._id = { $lt: new ObjectId(cursor) };
  }

  const lists = await mongodb.collection('shopping_lists')
    .find(filters)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .toArray();
  
  const hasNextPage = lists.length > limit;
  if (hasNextPage) {
    lists.pop();
  }

  const nextCursor = hasNextPage ? lists[lists.length - 1]._id.toString() : null;
  return {
    lists,
    pagination: {
      hasNextPage,
      nextCursor
    }
  };
}

export async function createList(title, ownerId) {
  const mongodb = getDb();
  const now = new Date();

  const newList = {
    title,
    owner_id: new ObjectId(ownerId),
    member_ids: [],
    items: [],
    created_at: now,
    updated_at: now,
    archived_at: null
  };

  const result = await mongodb.collection('shopping_lists').insertOne(newList);

  return {
    _id: result.insertedId,
    ...newList,
  };
}

export async function updateList(listId, ownerId, title, member_ids) {
  const mongodb = getDb();
  const now = new Date();

    const toUpdate = {};
  if (title !== undefined) {
    toUpdate.title = title;
  }
  if (member_ids !== undefined) {
    toUpdate.member_ids = member_ids.map(id => new ObjectId(id));
  }
  toUpdate.updated_at = now;

  const result = await mongodb.collection('shopping_lists').updateOne(
    { _id: new ObjectId(listId), owner_id: new ObjectId(ownerId) },
    { $set: toUpdate }
  );

  if (result.matchedCount === 0) {
    throw new NotFound(`Shopping List ID ${listId} not found or you are not the owner.`);
  }

  return await mongodb.collection('shopping_lists').findOne({ _id: new ObjectId(listId) });
}