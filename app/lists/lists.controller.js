import express from 'express';
import { ObjectId } from 'mongodb';
import { validateList, validateItem, validateListUpdate, validateItemUpdate } from '../utils/validation.js';
import { getDb } from '../lib/database.js';
import { getListById, getLists } from './lists.service.js';

const oneOf = (values, defaultValue, testedValue) => values.includes(testedValue) ? testedValue : defaultValue;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const router = express.Router();

// Get shopping list
router.get('/:listId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;

  const list = await getListById(listId, userId);

  res.json({
    message: 'Get shopping list',
    data: list
  });
});

// Get shopping lists
router.get('/', async (req, res) => {
  const userId = req.account.id;
  const filter = oneOf(['mine', 'shared', 'all'], 'all', req.query.filter);
  const cursor = req.query.cursor;
  const limit = clamp(parseInt(req.query.limit ?? '10'), 1, 10);

  const result = await getLists(filter, cursor, limit, userId);

  res.json({
    message: 'Get shopping lists',
    data: result.lists,
    pagination: result.pagination,
  });
});

// Create shopping list
router.post('/', async (req, res) => {
  const { title } = req.body;

  // Validate input
  const validation = validateList({ title });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  const userId = req.account.id;
  console.log('Authenticated user ID:', userId);

  const mongodb = getDb();
  const result = await mongodb.collection('shopping_lists').insertOne({
    title,
    owner_id: new ObjectId(userId),
    member_ids: [],
    items: [],
    created_at: now,
    updated_at: now,
    archived_at: null
  });

  const lists = await mongodb.collection('shopping_lists').aggregate([
    { $match: { _id: result.insertedId } },
    {
      $lookup: {
        from: 'users',
        localField: 'owner_id',
        foreignField: '_id',
        as: 'owner_info'
      }
    },
    { $unwind: '$owner_info' },
  ]).toArray();

  const createdList = lists[0];

  res.status(201).json({
    message: 'Create shopping list',
    data: createdList
  });
});

// Edit shopping list
router.patch('/:listId', async (req, res) => {
  const { title, member_ids } = req.body;

  // Validate input
  const validation = validateListUpdate({ title, member_ids });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  const userId = req.account.id;
  const mongodb = getDb();

  const toUpdate = {};
  if (title !== undefined) {
    toUpdate.title = title;
  }
  if (member_ids !== undefined) {
    toUpdate.member_ids = member_ids.map(id => new ObjectId(id));
  }
  toUpdate.updated_at = now;

  const result = await mongodb.collection('shopping_lists').updateOne(
    { _id: new ObjectId(req.params.listId), owner_id: new ObjectId(userId) },
    {
      $set: toUpdate
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found or you are not the owner'
    });
  }

  console.log('Update result:', result);

  const lists = await mongodb.collection('shopping_lists').aggregate([
    { $match: { _id: new ObjectId(req.params.listId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'owner_id',
        foreignField: '_id',
        as: 'owner_info'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'member_ids',
        foreignField: '_id',
        as: 'member_info'
      }
    },
    { $unwind: '$owner_info' },
  ]).toArray();

  res.json({
    message: 'Edit shopping list',
    listId: req.params.listId,
    data: lists[0]
  });
});

// Leave shopping list
router.patch('/:listId/leave', async (req, res) => {
  const userId = req.account.id;
  const mongodb = getDb();

  const now = new Date();
  const listId = req.params.listId;

  const list = await mongodb.collection('shopping_lists').findOne({ _id: new ObjectId(listId), member_ids: new ObjectId(userId) });

  if (!list) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found or you are not a member'
    });
  }

  await mongodb.collection('shopping_lists').updateOne(
    { _id: new ObjectId(listId) },
    { $pull: { member_ids: new ObjectId(userId) }, $set: { updated_at: now } }
  );

  const lists = await mongodb.collection('shopping_lists').aggregate([
    { $match: { _id: new ObjectId(req.params.listId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'owner_id',
        foreignField: '_id',
        as: 'owner_info'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'member_ids',
        foreignField: '_id',
        as: 'member_info'
      }
    },
    { $unwind: '$owner_info' },
  ]).toArray();

  res.json({
    message: 'Leave shopping list',
    listId: req.params.listId,
    data: lists[0]
  });
});

// Archive shopping list
router.patch('/:listId/archive', async (req, res) => {
  const userId = req.account.id;
  const mongodb = getDb();

  const now = new Date();

  const updatedResult = await mongodb.collection('shopping_lists').updateOne(
    { _id: new ObjectId(req.params.listId), owner_id: new ObjectId(userId), archived_at: null },
    { $set: { archived_at: now, updated_at: now } }
  )

  if (updatedResult.matchedCount === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found, already archived, or you are not the owner'
    });
  }

  const list = await mongodb.collection('shopping_lists').findOne({ _id: new ObjectId(req.params.listId) });

  res.json({
    message: 'Archive shopping list',
    listId: req.params.listId,
    data: list
  });
});

// Remove shopping list
router.delete('/:listId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const mongodb = getDb();

  const result = await mongodb.collection('shopping_lists').deleteOne({
    _id: new ObjectId(listId), owner_id: new ObjectId(userId)
  });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found or you are not the owner'
    });
  }

  res.status(200).json({
    message: 'Remove shopping list',
    data: {
      success: true,
      deletedId: req.params.listId
    }
  });
});

// Add item
router.post('/:listId/item', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const { name, quantity } = req.body;

  // Validate input
  const validation = validateItem({ name, quantity: quantity || 1 });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  const mongodb = getDb();
  const updatedList = await mongodb.collection('shopping_lists').findOneAndUpdate(
    { _id: new ObjectId(listId), $or: [{ owner_id: new ObjectId(userId) }, { member_ids: new ObjectId(userId) }] },
    {
      $push: {
        items: {
          _id: new ObjectId(),
          name,
          quantity: quantity ?? 1,
          purchased_at: null,
          created_by_user_id: new ObjectId(userId),
          created_at: now,
          updated_at: now
        }
      }
    },
    { returnDocument: 'after' }
  );

  if (!updatedList) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found or you do not have permission to add items'
    });
  }

  res.status(201).json({
    message: 'Add item',
    listId: req.params.listId,
    data: updatedList
  });
});

// Edit item
router.patch('/:listId/item/:itemId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const itemId = req.params.itemId;
  const { name, quantity, purchased } = req.body;

  // Validate input
  const validation = validateItemUpdate({ name, quantity, purchased });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();

  const mongodb = getDb();
  const updatedList = await mongodb.collection('shopping_lists').findOneAndUpdate(
    {
        _id: new ObjectId(listId),
        $or: [{ owner_id: new ObjectId(userId) }, { member_ids: new ObjectId(userId) }],
        'items._id': new ObjectId(itemId) },
    {
      $set: {
        'items.$.name': name,
        'items.$.quantity': quantity,
        'items.$.purchased_at': purchased ? now : null,
        'items.$.updated_at': now
      }
    },
    { returnDocument: 'after' }
  );

  if (!updatedList) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found or you do not have permission to edit items'
    });
  }

  res.json({
    message: 'Edit item',
    listId: req.params.listId,
    itemId: req.params.itemId,
    data: updatedList
  });
});

// Remove item
router.delete('/:listId/item/:itemId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const itemId = req.params.itemId;

  const mongodb = getDb();
  const result = await mongodb.collection('shopping_lists').findOneAndUpdate(
    { _id: new ObjectId(listId), $or: [{ owner_id: new ObjectId(userId) }, { member_ids: new ObjectId(userId) }] },
    { $pull: { items: { _id: new ObjectId(itemId) } } },
    { returnDocument: 'after' }
  )

  if (!result) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Shopping list not found or you do not have permission to remove items'
    });
  }

  res.status(200).json({
    message: 'Remove item',
    listId: req.params.listId,
    itemId: req.params.itemId,
    data: result
  });
});

export default router;
