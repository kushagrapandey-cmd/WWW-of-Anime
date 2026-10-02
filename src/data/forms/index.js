import choji from './choji.json';
import deidara from './deidara.json';
import fourth_raikage from './fourth-raikage.json';
import gaara from './gaara.json';
import hashirama from './hashirama.json';
import hidan from './hidan.json';
import hinata from './hinata.json';
import hiruzen from './hiruzen.json';
import ino from './ino.json';
import itachi from './itachi.json';
import jiraiya from './jiraiya.json';
import kabuto_yakushi from './kabuto-yakushi.json';
import kaguya_otsutsuki from './kaguya-otsutsuki.json';
import kakashi from './kakashi.json';
import kakuzu from './kakuzu.json';
import kankuro from './kankuro.json';
import kiba from './kiba.json';
import killer_b from './killer-b.json';
import kisame from './kisame.json';
import konan from './konan.json';
import luffy from './luffy.json';
import madara_uchiha from './madara-uchiha.json';
import mei_terumi from './mei-terumi.json';
import might from './might.json';
import minato from './minato.json';
import nagato from './nagato.json';
import naruto from './naruto.json';
import neji from './neji.json';
import obito_uchiha from './obito-uchiha.json';
import onoki from './onoki.json';
import orochimaru from './orochimaru.json';
import rock from './rock.json';
import sakura from './sakura.json';
import sasori from './sasori.json';
import sasuke from './sasuke.json';
import shikamaru from './shikamaru.json';
import shino from './shino.json';
import temari from './temari.json';
import tenten from './tenten.json';
import tobirama from './tobirama.json';
import tsunade from './tsunade.json';
export const characterForms = [
  ...choji,
  ...deidara,
  ...fourth_raikage,
  ...gaara,
  ...hashirama,
  ...hidan,
  ...hinata,
  ...hiruzen,
  ...ino,
  ...itachi,
  ...jiraiya,
  ...kabuto_yakushi,
  ...kaguya_otsutsuki,
  ...kakashi,
  ...kakuzu,
  ...kankuro,
  ...kiba,
  ...killer_b,
  ...kisame,
  ...konan,
  ...luffy,
  ...madara_uchiha,
  ...mei_terumi,
  ...might,
  ...minato,
  ...nagato,
  ...naruto,
  ...neji,
  ...obito_uchiha,
  ...onoki,
  ...orochimaru,
  ...rock,
  ...sakura,
  ...sasori,
  ...sasuke,
  ...shikamaru,
  ...shino,
  ...temari,
  ...tenten,
  ...tobirama,
  ...tsunade,
];
export const getFormsForCharacter = characterId => characterForms.filter(form => form.characterId === characterId);
export const getFormById = id => characterForms.find(form => form.id === id) ?? null;
