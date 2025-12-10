import { ObjectId } from "mongodb";
import { getDb } from "../lib/database.js";

export async function listsSeed() {
  const mongodb = getDb();

  await mongodb.collection('shopping_lists').drop();

  const now = new Date();

  const listsToInsert = [
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d01'),
      title: 'Weekly Groceries',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c02'),
        new ObjectId('674e1a2b3c4d5e6f7a8b9c03')
      ],
      items: [
        { id: new ObjectId(), name: 'Milk', completed: false },
        { id: new ObjectId(), name: 'Bread', completed: true },
        { id: new ObjectId(), name: 'Eggs', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d02'),
      title: 'Party Supplies',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c02'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
        new ObjectId('674e1a2b3c4d5e6f7a8b9c05')
      ],
      items: [
        { id: new ObjectId(), name: 'Balloons', completed: false },
        { id: new ObjectId(), name: 'Cake', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d03'),
      title: 'Office Supplies',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c03'),
      member_ids: [],
      items: [
        { id: new ObjectId(), name: 'Pens', completed: true },
        { id: new ObjectId(), name: 'Notebooks', completed: false },
        { id: new ObjectId(), name: 'Stapler', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d04'),
      title: 'Home Renovation',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c04'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c03')
      ],
      items: [
        { id: new ObjectId(), name: 'Paint', completed: false },
        { id: new ObjectId(), name: 'Brushes', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d05'),
      title: 'Camping Trip',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c05'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
        new ObjectId('674e1a2b3c4d5e6f7a8b9c02'),
        new ObjectId('674e1a2b3c4d5e6f7a8b9c03')
      ],
      items: [
        { id: new ObjectId(), name: 'Tent', completed: true },
        { id: new ObjectId(), name: 'Sleeping bags', completed: false },
        { id: new ObjectId(), name: 'Flashlight', completed: false },
        { id: new ObjectId(), name: 'First aid kit', completed: true }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d06'),
      title: 'Birthday Gift Ideas',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
      member_ids: [],
      items: [
        { id: new ObjectId(), name: 'Book', completed: false },
        { id: new ObjectId(), name: 'Gift card', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d07'),
      title: 'Garden Tools',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c02'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c04')
      ],
      items: [
        { id: new ObjectId(), name: 'Shovel', completed: true },
        { id: new ObjectId(), name: 'Seeds', completed: false },
        { id: new ObjectId(), name: 'Watering can', completed: true }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d08'),
      title: 'Winter Clothes',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c03'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c05')
      ],
      items: [
        { id: new ObjectId(), name: 'Jacket', completed: false },
        { id: new ObjectId(), name: 'Gloves', completed: false },
        { id: new ObjectId(), name: 'Scarf', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d09'),
      title: 'Pet Supplies',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c04'),
      member_ids: [],
      items: [
        { id: new ObjectId(), name: 'Dog food', completed: true },
        { id: new ObjectId(), name: 'Cat litter', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d10'),
      title: 'Holiday Dinner',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c05'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
        new ObjectId('674e1a2b3c4d5e6f7a8b9c02')
      ],
      items: [
        { id: new ObjectId(), name: 'Turkey', completed: false },
        { id: new ObjectId(), name: 'Potatoes', completed: false },
        { id: new ObjectId(), name: 'Wine', completed: true },
        { id: new ObjectId(), name: 'Dessert', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    }
  ];

  await mongodb.collection('shopping_lists').insertMany(listsToInsert);

  const lists = await mongodb.collection('shopping_lists').countDocuments();
  console.log("Number of shopping lists in DB:", lists);
}
