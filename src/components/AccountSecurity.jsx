import { useState } from 'react';
import { api } from '../services/ApiClient';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
export default function AccountSecurity(){
  const {refresh}=useAuth(),[currentPassword,setCurrent]=useState(''),[newPassword,setNew]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function run(action){
    setBusy(true);setError('');
    try{await api(`profile/${action}`,{currentPassword,newPassword});setCurrent('');setNew('');await refresh();}
    catch(reason){setError(reason.message);}finally{setBusy(false);}
  }
  return <section className="card profile-section"><h2>ACCOUNT SECURITY</h2><form onSubmit={event=>{event.preventDefault();run('password');}}>
    <label>Current password<input type="password" autoComplete="current-password" maxLength={128} required value={currentPassword} onChange={e=>setCurrent(e.target.value)} disabled={busy}/></label>
    <label>New password<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={newPassword} onChange={e=>setNew(e.target.value)} disabled={busy}/></label>
    <Button type="submit" disabled={busy}>Change password</Button></form>
    <p>Changing your password signs out every device. You’ll need to sign in again.</p>
    <Button variant="secondary" disabled={busy} onClick={()=>run('sessions')}>Sign out all devices</Button>
    {error&&<p role="alert" className="account-error">{error}</p>}
  </section>;
}
