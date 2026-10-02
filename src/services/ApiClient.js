export async function api(route,data={},method='POST') {
  const url=new URL('/api/index',window.location.origin);url.searchParams.set('route',route);
  if(method==='GET') Object.entries(data).forEach(([key,value])=>url.searchParams.set(key,String(value)));
  let response;
  try { response=await fetch(url,{method,credentials:'same-origin',cache:'no-store',headers:method==='GET'?{}:{'Content-Type':'application/json'},body:method==='GET'?undefined:JSON.stringify(data),signal:AbortSignal.timeout(20000)}); }
  catch { throw new Error('Could not reach the online service. Check your connection and retry.'); }
  let result;
  try { result=await response.json(); } catch { throw new Error('The online service returned an invalid response.'); }
  if(!response.ok) { const error=new Error(result.error??'Request failed.');error.status=response.status;throw error; }
  return result.data;
}
