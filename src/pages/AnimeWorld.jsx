import { useParams } from 'react-router-dom';
import { animeConfig,animeTheme } from '../data/anime';
import { NotFound } from './Placeholder';
import Button from '../components/Button';
import Badge from '../components/Badge';
export default function AnimeWorld(){
  const {animeId}=useParams(),anime=animeConfig.find(item=>item.id===animeId);
  if(!anime)return <NotFound/>;
  return <article className="container world-details" style={animeTheme(anime)}><Badge>{anime.label}</Badge><h1>{anime.name}</h1><p>{anime.premise}</p>
    <dl className="world-facts">{[['Creator',anime.creator],['Manga',anime.mangaLength],['Anime',anime.animeLength],['Story status',anime.seriesStatus]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <section><h2>HOW THIS WORLD FIGHTS</h2><p>{anime.powers}</p></section><section><h2>BEFORE YOU EXPLORE</h2><p>{anime.watchNote}</p><p>Character cards, moves and quizzes can contain manga spoilers through chapter {anime.cutoffChapter}. Ratings use manga feats; they are game rules rather than canon verdicts.</p></section>
    <div className="hero-actions"><Button to={`/characters?anime=${anime.id}`}>Explore fighters</Button><Button to="/quizzes" variant="secondary">Test your knowledge</Button><Button to="/battle" variant="secondary">Enter the arena</Button></div>
    <section><h2>OFFICIAL SOURCES</h2><ul>{anime.sources.map(source=><li key={source.url}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul><p className="arena-note">Metadata reviewed {anime.metadataCheckedAt}. Ongoing-series lengths use lower bounds.</p></section>
  </article>;
}
