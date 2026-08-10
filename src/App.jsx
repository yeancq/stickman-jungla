import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";

const ABILITIES = {
  viento: { name: "Racha", accent: "#3B7FA8", cd: 3.5, dur: 1.6, tag: "Velocidad", desc: "Deja una estela de viento y esquiva al monstruo en línea recta.", stat: "Dash x2.1 · recarga 3.5s" },
  sigilo: { name: "Bruma", accent: "#7A5EA8", cd: 5.5, dur: 2.6, tag: "Sigilo", desc: "Se vuelve casi transparente; el monstruo pierde el rastro.", stat: "2.6s invisible · recarga 5.5s" },
  trampa: { name: "Telaraña", accent: "#A87A2E", cd: 5, dur: 0, tag: "Trampa", desc: "Tiende una red en el suelo que atrapa al monstruo si la cruza.", stat: "Red 6s · recarga 5s" },
  clon: { name: "Clon", accent: "#9B4F96", cd: 8, dur: 6, tag: "Señuelo", desc: "Deja un doble; si el monstruo te atrapa mientras dura, el clon se sacrifica y no perdés vidas.", stat: "Dura 6s · recarga 8s" },
  fase: { name: "Fase", accent: "#2E93A6", cd: 4.5, dur: 0, tag: "Teletransporte", desc: "Te mueve varios pasos hacia adelante, atravesando cualquier pared en el camino.", stat: "~120px · recarga 4.5s" },
  electrico: { name: "Descarga", accent: "#C9A227", cd: 5.5, dur: 0, tag: "Aturdimiento", desc: "Lanza un rayo amarillo que paraliza al monstruo un rato al impactar.", stat: "Paraliza ~2.6s · recarga 5.5s" },
  fuego: { name: "Brasa", accent: "#E8460F", cd: 5, dur: 2.2, tag: "Fuego", desc: "Deja un rastro de llamas vivas que queman al monstruo si se acerca.", stat: "2.2s de rastro · recarga 5s" },
  mutar: { name: "Mutar", accent: "#4C9A2A", cd: 6, dur: 3, tag: "Veneno", desc: "Le crece una cola y corre a cuatro patas; lanza gas verde que paraliza al monstruo.", stat: "Paraliza ~2.9s · recarga 6s" },
  roquero: { name: "Roquero", accent: "#D6336C", cd: 6, dur: 3.2, tag: "Baile", desc: "Lleva una guitarra eléctrica y lanza notas que ponen a bailar al monstruo.", stat: "Baila 3.2s · recarga 6s" },
  laser: { name: "Láser", accent: "#E63946", cd: 7, dur: 0, tag: "Demolición", desc: "Dispara un láser desde la cabeza que rompe la primera pared que encuentra.", stat: "Rompe 1 pared · recarga 7s" },
  sierra: { name: "Sierra", accent: "#7C868D", cd: 8, dur: 4, tag: "Escudo", desc: "Dos sierras te rodean y te protegen de todo; si tocás un animal con ellas activas, desaparece.", stat: "Escudo 4s · recarga 8s" },
  tornado: { name: "Tornado", accent: "#5C8AA6", cd: 9, dur: 1.2, tag: "Torbellino", desc: "Giras y un tornado te arrastra a gran velocidad; lanza otro en sentido contrario que se lleva al monstruo si lo toca.", stat: "1.2s de impulso · recarga 9s" },
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
];

const EXIT = { x: WORLD_W - 14, y: WORLD_H / 2 - 45, w: 14, h: 90 };
const PLAYER_R = 12, MONSTER_R = 16;
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

function buildLevel(idx) {
  const lvl = LEVELS[idx % LEVELS.length];
  const walls = [...BORDER_WALLS, ...lvl.obstacles];
  return {
    walls,
    puddles: lvl.puddles,
    spikes: lvl.spikes,
    start: lvl.start,
    monsterStart: lvl.monsterStart,
    theme: lvl.theme,
    animals: lvl.animals,
    grid: computeBlockedGrid(walls),
  };
}

function freshState(levelIdx) {
  const lvl = buildLevel(levelIdx);
  return {
    player: { ...lvl.start },
    monster: { ...lvl.monsterStart },
    facing: { x: 1, y: 0 },
    monsterFacing: 0,
    moving: false,
    status: "playing",
    lives: 3,
    invuln: 1.2,
    dashT: 0,
    cd: 0,
    activeEffectT: 0,
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
    cloneMonsters: [],
    tripleCD: Math.max(5, 6.5 + Math.random() * 2 - levelIdx * 1.5),
    tripleT: 0,
    tripleFx: null,
    tornadoT: 0,
    tornadoProj: null,
    tornadoBurst: null,
    time: 0,
    level: levelIdx,
    levelWalls: lvl.walls,
    levelPuddles: lvl.puddles,
    levelSpikes: lvl.spikes,
    levelTheme: lvl.theme,
    levelAnimals: lvl.animals.map((a) => ({ ...a, cd: 1.5 + Math.random() * 2 })),
    rocks: [],
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

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
      masterRef.current = ctxRef.current.createGain();
      masterRef.current.gain.value = 0.55;
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
    g.gain.linearRampToValueAtTime(gain, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(g);
    g.connect(masterRef.current);
    osc.start(time);
    osc.stop(time + dur + 0.05);
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
    const bass = [110, 110, 130.81, 98, 110, 110, 116.54, 98];
    const arp = [220, 261.63, 329.63, 392, 349.23, 329.63, 261.63, 246.94];
    const stepDur = 0.26;
    const scheduleAhead = 0.4;
    let nextTime = ctx.currentTime + 0.05;
    stepRef.current = 0;

    const tick = () => {
      while (nextTime < ctx.currentTime + scheduleAhead) {
        const i = stepRef.current;
        playNote(bass[i % bass.length], nextTime, stepDur * 1.7, "triangle", 0.1);
        playNote(arp[i % arp.length], nextTime, stepDur * 0.85, "sine", 0.045);
        if (i % 8 === 0) playNote(bass[0] / 2, nextTime, stepDur * 4, "sawtooth", 0.035);
        nextTime += stepDur;
        stepRef.current++;
      }
    };
    tick();
    timerRef.current = setInterval(tick, 100);
  };

  const playApplause = () => {
    const ctx = ensureCtx();
    if (!ctx) return;
    const dur = 1.7;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const burst = Math.random() < 0.0025 ? 1 : 0.18;
      data[i] = (Math.random() * 2 - 1) * burst * Math.exp(-t * 0.7);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.6;
    src.connect(filter);
    filter.connect(g);
    g.connect(masterRef.current);
    src.start();
  };

  const setMuted = (muted) => {
    if (masterRef.current) masterRef.current.gain.value = muted ? 0 : 0.55;
  };

  return { ensureCtx, startMusic, stopMusic, playApplause, setMuted };
}

function ChaseGame({ initialAbility = "viento", playerName = "", onBackToCreator }) {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const joy = useRef({ x: 0, y: 0, pointerId: null, baseX: 0, baseY: 0 });
  const joyZoneRef = useRef(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0, active: false });
  const state = useRef({ ...freshState(0), status: "menu" });
  const [ability, setAbility] = useState(initialAbility);
  const [hud, setHud] = useState({ lives: 3, cd: 0, status: "menu", level: 0 });
  const [pick, setPick] = useState(initialAbility);
  const audio = useGameAudio();
  const [muted, setMuted] = useState(false);

  const reset = useCallback((ab) => {
    state.current = freshState(0);
    setAbility(ab);
    setHud({ lives: 3, cd: 0, status: "playing", level: 0 });
    audio.ensureCtx();
    audio.startMusic();
  }, []);

  const nextLevel = useCallback(() => {
    const nextIdx = state.current.level + 1;
    state.current = freshState(nextIdx);
    setHud({ lives: 3, cd: 0, status: "playing", level: nextIdx });
    audio.startMusic();
  }, []);

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
    if (hud.status === "won") {
      audio.stopMusic();
      audio.playApplause();
    } else if (hud.status === "lost") {
      audio.stopMusic();
    }
  }, [hud.status]);

  useEffect(() => () => audio.stopMusic(), []);

  useEffect(() => {
    const down = (e) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === " ") e.preventDefault();
    };
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
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
    keys.current[" "] = true;
  };
  const onAbilityUp = () => {
    keys.current[" "] = false;
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

        // ability trigger
        if (keys.current[" "] && s.cd <= 0) {
          keys.current[" "] = false;
          s.cd = ab.cd;
          if (ability === "viento") s.dashT = ab.dur;
          if (ability === "sigilo") s.activeEffectT = ab.dur;
          if (ability === "fuego") s.activeEffectT = ab.dur;
          if (ability === "sierra") s.activeEffectT = ab.dur;
          if (ability === "trampa") s.web = { x: s.player.x, y: s.player.y, t: 6 };
          if (ability === "clon") {
            s.activeEffectT = ab.dur;
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
          if (ability === "electrico" || ability === "mutar" || ability === "roquero") {
            const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
            const d0 = Math.hypot(dx0, dy0) || 1;
            const speed = ability === "electrico" ? 560 : ability === "roquero" ? 420 : 320;
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
            s.laserFx = { x1: s.player.x, y1: s.player.y, x2: hx, y2: hy, t: 0.35 };
            if (hitIdx !== -1) {
              s.destroyedWalls.add(hitIdx);
              const active = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
              s.blockedGrid = computeBlockedGrid(active);
              s.wallBreakFx = { x: hx, y: hy, t: 0.5 };
            }
          }
        }
        if (s.dashT > 0) s.dashT -= dt;
        if (s.tornadoT > 0) s.tornadoT -= dt;
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
        if (ability !== "clon" || s.activeEffectT <= 0) s.clonePos = null;
        const activeWalls = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
        const shieldActive = ability === "sierra" && s.activeEffectT > 0;

        // tornado thrown in the opposite direction — sweeps away anything it touches
        if (s.tornadoProj) {
          const tp = s.tornadoProj;
          tp.t += dt;
          tp.x += tp.vx * dt;
          tp.y += tp.vy * dt;
          const tpHitWall = activeWalls.some(
            (wl) => tp.x > wl.x && tp.x < wl.x + wl.w && tp.y > wl.y && tp.y < wl.y + wl.h
          );
          const dTpM = Math.hypot(tp.x - s.monster.x, tp.y - s.monster.y);
          let swept = false;
          if (dTpM < MONSTER_R + 14) {
            const dn = Math.hypot(tp.vx, tp.vy) || 1;
            s.monster.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x + (tp.vx / dn) * 150));
            s.monster.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + (tp.vy / dn) * 150));
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
          const dHit = Math.hypot(p.x - s.monster.x, p.y - s.monster.y);
          if (dHit < MONSTER_R + 6) {
            if (p.kind === "roquero") {
              s.danceT = Math.max(s.danceT, ABILITIES.roquero.dur);
              s.notesFx = { x: p.x, y: p.y, t: 0.6 };
            } else {
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

        // jungle animals throwing rocks
        if (s.levelAnimals.length > 0 && s.status === "playing") {
          s.levelAnimals.forEach((a) => {
            a.cd -= dt;
            const dA = Math.hypot(s.player.x - a.x, s.player.y - a.y);
            if (a.cd <= 0 && dA < 320) {
              a.cd = 2.4 + Math.random() * 2;
              const dxa = s.player.x - a.x, dya = s.player.y - a.y;
              const dna = Math.hypot(dxa, dya) || 1;
              s.rocks.push({ x: a.x, y: a.y, vx: (dxa / dna) * 230, vy: (dya / dna) * 230, t: 0 });
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
          s.tripleT -= dt;
          if (s.tripleT <= 0) {
            s.cloneMonsters = [];
          } else {
            s.cloneMonsters.forEach((c) => {
              const dxc = s.player.x - c.x, dyc = s.player.y - c.y;
              const dc = Math.hypot(dxc, dyc) || 1;
              c.facing = Math.atan2(dyc, dxc);
              const cSpeed = 78 + Math.min(s.time * 0.7, 40);
              c.x += (dxc / dc) * cSpeed * dt;
              c.y += (dyc / dc) * cSpeed * dt;
              c.x = Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, c.x));
              c.y = Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, c.y));
              activeWalls.forEach((wl) => circleRectPush(c, MONSTER_R * 0.86, wl));
            });
          }
        }

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
          const speed = 126 * (s.dashT > 0 ? 2.1 : 1) * (s.tornadoT > 0 ? 2.8 : 1) * (slowed ? PUDDLE_SLOW : 1);
          s.player.x += (mx / len) * speed * dt;
          s.player.y += (my / len) * speed * dt;
        }
        s.player.x = Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, s.player.x));
        s.player.y = Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, s.player.y));
        if (s.teleportGrace > 0) {
          s.teleportGrace -= dt;
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
        if (s.stunT <= 0 && s.danceT <= 0) {
          let goalX = s.player.x, goalY = s.player.y;
          let mSpeed = 88 + s.level * 16 + Math.min(s.time * 0.9, 55);
          const seesPlayer = !(ability === "sigilo" && s.activeEffectT > 0);
          if (!seesPlayer) {
            goalX = s.monster._lastSeenX ?? s.monster.x;
            goalY = s.monster._lastSeenY ?? s.monster.y;
            mSpeed *= 0.4;
          } else {
            s.monster._lastSeenX = s.player.x;
            s.monster._lastSeenY = s.player.y;
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
              {
                x: Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x - 18)),
                y: Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y - 14)),
                facing: s.monsterFacing,
              },
              {
                x: Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.monster.x - 18)),
                y: Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.monster.y + 14)),
                facing: s.monsterFacing,
              },
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
        if (ability === "fuego" && s.activeEffectT > 0) {
          const d = Math.hypot(s.monster.x - s.player.x, s.monster.y - s.player.y);
          if (d < 60) s.stunT = Math.max(s.stunT, 0.4);
        }

        // collisions
        const threats = [
          { x: s.monster.x, y: s.monster.y, r: MONSTER_R },
          ...s.cloneMonsters.map((c) => ({ x: c.x, y: c.y, r: MONSTER_R * 0.86 })),
        ];
        const caughtBy = threats.find((t) => Math.hypot(t.x - s.player.x, t.y - s.player.y) < PLAYER_R + t.r - 4);
        const stealthSafe = ability === "sigilo" && s.activeEffectT > 0;
        if (caughtBy && s.invuln <= 0 && !stealthSafe && !shieldActive) {
          if (ability === "clon" && s.activeEffectT > 0) {
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
        if (rectsOverlap(exitRect, EXIT)) s.status = "won";

        setHud({ lives: s.lives, cd: Math.max(0, s.cd), status: s.status, level: s.level });
      }

      draw(ctx, s, ability);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ability]);

  function draw(ctx, s, abilityId) {
    const jungle = s.levelTheme === "jungle";
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    if (jungle) {
      const grdBg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grdBg.addColorStop(0, "#5FA860");
      grdBg.addColorStop(1, "#7FC47C");
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

    // jungle animals that throw rocks
    s.levelAnimals.forEach((a) => {
      const bob = Math.sin(s.time * 3 + a.x) * 2;
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
    });

    // rocks in flight
    s.rocks.forEach((r) => {
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.t * 10);
      ctx.fillStyle = "#5B5850";
      ctx.beginPath();
      ctx.moveTo(-4, -3); ctx.lineTo(4, -2); ctx.lineTo(3, 4); ctx.lineTo(-3, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // spikes hazard
    ctx.fillStyle = "#8B1E1E";
    s.levelSpikes.forEach((sp) => {
      const n = Math.max(2, Math.floor(sp.w / 14));
      for (let i = 0; i < n; i++) {
        const tx0 = sp.x + (i * sp.w) / n;
        const tw = sp.w / n;
        ctx.beginPath();
        ctx.moveTo(tx0, sp.y + sp.h);
        ctx.lineTo(tx0 + tw / 2, sp.y);
        ctx.lineTo(tx0 + tw, sp.y + sp.h);
        ctx.closePath();
        ctx.fill();
      }
    });

    // walls (skip destroyed ones, leave rubble behind)
    ctx.fillStyle = "#2B2A28";
    s.levelWalls.forEach((wl, i) => {
      if (s.destroyedWalls.has(i)) {
        ctx.fillStyle = "rgba(58,52,46,0.35)";
        const n = 5;
        for (let k = 0; k < n; k++) {
          const rx = wl.x + ((k * 37) % Math.max(wl.w, 1));
          const ry = wl.y + ((k * 23) % Math.max(wl.h, 1));
          ctx.fillRect(rx, ry, 3, 3);
        }
        ctx.fillStyle = "#2B2A28";
        return;
      }
      ctx.fillRect(wl.x, wl.y, wl.w, wl.h);
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
      const alpha = Math.max(0, fx.t / 0.35);
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
    // fire trail
    if (abilityId === "fuego" && s.activeEffectT > 0) {
      const grd = ctx.createRadialGradient(s.player.x, s.player.y, 2, s.player.x, s.player.y, 60);
      grd.addColorStop(0, "rgba(255,180,40,0.5)");
      grd.addColorStop(1, "rgba(232,70,15,0)");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(s.player.x, s.player.y, 60, 0, Math.PI * 2); ctx.fill();
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

    // sierra shield orbiting the player
    if (abilityId === "sierra" && s.activeEffectT > 0) {
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

    s.cloneMonsters.forEach((c, i) => {
      drawMonsterBody(ctx, s, abilityId, {
        x: c.x,
        y: c.y,
        facingAngle: c.facing,
        stunned: false,
        dancing: false,
        alpha: 0.82,
        seed: i * 2.1 + 1,
        echo: true,
      });
    });

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
    const stealthActive = abilityId === "sigilo" && s.activeEffectT > 0;
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

      ctx.strokeStyle = "#4C9A2A";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(-11, Math.sin(s.time * 7) * 4, -16, Math.sin(s.time * 7 + 1) * 3);
      ctx.stroke();

      ctx.strokeStyle = "#2B2A28";
      ctx.fillStyle = "#2B2A28";
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
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }

    const victory = s.status === "won";
    const moveSwing = s.moving ? Math.sin(s.time * 12) : 0;
    const swing = victory ? Math.sin(s.time * 7) : moveSwing;
    const legSwing = victory ? swing * 6 : swing * 6;
    const armSwing = -moveSwing * 6;
    const bob = victory
      ? Math.abs(Math.sin(s.time * 7)) * 5
      : s.moving
      ? Math.abs(Math.sin(s.time * 12)) * 1.4
      : 0;
    const hipY = y + 2 - bob;

    ctx.strokeStyle = "#2B2A28";
    ctx.fillStyle = "#2B2A28";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";

    if (abilityId === "mutar") {
      const tx = x - s.facing.x * 16;
      const ty = hipY - s.facing.y * 10 + Math.sin(s.time * 6) * 3;
      ctx.strokeStyle = "#4C9A2A";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.quadraticCurveTo(x - s.facing.x * 9, hipY + 5 - s.facing.y * 5, tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2B2A28";
      ctx.fillStyle = "#2B2A28";
    }

    ctx.beginPath();
    ctx.arc(x, hipY - 15, 5.5, 0, Math.PI * 2);
    ctx.fill();

    if (abilityId === "laser") {
      ctx.fillStyle = ABILITIES.laser.accent;
      ctx.globalAlpha *= 0.7 + Math.sin(s.time * 10) * 0.3;
      ctx.beginPath();
      ctx.arc(x + s.facing.x * 4, hipY - 15 - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = stealthActive ? 0.35 : s.invuln > 0 ? 0.5 + 0.5 * Math.sin(s.time * 20) : 1;
      ctx.fillStyle = "#2B2A28";
    }

    ctx.beginPath();
    ctx.moveTo(x, hipY - 9.5);
    ctx.lineTo(x, hipY);
    ctx.stroke();

    ctx.beginPath();
    if (victory) {
      // victory dance: arms alternate raising overhead
      const lArm = Math.sin(s.time * 6.5);
      const rArm = Math.sin(s.time * 6.5 + Math.PI);
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(x - 6 - lArm * 2, hipY - 7 - (lArm * 0.5 + 0.5) * 15);
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(x + 6 + rArm * 2, hipY - 7 - (rArm * 0.5 + 0.5) * 15);
    } else {
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(x - 6.5 + armSwing, hipY);
      ctx.moveTo(x, hipY - 7);
      ctx.lineTo(x + 6.5 - armSwing, hipY);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, hipY);
    ctx.lineTo(x - 4.5 + legSwing, hipY + 13);
    ctx.moveTo(x, hipY);
    ctx.lineTo(x + 4.5 - legSwing, hipY + 13);
    ctx.stroke();

    if (abilityId === "roquero") {
      ctx.save();
      ctx.translate(x + s.facing.x * 4, hipY - 3);
      ctx.rotate(Math.atan2(s.facing.y, s.facing.x) + 0.55);
      ctx.fillStyle = ABILITIES.roquero.accent;
      ctx.beginPath();
      ctx.ellipse(0, 4, 4.2, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2B2A28";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -1.5);
      ctx.lineTo(0, -14);
      ctx.stroke();
      ctx.fillStyle = "#2B2A28";
      ctx.fillRect(-2, -17, 4, 3.5);
      ctx.strokeStyle = "rgba(43,42,40,0.5)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-1, -14); ctx.lineTo(-1, 4);
      ctx.moveTo(1, -14); ctx.lineTo(1, 4);
      ctx.stroke();
      ctx.restore();
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
        touchAction: "none",
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
          <button onClick={() => reset(pick)} className="w-full py-3 rounded marker text-lg active:scale-95 transition-transform" style={{ background: "#2B2A28", color: "#F4F1E9" }}>
            Empezar
          </button>
        </div>
      )}

      {hud.status !== "menu" && (
        <div className="flex items-center gap-3 mb-2 w-full max-w-[640px] justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm marker" style={{ color: "#5B5850" }}>Nivel {hud.level + 1}</span>
            {playerName && (
              <span className="text-xs sm:text-sm marker hidden sm:inline" style={{ color: "#5B5850" }}>· {playerName}</span>
            )}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ color: i < hud.lives ? "#8B1E1E" : "#D8D3C4", fontSize: 20 }}>♥</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm marker" style={{ color: ab.accent }}>{ab.name}</span>
            <div className="w-16 sm:w-24 h-2 rounded-full border" style={{ borderColor: "#2B2A28" }}>
              <div className="h-full rounded-full" style={{ width: `${cdPct * 100}%`, background: ab.accent }} />
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

      {ability === "trampa" && (
        <g stroke="#A87A2E" strokeWidth="1.6" fill="none" opacity="0.85">
          <path d="M60 268 L160 268 M110 250 L110 286 M75 253 L145 283 M145 253 L75 283" />
          <circle cx="110" cy="268" r="42" strokeDasharray="3 4" />
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

function CharacterCreator({ character, setCharacter, onStart }) {
  const { name, color, ability } = character;
  const [confirmed, setConfirmed] = useState(false);
  const currentAbility = useMemo(() => ABILITIES[ability], [ability]);

  return (
    <div className="min-h-screen w-full relative" style={{ background: "#F4F1E9", fontFamily: "'Patrick Hand', cursive" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Kalam:wght@400;700&display=swap');
        h1, h2, .marker { font-family: 'Kalam', cursive; }
      `}</style>
      <CreatorBackdrop />

      <div className="relative z-10 max-w-xl mx-auto px-5 pt-8 pb-16">
        <div className="flex items-center gap-2 mb-1">
          <span className="marker text-xs tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: "#2B2A28", color: "#F4F1E9" }}>
            Ficha de personaje
          </span>
        </div>
        <h1 className="text-4xl mb-1" style={{ color: "#2B2A28" }}>Dibuja tu stickman</h1>
        <p className="text-base mb-6" style={{ color: "#5B5850" }}>Elige su tinta y su habilidad para escapar del monstruo.</p>

        <div
          className="rounded-lg border-2 flex flex-col items-center justify-end relative overflow-hidden"
          style={{ borderColor: "#2B2A28", background: "#FBFAF5", minHeight: 300, boxShadow: "3px 3px 0 #2B2A28" }}
        >
          <div className="absolute inset-0"><CreatorBackdrop /></div>
          <div className="relative pt-6">
            <PreviewStickman color={color} ability={ability} />
          </div>
          <div className="relative w-full text-center pb-3 pt-1 marker text-lg" style={{ color: currentAbility.accent }}>
            {name || "Sin nombre"} · {currentAbility.tag}
          </div>
        </div>

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

        <div className="mt-6">
          <label className="block marker text-lg mb-2" style={{ color: "#2B2A28" }}>Habilidad especial</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(ABILITIES).map(([id, a]) => {
              const selected = id === ability;
              return (
                <button
                  key={id}
                  onClick={() => setCharacter((c) => ({ ...c, ability: id }))}
                  className="text-left p-3 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: selected ? a.accent : "#D8D3C4",
                    background: selected ? `${a.accent}14` : "#FBFAF5",
                    boxShadow: selected ? `2px 2px 0 ${a.accent}` : "none",
                  }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="marker text-lg" style={{ color: "#2B2A28" }}>{a.name}</span>
                    <span className="text-xs uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ background: a.accent, color: "#FBFAF5" }}>
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: "#5B5850" }}>{a.desc}</p>
                  <p className="text-xs mt-1 marker" style={{ color: a.accent }}>{a.stat}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setConfirmed(true)}
          className="mt-7 w-full py-3 rounded-lg marker text-xl border-2"
          style={{ background: "#2B2A28", color: "#F4F1E9", borderColor: "#2B2A28", boxShadow: "3px 3px 0 " + currentAbility.accent }}
        >
          Confirmar personaje
        </button>

        {confirmed && (
          <div className="mt-6 p-4 rounded-lg border-2" style={{ borderColor: currentAbility.accent, background: "#FBFAF5" }}>
            <p className="marker text-lg" style={{ color: "#2B2A28" }}>
              {name || "Tu stickman"} está listo para huir 🕸️
            </p>
            <p className="text-sm mt-1" style={{ color: "#5B5850" }}>
              Habilidad: <strong>{currentAbility.name}</strong> — {currentAbility.stat}
            </p>
            <button
              onClick={onStart}
              className="mt-4 w-full py-3 rounded-lg marker text-xl border-2"
              style={{ background: currentAbility.accent, color: "#FBFAF5", borderColor: "#2B2A28", boxShadow: "3px 3px 0 #2B2A28" }}
            >
              ▶ Comenzar partida
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameApp() {
  const [screen, setScreen] = useState("creator");
  const [character, setCharacter] = useState({ name: "", color: INK_COLORS[0].hex, ability: "viento" });

  if (screen === "game") {
    return (
      <ChaseGame
        initialAbility={character.ability}
        playerName={character.name}
        onBackToCreator={() => setScreen("creator")}
      />
    );
  }

  return (
    <CharacterCreator
      character={character}
      setCharacter={setCharacter}
      onStart={() => setScreen("game")}
    />
  );
}
