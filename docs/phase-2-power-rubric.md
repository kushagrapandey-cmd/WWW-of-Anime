# ⚖️ Phase 2 — Step A: shared power system proposal

**Status: approved by the user on 2026-10-01.** Step B is in progress; Naruto batches 1–2 contain 30 records. The rules below remain the approved baseline.

## 1. Canon scope and peak-form policy

Default: use a fixed manga snapshot—**Naruto chapters 1–700, One Piece chapters 1–1122, Bleach chapters 1–686**. One Piece 1122 is a reproducible launch baseline, not the latest chapter. Later manga additions require a deliberate roster revision. Exclude Boruto, novels, movies, games, filler and anime-only changes from this version.

- Rate the strongest single supported form within that snapshot, not a composite of incompatible forms. Name the form and source references in a companion audit document in Step B.
- Temporary canon forms are allowed. Their duration and recovery costs reduce stamina. Examples to review include Eight Gates Guy and double-Mangekyo Kakashi; neither gets permanent access to a temporary state.
- Do not invent an unseen “prime” power level from reputation. Use supported feats and a documented form; thin evidence means lower confidence, not an automatic maximum.
- No automatic one-hit wins from cross-series energy differences. For gameplay, characters can perceive and interact with one another; chakra, Haki and reiatsu remain distinct abilities. Cross-series counters are explicit small modifiers in Phase 5, not unlimited inferred immunities.
- Manga citations support abilities and feats; the numerical ratings remain editorial gameplay judgments. Marketing blurbs are not sufficient evidence for destructive tiers.

## 2. Eight stats, each an integer from 1–100

All characters use the same scale. 50 does not mean “average in their own anime.” Never normalize each series separately.

| JSON key | Weight | What it measures | Keep separate from |
| --- | ---: | --- | --- |
| `attack` | 25% | Supported damage output and credible ability to overcome defenses | Area of destruction alone; hype |
| `defense` | 10% | Active protection: barriers, guarding, evasion tools, resistance techniques | Raw bodily toughness |
| `speed` | 15% | Combat movement, reaction and usable execution speed | Long-distance travel or teleport range alone |
| `durability` | 12% | Damage survived before incapacitation, with the selected form’s body | Barriers counted in defense |
| `intelligence` | 8% | Demonstrated combat planning, adaptation and exploitation of weaknesses | Academic knowledge or omniscience |
| `versatility` | 10% | Distinct useful options: range, control, support, mobility and special effects | Naming many similar moves |
| `stamina` | 10% | Sustained effective fighting and resource management | Infinite resources assumed from a short scene |
| `feats` | 10% | Demonstrated combat results against calibrated opposition | A second copy of the biggest attack |
| **Total** | **100%** | | |

Stat guide: **1–14** civilian/basic; **15–29** trained/local; **30–49** major battlefield threat; **50–64** exceptional regional threat; **65–84** strategic/top-tier threat; **85–100** exceptional ceiling. These are compressed gameplay bands, not equal physical increments.

Attack/durability use the ladder below as context. Defense, speed, intelligence, versatility, stamina and feats need dimension-specific comparisons: a brilliant low-power tactician may have 85 intelligence without planetary attacks. Reserve 95–100 for unusually well-supported extremes; “main character” gives no bonus.

Rating procedure: select form → collect manga evidence → compare with at least two shared anchors → assign each stat independently → apply formula → audit nearest peers from other series. A placement outside the expected broad band needs a written explanation. Never change scores just to fill rarity quotas.

## 3. Exact powerScore formula: 1–1000

Let `A,D,S,U,I,V,T,F` represent attack, defense, speed, durability, intelligence, versatility, stamina and feats.

```text
W = 0.25*A + 0.10*D + 0.15*S + 0.12*U
  + 0.08*I + 0.10*V + 0.10*T + 0.10*F

powerScore = 1 + Math.round(999 * (W - 1) / 99)
```

Compute using the original integer stats; do not round `W` first. All 1s produce 1; all 100s produce 1000. No series multiplier, popularity bonus, faction bonus or hidden adjustment enters this base score. Matchup, synergy and seeded luck belong to Phase 5.

Worked synthetic example, not a canon rating:

```text
A=70, D=60, S=75, U=65, I=80, V=70, T=55, F=70
W = 17.5 + 6 + 11.25 + 7.8 + 6.4 + 7 + 5.5 + 7 = 68.45
powerScore = 1 + round(999 * 67.45 / 99) = 682
```

The result is an index for a casual battle game. A 600 score is not twice the physical power of a 300 score, and exceptional abilities cannot be perfectly modeled by eight numbers.

## 4. Shared anchor ladder

**These are provisional calibration candidates, not verified canon tier declarations.** Rung names describe broad destructive/threat scope; they do not mean every ability or every stat lies in that band. Step B must record exact manga evidence and may move candidates. The bands below describe broad expected composite scores, not a second formula or score clamp.

| Rung | Indicative score band | Naruto candidate | One Piece candidate | Bleach candidate |
| --- | --- | --- | --- | --- |
| Street / civilian | 1–150 | Tazuna | Makino | Mizuiro Kojima |
| Building / local combat | 151–300 | Iruka Umino | Alvida | Ganju Shiba |
| City / major battlefield | 301–500 | Kakuzu | Donquixote Doflamingo | Grimmjow Jaegerjaquez |
| Island / exceptional regional | 501–650 | Nagato / Pain | Enel | Ulquiorra Cifer |
| Country / strategic | 651–850 | Hashirama Senju | Edward Newgate | Genryusai Yamamoto |
| Planetary+ / exceptional ceiling | 851–1000 | Kaguya Otsutsuki | **No defensible candidate confirmed** | Yhwach |

Lower-rung civilians are calibration references only, not launch roster entries. The combat anchors use their selected supported peak forms, with final placement subject to evidence. Labels like “country” require particular care: threatening a region, defeating an opponent, destroying terrain and influencing a realm are different feats.

**Explicit exception to the brief:** three references from three different series cannot honestly be supplied at planetary+ here. The three upper-ceiling candidates are **Kaguya Otsutsuki, Hagoromo Otsutsuki and Yhwach**, from two series. Their literal planetary classification is disputed/inferred; realm effects and statements must not be treated as measured planetary attack power. Hagoromo has especially sparse direct combat evidence. If the evidence audit cannot support the upper rung, leave it unoccupied rather than inflate anyone.

Reference confidence: civilians/local comparisons are relatively straightforward; city/island/country placements are preliminary cross-series interpretations; the planetary+ candidates have low confidence as literal physical-scale comparisons. No candidate automatically receives a score at the top of its band. A series may have no Mythic characters.

## 5. Rarity cutoffs and distribution

Start with these transparent provisional thresholds:

| Rarity | powerScore | Target share across the complete roster | Approximate count out of 120 |
| --- | --- | ---: | ---: |
| Common | 1–399 | 35% | 42 |
| Rare | 400–599 | 30% | 36 |
| Epic | 600–749 | 20% | 24 |
| Legendary | 750–899 | 11% | 13 |
| Mythic | 900–1000 | 4% | 5 |

Fixed thresholds cannot guarantee those percentages before ratings exist. These counts are roster-composition goals, not draw probabilities; rarity-weighted RNG is defined in Phase 5.

If the provisional thresholds miss the target substantially, review global score quantiles after all 120 ratings are audited. For sorted scores `x1…x120`, candidate lower-tier endpoints are `x42`, `x78`, `x102`, `x115`; the next tier begins at endpoint + 1. Keep identical scores in the same tier, accepting deviations in counts. If endpoints coincide, do not create empty/inverted ranges: retain the fixed thresholds and report the discrepancy. Any proposed threshold change requires approval and recalculates rarity for all batches together. Draft batches use the provisional cutoffs; scores do not change to force a percentage.

## 6. Proposed launch roster — 40 names per anime

Names only; no character scores or abilities are assigned in this step.

| # | Naruto | One Piece | Bleach |
| ---: | --- | --- | --- |
| 1 | Naruto Uzumaki | Monkey D. Luffy | Ichigo Kurosaki |
| 2 | Sasuke Uchiha | Roronoa Zoro | Rukia Kuchiki |
| 3 | Sakura Haruno | Nami | Renji Abarai |
| 4 | Kakashi Hatake | Usopp | Orihime Inoue |
| 5 | Might Guy | Sanji | Yasutora Sado |
| 6 | Rock Lee | Tony Tony Chopper | Uryu Ishida |
| 7 | Neji Hyuga | Nico Robin | Kisuke Urahara |
| 8 | Hinata Hyuga | Franky | Yoruichi Shihoin |
| 9 | Shikamaru Nara | Brook | Isshin Kurosaki |
| 10 | Choji Akimichi | Jinbe | Byakuya Kuchiki |
| 11 | Ino Yamanaka | Portgas D. Ace | Kenpachi Zaraki |
| 12 | Kiba Inuzuka | Sabo | Toshiro Hitsugaya |
| 13 | Shino Aburame | Shanks | Shunsui Kyoraku |
| 14 | Tenten | Edward Newgate | Jushiro Ukitake |
| 15 | Gaara | Marshall D. Teach | Genryusai Yamamoto |
| 16 | Temari | Kaido | Retsu Unohana |
| 17 | Kankuro | Charlotte Linlin | Mayuri Kurotsuchi |
| 18 | Jiraiya | Charlotte Katakuri | Soi Fon |
| 19 | Tsunade | King | Shinji Hirako |
| 20 | Orochimaru | Queen | Sajin Komamura |
| 21 | Hashirama Senju | Donquixote Doflamingo | Kensei Muguruma |
| 22 | Tobirama Senju | Crocodile | Rojuro Otoribashi |
| 23 | Hiruzen Sarutobi | Rob Lucci | Sosuke Aizen |
| 24 | Minato Namikaze | Enel | Gin Ichimaru |
| 25 | Itachi Uchiha | Trafalgar D. Water Law | Kaname Tosen |
| 26 | Kisame Hoshigaki | Eustass Kid | Grimmjow Jaegerjaquez |
| 27 | Deidara | Killer | Ulquiorra Cifer |
| 28 | Sasori | Boa Hancock | Coyote Starrk |
| 29 | Hidan | Bartholomew Kuma | Baraggan Louisenbairn |
| 30 | Kakuzu | Dracule Mihawk | Tier Harribel |
| 31 | Konan | Marco | Nelliel Tu Odelschwanck |
| 32 | Nagato | Yamato | Nnoitra Gilga |
| 33 | Obito Uchiha | Sakazuki | Szayelaporro Granz |
| 34 | Madara Uchiha | Kuzan | Yhwach |
| 35 | Kaguya Otsutsuki | Borsalino | Jugram Haschwalth |
| 36 | Kabuto Yakushi | Issho | Bazz-B |
| 37 | Killer B | Aramaki | Askin Nakk Le Vaar |
| 38 | Fourth Raikage | Monkey D. Garp | Gerard Valkyrie |
| 39 | Onoki | Sengoku | Lille Barro |
| 40 | Mei Terumi | Smoker | Ichibe Hyosube |

Nagato and Pain are one roster entry, not independent draft picks. Aliases such as Whitebeard/Edward Newgate, Big Mom/Charlotte Linlin and Akainu/Sakazuki likewise share an ID. Supports are valid roster members; an unusual defensive ability does not automatically make its user an invincible Tank.

## 7. Evidence and confidence for Step B

Each batch uses the requested schema: `id`, `name`, `anime`, `faction`, `role`, `stats`, `powerScore`, `rarity`, `abilityTags`, `signatureMoves`, `clues`, `reasoning`, `confidence`, `imageQuery`, `image`.

- Roles stay `Striker`, `Tank`, `Support`, `Tactician`, `Hybrid`; they describe playstyle, not a score bonus.
- Confidence: **high** = supported form and repeated relevant feats; **medium** = some indirect scaling or incomplete comparisons; **low** = sparse evidence, disputed form interpretation or major inference. Cross-series translation always remains interpretive.
- Companion audit notes record form, chapter/volume references, assumptions and the reason for low confidence; the 25-word reasoning field cannot carry the whole audit.
- Validate integer stats, exact formula, rarity threshold, unique slugs, 3–5 tags, 2–3 moves and exactly three name-free clues. One anime per batch, at most 15 characters. Character image fields start as `null`.
- Naruto first: 15 + 15 + 10; then One Piece and Bleach in the same batch sizes. Produce no Step B records until approval.

## 8. Sources and limits of this review

Official source entry points checked for the snapshot and story endpoints:

- [Naruto official volume 72: chapters 691–700](https://naruto-official.com/en/comics/01_154)
- [VIZ: One Piece chapter 1122](https://www.viz.com/shonenjump/one-piece-chapter-1122/chapter/43818)
- [VIZ: Bleach chapter 686](https://www.viz.com/shonenjump/bleach-chapter-686/chapter/16275)
- [VIZ: Naruto volume 71](https://www.viz.com/manga-books/manga/naruto-volume-71/product/3497)
- [VIZ: One Piece volume 59](https://www.viz.com/manga-books/manga/one-piece-volume-59/product/2630)
- [VIZ: Bleach volume 74](https://www.viz.com/manga-books/manga/bleach-volume-74/product/5664)

This step checked official catalog/endpoint information; it did not audit every manga panel. The links do not verify the proposed scores, anchor placement or roster abilities. Primary manga evidence is required during rating review. No fan wiki tier list is treated as canon.

## 9. How to review and test this step

This is documentation only; the website should still behave exactly as Phase 1.

```bash
git pull --ff-only
npm ci
npm run dev
```

Open Codespaces port 5173 or local `http://localhost:5173`. Check the home page and navigation. To recheck compilation, run `npm run build`.

Proposal checklist: weights total 100%; formula endpoints equal 1/1000; synthetic example equals 682; rarity ranges cover 1–1000 without overlap; roster has 40 unique names per series; manga cutoffs and upper-anchor exception are explicit.

The user approved the canon cutoffs, rubric, anchor exception, rarity policy and roster. Continue Step B one batch at a time on “next”.
