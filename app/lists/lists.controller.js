import express from 'express';
import { getListById, getLists, createList, updateList, leaveList, archiveList, deleteList, addItem, updateItem, removeItem } from './lists.service.js';
import { parseListParams, parseItemParams, parseItemUpdateParams } from './lists.validation.js';

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
  const userId = req.account.id;
  const { title } = parseListParams()
    .parseTitle(req.body.title)
    .run();

  const createdListId = await createList(title, userId);

  res.status(201).json({
    message: 'Create shopping list',
    data: createdListId
  });
});

// Edit shopping list
router.patch('/:listId', async (req, res) => {
  const userId = req.account.id;
  const { title, member_ids } = parseListParams()
    .parseTitleOptional(req.body.title)
    .parseMemberIdsOptional(req.body.member_ids)
    .run();

  const updatedList = await updateList(req.params.listId, userId, title, member_ids);

  res.json({
    message: 'Edit shopping list',
    data: updatedList
  });
});

// Leave shopping list
router.patch('/:listId/leave', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;

  const updatedList = await leaveList(listId, userId);

  res.json({
    message: 'Leave shopping list',
    listId: req.params.listId,
    data: updatedList
  });
});

// Archive shopping list
router.patch('/:listId/archive', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;

  const archivedList = await archiveList(listId, userId);

  res.json({
    message: 'Archive shopping list',
    listId: req.params.listId,
    data: archivedList
  });
});

// Remove shopping list
router.delete('/:listId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;

  const result = await deleteList(listId, userId);

  res.status(200).json({
    message: 'Remove shopping list',
    data: result
  });
});

// Add item
router.post('/:listId/item', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const { name, quantity } = parseItemParams()
    .parseName(req.body.name)
    .parseQuantity(req.body.quantity)
    .run();

  const updatedList = await addItem(listId, userId, name, quantity);

  res.status(201).json({
    message: 'Add item',
    data: updatedList
  });
});

// Edit item
router.patch('/:listId/item/:itemId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const itemId = req.params.itemId;
  const { name, quantity, purchased } = parseItemUpdateParams()
    .parseName(req.body.name)
    .parseQuantity(req.body.quantity)
    .parsePurchased(req.body.purchased)
    .run();

  const updatedList = await updateItem(listId, itemId, userId, name, quantity, purchased);

  res.json({
    message: 'Edit item',
    data: updatedList
  });
});

// Remove item
router.delete('/:listId/item/:itemId', async (req, res) => {
  const userId = req.account.id;
  const listId = req.params.listId;
  const itemId = req.params.itemId;

  const updatedList = await removeItem(listId, itemId, userId);

  res.status(200).json({
    message: 'Remove item',
    data: updatedList
  });
});

export default router;
