import { randomUUID } from 'node:crypto';
import { getDatabase } from './db.js';
import { authRoute,currentUser,updateAvatar,accountSecurity } from './auth.js';
import { matchRoute } from './matches.js';
import { activityRoute } from './activities.js';
import { checkOrigin,fail,rateLimit,rateKey } from './security.js';
const methods = {
 'auth/me':'GET','auth/signup':'POST','auth/login':'POST','auth/logout':'POST',
 'profile/password':'POST','profile/sessions':'POST','profile/avatar':'POST','match/list':'GET','match/view':'GET','activity/list':'GET','activity/view':'GET',
};
async function body(req) {
  if (req.method==='GET') return {};
  if (req.body !== undefined) {
    if (Buffer.byteLength(typeof req.body==='string'?req.body:JSON.stringify(req.body))>16384) fail(413,'Request is too large.');
    return typeof req.body==='string'?JSON.parse(req.body):req.body;
  }
  let chunks=[],size=0;
  for await (const chunk of req) { size+=chunk.length; if(size>16384) fail(413,'Request is too large.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { fail(400,'Invalid JSON request.'); }
}
export function createHandler({ database, origin=process.env.APP_ORIGIN, secret=process.env.RATE_LIMIT_SECRET,
  secure=process.env.NODE_ENV==='production' || Boolean(process.env.VERCEL), logger=console }={}) {
  return async (req,res) => {
    const requestId=randomUUID();
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('X-Request-Id',requestId);
    try {
      if (!origin || !secret || secret.length<32) fail(503,'Online service is not configured.');
      const url=new URL(req.url,origin), route=url.searchParams.get('route');
      if (typeof route!=='string' || !/^(auth|profile|match|activity)\/[a-z]+$/.test(route)) fail(404,'Endpoint not found.');
      if (req.method!==(methods[route]??'POST')) fail(405,'Method not allowed.');
      checkOrigin(req,origin);
      const db=database??getDatabase(), ip=rateKey(req,secret);
      // Shared DB limits survive function cold starts. Polling is capped per authenticated account below.
      if (route.startsWith('auth/')) {
        const value=await authRoute(db,route.split('/')[1],await body(req),req,res,secure,ip);
        res.statusCode=200;res.end(JSON.stringify({data:value}));return;
      }
      const user=await currentUser(db,req,secure);if(!user) fail(401,'Sign in to use online features.');
      await rateLimit(db,`api:${user.id}`,240,60);
      const data=req.method==='GET'?Object.fromEntries(url.searchParams):await body(req);
      if (!data || typeof data!=='object' || Array.isArray(data)) fail(400,'Invalid request.');
      let value;
      if (route==='profile/password' || route==='profile/sessions') {
        await rateLimit(db,`security:${user.id}`,10,900);
        value=await accountSecurity(db,user,data,route.split('/')[1]);
      }
      else if (route==='profile/avatar') value=await updateAvatar(db,user,data.avatar);
      else if (route.startsWith('match/')) {
        if(route==='match/create')await rateLimit(db,`create:${user.id}`,20,3600);
        value=await matchRoute(db,user,route.split('/')[1],data);
      }
      else if (route.startsWith('activity/')) value=await activityRoute(db,user,data.kind,route.split('/')[1],data);
      else fail(404,'Endpoint not found.');
      res.statusCode=200;res.end(JSON.stringify({data:value}));
    } catch(error) {
      const status=Number.isInteger(error.status)?error.status:400;
      // Only intentional client errors expose messages. Never log credentials, cookies or DB URLs.
      const publicStatus=error.status?status:error.code||!(error instanceof Error)?500:400;
      if(publicStatus>=500) logger.error({requestId,code:error.code??'INTERNAL'});
      res.statusCode=publicStatus;
      res.end(JSON.stringify({error:publicStatus>=500?'Online service is temporarily unavailable.':error.message,requestId}));
    }
  };
}
