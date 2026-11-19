import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
import mongoose from 'mongoose';

async function probe() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });

  console.log('Connected to host:', conn.connection.host);
  const admin = conn.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Databases in cluster:', dbs.databases.map(d => `${d.name} (${d.sizeOnDisk} bytes)`));

  // Check collections in dishasetu_db and dishaSetu_db
  for (const dbName of ['dishasetu_db', 'dishaSetu_db']) {
    const db = conn.connection.client.db(dbName);
    const cols = await db.listCollections().toArray();
    console.log(`Collections in ${dbName}:`, cols.map(c => c.name));
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count} documents`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

probe().catch(err => {
  console.error('Probe failed:', err);
  process.exit(1);
});
