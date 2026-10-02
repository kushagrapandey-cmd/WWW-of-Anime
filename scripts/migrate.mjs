import { readFileSync } from 'node:fs';
import { getDatabase } from '../server/db.js';
const db=getDatabase();
try { await db.transaction(client=>client.query(readFileSync(new URL('../server/schema.sql',import.meta.url),'utf8')));console.log('Database schema is ready.'); }
finally { await db.close(); }
