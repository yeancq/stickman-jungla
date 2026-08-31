import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";

const ABILITIES = {
  viento: { price: 0, name: "Racha", accent: "#3B7FA8", cd: 3.5, dur: 1.6, tag: "Velocidad", desc: "Deja una estela de viento y esquiva al monstruo en línea recta.", stat: "Dash x2.1 · recarga 3.5s" },
  sigilo: { price: 35, name: "Bruma", accent: "#7A5EA8", cd: 5.5, dur: 2.6, tag: "Sigilo", desc: "Se vuelve casi transparente; el monstruo pierde el rastro.", stat: "2.6s invisible · recarga 5.5s" },
  tiempo: { price: 45, name: "Tiempo", accent: "#3FA089", cd: 6, dur: 3, tag: "Congelar", desc: "Lanza un reloj verde que detiene el tiempo para todos unos segundos.", stat: "Congela 3s · recarga 6s" },
  clon: { price: 45, name: "Clon", accent: "#9B4F96", cd: 8, dur: 6, tag: "Señuelo", desc: "Deja un doble; si el monstruo te atrapa mientras dura, el clon se sacrifica y no perdés vidas.", stat: "Dura 6s · recarga 8s" },
  fase: { price: 35, name: "Fase", accent: "#2E93A6", cd: 4.5, dur: 0, tag: "Teletransporte", desc: "Te mueve varios pasos hacia adelante, atravesando cualquier pared en el camino.", stat: "~120px · recarga 4.5s" },
  electrico: { price: 40, name: "Descarga", accent: "#C9A227", cd: 5.5, dur: 0, tag: "Aturdimiento", desc: "Lanza un rayo amarillo que paraliza al monstruo un rato al impactar.", stat: "Paraliza ~2.6s · recarga 5.5s" },
  fuego: { price: 35, name: "Brasa", accent: "#E8460F", cd: 5, dur: 2.2, tag: "Fuego", desc: "Deja un rastro de llamas vivas que queman al monstruo si se acerca.", stat: "2.2s de rastro · recarga 5s" },
  mutar: { price: 45, name: "Mutar", accent: "#4C9A2A", cd: 6, dur: 3, tag: "Veneno", desc: "Le crece una cola y corre a cuatro patas; lanza gas verde que paraliza al monstruo.", stat: "Paraliza ~2.9s · recarga 6s" },
  roquero: { price: 40, name: "Roquero", accent: "#D6336C", cd: 6, dur: 3.2, tag: "Baile", desc: "Lleva una guitarra eléctrica y lanza notas que ponen a bailar al monstruo.", stat: "Baila 3.2s · recarga 6s" },
  laser: { price: 60, name: "Láser", accent: "#E63946", cd: 7, dur: 0, tag: "Demolición", desc: "Dispara un láser desde la cabeza que rompe la primera pared que encuentra.", stat: "Rompe 1 pared · recarga 7s" },
  sierra: { price: 45, name: "Sierra", accent: "#7C868D", cd: 8, dur: 4, tag: "Escudo", desc: "Dos sierras te rodean y te protegen de todo; si tocás un animal con ellas activas, desaparece.", stat: "Escudo 4s · recarga 8s" },
  tornado: { price: 50, name: "Tornado", accent: "#5C8AA6", cd: 9, dur: 1.2, tag: "Torbellino", desc: "Giras y un tornado te arrastra a gran velocidad; lanza otro en sentido contrario que se lleva al monstruo si lo toca.", stat: "1.2s de impulso · recarga 9s" },
  ladron: { price: 40, name: "Ladrón", accent: "#B8860B", cd: 7, dur: 0, tag: "Robo", desc: "Lanza un gancho que le roba una vida al monstruo; esa vida pasa a ser tuya.", stat: "Roba 1 vida · recarga 7s" },
};

const VIEW_W = 640, VIEW_H = 420;
const WORLD_W = 1700, WORLD_H = 420;

const BORDER_WALLS = [
  { x: 0, y: 0, w: WORLD_W, h: 14 },
  { x: 0, y: WORLD_H - 14, w: WORLD_W, h: 14 },
  { x: 0, y: 0, w: 14, h: WORLD_H },
];

const LEVELS = [
  {
    obstacles: [
      { x: 220, y: 60, w: 130, h: 24 },
      { x: 220, y: 60, w: 24, h: 150 },
      { x: 420, y: 180, w: 110, h: 22 },
      { x: 420, y: 180, w: 22, h: 140 },
      { x: 90, y: 260, w: 140, h: 22 },
      { x: 650, y: 80, w: 150, h: 22 },
      { x: 650, y: 80, w: 22, h: 160 },
      { x: 850, y: 240, w: 130, h: 22 },
      { x: 958, y: 240, w: 22, h: 150 },
      { x: 1080, y: 70, w: 22, h: 180 },
      { x: 1200, y: 260, w: 160, h: 22 },
      { x: 1360, y: 60, w: 22, h: 170 },
      { x: 1460, y: 280, w: 140, h: 22 },
    ],
    puddles: [
      { x: 300, y: 330, r: 32 },
      { x: 560, y: 110, r: 28 },
      { x: 760, y: 330, r: 34 },
      { x: 1000, y: 120, r: 30 },
      { x: 1150, y: 340, r: 30 },
      { x: 1420, y: 150, r: 32 },
    ],
    spikes: [],
    start: { x: 55, y: 60 },
    monsterStart: { x: 320, y: 340 },
    theme: "jungle",
    animals: [
      { x: 480, y: 386 },
      { x: 900, y: 34 },
      { x: 1350, y: 386 },
    ],
  },
  {
    obstacles: [
      { x: 180, y: 230, w: 24, h: 176 },
      { x: 180, y: 230, w: 160, h: 24 },
      { x: 420, y: 50, w: 24, h: 170 },
      { x: 420, y: 196, w: 150, h: 24 },
      { x: 660, y: 280, w: 170, h: 24 },
      { x: 820, y: 70, w: 24, h: 210 },
      { x: 1000, y: 50, w: 160, h: 24 },
      { x: 1160, y: 210, w: 24, h: 196 },
      { x: 1320, y: 70, w: 170, h: 24 },
      { x: 1540, y: 210, w: 24, h: 196 },
    ],
    puddles: [
      { x: 340, y: 340, r: 30 },
      { x: 600, y: 110, r: 30 },
      { x: 900, y: 330, r: 34 },
      { x: 1120, y: 110, r: 28 },
      { x: 1400, y: 330, r: 32 },
    ],
    spikes: [
      { x: 260, y: 60, w: 70, h: 16 },
      { x: 560, y: 344, w: 80, h: 16 },
      { x: 960, y: 60, w: 70, h: 16 },
      { x: 1250, y: 344, w: 80, h: 16 },
      { x: 1580, y: 60, w: 60, h: 16 },
    ],
    start: { x: 55, y: 210 },
    monsterStart: { x: 400, y: 60 },
    theme: "jungle",
    animals: [
      { x: 500, y: 34 },
      { x: 900, y: 386 },
      { x: 1300, y: 34 },
    ],
  },
  {
    obstacles: [
      { x: 140, y: 60, w: 24, h: 180 },
      { x: 140, y: 60, w: 170, h: 24 },
      { x: 380, y: 220, w: 24, h: 186 },
      { x: 380, y: 220, w: 150, h: 24 },
      { x: 620, y: 50, w: 24, h: 170 },
      { x: 620, y: 196, w: 160, h: 24 },
      { x: 880, y: 260, w: 180, h: 24 },
      { x: 1060, y: 70, w: 24, h: 200 },
      { x: 1240, y: 50, w: 170, h: 24 },
      { x: 1420, y: 210, w: 24, h: 196 },
      { x: 1580, y: 70, w: 24, h: 150 },
    ],
    puddles: [
      { x: 300, y: 340, r: 32 },
      { x: 560, y: 120, r: 30 },
      { x: 820, y: 340, r: 34 },
      { x: 1140, y: 120, r: 30 },
      { x: 1500, y: 340, r: 32 },
    ],
    spikes: [
      { x: 220, y: 344, w: 80, h: 16 },
      { x: 480, y: 60, w: 70, h: 16 },
      { x: 740, y: 344, w: 80, h: 16 },
      { x: 1000, y: 60, w: 70, h: 16 },
      { x: 1320, y: 344, w: 80, h: 16 },
      { x: 1560, y: 60, w: 60, h: 16 },
    ],
    start: { x: 55, y: 340 },
    monsterStart: { x: 420, y: 70 },
    theme: "jungle",
    animals: [
      { x: 260, y: 386 },
      { x: 700, y: 34 },
      { x: 1100, y: 386 },
      { x: 1500, y: 34 },
    ],
  },
  {
    obstacles: [
      { x: 200, y: 60, w: 24, h: 190 },
      { x: 200, y: 226, w: 150, h: 24 },
      { x: 440, y: 240, w: 24, h: 166 },
      { x: 440, y: 60, w: 160, h: 24 },
      { x: 700, y: 60, w: 24, h: 210 },
      { x: 860, y: 250, w: 170, h: 24 },
      { x: 1030, y: 60, w: 24, h: 200 },
      { x: 1200, y: 230, w: 24, h: 176 },
      { x: 1200, y: 230, w: 160, h: 24 },
      { x: 1440, y: 60, w: 24, h: 190 },
      { x: 1580, y: 240, w: 24, h: 166 },
    ],
    puddles: [
      { x: 330, y: 120, r: 30 },
      { x: 600, y: 340, r: 32 },
      { x: 900, y: 120, r: 30 },
      { x: 1150, y: 340, r: 34 },
      { x: 1500, y: 130, r: 30 },
    ],
    spikes: [
      { x: 300, y: 344, w: 70, h: 16 },
      { x: 620, y: 60, w: 80, h: 16 },
      { x: 940, y: 344, w: 70, h: 16 },
      { x: 1260, y: 60, w: 80, h: 16 },
      { x: 1520, y: 344, w: 60, h: 16 },
    ],
    start: { x: 55, y: 60 },
    monsterStart: { x: 460, y: 340 },
    theme: "jungle",
    animals: [
      { x: 380, y: 34 },
      { x: 780, y: 386 },
      { x: 1180, y: 34 },
      { x: 1520, y: 386 },
    ],
  },
  {
    obstacles: [
      { x: 210, y: 220, w: 160, h: 24 },
      { x: 210, y: 220, w: 24, h: 166 },
      { x: 460, y: 60, w: 24, h: 190 },
      { x: 460, y: 60, w: 150, h: 24 },
      { x: 710, y: 240, w: 24, h: 166 },
      { x: 850, y: 240, w: 160, h: 24 },
      { x: 1040, y: 60, w: 24, h: 200 },
      { x: 1200, y: 60, w: 160, h: 24 },
      { x: 1420, y: 220, w: 24, h: 186 },
      { x: 1560, y: 60, w: 24, h: 170 },
    ],
    puddles: [
      { x: 320, y: 340, r: 30 },
      { x: 620, y: 120, r: 32 },
      { x: 940, y: 340, r: 30 },
      { x: 1280, y: 130, r: 32 },
      { x: 1540, y: 330, r: 28 },
    ],
    spikes: [
      { x: 260, y: 60, w: 70, h: 16 },
      { x: 600, y: 344, w: 80, h: 16 },
      { x: 980, y: 60, w: 70, h: 16 },
      { x: 1340, y: 344, w: 70, h: 16 },
    ],
    start: { x: 55, y: 340 },
    monsterStart: { x: 480, y: 60 },
    theme: "snow",
    animals: [
      { x: 340, y: 34 },
      { x: 780, y: 386 },
      { x: 1130, y: 34 },
      { x: 1500, y: 386 },
    ],
  },
];

const EXIT = { x: WORLD_W - 14, y: WORLD_H / 2 - 45, w: 14, h: 90 };
const PLAYER_R = 12, MONSTER_R = 16;
const SUPER_HOLD = 0.9;
const PUDDLE_SLOW = 0.42;

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rngFoliage = mulberry32(1337);
const JUNGLE_FOLIAGE = Array.from({ length: 55 }, () => ({
  x: rngFoliage() * WORLD_W,
  y: rngFoliage() * WORLD_H,
  r: 14 + rngFoliage() * 22,
  shade: rngFoliage(),
}));
const JUNGLE_VINES = Array.from({ length: 14 }, () => ({
  x: rngFoliage() * WORLD_W,
  len: 40 + rngFoliage() * 70,
  sway: rngFoliage() * Math.PI * 2,
}));
const JUNGLE_TREES = Array.from({ length: 16 }, () => ({
  x: rngFoliage() * WORLD_W,
  trunkH: 34 + rngFoliage() * 20,
  canopyR: 22 + rngFoliage() * 16,
  shade: rngFoliage(),
  lean: (rngFoliage() - 0.5) * 0.2,
}));

const rngSnow = mulberry32(9001);
const SNOWFLAKES = Array.from({ length: 90 }, () => ({
  x: rngSnow() * WORLD_W,
  y: rngSnow() * WORLD_H,
  r: 1.5 + rngSnow() * 2.5,
  speed: 10 + rngSnow() * 18,
  drift: rngSnow() * Math.PI * 2,
}));
const SNOW_DRIFTS = Array.from({ length: 30 }, () => ({
  x: rngSnow() * WORLD_W,
  y: rngSnow() * WORLD_H,
  r: 16 + rngSnow() * 26,
}));

const rngMountain = mulberry32(4242);
const MOUNTAIN_PEAKS = Array.from({ length: 10 }, (_, i) => ({
  x: (i / 10) * WORLD_W + rngMountain() * 120,
  h: 60 + rngMountain() * 90,
  w: 140 + rngMountain() * 100,
  shade: rngMountain(),
}));
const MOUNTAIN_ROCKS = Array.from({ length: 26 }, () => ({
  x: rngMountain() * WORLD_W,
  y: rngMountain() * WORLD_H,
  r: 8 + rngMountain() * 16,
}));

const rngSpace = mulberry32(77007);
const STARS = Array.from({ length: 140 }, () => ({
  x: rngSpace() * WORLD_W,
  y: rngSpace() * WORLD_H,
  r: 0.6 + rngSpace() * 1.6,
  tw: rngSpace() * Math.PI * 2,
}));
const PLANETS = Array.from({ length: 6 }, () => ({
  x: rngSpace() * WORLD_W,
  y: 30 + rngSpace() * 120,
  r: 14 + rngSpace() * 20,
  hue: rngSpace(),
  ring: rngSpace() > 0.5,
}));

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function circleRectPush(c, r, rect) {
  const cx = Math.max(rect.x, Math.min(c.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(c.y, rect.y + rect.h));
  const dx = c.x - cx, dy = c.y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < r && dist > 0.001) {
    const push = r - dist;
    c.x += (dx / dist) * push;
    c.y += (dy / dist) * push;
  } else if (dist <= 0.001) {
    c.y -= r;
  }
}
function inPuddle(pt, puddles) {
  return puddles.some((p) => Math.hypot(pt.x - p.x, pt.y - p.y) < p.r);
}

// --- navigation grid so the monster can path around walls instead of getting stuck ---
const GRID = 16;
const COLS = Math.ceil(WORLD_W / GRID);
const ROWS = Math.ceil(WORLD_H / GRID);
function computeBlockedGrid(wallsList) {
  const arr = new Uint8Array(COLS * ROWS);
  for (let cy = 0; cy < ROWS; cy++) {
    for (let cx = 0; cx < COLS; cx++) {
      const cellRect = { x: cx * GRID, y: cy * GRID, w: GRID, h: GRID };
      if (wallsList.some((wl) => rectsOverlap(cellRect, wl))) arr[cy * COLS + cx] = 1;
    }
  }
  return arr;
}
const BLOCKED = computeBlockedGrid(BORDER_WALLS);
function isBlocked(cx, cy, grid) {
  if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return true;
  return grid[cy * COLS + cx] === 1;
}
function worldToCell(x, y) {
  return { cx: Math.max(0, Math.min(COLS - 1, Math.floor(x / GRID))), cy: Math.max(0, Math.min(ROWS - 1, Math.floor(y / GRID))) };
}
function cellCenter(cx, cy) {
  return { x: cx * GRID + GRID / 2, y: cy * GRID + GRID / 2 };
}
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function bfsPath(start, goal, grid) {
  if (isBlocked(goal.cx, goal.cy, grid)) return null;
  const startIdx = start.cy * COLS + start.cx;
  const goalIdx = goal.cy * COLS + goal.cx;
  if (startIdx === goalIdx) return [start];
  const visited = new Int32Array(COLS * ROWS).fill(-1);
  visited[startIdx] = startIdx;
  const queue = [start];
  let qi = 0;
  let found = false;
  while (qi < queue.length) {
    const cur = queue[qi++];
    const curIdx = cur.cy * COLS + cur.cx;
    if (cur.cx === goal.cx && cur.cy === goal.cy) { found = true; break; }
    for (const [dx, dy] of DIRS) {
      const ncx = cur.cx + dx, ncy = cur.cy + dy;
      if (isBlocked(ncx, ncy, grid)) continue;
      if (dx !== 0 && dy !== 0 && (isBlocked(cur.cx + dx, cur.cy, grid) || isBlocked(cur.cx, cur.cy + dy, grid))) continue;
      const nIdx = ncy * COLS + ncx;
      if (visited[nIdx] !== -1) continue;
      visited[nIdx] = curIdx;
      queue.push({ cx: ncx, cy: ncy });
    }
    if (queue.length > 4000) break;
  }
  if (!found) return null;
  const path = [];
  let curIdx = goal.cy * COLS + goal.cx;
  let guard = 0;
  while (curIdx !== visited[curIdx] && guard++ < 4000) {
    path.push({ cx: curIdx % COLS, cy: Math.floor(curIdx / COLS) });
    curIdx = visited[curIdx];
  }
  path.push(start);
  path.reverse();
  return path;
}

function coinsForWalls(obstacles) {
  const coins = [];
  obstacles.forEach((wl, i) => {
    const corners = [
      { x: wl.x - 16, y: wl.y - 16 },
      { x: wl.x + wl.w + 16, y: wl.y + wl.h + 16 },
    ];
    corners.forEach((c) => {
      coins.push({
        x: Math.max(24, Math.min(WORLD_W - 24, c.x)),
        y: Math.max(24, Math.min(WORLD_H - 24, c.y)),
      });
    });
  });
  return coins;
}

function buildLevel(idx) {
  const lvl = LEVELS[idx % LEVELS.length];
  const walls = [...BORDER_WALLS, ...lvl.obstacles];
  return {
    walls,
    puddles: lvl.puddles,
    spikes: lvl.spikes,
    start: lvl.start,
    monsterStart: lvl.monsterStart,
    theme: idx >= 29 ? "universe" : idx >= 9 ? "mountain" : idx >= 4 ? "snow" : lvl.theme,
    animals: lvl.animals,
    coins: coinsForWalls(lvl.obstacles),
    grid: computeBlockedGrid(walls),
  };
}

// the monster's base speed across the whole run: ramps up through the early
// levels, eases off through the teens/twenties, surges again from level 30
// to 50, then gradually calms back down for good after that
function monsterBaseSpeedForLevel(idx) {
  if (idx <= 8) return 88 + idx * 16; // levels 1-9: ramp up
  if (idx <= 28) {
    const t = (idx - 9) / (28 - 9);
    return 232 - t * 152; // levels 10-29: ease down (232 -> 80)
  }
  if (idx <= 48) {
    const t = (idx - 29) / (48 - 29);
    return 80 + t * 180; // levels 30-49: speed back up (80 -> 260)
  }
  const t = Math.min((idx - 49) / 20, 1);
  return Math.max(70, 260 - t * 150); // level 50+: ease off again (260 -> 110)
}

function makeClone(x, y, facing, permanent) {
  return {
    x, y, facing,
    permanent: !!permanent,
    path: [],
    pathIdx: 1,
    repathT: 0,
    fireCD: 3 + Math.random() * 2.5,
    fireball: null,
    lungeCD: 5 + Math.random() * 2.5,
    lungeTelegraph: 0,
    lungeT: 0,
    stunT: 0,
  };
}

function damageMonster(s) {
  if (s.monsterDefeated || s.monsterLives <= 0) return;
  s.monsterLives -= 1;
  if (s.monsterLives <= 0) {
    s.monsterDefeated = true;
    s.defeatFx = { x: s.monster.x, y: s.monster.y, t: 0.9 };
    const cx = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x - 20));
    const cy1 = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y - 16));
    const cy2 = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + 16));
    if (s.cloneMonsters.length === 0) {
      s.cloneMonsters = [
        makeClone(cx, cy1, s.monsterFacing, true),
        makeClone(cx, cy2, s.monsterFacing, true),
      ];
    } else {
      s.cloneMonsters.forEach((c) => (c.permanent = true));
    }
  }
}

function freshState(levelIdx, playerColor, characterKind) {
  const lvl = buildLevel(levelIdx);
  return {
    player: { ...lvl.start },
    monster: { ...lvl.monsterStart },
    playerColor: playerColor || "#2B2A28",
    characterKind: characterKind || "stickman",
    facing: { x: 1, y: 0 },
    monsterFacing: 0,
    moving: false,
    status: "playing",
    lives: 3,
    invuln: 1.2,
    dashT: 0,
    cd: 0,
    cd2: 0,
    activeEffectT: 0,
    activeEffectAbility: null,
    web: null,
    gas: null,
    projectile: null,
    spark: null,
    clonePos: null,
    cloneVanish: null,
    teleportFx: null,
    teleportGrace: 0,
    stunT: 0,
    danceT: 0,
    notesFx: null,
    destroyedWalls: new Set(),
    blockedGrid: lvl.grid,
    laserFx: null,
    wallBreakFx: null,
    monsterFireCD: Math.max(1.5, 3 + Math.random() * 2 - levelIdx * 0.6),
    monsterFireball: null,
    fireballBurst: null,
    monsterLungeCD: Math.max(2, 4.5 + Math.random() * 2 - levelIdx * 0.9),
    monsterLungeTelegraph: 0,
    monsterLungeT: 0,
    monsterLives: 5,
    monsterDefeated: false,
    defeatFx: null,
    stealFx: null,
    sierraHitApplied: false,
    vientoAura: null,
    cloneMonsters: [],
    tripleCD: Math.max(5, 6.5 + Math.random() * 2 - levelIdx * 1.5),
    tripleT: 0,
    tripleFx: null,
    tornadoT: 0,
    tornadoProj: null,
    tornadoBurst: null,
    chargeT: 0,
    superCD: 0,
    superFx: null,
    chargeT2: 0,
    superCD2: 0,
    prevSecondaryPhysical: false,
    energy: 100,
    // super-ability mechanics
    slowAura: null,
    phaseThroughT: 0,
    timeRushT: 0,
    clockProj: null,
    freezeT: 0,
    decoyClones: [],
    electricWall: null,
    burningWalls: [],
    vineWalls: [],
    shockwaveFx: null,
    laserStormT: 0,
    laserStormTick: 0,
    sawProjectiles: [],
    tornadoProjs: [],
    time: 0,
    level: levelIdx,
    levelWalls: lvl.walls,
    levelPuddles: lvl.puddles,
    levelSpikes: lvl.spikes,
    levelTheme: lvl.theme,
    levelAnimals: lvl.animals.map((a) => ({ ...a, cd: 1.5 + Math.random() * 2 })),
    rocks: [],
    levelCoins: lvl.coins.map((c) => ({ ...c, taken: false })),
    runCoins: 0,
    coinFx: null,
    startPos: lvl.start,
    monsterStartPos: lvl.monsterStart,
    path: [],
    pathIdx: 1,
    repathT: 0,
  };
}

function useGameAudio() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const VOLUME = 0.85;

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = VOLUME;
      masterRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };

  const playNote = (freq, time, dur, type, gain) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(g);
    g.connect(masterRef.current);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  };

  const playClick = (time, dur, gain, tone) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-(i / bufferSize) * 9);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = tone === "low" ? "lowpass" : "highpass";
    filter.frequency.value = tone === "low" ? 300 : 4500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(masterRef.current);
    src.start(time);
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startMusic = () => {
    const ctx = ensureCtx();
    if (!ctx) return;
    stopMusic();
    // catchy minor-key hook: bouncy bass + a memorable lead riff + light percussion
    const bass = [110, 110, 130.81, 110, 146.83, 110, 130.81, 98];
    const lead = [
      440, 523.25, 587.33, 523.25, 466.16, 523.25, 440, 392,
      440, 523.25, 659.25, 587.33, 523.25, 466.16, 440, 349.23,
    ];
    const stepDur = 0.185;
    const scheduleAhead = 0.4;
    let nextTime = ctx.currentTime + 0.05;
    stepRef.current = 0;

    const tick = () => {
      while (nextTime < ctx.currentTime + scheduleAhead) {
        const i = stepRef.current;
        playNote(bass[i % bass.length], nextTime, stepDur * 1.9, "triangle", 0.16);
        playNote(lead[i % lead.length], nextTime, stepDur * 0.95, "square", 0.075);
        if (i % 2 === 0) playClick(nextTime, 0.05, 0.22, "low");
        if (i % 4 === 2) playClick(nextTime, 0.03, 0.12, "high");
        if (i % 16 === 0) playNote(bass[0] / 2, nextTime, stepDur * 6, "sawtooth", 0.05);
        nextTime += stepDur;
        stepRef.current++;
      }
    };
    tick();
    timerRef.current = setInterval(tick, 90);
  };

  const playIntroRock = () => {
    const ctx = ensureCtx();
    if (!ctx) return;
    stopMusic();
    // a driving power-chord riff for Roquero's intro performance, plus a lead melody on top
    const root = [82.41, 82.41, 110, 82.41, 98, 82.41, 73.42, 82.41]; // E-E-A-E-G-E-D-E, low & punchy
    const lead = [
      329.63, 392, 440, 392, 349.23, 293.66, 329.63, 246.94,
      329.63, 392, 493.88, 440, 392, 349.23, 293.66, 261.63,
    ]; // a hooky lead line riding on top of the chords, one note per 2 steps
    const stepDur = 0.145;
    const scheduleAhead = 0.4;
    let nextTime = ctx.currentTime + 0.05;
    stepRef.current = 0;

    const tick = () => {
      while (nextTime < ctx.currentTime + scheduleAhead) {
        const i = stepRef.current;
        const r = root[i % root.length];
        // power chord: root + fifth, distorted-ish via sawtooth
        playNote(r, nextTime, stepDur * 1.05, "sawtooth", 0.16);
        playNote(r * 1.5, nextTime, stepDur * 1.05, "sawtooth", 0.11);
        if (i % 4 === 0) playNote(r * 2, nextTime, stepDur * 3.2, "square", 0.07);
        // lead melody, one note every 2 steps so it sings out over the chords
        if (i % 2 === 0) {
          playNote(lead[(i / 2) % lead.length], nextTime, stepDur * 1.9, "sawtooth", 0.1);
        }
        playClick(nextTime, 0.045, i % 4 === 0 ? 0.3 : 0.16, i % 4 === 2 ? "high" : "low");
        nextTime += stepDur;
        stepRef.current++;
      }
    };
    tick();
    timerRef.current = setInterval(tick, 90);
  };

  const setMuted = (muted) => {
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : VOLUME;
  };

  return { ensureCtx, startMusic, playIntroRock, stopMusic, setMuted };
}

function ChaseGame({
  initialAbility = "viento",
  playerName = "",
  playerColor = "#2B2A28",
  characterKind = "stickman",
  secondaryAbility = null,
  onBackToCreator,
  onLevel10Cleared,
  onWinCoins,
}) {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const joy = useRef({ x: 0, y: 0, pointerId: null, baseX: 0, baseY: 0 });
  const joyZoneRef = useRef(null);
  const abilityPointerId = useRef(null);
  const secondaryPointerId = useRef(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0, active: false });
  const state = useRef({ ...freshState(0, playerColor, characterKind), status: "menu" });
  const [ability, setAbility] = useState(initialAbility);
  const [hud, setHud] = useState({ lives: 3, cd: 0, status: "menu", level: 0, monsterLives: 5, monsterDefeated: false, energy: 100 });
  const [pick, setPick] = useState(initialAbility);
  const audio = useGameAudio();
  const [muted, setMuted] = useState(false);

  const reset = useCallback((ab) => {
    state.current = freshState(0, playerColor, characterKind);
    setAbility(ab);
    setHud({ lives: 3, cd: 0, status: "playing", level: 0, monsterLives: 5, monsterDefeated: false, energy: 100 });
    audio.ensureCtx();
    audio.startMusic();
  }, [playerColor, characterKind]);

  const nextLevel = useCallback(() => {
    const clearedIdx = state.current.level;
    const nextIdx = clearedIdx + 1;
    if (clearedIdx >= 9 && onLevel10Cleared) onLevel10Cleared();
    state.current = freshState(nextIdx, playerColor, characterKind);
    setHud({ lives: 3, cd: 0, status: "playing", level: nextIdx, monsterLives: 5, monsterDefeated: false, energy: 100 });
    audio.startMusic();
  }, [playerColor, characterKind, onLevel10Cleared]);

  const backToMenu = useCallback(() => {
    state.current.status = "menu";
    setHud((h) => ({ ...h, status: "menu" }));
    audio.stopMusic();
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      audio.setMuted(!m);
      return !m;
    });
  }, []);

  useEffect(() => {
    if (hud.status === "won" || hud.status === "lost") {
      audio.stopMusic();
    }
  }, [hud.status]);

  useEffect(() => () => audio.stopMusic(), []);

  useEffect(() => {
    const down = (e) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === " ") {
        e.preventDefault();
        keys.current.space_physical = true;
      }
      if (e.key.toLowerCase() === "e") {
        keys.current.secondaryFire = true;
        keys.current.secondary_physical = true;
      }
    };
    const up = (e) => {
      keys.current[e.key.toLowerCase()] = false;
      if (e.key === " ") keys.current.space_physical = false;
      if (e.key.toLowerCase() === "e") {
        keys.current.secondaryFire = false;
        keys.current.secondary_physical = false;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    // safety net: if a touch/mouse release never reaches the ability button
    // (finger dragged off it, tab switched mid-press, etc.) force it back up
    // so the button can never get stuck "held" and silently charge a super.
    // Filtered by pointerId so releasing the joystick with the other thumb
    // never cancels a still-held ability button.
    const releaseIfAbilityPointer = (e) => {
      if (abilityPointerId.current !== null && e.pointerId === abilityPointerId.current) {
        keys.current[" "] = false;
        keys.current.space_physical = false;
        abilityPointerId.current = null;
      }
      if (secondaryPointerId.current !== null && e.pointerId === secondaryPointerId.current) {
        keys.current.secondaryFire = false;
        keys.current.secondary_physical = false;
        secondaryPointerId.current = null;
      }
    };
    const releaseAllOnBlur = () => {
      keys.current[" "] = false;
      keys.current.space_physical = false;
      keys.current.secondaryFire = false;
      keys.current.secondary_physical = false;
      abilityPointerId.current = null;
      secondaryPointerId.current = null;
    };
    window.addEventListener("pointerup", releaseIfAbilityPointer);
    window.addEventListener("pointercancel", releaseIfAbilityPointer);
    window.addEventListener("blur", releaseAllOnBlur);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("pointerup", releaseIfAbilityPointer);
      window.removeEventListener("pointercancel", releaseIfAbilityPointer);
      window.removeEventListener("blur", releaseAllOnBlur);
    };
  }, []);

  // touch joystick
  const JOY_R = 46;
  const onJoyDown = (e) => {
    e.preventDefault();
    const rect = joyZoneRef.current.getBoundingClientRect();
    joy.current.pointerId = e.pointerId;
    joy.current.baseX = rect.left + rect.width / 2;
    joy.current.baseY = rect.top + rect.height / 2;
    joy.current.x = 0;
    joy.current.y = 0;
    setThumb({ x: 0, y: 0, active: true });
  };
  const onJoyMove = (e) => {
    if (joy.current.pointerId !== e.pointerId) return;
    e.preventDefault();
    let dx = e.clientX - joy.current.baseX;
    let dy = e.clientY - joy.current.baseY;
    const d = Math.hypot(dx, dy);
    if (d > JOY_R) {
      dx = (dx / d) * JOY_R;
      dy = (dy / d) * JOY_R;
    }
    joy.current.x = dx / JOY_R;
    joy.current.y = dy / JOY_R;
    setThumb({ x: dx, y: dy, active: true });
  };
  const onJoyUp = (e) => {
    if (joy.current.pointerId !== e.pointerId) return;
    joy.current.pointerId = null;
    joy.current.x = 0;
    joy.current.y = 0;
    setThumb({ x: 0, y: 0, active: false });
  };
  const onAbilityDown = (e) => {
    e.preventDefault();
    abilityPointerId.current = e.pointerId ?? "mouse";
    keys.current[" "] = true;
    keys.current.space_physical = true;
  };
  const onAbilityUp = () => {
    abilityPointerId.current = null;
    keys.current[" "] = false;
    keys.current.space_physical = false;
  };
  const onSecondaryDown = (e) => {
    e.preventDefault();
    secondaryPointerId.current = e.pointerId ?? "mouse";
    keys.current.secondaryFire = true;
    keys.current.secondary_physical = true;
  };
  const onSecondaryUp = () => {
    secondaryPointerId.current = null;
    keys.current.secondaryFire = false;
    keys.current.secondary_physical = false;
  };

  useEffect(() => {
    let raf;
    let last = performance.now();
    const ctx = canvasRef.current.getContext("2d");

    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const s = state.current;
      s.time += dt;

      if (s.status === "playing") {
        const ab = ABILITIES[ability];
        if (s.cd > 0) s.cd -= dt;
        if (s.invuln > 0) s.invuln -= dt;
        if (s.activeEffectT > 0) s.activeEffectT -= dt;
        if (s.stunT > 0) s.stunT -= dt;
        if (s.danceT > 0) s.danceT -= dt;
        if (s.energy < 100) s.energy = Math.min(100, s.energy + dt * 13);

        // hold the ability button to charge a super version (fired later, once walls are known)
        const spacePhysical = !!keys.current.space_physical;
        if (spacePhysical) {
          // a fresh press always starts the charge clock at zero, so a quick tap
          // can never inherit leftover charge from an earlier stuck/partial press
          if (!s.prevSpacePhysical) s.chargeT = 0;
          s.chargeT += dt;
        } else {
          s.chargeT = 0;
        }
        s.prevSpacePhysical = spacePhysical;
        if (s.superCD > 0) s.superCD -= dt;
        if (s.superFx) {
          s.superFx.t -= dt;
          if (s.superFx.t <= 0) s.superFx = null;
        }

        // ability trigger
        if (keys.current[" "] && s.cd <= 0 && s.energy >= 50) {
          keys.current[" "] = false;
          s.cd = ab.cd;
          s.energy -= 50;
          if (ability === "viento") {
            s.dashT = ab.dur;
            s.vientoAura = { x: s.player.x, y: s.player.y, t: 0.5 };
          }
          if (ability === "sigilo") { s.activeEffectT = ab.dur; s.activeEffectAbility = "sigilo"; }
          if (ability === "fuego") { s.activeEffectT = ab.dur; s.activeEffectAbility = "fuego"; }
          if (ability === "sierra") { s.activeEffectT = ab.dur; s.activeEffectAbility = "sierra"; }
          if (ability === "tiempo") {
            const dxc = s.monster.x - s.player.x, dyc = s.monster.y - s.player.y;
            const dnc = Math.hypot(dxc, dyc) || 1;
            s.clockProj = { x: s.player.x, y: s.player.y, vx: (dxc / dnc) * 260, vy: (dyc / dnc) * 260, t: 0 };
            s.freezeT = ab.dur;
          }
          if (ability === "clon") {
            s.activeEffectT = ab.dur;
            s.activeEffectAbility = "clon";
            s.clonePos = { x: s.player.x, y: s.player.y };
          }
          if (ability === "fase") {
            const dist = 120;
            let nx = s.player.x + s.facing.x * dist;
            let ny = s.player.y + s.facing.y * dist;
            nx = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, nx));
            ny = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, ny));
            s.teleportFx = { fromX: s.player.x, fromY: s.player.y, toX: nx, toY: ny, t: 0.4 };
            s.player.x = nx;
            s.player.y = ny;
            s.teleportGrace = 0.3;
          }
          if (ability === "tornado") {
            s.tornadoT = ab.dur;
            s.tornadoProj = {
              x: s.player.x,
              y: s.player.y,
              vx: -s.facing.x * 210,
              vy: -s.facing.y * 210,
              t: 0,
            };
          }
          if (ability === "electrico" || ability === "mutar" || ability === "roquero" || ability === "ladron") {
            const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
            const d0 = Math.hypot(dx0, dy0) || 1;
            const speed = ability === "electrico" ? 560 : ability === "roquero" ? 420 : ability === "ladron" ? 480 : 320;
            s.projectile = {
              x: s.player.x,
              y: s.player.y,
              vx: (dx0 / d0) * speed,
              vy: (dy0 / d0) * speed,
              kind: ability,
              t: 0,
            };
          }
          if (ability === "laser") {
            const step = 6, maxRange = 260;
            let hx = s.player.x + s.facing.x * maxRange;
            let hy = s.player.y + s.facing.y * maxRange;
            let hitIdx = -1;
            for (let dist = 0; dist <= maxRange; dist += step) {
              const px = s.player.x + s.facing.x * dist;
              const py = s.player.y + s.facing.y * dist;
              const idx = s.levelWalls.findIndex(
                (wl, i) => i > 2 && !s.destroyedWalls.has(i) && px > wl.x && px < wl.x + wl.w && py > wl.y && py < wl.y + wl.h
              );
              if (idx !== -1) { hx = px; hy = py; hitIdx = idx; break; }
            }
            s.laserFx = { x1: s.player.x, y1: s.player.y, x2: hx, y2: hy, t: 3 };
            if (hitIdx !== -1) {
              s.destroyedWalls.add(hitIdx);
              const active = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
              s.blockedGrid = computeBlockedGrid(active);
              s.wallBreakFx = { x: hx, y: hy, t: 0.5 };
            }
          }
        }

        // secondary ability trigger (animal characters only — a dedicated second button)
        if (secondaryAbility && keys.current.secondaryFire && s.cd2 <= 0 && s.energy >= 50) {
          keys.current.secondaryFire = false;
          const ab2 = ABILITIES[secondaryAbility];
          s.cd2 = ab2.cd;
          s.energy -= 50;
          if (secondaryAbility === "viento") {
            s.dashT = ab2.dur;
            s.vientoAura = { x: s.player.x, y: s.player.y, t: 0.5 };
          } else if (secondaryAbility === "fuego") {
            s.activeEffectT = ab2.dur;
            s.activeEffectAbility = "fuego";
          } else if (secondaryAbility === "mutar") {
            const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
            const d0 = Math.hypot(dx0, dy0) || 1;
            s.projectile = { x: s.player.x, y: s.player.y, vx: (dx0 / d0) * 320, vy: (dy0 / d0) * 320, kind: "mutar", t: 0 };
          } else if (secondaryAbility === "tiempo") {
            const dxc = s.monster.x - s.player.x, dyc = s.monster.y - s.player.y;
            const dnc = Math.hypot(dxc, dyc) || 1;
            s.clockProj = { x: s.player.x, y: s.player.y, vx: (dxc / dnc) * 260, vy: (dyc / dnc) * 260, t: 0 };
            s.freezeT = ab2.dur;
          } else if (secondaryAbility === "laser") {
            const step2 = 6, maxRange2 = 260;
            let hx2 = s.player.x + s.facing.x * maxRange2, hy2 = s.player.y + s.facing.y * maxRange2;
            let hitIdx2 = -1;
            for (let dist = 0; dist <= maxRange2; dist += step2) {
              const px = s.player.x + s.facing.x * dist, py = s.player.y + s.facing.y * dist;
              const idx = s.levelWalls.findIndex(
                (wl, i) => i > 2 && !s.destroyedWalls.has(i) && px > wl.x && px < wl.x + wl.w && py > wl.y && py < wl.y + wl.h
              );
              if (idx !== -1) { hx2 = px; hy2 = py; hitIdx2 = idx; break; }
            }
            s.laserFx = { x1: s.player.x, y1: s.player.y, x2: hx2, y2: hy2, t: 3 };
            if (hitIdx2 !== -1) {
              s.destroyedWalls.add(hitIdx2);
              const active2 = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
              s.blockedGrid = computeBlockedGrid(active2);
              s.wallBreakFx = { x: hx2, y: hy2, t: 0.5 };
            }
          }
        }
        if (s.cd2 > 0) s.cd2 -= dt;
        if (s.dashT > 0) s.dashT -= dt;
        if (s.vientoAura) {
          s.vientoAura.t -= dt;
          if (s.vientoAura.t <= 0) s.vientoAura = null;
        }
        if (s.tornadoT > 0) s.tornadoT -= dt;
        if (s.freezeT > 0) s.freezeT -= dt;
        if (s.timeRushT > 0) s.timeRushT -= dt;
        if (s.phaseThroughT > 0) s.phaseThroughT -= dt;
        if (s.clockProj) {
          const cp = s.clockProj;
          cp.t += dt;
          cp.x += cp.vx * dt;
          cp.y += cp.vy * dt;
          if (cp.t > 1.4 || cp.x < 0 || cp.x > WORLD_W || cp.y < 0 || cp.y > WORLD_H) s.clockProj = null;
        }
        if (s.web) {
          s.web.t -= dt;
          if (s.web.t <= 0) s.web = null;
        }
        if (s.gas) {
          s.gas.t -= dt;
          if (s.gas.t <= 0) s.gas = null;
        }
        if (s.spark) {
          s.spark.t -= dt;
          if (s.spark.t <= 0) s.spark = null;
        }
        if (s.cloneVanish) {
          s.cloneVanish.t -= dt;
          if (s.cloneVanish.t <= 0) s.cloneVanish = null;
        }
        if (s.notesFx) {
          s.notesFx.t -= dt;
          if (s.notesFx.t <= 0) s.notesFx = null;
        }
        if (s.laserFx) {
          s.laserFx.t -= dt;
          if (s.laserFx.t <= 0) s.laserFx = null;
        }
        if (s.wallBreakFx) {
          s.wallBreakFx.t -= dt;
          if (s.wallBreakFx.t <= 0) s.wallBreakFx = null;
        }
        if (s.teleportFx) {
          s.teleportFx.t -= dt;
          if (s.teleportFx.t <= 0) s.teleportFx = null;
        }
        if (s.activeEffectAbility !== "clon" || s.activeEffectT <= 0) s.clonePos = null;
        const activeWalls = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
        const shieldActive = s.activeEffectAbility === "sierra" && s.activeEffectT > 0;

        // super ability: fires once the button has been held long enough, costs the whole energy bar
        const fireSuper = (targetId) => {
          const targetAb = ABILITIES[targetId];
          s.superFx = { x: s.player.x, y: s.player.y, t: 0.6, color: targetAb.accent };
          const nearWalls = (radius) =>
            activeWalls
              .map((wl, i) => ({ wl, i, cx: wl.x + wl.w / 2, cy: wl.y + wl.h / 2 }))
              .filter((w) => w.i > 2 && Math.hypot(w.cx - s.player.x, w.cy - s.player.y) < radius)
              .slice(0, 6);

          if (targetId === "viento") {
            s.slowAura = { x: s.player.x, y: s.player.y, r: 100, t: 5 };
          } else if (targetId === "sigilo") {
            s.phaseThroughT = 3;
          } else if (targetId === "tiempo") {
            s.timeRushT = 4;
            s.invuln = Math.max(s.invuln, 4);
          } else if (targetId === "clon") {
            s.decoyClones = Array.from({ length: 5 }, (_, i) => {
              const ang = (i / 5) * Math.PI * 2;
              return { x: s.player.x, y: s.player.y, vx: Math.cos(ang) * 55, vy: Math.sin(ang) * 55, t: 6 };
            });
          } else if (targetId === "fase") {
            if (!s.monsterDefeated) {
              s.monster.x = s.monsterStartPos.x;
              s.monster.y = s.monsterStartPos.y;
              s.path = [];
              s.pathIdx = 1;
              s.repathT = 0;
            }
          } else if (targetId === "electrico") {
            const ang = Math.atan2(s.facing.y, s.facing.x);
            s.electricWall = {
              x: s.player.x + s.facing.x * 55,
              y: s.player.y + s.facing.y * 55,
              angle: ang + Math.PI / 2,
              len: 90,
              t: 3,
              hitCd: {},
            };
          } else if (targetId === "fuego") {
            s.burningWalls = nearWalls(220).map((w) => ({ x: w.cx, y: w.cy, t: 6 }));
          } else if (targetId === "mutar") {
            s.vineWalls = nearWalls(220).map((w) => ({ x: w.cx, y: w.cy, t: 6 }));
          } else if (targetId === "roquero") {
            const pushR = 150, pushBy = 80;
            if (!s.monsterDefeated) {
              const d = Math.hypot(s.monster.x - s.player.x, s.monster.y - s.player.y);
              if (d < pushR && d > 1) {
                s.monster.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x + ((s.monster.x - s.player.x) / d) * pushBy));
                s.monster.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + ((s.monster.y - s.player.y) / d) * pushBy));
              }
            }
            s.cloneMonsters.forEach((c) => {
              const d = Math.hypot(c.x - s.player.x, c.y - s.player.y);
              if (d < pushR && d > 1) {
                c.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, c.x + ((c.x - s.player.x) / d) * pushBy));
                c.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, c.y + ((c.y - s.player.y) / d) * pushBy));
              }
            });
            s.shockwaveFx = { x: s.player.x, y: s.player.y, t: 0.5 };
          } else if (targetId === "laser") {
            s.laserStormT = 4;
            s.laserStormTick = 0;
          } else if (targetId === "sierra") {
            const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
            const d0 = Math.hypot(dx0, dy0) || 1;
            const baseAng = Math.atan2(dy0, dx0);
            s.sawProjectiles = [-0.35, 0.35].map((off) => ({
              x: s.player.x,
              y: s.player.y,
              vx: Math.cos(baseAng + off) * 340,
              vy: Math.sin(baseAng + off) * 340,
              t: 0,
            }));
          } else if (targetId === "tornado") {
            s.tornadoT = targetAb.dur;
            const backAng = Math.atan2(-s.facing.y, -s.facing.x);
            s.tornadoProjs = [backAng, backAng + 2.3, backAng - 2.3].map((ang) => ({
              x: s.player.x,
              y: s.player.y,
              vx: Math.cos(ang) * 210,
              vy: Math.sin(ang) * 210,
              t: 0,
            }));
          } else if (targetId === "ladron") {
            s.lives = 5;
          }
        };

        if (spacePhysical && s.chargeT >= SUPER_HOLD && s.superCD <= 0 && s.energy >= 100) {
          s.superCD = 15;
          s.energy = 0;
          s.chargeT = -999;
          fireSuper(ability);
        }
        const secondaryPhysical = !!keys.current.secondary_physical;
        if (secondaryAbility) {
          if (secondaryPhysical) {
            if (!s.prevSecondaryPhysical) s.chargeT2 = 0;
            s.chargeT2 += dt;
          } else {
            s.chargeT2 = 0;
          }
          s.prevSecondaryPhysical = secondaryPhysical;
          if (s.superCD2 > 0) s.superCD2 -= dt;
          if (secondaryPhysical && s.chargeT2 >= SUPER_HOLD && s.superCD2 <= 0 && s.energy >= 100) {
            s.superCD2 = 15;
            s.energy = 0;
            s.chargeT2 = -999;
            fireSuper(secondaryAbility);
          }
        }

        // --- super-ability mechanics: tick, collide, apply ---
        if (s.slowAura) {
          s.slowAura.t -= dt;
          if (s.slowAura.t <= 0) s.slowAura = null;
        }
        if (s.shockwaveFx) {
          s.shockwaveFx.t -= dt;
          if (s.shockwaveFx.t <= 0) s.shockwaveFx = null;
        }
        if (s.laserStormT > 0) {
          s.laserStormT -= dt;
          s.laserStormTick -= dt;
          const armCount = 10;
          if (s.laserStormTick <= 0) {
            s.laserStormTick = 0.15;
            for (let i = 0; i < armCount; i++) {
              const ang = s.time * 12 + (i / armCount) * Math.PI * 2;
              const ex = s.player.x + Math.cos(ang) * 90;
              const ey = s.player.y + Math.sin(ang) * 90;
              const wIdx = activeWalls.findIndex(
                (wl, wi) => wi > 2 && ex > wl.x && ex < wl.x + wl.w && ey > wl.y && ey < wl.y + wl.h
              );
              if (wIdx !== -1) {
                const realIdx = s.levelWalls.indexOf(activeWalls[wIdx]);
                if (realIdx !== -1) s.destroyedWalls.add(realIdx);
              }
              if (!s.monsterDefeated && Math.hypot(ex - s.monster.x, ey - s.monster.y) < MONSTER_R + 8) {
                if (s.stunT <= 0) damageMonster(s);
                s.stunT = Math.max(s.stunT, 1.2);
              }
              s.cloneMonsters.forEach((c) => {
                if (Math.hypot(ex - c.x, ey - c.y) < MONSTER_R * 0.86 + 8) c.stunT = Math.max(c.stunT, 1.2);
              });
            }
          }
        }
        if (s.electricWall) {
          s.electricWall.t -= dt;
          if (s.electricWall.t <= 0) {
            s.electricWall = null;
          } else {
            const ew = s.electricWall;
            const hx = Math.cos(ew.angle) * ew.len, hy = Math.sin(ew.angle) * ew.len;
            const checkHit = (tx, ty) => {
              const dx = tx - ew.x, dy = ty - ew.y;
              const proj = Math.max(-1, Math.min(1, (dx * hx + dy * hy) / (ew.len * ew.len)));
              const cx = ew.x + hx * proj, cy = ew.y + hy * proj;
              return Math.hypot(tx - cx, ty - cy) < 14;
            };
            if (!s.monsterDefeated && checkHit(s.monster.x, s.monster.y)) {
              if (s.stunT <= 0) damageMonster(s);
              s.stunT = Math.max(s.stunT, 2.4);
            }
            s.cloneMonsters.forEach((c) => {
              if (checkHit(c.x, c.y)) c.stunT = Math.max(c.stunT, 2.4);
            });
          }
        }
        if (s.burningWalls.length > 0) {
          s.burningWalls = s.burningWalls.filter((bw) => {
            bw.t -= dt;
            if (bw.t <= 0) return false;
            if (!s.monsterDefeated && Math.hypot(bw.x - s.monster.x, bw.y - s.monster.y) < 34) {
              if (s.stunT <= 0) damageMonster(s);
              s.stunT = Math.max(s.stunT, 2.2);
            }
            s.cloneMonsters.forEach((c) => {
              if (Math.hypot(bw.x - c.x, bw.y - c.y) < 34) c.stunT = Math.max(c.stunT, 2.2);
            });
            return true;
          });
        }
        if (s.vineWalls.length > 0) {
          s.vineWalls = s.vineWalls.filter((vw) => {
            vw.t -= dt;
            if (vw.t <= 0) return false;
            if (!s.monsterDefeated && Math.hypot(vw.x - s.monster.x, vw.y - s.monster.y) < 34) {
              if (s.stunT <= 0) damageMonster(s);
              s.stunT = Math.max(s.stunT, 2.6);
            }
            s.cloneMonsters.forEach((c) => {
              if (Math.hypot(vw.x - c.x, vw.y - c.y) < 34) c.stunT = Math.max(c.stunT, 2.6);
            });
            return true;
          });
        }
        if (s.decoyClones.length > 0) {
          s.decoyClones = s.decoyClones.filter((dc) => {
            dc.t -= dt;
            dc.x += dc.vx * dt;
            dc.y += dc.vy * dt;
            dc.vx += (Math.random() - 0.5) * 40 * dt;
            dc.vy += (Math.random() - 0.5) * 40 * dt;
            dc.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, dc.x));
            dc.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, dc.y));
            if (dc.t <= 0) return false;
            const dM = !s.monsterDefeated && Math.hypot(dc.x - s.monster.x, dc.y - s.monster.y) < PLAYER_R + MONSTER_R - 4;
            const dC = s.cloneMonsters.some((c) => Math.hypot(dc.x - c.x, dc.y - c.y) < PLAYER_R + MONSTER_R * 0.86 - 4);
            if (dM || dC) {
              s.cloneVanish = { x: dc.x, y: dc.y, t: 0.5 };
              return false;
            }
            return true;
          });
        }
        if (s.sawProjectiles.length > 0) {
          s.sawProjectiles = s.sawProjectiles.filter((sp) => {
            sp.t += dt;
            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;
            const hitWallSp = activeWalls.some(
              (wl) => sp.x > wl.x && sp.x < wl.x + wl.w && sp.y > wl.y && sp.y < wl.y + wl.h
            );
            if (!s.monsterDefeated && Math.hypot(sp.x - s.monster.x, sp.y - s.monster.y) < MONSTER_R + 8) {
              if (s.stunT <= 0) damageMonster(s);
              s.stunT = Math.max(s.stunT, 2.6);
              return false;
            }
            const hitClone = s.cloneMonsters.find((c) => Math.hypot(sp.x - c.x, sp.y - c.y) < MONSTER_R * 0.86 + 8);
            if (hitClone) {
              hitClone.stunT = Math.max(hitClone.stunT, 2.6);
              return false;
            }
            return !(hitWallSp || sp.t > 2.2 || sp.x < 0 || sp.x > WORLD_W || sp.y < 0 || sp.y > WORLD_H);
          });
        }
        if (s.tornadoProjs.length > 0) {
          s.tornadoProjs = s.tornadoProjs.filter((tp2) => {
            tp2.t += dt;
            tp2.x += tp2.vx * dt;
            tp2.y += tp2.vy * dt;
            const hitWallT2 = activeWalls.some(
              (wl) => tp2.x > wl.x && tp2.x < wl.x + wl.w && tp2.y > wl.y && tp2.y < wl.y + wl.h
            );
            let swept2 = false;
            if (!s.monsterDefeated && Math.hypot(tp2.x - s.monster.x, tp2.y - s.monster.y) < MONSTER_R + 14) {
              const dn2 = Math.hypot(tp2.vx, tp2.vy) || 1;
              s.monster.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x + (tp2.vx / dn2) * 150));
              s.monster.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + (tp2.vy / dn2) * 150));
              if (s.stunT <= 0) damageMonster(s);
              s.stunT = Math.max(s.stunT, 2.5);
              swept2 = true;
            }
            s.cloneMonsters.forEach((c) => {
              if (Math.hypot(tp2.x - c.x, tp2.y - c.y) < MONSTER_R * 0.86 + 12) c.stunT = Math.max(c.stunT, 2.5);
            });
            return !(swept2 || hitWallT2 || tp2.t > 2 || tp2.x < 0 || tp2.x > WORLD_W || tp2.y < 0 || tp2.y > WORLD_H);
          });
        }

        // tornado thrown in the opposite direction — sweeps away anything it touches
        if (s.tornadoProj) {
          const tp = s.tornadoProj;
          tp.t += dt;
          tp.x += tp.vx * dt;
          tp.y += tp.vy * dt;
          const tpHitWall = activeWalls.some(
            (wl) => tp.x > wl.x && tp.x < wl.x + wl.w && tp.y > wl.y && tp.y < wl.y + wl.h
          );
          const dTpM = s.monsterDefeated ? Infinity : Math.hypot(tp.x - s.monster.x, tp.y - s.monster.y);
          let swept = false;
          if (dTpM < MONSTER_R + 14) {
            const dn = Math.hypot(tp.vx, tp.vy) || 1;
            s.monster.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x + (tp.vx / dn) * 150));
            s.monster.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + (tp.vy / dn) * 150));
            if (s.stunT <= 0) damageMonster(s);
            s.stunT = Math.max(s.stunT, 2.5);
            swept = true;
          }
          s.cloneMonsters = s.cloneMonsters.filter((c) => Math.hypot(tp.x - c.x, tp.y - c.y) >= MONSTER_R + 12);
          if (swept || tpHitWall || tp.t > 2 || tp.x < 0 || tp.x > WORLD_W || tp.y < 0 || tp.y > WORLD_H) {
            s.tornadoBurst = { x: tp.x, y: tp.y, t: 0.5 };
            s.tornadoProj = null;
          }
        }
        if (s.tornadoBurst) {
          s.tornadoBurst.t -= dt;
          if (s.tornadoBurst.t <= 0) s.tornadoBurst = null;
        }

        // sierra shield clears nearby animals
        if (shieldActive && s.levelAnimals.length > 0) {
          s.levelAnimals = s.levelAnimals.filter(
            (a) => Math.hypot(a.x - s.player.x, a.y - s.player.y) > 22
          );
        }
        if (s.projectile) {
          const p = s.projectile;
          p.t += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const hitWall = activeWalls.some(
            (wl) => p.x > wl.x && p.x < wl.x + wl.w && p.y > wl.y && p.y < wl.y + wl.h
          );
          const dHit = s.monsterDefeated ? Infinity : Math.hypot(p.x - s.monster.x, p.y - s.monster.y);
          if (dHit < MONSTER_R + 6) {
            if (p.kind === "roquero") {
              if (s.danceT <= 0) damageMonster(s);
              s.danceT = Math.max(s.danceT, ABILITIES.roquero.dur);
              s.notesFx = { x: p.x, y: p.y, t: 0.6 };
            } else if (p.kind === "ladron") {
              if (s.monsterLives > 0) {
                s.lives += 1;
                s.stealFx = { x: p.x, y: p.y, t: 0.6 };
                damageMonster(s);
              }
            } else {
              if (s.stunT <= 0) damageMonster(s);
              const paralyzeFor = p.kind === "electrico" ? 2.6 : 2.9;
              s.stunT = Math.max(s.stunT, paralyzeFor);
              if (p.kind === "mutar") {
                s.gas = { x: p.x, y: p.y, t: 2.4 };
              } else {
                s.spark = { x: p.x, y: p.y, t: 0.45 };
              }
            }
            s.projectile = null;
          } else if (hitWall || p.t > 2.2 || p.x < 0 || p.x > WORLD_W || p.y < 0 || p.y > WORLD_H) {
            s.projectile = null;
          }
        }
        if (s.stealFx) {
          s.stealFx.t -= dt;
          if (s.stealFx.t <= 0) s.stealFx = null;
        }
        if (s.defeatFx) {
          s.defeatFx.t -= dt;
          if (s.defeatFx.t <= 0) s.defeatFx = null;
        }

        // monster's black fireball in flight
        if (s.monsterFireball) {
          const fb = s.monsterFireball;
          fb.t += dt;
          fb.x += fb.vx * dt;
          fb.y += fb.vy * dt;
          const fbHitWall = activeWalls.some(
            (wl) => fb.x > wl.x && fb.x < wl.x + wl.w && fb.y > wl.y && fb.y < wl.y + wl.h
          );
          const dFb = Math.hypot(fb.x - s.player.x, fb.y - s.player.y);
          if (dFb < PLAYER_R + 8) {
            if (s.invuln <= 0 && !shieldActive) {
              s.lives -= 1;
              s.invuln = 1.4;
              const dxk = s.player.x - fb.x, dyk = s.player.y - fb.y;
              const dk = Math.hypot(dxk, dyk) || 1;
              s.player.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, s.player.x + (dxk / dk) * 22));
              s.player.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, s.player.y + (dyk / dk) * 22));
              if (s.lives <= 0) s.status = "lost";
            }
            s.fireballBurst = { x: fb.x, y: fb.y, t: 0.5 };
            s.monsterFireball = null;
          } else if (fbHitWall || fb.t > 2.6 || fb.x < 0 || fb.x > WORLD_W || fb.y < 0 || fb.y > WORLD_H) {
            s.fireballBurst = { x: fb.x, y: fb.y, t: 0.4 };
            s.monsterFireball = null;
          }
        }
        if (s.fireballBurst) {
          s.fireballBurst.t -= dt;
          if (s.fireballBurst.t <= 0) s.fireballBurst = null;
        }

        // coin pickups scattered around the walls
        if (s.levelCoins.length > 0) {
          s.levelCoins.forEach((c) => {
            if (c.taken) return;
            if (Math.hypot(c.x - s.player.x, c.y - s.player.y) < PLAYER_R + 10) {
              c.taken = true;
              s.runCoins += 1;
              s.coinFx = { x: c.x, y: c.y, t: 0.4 };
            }
          });
        }
        if (s.coinFx) {
          s.coinFx.t -= dt;
          if (s.coinFx.t <= 0) s.coinFx = null;
        }

        // jungle animals throwing rocks
        if (s.levelAnimals.length > 0 && s.status === "playing") {
          s.levelAnimals.forEach((a) => {
            a.cd -= dt;
            const dA = Math.hypot(s.player.x - a.x, s.player.y - a.y);
            if (a.cd <= 0 && dA < 320) {
              a.cd = 2.4 + Math.random() * 2;
              const dxa = s.player.x - a.x, dya = s.player.y - a.y;
              const dna = Math.hypot(dxa, dya) || 1;
              s.rocks.push({
                x: a.x, y: a.y,
                vx: (dxa / dna) * 230, vy: (dya / dna) * 230,
                t: 0,
                kind: s.levelTheme === "snow" ? "snowball" : "rock",
              });
            }
          });
        }
        if (s.rocks.length > 0) {
          s.rocks = s.rocks.filter((r) => {
            r.t += dt;
            r.x += r.vx * dt;
            r.y += r.vy * dt;
            const rHitWall = activeWalls.some(
              (wl) => r.x > wl.x && r.x < wl.x + wl.w && r.y > wl.y && r.y < wl.y + wl.h
            );
            const dRock = Math.hypot(r.x - s.player.x, r.y - s.player.y);
            if (dRock < PLAYER_R + 7) {
              if (s.tornadoT > 0) {
                // spinning inside the tornado bats the projectile back the way it came
                r.vx *= -1.15;
                r.vy *= -1.15;
                r.t = 0;
                return true;
              }
              if (s.invuln <= 0 && !shieldActive) {
                s.lives -= 1;
                s.invuln = 1.4;
                const dxk = s.player.x - r.x, dyk = s.player.y - r.y;
                const dk = Math.hypot(dxk, dyk) || 1;
                s.player.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, s.player.x + (dxk / dk) * 18));
                s.player.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, s.player.y + (dyk / dk) * 18));
                if (s.lives <= 0) s.status = "lost";
              }
              return false;
            }
            return !(rHitWall || r.t > 2.2 || r.x < 0 || r.x > WORLD_W || r.y < 0 || r.y > WORLD_H);
          });
        }

        if (s.monsterLungeTelegraph > 0) {
          s.monsterLungeTelegraph -= dt;
          if (s.monsterLungeTelegraph <= 0) s.monsterLungeT = 0.5;
        }
        if (s.monsterLungeT > 0) s.monsterLungeT -= dt;
        if (s.tripleFx) {
          s.tripleFx.t -= dt;
          if (s.tripleFx.t <= 0) s.tripleFx = null;
        }
        if (s.cloneMonsters.length > 0) {
          if (!s.cloneMonsters.some((c) => c.permanent)) s.tripleT -= dt;
          if (s.tripleT <= 0 && !s.cloneMonsters.some((c) => c.permanent)) {
            s.cloneMonsters = [];
          } else {
            const seesPlayerNow = !(s.activeEffectAbility === "sigilo" && s.activeEffectT > 0);
            s.cloneMonsters.forEach((c) => {
              if (c.stunT > 0 || s.freezeT > 0) {
                if (c.stunT > 0) c.stunT -= dt;
                return;
              }
              c.repathT -= dt;
              if (c.repathT <= 0) {
                c.repathT = 0.45;
                const startCell = worldToCell(c.x, c.y);
                const goalCell = worldToCell(s.player.x, s.player.y);
                const p = bfsPath(startCell, goalCell, s.blockedGrid);
                c.path = p || [];
                c.pathIdx = 1;
              }
              let targetX = s.player.x, targetY = s.player.y;
              if (c.path.length > 1) {
                while (c.pathIdx < c.path.length) {
                  const wp = cellCenter(c.path[c.pathIdx].cx, c.path[c.pathIdx].cy);
                  const dwp = Math.hypot(wp.x - c.x, wp.y - c.y);
                  if (dwp < GRID * 0.7 && c.pathIdx < c.path.length - 1) { c.pathIdx++; continue; }
                  targetX = wp.x; targetY = wp.y;
                  break;
                }
              }

              c.fireCD -= dt;
              c.lungeCD -= dt;
              if (c.lungeTelegraph > 0) {
                c.lungeTelegraph -= dt;
                if (c.lungeTelegraph <= 0) c.lungeT = 0.5;
              }
              if (c.lungeT > 0) c.lungeT -= dt;
              let cSpeedBase = monsterBaseSpeedForLevel(s.level) * 0.86 + Math.min(s.time * 0.7, 40);
              let cSpeed = cSpeedBase * (c.lungeT > 0 ? 2.2 : 1);
              if (s.slowAura && Math.hypot(c.x - s.slowAura.x, c.y - s.slowAura.y) < s.slowAura.r) {
                cSpeed *= 0.4;
              }
              const distToPlayerC = Math.hypot(s.player.x - c.x, s.player.y - c.y);
              if (seesPlayerNow && !c.fireball && c.fireCD <= 0 && distToPlayerC > 90 && distToPlayerC < 420) {
                c.fireCD = 4.5 + Math.random() * 2.5;
                const dxf = s.player.x - c.x, dyf = s.player.y - c.y;
                const df = Math.hypot(dxf, dyf) || 1;
                c.fireball = { x: c.x, y: c.y, vx: (dxf / df) * 250, vy: (dyf / df) * 250, t: 0 };
              }
              if (seesPlayerNow && c.lungeCD <= 0 && c.lungeTelegraph <= 0 && c.lungeT <= 0 && distToPlayerC < 200) {
                c.lungeCD = 7 + Math.random() * 3;
                c.lungeTelegraph = 0.45;
              }

              const dxc = targetX - c.x, dyc = targetY - c.y;
              const dc = Math.hypot(dxc, dyc) || 1;
              c.facing = Math.atan2(dyc, dxc);
              c.x += (dxc / dc) * cSpeed * dt;
              c.y += (dyc / dc) * cSpeed * dt;
              c.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, c.x));
              c.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, c.y));
              activeWalls.forEach((wl) => circleRectPush(c, MONSTER_R * 0.86, wl));

              if (c.fireball) {
                const fb = c.fireball;
                fb.t += dt;
                fb.x += fb.vx * dt;
                fb.y += fb.vy * dt;
                const fbHitWall = activeWalls.some(
                  (wl) => fb.x > wl.x && fb.x < wl.x + wl.w && fb.y > wl.y && fb.y < wl.y + wl.h
                );
                const dFbC = Math.hypot(fb.x - s.player.x, fb.y - s.player.y);
                if (dFbC < PLAYER_R + 8) {
                  if (s.invuln <= 0 && !shieldActive) {
                    s.lives -= 1;
                    s.invuln = 1.4;
                    const dxk = s.player.x - fb.x, dyk = s.player.y - fb.y;
                    const dk = Math.hypot(dxk, dyk) || 1;
                    s.player.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, s.player.x + (dxk / dk) * 22));
                    s.player.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, s.player.y + (dyk / dk) * 22));
                    if (s.lives <= 0) s.status = "lost";
                  }
                  c.fireball = null;
                } else if (fbHitWall || fb.t > 2.6 || fb.x < 0 || fb.x > WORLD_W || fb.y < 0 || fb.y > WORLD_H) {
                  c.fireball = null;
                }
              }
            });
          }
        }

        // sierra shield can stun whatever it touches
        if (shieldActive && !s.sierraHitApplied) {
          const dPS = Math.hypot(s.monster.x - s.player.x, s.monster.y - s.player.y);
          if (!s.monsterDefeated && dPS < 40) {
            if (s.stunT <= 0) damageMonster(s);
            s.stunT = Math.max(s.stunT, 3);
            s.sierraHitApplied = true;
          }
          s.cloneMonsters.forEach((c) => {
            const dCS = Math.hypot(c.x - s.player.x, c.y - s.player.y);
            if (dCS < 40) {
              c.stunT = Math.max(c.stunT, 3);
              s.sierraHitApplied = true;
            }
          });
        }
        if (!shieldActive) s.sierraHitApplied = false;

        // movement — keyboard + touch joystick combined
        let mx = joy.current.x, my = joy.current.y;
        if (keys.current["arrowup"] || keys.current["w"]) my -= 1;
        if (keys.current["arrowdown"] || keys.current["s"]) my += 1;
        if (keys.current["arrowleft"] || keys.current["a"]) mx -= 1;
        if (keys.current["arrowright"] || keys.current["d"]) mx += 1;
        const isMoving = Math.hypot(mx, my) > 0.15;
        s.moving = isMoving;
        const slowed = s.dashT <= 0 && inPuddle(s.player, s.levelPuddles);
        if (isMoving) {
          const len = Math.hypot(mx, my) || 1;
          s.facing = { x: mx / len, y: my / len };
          const speed = 126 * (s.dashT > 0 ? 2.1 : 1) * (s.tornadoT > 0 ? 2.8 : 1) * (s.timeRushT > 0 ? 2.4 : 1) * (slowed ? PUDDLE_SLOW : 1);
          s.player.x += (mx / len) * speed * dt;
          s.player.y += (my / len) * speed * dt;
        }
        s.player.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, s.player.x));
        s.player.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, s.player.y));
        if (s.teleportGrace > 0) {
          s.teleportGrace -= dt;
        } else if (s.phaseThroughT > 0) {
          // phasing through walls during Bruma's super
        } else {
          activeWalls.forEach((wl) => circleRectPush(s.player, PLAYER_R, wl));
        }

        // spikes hazard
        if (s.invuln <= 0 && !shieldActive) {
          const pRect = { x: s.player.x - PLAYER_R, y: s.player.y - PLAYER_R, w: PLAYER_R * 2, h: PLAYER_R * 2 };
          const spike = s.levelSpikes.find((sp) => rectsOverlap(pRect, sp));
          if (spike) {
            s.lives -= 1;
            s.invuln = 1.4;
            const cx = Math.max(spike.x, Math.min(s.player.x, spike.x + spike.w));
            const cy = Math.max(spike.y, Math.min(s.player.y, spike.y + spike.h));
            const dxk = s.player.x - cx, dyk = s.player.y - cy;
            const dk = Math.hypot(dxk, dyk) || 1;
            s.player.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, s.player.x + (dxk / dk) * 20));
            s.player.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, s.player.y + (dyk / dk) * 20));
            if (s.lives <= 0) s.status = "lost";
          }
        }

        // monster AI — follows a pathfound route around walls
        if (!s.monsterDefeated && s.stunT <= 0 && s.danceT <= 0 && s.freezeT <= 0) {
          let goalX = s.player.x, goalY = s.player.y;
          let mSpeed = monsterBaseSpeedForLevel(s.level) + Math.min(s.time * 0.9, 55);
          mSpeed = Math.max(60, mSpeed);
          const seesPlayer = !(s.activeEffectAbility === "sigilo" && s.activeEffectT > 0);
          if (!seesPlayer) {
            goalX = s.monster._lastSeenX ?? s.monster.x;
            goalY = s.monster._lastSeenY ?? s.monster.y;
            mSpeed *= 0.4;
          } else {
            s.monster._lastSeenX = s.player.x;
            s.monster._lastSeenY = s.player.y;
          }
          if (s.slowAura && Math.hypot(s.monster.x - s.slowAura.x, s.monster.y - s.slowAura.y) < s.slowAura.r) {
            mSpeed *= 0.4;
          }

          // special attacks: black fireball at range, telegraphed lunge up close, occasional triple —
          // all more frequent and faster on higher levels
          s.monsterFireCD -= dt;
          s.monsterLungeCD -= dt;
          s.tripleCD -= dt;
          const distToPlayer = Math.hypot(s.player.x - s.monster.x, s.player.y - s.monster.y);
          if (seesPlayer && !s.monsterFireball && s.monsterFireCD <= 0 && distToPlayer > 90 && distToPlayer < 480) {
            s.monsterFireCD = Math.max(1.6, 4 + Math.random() * 2.5 - s.level * 0.9);
            const dxf = s.player.x - s.monster.x, dyf = s.player.y - s.monster.y;
            const df = Math.hypot(dxf, dyf) || 1;
            const fbSpeed = 260 + s.level * 30;
            s.monsterFireball = { x: s.monster.x, y: s.monster.y, vx: (dxf / df) * fbSpeed, vy: (dyf / df) * fbSpeed, t: 0 };
          }
          if (
            seesPlayer &&
            s.monsterLungeCD <= 0 &&
            s.monsterLungeTelegraph <= 0 &&
            s.monsterLungeT <= 0 &&
            distToPlayer < 220
          ) {
            s.monsterLungeCD = Math.max(2.2, 6 + Math.random() * 3 - s.level * 1.1);
            s.monsterLungeTelegraph = 0.45;
          }
          if (s.monsterLungeT > 0) mSpeed *= 2.3 + s.level * 0.15;

          if (seesPlayer && s.tripleCD <= 0 && s.cloneMonsters.length === 0) {
            s.tripleCD = Math.max(9, 18 + Math.random() * 6 - s.level * 3.5);
            s.tripleT = 10;
            s.cloneMonsters = [
              makeClone(
                Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x - 18)),
                Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y - 14)),
                s.monsterFacing,
                false
              ),
              makeClone(
                Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x - 18)),
                Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + 14)),
                s.monsterFacing,
                false
              ),
            ];
            s.tripleFx = { x: s.monster.x, y: s.monster.y, t: 0.6 };
          }

          s.repathT -= dt;
          if (s.repathT <= 0) {
            s.repathT = 0.4;
            const startCell = worldToCell(s.monster.x, s.monster.y);
            const goalCell = worldToCell(goalX, goalY);
            const p = bfsPath(startCell, goalCell, s.blockedGrid);
            s.path = p || [];
            s.pathIdx = 1;
          }

          let targetX = goalX, targetY = goalY;
          if (s.path.length > 1) {
            while (s.pathIdx < s.path.length) {
              const wp = cellCenter(s.path[s.pathIdx].cx, s.path[s.pathIdx].cy);
              const dwp = Math.hypot(wp.x - s.monster.x, wp.y - s.monster.y);
              if (dwp < GRID * 0.7 && s.pathIdx < s.path.length - 1) { s.pathIdx++; continue; }
              targetX = wp.x; targetY = wp.y;
              break;
            }
          }

          if (s.web) {
            const dW = Math.hypot(s.monster.x - s.web.x, s.monster.y - s.web.y);
            if (dW < 26) mSpeed *= 0.05;
          }
          const dx = targetX - s.monster.x, dy = targetY - s.monster.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d > 2) s.monsterFacing = Math.atan2(dy, dx);
          s.monster.x += (dx / d) * mSpeed * dt;
          s.monster.y += (dy / d) * mSpeed * dt;
          s.monster.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x));
          s.monster.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y));
          activeWalls.forEach((wl) => circleRectPush(s.monster, MONSTER_R, wl));
        }

        // fire trail damage
        if (s.activeEffectAbility === "fuego" && s.activeEffectT > 0 && !s.monsterDefeated) {
          const d = Math.hypot(s.monster.x - s.player.x, s.monster.y - s.player.y);
          if (d < 60) {
            if (s.stunT <= 0) damageMonster(s);
            s.stunT = Math.max(s.stunT, 0.4);
          }
        }

        // collisions
        const threats = [
          ...(s.monsterDefeated ? [] : [{ x: s.monster.x, y: s.monster.y, r: MONSTER_R }]),
          ...s.cloneMonsters.filter((c) => c.stunT <= 0).map((c) => ({ x: c.x, y: c.y, r: MONSTER_R * 0.86 })),
        ];
        const caughtBy = threats.find((t) => Math.hypot(t.x - s.player.x, t.y - s.player.y) < PLAYER_R + t.r - 4);
        const stealthSafe = s.activeEffectAbility === "sigilo" && s.activeEffectT > 0;
        if (caughtBy && s.invuln <= 0 && !stealthSafe && !shieldActive) {
          if (s.activeEffectAbility === "clon" && s.activeEffectT > 0) {
            s.cloneVanish = { x: s.player.x - s.facing.x * 16, y: s.player.y - s.facing.y * 16, t: 0.5 };
            s.activeEffectT = 0;
            s.clonePos = null;
            s.invuln = 1.4;
          } else {
            s.lives -= 1;
            s.invuln = 1.6;
            s.player = { ...s.startPos };
            s.monster = { ...s.monsterStartPos };
            s.cloneMonsters = [];
            if (s.lives <= 0) s.status = "lost";
          }
        }
        const exitRect = { x: s.player.x - PLAYER_R, y: s.player.y - PLAYER_R, w: PLAYER_R * 2, h: PLAYER_R * 2 };
        if (rectsOverlap(exitRect, EXIT) && s.status !== "won") {
          s.status = "won";
          const bonus = 100 + Math.min(s.runCoins, 45);
          if (onWinCoins) onWinCoins(bonus);
        }

        setHud({ lives: s.lives, cd: Math.max(0, s.cd), status: s.status, level: s.level, monsterLives: s.monsterLives, monsterDefeated: s.monsterDefeated, energy: s.energy });
      }

      draw(ctx, s, ability);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ability, secondaryAbility]);

  function draw(ctx, s, abilityId) {
    const jungle = s.levelTheme === "jungle";
    const snow = s.levelTheme === "snow";
    const mountain = s.levelTheme === "mountain";
    const universe = s.levelTheme === "universe";
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    if (jungle) {
      const grdBg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grdBg.addColorStop(0, "#5FA860");
      grdBg.addColorStop(1, "#7FC47C");
      ctx.fillStyle = grdBg;
    } else if (snow) {
      const grdBg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grdBg.addColorStop(0, "#BFDCEE");
      grdBg.addColorStop(1, "#EAF4FA");
      ctx.fillStyle = grdBg;
    } else if (mountain) {
      const grdBg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grdBg.addColorStop(0, "#9FB3C4");
      grdBg.addColorStop(1, "#C7D2D9");
      ctx.fillStyle = grdBg;
    } else if (universe) {
      const grdBg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grdBg.addColorStop(0, "#0A0A1F");
      grdBg.addColorStop(1, "#1B1240");
      ctx.fillStyle = grdBg;
    } else {
      ctx.fillStyle = "#FBFAF5";
    }
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const camX = Math.max(0, Math.min(s.player.x - VIEW_W / 2, WORLD_W - VIEW_W));

    ctx.save();
    ctx.translate(-camX, 0);

    if (jungle) {
      // foliage clusters and hanging vines instead of the notebook grid
      JUNGLE_FOLIAGE.forEach((f) => {
        if (f.x < camX - 40 || f.x > camX + VIEW_W + 40) return;
        ctx.fillStyle = f.shade > 0.5 ? "#4E9C57" : "#5FAE65";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r, f.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      JUNGLE_TREES.forEach((t) => {
        if (t.x < camX - 60 || t.x > camX + VIEW_W + 60) return;
        const sway = Math.sin(s.time * 0.9 + t.x * 0.01) * 3;
        const baseY = WORLD_H - 14;
        const topY = baseY - t.trunkH;
        // trunk
        ctx.strokeStyle = "#4A3524";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(t.x, baseY);
        ctx.quadraticCurveTo(t.x + t.lean * t.trunkH * 0.5, baseY - t.trunkH * 0.5, t.x + sway * 0.3 + t.lean * t.trunkH, topY);
        ctx.stroke();
        // canopy: a few overlapping soft blobs, swaying gently
        const canopyShade = t.shade > 0.5 ? "#3E8A47" : "#4E9C57";
        ctx.fillStyle = canopyShade;
        ctx.globalAlpha = 0.9;
        [[-0.5, 0], [0.4, -0.3], [0, 0.35], [0.7, 0.2]].forEach(([dx, dy], i) => {
          ctx.beginPath();
          ctx.ellipse(
            t.x + sway + t.lean * t.trunkH + dx * t.canopyR,
            topY + dy * t.canopyR - t.canopyR * 0.3,
            t.canopyR * (0.55 + (i % 2) * 0.1),
            t.canopyR * 0.42,
            0, 0, Math.PI * 2
          );
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      });
      JUNGLE_VINES.forEach((v) => {
        if (v.x < camX - 20 || v.x > camX + VIEW_W + 20) return;
        const swayX = Math.sin(s.time * 1.2 + v.sway) * 6;
        ctx.strokeStyle = "rgba(60,120,55,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(v.x, 14);
        ctx.quadraticCurveTo(v.x + swayX, 14 + v.len * 0.5, v.x + swayX * 1.4, 14 + v.len);
        ctx.stroke();
      });
    } else if (snow) {
      // soft snow drifts on the ground
      SNOW_DRIFTS.forEach((d) => {
        if (d.x < camX - 40 || d.x > camX + VIEW_W + 40) return;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r, d.r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // falling snow
      SNOWFLAKES.forEach((f) => {
        const fx = f.x + Math.sin(s.time * 0.8 + f.drift) * 14;
        const fy = (f.y + s.time * f.speed) % WORLD_H;
        if (fx < camX - 10 || fx > camX + VIEW_W + 10) return;
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (mountain) {
      // distant jagged peaks with snow caps
      MOUNTAIN_PEAKS.forEach((p) => {
        if (p.x < camX - p.w || p.x > camX + VIEW_W + p.w) return;
        const baseY = 70;
        ctx.fillStyle = p.shade > 0.5 ? "#7C8B96" : "#8FA0AB";
        ctx.beginPath();
        ctx.moveTo(p.x - p.w / 2, baseY);
        ctx.lineTo(p.x, baseY - p.h);
        ctx.lineTo(p.x + p.w / 2, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.moveTo(p.x, baseY - p.h);
        ctx.lineTo(p.x - p.w * 0.14, baseY - p.h * 0.72);
        ctx.lineTo(p.x + p.w * 0.1, baseY - p.h * 0.78);
        ctx.lineTo(p.x + p.w * 0.14, baseY - p.h * 0.68);
        ctx.closePath();
        ctx.fill();
      });
      // scattered boulders on the ground
      MOUNTAIN_ROCKS.forEach((r) => {
        if (r.x < camX - 30 || r.x > camX + VIEW_W + 30) return;
        ctx.fillStyle = "rgba(110,116,120,0.5)";
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r, r.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // grid (only the visible span)
      ctx.strokeStyle = "#C9D6E8";
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      const gx0 = Math.floor(camX / 18) * 18;
      for (let x = gx0; x < camX + VIEW_W + 18; x += 18) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VIEW_H); ctx.stroke();
      }
      for (let y = 0; y < VIEW_H; y += 18) {
        ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + VIEW_W, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // black puddles
    s.levelPuddles.forEach((p) => {
      const grd = ctx.createRadialGradient(p.x - p.r * 0.25, p.y - p.r * 0.25, 1, p.x, p.y, p.r);
      grd.addColorStop(0, "#3A3A3A");
      grd.addColorStop(0.5, "#161615");
      grd.addColorStop(1, "#050504");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x - p.r * 0.25, p.y - p.r * 0.15, p.r * 0.35, p.r * 0.14, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    });

    // animals that throw rocks or snowballs — monkeys in the jungle, snowmen in the snow
    s.levelAnimals.forEach((a) => {
      const bob = Math.sin(s.time * 3 + a.x) * 2;
      if (snow) {
        const sy = a.y + bob;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "rgba(150,190,210,0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(a.x, sy + 7, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(a.x, sy - 5, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#2B2A28";
        ctx.beginPath(); ctx.arc(a.x - 2.2, sy - 7, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(a.x + 2.2, sy - 7, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#E8460F";
        ctx.beginPath();
        ctx.moveTo(a.x, sy - 5.3); ctx.lineTo(a.x + 6, sy - 4.3); ctx.lineTo(a.x, sy - 3.3);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#2B2A28";
        [0, 1, 2].forEach((k) => {
          ctx.beginPath();
          ctx.arc(a.x, sy + 3 + k * 3.4, 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.strokeStyle = "#2B2A28";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x - 9, sy - 1); ctx.lineTo(a.x - 15, sy - 5);
        ctx.moveTo(a.x + 9, sy - 1); ctx.lineTo(a.x + 15, sy - 5);
        ctx.stroke();
      } else if (mountain) {
        // mountain goat, standing on the rocky ledge
        const gy = a.y + bob;
        ctx.fillStyle = "#E8E4DC";
        ctx.beginPath(); ctx.ellipse(a.x, gy, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(a.x + 8, gy - 4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#5B5850";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(a.x + 6, gy - 8); ctx.quadraticCurveTo(a.x + 2, gy - 14, a.x + 8, gy - 17);
        ctx.moveTo(a.x + 10, gy - 8); ctx.quadraticCurveTo(a.x + 15, gy - 13, a.x + 10, gy - 17);
        ctx.stroke();
        ctx.strokeStyle = "#C9C3B8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x - 5, gy + 5); ctx.lineTo(a.x - 5, gy + 11);
        ctx.moveTo(a.x + 2, gy + 5); ctx.lineTo(a.x + 2, gy + 11);
        ctx.stroke();
        ctx.fillStyle = "#2B2A28";
        ctx.beginPath(); ctx.arc(a.x + 10, gy - 4, 1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#9B9186";
        ctx.beginPath(); ctx.moveTo(a.x + 13, gy - 4); ctx.lineTo(a.x + 17, gy - 3); ctx.lineTo(a.x + 13, gy - 2); ctx.fill();
      } else if (universe) {
        // little green alien, hovering slightly above the ground
        const gy2 = a.y + bob - 2;
        const hover = Math.sin(s.time * 2.2 + a.x) * 1.5;
        ctx.fillStyle = "rgba(140,220,150,0.25)";
        ctx.beginPath(); ctx.ellipse(a.x, a.y + 9, 9, 2.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#7ED17A";
        ctx.beginPath();
        ctx.ellipse(a.x, gy2 + hover + 3, 5, 6.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x, gy2 + hover - 3, 5.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1A1815";
        ctx.beginPath();
        ctx.ellipse(a.x - 2.2, gy2 + hover - 3, 1.6, 2.2, -0.2, 0, Math.PI * 2);
        ctx.ellipse(a.x + 2.2, gy2 + hover - 3, 1.6, 2.2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7ED17A";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x - 4, gy2 + hover + 7); ctx.lineTo(a.x - 6, gy2 + hover + 3);
        ctx.moveTo(a.x + 4, gy2 + hover + 7); ctx.lineTo(a.x + 6, gy2 + hover + 3);
        ctx.stroke();
        ctx.fillStyle = "#B8E8B0";
        ctx.beginPath(); ctx.arc(a.x - 6.5, gy2 + hover + 2.5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(a.x + 6.5, gy2 + hover + 2.5, 1, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#6B4423";
        ctx.beginPath();
        ctx.arc(a.x, a.y + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x - 6, a.y + bob - 6, 3, 0, Math.PI * 2);
        ctx.arc(a.x + 6, a.y + bob - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4A2F18";
        ctx.beginPath();
        ctx.arc(a.x, a.y + bob - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        // lighter muzzle patch
        ctx.fillStyle = "#C9A177";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y + bob - 0.5, 4.6, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // eyes with an occasional blink
        const blink = Math.sin(s.time * 2 + a.x) > 0.95;
        ctx.fillStyle = "#F4F1E9";
        ctx.beginPath();
        ctx.ellipse(a.x - 2.3, a.y + bob - 3.2, 1.6, blink ? 0.4 : 1.6, 0, 0, Math.PI * 2);
        ctx.ellipse(a.x + 2.3, a.y + bob - 3.2, 1.6, blink ? 0.4 : 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (!blink) {
          ctx.fillStyle = "#1A1815";
          ctx.beginPath();
          ctx.arc(a.x - 2.3, a.y + bob - 3.2, 0.85, 0, Math.PI * 2);
          ctx.arc(a.x + 2.3, a.y + bob - 3.2, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
        // mischievous eyebrows
        ctx.strokeStyle = "#2B1B0F";
        ctx.lineWidth = 0.9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x - 4.2, a.y + bob - 5.6); ctx.lineTo(a.x - 1, a.y + bob - 4.9);
        ctx.moveTo(a.x + 4.2, a.y + bob - 5.6); ctx.lineTo(a.x + 1, a.y + bob - 4.9);
        ctx.stroke();
        // open, cheeky grin
        ctx.fillStyle = "#3A2414";
        ctx.beginPath();
        ctx.ellipse(a.x, a.y + bob + 2.2, 2.4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#F4F1E9";
        ctx.fillRect(a.x - 1.5, a.y + bob + 1, 3, 0.9);
      }
    });

    // coins scattered around the walls
    s.levelCoins.forEach((c) => {
      if (c.taken) return;
      const spin = Math.cos(s.time * 4 + c.x * 0.05);
      const bob = Math.sin(s.time * 2.5 + c.x * 0.03) * 2;
      ctx.save();
      ctx.translate(c.x, c.y + bob);
      ctx.scale(Math.max(0.15, Math.abs(spin)), 1);
      const grd = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
      grd.addColorStop(0, "#FFE9A8");
      grd.addColorStop(0.6, "#E8C13B");
      grd.addColorStop(1, "#B8860B");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8A6510";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
    if (s.coinFx) {
      const fx = s.coinFx;
      ctx.fillStyle = "#E8C13B";
      ctx.globalAlpha = Math.min(1, fx.t / 0.4);
      const rise = (1 - fx.t / 0.4) * 16;
      ctx.font = "10px 'Kalam', cursive";
      ctx.fillText("+1", fx.x - 5, fx.y - rise);
      ctx.globalAlpha = 1;
    }

    // rocks / snowballs in flight
    s.rocks.forEach((r) => {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.t * 10);
      if (r.kind === "snowball") {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(150,190,210,0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = "#5B5850";
        ctx.beginPath();
        ctx.moveTo(-4, -3); ctx.lineTo(4, -2); ctx.lineTo(3, 4); ctx.lineTo(-3, 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // spikes hazard — icy on snow levels, otherwise bloody red
    s.levelSpikes.forEach((sp) => {
      const n = Math.max(2, Math.floor(sp.w / 14));
      ctx.fillStyle = snow ? "#BEE3F5" : "#8B1E1E";
      for (let i = 0; i < n; i++) {
        const tx0 = sp.x + (i * sp.w) / n;
        const tw = sp.w / n;
        ctx.beginPath();
        ctx.moveTo(tx0, sp.y + sp.h);
        ctx.lineTo(tx0 + tw / 2, sp.y);
        ctx.lineTo(tx0 + tw, sp.y + sp.h);
        ctx.closePath();
        ctx.fill();
        if (snow) {
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    // walls (skip destroyed ones, leave rubble behind)
    ctx.fillStyle = mountain ? "#6E7378" : "#2B2A28";
    s.levelWalls.forEach((wl, i) => {
      if (s.destroyedWalls.has(i)) {
        ctx.fillStyle = "rgba(58,52,46,0.35)";
        const n = 5;
        for (let k = 0; k < n; k++) {
          const rx = wl.x + ((k * 37) % Math.max(wl.w, 1));
          const ry = wl.y + ((k * 23) % Math.max(wl.h, 1));
          ctx.fillRect(rx, ry, 3, 3);
        }
        ctx.fillStyle = mountain ? "#6E7378" : "#2B2A28";
        return;
      }
      ctx.fillRect(wl.x, wl.y, wl.w, wl.h);
      if (snow) {
        ctx.fillStyle = "#FFFFFF";
        ctx.globalAlpha = 0.9;
        if (wl.w >= wl.h) {
          ctx.fillRect(wl.x, wl.y, wl.w, Math.min(6, wl.h * 0.4));
        } else {
          ctx.fillRect(wl.x, wl.y, Math.min(6, wl.w * 0.4), wl.h);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#2B2A28";
      }
      if (mountain && wl.w < 300 && wl.h < 300) {
        // stone block texture: mortar lines + a few cracks
        ctx.strokeStyle = "rgba(45,48,50,0.5)";
        ctx.lineWidth = 1;
        const step = 12;
        if (wl.w >= wl.h) {
          for (let bx = wl.x + step; bx < wl.x + wl.w; bx += step) {
            ctx.beginPath(); ctx.moveTo(bx, wl.y); ctx.lineTo(bx, wl.y + wl.h); ctx.stroke();
          }
          ctx.beginPath(); ctx.moveTo(wl.x, wl.y + wl.h / 2); ctx.lineTo(wl.x + wl.w, wl.y + wl.h / 2); ctx.stroke();
        } else {
          for (let by = wl.y + step; by < wl.y + wl.h; by += step) {
            ctx.beginPath(); ctx.moveTo(wl.x, by); ctx.lineTo(wl.x + wl.w, by); ctx.stroke();
          }
          ctx.beginPath(); ctx.moveTo(wl.x + wl.w / 2, wl.y); ctx.lineTo(wl.x + wl.w / 2, wl.y + wl.h); ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(wl.x, wl.y, wl.w, Math.min(3, wl.h * 0.25));
        ctx.fillStyle = "#6E7378";
      }
    });

    // exit
    ctx.fillStyle = "#3F8F5C";
    ctx.fillRect(EXIT.x - 4, EXIT.y, EXIT.w + 4, EXIT.h);
    ctx.fillStyle = "#2B2A28";
    ctx.font = "11px 'Patrick Hand', cursive";
    ctx.fillText("SALIDA", EXIT.x - 46, EXIT.y - 4);

    // victory signal at exit
    if (s.status === "won") {
      const pulse = 1 + Math.sin(s.time * 5) * 0.08;
      ctx.save();
      ctx.translate(EXIT.x - 26, EXIT.y - 30);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = "#3F8F5C";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-7, 0); ctx.lineTo(-2, 6); ctx.lineTo(8, -7);
      ctx.stroke();
      ctx.restore();
    }

    // web
    if (s.web) {
      ctx.strokeStyle = "#A87A2E";
      ctx.globalAlpha = Math.min(1, s.web.t / 2);
      ctx.beginPath();
      ctx.arc(s.web.x, s.web.y, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.moveTo(s.web.x - 24, s.web.y); ctx.lineTo(s.web.x + 24, s.web.y);
      ctx.moveTo(s.web.x, s.web.y - 24); ctx.lineTo(s.web.x, s.web.y + 24);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // lingering green smoke where the poison hit
    if (s.gas) {
      const grow = Math.min(1, (2.4 - s.gas.t) / 0.6);
      const r = 14 + grow * 28;
      const grd = ctx.createRadialGradient(s.gas.x, s.gas.y, 2, s.gas.x, s.gas.y, r);
      grd.addColorStop(0, "rgba(120,200,60,0.55)");
      grd.addColorStop(1, "rgba(76,154,42,0)");
      ctx.fillStyle = grd;
      ctx.globalAlpha = Math.min(1, s.gas.t / 0.8);
      ctx.beginPath(); ctx.arc(s.gas.x, s.gas.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // yellow spark burst where the shock hit
    if (s.spark) {
      ctx.strokeStyle = "#FFD23F";
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.min(1, s.spark.t / 0.45);
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2;
        const r2 = 8 + (1 - s.spark.t / 0.45) * 16;
        ctx.beginPath();
        ctx.moveTo(s.spark.x, s.spark.y);
        ctx.lineTo(s.spark.x + Math.cos(ang) * r2, s.spark.y + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // musical notes bursting where the guitar riff hit
    if (s.notesFx) {
      ctx.fillStyle = ABILITIES.roquero.accent;
      ctx.font = "13px sans-serif";
      ctx.globalAlpha = Math.min(1, s.notesFx.t / 0.6);
      const grow = 1 - s.notesFx.t / 0.6;
      [0, 1, 2].forEach((i) => {
        const ang = (i / 3) * Math.PI * 2 + 0.6;
        const r2 = 6 + grow * 22;
        ctx.fillText(
          i % 2 === 0 ? "♪" : "♫",
          s.notesFx.x + Math.cos(ang) * r2 - 5,
          s.notesFx.y + Math.sin(ang) * r2 - grow * 10
        );
      });
      ctx.globalAlpha = 1;
    }

    // laser beam from the head
    if (s.laserFx) {
      const fx = s.laserFx;
      const alpha = Math.max(0, Math.min(1, fx.t / 0.5));
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#FFD3D3";
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(fx.x1, fx.y1); ctx.lineTo(fx.x2, fx.y2); ctx.stroke();
      ctx.strokeStyle = ABILITIES.laser.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(fx.x1, fx.y1); ctx.lineTo(fx.x2, fx.y2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // rubble burst where the laser broke a wall
    if (s.wallBreakFx) {
      const fx = s.wallBreakFx;
      ctx.fillStyle = "#5B5850";
      ctx.globalAlpha = Math.min(1, fx.t / 0.5);
      const grow = 1 - fx.t / 0.5;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const r2 = 4 + grow * 26;
        ctx.fillRect(fx.x + Math.cos(ang) * r2 - 2, fx.y + Math.sin(ang) * r2 - 2, 4, 4);
      }
      ctx.globalAlpha = 1;
    }

    // monster's black fireball
    if (s.monsterFireball) {
      const fb = s.monsterFireball;
      const grd = ctx.createRadialGradient(fb.x, fb.y, 1, fb.x, fb.y, 12);
      grd.addColorStop(0, "#3D0A4A");
      grd.addColorStop(0.55, "#160414");
      grd.addColorStop(1, "rgba(10,2,14,0)");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(fb.x, fb.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(150,30,150,0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fb.x, fb.y, 8 + Math.sin(fb.t * 22) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (s.fireballBurst) {
      const fx = s.fireballBurst;
      ctx.strokeStyle = "rgba(150,30,150,0.8)";
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.min(1, fx.t / 0.5);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const r2 = 6 + (1 - fx.t / 0.5) * 22;
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x + Math.cos(ang) * r2, fx.y + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // burst where the monster split into clones
    if (s.tripleFx) {
      const fx = s.tripleFx;
      ctx.strokeStyle = "rgba(155,79,150,0.85)";
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = Math.min(1, fx.t / 0.6);
      const grow = 1 - fx.t / 0.6;
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const r2 = 6 + grow * 34;
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x + Math.cos(ang) * r2, fx.y + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // --- super-ability visuals ---
    if (s.slowAura) {
      ctx.strokeStyle = ABILITIES.viento.accent;
      ctx.globalAlpha = Math.min(1, s.slowAura.t / 5) * 0.55;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(s.slowAura.x, s.slowAura.y, s.slowAura.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const grd = ctx.createRadialGradient(s.slowAura.x, s.slowAura.y, 0, s.slowAura.x, s.slowAura.y, s.slowAura.r);
      grd.addColorStop(0, "rgba(80,150,200,0.12)");
      grd.addColorStop(1, "rgba(80,150,200,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(s.slowAura.x, s.slowAura.y, s.slowAura.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (s.clockProj) {
      const cp = s.clockProj;
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.strokeStyle = ABILITIES.tiempo.accent;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.6;
      [5, 8, 11].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, cp.t * 6 + i, cp.t * 6 + i + 4.2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = ABILITIES.tiempo.accent;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#F4F1E9";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -2.6);
      ctx.moveTo(0, 0); ctx.lineTo(1.6, 0.6);
      ctx.stroke();
      ctx.restore();
    }
    if (!s.monsterDefeated && s.freezeT > 0) {
      ctx.strokeStyle = ABILITIES.tiempo.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(s.monster.x, s.monster.y, MONSTER_R + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    s.cloneMonsters.forEach((c) => {
      if (c.stunT > 0 && s.freezeT > 0) {
        ctx.strokeStyle = ABILITIES.tiempo.accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, MONSTER_R * 0.86 + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    if (s.freezeT > 0) {
      ctx.fillStyle = "rgba(63,160,137,0.08)";
      ctx.fillRect(camX, 0, VIEW_W, WORLD_H);
    }

    if (s.electricWall) {
      const ew = s.electricWall;
      const hx = Math.cos(ew.angle) * ew.len, hy = Math.sin(ew.angle) * ew.len;
      ctx.strokeStyle = ABILITIES.electrico.accent;
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(s.time * 30);
      ctx.beginPath();
      ctx.moveTo(ew.x - hx, ew.y - hy);
      ctx.lineTo(ew.x + hx, ew.y + hy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    s.burningWalls.forEach((bw) => {
      const grd = ctx.createRadialGradient(bw.x, bw.y, 1, bw.x, bw.y, 30);
      grd.addColorStop(0, "rgba(255,170,50,0.35)");
      grd.addColorStop(1, "rgba(232,70,15,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(bw.x, bw.y, 30, 0, Math.PI * 2);
      ctx.fill();

      const n = 5;
      for (let i = 0; i < n; i++) {
        const off = (i - (n - 1) / 2) * 8;
        const wob = Math.sin(s.time * 10 + i * 1.7 + bw.x) * 0.5 + 0.5;
        const h = 12 + wob * 9;
        const flick = Math.sin(s.time * 15 + i * 2) * 3;
        const fx = bw.x + off, fy = bw.y + 10;
        const g2 = ctx.createLinearGradient(fx, fy, fx + flick, fy - h);
        g2.addColorStop(0, "rgba(200,40,10,0.95)");
        g2.addColorStop(0.5, "rgba(255,150,40,0.9)");
        g2.addColorStop(1, "rgba(255,220,110,0.2)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(fx - 3.2, fy);
        ctx.quadraticCurveTo(fx + flick - 4, fy - h * 0.5, fx + flick * 0.5, fy - h);
        ctx.quadraticCurveTo(fx + flick + 4, fy - h * 0.5, fx + 3.2, fy);
        ctx.closePath();
        ctx.fill();
      }
      // rising embers off the burning wall
      for (let i = 0; i < 3; i++) {
        const ph = (s.time * 1.2 + i * 0.5 + bw.y * 0.01) % 1;
        const ex = bw.x + Math.sin(s.time * 4 + i) * 10;
        const ey = bw.y - ph * 30;
        ctx.fillStyle = `rgba(255,200,90,${0.75 * (1 - ph)})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    s.vineWalls.forEach((vw) => {
      const grow = Math.min(1, vw.t > 5 ? (6 - vw.t) / 1 : 1);
      for (let i = 0; i < 3; i++) {
        const ang = i * 2.1;
        const len = 30 * grow;
        const sway = Math.sin(s.time * 2.4 + i * 1.6) * 8;
        ctx.strokeStyle = "#3D8A34";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(vw.x, vw.y);
        const mx1 = vw.x + Math.cos(ang) * len * 0.4 + sway * 0.4;
        const my1 = vw.y + Math.sin(ang) * len * 0.4;
        const ex1 = vw.x + Math.cos(ang) * len + sway;
        const ey1 = vw.y + Math.sin(ang) * len;
        ctx.quadraticCurveTo(mx1, my1, ex1, ey1);
        ctx.stroke();
        // little leaves along the vine
        ctx.fillStyle = "#5CAE4E";
        [0.45, 0.8].forEach((t) => {
          const lx = vw.x + (ex1 - vw.x) * t;
          const ly = vw.y + (ey1 - vw.y) * t;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(ang + Math.sin(s.time * 3 + i) * 0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        // curling tendril tip
        ctx.strokeStyle = "#3D8A34";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(ex1 + Math.cos(ang) * 3, ey1 + Math.sin(ang) * 3, 2.4, 0, Math.PI * 1.5);
        ctx.stroke();
      }
    });

    s.decoyClones.forEach((dc) => {
      ctx.globalAlpha = 0.55 + Math.sin(s.time * 6) * 0.1;
      ctx.strokeStyle = ABILITIES.clon.accent;
      ctx.fillStyle = ABILITIES.clon.accent;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(dc.x, dc.y - 10, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dc.x, dc.y - 6); ctx.lineTo(dc.x, dc.y + 2);
      ctx.moveTo(dc.x, dc.y - 4); ctx.lineTo(dc.x - 4, dc.y);
      ctx.moveTo(dc.x, dc.y - 4); ctx.lineTo(dc.x + 4, dc.y);
      ctx.moveTo(dc.x, dc.y + 2); ctx.lineTo(dc.x - 3, dc.y + 9);
      ctx.moveTo(dc.x, dc.y + 2); ctx.lineTo(dc.x + 3, dc.y + 9);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    s.sawProjectiles.forEach((sp) => {
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(sp.t * 22);
      ctx.fillStyle = "#B7BEC4";
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4A4E52";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 8; i++) {
        const a2 = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a2) * 6, Math.sin(a2) * 6);
        ctx.lineTo(Math.cos(a2) * 10, Math.sin(a2) * 10);
        ctx.stroke();
      }
      ctx.restore();
    });

    s.tornadoProjs.forEach((tp2) => {
      ctx.strokeStyle = ABILITIES.tornado.accent;
      ctx.fillStyle = "rgba(92,138,166,0.25)";
      ctx.save();
      ctx.translate(tp2.x, tp2.y);
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 4 + i * 3, s.time * -20 + i, s.time * -20 + i + 3.2);
        ctx.stroke();
      }
      ctx.restore();
    });

    if (s.shockwaveFx) {
      const fx = s.shockwaveFx;
      const grow = 1 - fx.t / 0.5;
      ctx.strokeStyle = ABILITIES.roquero.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.min(1, fx.t / 0.5);
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 20 + grow * 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (s.laserStormT > 0) {
      ctx.strokeStyle = ABILITIES.laser.accent;
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const ang = s.time * 12 + (i / 10) * Math.PI * 2;
        const ex = s.player.x + Math.cos(ang) * 90;
        const ey = s.player.y + Math.sin(ang) * 90;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(s.player.x, s.player.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // flying projectile
    if (s.projectile) {
      const p = s.projectile;
      const ang = Math.atan2(p.vy, p.vx);
      if (p.kind === "electrico") {
        ctx.strokeStyle = "#FFD23F";
        ctx.fillStyle = "#FFD23F";
        ctx.lineWidth = 2.4;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(-8, -3); ctx.lineTo(1, -1); ctx.lineTo(-2, 1); ctx.lineTo(8, 3);
        ctx.stroke();
        ctx.restore();
      } else if (p.kind === "roquero") {
        ctx.fillStyle = ABILITIES.roquero.accent;
        ctx.font = "15px sans-serif";
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.sin(p.t * 14) * 0.3);
        ctx.fillText("♪", -5, 5);
        ctx.restore();
      } else {
        const grd = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 9);
        grd.addColorStop(0, "rgba(150,220,90,0.9)");
        grd.addColorStop(1, "rgba(76,154,42,0.05)");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
      }
    }
    // fire trail — living flames licking up around the player, with rising embers
    if (s.activeEffectAbility === "fuego" && s.activeEffectT > 0) {
      const grd = ctx.createRadialGradient(s.player.x, s.player.y, 2, s.player.x, s.player.y, 58);
      grd.addColorStop(0, "rgba(255,190,60,0.35)");
      grd.addColorStop(1, "rgba(232,70,15,0)");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(s.player.x, s.player.y, 58, 0, Math.PI * 2); ctx.fill();

      const flameCount = 7;
      for (let i = 0; i < flameCount; i++) {
        const ang = (i / flameCount) * Math.PI * 2 + s.time * 0.6;
        const wob = Math.sin(s.time * 9 + i * 2) * 0.5 + 0.5;
        const baseR = 14 + wob * 6;
        const fx = s.player.x + Math.cos(ang) * baseR;
        const fy = s.player.y + Math.sin(ang) * baseR * 0.6;
        const h = 10 + wob * 10;
        const flick = Math.sin(s.time * 16 + i) * 2;
        const flameGrd = ctx.createLinearGradient(fx, fy, fx + flick, fy - h);
        flameGrd.addColorStop(0, "rgba(232,70,15,0.9)");
        flameGrd.addColorStop(0.55, "rgba(255,150,40,0.85)");
        flameGrd.addColorStop(1, "rgba(255,224,120,0.15)");
        ctx.fillStyle = flameGrd;
        ctx.beginPath();
        ctx.moveTo(fx - 3, fy);
        ctx.quadraticCurveTo(fx + flick - 4, fy - h * 0.55, fx + flick * 0.5, fy - h);
        ctx.quadraticCurveTo(fx + flick + 4, fy - h * 0.55, fx + 3, fy);
        ctx.closePath();
        ctx.fill();
      }

      for (let i = 0; i < 5; i++) {
        const ph = (s.time * 1.4 + i * 0.37) % 1;
        const ang = i * 2.1;
        const ex = s.player.x + Math.cos(ang) * (10 + ph * 14);
        const ey = s.player.y - ph * 34 + Math.sin(s.time * 3 + i) * 3;
        ctx.fillStyle = `rgba(255,${190 + Math.floor(ph * 40)},80,${0.8 * (1 - ph)})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.6 * (1 - ph * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // decoy clone, drawn as a faded double before the real player
    if (s.clonePos) {
      ctx.globalAlpha = 0.5 + Math.sin(s.time * 6) * 0.1;
      ctx.strokeStyle = ABILITIES.clon.accent;
      ctx.fillStyle = ABILITIES.clon.accent;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      const cx = s.clonePos.x, cy = s.clonePos.y;
      ctx.beginPath(); ctx.arc(cx, cy - 15, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9.5); ctx.lineTo(cx, cy + 2);
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx - 6.5, cy + 2);
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx + 6.5, cy + 2);
      ctx.moveTo(cx, cy + 2); ctx.lineTo(cx - 4.5, cy + 15);
      ctx.moveTo(cx, cy + 2); ctx.lineTo(cx + 4.5, cy + 15);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // burst where a clone was sacrificed
    if (s.cloneVanish) {
      ctx.strokeStyle = ABILITIES.clon.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.min(1, s.cloneVanish.t / 0.5);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const r2 = 6 + (1 - s.cloneVanish.t / 0.5) * 18;
        ctx.beginPath();
        ctx.moveTo(s.cloneVanish.x, s.cloneVanish.y);
        ctx.lineTo(s.cloneVanish.x + Math.cos(ang) * r2, s.cloneVanish.y + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // player
    drawPlayer(ctx, s, abilityId);

    // charging ring while holding the ability button toward a super
    if (s.chargeT > 0 && s.chargeT < SUPER_HOLD) {
      const t = s.chargeT / SUPER_HOLD;
      ctx.strokeStyle = ABILITIES[abilityId].accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(s.player.x, s.player.y, PLAYER_R + 8, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (s.chargeT2 > 0 && s.chargeT2 < SUPER_HOLD) {
      const t2 = s.chargeT2 / SUPER_HOLD;
      ctx.strokeStyle = secondaryAbility ? ABILITIES[secondaryAbility].accent : "#B8860B";
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(s.player.x, s.player.y, PLAYER_R + 14, -Math.PI / 2, -Math.PI / 2 + t2 * Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // super ability burst
    if (s.superFx) {
      const fx = s.superFx;
      const grow = 1 - fx.t / 0.6;
      ctx.strokeStyle = fx.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.min(1, fx.t / 0.6);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 20 + grow * (100 + i * 22), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // sierra shield orbiting the player
    if (s.activeEffectAbility === "sierra" && s.activeEffectT > 0) {
      const spin = s.time * 9;
      [spin, spin + Math.PI].forEach((ang) => {
        const sx = s.player.x + Math.cos(ang) * 20;
        const sy = s.player.y + Math.sin(ang) * 20;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(s.time * 26);
        ctx.fillStyle = "#B7BEC4";
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4A4E52";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 8; i++) {
          const a2 = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a2) * 6, Math.sin(a2) * 6);
          ctx.lineTo(Math.cos(a2) * 10, Math.sin(a2) * 10);
          ctx.stroke();
        }
        ctx.fillStyle = "#5C6266";
        ctx.beginPath();
        ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // tornado carrying the player, and the twin funnel flying the other way
    if (s.tornadoT > 0) {
      ctx.strokeStyle = ABILITIES.tornado.accent;
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(s.player.x, s.player.y, 12 + i * 6, s.time * -16 + i, s.time * -16 + i + 4.2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (s.tornadoProj) {
      const tp = s.tornadoProj;
      ctx.strokeStyle = ABILITIES.tornado.accent;
      ctx.fillStyle = "rgba(92,138,166,0.25)";
      ctx.save();
      ctx.translate(tp.x, tp.y);
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 5 + i * 4, s.time * -20 + i, s.time * -20 + i + 3.4);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (s.tornadoBurst) {
      const fx = s.tornadoBurst;
      ctx.strokeStyle = ABILITIES.tornado.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.min(1, fx.t / 0.5);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + s.time * 6;
        const r2 = 8 + (1 - fx.t / 0.5) * 30;
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x + Math.cos(ang) * r2, fx.y + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // monster — drawn in profile, oriented toward its facing direction
    const stunned = s.stunT > 0;
    const dancing = s.danceT > 0;
    const R = MONSTER_R;

    if (!s.monsterDefeated) {
      drawMonsterBody(ctx, s, abilityId, {
        x: s.monster.x,
        y: s.monster.y,
        facingAngle: s.monsterFacing,
        stunned,
        dancing,
        alpha: 1,
        seed: 0,
        echo: false,
      });
    }

    s.cloneMonsters.forEach((c, i) => {
      drawMonsterBody(ctx, s, abilityId, {
        x: c.x,
        y: c.y,
        facingAngle: c.facing,
        stunned: c.stunT > 0,
        dancing: false,
        alpha: 0.82,
        seed: i * 2.1 + 1,
        echo: true,
      });
      if (c.lungeTelegraph > 0) {
        const alphaT = 0.5 + 0.5 * Math.sin(s.time * 30);
        ctx.strokeStyle = `rgba(200,30,30,${alphaT})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, MONSTER_R * 0.86 + 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (c.fireball) {
        const fb = c.fireball;
        const grd = ctx.createRadialGradient(fb.x, fb.y, 1, fb.x, fb.y, 11);
        grd.addColorStop(0, "#3D0A4A");
        grd.addColorStop(0.55, "#160414");
        grd.addColorStop(1, "rgba(10,2,14,0)");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(fb.x, fb.y, 11, 0, Math.PI * 2); ctx.fill();
      }
    });

    // defeat burst where the main monster fell
    if (s.defeatFx) {
      const fx = s.defeatFx;
      ctx.strokeStyle = "#3A342E";
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = Math.min(1, fx.t / 0.9);
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const r2 = 8 + (1 - fx.t / 0.9) * 40;
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x + Math.cos(ang) * r2, fx.y + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // stolen life coin
    if (s.stealFx) {
      const fx = s.stealFx;
      ctx.fillStyle = ABILITIES.ladron.accent;
      ctx.globalAlpha = Math.min(1, fx.t / 0.6);
      const rise = (1 - fx.t / 0.6) * 24;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y - rise, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FBFAF5";
      ctx.font = "8px 'Kalam', cursive";
      ctx.fillText("♥", fx.x - 3, fx.y - rise + 3);
      ctx.globalAlpha = 1;
    }

    // notes floating above the monster while it's dancing (kept upright, outside its rotation)
    if (dancing) {
      ctx.fillStyle = ABILITIES.roquero.accent;
      ctx.font = "14px sans-serif";
      for (let i = 0; i < 3; i++) {
        const ang = s.time * 3 + i * ((Math.PI * 2) / 3);
        const nx = s.monster.x + Math.cos(ang) * 24;
        const ny = s.monster.y - R * 2.1 + Math.sin(s.time * 5 + i) * 4;
        ctx.fillText(i % 2 === 0 ? "♪" : "♫", nx, ny);
      }
    }

    // warning ring before the monster lunges
    if (s.monsterLungeTelegraph > 0) {
      const alpha = 0.5 + 0.5 * Math.sin(s.time * 30);
      ctx.strokeStyle = `rgba(200,30,30,${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(s.monster.x, s.monster.y, R + 11, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (s.teleportFx) {
      const fx = s.teleportFx;
      ctx.strokeStyle = ABILITIES.fase.accent;
      ctx.globalAlpha = Math.max(0, fx.t / 0.4) * 0.7;
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx.fromX, fx.fromY);
      ctx.lineTo(fx.toX, fx.toY);
      ctx.stroke();
      ctx.setLineDash([]);
      [{ x: fx.fromX, y: fx.fromY }, { x: fx.toX, y: fx.toY }].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10 * (1 - fx.t / 0.4), 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawMonsterBody(ctx, s, abilityId, o) {
    const { x: mx, y: my, facingAngle, stunned, dancing, alpha = 1, seed = 0, echo = false } = o;
    const stunColor = abilityId === "mutar" ? "#7BAE55" : abilityId === "electrico" ? "#E8C64A" : "#8A8378";
    const bodyColor = dancing ? ABILITIES.roquero.accent : stunned ? stunColor : echo ? "#4B3F55" : "#3A342E";
    const wob = stunned ? 0 : dancing ? Math.abs(Math.sin(s.time * 10 + seed)) * 4 : Math.sin(s.time * 8 + seed) * 2;
    const R = MONSTER_R * (echo ? 0.86 : 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(mx, my + wob);
    ctx.rotate(facingAngle + (dancing ? Math.sin(s.time * 10 + seed) * 0.12 : 0));

    // tentacles trailing behind (in -x, local space), long and wavy
    const tCount = 6;
    const tLenMul = [0.85, 1, 0.6, 1.1, 0.7, 0.95];
    for (let i = 0; i < tCount; i++) {
      const baseY = -R * 0.85 + (i / (tCount - 1)) * R * 1.7;
      const length = R * 4.3 * tLenMul[i];
      ctx.strokeStyle = dancing ? ABILITIES.roquero.accent : stunned ? stunColor : echo ? "#4B3F55" : "#3A342E";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let k = 0; k <= 10; k++) {
        const tt = k / 10;
        const segX = -R * 1.05 - length * tt;
        const wave = stunned
          ? tt * tt * R * 1.4
          : dancing
          ? Math.sin(s.time * 8 + tt * 4 + seed) * (R * 1.1) * tt
          : Math.sin(s.time * 3.1 + i * 0.9 + seed + tt * 5.5) * (R * 0.75) * tt;
        const segY = baseY + wave;
        if (k === 0) ctx.moveTo(segX, segY);
        else ctx.lineTo(segX, segY);
      }
      ctx.stroke();
    }

    // body silhouette (elongated, pointed snout forward at +x)
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-R * 1.1, -R * 0.5);
    ctx.quadraticCurveTo(0, -R * 1.15, R * 1.3, -R * 0.15);
    ctx.quadraticCurveTo(R * 1.65, 0, R * 1.3, R * 0.25);
    ctx.quadraticCurveTo(0, R * 1.05, -R * 1.1, R * 0.5);
    ctx.quadraticCurveTo(-R * 1.4, 0, -R * 1.1, -R * 0.5);
    ctx.closePath();
    ctx.fill();
    if (echo) {
      ctx.strokeStyle = "rgba(155,79,150,0.55)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // open mouth cavity at the snout, with fangs
    ctx.fillStyle = "#0F0D0B";
    ctx.beginPath();
    ctx.moveTo(R * 0.72, -R * 0.14);
    ctx.lineTo(R * 1.58, 0.02 * R);
    ctx.lineTo(R * 0.72, R * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#F2EDE0";
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const px = R * 0.72 + (R * 1.5 - R * 0.72) * t;
      const py = -R * 0.14 + (0.02 * R - -R * 0.14) * t;
      ctx.beginPath();
      ctx.moveTo(px - 2, py);
      ctx.lineTo(px + 2, py);
      ctx.lineTo(px, py + R * 0.32);
      ctx.fill();
    }
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const px = R * 0.72 + (R * 1.5 - R * 0.72) * t;
      const py = R * 0.22 + (0.02 * R - R * 0.22) * t;
      ctx.beginPath();
      ctx.moveTo(px - 2, py);
      ctx.lineTo(px + 2, py);
      ctx.lineTo(px, py - R * 0.3);
      ctx.fill();
    }

    // triangular eyes, pointing downward
    const blink = !stunned && Math.sin(s.time * 1.7 + seed) > 0.965;
    [
      { ex: R * 0.02, ey: -R * 0.55, sz: R * 0.34 },
      { ex: R * 0.5, ey: -R * 0.42, sz: R * 0.26 },
    ].forEach(({ ex, ey, sz }) => {
      ctx.fillStyle = stunned ? "#EDEAE0" : "#1A1815";
      ctx.strokeStyle = "rgba(242,237,224,0.4)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      if (blink) {
        ctx.moveTo(ex - sz, ey);
        ctx.lineTo(ex + sz, ey);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "#1A1815";
        ctx.stroke();
      } else {
        ctx.moveTo(ex - sz, ey - sz * 0.55);
        ctx.lineTo(ex + sz, ey - sz * 0.55);
        ctx.lineTo(ex, ey + sz * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (!stunned) {
          ctx.fillStyle = "rgba(242,237,224,0.7)";
          ctx.beginPath();
          ctx.arc(ex, ey - sz * 0.1, sz * 0.14, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    ctx.restore();
  }

  function drawPlayer(ctx, s, abilityId) {
    const { x, y } = s.player;
    const bodyColor = s.playerColor || "#2B2A28";
    const stealthActive = s.activeEffectAbility === "sigilo" && s.activeEffectT > 0;

    if (s.characterKind && s.characterKind !== "stickman") {
      ctx.save();
      ctx.globalAlpha = s.invuln > 0 ? 0.5 + 0.5 * Math.sin(s.time * 20) : 1;
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(s.facing.y, s.facing.x));

      if (s.characterKind === "snake") {
        // stickman-style body: a chain of straight jointed segments (like connected
        // limbs) zigzagging behind the head, in profile, much longer than before
        const nSeg = 8;
        const segLen = 9.5;
        const wobbleAmp = s.moving ? 0.6 : 0.22;
        ctx.strokeStyle = "#3D8A34";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        let px = 2, py = 0;
        ctx.moveTo(px, py);
        const jointPts = [[px, py]];
        for (let i = 0; i < nSeg; i++) {
          const wave = Math.sin(s.time * 6 - i * 1.15) * wobbleAmp;
          const ang = Math.PI + wave;
          px += Math.cos(ang) * segLen;
          py += Math.sin(ang) * segLen;
          ctx.lineTo(px, py);
          jointPts.push([px, py]);
        }
        ctx.stroke();

        // head, in profile — big and round, like the sketch
        ctx.fillStyle = "#3D8A34";
        ctx.beginPath(); ctx.arc(5, 0, 6.2, 0, Math.PI * 2); ctx.fill();

        // wide open mouth with jagged zigzag teeth on both jaws, like a bite mark
        const jawOpen = 4.4 + Math.sin(s.time * 5) * 0.7;
        ctx.fillStyle = "#0F0D0B";
        ctx.beginPath();
        ctx.moveTo(6.5, -jawOpen * 0.6);
        ctx.lineTo(17, -0.6);
        ctx.lineTo(17, 0.6);
        ctx.lineTo(6.5, jawOpen * 0.6);
        ctx.closePath();
        ctx.fill();
        // zigzag teeth along the top and bottom jaw
        ctx.fillStyle = "#F4F1E9";
        const teeth = 4;
        for (let i = 0; i < teeth; i++) {
          const t0 = i / teeth, t1 = (i + 0.62) / teeth;
          const bx0 = 6.5 + (17 - 6.5) * t0, by0 = -jawOpen * 0.58 * (1 - t0);
          const bx1 = 6.5 + (17 - 6.5) * t1, by1 = -jawOpen * 0.58 * (1 - t1);
          ctx.beginPath();
          ctx.moveTo(bx0, by0);
          ctx.lineTo(bx1, by1);
          ctx.lineTo((bx0 + bx1) / 2, by0 + 1.6);
          ctx.fill();
          const cy0 = jawOpen * 0.58 * (1 - t0), cy1 = jawOpen * 0.58 * (1 - t1);
          ctx.beginPath();
          ctx.moveTo(bx0, cy0);
          ctx.lineTo(bx1, cy1);
          ctx.lineTo((bx0 + bx1) / 2, cy0 - 1.6);
          ctx.fill();
        }

        // eye
        ctx.fillStyle = "#1A1815";
        ctx.beginPath(); ctx.arc(4, -4, 1.1, 0, Math.PI * 2); ctx.fill();

        // little hiss marks above the head, like the sketch
        ctx.strokeStyle = "#3D8A34";
        ctx.lineWidth = 0.8;
        [0, 1, 2].forEach((i) => {
          const bob = Math.sin(s.time * 5 + i * 2) * 0.6;
          ctx.beginPath();
          ctx.arc(6 + i * 2.2, -10 - i * 0.6 + bob, 0.6, 0, Math.PI * 2);
          ctx.stroke();
        });

        if (Math.sin(s.time * 6) > 0.5) {
          ctx.strokeStyle = "#E63946";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(17, 0); ctx.lineTo(21, 0); ctx.lineTo(23, -1.5);
          ctx.moveTo(21, 0); ctx.lineTo(23, 1.5);
          ctx.stroke();
        }
      } else if (s.characterKind === "chitor") {
        // built entirely from straight segments, stickman-style, matching the sketch:
        // a straight spine, a neck that shoots up to a sharp peak, angular bent-knee
        // legs ending in oval paws, oval ears, and a scatter of scribbly spots
        const g = s.moving ? s.time * 10 : 0;
        const flex = s.moving ? Math.sin(g) : 0;
        const frontReach = Math.max(0, flex) * 9;
        const frontTuck = Math.max(0, -flex) * 5;
        const backReach = Math.max(0, flex) * 9;
        const backTuck = Math.max(0, -flex) * 5;

        ctx.strokeStyle = "#E8B93F";
        ctx.fillStyle = "#E8B93F";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // tail — a straight line with one bend
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(-15, 2 + Math.sin(s.time * 8) * 2);
        ctx.lineTo(-21, Math.sin(s.time * 8 + 1) * 3);
        ctx.stroke();

        // spine — one straight line from hip to shoulder
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(6, -1);
        ctx.stroke();

        // neck — shoots straight up at a steep angle, then bends to a sharp peak
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(6, -1);
        ctx.lineTo(11, -13);
        ctx.lineTo(13, -19);
        ctx.stroke();

        // head, at the top, with two oval ears
        ctx.beginPath(); ctx.ellipse(14.5, -21, 3.6, 3, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, -24.5, 1.3, 2, -0.5, 0, Math.PI * 2);
        ctx.ellipse(16.2, -24, 1.3, 2, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2B2A28";
        ctx.beginPath(); ctx.arc(16.8, -21.3, 0.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#2B2A28";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(16, -19.6); ctx.lineTo(15, -17.6); ctx.stroke();

        // legs — sharp triangular bend at the knee, exactly like the sketch,
        // ending in a small oval paw
        ctx.strokeStyle = "#E8B93F";
        ctx.fillStyle = "#E8B93F";
        ctx.lineWidth = 2;
        const frontKneeX = 6 + frontReach * 0.45 - frontTuck * 0.3, frontKneeY = 4 - frontTuck * 2;
        const frontPawX = 6 + frontReach - frontTuck * 0.5, frontPawY = 8 - frontTuck * 3;
        const backKneeX = -7 - backReach * 0.45 + backTuck * 0.3, backKneeY = 4 - backTuck * 2;
        const backPawX = -7 - backReach + backTuck * 0.5, backPawY = 8 - backTuck * 3;
        ctx.beginPath();
        ctx.moveTo(6, -1);
        ctx.lineTo(frontKneeX, frontKneeY);
        ctx.lineTo(frontPawX, frontPawY);
        ctx.moveTo(-7, 0);
        ctx.lineTo(backKneeX, backKneeY);
        ctx.lineTo(backPawX, backPawY);
        ctx.stroke();
        ctx.beginPath(); ctx.ellipse(frontPawX, frontPawY, 1.7, 1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(backPawX, backPawY, 1.7, 1, 0, 0, Math.PI * 2); ctx.fill();

        // scribbly spots scattered near the torso, like the sketch
        ctx.fillStyle = "#2B2A28";
        [[1, -3], [-2, -1], [3, 0], [-4, 2], [0, 2], [-1.5, -4.5]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(dx, dy, 0.85, 0, Math.PI * 2); ctx.fill();
        });
      } else if (s.characterKind === "red") {
        const gait = s.moving ? Math.sin(s.time * 13) : 0;
        const pA = gait * 6, pB = -gait * 6;
        ctx.strokeStyle = "#C23B3B";
        ctx.fillStyle = "#C23B3B";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-6, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(10, 0, 4.6, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(6, 2); ctx.lineTo(6 + pA * 0.4, 8);
        ctx.moveTo(6, -2); ctx.lineTo(6 + pB * 0.4, -8);
        ctx.moveTo(-5, -2); ctx.lineTo(-5 + pA * 0.4, -8);
        ctx.moveTo(-5, 2); ctx.lineTo(-5 + pB * 0.4, 8);
        ctx.stroke();
        ctx.strokeStyle = "#8F2A2A";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(-22, Math.sin(s.time * 7) * 6, -38, Math.sin(s.time * 7 + 1) * 5);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }

    ctx.save();
    if (s.tornadoT > 0) {
      ctx.translate(x, y);
      ctx.rotate(s.time * 22);
      ctx.translate(-x, -y);
    }
    ctx.globalAlpha = stealthActive ? 0.35 : s.invuln > 0 ? 0.5 + 0.5 * Math.sin(s.time * 20) : 1;

    if (s.dashT > 0) {
      ctx.strokeStyle = ABILITIES.viento.accent;
      ctx.globalAlpha *= 0.6;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(x - s.facing.x * i * 9, y - s.facing.y * i * 9, PLAYER_R - i * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      // horizontal wind-tunnel streaks trailing behind, like the sketch
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        const off = (i - 2.5) * 4.5;
        const len = 14 + (i % 3) * 6;
        const bx = x - s.facing.x * 10 - s.facing.y * off;
        const by = y - s.facing.y * 10 + s.facing.x * off;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - s.facing.x * len, by - s.facing.y * len);
        ctx.stroke();
      }
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = stealthActive ? 0.35 : 1;
    }

    if (s.vientoAura) {
      const fx = s.vientoAura;
      const grow = 1 - fx.t / 0.5;
      ctx.strokeStyle = ABILITIES.viento.accent;
      ctx.globalAlpha = Math.min(1, fx.t / 0.5) * 0.8;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, PLAYER_R + grow * (20 + i * 10), 0, Math.PI * 2);
        ctx.stroke();
      }
      const grd = ctx.createRadialGradient(fx.x, fx.y, 2, fx.x, fx.y, PLAYER_R + 14);
      grd.addColorStop(0, "rgba(80,150,200,0.4)");
      grd.addColorStop(1, "rgba(80,150,200,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, PLAYER_R + 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = stealthActive ? 0.35 : 1;
    }

    // mutated run: on all fours while moving with Mutar equipped
    if (abilityId === "mutar" && s.moving && s.status !== "won") {
      const angle = Math.atan2(s.facing.y, s.facing.x);
      const gait = Math.sin(s.time * 13);
      const phaseA = gait * 6, phaseB = -gait * 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(-22, Math.sin(s.time * 7) * 6, -40, Math.sin(s.time * 7 + 1) * 5);
      ctx.stroke();

      ctx.strokeStyle = bodyColor;
      ctx.fillStyle = bodyColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-6, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(10, 0, 4.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(6, 2); ctx.lineTo(6 + phaseA * 0.4, 8);
      ctx.moveTo(6, -2); ctx.lineTo(6 + phaseB * 0.4, -8);
      ctx.moveTo(-5, -2); ctx.lineTo(-5 + phaseA * 0.4, -8);
      ctx.moveTo(-5, 2); ctx.lineTo(-5 + phaseB * 0.4, 8);
      ctx.stroke();

      ctx.restore();

      // green smoke puffs trailing from the body — bold and clearly visible
      for (let i = 0; i < 7; i++) {
        const ph = ((s.time * 1.9 + i * 0.28) % 1);
        const sx = x - s.facing.x * 9 + Math.sin(s.time * 5 + i) * 8;
        const sy = y - ph * 30;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8 + ph * 9);
        grd.addColorStop(0, `rgba(160,230,95,${0.9 * (1 - ph)})`);
        grd.addColorStop(1, `rgba(60,140,40,${0.6 * (1 - ph)})`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, 6 + ph * 9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }

    const victory = s.status === "won";
    const runPhase = s.time * 12;
    const moveSwing = s.moving ? Math.sin(runPhase) : 0;
    const swing = victory ? Math.sin(s.time * 7) : moveSwing;
    const legSwing = victory ? swing * 6 : swing * 6;
    const armSwing = -moveSwing * 6;
    const bob = victory
      ? Math.abs(Math.sin(s.time * 7)) * 5
      : s.moving
      ? Math.abs(Math.sin(runPhase)) * 2.2
      : 0;
    const hipY = y + 2 - bob;
    const lean = s.moving && !victory ? s.facing.x * 2.5 : 0;
    const shoulderX = x + lean;

    ctx.strokeStyle = bodyColor;
    ctx.fillStyle = bodyColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";

    if (abilityId === "mutar") {
      const tx = x - s.facing.x * 36;
      const ty = hipY - s.facing.y * 20 + Math.sin(s.time * 6) * 5;
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.quadraticCurveTo(x - s.facing.x * 20, hipY + 9 - s.facing.y * 10, tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tx, ty, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // idle green haze so the mutation reads clearly even standing still
      for (let i = 0; i < 3; i++) {
        const ph = ((s.time * 1.3 + i * 0.4) % 1);
        const sx = x + Math.sin(s.time * 2.2 + i * 2) * 8;
        const sy = hipY - 6 - ph * 18;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5 + ph * 5);
        grd.addColorStop(0, `rgba(150,220,90,${0.6 * (1 - ph)})`);
        grd.addColorStop(1, `rgba(60,140,40,${0.3 * (1 - ph)})`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 + ph * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = bodyColor;
      ctx.fillStyle = bodyColor;
    }

    ctx.beginPath();
    ctx.arc(shoulderX, hipY - 15, 5.5, 0, Math.PI * 2);
    ctx.fill();

    if (abilityId === "roquero") {
      ctx.fillStyle = ABILITIES.roquero.accent;
      const headTopY = hipY - 15 - 5.5;
      const wob = Math.sin(s.time * 10) * 0.6;
      [-3.6, -1.2, 1.2, 3.6].forEach((ox, i) => {
        const spikeH = 8 + (i % 2 === 0 ? 1.5 : 0) + wob;
        ctx.beginPath();
        ctx.moveTo(x + ox - 1.3, headTopY + 1);
        ctx.lineTo(x + ox, headTopY - spikeH);
        ctx.lineTo(x + ox + 1.3, headTopY + 1);
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = bodyColor;
    }

    if (abilityId === "laser") {
      ctx.fillStyle = ABILITIES.laser.accent;
      ctx.globalAlpha *= 0.7 + Math.sin(s.time * 10) * 0.3;
      ctx.beginPath();
      ctx.arc(x + s.facing.x * 4, hipY - 15 - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = stealthActive ? 0.35 : s.invuln > 0 ? 0.5 + 0.5 * Math.sin(s.time * 20) : 1;
      ctx.fillStyle = bodyColor;
    }

    ctx.beginPath();
    ctx.moveTo(shoulderX, hipY - 9.5);
    ctx.lineTo(x, hipY);
    ctx.stroke();

    let lHandX, lHandY, rHandX, rHandY;
    ctx.beginPath();
    if (victory) {
      // victory dance: arms alternate raising overhead
      const lArm = Math.sin(s.time * 6.5);
      const rArm = Math.sin(s.time * 6.5 + Math.PI);
      lHandX = x - 6 - lArm * 2; lHandY = hipY - 7 - (lArm * 0.5 + 0.5) * 15;
      rHandX = x + 6 + rArm * 2; rHandY = hipY - 7 - (rArm * 0.5 + 0.5) * 15;
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(lHandX, lHandY);
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(rHandX, rHandY);
    } else if (s.moving) {
      // articulated running arms: shoulder → elbow → hand, swinging opposite the legs
      const armPhaseL = Math.sin(runPhase + Math.PI);
      const armPhaseR = Math.sin(runPhase);
      const elbowLX = shoulderX - 4 + armPhaseL * 3.2, elbowLY = hipY - 3.5;
      lHandX = shoulderX - 6.5 + armPhaseL * 6.5; lHandY = hipY + 1 + Math.abs(armPhaseL) * 2.5;
      const elbowRX = shoulderX + 4 + armPhaseR * 3.2, elbowRY = hipY - 3.5;
      rHandX = shoulderX + 6.5 + armPhaseR * 6.5; rHandY = hipY + 1 + Math.abs(armPhaseR) * 2.5;
      ctx.moveTo(shoulderX, hipY - 7);
      ctx.lineTo(elbowLX, elbowLY);
      ctx.lineTo(lHandX, lHandY);
      ctx.moveTo(shoulderX, hipY - 7);
      ctx.lineTo(elbowRX, elbowRY);
      ctx.lineTo(rHandX, rHandY);
    } else {
      lHandX = x - 6.5; lHandY = hipY;
      rHandX = x + 6.5; rHandY = hipY;
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(lHandX, lHandY);
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(rHandX, rHandY);
    }
    ctx.stroke();

    ctx.beginPath();
    if (s.moving && !victory) {
      // articulated running legs: hip → knee → foot, with the swinging foot lifting off the ground
      const legPhaseL = Math.sin(runPhase);
      const legPhaseR = Math.sin(runPhase + Math.PI);
      const liftL = Math.max(0, Math.sin(runPhase + Math.PI / 2));
      const liftR = Math.max(0, Math.sin(runPhase + Math.PI / 2 + Math.PI));
      const kneeLX = x - 3 + legPhaseL * 4, kneeLY = hipY + 6 - liftL * 2;
      const footLX = x - 4.5 + legPhaseL * 8, footLY = hipY + 13 - liftL * 5;
      const kneeRX = x + 3 + legPhaseR * 4, kneeRY = hipY + 6 - liftR * 2;
      const footRX = x + 4.5 + legPhaseR * 8, footRY = hipY + 13 - liftR * 5;
      ctx.moveTo(x, hipY);
      ctx.lineTo(kneeLX, kneeLY);
      ctx.lineTo(footLX, footLY);
      ctx.moveTo(x, hipY);
      ctx.lineTo(kneeRX, kneeRY);
      ctx.lineTo(footRX, footRY);
    } else if (victory) {
      ctx.moveTo(x, hipY);
      ctx.lineTo(x - 4.5 + legSwing, hipY + 13);
      ctx.moveTo(x, hipY);
      ctx.lineTo(x + 4.5 - legSwing, hipY + 13);
    } else {
      ctx.moveTo(x, hipY);
      ctx.lineTo(x - 4.5, hipY + 13);
      ctx.moveTo(x, hipY);
      ctx.lineTo(x + 4.5, hipY + 13);
    }
    ctx.stroke();

    if (abilityId === "fase" && !victory) {
      ctx.strokeStyle = ABILITIES.fase.accent;
      ctx.lineWidth = 1.1;
      [[lHandX, lHandY, -1], [rHandX, rHandY, 1]].forEach(([hx, hy, side]) => {
        for (let f = -1; f <= 1; f++) {
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + side * 2.4, hy + 3 + f * 1.6);
          ctx.stroke();
        }
      });
      ctx.strokeStyle = bodyColor;
    }

    if (abilityId === "electrico" && !victory) {
      ctx.strokeStyle = ABILITIES.electrico.accent;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.85;
      const capeTop = hipY - 10;
      for (let i = -2; i <= 2; i++) {
        const bx = x + i * 3.2;
        const jitter = Math.sin(s.time * 16 + i * 3) * 1.4;
        ctx.beginPath();
        ctx.moveTo(bx, capeTop);
        ctx.lineTo(bx + 1.5 + jitter, capeTop + 6);
        ctx.lineTo(bx - 1 + jitter, capeTop + 9);
        ctx.lineTo(bx + 1.5 + jitter, capeTop + 15);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = bodyColor;
    }

    if (abilityId === "roquero") {
      ctx.save();
      ctx.translate(x + s.facing.x * 4, hipY - 3);
      ctx.rotate(Math.atan2(s.facing.y, s.facing.x) + 0.55);
      ctx.fillStyle = ABILITIES.roquero.accent;
      ctx.beginPath();
      ctx.ellipse(0, 4, 4.2, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -1.5);
      ctx.lineTo(0, -14);
      ctx.stroke();
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-2, -17, 4, 3.5);
      ctx.strokeStyle = "rgba(43,42,40,0.5)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-1, -14); ctx.lineTo(-1, 4);
      ctx.moveTo(1, -14); ctx.lineTo(1, 4);
      ctx.stroke();
      ctx.restore();
    }

    if (abilityId === "roquero" && s.moving) {
      ctx.fillStyle = ABILITIES.roquero.accent;
      ctx.font = "bold 15px sans-serif";
      for (let i = 0; i < 4; i++) {
        const ph = ((s.time * 1.6 + i * 0.28) % 1);
        const nx = x + Math.sin(s.time * 4 + i * 2.4) * 16;
        const ny = hipY - 29 - ph * 34;
        ctx.globalAlpha = Math.max(0.25, 1 - ph);
        ctx.fillText(i % 2 === 0 ? "♪" : "♫", nx, ny);
      }
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  const ab = ABILITIES[ability];
  const cdPct = ab ? Math.max(0, 1 - hud.cd / ab.cd) : 1;

  return (
    <div
      className="w-full flex flex-col items-center py-4 px-3"
      style={{
        background: "#F4F1E9",
        fontFamily: "'Patrick Hand', cursive",
        minHeight: "100vh",
        touchAction: hud.status === "playing" ? "none" : "pan-y",
        overscrollBehavior: "contain",
        userSelect: "none",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Kalam:wght@400;700&display=swap'); .marker{font-family:'Kalam',cursive;}`}</style>

      <h1 className="marker text-2xl sm:text-3xl mb-0.5" style={{ color: "#2B2A28" }}>La persecución</h1>
      <p className="text-xs sm:text-sm mb-3 text-center" style={{ color: "#5B5850" }}>
        Desliza el joystick para moverte · Toca el botón para tu habilidad
      </p>

      {hud.status === "menu" && (
        <div className="mb-4 p-4 rounded-lg border-2 w-full max-w-md" style={{ borderColor: "#2B2A28", background: "#FBFAF5" }}>
          {onBackToCreator && (
            <button
              onClick={onBackToCreator}
              className="text-xs marker mb-2 underline"
              style={{ color: "#5B5850" }}
            >
              ‹ Volver al creador de personaje
            </button>
          )}
          {playerName && (
            <p className="text-sm mb-1" style={{ color: "#5B5850" }}>Jugando como <strong>{playerName}</strong></p>
          )}
          {characterKind !== "stickman" ? (
            <>
              <p className="marker text-lg mb-2" style={{ color: "#2B2A28" }}>
                {ANIMAL_KINDS[characterKind].label}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {ANIMAL_KINDS[characterKind].abilities.map((id, i) => {
                  const a = ABILITIES[id];
                  return (
                    <div key={id} className="p-2.5 rounded border-2 text-left" style={{ borderColor: a.accent, background: `${a.accent}14` }}>
                      <span className="marker text-base" style={{ color: "#2B2A28" }}>{a.name}</span>
                      <div className="text-xs" style={{ color: "#5B5850" }}>{i === 0 ? "Toque" : "Mantener presionado"}</div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="marker text-lg mb-2" style={{ color: "#2B2A28" }}>Elige tu habilidad para huir</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(ABILITIES).map(([id, a]) => (
                  <button key={id} onClick={() => setPick(id)}
                    className="p-2.5 rounded border-2 text-left active:scale-95 transition-transform"
                    style={{ borderColor: pick === id ? a.accent : "#D8D3C4", background: pick === id ? `${a.accent}14` : "#fff" }}>
                    <span className="marker text-base" style={{ color: "#2B2A28" }}>{a.name}</span>
                    <div className="text-xs" style={{ color: "#5B5850" }}>{a.tag}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <button onClick={() => reset(characterKind !== "stickman" ? initialAbility : pick)} className="w-full py-3 rounded marker text-lg active:scale-95 transition-transform" style={{ background: "#2B2A28", color: "#F4F1E9" }}>
            Empezar
          </button>
        </div>
      )}

      {hud.status !== "menu" && (
        <div className="flex items-center gap-3 mb-2 w-full max-w-[640px] justify-between px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm marker" style={{ color: "#5B5850" }}>Nivel {hud.level + 1}</span>
            {playerName && (
              <span className="text-xs sm:text-sm marker hidden sm:inline" style={{ color: "#5B5850" }}>· {playerName}</span>
            )}
            <div className="flex gap-1">
              {Array.from({ length: hud.lives }).map((_, i) => (
                <span key={i} style={{ color: "#8B1E1E", fontSize: 20 }}>♥</span>
              ))}
            </div>
            <span
              className="text-xs sm:text-sm marker flex items-center gap-1"
              style={{ color: hud.monsterDefeated ? "#3F8F5C" : "#3A342E" }}
            >
              👹 {hud.monsterDefeated ? "vencido" : `x${hud.monsterLives}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm marker" style={{ color: ab.accent }}>
              {secondaryAbility ? `${ab.name} / ${ABILITIES[secondaryAbility].name}` : ab.name}
            </span>
            <div className="w-16 sm:w-24 h-2 rounded-full border relative overflow-hidden" style={{ borderColor: "#2B2A28" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${hud.energy}%`,
                  background: hud.energy >= 100 ? ab.accent : "#8B8378",
                }}
              />
              <div className="absolute top-0 bottom-0" style={{ left: "50%", width: 1, background: "#2B2A28", opacity: 0.5 }} />
            </div>
            <button
              onClick={toggleMute}
              className="text-base leading-none px-1"
              style={{ color: "#2B2A28" }}
              aria-label={muted ? "Activar música" : "Silenciar música"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      )}

      <div
        className="relative rounded-lg border-2 w-full"
        style={{ borderColor: "#2B2A28", boxShadow: "3px 3px 0 #2B2A28", maxWidth: 640, aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          style={{ width: "100%", height: "100%", display: "block", borderRadius: 6 }}
        />

        {hud.status === "playing" && (
          <>
            <div
              ref={joyZoneRef}
              onPointerDown={onJoyDown}
              onPointerMove={onJoyMove}
              onPointerUp={onJoyUp}
              onPointerCancel={onJoyUp}
              className="absolute rounded-full"
              style={{
                left: 14, bottom: 14, width: 96, height: 96,
                background: "rgba(43,42,40,0.10)",
                border: "2px solid #2B2A28",
                touchAction: "none",
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 40, height: 40, background: "#2B2A28", opacity: thumb.active ? 0.85 : 0.5,
                  left: "50%", top: "50%",
                  transform: `translate(-50%, -50%) translate(${thumb.x}px, ${thumb.y}px)`,
                }}
              />
            </div>

            <button
              onPointerDown={onAbilityDown}
              onPointerUp={onAbilityUp}
              onPointerCancel={onAbilityUp}
              onPointerLeave={onAbilityUp}
              className="absolute rounded-full flex items-center justify-center marker text-center leading-tight"
              style={{
                right: 14, bottom: 14, width: 74, height: 74,
                background: `${ab.accent}CC`,
                border: "3px solid #2B2A28",
                color: "#FBFAF5",
                fontSize: 13,
                touchAction: "none",
              }}
            >
              {ab.name}
            </button>

            {secondaryAbility && (
              <button
                onPointerDown={onSecondaryDown}
                onPointerUp={onSecondaryUp}
                onPointerCancel={onSecondaryUp}
                onPointerLeave={onSecondaryUp}
                className="absolute rounded-full flex items-center justify-center marker text-center leading-tight"
                style={{
                  right: 100, bottom: 14, width: 62, height: 62,
                  background: `${ABILITIES[secondaryAbility].accent}CC`,
                  border: "3px solid #2B2A28",
                  color: "#FBFAF5",
                  fontSize: 11,
                  touchAction: "none",
                }}
              >
                {ABILITIES[secondaryAbility].name}
              </button>
            )}
          </>
        )}

        {(hud.status === "won" || hud.status === "lost") && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(251,250,245,0.92)" }}>
            <div className="text-center px-4">
              <p className="marker text-xl mb-3" style={{ color: "#2B2A28" }}>
                {hud.status === "won" ? `✅ ¡Nivel ${hud.level + 1} superado!` : "El monstruo te atrapó 🕸️"}
              </p>
              <button
                onClick={hud.status === "won" ? nextLevel : backToMenu}
                className="px-5 py-2.5 rounded marker text-base active:scale-95 transition-transform"
                style={{ background: "#2B2A28", color: "#F4F1E9" }}
              >
                {hud.status === "won" ? "Siguiente" : "Volver a intentar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const INK_COLORS = [
  { id: "carbon", label: "Carbón", hex: "#2B2A28" },
  { id: "sangre", label: "Sangre seca", hex: "#7A1F1F" },
  { id: "musgo", label: "Musgo", hex: "#39502F" },
  { id: "noche", label: "Noche", hex: "#26314A" },
];

const ANIMAL_KINDS = {
  snake: {
    label: "Serpiente",
    color: "#3D8A34",
    abilities: ["tiempo", "mutar"],
    desc: "Reptando entre la maleza. Toca para detener el tiempo, mantén presionado para mutar.",
  },
  chitor: {
    label: "Chitor",
    color: "#E8B93F",
    abilities: ["viento", "fuego"],
    desc: "Un felino veloz. Toca para la Racha, mantén presionado para la Brasa.",
  },
  red: {
    label: "Lagarto Rojo",
    color: "#C23B3B",
    abilities: ["mutar", "laser"],
    desc: "Un lagarto de fuego. Toca para mutar, mantén presionado para el láser.",
  },
};

function CreatorBackdrop() {
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <pattern id="creatorGrid" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#B9CBE0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#creatorGrid)" opacity="0.55" />
    </svg>
  );
}

function PreviewStickman({ color, ability }) {
  const w = 220, h = 300;
  return (
    <svg viewBox="0 0 220 300" width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
        <radialGradient id="flameL" cx="50%" cy="80%" r="75%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="45%" stopColor="#FF8C1A" />
          <stop offset="100%" stopColor="#E8460F" />
        </radialGradient>
      </defs>

      {ability === "viento" && (
        <g stroke="#3B7FA8" strokeWidth="2.5" fill="none" opacity="0.75">
          <path d="M -10 120 C 20 110, 40 130, 70 118" strokeDasharray="6 5">
            <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.9s" repeatCount="indefinite" />
          </path>
          <path d="M -20 150 C 15 140, 35 160, 75 150" strokeDasharray="6 5">
            <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="1.1s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {ability === "tiempo" && (
        <g stroke="#3FA089" fill="none" strokeWidth="2">
          <circle cx="150" cy="120" r="14" fill="#3FA089" stroke="#2B2A28" strokeWidth="1.5" />
          <path d="M150 120 L150 111 M150 120 L156 122" stroke="#F4F1E9" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="150" cy="120" r="20" strokeDasharray="4 4" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="0 150 120" to="360 150 120" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {ability === "clon" && (
        <g opacity="0.4" transform="translate(-22,10)">
          <circle cx="110" cy="55" r="26" fill="#9B4F96" stroke="none" />
          <line x1="110" y1="81" x2="110" y2="190" stroke="#9B4F96" strokeWidth="6" strokeLinecap="round" />
          <line x1="110" y1="190" x2="75" y2="260" stroke="#9B4F96" strokeWidth="6" strokeLinecap="round" />
          <line x1="110" y1="190" x2="145" y2="260" stroke="#9B4F96" strokeWidth="6" strokeLinecap="round" />
        </g>
      )}

      {ability === "fase" && (
        <g stroke="#2E93A6" strokeWidth="2" fill="none" opacity="0.8">
          <path d="M -20 190 L 60 190" strokeDasharray="6 6" />
          <circle cx="-20" cy="190" r="10" />
          <circle cx="60" cy="190" r="10" />
        </g>
      )}

      {ability === "electrico" && (
        <g stroke="#C9A227" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M60 90 L78 105 L68 108 L88 128 L74 120 L84 138">
            <animate attributeName="opacity" values="1;0.1;1;0.3;1" dur="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M155 100 L138 118 L150 120 L128 142 L143 132 L132 152">
            <animate attributeName="opacity" values="0.2;1;0.3;1;0.1" dur="0.45s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {ability === "fuego" && (
        <g strokeLinecap="round">
          <g transform="translate(74,262)">
            <path d="M0 6 C-8 -10, 6 -18, 2 -34 C16 -22, 20 -6, 10 8 C20 0, 24 -14, 18 -28 C34 -10, 36 10, 18 22 C10 30, -6 28, 0 6 Z" fill="url(#flameL)">
              <animate attributeName="opacity" values="1;0.8;1;0.9;1" dur="0.5s" repeatCount="indefinite" />
            </path>
          </g>
          <g transform="translate(146,264)">
            <path d="M0 6 C-7 -9, 5 -16, 1 -30 C14 -19, 18 -5, 9 7 C18 0, 21 -13, 16 -25 C30 -9, 32 9, 16 20 C9 27, -5 25, 0 6 Z" fill="url(#flameL)">
              <animate attributeName="opacity" values="0.85;1;0.75;1;0.85" dur="0.42s" repeatCount="indefinite" />
            </path>
          </g>
        </g>
      )}

      {ability === "mutar" && (
        <g stroke="#4C9A2A" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M110 190 Q 90 210, 78 250">
            <animate attributeName="d" values="M110 190 Q 90 210, 78 250;M110 190 Q 95 208, 84 248;M110 190 Q 90 210, 78 250" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {ability === "roquero" && (
        <g transform="translate(140,200) rotate(25)">
          <ellipse cx="0" cy="10" rx="12" ry="17" fill="#D6336C" />
          <line x1="0" y1="-6" x2="0" y2="-40" stroke="#2B2A28" strokeWidth="3" />
          <rect x="-5" y="-46" width="10" height="8" fill="#2B2A28" />
        </g>
      )}

      {ability === "laser" && (
        <g>
          <circle cx="110" cy="30" r="4" fill="#E63946">
            <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
          </circle>
          <line x1="114" y1="30" x2="190" y2="24" stroke="#E63946" strokeWidth="1.5" opacity="0.5" strokeDasharray="4 4" />
        </g>
      )}

      {ability === "sierra" && (
        <>
          {[{ cx: 60, cy: 150 }, { cx: 160, cy: 150 }].map((p, i) => (
            <g key={i} transform={`translate(${p.cx},${p.cy})`}>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.6s" repeatCount="indefinite" additive="sum" />
              <circle r="14" fill="#B7BEC4" />
              {Array.from({ length: 8 }).map((_, k) => {
                const a = (k / 8) * Math.PI * 2;
                return (
                  <line key={k} x1={Math.cos(a) * 12} y1={Math.sin(a) * 12} x2={Math.cos(a) * 20} y2={Math.sin(a) * 20} stroke="#4A4E52" strokeWidth="2" />
                );
              })}
              <circle r="4" fill="#5C6266" />
            </g>
          ))}
        </>
      )}

      {ability === "tornado" && (
        <g stroke="#5C8AA6" fill="none" strokeWidth="2">
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="110" cy="170" r={20 + i * 10} strokeDasharray="10 8" opacity="0.7">
              <animateTransform attributeName="transform" type="rotate" from={`0 110 170`} to={`360 110 170`} dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}

      {ability === "ladron" && (
        <g>
          <line x1="150" y1="110" x2="90" y2="150" stroke="#B8860B" strokeWidth="2" strokeDasharray="5 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.6s" repeatCount="indefinite" />
          </line>
          <circle cx="150" cy="108" r="8" fill="#B8860B" />
          <text x="146" y="112" fontSize="9" fill="#FBFAF5">♥</text>
        </g>
      )}

      <g
        filter="url(#sketchy)"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity={ability === "sigilo" ? 0.42 : 1}
      >
        <circle cx="110" cy="55" r="26" fill={color} stroke="none" />
        <line x1="110" y1="81" x2="110" y2="190" />
        <line x1="110" y1="115" x2="70" y2="150" />
        <line x1="110" y1="115" x2="150" y2="150" />
        <line x1="110" y1="190" x2="75" y2="260" />
        <line x1="110" y1="190" x2="145" y2="260" />
      </g>

      {ability === "sigilo" && (
        <circle cx="110" cy="30" r="9" fill="none" stroke="#7A5EA8" strokeWidth="2">
          <animate attributeName="r" values="7;13;7" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.15;0.9" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function CharacterCreator({ character, setCharacter, onStart, animalsUnlocked, coins, unlockedAbilities, onPurchaseAbility }) {
  const { name, color, ability, kind = "stickman" } = character;
  const [confirmed, setConfirmed] = useState(false);
  const currentAbility = useMemo(() => ABILITIES[ability], [ability]);
  const isAnimal = kind !== "stickman";
  const animalDef = isAnimal ? ANIMAL_KINDS[kind] : null;

  return (
    <div className="min-h-screen w-full relative" style={{ background: "#F4F1E9", fontFamily: "'Patrick Hand', cursive" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Kalam:wght@400;700&display=swap');
        h1, h2, .marker { font-family: 'Kalam', cursive; }
      `}</style>
      <CreatorBackdrop />

      <div className="relative z-10 max-w-xl mx-auto px-5 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-1 justify-between">
          <span className="marker text-xs tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: "#2B2A28", color: "#F4F1E9" }}>
            Ficha de personaje
          </span>
          <span className="marker text-sm px-2 py-0.5 rounded-full border-2 flex items-center gap-1" style={{ borderColor: "#B8860B", color: "#8A6510" }}>
            🪙 {coins ?? 0}
          </span>
        </div>
        <h1 className="text-4xl mb-1" style={{ color: "#2B2A28" }}>Dibuja tu stickman</h1>
        <p className="text-base mb-6" style={{ color: "#5B5850" }}>Elige su tinta y su habilidad para escapar del monstruo.</p>

        <div
          className="rounded-lg border-2 flex flex-col items-center justify-end relative overflow-hidden"
          style={{ borderColor: "#2B2A28", background: "#FBFAF5", minHeight: 300, boxShadow: "3px 3px 0 #2B2A28" }}
        >
          <div className="absolute inset-0"><CreatorBackdrop /></div>
          {isAnimal ? (
            <div className="relative flex flex-col items-center justify-center gap-2" style={{ minHeight: 260 }}>
              <div className="w-24 h-24 rounded-full" style={{ background: animalDef.color, opacity: 0.85 }} />
              <p className="marker text-xl" style={{ color: "#2B2A28" }}>{animalDef.label}</p>
              <p className="text-sm text-center max-w-xs px-4" style={{ color: "#5B5850" }}>{animalDef.desc}</p>
            </div>
          ) : (
            <div className="relative pt-6">
              <PreviewStickman color={color} ability={ability} />
            </div>
          )}
          <div className="relative w-full text-center pb-3 pt-1 marker text-lg" style={{ color: isAnimal ? animalDef.color : currentAbility.accent }}>
            {name || "Sin nombre"} · {isAnimal ? animalDef.label : currentAbility.tag}
          </div>
        </div>

        {animalsUnlocked && (
          <div className="mt-6">
            <label className="block marker text-lg mb-2" style={{ color: "#2B2A28" }}>
              Personajes animales <span className="text-xs" style={{ color: "#5B5850" }}>(desbloqueado al superar el nivel 10)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setCharacter((c) => ({ ...c, kind: "stickman" }))}
                className="p-2.5 rounded-lg border-2 text-center"
                style={{ borderColor: !isAnimal ? "#2B2A28" : "#D8D3C4", background: !isAnimal ? "#2B2A2814" : "#FBFAF5" }}
              >
                <span className="marker text-sm" style={{ color: "#2B2A28" }}>Stickman</span>
              </button>
              {Object.entries(ANIMAL_KINDS).map(([id, a]) => (
                <button
                  key={id}
                  onClick={() => setCharacter((c) => ({ ...c, kind: id }))}
                  className="p-2.5 rounded-lg border-2 text-center"
                  style={{ borderColor: kind === id ? a.color : "#D8D3C4", background: kind === id ? `${a.color}14` : "#FBFAF5" }}
                >
                  <span className="marker text-sm" style={{ color: "#2B2A28" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block marker text-lg mb-1" style={{ color: "#2B2A28" }}>Nombre</label>
          <input
            value={name}
            onChange={(e) => setCharacter((c) => ({ ...c, name: e.target.value.slice(0, 18) }))}
            placeholder="Escribe un nombre..."
            className="w-full px-3 py-2 rounded border-2 bg-transparent outline-none text-lg"
            style={{ borderColor: "#2B2A28", color: "#2B2A28" }}
          />
        </div>

        {!isAnimal && (
        <div className="mt-6">
          <label className="block marker text-lg mb-2" style={{ color: "#2B2A28" }}>Color de tinta</label>
          <div className="flex gap-3">
            {INK_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCharacter((ch) => ({ ...ch, color: c.hex }))}
                title={c.label}
                className="w-10 h-10 rounded-full border-2 transition-transform"
                style={{
                  background: c.hex,
                  borderColor: color === c.hex ? "#2B2A28" : "transparent",
                  transform: color === c.hex ? "scale(1.15)" : "scale(1)",
                  boxShadow: color === c.hex ? "2px 2px 0 #2B2A28" : "none",
                }}
              />
            ))}
          </div>
        </div>
        )}

        {!isAnimal && (
        <div className="mt-6">
          <label className="block marker text-lg mb-2" style={{ color: "#2B2A28" }}>
            Habilidad especial <span className="text-xs" style={{ color: "#5B5850" }}>(las bloqueadas se compran con monedas)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(ABILITIES).map(([id, a]) => {
              const selected = id === ability;
              const unlocked = unlockedAbilities ? unlockedAbilities.includes(id) : id === "viento";
              const canAfford = (coins ?? 0) >= (a.price || 0);
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (unlocked) setCharacter((c) => ({ ...c, ability: id }));
                    else if (canAfford) onPurchaseAbility(id);
                  }}
                  className="text-left p-3 rounded-lg border-2 transition-all relative"
                  style={{
                    borderColor: selected ? a.accent : "#D8D3C4",
                    background: selected ? `${a.accent}14` : unlocked ? "#FBFAF5" : "#EFEBE2",
                    boxShadow: selected ? `2px 2px 0 ${a.accent}` : "none",
                    opacity: unlocked ? 1 : 0.85,
                  }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="marker text-lg" style={{ color: "#2B2A28" }}>
                      {!unlocked && "🔒 "}{a.name}
                    </span>
                    <span className="text-xs uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: a.accent, color: "#FBFAF5" }}>
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#5B5850" }}>{a.desc}</p>
                  {unlocked ? (
                    <p className="text-xs mt-1 marker" style={{ color: a.accent }}>{a.stat}</p>
                  ) : (
                    <p className="text-xs mt-1 marker" style={{ color: canAfford ? "#8A6510" : "#B33F3F" }}>
                      {canAfford ? `Toca para comprar · 🪙 ${a.price}` : `Necesitás 🪙 ${a.price}`}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {isAnimal && (
          <div className="mt-6 p-3 rounded-lg border-2" style={{ borderColor: animalDef.color, background: `${animalDef.color}14` }}>
            <p className="marker text-base mb-1" style={{ color: "#2B2A28" }}>Habilidades de {animalDef.label}</p>
            {animalDef.abilities.map((id, i) => (
              <p key={id} className="text-sm" style={{ color: "#5B5850" }}>
                {i === 0 ? "Toque" : "Mantener presionado"}: <strong>{ABILITIES[id].name}</strong> — {ABILITIES[id].stat}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={() => setConfirmed(true)}
          className="mt-7 w-full py-3 rounded-lg marker text-xl border-2"
          style={{ background: "#2B2A28", color: "#F4F1E9", borderColor: "#2B2A28", boxShadow: "3px 3px 0 " + (isAnimal ? animalDef.color : currentAbility.accent) }}
        >
          Confirmar personaje
        </button>

        {confirmed && (
          <div className="mt-6 p-4 rounded-lg border-2" style={{ borderColor: isAnimal ? animalDef.color : currentAbility.accent, background: "#FBFAF5" }}>
            <p className="marker text-lg" style={{ color: "#2B2A28" }}>
              {name || (isAnimal ? animalDef.label : "Tu stickman")} está listo para huir 🕸️
            </p>
            <p className="text-sm mt-1" style={{ color: "#5B5850" }}>
              {isAnimal
                ? `Habilidades: ${animalDef.abilities.map((id) => ABILITIES[id].name).join(" / ")}`
                : <>Habilidad: <strong>{currentAbility.name}</strong> — {currentAbility.stat}</>}
            </p>
            <button
              onClick={onStart}
              className="mt-4 w-full py-3 rounded-lg marker text-xl border-2"
              style={{ background: isAnimal ? animalDef.color : currentAbility.accent, color: "#FBFAF5", borderColor: "#2B2A28", boxShadow: "3px 3px 0 #2B2A28" }}
            >
              ▶ Comenzar partida
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const NAME_STORAGE_KEY = "stickman-jungla:playerName";

function IntroCutscene({ onDone }) {
  const canvasRef = useRef(null);
  const audio = useGameAudio();
  const audioStarted = useRef(false);
  const [skippable, setSkippable] = useState(false);
  const [needsTap, setNeedsTap] = useState(true);
  const W = 640, H = 420;

  const beginAudio = () => {
    if (audioStarted.current) return;
    const ctx = audio.ensureCtx();
    if (!ctx) return;
    const proceed = () => {
      if (audioStarted.current) return;
      audioStarted.current = true;
      audio.playIntroRock();
      setNeedsTap(false);
    };
    if (ctx.state === "running") {
      proceed();
    } else if (ctx.resume) {
      // only mark audio as started once the browser actually confirms the
      // context resumed — calling this from a real tap/click makes that promise
      // resolve almost immediately
      ctx.resume().then(proceed).catch(() => {});
    }
  };

  useEffect(() => {
    const skipTimer = setTimeout(() => setSkippable(true), 900);
    const endTimer = setTimeout(() => {
      audio.stopMusic();
      onDone();
    }, 11000);
    return () => {
      clearTimeout(skipTimer);
      clearTimeout(endTimer);
      audio.stopMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const ctx = canvasRef.current.getContext("2d");

    const draw = (time) => {
      ctx.clearRect(0, 0, W, H);
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#1a1410");
      grd.addColorStop(1, "#0b0908");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // faint notebook grid, moody
      ctx.strokeStyle = "rgba(200,190,170,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const cx = W / 2, groundY = H * 0.68;

      // stage timings
      const roquero = { x: -60, y: groundY };
      if (time < 1.1) {
        // title card
        ctx.globalAlpha = Math.min(1, time / 0.7);
        ctx.fillStyle = "#F4F1E9";
        ctx.font = "bold 34px 'Kalam', cursive";
        ctx.textAlign = "center";
        ctx.fillText("SCAPE OF THE MONSTER", cx, H / 2);
        ctx.font = "16px 'Patrick Hand', cursive";
        ctx.fillStyle = "#D6336C";
        ctx.fillText("un stickman, una guitarra, una jungla...", cx, H / 2 + 32);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      } else if (time < 5) {
        // Roquero walks in and rocks out
        const walkT = Math.min(1, (time - 1.1) / 1.3);
        roquero.x = -60 + walkT * (cx - 60 - -60);
        const bob = Math.abs(Math.sin(time * 10)) * 5;
        const rx = roquero.x, ry = groundY - bob;

        // mohawk + head
        ctx.fillStyle = "#D6336C";
        [-4, -1, 2, 5].forEach((ox) => {
          ctx.beginPath();
          ctx.moveTo(rx + ox - 1.5, ry - 34);
          ctx.lineTo(rx + ox, ry - 44 - Math.sin(time * 14) * 1.5);
          ctx.lineTo(rx + ox + 1.5, ry - 34);
          ctx.closePath();
          ctx.fill();
        });
        ctx.fillStyle = "#F4F1E9";
        ctx.beginPath(); ctx.arc(rx, ry - 28, 9, 0, Math.PI * 2); ctx.fill();
        // body + legs (simple rock stance)
        ctx.strokeStyle = "#F4F1E9";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(rx, ry - 19); ctx.lineTo(rx, ry + 6);
        ctx.moveTo(rx, ry + 6); ctx.lineTo(rx - 12, ry + 32);
        ctx.moveTo(rx, ry + 6); ctx.lineTo(rx + 12, ry + 32);
        ctx.stroke();
        // strumming arm
        const strum = Math.sin(time * 24) * 8;
        ctx.beginPath();
        ctx.moveTo(rx, ry - 12); ctx.lineTo(rx + 14, ry - 2 + strum);
        ctx.moveTo(rx, ry - 12); ctx.lineTo(rx - 10, ry - 4);
        ctx.stroke();
        // guitar
        ctx.save();
        ctx.translate(rx + 4, ry + 2);
        ctx.rotate(0.5);
        ctx.fillStyle = "#D6336C";
        ctx.beginPath(); ctx.ellipse(0, 8, 9, 13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#F4F1E9"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(0, -30); ctx.stroke();
        ctx.fillStyle = "#2B2A28"; ctx.fillRect(-4, -34, 8, 6);
        ctx.restore();

        // flying notes while he plays
        if (walkT >= 1) {
          ctx.fillStyle = "#D6336C";
          ctx.font = "bold 16px sans-serif";
          for (let i = 0; i < 3; i++) {
            const ph = ((time * 1.7 + i * 0.4) % 1);
            const nx = rx + 20 + Math.sin(time * 5 + i) * 10;
            const ny = ry - 40 - ph * 50;
            ctx.globalAlpha = 1 - ph;
            ctx.fillText(i % 2 === 0 ? "♪" : "♫", nx, ny);
          }
          ctx.globalAlpha = 1;
        }
      } else if (time < 7) {
        // monster creeps in from the right
        const t2 = Math.min(1, (time - 5) / 1.7);
        const mx = W + 40 - t2 * (W + 40 - (cx + 90));
        const my = groundY - 10;
        drawIntroMonster(ctx, mx, my, time, 1);
        drawIntroRoquero(ctx, cx - 60, groundY, time, 1, false);
      } else if (time < 8.6) {
        // lunge + bite
        const t3 = Math.min(1, (time - 7) / 1.0);
        const mx = cx + 90 - t3 * 70;
        drawIntroMonster(ctx, mx, groundY - 10, time, 1 + t3 * 0.3);
        const shrink = Math.max(0, 1 - t3 * 1.4);
        drawIntroRoquero(ctx, cx - 60, groundY, time, shrink, t3 > 0.5);
        if (t3 > 0.75) {
          ctx.fillStyle = `rgba(139,30,30,${(t3 - 0.75) * 3})`;
          ctx.fillRect(0, 0, W, H);
        }
      } else {
        // welcome card
        ctx.fillStyle = "#0b0908";
        ctx.fillRect(0, 0, W, H);
        const a = Math.min(1, (time - 8.6) / 0.8);
        ctx.globalAlpha = a;
        ctx.fillStyle = "#F4F1E9";
        ctx.textAlign = "center";
        ctx.font = "bold 26px 'Kalam', cursive";
        ctx.fillText("Bienvenido a", cx, H / 2 - 24);
        ctx.font = "bold 32px 'Kalam', cursive";
        ctx.fillStyle = "#E63946";
        ctx.fillText("SCAPE OF THE MONSTER", cx, H / 2 + 16);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(() => draw((performance.now() - start) / 1000));
    };
    raf = requestAnimationFrame(() => draw(0));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      onPointerDown={beginAudio}
      onTouchStart={beginAudio}
      onClick={beginAudio}
      className="min-h-screen w-full flex flex-col items-center justify-center gap-3 px-3"
      style={{ background: "#0b0908", fontFamily: "'Patrick Hand', cursive" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Kalam:wght@400;700&display=swap');`}</style>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-lg border-2"
        style={{ borderColor: "#3A342E", maxWidth: "100%" }}
      />
      {needsTap && (
        <p className="text-sm" style={{ color: "#8B8378" }}>Toca la pantalla para activar el sonido 🔊</p>
      )}
      {skippable && (
        <button
          onClick={() => { audio.stopMusic(); onDone(); }}
          className="px-4 py-2 rounded text-sm"
          style={{ background: "#2B2A28", color: "#F4F1E9" }}
        >
          Saltar intro ›
        </button>
      )}
    </div>
  );
}

function drawIntroRoquero(ctx, x, y, time, scale, beingEaten) {
  if (scale <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const bob = beingEaten ? 0 : Math.abs(Math.sin(time * 10)) * 5;
  ctx.fillStyle = "#D6336C";
  [-4, -1, 2, 5].forEach((ox) => {
    ctx.beginPath();
    ctx.moveTo(ox - 1.5, -34 - bob);
    ctx.lineTo(ox, -44 - bob);
    ctx.lineTo(ox + 1.5, -34 - bob);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = "#F4F1E9";
  ctx.beginPath(); ctx.arc(0, -28 - bob, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#F4F1E9";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -19 - bob); ctx.lineTo(0, 6 - bob);
  ctx.moveTo(0, 6 - bob); ctx.lineTo(-12, 32 - bob);
  ctx.moveTo(0, 6 - bob); ctx.lineTo(12, 32 - bob);
  ctx.stroke();
  ctx.restore();
}

function drawIntroMonster(ctx, x, y, time, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-scale, scale);
  const R = 20;
  for (let i = 0; i < 6; i++) {
    const baseY = -R * 0.85 + (i / 5) * R * 1.7;
    const len = R * 4 * (0.7 + (i % 3) * 0.15);
    ctx.strokeStyle = "#3A342E";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let k = 0; k <= 8; k++) {
      const tt = k / 8;
      const segX = -R * 1.1 - len * tt;
      const wave = Math.sin(time * 3 + i + tt * 5) * R * 0.7 * tt;
      const segY = baseY + wave;
      if (k === 0) ctx.moveTo(segX, segY); else ctx.lineTo(segX, segY);
    }
    ctx.stroke();
  }
  ctx.fillStyle = "#3A342E";
  ctx.beginPath();
  ctx.moveTo(-R * 1.1, -R * 0.5);
  ctx.quadraticCurveTo(0, -R * 1.15, R * 1.3, -R * 0.15);
  ctx.quadraticCurveTo(R * 1.65, 0, R * 1.3, R * 0.25);
  ctx.quadraticCurveTo(0, R * 1.05, -R * 1.1, R * 0.5);
  ctx.quadraticCurveTo(-R * 1.4, 0, -R * 1.1, -R * 0.5);
  ctx.closePath();
  ctx.fill();
  const jaw = 4 + Math.sin(time * 6) * 3;
  ctx.fillStyle = "#0F0D0B";
  ctx.beginPath();
  ctx.moveTo(R * 0.7, -R * 0.1 - jaw * 0.4);
  ctx.lineTo(R * 1.55, 0);
  ctx.lineTo(R * 0.7, R * 0.2 + jaw * 0.4);
  ctx.closePath();
  ctx.fill();
  [
    { ex: R * 0.02, ey: -R * 0.55 },
    { ex: R * 0.5, ey: -R * 0.42 },
  ].forEach(({ ex, ey }) => {
    ctx.fillStyle = "#1A1815";
    ctx.beginPath();
    ctx.moveTo(ex - 6, ey - 3.3);
    ctx.lineTo(ex + 6, ey - 3.3);
    ctx.lineTo(ex, ey + 5.1);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

const ANIMALS_UNLOCK_KEY = "stickman_animals_unlocked";
const COINS_KEY = "stickman_coins";
const UNLOCKED_ABILITIES_KEY = "stickman_unlocked_abilities";
const STARTER_ABILITY = "viento";

export default function GameApp() {
  const [screen, setScreen] = useState("intro");
  const [character, setCharacter] = useState(() => {
    let savedName = "";
    try {
      savedName = localStorage.getItem(NAME_STORAGE_KEY) || "";
    } catch (e) {
      /* localStorage unavailable — ignore */
    }
    return { name: savedName, color: INK_COLORS[0].hex, ability: STARTER_ABILITY, kind: "stickman" };
  });
  const [animalsUnlocked, setAnimalsUnlocked] = useState(() => {
    try {
      return localStorage.getItem(ANIMALS_UNLOCK_KEY) === "1";
    } catch (e) {
      return false;
    }
  });
  const [coins, setCoins] = useState(() => {
    try {
      return parseInt(localStorage.getItem(COINS_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [unlockedAbilities, setUnlockedAbilities] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(UNLOCKED_ABILITIES_KEY) || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (e) {
      /* ignore */
    }
    return [STARTER_ABILITY];
  });

  useEffect(() => {
    try {
      localStorage.setItem(NAME_STORAGE_KEY, character.name || "");
    } catch (e) {
      /* localStorage unavailable — ignore */
    }
  }, [character.name]);

  useEffect(() => {
    try {
      localStorage.setItem(COINS_KEY, String(coins));
    } catch (e) {
      /* ignore */
    }
  }, [coins]);

  useEffect(() => {
    try {
      localStorage.setItem(UNLOCKED_ABILITIES_KEY, JSON.stringify(unlockedAbilities));
    } catch (e) {
      /* ignore */
    }
  }, [unlockedAbilities]);

  const unlockAnimals = () => {
    setAnimalsUnlocked(true);
    try {
      localStorage.setItem(ANIMALS_UNLOCK_KEY, "1");
    } catch (e) {
      /* localStorage unavailable — ignore */
    }
  };

  const awardCoins = (amount) => setCoins((c) => c + amount);

  const purchaseAbility = (id) => {
    const price = ABILITIES[id].price || 0;
    if (unlockedAbilities.includes(id) || coins < price) return;
    setCoins((c) => c - price);
    setUnlockedAbilities((u) => (u.includes(id) ? u : [...u, id]));
  };

  if (screen === "intro") {
    return <IntroCutscene onDone={() => setScreen("creator")} />;
  }

  if (screen === "game") {
    const isAnimal = character.kind && character.kind !== "stickman";
    const animalDef = isAnimal ? ANIMAL_KINDS[character.kind] : null;
    return (
      <ChaseGame
        initialAbility={isAnimal ? animalDef.abilities[0] : character.ability}
        secondaryAbility={isAnimal ? animalDef.abilities[1] : null}
        characterKind={character.kind || "stickman"}
        playerName={character.name}
        playerColor={isAnimal ? animalDef.color : character.color}
        onBackToCreator={() => setScreen("creator")}
        onLevel10Cleared={unlockAnimals}
        onWinCoins={awardCoins}
      />
    );
  }

  return (
    <CharacterCreator
      character={character}
      setCharacter={setCharacter}
      onStart={() => setScreen("game")}
      coins={coins}
      unlockedAbilities={unlockedAbilities}
      onPurchaseAbility={purchaseAbility}
      animalsUnlocked={animalsUnlocked}
    />
  );
}
