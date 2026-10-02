import { useEffect,useRef,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/ApiClient';
import { animeConfig } from '../data/anime';
import Button from '../components/Button';
import ArenaDraft from '../components/battle/ArenaDraft';
import ArenaLineup from '../components/battle/ArenaLineup';
import ArenaResults from '../components/battle/ArenaResults';
import './BattleArena.css';
const retryableDraftActions = new Set(['draw','reroll','keep','lock']);
function ownDraftKey(value) {
  if (!value) return '';
  return JSON.stringify([value.stage,value.team?.map(card=>[card.id,card.formId??null])??[],value.rerolls,value.kept,value.locked]);
}
export default function OnlineBattle() {
  const {user,refresh}=useAuth(), [params,setParams]=useSearchParams();
  const id=params.get('match'),invite=params.get('invite');
  const [match,setMatch]=useState(null),[history,setHistory]=useState([]),[order,setOrder]=useState([]);
  const [mode,setMode]=useState('friend'),[anime,setAnime]=useState('all'),[variants,setVariants]=useState(false);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[link,setLink]=useState('');
  const current=useRef(null),working=useRef(false),generation=useRef(0),refreshRef=useRef(refresh);
  refreshRef.current=refresh;
  function accept(next) {
    if(current.current?.id===next.id && current.current.revision>next.revision)return;
    if(next.invite){const url=new URL('/battle',location.origin);url.searchParams.set('invite',next.invite);setLink(url.href);}
    current.current=next;setMatch(next);
  }
  useEffect(()=>{setOrder(match?.team??[]);},[match?.id,match?.kept]);
  useEffect(()=>{
    const version=++generation.current;
    if(current.current?.id!==id){current.current=null;setMatch(null);setLink('');}
    setError('');
    async function load(){
      try {
        if(invite){const next=await api('match/join',{invite});if(version===generation.current){accept(next);setParams({match:next.id},{replace:true});}}
        else if(id){const next=await api('match/view',{id},'GET');if(version===generation.current)accept(next);}
        else {const records=await api('match/list',{},'GET');if(version===generation.current)setHistory(records);}
      }catch(reason){if(version===generation.current)setError(reason.message);}
    }
    load();return()=>{generation.current++;};
  },[id,invite,user.id]);
  useEffect(()=>{
    if(!id||match?.stage==='complete')return;
    let stopped=false,timer;
    async function poll(){
      if(!document.hidden&&!working.current){
        try{const next=await api('match/view',{id},'GET');if(!stopped){accept(next);setError('');if(next.stage==='complete')await refreshRef.current();}}
        catch(reason){if(!stopped){if(reason.status===410){current.current=null;setMatch(null);}setError(reason.message);}}
      }
      if(!stopped)timer=setTimeout(poll,4000);
    }
    timer=setTimeout(poll,4000);return()=>{stopped=true;clearTimeout(timer);};
  },[id,match?.stage]);
  async function action(name,extra={}){
    if(working.current)return;working.current=true;setBusy(true);setError('');
    const version=generation.current;
    try{
      let base=current.current;
      for(let attempt=0;attempt<2;attempt++){
        try{
          const next=await api(`match/${name}`,{id:base?.id,revision:base?.revision,...extra});
          if(version===generation.current){accept(next);if(name==='create')setParams({match:next.id});if(next.stage==='complete')await refresh();}
          return;
        }catch(reason){
          if(reason.status!==409||!base?.id||name==='create')throw reason;
          const latest=await api('match/view',{id:base.id},'GET');
          if(version!==generation.current)return;
          const retry=attempt===0&&latest.stage==='draft'&&retryableDraftActions.has(name)&&ownDraftKey(base)===ownDraftKey(latest);
          accept(latest);
          if(!retry){
            if(latest.stage==='complete')await refresh();
            else setError('The match changed in another tab or device. Latest state loaded; your action was not repeated.');
            return;
          }
          base=latest;
        }
      }
    }catch(reason){
      if(version===generation.current){if(reason.status===410){current.current=null;setMatch(null);}setError(reason.message);}
    }finally{working.current=false;setBusy(false);}
  }
  return <div className="container arena-page"><header className="arena-heading"><span className="eyebrow">SERVER-VERIFIED ARENA</span><h1>BATTLE <span>ONLINE.</span></h1><p>Separate accounts. Private teams. Shared showdown.</p></header>
    {error&&<p role="alert" className="account-error">{error}</p>}
    {!id&&!invite&&<><section className="arena-panel"><h2>CHOOSE YOUR RIVAL.</h2><form onSubmit={event=>{event.preventDefault();action('create',{mode,anime,variants});}}>
      <label>Opponent<select value={mode} onChange={e=>setMode(e.target.value)}><option value="friend">Online friend</option><option value="cpu">CPU</option></select></label>
      <label>World<select value={anime} onChange={e=>setAnime(e.target.value)}><option value="all">All worlds</option>{animeConfig.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="arena-choice"><input type="checkbox" checked={variants} onChange={e=>setVariants(e.target.checked)}/>Include form variants</label>
      <Button disabled={busy} type="submit">{busy?'Creating match…':'Create match'}</Button></form><p className="arena-note">Invite your friend to open the link on their device and sign in with their own account. Invites and unfinished matches expire after 24 hours.</p></section>
      <section className="arena-panel arena-history"><h2>YOUR ONLINE MATCHES</h2>{!history.length&&<p>No matches yet.</p>}<ul>{history.map(item=><li key={item.id}><span>{item.names.join(' vs ')} · {item.stage}</span><Button disabled={item.stage==='expired'} onClick={()=>setParams({match:item.id})}>{item.stage==='expired'?'Expired':'Open'}</Button></li>)}</ul></section></>}
    {(id||invite)&&!match&&!error&&<p role="status">Loading match…</p>}
    {match?.stage==='waiting'&&<section className="arena-panel"><h2>WAITING FOR YOUR RIVAL.</h2><p>Player 2 must use a separate account. Opening this link yourself cannot join your own match.</p>
      {link?<label>Private invite link<input readOnly value={link} onFocus={e=>e.target.select()}/></label>:<Button disabled={busy} onClick={()=>action('invite')}>Create fresh invite link</Button>}
      <p className="arena-note">Creating a fresh link invalidates the previous link. Keep the invite private.</p></section>}
    {match?.stage==='draft'&&<><p role="status">Your rival has {match.opponent.count}/5 fighters · {match.opponent.locked?'Lineup locked':'Lineup hidden'}</p>
      <fieldset className="online-controls" disabled={busy} aria-busy={busy}>
      {!match.kept&&<ArenaDraft name={user.username} player={0} draft={{teams:[match.team,[]],rerolls:[match.rerolls,0]}} onDraw={()=>action('draw')} onReroll={()=>action('reroll')} onLock={()=>action('keep')}/>}
      {match.kept&&!match.locked&&<ArenaLineup name={user.username} team={order.length?order:match.team} onChange={setOrder} onLock={()=>action('lock',{order:(order.length?order:match.team).map(card=>card.id)})}/>}
      {match.locked&&<section className="arena-panel"><h2>YOUR LINEUP IS LOCKED.</h2><p>Waiting for your rival. The result appears automatically when both players lock.</p></section>}</fieldset></>}
    {match?.stage==='complete'&&<ArenaResults record={match.record} outcome={match.outcome} replay={false} saveState={{busy:false,error:''}} onRematch={()=>action('create',{...match.options,mode:match.mode})} onNew={()=>setParams({})}/>}
    {id&&<Button variant="secondary" onClick={()=>setParams({})}>Back to match list</Button>}
    <p className="arena-note arena-footer">Online results and profiles are stored in the database. Match updates refresh every four seconds while this tab is visible.</p>
  </div>;
}
