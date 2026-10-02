import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
let database;
export function getDatabase() {
  if (database) return database;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw Object.assign(new Error('Online service is not configured.'), { status: 503 });
  // Use the provider's pooled URL with sslmode=verify-full; never disable certificate verification.
  const pool = new pg.Pool({ connectionString, max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
  if (process.env.VERCEL) attachDatabasePool(pool);
  database = { query: (sql, values) => pool.query(sql, values), transaction: async fn => {
    const client = await pool.connect();
    try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }, close: () => pool.end() };
  return database;
}
