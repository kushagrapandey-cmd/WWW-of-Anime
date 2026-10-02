// Isolated disposable PostgreSQL for browser tests; never used in a deployment.
import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createHandler } from '../../server/handler.js';
const db=new PGlite();await db.exec(readFileSync(new URL('../../server/schema.sql',import.meta.url),'utf8'));
const handler=createHandler({database:db,origin:'http://127.0.0.1:4173',secret:'browser-test-secret'.repeat(3),secure:false});
const server=createServer((req,res)=>{if(req.url==='/health'){res.end('ready');return;}return handler(req,res);});
server.listen(3001,'127.0.0.1');
process.on('SIGTERM',()=>server.close(async()=>{await db.close();process.exit(0);}));
