/*!
 * roadmapped-bird.js — la mascotte de roadmapped.work
 * Un oiseau pixel-art qui suit le curseur et se pose sur le bord supérieur
 * des éléments marqués [data-bird-perch] (et sur le bas de la fenêtre).
 * ESM autonome : zéro dépendance, zéro asset externe (frames embarquées).
 *
 *   import { initBird } from './roadmapped-bird.js';
 *   const bird = initBird();   // options : voir README / signature ci-dessous
 *   bird.destroy();            // retire l'oiseau et tous ses listeners
 */

const SPRITES = {"meta":{"facing":"left","palette":{"KK":"#0F1225","WW":"#DCE2E8","mm":"#C6CCD4","OR":"#EA6200"},"empty":"..","note":"Chaque anim porte ses propres dimensions (cols/rows) : le lecteur les lit par-anim. Chaque frame est une grille de codes 2 chars separes par espaces. Rendu: cellules pleines, nearest-neighbor, aucun transform."},"anims":{"idle":{"fps":6,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK mm KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. WW","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW ..",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. WW .."]]},"walk":{"fps":8,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. WW WW ..",".. .. .. .. OR .. .. .. OR .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. WW .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR .. OR .. .. .. .. .. .. ..",".. .. .. .. .. .. OR .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. OR .. OR .. .. .. .. WW WW ..",".. .. .. .. .. OR .. .. OR .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. WW .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. OR .. .. .. .. .. .. .. .."]]},"fly":{"fps":10,"cols":18,"rows":10,"ground":false,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..","WW .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. WW ..","WW .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. WW ..",".. WW WW WW .. .. .. .. .. .. .. .. .. WW WW WW .. ..",".. .. WW WW KK KK WW .. .. .. WW WW WW WW WW .. .. ..",".. .. .. KK KK KK KK WW WW WW WW WW mm .. .. .. WW WW",".. .. OR OR OR WW WW KK WW mm mm WW WW WW WW WW .. ..",".. .. .. .. .. .. .. mm WW WW WW mm mm mm .. .. .. ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. WW WW mm KK KK WW .. .. .. .. .. .. mm WW WW WW ..","WW .. .. KK KK KK KK WW WW WW WW WW mm .. .. .. .. WW",".. .. OR OR OR WW WW KK WW mm mm WW WW WW WW WW .. ..",".. .. .. .. .. .. .. mm WW WW WW mm mm mm .. .. .. ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. KK KK .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. KK KK KK KK WW WW WW WW mm mm .. .. .. ..","WW .. .. OR OR OR WW WW WW mm mm WW WW WW WW .. .. WW",".. WW mm mm .. .. .. mm WW WW WW mm mm mm .. WW WW ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. WW WW mm mm KK KK .. .. .. .. .. .. mm WW WW WW ..","WW .. .. .. KK KK KK KK WW WW WW WW mm .. .. .. .. WW",".. .. .. OR OR OR WW WW WW mm mm WW WW WW WW WW .. ..",".. .. .. .. .. .. .. mm WW WW WW mm mm mm .. .. .. ..",".. .. .. .. .. .. .. .. mm mm mm .. OR OR .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."]]},"peck":{"fps":8,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW WW .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW mm WW .. .. .. ..",".. .. .. .. mm WW WW WW mm mm .. mm WW .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. .. WW WW ..",".. .. .. .. .. .. mm .. WW .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. WW WW .. .. ..",".. .. .. .. .. .. .. .. .. mm WW WW .. .. .. ..",".. .. .. .. .. mm mm WW WW WW mm .. .. .. .. ..",".. .. KK KK WW WW WW WW WW mm .. .. .. .. .. ..",".. KK KK WW WW WW WW WW mm .. .. .. .. .. .. ..",".. KK OR WW mm mm mm WW .. .. .. .. .. .. .. ..",".. OR .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW WW .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW mm WW .. .. .. ..",".. .. .. .. mm WW WW WW mm mm .. mm WW .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. .. WW WW ..",".. .. .. .. .. .. mm .. WW .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. WW WW .. .. ..",".. .. .. .. .. .. .. .. .. mm WW WW .. .. .. ..",".. .. .. .. .. mm mm WW WW WW mm .. .. .. .. ..",".. .. KK KK WW WW WW WW WW mm .. .. .. .. .. ..",".. KK KK WW WW WW WW WW mm .. .. .. .. .. .. ..",".. KK OR WW mm mm mm WW .. .. .. .. .. .. .. ..",".. OR .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW WW","OR OR OR WW WW KK WW WW WW WW WW .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW mm WW .. .. .. ..",".. .. .. .. mm WW WW WW mm mm .. mm WW .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. .. WW WW ..",".. .. .. .. .. .. mm .. WW .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."]]},"hop":{"fps":10,"cols":16,"rows":12,"ground":true,"frames":[[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. WW ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW ..","OR OR OR WW WW KK .. .. .. .. .. .. .. WW .. ..",".. .. .. WW mm mm WW WW WW WW .. .. WW .. .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm mm .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. WW WW WW ..",".. .. .. .. .. OR mm OR WW .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR .. OR .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR OR .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. .. ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. .. ..","OR OR OR WW WW KK .. .. .. .. .. .. .. .. WW WW",".. .. .. WW mm mm WW WW WW WW .. .. WW WW .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm WW .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. mm WW .. .. ..",".. .. .. .. .. .. mm .. WW .. .. .. .. WW WW ..",".. .. .. .. .. .. OR .. OR .. .. .. .. .. .. ..",".. .. .. .. .. OR .. OR .. .. .. .. .. .. .. .."],[".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. .. .. .. .. .. .. .. .. .. .. .. .. .. ..",".. .. KK KK .. .. .. .. .. .. .. .. .. .. WW ..",".. KK KK KK KK .. .. .. .. .. .. .. .. .. WW ..","OR OR OR WW WW KK .. .. .. .. .. .. .. WW .. ..",".. .. .. WW mm mm WW WW WW WW .. .. WW .. .. ..",".. .. .. mm WW WW WW WW WW WW WW mm .. .. .. ..",".. .. .. .. mm WW WW WW mm mm mm mm .. .. .. ..",".. .. .. .. .. mm mm mm WW mm .. .. WW WW WW ..",".. .. .. .. .. OR mm OR WW .. .. .. .. .. .. .."]]}}};

export function initBird(userOptions = {}) {
  const o = Object.assign({
    selector: '[data-bird-perch]',                    // perchoirs marqués (de confiance)
    fallbackSelector: 'section, article, [class*="card"]', // auto-détection, AJOUTÉE aux marqués
    scale: 3,                                         // taille du pixel
    zIndex: 2147482000,                               // au-dessus de tout
    frames: null,        // objet au format frames.json ({meta,anims}) ou à plat
    palette: null,       // override partiel, ex. {KK:'#141A30'} pour fond sombre
    reducedMotion: null, // true/false pour forcer ; null = media query
  }, userOptions);

  // ---- données sprites ------------------------------------------------------
  const RAW = o.frames || SPRITES;
  const B = RAW.anims ? Object.assign({ palette: (RAW.meta || {}).palette }, RAW.anims) : RAW;
  const PAL = Object.assign({}, B.palette, o.palette || {});
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
  const SPR = {}; for (const k of ['fly', 'walk', 'idle', 'peck', 'hop']) SPR[k] = [bake(B[k], 0), bake(B[k], 1)];
  const FLY0 = SPR.fly[0][0], flyCentToFeet = (FLY0.foot - FLY0.cy) * SCALE;
  const APEXCY = SPR.hop[0][TAKEOFF_SEQ[TAKEOFF_SEQ.length - 1]].cy; // corps à l'apex du saut

  // ---- prefers-reduced-motion : posé, calme, pas de poursuite ----------------
  if (reduce) {
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const s = SPR.idle[0][0];
      ctx.drawImage(s.img, Math.round(W * 0.82 - s.cx * SCALE), H - s.R * SCALE, s.C * SCALE, s.R * SCALE);
    };
    const onR = () => { resize(); draw(); };
    addEventListener('resize', onR);
    draw();
    return { canvas: cv, refresh: draw, destroy() { removeEventListener('resize', onR); cv.remove(); } };
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
  let bx = W * 0.5, by = -B.fly.rows * SCALE * 2, vx = 0, vy = 0; // il entre par le haut
  let tx = W * 0.5, ty = H - 24;                                  // et va se poser en bas
  let facing = 0, fi = 0, ft = 0, last = 0, vyS = 0, mode = 'fly', prevMode = 'fly', walkVel = 0;
  let seqPos = 0, seqTimer = 0, hopIdx = 0;
  let restAnim = 'idle', restTimer = 1e9, restPlaying = false, lastRest = '', streak = 0;
  let dtms = 16, raf = 0;

  const onMove = e => { tx = e.clientX; ty = e.clientY; };
  const onResize = () => { resize(); queryPerchEls(); };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', onMove, { passive: true });
  addEventListener('resize', onResize);
  const requery = setInterval(queryPerchEls, 2000);  // le DOM peut changer après coup

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
  function toAir() { state = 'air'; mode = 'fly'; by = groundY - flyCentToFeet; vx = vy = 0; }
  function adv(fps, len) { ft += dtms; if (ft > 1000 / fps) { fi = (fi + 1) % len; ft = 0; } }

  function tick(t) {
    dtms = Math.min(40, t - last || 16); const dt = dtms / 1000; last = t;
    computePerches();                       // suit le scroll / resize / layout
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
      const g = groundForCursor(LAND_BAND);
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
      else {
        groundY = s0.y;
        const g2 = groundForCursor(TAKEOFF_BAND);
        if (!g2 || g2.id !== groundId) {    // la souris vise ailleurs -> saut de décollage
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

    ctx.clearRect(0, 0, W, H);
    let s, px, py;
    if (mode === 'hop') {                   // ancré au sol, grille hop pleine hauteur
      s = SPR.hop[facing][hopIdx]; px = Math.round(bx - s.cx * SCALE); py = Math.round(groundY - NYH * SCALE);
    } else {
      const arr = SPR[mode][facing]; s = arr[fi % arr.length]; px = Math.round(bx - s.cx * SCALE);
      py = Math.round(state === 'air' ? by - s.cy * SCALE : groundY - s.R * SCALE); // centroïde en vol, pied au sol
    }
    ctx.drawImage(s.img, px, py, s.C * SCALE, s.R * SCALE);
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
      removeEventListener('resize', onResize);
      cv.remove();
    },
  };
}
