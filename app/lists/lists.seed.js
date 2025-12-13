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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e01'), name: 'Milk', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e02'), name: 'Bread', completed: true },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e03'), name: 'Eggs', completed: false }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e04'), name: 'Balloons', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e05'), name: 'Cake', completed: false }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e06'), name: 'Pens', completed: true },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e07'), name: 'Notebooks', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e08'), name: 'Stapler', completed: false }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e09'), name: 'Paint', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e10'), name: 'Brushes', completed: false }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e11'), name: 'Tent', completed: true },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e12'), name: 'Sleeping bags', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e13'), name: 'Flashlight', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e14'), name: 'First aid kit', completed: true }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e15'), name: 'Book', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e16'), name: 'Gift card', completed: false }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e17'), name: 'Shovel', completed: true },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e18'), name: 'Seeds', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e19'), name: 'Watering can', completed: true }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e20'), name: 'Jacket', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e21'), name: 'Gloves', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e22'), name: 'Scarf', completed: false }
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
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e23'), name: 'Dog food', completed: true },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e24'), name: 'Cat litter', completed: false }
      ],
      created_at: now,
      updated_at: now,
      archived_at: null
    },
    {
      _id: new ObjectId('674e1a2b3c4d5e6f7a8b9d10'),
      title: 'Holiday Dinner',
      owner_id: new ObjectId('674e1a2b3c4d5e6f7a8b9c01'),
      member_ids: [
        new ObjectId('674e1a2b3c4d5e6f7a8b9c05'),
        new ObjectId('674e1a2b3c4d5e6f7a8b9c02')
      ],
      items: [
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e25'), name: 'Turkey', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e26'), name: 'Potatoes', completed: false },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e27'), name: 'Wine', completed: true },
        { id: new ObjectId('674e1a2b3c4d5e6f7a8b9e28'), name: 'Dessert', completed: false }
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
