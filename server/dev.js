import { createServer } from 'node:http';
import { createHandler } from './handler.js';
const port=Number(process.env.API_PORT??3001);
createServer(createHandler()).listen(port,'127.0.0.1',()=>console.log(`Online API listening on http://127.0.0.1:${port}`));
