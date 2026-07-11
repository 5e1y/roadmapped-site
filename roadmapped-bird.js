/*!
 * roadmapped-bird.js — la mascotte de roadmapped.dev
 * Un oiseau pixel-art qui suit le curseur et se pose sur le bord supérieur
 * des éléments marqués [data-bird-perch] (et sur le bas de la fenêtre).
 * ESM autonome : zéro dépendance, zéro asset externe (frames embarquées).
 *
 *   import { initBird } from './roadmapped-bird.js';
 *   const bird = initBird();   // options : voir README / signature ci-dessous
 *   bird.destroy();            // retire l'oiseau et tous ses listeners
 *
 * Perchoir de départ (#266) :
 *   initBird({ startPerchSelector: '#hero-perch', startDelayMs: 1000 })
 *   -> l'oiseau démarre POSÉ sur ce perchoir (au lieu d'entrer par le haut),
 *      reste immobile en idle pendant startDelayMs, puis suit le curseur
 *      normalement. Si le sélecteur ne matche pas un perchoir valide au
 *      chargement (élément absent, hors viewport…), retour au comportement
 *      historique : entrée par le haut, atterrissage en bas.
 *
 * Easter egg — la chasse aux œufs :
 *   des œufs pixel-art apparaissent dans la page ; survoler un œuf avec
 *   l'oiseau le ramasse (confettis dorés & bleus + saut de joie), les œufs
 *   ramassés suivent l'oiseau en file façon Yoshi, et se déposent dans un
 *   nid posé sur le R du footer. La pile monte à chaque dépôt, sans plafond.
 *   Options : { game:true, eggCount:5, eggRadius:56, eggScale, nestScale }.
 *   Désactivé en reduced-motion, comme tout le reste du mouvement.
 */

const SPRITES = {"meta":{"facing":"left","palette":{"KK":"#0F1225","WW":"#DCE2E8","mm":"#C6CCD4","OR":"#EA6200"},"empty":"..","note":"Chaque anim porte ses propres dimensions (cols/rows) : le lecteur les lit par-anim. Chaque frame est une grille de codes 2 chars separes par espaces. Rendu: cellules pleines, nearest-neighbor, aucun transform."},"anims":{"idle":{"fps":6,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK mm KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. WW","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW ..",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. WW .."]]},"walk":{"fps":8,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. WW WW ..",".. .. .. .. OR .. .. .. OR .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. WW .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR .. OR .. .. .. .. .. .. ..",".. .. .. .. .. .. OR .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. OR .. OR .. .. .. .. WW WW ..",".. .. .. .. .. OR .. .. OR .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. WW .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. OR .. .. .. .. .. .. .. .."]]},"fly":{"fps":10,"cols":18,"rows":10,"ground":false,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..","WW .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. WW ..","WW .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. WW ..",".. WW WW WW .. .. .. .. .. .. .. .. .. WW WW WW .. ..",".. .. WW WW KK KK WW .. .. .. WW WW WW WW WW .. .. ..",".. .. .. KK KK KK KK WW WW WW WW WW mm .. .. .. WW WW",".. .. OR OR OR WW WW KK WW mm mm WW WW WW WW WW .. ..",".. .. .. .. .. .. .. mm WW WW WW mm mm mm .. .. .. ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. WW WW mm KK KK WW .. .. .. .. .. .. mm WW WW WW ..","WW .. .. KK KK KK KK WW WW WW WW WW mm .. .. .. .. WW",".. .. OR OR OR WW WW KK WW mm mm WW WW WW WW WW .. ..",".. .. .. .. .. .. .. mm WW WW WW mm mm mm .. .. .. ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. KK KK .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. KK KK KK KK WW WW WW WW mm mm .. .. .. ..","WW .. .. OR OR OR WW WW WW mm mm WW WW WW WW .. .. WW",".. WW mm mm .. .. .. mm WW WW WW mm mm mm .. WW WW ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. WW WW mm mm KK KK .. .. .. .. .. .. mm WW WW WW ..","WW .. .. .. KK KK KK KK WW WW WW WW mm .. .. .. .. WW",".. .. .. OR OR OR WW WW WW mm mm WW WW WW WW WW .. ..",".. .. .. .. .. .. .. mm WW WW WW mm mm mm .. .. .. ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."]]},"peck":{"fps":8,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW WW .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW mm WW .. .. .. ..",".. .. .. .. mm WW WW WW mm mm .. mm WW .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. .. WW WW ..",".. .. .. .. .. .. mm .. WW .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. WW WW .. .. ..",".. .. .. .. .. .. .. .. .. mm WW WW .. .. .. ..",".. .. .. .. .. mm mm WW WW WW mm .. .. .. .. ..",".. .. KK KK WW WW WW WW WW mm .. .. .. .. .. ..",".. KK KK WW WW WW WW WW mm .. .. .. .. .. .. ..",".. KK OR WW mm mm mm WW .. .. .. .. .. .. .. ..",".. OR .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW WW .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW mm WW .. .. .. ..",".. .. .. .. mm WW WW WW mm mm .. mm WW .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. .. WW WW ..",".. .. .. .. .. .. mm .. WW .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. WW WW .. .. ..",".. .. .. .. .. .. .. .. .. mm WW WW .. .. .. ..",".. .. .. .. .. mm mm WW WW WW mm .. .. .. .. ..",".. .. KK KK WW WW WW WW WW mm .. .. .. .. .. ..",".. KK KK WW WW WW WW WW mm .. .. .. .. .. .. ..",".. KK OR WW mm mm mm WW .. .. .. .. .. .. .. ..",".. OR .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW WW .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW mm WW .. .. .. ..",".. .. .. .. mm WW WW WW mm mm .. mm WW .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. .. WW WW ..",".. .. .. .. .. .. mm .. WW .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."]]},"hop":{"fps":10,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. WW ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW ..","OR OR OR WW WW KK .. .. .. .. .. .. .. WW .. ..",".. .. .. WW mm mm WW WW WW WW .. .. WW .. .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm mm .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. WW WW WW ..",".. .. .. .. .. OR mm OR WW .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR .. OR .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR OR .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR .. OR .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. WW ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW ..","OR OR OR WW WW KK .. .. .. .. .. .. .. WW .. ..",".. .. .. WW mm mm WW WW WW WW .. .. WW .. .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm mm .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. WW WW WW ..",".. .. .. .. .. OR mm OR WW .. .. .. .. .. .. .."]]}}};

// ---- assets du jeu (inline : zéro fetch au runtime, comme les frames) ------
// Pixel-art sur grille 30px : egg.svg 120×150 -> 4×5 px natifs, nest.svg
// 540×180 -> 18×6 px natifs. Rasterisés par bakeSVG() (échantillon au centre
// de chaque cellule), puis dessinés ×scale en nearest-neighbor.
const EGG_SVG = `<svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30 90H0V120H30V90Z" fill="#B79573"/>
<path d="M30 30H0V60H30V30Z" fill="#B79573"/>
<path d="M120 30H90V60H120V30Z" fill="#B79573"/>
<path d="M30 60H0V90H30V60Z" fill="#D2C3AE"/>
<path d="M60 30H30V60H60V30Z" fill="#D2C3AE"/>
<path d="M60 0H30V30H60V0Z" fill="#E1DCD5"/>
<path d="M60 60H30V90H60V60Z" fill="#D2C3AE"/>
<path d="M60 90H30V120H60V90Z" fill="#C9B59A"/>
<path d="M90 30H60V60H90V30Z" fill="#E1DCD5"/>
<path d="M90 0H60V30H90V0Z" fill="#D2C3AE"/>
<path d="M90 60H60V90H90V60Z" fill="#D2C3AE"/>
<path d="M90 90H60V120H90V90Z" fill="#C9B59A"/>
<path d="M60 120H30V150H60V120Z" fill="#B79573"/>
<path d="M90 120H60V150H90V120Z" fill="#966C53"/>
<path d="M120 90H90V120H120V90Z" fill="#966C53"/>
<path d="M120 60H90V90H120V60Z" fill="#C9B59A"/>
</svg>`;
const NEST_SVG = `<svg width="540" height="180" viewBox="0 0 540 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M120 0H90V30H120V0Z" fill="#B9A37C"/>
<path d="M150 30H120V60H150V30Z" fill="#B9A37C"/>
<path d="M180 60H150V90H180V60Z" fill="#B9A37C"/>
<path d="M180 0H150V30H180V0Z" fill="#735E3A"/>
<path d="M210 30H180V60H210V30Z" fill="#735E3A"/>
<path d="M180 90H150V120H180V90Z" fill="#735E3A"/>
<path d="M210 90H180V120H210V90Z" fill="#735E3A"/>
<path d="M270 90H240V120H270V90Z" fill="#735E3A"/>
<path d="M300 90H270V120H300V90Z" fill="#735E3A"/>
<path d="M330 90H300V120H330V90Z" fill="#735E3A"/>
<path d="M390 90H360V120H390V90Z" fill="#735E3A"/>
<path d="M360 90H330V120H360V90Z" fill="#554934"/>
<path d="M480 60H450V90H480V60Z" fill="#554934"/>
<path d="M300 150H270V180H300V150Z" fill="#554934"/>
<path d="M270 150H240V180H270V150Z" fill="#554934"/>
<path d="M210 150H180V180H210V150Z" fill="#554934"/>
<path d="M180 120H150V150H180V120Z" fill="#554934"/>
<path d="M420 90H390V120H420V90Z" fill="#8A7550"/>
<path d="M150 60H120V90H150V60Z" fill="#735E3A"/>
<path d="M120 30H90V60H120V30Z" fill="#8A7550"/>
<path d="M120 60H90V90H120V60Z" fill="#8A7550"/>
<path d="M120 90H90V120H120V90Z" fill="#735E3A"/>
<path d="M150 120H120V150H150V120Z" fill="#735E3A"/>
<path d="M210 120H180V150H210V120Z" fill="#735E3A"/>
<path d="M240 120H210V150H240V120Z" fill="#735E3A"/>
<path d="M270 120H240V150H270V120Z" fill="#735E3A"/>
<path d="M300 120H270V150H300V120Z" fill="#735E3A"/>
<path d="M330 120H300V150H330V120Z" fill="#735E3A"/>
<path d="M360 120H330V150H360V120Z" fill="#735E3A"/>
<path d="M390 120H360V150H390V120Z" fill="#735E3A"/>
<path d="M450 120H420V150H450V120Z" fill="#554934"/>
<path d="M450 90H420V120H450V90Z" fill="#735E3A"/>
<path d="M480 90H450V120H480V90Z" fill="#735E3A"/>
<path d="M510 60H480V90H510V60Z" fill="#B9A37C"/>
<path d="M450 60H420V90H450V60Z" fill="#735E3A"/>
<path d="M390 60H360V90H390V60Z" fill="#735E3A"/>
<path d="M360 60H330V90H360V60Z" fill="#735E3A"/>
<path d="M330 60H300V90H330V60Z" fill="#735E3A"/>
<path d="M300 60H270V90H300V60Z" fill="#735E3A"/>
<path d="M270 60H240V90H270V60Z" fill="#735E3A"/>
<path d="M480 30H450V60H480V30Z" fill="#B9A37C"/>
<path d="M510 0H480V30H510V0Z" fill="#B9A37C"/>
<path d="M540 0H510V30H540V0Z" fill="#B9A37C"/>
<path d="M420 120H390V150H420V120Z" fill="#735E3A"/>
<path d="M90 30H60V60H90V30Z" fill="#8A7550"/>
<path d="M59.9982 3.9164e-05L30 0.329102L30.3291 30.3273L60.3273 29.9982L59.9982 3.9164e-05Z" fill="#8A7550"/>
<path d="M29.9982 30L0 30.3291L0.329062 60.3273L30.3273 59.9982L29.9982 30Z" fill="#8A7550"/>
<path d="M210 60H180V90H210V60Z" fill="#B9A37C"/>
<path d="M240 90H210V120H240V90Z" fill="#B9A37C"/>
<path d="M300 60H270V90H300V60Z" fill="#8A7550"/>
<path d="M270 90H240V120H270V90Z" fill="#8A7550"/>
<path d="M360 120H330V150H360V120Z" fill="#8A7550"/>
<path d="M450 90H420V120H450V90Z" fill="#8A7550"/>
<path d="M210 120H180V150H210V120Z" fill="#B9A37C"/>
<path d="M210 90H180V120H210V90Z" fill="#8A7550"/>
<path d="M270 120H240V150H270V120Z" fill="#B9A37C"/>
<path d="M300 120H270V150H300V120Z" fill="#B9A37C"/>
<path d="M330 150H300V180H330V150Z" fill="#B9A37C"/>
<path d="M180 150H150V180H180V150Z" fill="#B9A37C"/>
<path d="M360 150H330V180H360V150Z" fill="#B9A37C"/>
<path d="M390 150H360V180H390V150Z" fill="#B9A37C"/>
<path d="M420 120H390V150H420V120Z" fill="#B9A37C"/>
<path d="M360 30H330V60H360V30Z" fill="#B9A37C"/>
<path d="M330 60H300V90H330V60Z" fill="#B9A37C"/>
<path d="M390 0H360V30H390V0Z" fill="#B9A37C"/>
<path d="M420 30H390V60H420V30Z" fill="#B9A37C"/>
<path d="M450 150H420V180H450V150Z" fill="#B9A37C"/>
<path d="M150 90H120V120H150V90Z" fill="#B9A37C"/>
</svg>`;

export function initBird(userOptions = {}) {
  const o = Object.assign({
    selector: '[data-bird-perch]',                    // perchoirs marqués (de confiance)
    fallbackSelector: 'section, article, [class*="card"]', // auto-détection, AJOUTÉE aux marqués
    scale: 3,                                         // taille du pixel
    zIndex: 2147482000,                               // au-dessus de tout
    frames: null,        // objet au format frames.json ({meta,anims}) ou à plat
    palette: null,       // override partiel, ex. {KK:'#141A30'} pour fond sombre
    reducedMotion: null, // true/false pour forcer ; null = media query
    startPerchSelector: null, // perchoir de départ : l'oiseau démarre posé dessus (#266)
    startDelayMs: 0,          // immobile pendant ce délai avant de suivre le curseur
    game: true,               // easter egg : la chasse aux œufs (OFF en reduced-motion)
    eggCount: 5,              // œufs simultanés posés dans la page
    eggRadius: 56,            // rayon de ramassage autour de l'oiseau (px écran)
    eggScale: null,           // taille d'un pixel d'œuf ; défaut = SCALE (même grille que l'oiseau)
    nestScale: null,          // taille d'un pixel de nid ; défaut = SCALE (même grille que l'oiseau)
  }, userOptions);

  // ---- données sprites ------------------------------------------------------
  const RAW = o.frames || SPRITES;
  const B = RAW.anims ? Object.assign({ palette: (RAW.meta || {}).palette }, RAW.anims) : RAW;
  // Theme-aware (#272) : en thème sombre du site (page #0a0a0a) la calotte navy KK
  // se fond. On l'éclaircit alors en bleu-ardoise clair, lisible sur sombre et
  // distinct du corps blanc. Un override explicite o.palette.KK reste prioritaire.
  const BASE_PAL = Object.assign({}, B.palette);
  const DARK_KK = '#b4c2dd';
  const isDark = () => {
    const dt = document.documentElement.dataset.theme;
    if (dt === 'dark') return true;
    if (dt === 'light') return false;
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const effectivePAL = () => Object.assign({}, BASE_PAL, isDark() ? { KK: DARK_KK } : {}, o.palette || {});
  let PAL = effectivePAL();
  const SCALE = o.scale;

  // ---- réglages (repris du proto validé bird_chase.html) ---------------------
  const SMOOTH = 1.7, MAXSPD = 430;             // vol libre : lent, damp marqué
  const SMOOTH_LAND = 0.85, MAXSPD_LAND = 650;  // approche d'un perchoir : plus vif
  const LAND_BAND = 200, TAKEOFF_BAND = 290;    // rayon d'atterrissage + hystérésis
  const LANDSNAP = 16;                          // fenêtre symétrique de contact
  const WALKMAX = 175, WALKACC = 0.12, STOPX = 5;
  const REST_GAP = 3000, REST_MAXSTREAK = 3;    // repos : tirage toutes les 3 s
  const HOPFPS = B.hop.fps, NYH = B.hop.rows;
  const TAKEOFF_SEQ = [2, 3, 4];                // accroupi -> détente -> apex
  const LAND_SEQ = [5, 6, 0];                   // contact -> amorti -> debout
  const EDGE = 4;                               // retrait des bords de perchoir
  const MINPERCH = (o.minPerchWidth != null) ? o.minPerchWidth : Math.max(44, B.walk.cols * SCALE); // largeur marchable mini (boutons/petits éléments OK)
  const TOPCLEAR = B.walk.rows * SCALE + 6;     // le corps doit tenir au-dessus du bord
  const BOTTOM = '__bottom__';

  const reduce = (o.reducedMotion != null) ? !!o.reducedMotion
    : (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---- canvas overlay : ne bloque jamais la page -----------------------------
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;display:block;background:transparent;z-index:' + o.zIndex;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';       // fix DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.imageSmoothingEnabled = false;                           // pixel-perfect
  }
  resize();

  // ---- sprites pré-rendus (1 canvas par frame, + miroir) ---------------------
  function bake(anim, mirror) {
    const C = anim.cols, R = anim.rows;
    return anim.frames.map(fr => {
      const oc = document.createElement('canvas'); oc.width = C; oc.height = R;
      const g = oc.getContext('2d');
      let sx = 0, sy = 0, n = 0, maxr = 0;
      for (let r = 0; r < R; r++) {
        const ln = fr[r].split(' ');
        for (let c = 0; c < C; c++) {
          const col = PAL[ln[c]];
          if (col) {
            const x = mirror ? C - 1 - c : c;
            g.fillStyle = col; g.fillRect(x, r, 1, 1);
            sx += x + 0.5; sy += r + 0.5; n++; if (r > maxr) maxr = r;
          }
        }
      }
      return { img: oc, cx: sx / n, cy: sy / n, foot: maxr + 1, C, R };
    });
  }
  let SPR = {}; for (const k of ['fly', 'walk', 'idle', 'peck', 'hop']) SPR[k] = [bake(B[k], 0), bake(B[k], 1)];
  // Re-bake au changement de thème : la géométrie (cx/cy/foot, donc FLY0/APEXCY) est
  // identique, seules les couleurs des sprites changent -> on ne reconstruit que SPR.
  function rebakeTheme() {
    PAL = effectivePAL();
    SPR = {}; for (const k of ['fly', 'walk', 'idle', 'peck', 'hop']) SPR[k] = [bake(B[k], 0), bake(B[k], 1)];
  }
  const themeObs = typeof MutationObserver === 'function' ? new MutationObserver(rebakeTheme) : null;
  if (themeObs) themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mqTheme = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  if (mqTheme) mqTheme.addEventListener('change', rebakeTheme);
  const FLY0 = SPR.fly[0][0], flyCentToFeet = (FLY0.foot - FLY0.cy) * SCALE;
  const APEXCY = SPR.hop[0][TAKEOFF_SEQ[TAKEOFF_SEQ.length - 1]].cy; // corps à l'apex du saut

  // ---- prefers-reduced-motion : posé, calme, pas de poursuite ----------------
  // Avec un perchoir de départ (#266), l'oiseau est dessiné posé DESSUS (il
  // « habite » la page : redessiné au scroll puisque le canvas est fixed) ;
  // sinon, coin bas-droit comme avant.
  if (reduce) {
    const startEl = o.startPerchSelector ? document.querySelector(o.startPerchSelector) : null;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const s = SPR.idle[0][0];
      let x = Math.round(W * 0.82 - s.cx * SCALE), y = H - s.R * SCALE;
      if (startEl) {
        const r = startEl.getBoundingClientRect();
        if (r.width > 0) {
          x = Math.round((r.left + r.right) / 2 - s.cx * SCALE);
          y = Math.round(r.top) - s.R * SCALE;
        }
      }
      ctx.drawImage(s.img, x, y, s.C * SCALE, s.R * SCALE);
    };
    const onR = () => { resize(); draw(); };
    addEventListener('resize', onR);
    if (startEl) addEventListener('scroll', draw, { passive: true });
    draw();
    return {
      canvas: cv,
      refresh: draw,
      destroy() {
        removeEventListener('resize', onR);
        if (startEl) removeEventListener('scroll', draw);
        cv.remove();
      },
    };
  }

  // ---- perchoirs : uniquement des éléments RÉELLEMENT visibles ET peints -----
  const isEl = n => n && n.nodeType === 1;
  const cs = el => getComputedStyle(el);
  const TRANSPARENT = /^(transparent|rgba?\(0,0,0,0?\)|rgba\(0,0,0,0\.0+\))$/i;

  function visibleChain(el) {          // display/visibility/opacity : soi + ancêtres
    for (let n = el; isEl(n); n = n.parentElement) {
      const s = cs(n);
      if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse') return false;
      if (parseFloat(s.opacity) <= 0.05) return false;   // un parent quasi-transparent masque l'enfant
    }
    return true;
  }
  function hasDirectText(el) {          // vrai contenu texte propre (pas via enfants)
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  }
  function isPainted(el) {              // l'élément a-t-il un rendu visuel PROPRE ?
    const s = cs(el);
    if (s.pointerEvents === 'none') return false;         // décoratif / non interactif
    const bg = (s.backgroundColor || '').replace(/\s+/g, '');
    if (bg && !TRANSPARENT.test(bg)) return true;         // fond opaque
    if (s.backgroundImage && s.backgroundImage !== 'none') return true;
    if (s.boxShadow && s.boxShadow !== 'none') return true;
    for (const side of ['Top', 'Right', 'Bottom', 'Left'])
      if (parseFloat(s['border' + side + 'Width']) > 0 && s['border' + side + 'Style'] !== 'none') return true;
    if (/^(IMG|SVG|CANVAS|VIDEO|PICTURE|BUTTON|INPUT|A|LABEL)$/.test(el.tagName)) return true; // média/contenu
    if (hasDirectText(el)) return true;                   // texte réel -> élément de contenu
    return false;                                         // sinon : wrapper transparent -> exclu
  }
  function qualifies(el, trusted) {
    if (!visibleChain(el)) return false;                  // caché (soi ou ancêtre) -> jamais
    if (trusted) return cs(el).pointerEvents !== 'none';  // marqué à la main : de confiance
    return isPainted(el);                                 // fallback : doit être réellement peint
  }

  let perchEls = [];
  function queryPerchEls() {
    // Union : les éléments marqués [data-bird-perch] (de confiance, prioritaires au
    // dédoublonnage) S'AJOUTENT aux éléments auto-détectés via fallbackSelector.
    // Avant, l'explicite était exclusif : marquer UN encart supprimait tous les autres perchoirs.
    const explicit = Array.from(document.querySelectorAll(o.selector));
    const seen = new Set(explicit);
    const fallback = o.fallbackSelector
      ? Array.from(document.querySelectorAll(o.fallbackSelector)).filter(el => !seen.has(el))
      : [];
    const raw = explicit.map(el => ({ el, trusted: true }))       // marqué à la main : test visibilité seul
      .concat(fallback.map(el => ({ el, trusted: false })));      // auto-détecté : doit être réellement peint
    perchEls = raw.filter(p => qualifies(p.el, p.trusted)).slice(0, 48);
  }
  const perches = [];
  function computePerches() {  // géométrie viewport, recalculée à chaque frame
    perches.length = 0;
    for (const p of perchEls) {
      const r = p.el.getBoundingClientRect();
      if (r.width < MINPERCH || r.height < 16) continue;          // caché / trop petit
      if (r.width >= W * 0.985 && r.height >= H * 0.9) continue;  // ~plein écran -> wrapper de page
      const y = Math.round(r.top);
      if (y < TOPCLEAR || y > H - 4) continue;                    // bord hors viewport : pas posable
      const l = Math.max(0, r.left) + EDGE, rr = Math.min(W, r.right) - EDGE;
      if (rr - l < MINPERCH) continue;
      let dup = false;                                            // dédoublonne les wrappers empilés
      for (const q of perches) if (Math.abs(q.y - y) <= 6 && l < q.r && rr > q.l) { dup = true; break; }
      if (dup) continue;
      perches.push({ id: p.el, y, l, r: rr });
    }
    perches.push({ id: BOTTOM, y: H, l: 0, r: W });               // le bas de fenêtre reste un sol
  }
  queryPerchEls();

  // ---- état -------------------------------------------------------------------
  let state = 'air', groundId = null, groundY = 0;
  let bx = W * 0.5, by = -B.fly.rows * SCALE * 2, vx = 0, vy = 0; // fallback : il entre par le haut
  let tx = W * 0.5, ty = H - 24;                                  // et va se poser en bas
  let facing = 0, fi = 0, ft = 0, last = 0, vyS = 0, mode = 'fly', prevMode = 'fly', walkVel = 0;
  let seqPos = 0, seqTimer = 0, hopIdx = 0;
  let restAnim = 'idle', restTimer = 1e9, restPlaying = false, lastRest = '', streak = 0;
  let dtms = 16, raf = 0, holdUntil = 0;

  // ---- perchoir de départ (#266) : démarrer POSÉ plutôt qu'en vol -------------
  // Le sélecteur doit désigner un perchoir déjà qualifié (donc typiquement un
  // [data-bird-perch]) ET visible/posable au chargement ; sinon on garde
  // l'entrée par le haut. Le curseur virtuel (tx,ty) est initialisé SUR le
  // perchoir : même une fois le délai écoulé, l'oiseau ne bouge pas tant que
  // la souris n'a pas réellement bougé.
  if (o.startPerchSelector) {
    const startEl = document.querySelector(o.startPerchSelector);
    if (startEl) {
      computePerches();
      const g0 = perches.find(p => p.id === startEl);
      if (g0) {
        state = 'ground'; groundId = g0.id; groundY = g0.y;
        bx = (g0.l + g0.r) / 2; by = g0.y; vx = vy = 0;
        tx = bx; ty = g0.y - 8;
        mode = prevMode = 'idle'; fi = 0; walkVel = 0;
        holdUntil = performance.now() + Math.max(0, o.startDelayMs || 0);
      }
    }
  }

  const onMove = e => { tx = e.clientX; ty = e.clientY; };
  const onResize = () => { resize(); queryPerchEls(); };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onMove, { passive: true });
  addEventListener('resize', onResize);
  const requery = setInterval(queryPerchEls, 2000);  // le DOM peut changer après coup

  // #285 — arrivé en BAS de page, l'oiseau cesse de suivre le curseur et va se
  // percher sur le R du footer (#footer-perch), où il reste. Hystérésis (entre à
  // ≤24px du bas, ressort au-delà de 160px) pour éviter le flicker au seuil.
  let atBottom = false;
  const distToBottom = () => document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
  const onScroll = () => {
    if (!atBottom && distToBottom() <= 24) atBottom = true;
    else if (atBottom && distToBottom() > 160) atBottom = false;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- easter egg : la chasse aux œufs ----------------------------------------
  // Tout vit sur LE canvas et LA boucle tick existants : gameUpdate() juste
  // avant le clear, gameDrawUnder() sous l'oiseau (nid + œufs posés),
  // gameDrawOver() par-dessus (pile, lancers, traîne, confettis). Z final :
  // nid < oiseau < œufs. Aucun listener supplémentaire : le scroll est lu
  // directement, les rects sont recalculés chaque frame comme les perchoirs.
  const GAME = o.game !== false;
  const EGG_SC = (o.eggScale != null) ? o.eggScale : SCALE;   // même échelle pixel que l'oiseau (œuf 4×5 -> 12×15)
  const NEST_SC = (o.nestScale != null) ? o.nestScale : SCALE; // même échelle pixel (nid 18×6 -> 54×18)
  const EGG_W = 4 * EGG_SC, EGG_H = 5 * EGG_SC, NEST_W = 18 * NEST_SC, NEST_H = 6 * NEST_SC;
  const EGG_N = o.eggCount, EGG_R = o.eggRadius;
  const TRAIL_GAP = EGG_W + 2, TRAIL_K = 11, TRAIL_SAG = 3; // chaîne : espacement, raideur, affaissement
  const DROP_EVERY = 240, DROP_MS = 480, DROP_ARC = 52;     // dépôt : cadence de la file, durée+hauteur d'un lancer
  const PILE_STEP = Math.round(EGG_H * 0.6);                // étage de pile < hauteur d'œuf : entassement cartoon
  const CHEER_SEQ = TAKEOFF_SEQ.concat(LAND_SEQ);           // saut de joie : détente + amorti, sans décoller
  let cheerPos = -1, cheerT = 0;

  // Sprites œuf/nid : bake ASYNC (Image + data URI), même règle pixel-perfect
  // que l'oiseau — canvas NATIF à la résolution pixel du SVG (grille 30px,
  // échantillon au centre de chaque cellule), dessiné ×scale en nearest.
  let eggSpr = null, nestSpr = null;
  function bakeSVG(svg, natW, natH, done) {
    const img = new Image();
    img.onload = () => {
      const full = document.createElement('canvas');
      full.width = natW * 30; full.height = natH * 30;
      const g = full.getContext('2d');
      g.drawImage(img, 0, 0, full.width, full.height);
      const px = g.getImageData(0, 0, full.width, full.height).data;
      const oc = document.createElement('canvas'); oc.width = natW; oc.height = natH;
      const og = oc.getContext('2d');
      for (let r = 0; r < natH; r++) for (let c = 0; c < natW; c++) {
        const i = ((r * 30 + 15) * full.width + (c * 30 + 15)) * 4;  // centre de cellule
        if (px[i + 3] > 127) { og.fillStyle = 'rgb(' + px[i] + ',' + px[i + 1] + ',' + px[i + 2] + ')'; og.fillRect(c, r, 1, 1); }
      }
      done(oc);
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  if (GAME) { bakeSVG(EGG_SVG, 4, 5, c => { eggSpr = c; }); bakeSVG(NEST_SVG, 18, 6, c => { nestSpr = c; }); }

  // Couleurs des confettis : le bleu de marque vient du CSS (--accent, suit le
  // thème, lu au moment du burst), les dorés sont ceux de la coquille d'œuf.
  const EGG_GOLDS = ['#E1DCD5', '#C9B59A', '#B79573'];
  const readAccent = () => (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '').trim() || '#2563eb';

  // État du jeu : œufs posés ancrés en coordonnées DOCUMENT (ils restent dans
  // l'interface au scroll) ; traîne et lancers en coordonnées écran (ils
  // suivent l'oiseau, qui vit en écran) ; pile ancrée au nid — donc au monde,
  // puisque le nid est recalé chaque frame sur le rect de #footer-perch.
  const eggs = [], trail = [], drops = [], pile = [], parts = [];
  let spawned = false, nestOn = false, dropTimer = 0, respawnAt = 0, fpEl = null;

  function burst(x, y, n, spread) {   // confettis pixel dorés & bleus, gravité + fade
    const acc = readAccent();
    for (let i = 0; i < n && parts.length < 220; i++) {
      const a = Math.random() * Math.PI * 2, sp = spread * (0.35 + Math.random());
      parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 70,
        life: 550 + Math.random() * 350, t: 0, s: SCALE * (Math.random() < 0.5 ? 1 : 2),
        col: Math.random() < 0.5 ? acc : EGG_GOLDS[(Math.random() * 3) | 0],
      });
    }
  }
  function spawnEggs() {   // EGG_N œufs posés SUR des surfaces perchables (base sur le bord haut),
    if (!fpEl) fpEl = document.querySelector('#footer-perch');   // pour que l'oiseau se pose puis saute
    queryPerchEls();
    const cands = [];                                // bords de perchoirs, en coordonnées DOCUMENT
    for (const p of perchEls) {
      if (p.el === fpEl) continue;                   // le R du footer est réservé au nid
      const r = p.el.getBoundingClientRect();
      if (r.width < MINPERCH || r.height < 16) continue;
      if (r.width >= W * 0.985 && r.height >= H * 0.9) continue;  // wrapper de page
      const l = Math.max(0, r.left) + EDGE, rr = Math.min(W, r.right) - EDGE;
      if (rr - l < EGG_W + 8) continue;
      cands.push({ l: l + scrollX, r: rr + scrollX, y: r.top + scrollY });
    }
    if (!cands.length) return;                       // aucun perchoir dispo -> pas d'œuf cette fournée
    for (let i = 0; i < EGG_N; i++) {
      let x = 0, y = 0, ok = false;
      for (let tr = 0; tr < 24 && !ok; tr++) {       // ponytail: 24 essais puis tant pis
        const c = cands[(Math.random() * cands.length) | 0];
        x = c.l + Math.random() * (c.r - c.l);
        y = c.y - EGG_H / 2;                          // base de l'œuf calée sur le bord du perchoir
        ok = Math.hypot(x - (bx + scrollX), y - (by + scrollY)) > 120;
        for (const e of eggs) if (Math.hypot(x - e.x, y - e.y) < 90) { ok = false; break; }
      }
      // hopAt : petit sursaut périodique — l'œuf a l'air vivant, donc ramassable
      eggs.push({ x, y, hopAt: performance.now() + 1500 + Math.random() * 4500 });
    }
  }
  function nestRect() {   // ancrage du nid : posé sur le R du footer (rect live -> suit le scroll)
    if (!fpEl) fpEl = document.querySelector('#footer-perch');
    if (!fpEl) return null;
    const r = fpEl.getBoundingClientRect();
    if (!r.width) return null;
    return { cx: Math.round((r.left + r.right) / 2), gy: Math.round(r.top) };
  }
  const slotBottom = (nr, n) => nr.gy + NEST_SC - n * PILE_STEP;  // bas de l'œuf de l'étage n (0 = au fond du panier)
  function drawEggB(cx2, bottomY, rot, sq) {  // œuf ancré par sa BASE : squash/rotation autour du point de contact
    ctx.save();
    ctx.translate(Math.round(cx2), Math.round(bottomY));
    if (rot) ctx.rotate(rot);
    if (sq !== 1) ctx.scale(2 - sq, sq);      // écrasé => élargi : volume conservé, cartoon
    ctx.drawImage(eggSpr, -EGG_W / 2, -EGG_H, EGG_W, EGG_H);
    ctx.restore();
  }

  function gameUpdate(t, dt) {
    if (!GAME || !eggSpr || !nestSpr) return;    // bake pas fini : le jeu attend son tour
    if (!spawned) { spawned = true; spawnEggs(); }

    // -- ramassage : UNIQUEMENT posé (il doit se poser sur le perchoir de l'œuf,
    // puis son saut de joie l'attrape). Pas d'attrape en vol.
    const bcy = groundY - (B.idle.rows * SCALE) / 2;
    if (state === 'ground') for (let i = eggs.length - 1; i >= 0; i--) {
      const e = eggs[i], ex = e.x - scrollX, ey = e.y - scrollY;
      if (ex < -40 || ex > W + 40 || ey < -40 || ey > H + 40) continue;  // hors écran : injouable
      if (Math.hypot(ex - bx, ey - bcy) > EGG_R) continue;
      eggs.splice(i, 1);
      trail.push({ x: ex, y: ey });
      burst(ex, ey, 16, 100);
      if (cheerPos < 0) { cheerPos = 0; cheerT = 0; }  // saut de joie sur place
    }

    // -- traîne façon Yoshi : chaque œuf suit le précédent (corde amortie).
    // La cible du maillon i est à TRAIL_GAP derrière le maillon i-1, dans SA
    // direction actuelle (+ léger affaissement) : le retard se propage le long
    // de la file -> l'ondulation serpentine. Le bob, lui, n'est que du dessin.
    let lx = bx - (facing ? 1 : -1) * 10, ly = bcy + 6;   // point de traction : derrière/sous l'oiseau
    const k = 1 - Math.exp(-dt * TRAIL_K);
    for (const e of trail) {
      const dx2 = e.x - lx, dy2 = e.y - ly, d = Math.hypot(dx2, dy2) || 1;
      e.x += (lx + (dx2 / d) * TRAIL_GAP - e.x) * k;
      e.y += (ly + (dy2 / d) * TRAIL_GAP + TRAIL_SAG - e.y) * k;
      lx = e.x; ly = e.y;
    }

    // -- dépôt : posé sur le R du footer, la traîne tombe dans le nid œuf par œuf
    const nr = nestRect();
    const onNest = state === 'ground' && fpEl && groundId === fpEl;
    if (onNest && !nestOn && nr) {   // le nid apparaît au premier perchage — et reste (la pile y est ancrée)
      nestOn = true;
      burst(nr.cx - NEST_W / 2, nr.gy, 10, 70); burst(nr.cx + NEST_W / 2, nr.gy, 10, 70);
    }
    if (onNest && trail.length) {
      dropTimer += dtms;
      if (dropTimer >= DROP_EVERY) {
        dropTimer = 0;
        const e = trail.shift();     // premier ramassé, premier tombé
        drops.push({ sx: e.x, sy: e.y, slot: pile.length + drops.length,
                     dx: ((Math.random() * 2 - 1) * 8) | 0, rot: (Math.random() * 2 - 1) * 0.22, t: 0 });
      }
    } else dropTimer = 0;

    // -- lancers en cours : arc parabolique vers leur étage de la pile
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]; d.t += dtms;
      if (d.t >= DROP_MS) {
        drops.splice(i, 1);
        pile.push({ slot: d.slot, dx: d.dx, rot: d.rot, at: t });   // at : départ du squash d'impact
        if (nr) burst(nr.cx + d.dx, slotBottom(nr, d.slot), 8, 60);
      }
    }

    // -- réapparition : traîne déposée et plus un œuf en jeu -> nouvelle fournée
    if (nestOn && !eggs.length && !trail.length && !drops.length) {
      if (!respawnAt) respawnAt = t + 900;
      else if (t >= respawnAt) { respawnAt = 0; spawnEggs(); }
    } else respawnAt = 0;

    // -- confettis : gravité + fade
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dtms;
      if (p.t >= p.life) { parts.splice(i, 1); continue; }
      p.vy += 620 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }

  function gameDrawUnder(t) {   // SOUS l'oiseau : le nid (il est assis dedans) + les œufs posés
    if (!GAME || !eggSpr || !nestSpr) return;
    const nr = nestOn ? nestRect() : null;
    if (nr) ctx.drawImage(nestSpr, nr.cx - NEST_W / 2, nr.gy - NEST_H / 2, NEST_W, NEST_H);  // nid DERRIÈRE l'oiseau
    for (const e of eggs) {
      const ex = e.x - scrollX, ey = e.y - scrollY;
      if (ex < -EGG_W || ex > W + EGG_W || ey < -EGG_H || ey > H + EGG_H) continue;
      let dy2 = 0;
      if (t >= e.hopAt) {
        const ht = t - e.hopAt;
        if (ht < 320) dy2 = -Math.sin((ht / 320) * Math.PI) * 5;
        else e.hopAt = t + 2500 + Math.random() * 4500;
      }
      drawEggB(ex, ey + EGG_H / 2 + dy2, 0, 1);
    }
  }

  function gameDrawOver(t) {    // SUR l'oiseau : pile, nid (il est assis dedans), lancers, traîne, confettis
    if (!GAME || !eggSpr || !nestSpr) return;
    const nr = nestOn ? nestRect() : null;
    // Pile DEVANT l'oiseau (z: nid < oiseau < œufs) : la tour lui pousse sous le
    // bec, il dépasse derrière. Elle monte étage par étage — et peut crever
    // l'écran, c'est le but.
    if (nr) for (const s of pile) {
      const b = slotBottom(nr, s.slot);
      if (b < -20 || b - EGG_H > H + 20) continue;
      const a = t - s.at, sq = a < 150 ? 0.68 + 0.32 * (a / 150) : 1;  // squash d'impact, 150 ms
      drawEggB(nr.cx + s.dx, b, s.rot, sq);
    }
    if (nr) for (const d of drops) {
      const p2 = Math.min(1, d.t / DROP_MS), e2 = p2 * p2 * (3 - 2 * p2);   // smoothstep
      const fromB = d.sy + EGG_H / 2, toB = slotBottom(nr, d.slot);
      drawEggB(d.sx + (nr.cx + d.dx - d.sx) * e2,
               fromB + (toB - fromB) * e2 - Math.sin(Math.PI * p2) * DROP_ARC,
               d.rot * p2, 1);
    }
    for (let i = 0; i < trail.length; i++) {   // bob déphasé par maillon : la file ondule
      const w = Math.sin(t / 150 + i * 0.85);
      drawEggB(trail[i].x, trail[i].y + EGG_H / 2 + w * 2.5, w * 0.09, 1);
    }
    for (const p of parts) {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.col;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
    ctx.globalAlpha = 1;
  }

  function smoothDamp(cur, tgt, vel, dt, smooth, maxspd) {
    const omega = 2 / smooth, x = omega * dt, exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = cur - tgt; const maxCh = maxspd * smooth;
    if (change > maxCh) change = maxCh; else if (change < -maxCh) change = -maxCh;
    const tgt2 = cur - change, temp = (vel + omega * change) * dt;
    vel = (vel - omega * temp) * exp; let out = tgt2 + (change + temp) * exp;
    if (((tgt - cur) > 0) === (out > tgt)) { out = tgt; vel = 0; }
    return [out, vel];
  }
  function groundForCursor(band) {  // perchoir visé par le curseur (ou null)
    let best = null, bestD = 0;
    for (const g of perches) {
      if (g.id !== BOTTOM && (tx < g.l || tx > g.r)) continue; // il faut surplomber le perchoir
      const d = Math.abs(ty - g.y);
      if (d < band && (!best || d < bestD)) { best = g; bestD = d; }
    }
    return best;
  }
  const seg = () => perches.find(p => p.id === groundId);
  function toAir() { state = 'air'; mode = 'fly'; by = groundY - flyCentToFeet; vx = vy = 0; cheerPos = -1; }
  function adv(fps, len) { ft += dtms; if (ft > 1000 / fps) { fi = (fi + 1) % len; ft = 0; } }

  function tick(t) {
    dtms = Math.min(40, t - last || 16); const dt = dtms / 1000; last = t;
    computePerches();                       // suit le scroll / resize / layout
    // #285 : en bas de page, on vise le R du footer au lieu du curseur -> l'oiseau
    // y vole, s'y pose et y reste (le repos idle/peck s'enclenche une fois posé).
    if (atBottom) {
      const fp = document.querySelector('#footer-perch');
      if (fp) { const r = fp.getBoundingClientRect(); tx = (r.left + r.right) / 2; ty = r.top; }
    }
    // jeu : un œuf visible à portée du curseur AIMANTE le curseur virtuel (on
    // récrit tx/ty, même astuce que le footer ci-dessus). L'oiseau vise alors
    // le perchoir de l'œuf et s'y POSE ; son saut de joie l'attrape ensuite.
    if (!atBottom && GAME && eggSpr) {
      const cx0 = tx, cy0 = ty; let bd = 120;   // distances mesurées depuis le vrai curseur
      for (const e of eggs) {
        const ex = e.x - scrollX, ey = e.y - scrollY;
        if (ex < 0 || ex > W || ey < 0 || ey > H) continue;
        const d = Math.hypot(ex - cx0, ey - cy0);
        if (d < bd) { bd = d; tx = ex; ty = ey; }
      }
    }
    const dx = tx - bx, prevby = by;

    if (state === 'takeoff') {
      const s0 = seg();
      if (!s0) toAir();                     // le perchoir a disparu sous lui
      else {
        groundY = s0.y;                     // collé au perchoir même s'il scrolle
        mode = 'hop'; hopIdx = TAKEOFF_SEQ[Math.min(seqPos, TAKEOFF_SEQ.length - 1)];
        seqTimer += dtms;
        if (seqTimer > 1000 / HOPFPS) {
          seqTimer = 0; seqPos++;
          if (seqPos >= TAKEOFF_SEQ.length) { // envol à l'apex du saut
            state = 'air'; mode = 'fly'; by = groundY - NYH * SCALE + APEXCY * SCALE; vx = vy = 0;
          }
        }
      }
    } else if (state === 'landing') {
      const s0 = seg();
      if (!s0) toAir();
      else {
        groundY = s0.y;
        mode = 'hop'; hopIdx = LAND_SEQ[Math.min(seqPos, LAND_SEQ.length - 1)];
        seqTimer += dtms;
        if (seqTimer > 1000 / HOPFPS) {
          seqTimer = 0; seqPos++;
          if (seqPos >= LAND_SEQ.length) { state = 'ground'; mode = 'idle'; fi = 0; restTimer = 1e9; }
        }
      }
    } else if (state === 'air') {
      const g = groundForCursor(LAND_BAND);  // œuf aimanté = perchoir visé : il s'y pose pour l'attraper
      let aimx = tx, aimy = ty;
      if (g) { aimx = Math.min(g.r - 2, Math.max(g.l + 2, tx)); aimy = g.y - flyCentToFeet; }
      const sm = g ? SMOOTH_LAND : SMOOTH, ms = g ? MAXSPD_LAND : MAXSPD;
      [bx, vx] = smoothDamp(bx, aimx, vx, dt, sm, ms);
      [by, vy] = smoothDamp(by, aimy, vy, dt, sm, ms);
      if (Math.abs(dx) > 2) facing = dx > 0 ? 1 : 0;
      if (g) {                              // fenêtre de contact symétrique
        const s = SPR.fly[facing][fi % SPR.fly[facing].length];
        const feetY = by + (s.foot - s.cy) * SCALE;
        if (Math.abs(feetY - g.y) <= LANDSNAP && bx >= g.l && bx <= g.r) {
          state = 'landing'; groundId = g.id; groundY = g.y; seqPos = 0; seqTimer = 0; walkVel = 0;
        }
      }
      mode = 'fly';
    } else {                                // ground
      const s0 = seg();
      if (!s0) toAir();                     // perchoir sorti de l'écran -> chute
      else if (t < holdUntil) {             // délai de départ (#266) : immobile en idle,
        groundY = s0.y;                     // le curseur n'existe pas encore pour lui
        walkVel = 0; mode = 'idle';
      } else if (cheerPos >= 0) {           // jeu : saut de joie sur place (œuf ramassé au sol)
        groundY = s0.y;                     // même séquence que le hop, mais sans décoller :
        walkVel = 0;                        // détente puis amorti, et retour à la vie normale
        mode = 'hop'; hopIdx = CHEER_SEQ[Math.min(cheerPos, CHEER_SEQ.length - 1)];
        cheerT += dtms;
        if (cheerT > 1000 / HOPFPS) {
          cheerT = 0; cheerPos++;
          if (cheerPos >= CHEER_SEQ.length) { cheerPos = -1; mode = 'idle'; fi = 0; restTimer = 0; }
        }
      } else {
        groundY = s0.y;
        const g2 = groundForCursor(TAKEOFF_BAND);
        if (!g2 || g2.id !== groundId) { // la souris vise ailleurs -> saut de décollage
          state = 'takeoff'; seqPos = 0; seqTimer = 0; facing = (tx - bx) > 0 ? 1 : 0;
        } else {
          const dxg = tx - bx;
          if (Math.abs(dxg) > STOPX) {      // marche le long du bord
            const targetV = Math.sign(dxg) * WALKMAX; walkVel += (targetV - walkVel) * WALKACC; bx += walkVel * dt;
            if (Math.abs(walkVel) > 4) facing = walkVel > 0 ? 1 : 0; mode = 'walk'; restTimer = 1e9;
          } else {                          // à l'arrêt : repos idle/peck toutes les 3 s
            walkVel = 0; restTimer += dtms;
            if (restTimer >= REST_GAP) {
              let ch = Math.random() < 0.5 ? 'idle' : 'peck';
              if (ch === lastRest && streak >= REST_MAXSTREAK) ch = (lastRest === 'idle' ? 'peck' : 'idle');
              streak = (ch === lastRest) ? streak + 1 : 1; lastRest = ch;
              restAnim = ch; restTimer = 0; restPlaying = true; fi = 0; ft = 0;
            }
            mode = restAnim;
          }
          if (s0.id !== BOTTOM && (bx < s0.l || bx > s0.r)) toAir(); // déborde du bord -> chute
        }
      }
    }

    vyS = vyS * 0.8 + (by - prevby) * 0.2;
    if (mode !== prevMode && mode !== 'hop') { fi = 0; ft = 0; } prevMode = mode;

    if (mode === 'fly') {
      if (vyS > 0.35) fi = 0;               // descente : plané, ailes ouvertes
      else { const climb = Math.max(0, -vyS); adv(Math.min(20, 7 + climb * 5), B.fly.frames.length); }
    } else if (mode === 'walk') {           // cadence liée à la vitesse : pas de patinage
      adv(Math.min(14, Math.max(3, Math.abs(walkVel) * 0.06)), B.walk.frames.length);
    } else if (mode === 'idle' || mode === 'peck') { // un cycle, puis figé sur la pose
      if (restPlaying) {
        ft += dtms;
        if (ft > 1000 / B[mode].fps) { fi++; ft = 0; if (fi >= B[mode].frames.length) { fi = 0; restPlaying = false; } }
      } else fi = 0;
    }

    gameUpdate(t, dt);                      // jeu : ramassage, traîne, dépôt, confettis
    ctx.clearRect(0, 0, W, H);
    gameDrawUnder(t);                       // œufs posés + pile du nid, sous l'oiseau
    let s, px, py;
    if (mode === 'hop') {                   // ancré au sol, grille hop pleine hauteur
      s = SPR.hop[facing][hopIdx]; px = Math.round(bx - s.cx * SCALE); py = Math.round(groundY - NYH * SCALE);
    } else {
      const arr = SPR[mode][facing]; s = arr[fi % arr.length]; px = Math.round(bx - s.cx * SCALE);
      py = Math.round(state === 'air' ? by - s.cy * SCALE : groundY - s.R * SCALE); // centroïde en vol, pied au sol
    }
    ctx.drawImage(s.img, px, py, s.C * SCALE, s.R * SCALE);
    gameDrawOver(t);                        // nid (l'oiseau est dedans), lancers, traîne, confettis
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return {
    canvas: cv,
    refresh() { queryPerchEls(); },         // à appeler si le DOM change beaucoup
    destroy() {
      cancelAnimationFrame(raf); clearInterval(requery);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onMove);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onResize);
      if (themeObs) themeObs.disconnect();
      if (mqTheme) mqTheme.removeEventListener('change', rebakeTheme);
      cv.remove();
    },
  };
}
