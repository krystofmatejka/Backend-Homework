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