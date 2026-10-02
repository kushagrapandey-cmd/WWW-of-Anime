import brook from './brook.json';
import choji from './choji.json';
import deidara from './deidara.json';
import edward_newgate from './edward-newgate.json';
import fourth_raikage from './fourth-raikage.json';
import franky from './franky.json';
import gaara from './gaara.json';
import hashirama from './hashirama.json';
import hidan from './hidan.json';
import hinata from './hinata.json';
import hiruzen from './hiruzen.json';
import ino from './ino.json';
import itachi from './itachi.json';
import jinbe from './jinbe.json';
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
import marshall_d_teach from './marshall-d-teach.json';
import mei_terumi from './mei-terumi.json';
import might from './might.json';
import minato from './minato.json';
import nagato from './nagato.json';
import nami from './nami.json';
import naruto from './naruto.json';
import neji from './neji.json';
import nico_robin from './nico-robin.json';
import obito_uchiha from './obito-uchiha.json';
import onoki from './onoki.json';
import orochimaru from './orochimaru.json';
import portgas_d_ace from './portgas-d-ace.json';
import rock from './rock.json';
import roronoa_zoro from './roronoa-zoro.json';
import sabo from './sabo.json';
import sakura from './sakura.json';
import sanji from './sanji.json';
import sasori from './sasori.json';
import sasuke from './sasuke.json';
import shanks from './shanks.json';
import shikamaru from './shikamaru.json';
import shino from './shino.json';
import temari from './temari.json';
import tenten from './tenten.json';
import tobirama from './tobirama.json';
import tony_tony_chopper from './tony-tony-chopper.json';
import tsunade from './tsunade.json';
import usopp from './usopp.json';
export const characterForms = [
  ...brook,
  ...choji,
  ...deidara,
  ...edward_newgate,
  ...fourth_raikage,
  ...franky,
  ...gaara,
  ...hashirama,
  ...hidan,
  ...hinata,
  ...hiruzen,
  ...ino,
  ...itachi,
  ...jinbe,
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
  ...marshall_d_teach,
  ...mei_terumi,
  ...might,
  ...minato,
  ...nagato,
  ...nami,
  ...naruto,
  ...neji,
  ...nico_robin,
  ...obito_uchiha,
  ...onoki,
  ...orochimaru,
  ...portgas_d_ace,
  ...rock,
  ...roronoa_zoro,
  ...sabo,
  ...sakura,
  ...sanji,
  ...sasori,
  ...sasuke,
  ...shanks,
  ...shikamaru,
  ...shino,
  ...temari,
  ...tenten,
  ...tobirama,
  ...tony_tony_chopper,
  ...tsunade,
  ...usopp,
];
export const getFormsForCharacter = characterId => characterForms.filter(form => form.characterId === characterId);
export const getFormById = id => characterForms.find(form => form.id === id) ?? null;
