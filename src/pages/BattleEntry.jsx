import { useEffect, useRef, useState } from 'react';
import { Swords } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { characters, characterForms } from '../data';
import { GAME } from '../game/config';
import { buildPool } from '../game/pool';
import { createDraft, drawCard, draftCpu } from '../game/draft';
import { simulateBattle, replayBattle } from '../game/engine';
import BattleService from '../services/BattleService';
import Button from '../components/Button';
import ArenaSetup from '../components/battle/ArenaSetup';
import ArenaDraft from '../components/battle/ArenaDraft';
import ArenaLineup from '../components/battle/ArenaLineup';
import ArenaRounds from '../components/battle/ArenaRounds';
import ArenaResults from '../components/battle/ArenaResults';
import './BattleArena.css';
const newSeed = () => crypto.randomUUID();
export default function BattleEntry() {
  const { user, updateStats } = useAuth();
  const [phase, setPhase] = useState('setup'), [player, setPlayer] = useState(0);
  const [setup, setSetup] = useState(null), [draft, setDraft] = useState(null);
  const [record, setRecord] = useState(null), [outcome, setOutcome] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0), [replay, setReplay] = useState(false);
  const [history, setHistory] = useState([]), [historyError, setHistoryError] = useState('');
  const [error, setError] = useState(''), [saveState, setSaveState] = useState({ busy: false, error: '' });
  const nextPhase = useRef(''), busySave = useRef(false), account = useRef(user?.id);
  function refreshHistory() {
    try { setHistory(BattleService.history(user?.id ?? null)); setHistoryError(''); }
    catch (reason) { setHistoryError(reason.message); }
  }
  useEffect(() => {
    if (account.current !== user?.id) {
      account.current = user?.id; setPhase('setup'); setRecord(null); setDraft(null); setError(''); setSaveState({ busy: false, error: '' });
    }
    refreshHistory();
    // Only account identity changes reset an in-progress match, not a stats update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  function attempt(action) { try { setError(''); action(); } catch (reason) { setError(reason.message); } }
  function start(options) {
    attempt(() => {
      const pool = buildPool(characters, characterForms, options);
      if (new Set(pool.map(card => card.id)).size < GAME.teamSize * 2 + GAME.rerolls * 2) throw new Error('This pool needs at least twelve identities.');
      setSetup({ ...options, pool, ownerId: user?.id ?? null, opponentPoints: options.mode === 'cpu' ? GAME.cpuRating : (user?.battleStats.rankPoints ?? 0) });
      setDraft(createDraft(newSeed())); setPlayer(0); setRecord(null); setReplay(false); setPhase('draft'); setSaveState({ busy: false, error: '' });
    });
  }
  function pass(toPlayer, destination) { setPlayer(toPlayer); nextPhase.current = destination; setPhase('pass'); }
  function keepTeam() {
    attempt(() => {
      if (setup.mode === 'cpu') { setDraft(draftCpu(draft, setup.pool)); setPlayer(0); setPhase('lineup'); }
      else if (player === 0) pass(1, 'draft');
      else pass(0, 'lineup');
    });
  }
  function beginBattle(teams, settings = setup) {
    const next = { id: `battle-${newSeed()}`, version: GAME.version, createdAt: new Date().toISOString(),
      ownerId: settings.ownerId, names: settings.names, mode: settings.mode,
      pool: { anime: settings.anime, variants: settings.variants }, opponentPoints: settings.opponentPoints,
      seed: newSeed(), teams: structuredClone(teams), saved: false, rank: null };
    setOutcome(simulateBattle(next.teams, next.seed)); setRecord(next); setRoundIndex(0); setReplay(false); setPhase('rounds'); setSaveState({ busy: false, error: '' });
  }
  function lockLineup() {
    attempt(() => {
      if (setup.mode === 'friend' && player === 0) pass(1, 'lineup');
      else if (setup.mode === 'friend') pass(0, 'battle');
      else beginBattle(draft.teams);
    });
  }
  async function save(next = record) {
    if (busySave.current) return;
    busySave.current = true; setSaveState({ busy: true, error: '' });
    try {
      const saved = await BattleService.save(next, updateStats);
      if (account.current === (next.ownerId ?? undefined)) {
        setRecord(saved); setSaveState({ busy: false, error: '' }); refreshHistory();
      }
    } catch (reason) { setSaveState({ busy: false, error: reason.message }); }
    finally { busySave.current = false; }
  }
  function advanceRound() {
    if (roundIndex < GAME.teamSize - 1) setRoundIndex(roundIndex + 1);
    else { setPhase('results'); if (!replay) save(); }
  }
  function openReplay(saved) {
    attempt(() => {
      setOutcome(replayBattle(saved)); setRecord(saved); setRoundIndex(0); setReplay(Boolean(saved.saved));
      setSaveState({ busy: false, error: '' });
      if (saved.saved) setPhase('rounds');
      else { setPhase('results'); save(saved); }
    });
  }
  function rematch() {
    attempt(() => beginBattle(record.teams, { ...record.pool, names: record.names, mode: record.mode,
      ownerId: user?.id ?? null, opponentPoints: record.mode === 'cpu' ? GAME.cpuRating : (user?.battleStats.rankPoints ?? 0) }));
  }
  const stage = ['draft', 'lineup', 'rounds', 'results'].includes(phase) ? phase : phase === 'pass' ? nextPhase.current : 'setup';
  return <div className="container arena-page"><header className="arena-heading"><span className="eyebrow"><Swords size={18} /> THE MAIN EVENT</span><h1>BATTLE <span>ARENA.</span></h1><p>Five fighters. Hidden lineups. Your next rivalry.</p></header><ol className="arena-stages" aria-label="Battle stages">{['setup', 'draft', 'lineup', 'rounds', 'results'].map(item => <li key={item} aria-current={stage === item ? 'step' : undefined}>{item}</li>)}</ol>
    {error && <p role="alert" className="account-error">{error}</p>}
    {phase === 'setup' && <ArenaSetup user={user} onStart={start} history={history} historyError={historyError} onReplay={openReplay} />}
    {phase === 'pass' && <section className="arena-panel pass-device"><Swords size={52} /><span className="eyebrow">PASS THE DEVICE</span><h2>{setup.names[player]}, YOUR TURN.</h2><p>{nextPhase.current === 'battle' ? 'Both lineups are locked. Bring everyone back for the showdown.' : 'Keep your cards and lineup private. Continue when only you can see the screen.'}</p><Button onClick={() => nextPhase.current === 'battle' ? attempt(() => beginBattle(draft.teams)) : setPhase(nextPhase.current)}>I’m ready</Button></section>}
    {phase === 'draft' && <ArenaDraft draft={draft} player={player} name={setup.names[player]} onDraw={() => attempt(() => setDraft(drawCard(draft, setup.pool, player)))} onReroll={() => attempt(() => setDraft(drawCard(draft, setup.pool, player, draft.teams[player].length - 1)))} onLock={keepTeam} />}
    {phase === 'lineup' && <ArenaLineup name={setup.names[player]} team={draft.teams[player]} onChange={team => setDraft({ ...draft, teams: draft.teams.map((current, index) => index === player ? team : current) })} onLock={lockLineup} />}
    {phase === 'rounds' && <ArenaRounds record={record} outcome={outcome} roundIndex={roundIndex} replay={replay} onNext={advanceRound} />}
    {phase === 'results' && <ArenaResults key={record.id} record={record} outcome={outcome} replay={replay} saveState={saveState} onSave={() => save()} onRematch={rematch} onNew={() => { refreshHistory(); setError(''); setPhase('setup'); }} />}
    <p className="arena-note arena-footer">Matches and profiles are saved only in this browser. Reloading during a draft abandons it. A saved replay uses its original stats and seed.</p>
  </div>;
}
