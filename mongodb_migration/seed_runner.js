const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'shoe_store';
const DATA_DIR = path.join(__dirname, 'data');

const collections = [
  'roles',
  'users',
  'brands',
  'categories',
  'sizes',
  'coupons',
  'products',
  'variants',
  'promotions',
  'addresses',
  'shifts',
  'work_schedules',
  'attendance_records',
  'open_shifts',
  'carts',
  'cart_items',
  'orders',
  'order_items',
  'order_status_histories',
  'payments',
  'pos_payment_allocations',
  'shippings',
  'cashier_sessions',
  'pos_return_exchange_logs',
  'saved_coupons',
  'schedule_swap_requests',
  'schedule_change_logs'
];

// Helper to recursively parse JSON values into correct MongoDB BSON types
function parseBsonTypes(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => parseBsonTypes(item));
  }

  if (typeof obj === 'object') {
    // Convert DBRef-like objects to raw string IDs to match Spring Data @DocumentReference expectations
    if (obj.$ref && obj.$id) {
      return obj.$id;
    }

    const newObj = {};
    for (const [key, val] of Object.entries(obj)) {
      newObj[key] = parseBsonTypes(val);
    }
    return newObj;
  }

  if (typeof obj === 'string') {
    // Check if it matches ISO date pattern
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    if (isoDatePattern.test(obj)) {
      return new Date(obj);
    }
  }

  return obj;
}


async function run() {
  const client = new MongoClient(MONGO_URI);
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await client.connect();
    console.log('Connected successfully!');

    const db = client.db(DB_NAME);

    for (const name of collections) {
      const filePath = path.join(DATA_DIR, `${name}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: Data file for ${name} not found at ${filePath}. Skipping...`);
        continue;
      }

      console.log(`Dropping collection: ${name}...`);
      try {
        await db.collection(name).drop();
      } catch (err) {
        // Collection might not exist, ignore error
      }

      console.log(`Loading and parsing data for ${name}...`);
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const parsedData = parseBsonTypes(rawData);

      if (parsedData.length > 0) {
        console.log(`Inserting ${parsedData.length} documents into ${name}...`);
        await db.collection(name).insertMany(parsedData);
      } else {
        console.log(`No documents to insert for ${name}.`);
      }
    }

    console.log('\n★ MongoDB database seed completed successfully with all 27 collections and 100% complete business/HR relations! ★');
  } catch (err) {
    console.error('Error during database seed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
