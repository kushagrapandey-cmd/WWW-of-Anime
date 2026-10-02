import { api } from './ApiClient.js';
export const OnlineActivityService = {
  history:kind=>api('activity/list',{kind},'GET'),
  start:(kind,settings)=>api('activity/start',{kind,settings}),
  latest:(kind,state)=>api('activity/view',{kind,id:state.id},'GET'),
  act:(kind,state,action,input)=>api(`activity/${action}`,{kind,id:state.id,revision:state.revision,input}),
};
