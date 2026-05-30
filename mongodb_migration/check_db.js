const { MongoClient } = require('mongodb');

async function check() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('shoe_store');
    
    console.log('--- ADMIN USER ---');
    const admin = await db.collection('users').findOne({ email: 'admin@admin.com' });
    console.log(JSON.stringify(admin, null, 2));
    
    console.log('--- ROLES ---');
    const roles = await db.collection('roles').find().toArray();
    console.log(JSON.stringify(roles, null, 2));
  } finally {
    await client.close();
  }
}

check();
