import { coinState } from '../services/CoinsService';
import { COIN_CONFIG } from '../config/coins';
import Card from './Card';
import Button from './Button';
export default function CoinHistory({ user }) {
  const state = coinState(user);
  return <Card className="profile-section"><h2>YOUR COINS</h2><p><strong>{state.balance} coins</strong> · {state.streak} win streak</p><p>Earn {COIN_CONFIG.win} coins per arena win. From win {COIN_CONFIG.bonusAfter + 1}, earn an extra {COIN_CONFIG.bonusStep} per consecutive win, up to +{COIN_CONFIG.bonusCap}.</p><Button disabled>Redeem (Coming Soon)</Button><p className="profile-empty">Showcase coins only. No cash value or redemption is available. Merch plans may change.</p><h3>COIN HISTORY</h3>{state.ledger.length ? <ul className="coin-history">{[...state.ledger].reverse().map(item => <li key={item.id}><strong>+{item.amount} coins</strong><span>{item.reason === 'loss-streak-reset' ? 'Loss · streak reset' : item.reason === 'win-streak-bonus' ? 'Win + streak bonus' : 'Arena win'}</span><time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time><small>Match: {item.matchId}</small></li>)}</ul> : <p>No coins yet. Win an arena match to start earning.</p>}</Card>;
}
