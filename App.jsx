import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";

const ABILITIES = {
  viento: { price: 0, name: "Racha", accent: "#3B7FA8", cd: 3.5, dur: 1.6, tag: "Velocidad", desc: "Deja una estela de viento y esquiva al monstruo en línea recta.", stat: "Dash x2.1 · recarga 3.5s" },
  muerte: { price: 55, name: "Muerte", accent: "#7B1FA2", cd: 7.5, dur: 0, tag: "Muerte", desc: "El juego se pausa y el personaje brilla en un morado intenso; crea una hoz gigante y aparece de golpe junto al monstruo, cortándolo por la mitad y quitándole 2 vidas. Súper: antes se acerca a una pared, la toca y esta brilla en morado antes de desaparecer y dar el golpe.", stat: "Quita 2 vidas al monstruo · recarga 7.5s" },
  tiempo: { price: 45, name: "Tiempo", accent: "#3FA089", cd: 6, dur: 3, tag: "Congelar", desc: "Lanza un reloj verde que detiene el tiempo para todos unos segundos.", stat: "Congela 3s · recarga 6s" },
  luz: { price: 45, name: "Luz", accent: "#FFE066", cd: 6.5, dur: 0, tag: "Aturdimiento", desc: "El juego se pausa, el personaje se gira hacia el monstruo y lanza un ultra gigantesco rayo de luz desde las manos que lo aturde. Súper: el personaje brilla con una luz intensa y se teletransporta.", stat: "Aturde ~3.2s · recarga 6.5s" },
  fase: { price: 35, name: "Fase", accent: "#2E93A6", cd: 4.5, dur: 0, tag: "Teletransporte", desc: "Extiende la mano, abre un portal y salta al otro lado, atravesando cualquier pared en el camino.", stat: "~120px · recarga 4.5s" },
  electrico: { price: 40, name: "Descarga", accent: "#C9A227", cd: 5.5, dur: 0, tag: "Aturdimiento", desc: "Lanza un rayo amarillo que paraliza al monstruo un rato al impactar.", stat: "Paraliza ~2.6s · recarga 5.5s" },
  fuego: { price: 35, name: "Brasa", accent: "#E8460F", cd: 5, dur: 2.2, tag: "Fuego", desc: "Una gran bola de fuego te envuelve tan brillante que no se te ve; si el monstruo se acerca, queda quemado. Súper: tus manos incendian por completo las paredes cercanas.", stat: "Bola de fuego 2.2s · recarga 5s" },
  mutar: { price: 45, name: "Mutar", accent: "#4C9A2A", cd: 6, dur: 3, tag: "Veneno", desc: "Le crece una cola y corre a cuatro patas; lanza gas verde que paraliza al monstruo.", stat: "Paraliza ~2.9s · recarga 6s" },
  roquero: { price: 40, name: "Roquero", accent: "#D6336C", cd: 6, dur: 3.2, tag: "Baile", desc: "Lleva una guitarra eléctrica y lanza notas que ponen a bailar al monstruo.", stat: "Baila 3.2s · recarga 6s" },
  laser: { price: 60, name: "Láser", accent: "#E63946", cd: 7, dur: 0, tag: "Demolición", desc: "Dispara un láser desde la cabeza que rompe la primera pared que encuentra.", stat: "Rompe 1 pared · recarga 7s" },
  metal: { price: 45, name: "Metal", accent: "#8A93A0", cd: 8, dur: 4, tag: "Blindaje", desc: "El juego se pausa y una capa de metal te recubre: corrés mucho más rápido y los ataques que te toquen rebotan de vuelta. Súper: apuntás ambas manos al frente y disparás 30 rayos de cada mano; donde caen forman bultos metálicos que sólo vos podés atravesar.", stat: "Blindaje 4s · recarga 8s" },
  tornado: { price: 50, name: "Tornado", accent: "#5C8AA6", cd: 9, dur: 1.2, tag: "Torbellino", desc: "Giras y un tornado te arrastra a gran velocidad; lanza otro en sentido contrario que se lleva al monstruo si lo toca.", stat: "1.2s de impulso · recarga 9s" },
  ladron: { price: 40, name: "Ladrón", accent: "#B8860B", cd: 7, dur: 0, tag: "Robo", desc: "Lanza un gran rayo que le roba una vida al monstruo; esa vida pasa a ser tuya. Si el monstruo te toca, quedás cortado por la mitad hasta que uses el robo.", stat: "Roba 1 vida · recarga 7s" },
};

const VIEW_W = 640;
const VIEW_H = 420;
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
// Racha (velocidad): el juego se congela mientras el stickman se convierte en energía azul
const RACHA_CHARGE_T = 1.15;   // segundos de pausa total + transformación
const RACHA_REVEAL_T = 0.4;    // segundos que tarda en reaparecer el cuerpo al terminar la velocidad
const RACHA_TRAIL_LIFE = 0.45; // duración de la estela de energía

let _rachaOff = null; // canvas auxiliar para desvanecer el cuerpo de cualquier personaje

function drawRachaTrail(ctx, s) {
  const tr = s.rachaTrail;
  if (!tr || tr.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < tr.length; i++) {
    const a = tr[i - 1], b = tr[i];
    if (Math.hypot(b.x - a.x, b.y - a.y) > 40) continue;
    const k = Math.max(0, 1 - b.age / RACHA_TRAIL_LIFE);
    ctx.strokeStyle = `rgba(40,120,255,${0.35 * k})`;
    ctx.lineWidth = 4 + 18 * k;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = `rgba(190,230,255,${0.9 * k})`;
    ctx.lineWidth = 1.5 + 6 * k;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
}

function drawRachaHalo(ctx, s, x, y, glow, charging, prog) {
  const c = s.rachaClock || 0;
  const cy = y - 2;
  const pulse = 1 + Math.sin(c * 20) * 0.07;
  const R = (charging ? 24 + 30 * (prog || 0) : 40) * pulse;
  ctx.save();
  const grd = ctx.createRadialGradient(x, cy, 2, x, cy, R);
  grd.addColorStop(0, `rgba(140,210,255,${0.8 * glow})`);
  grd.addColorStop(0.5, `rgba(50,130,255,${0.5 * glow})`);
  grd.addColorStop(1, "rgba(40,110,255,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, cy, R, 0, Math.PI * 2);
  ctx.fill();
  if (charging) {
    const a = Math.min(1, (prog || 0) * 4);
    // chispas de energía entrando hacia el stickman
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const ph = (c * 1.6 + i * 0.173) % 1;
      const ang = i * 2.399 + c * 2;
      const d1 = R * 1.5 * (1 - ph) + 6;
      const d2 = d1 + 8;
      ctx.strokeStyle = `rgba(120,190,255,${a * (0.4 + 0.6 * ph)})`;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * d1, cy + Math.sin(ang) * d1);
      ctx.lineTo(x + Math.cos(ang) * d2, cy + Math.sin(ang) * d2);
      ctx.stroke();
    }
    // anillo de energía que se expande
    const rp = (c * 1.2) % 1;
    ctx.strokeStyle = `rgba(63,140,255,${a * (1 - rp) * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, cy, 10 + rp * 40, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRachaCore(ctx, s, x, y, glow) {
  const c = s.rachaClock || 0;
  const cy = y - 2;
  const pulse = 1 + Math.sin(c * 26) * 0.08;
  const r = 23 * pulse * (0.55 + 0.45 * glow);
  ctx.save();
  ctx.globalAlpha = Math.min(1, glow * 1.15);
  const g = ctx.createRadialGradient(x, cy, 1, x, cy, r);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(0.35, "#BFE6FF");
  g.addColorStop(0.75, "#3F8CFF");
  g.addColorStop(1, "#1F5FE0");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1650C8";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // zarcillos de energía girando alrededor del núcleo
  ctx.strokeStyle = "rgba(223,242,255,0.85)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const a0 = c * 9 + (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(x, cy, r + 4, a0, a0 + 0.9);
    ctx.stroke();
  }
  ctx.restore();
}

// Fase (teletransporte): el juego se congela mientras el stickman extiende la mano, abre un portal
// entre el espacio donde está y el que quiere cruzar, salta hacia él y reaparece del otro lado.
const FASE_T = 1.3;         // segundos de pausa total
const FASE_CLOSE_T = 0.4;   // segundos que tardan los portales en cerrarse (el juego ya corre)
const FASE_DIST = 120;      // distancia del teletransporte
const FASE_PORTAL_A = 27;   // semieje del portal, perpendicular a la dirección del salto
const FASE_PORTAL_B = 10;   // semieje del portal, a lo largo de la dirección del salto

const smooth01 = (k) => { const q = Math.max(0, Math.min(1, k)); return q * q * (3 - 2 * q); };
const seg01 = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const easeOutBack = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

// línea de tiempo de la pausa (p = 0..1)
function faseTimeline(p) {
  return {
    arm: smooth01(seg01(p, 0.02, 0.26)) * (1 - smooth01(seg01(p, 0.9, 1))), // mano extendida
    spark: seg01(p, 0.08, 0.2) * (1 - seg01(p, 0.3, 0.42)),                 // chispa en la punta de los dedos
    entry: easeOutBack(seg01(p, 0.14, 0.42)),                               // apertura del portal de entrada
    exit: easeOutBack(seg01(p, 0.28, 0.54)),                                // apertura del portal de salida
    link: smooth01(seg01(p, 0.3, 0.52)),                                    // eje que une ambos portales
    crouch: seg01(p, 0.44, 0.52),                                           // agacharse antes de saltar
    jump: seg01(p, 0.52, 0.8),                                              // salto hacia el portal
    emerge: seg01(p, 0.8, 1),                                               // sale por el segundo portal
  };
}

// Ladrón (robo de vida): si el monstruo toca al stickman queda cortado por la mitad. Al usar la habilidad
// (o la súper) el juego se pausa: primero las dos mitades se vuelven a unir (si estaba cortado) y, tras una
// segunda pausa, lanza un gran rayo al monstruo; por medio del rayo le roba la vida y todo vuelve a la normalidad.
const LADRON_JOIN_T = 1.0;        // pausa 1: las mitades vuelven a unirse (solo si estaba cortado)
const LADRON_RAY_T = 1.9;         // pausa 2: el rayo (habilidad normal)
const LADRON_RAY_SUPER_T = 2.3;   // pausa 2: el rayo (súper habilidad)
const LADRON_CUT_FX_T = 0.95;     // duración del tajo al ser tocado
const LADRON_GAP = 2.6;           // separación (px) de cada mitad mientras está cortado
const LADRON_CUT_A = -0.3;        // inclinación de la línea de corte (rad)
let _cutOff = null;               // canvas auxiliar para partir el cuerpo de cualquier personaje

const easeOutCubic = (k) => 1 - Math.pow(1 - k, 3);
const hsh = (k) => { const v = Math.sin(k * 12.9898) * 43758.5453; return v - Math.floor(v); };

function ladronPhase(fx, remaining) {
  const el = Math.max(0, fx.total - remaining);
  if (el < fx.joinT) return { phase: "join", p: el / fx.joinT, el };
  return { phase: "ray", p: Math.min(1, (el - fx.joinT) / fx.rayT), el };
}

// línea de tiempo de la pausa del rayo (p = 0..1)
function ladronTimeline(p) {
  return {
    arm: smooth01(seg01(p, 0.03, 0.22)) * (1 - smooth01(seg01(p, 0.86, 0.99))), // brazo extendido hacia el monstruo
    charge: seg01(p, 0.05, 0.32),                                                // la energía se acumula en la mano
    head: easeOutCubic(seg01(p, 0.32, 0.5)),                                     // la punta del rayo viaja hasta el monstruo
    beam: seg01(p, 0.32, 0.36) * (1 - smooth01(seg01(p, 0.82, 0.95))),           // visibilidad del rayo
    hit: seg01(p, 0.5, 0.66),                                                    // impacto
    drain: seg01(p, 0.58, 0.86),                                                 // la vida viaja de vuelta por el rayo
    land: seg01(p, 0.82, 0.98),                                                  // la vida llega al stickman
    pan: smooth01(seg01(p, 0.32, 0.5)) * (1 - smooth01(seg01(p, 0.64, 0.9))),   // la cámara acompaña al rayo y vuelve
  };
}

function startLadron(s, superMode) {
  const alive = !s.monsterDefeated && s.monsterLives > 0;
  if (!alive) {
    // sin monstruo al que robarle la vida: la súper solo cura (y el stickman se une); la normal no hace nada
    if (superMode) { s.lives = Math.max(s.lives, 5); s.ladronCut = false; }
    return;
  }
  const wasCut = !!s.ladronCut;
  const hx = s.player.x, hy = s.player.y - 5;
  const dx = s.monster.x - hx, dy = s.monster.y - hy;
  const d = Math.hypot(dx, dy) || 1;
  const joinT = wasCut ? LADRON_JOIN_T : 0;
  const rayT = superMode ? LADRON_RAY_SUPER_T : LADRON_RAY_T;
  s.ladronFx = {
    superMode, wasCut, joinT, rayT,
    total: joinT + rayT,
    applyAt: joinT + rayT * 0.84,
    dx: dx / d, dy: dy / d,
    gain: superMode ? Math.max(0, 5 - s.lives) : 1,
    applied: false,
  };
  s.ladronT = joinT + rayT;
  s.ladronCut = false;
  s.moving = false;
  if (superMode) s.superFx = null;
}

// Muerte: el juego se pausa y se enfoca en el personaje, que brilla en un morado intenso y
// hace crecer una hoz gigante; de golpe aparece junto al monstruo y lo corta por la mitad,
// quitándole 2 vidas. Súper: antes de eso, el personaje se acerca a la pared más cercana, la
// toca (la pared brilla en morado) y desaparece justo ahí antes de dar el golpe.
const MUERTE_WALL_T = 1.3;         // súper: acercarse y tocar la pared
const MUERTE_STRIKE_T = 1.9;       // habilidad normal: brillo + hoz + corte
const MUERTE_STRIKE_SUPER_T = 1.9; // lo mismo, después de la fase de la pared
const MUERTE_CUT_A = 0.5;          // inclinación del tajo sobre el monstruo (rad)
const MUERTE_CUT_FX_T = 0.9;       // duración del tajo visible sobre el monstruo
let _muerteOff = null;             // canvas auxiliar para teñir de morado a cualquier personaje
let _luzOff = null;                // canvas auxiliar para teñir de blanco-dorado a cualquier personaje

function muertePhase(fx, remaining) {
  const el = Math.max(0, fx.total - remaining);
  if (fx.wallT > 0 && el < fx.wallT) return { phase: "wall", p: el / fx.wallT, el };
  return { phase: "strike", p: Math.min(1, (el - fx.wallT) / fx.strikeT), el };
}

// línea de tiempo de la fase de la pared (solo súper, p = 0..1)
function muerteWallTimeline(p) {
  return {
    walk: easeOutCubic(seg01(p, 0, 0.5)),                                            // camina hacia la pared
    reach: smooth01(seg01(p, 0.38, 0.58)),                                            // extiende el brazo
    wallGlow: smooth01(seg01(p, 0.52, 0.86)) * (1 - smooth01(seg01(p, 0.96, 1))),      // la pared brilla morado
    fade: smooth01(seg01(p, 0.72, 0.98)),                                             // desaparece junto a la pared
  };
}

// línea de tiempo del brillo + hoz + corte (p = 0..1)
function muerteStrikeTimeline(p) {
  return {
    glow: smooth01(seg01(p, 0, 0.22)) * (1 - smooth01(seg01(p, 0.9, 1))),             // aura morada intensa
    scytheA: smooth01(seg01(p, 0.14, 0.28)) * (1 - smooth01(seg01(p, 0.86, 1))),       // opacidad de la hoz
    scythe: easeOutCubic(seg01(p, 0.16, 0.4)),                                         // crecimiento de la hoz
    vanish: smooth01(seg01(p, 0.4, 0.5)),                                             // se desvanece en su lugar
    strike: easeOutCubic(seg01(p, 0.5, 0.62)),                                         // el tajo junto al monstruo
    impact: smooth01(seg01(p, 0.56, 0.74)) * (1 - smooth01(seg01(p, 0.92, 1))),        // destello del corte
    pan: smooth01(seg01(p, 0.48, 0.62)) * (1 - smooth01(seg01(p, 0.72, 0.92))),        // la cámara acompaña el salto
    ret: smooth01(seg01(p, 0.82, 1)),                                                  // reaparece en su lugar
  };
}

function startMuerte(s, superMode, nearWall) {
  const alive = !s.monsterDefeated && s.monsterLives > 0;
  const wallT = superMode && nearWall ? MUERTE_WALL_T : 0;
  const strikeT = superMode ? MUERTE_STRIKE_SUPER_T : MUERTE_STRIKE_T;
  let wall = null;
  if (wallT > 0) {
    const px = s.player.x, py = s.player.y;
    const wl = nearWall.wl;
    const ox = Math.max(wl.x, Math.min(px, wl.x + wl.w));
    const oy = Math.max(wl.y, Math.min(py, wl.y + wl.h));
    const dx = ox - px, dy = oy - py;
    const dl = Math.hypot(dx, dy) || 1;
    const stop = 15;
    wall = {
      touchX: ox, touchY: oy,
      walkToX: ox - (dx / dl) * stop, walkToY: oy - (dy / dl) * stop,
      dir: { x: dx / dl, y: dy / dl },
      fromX: px, fromY: py,
    };
  }
  s.muerteFx = {
    superMode, wallT, strikeT,
    total: wallT + strikeT,
    applyAt: wallT + strikeT * 0.62,
    fromX: s.player.x, fromY: s.player.y,
    monsterX: s.monster.x, monsterY: s.monster.y,
    wall,
    applied: !alive,
  };
  s.muerteT = wallT + strikeT;
  s.moving = false;
  if (superMode) s.superFx = null;
}

// Tiempo (congelar): el juego se pausa mientras el stickman se voltea hacia el monstruo,
// extiende el brazo y dispara una esfera verde brillante que lo paraliza al llegar.
const TIEMPO_T = 1.2;        // segundos de pausa total (habilidad normal)
const TIEMPO_SPHERE_R = 22;  // radio base de la esfera (grande y bien visible)

// línea de tiempo de la pausa de Tiempo (p = 0..1)
function tiempoTimeline(p) {
  return {
    arm: smooth01(seg01(p, 0.04, 0.28)) * (1 - smooth01(seg01(p, 0.94, 1))), // se voltea y extiende el brazo
    charge: seg01(p, 0.08, 0.4),                                             // la esfera se forma en la mano
    travel: easeOutCubic(seg01(p, 0.4, 0.86)),                                // la esfera viaja hacia el monstruo
    hit: seg01(p, 0.86, 1),                                                   // impacto y congelamiento
  };
}

function startTiempo(s, dur) {
  const hx = s.player.x, hy = s.player.y - 5;
  const dx = s.monster.x - hx, dy = s.monster.y - hy;
  const d = Math.hypot(dx, dy) || 1;
  s.tiempoFx = { dx: dx / d, dy: dy / d, dur };
  s.tiempoT = TIEMPO_T;
  s.moving = false;
}

// Súper Tiempo: el juego se pausa mientras el stickman salta y aterriza sobre una motocicleta
// cuyas ruedas son relojes analógicos; al arrancar obtiene la misma velocidad e inmunidad que Racha.
const MOTO_T = 1.0; // segundos de pausa total antes de arrancar

function motoTimeline(p) {
  return {
    crouch: seg01(p, 0, 0.16),                    // se agacha para saltar
    jump: seg01(p, 0.14, 0.56),                    // arco del salto
    bike: smooth01(seg01(p, 0.3, 0.6)),            // la motocicleta aparece debajo
    rev: seg01(p, 0.66, 1),                        // arranca (las ruedas-reloj giran cada vez más rápido)
  };
}

function startMotoSuper(s) {
  s.motoFx = {};
  s.motoT = MOTO_T;
  s.moving = false;
  s.superFx = null;
}

// Una rueda-reloj: esfera analógica con manecillas que giran a `spin` radianes
function drawClockWheel(ctx, x, y, r, spin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#155C42";
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#F4F1E9";
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#155C42";
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = ABILITIES.tiempo.accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
    ctx.lineTo(Math.cos(a) * r * 0.56, Math.sin(a) * r * 0.56);
    ctx.stroke();
  }
  ctx.save();
  ctx.rotate(spin);
  ctx.strokeStyle = "#1A1917";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.44);
  ctx.moveTo(0, 0); ctx.lineTo(r * 0.3, r * 0.05);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// La motocicleta de relojes: se dibuja debajo del jugador. k = 0..1 (aparición/escala), spin = giro de las ruedas
function drawMotoBody(ctx, x, y, k, spin) {
  if (k <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = k;
  const wr = 7.5 * Math.min(1, k * 1.5);
  const wy = y + 9;
  ctx.strokeStyle = "#2FAE7A";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 14, wy - 1);
  ctx.lineTo(x - 3, wy - 9);
  ctx.lineTo(x + 7, wy - 11);
  ctx.lineTo(x + 13, wy - 1);
  ctx.moveTo(x + 7, wy - 11);
  ctx.lineTo(x + 16, wy - 17);
  ctx.stroke();
  ctx.strokeStyle = "#155C42";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 14, wy - 1);
  ctx.lineTo(x - 3, wy - 9);
  ctx.lineTo(x + 7, wy - 11);
  ctx.lineTo(x + 13, wy - 1);
  ctx.stroke();
  drawClockWheel(ctx, x - 14, wy, wr, spin);
  drawClockWheel(ctx, x + 13, wy, wr, spin * 1.02);
  ctx.restore();
}

function drawHeartShape(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.9);
  ctx.bezierCurveTo(x - size * 1.5, y - size * 0.1, x - size * 0.9, y - size * 1.2, x, y - size * 0.45);
  ctx.bezierCurveTo(x + size * 0.9, y - size * 1.2, x + size * 1.5, y - size * 0.1, x, y + size * 0.9);
  ctx.closePath();
}

// Gran rayo naranja con núcleo blanco, borde eléctrico y dos hebras entrelazadas (la energía vital)
function drawLadronBeam(ctx, x1, y1, x2, y2, W, clock, alpha) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2 || alpha <= 0.01) return;
  const nx = -dy / len, ny = dx / len;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  [[W * 2.5, "rgba(255,90,20,0.18)"], [W * 1.7, "rgba(255,140,30,0.32)"], [W * 1.05, "rgba(255,190,70,0.9)"]].forEach(([w, c]) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
  ctx.strokeStyle = "rgba(255,251,235,0.97)";
  ctx.lineWidth = W * 0.42;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  // borde eléctrico irregular
  const seg = Math.max(5, Math.floor(len / 12));
  const seed = Math.floor(clock * 24);
  ctx.strokeStyle = "rgba(255,232,150,0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const j = i === 0 || i === seg ? 0 : (hsh(i * 3.1 + seed * 7.7) - 0.5) * W * 1.7;
    const qx = x1 + dx * t + nx * j, qy = y1 + dy * t + ny * j;
    if (i === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
  }
  ctx.stroke();
  // dos hebras entrelazadas
  const steps = Math.max(14, Math.floor(len / 5));
  for (let k = 0; k < 2; k++) {
    ctx.strokeStyle = k ? "rgba(255,70,30,0.95)" : "rgba(255,160,50,0.95)";
    ctx.lineWidth = Math.max(1.6, W * 0.26);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const env = Math.min(1, t * 7, (1 - t) * 7);
      const off = Math.sin(t * len * 0.15 - clock * 17 + k * Math.PI) * W * 0.95 * env;
      const qx = x1 + dx * t + nx * off, qy = y1 + dy * t + ny * off;
      if (i === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
    }
    ctx.stroke();
  }
  // cabeza del rayo
  const hg = ctx.createRadialGradient(x2, y2, 0, x2, y2, W * 1.4);
  hg.addColorStop(0, "rgba(255,255,240,0.95)");
  hg.addColorStop(1, "rgba(255,150,40,0)");
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(x2, y2, W * 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawLadronImpact(ctx, x, y, k, sustain, sup, clock) {
  if (sustain <= 0.02 && k <= 0) return;
  const sc = sup ? 1.35 : 1;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const R = (22 + 8 * Math.sin(clock * 30)) * sc;
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, `rgba(255,220,140,${0.75 * sustain})`);
  g.addColorStop(1, "rgba(255,110,20,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.lineCap = "round";
  for (let r = 0; r < 2; r++) {
    const kk = Math.max(0, Math.min(1, k * 1.25 - r * 0.25));
    if (kk <= 0 || kk >= 1) continue;
    ctx.strokeStyle = `rgba(255,${150 + r * 50},50,${0.85 * (1 - kk)})`;
    ctx.lineWidth = 3 - r;
    ctx.beginPath(); ctx.arc(x, y, (10 + 50 * kk) * sc, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const ang = i * 0.5236 + Math.sin(clock * 20 + i) * 0.15;
    const ph = (clock * 3.1 + i * 0.37) % 1;
    const d1 = (12 + ph * 30) * sc, d2 = d1 + (6 + (i % 3) * 3) * sc * (1 - ph);
    ctx.strokeStyle = `rgba(255,${190 + (i % 3) * 20},80,${0.9 * sustain * (1 - ph)})`;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * d1, y + Math.sin(ang) * d1);
    ctx.lineTo(x + Math.cos(ang) * d2, y + Math.sin(ang) * d2);
    ctx.stroke();
  }
  ctx.restore();
}

function faseSpotFree(x, y, walls, spikes) {
  const r = PLAYER_R + 2;
  for (const wl of walls) {
    const cx = Math.max(wl.x, Math.min(x, wl.x + wl.w));
    const cy = Math.max(wl.y, Math.min(y, wl.y + wl.h));
    if (Math.hypot(x - cx, y - cy) < r) return false;
  }
  const pRect = { x: x - PLAYER_R, y: y - PLAYER_R, w: PLAYER_R * 2, h: PLAYER_R * 2 };
  return !spikes.some((sp) => rectsOverlap(pRect, sp));
}

// punto de llegada: ~120px hacia adelante; si cae dentro de una pared o pinchos, busca el sitio libre más cercano
function faseLanding(player, facing, walls, spikes) {
  const clampX = (v) => Math.max(PLAYER_R, Math.min(WORLD_W - PLAYER_R, v));
  const clampY = (v) => Math.max(PLAYER_R, Math.min(WORLD_H - PLAYER_R, v));
  // primero hacia adelante (para quedar del otro lado de una pared), después hacia atrás
  const offsets = [];
  for (let o = 0; o <= 100; o += 8) offsets.push(o);
  for (let o = -8; o >= -80; o -= 8) offsets.push(o);
  for (const o of offsets) {
    const d = FASE_DIST + o;
    const x = clampX(player.x + facing.x * d), y = clampY(player.y + facing.y * d);
    if (Math.hypot(x - player.x, y - player.y) < 30) continue;
    if (faseSpotFree(x, y, walls, spikes)) return { x, y };
  }
  return { x: clampX(player.x + facing.x * FASE_DIST), y: clampY(player.y + facing.y * FASE_DIST) };
}


// ─────────────────────────────────────────────────────────────────────────────
// Brasa (fuego)
//  · Habilidad: el juego se pausa por completo, la cámara se centra en el stickman y este queda envuelto en una
//    gran bola de fuego que brilla tanto que el cuerpo deja de verse. Después el juego sigue con la bola encendida
//    (quema al monstruo que se acerque); el fuego se suaviza, se disipa y el stickman vuelve a la normalidad.
//  · Súper: pausa total, el stickman se pone naranja brillante, apunta con las manos hacia las paredes y de ellas
//    sale fuego que las envuelve por completo. Después todo vuelve a la normalidad (las paredes siguen ardiendo).
const BRASA_T = 1.3;          // pausa total (habilidad normal)
const BRASA_SUPER_T = 2.7;    // pausa total (súper habilidad)
const BRASA_BALL_R = 44;      // radio de la bola de fuego
const BRASA_BURN_R = 68;      // a esta distancia el monstruo se quema
const BRASA_FADE_T = 0.9;     // al final la bola se suaviza y se disipa (el stickman reaparece)
const BRASA_WALL_T = 6;       // segundos que las paredes siguen ardiendo tras la súper
const BRASA_WALL_FADE = 1.2;  // en el último tramo las llamas de las paredes se apagan
let _brasaOff = null;         // canvas auxiliar (alta resolución) para teñir de naranja a cualquier personaje
let _metalOff = null;         // canvas auxiliar (alta resolución) para teñir de gris metálico a cualquier personaje

const clamp01 = (k) => Math.max(0, Math.min(1, k));

// línea de tiempo de la pausa de la habilidad normal (p = 0..1)
function brasaTimeline(p) {
  return {
    dim: smooth01(seg01(p, 0, 0.14)) * (1 - smooth01(seg01(p, 0.9, 1))),     // oscurecido de la escena
    zoom: smooth01(seg01(p, 0, 0.3)) * (1 - smooth01(seg01(p, 0.84, 1))),    // acercamiento y centrado
    grow: easeOutCubic(seg01(p, 0.05, 0.55)),                                 // tamaño de la bola
    ball: smooth01(seg01(p, 0.04, 0.4)),                                      // opacidad de la bola
    body: seg01(p, 0.3, 0.7),                                                 // 0 = stickman visible, 1 = oculto en el fuego
    bloom: smooth01(seg01(p, 0.42, 0.8)),                                     // brillo cegador
    hard: smooth01(seg01(p, 0.3, 0.75)),                                      // la llama pasa de suave a "dura" (brasa)
  };
}

// línea de tiempo de la pausa de la súper (p = 0..1)
function brasaSuperTimeline(p) {
  return {
    dim: smooth01(seg01(p, 0, 0.1)) * (1 - smooth01(seg01(p, 0.9, 1))),
    zoom: smooth01(seg01(p, 0, 0.16)) * (1 - smooth01(seg01(p, 0.88, 1))),
    tint: smooth01(seg01(p, 0.04, 0.3)) * (1 - smooth01(seg01(p, 0.86, 1))),   // naranja brillante
    arm: smooth01(seg01(p, 0.24, 0.42)) * (1 - smooth01(seg01(p, 0.84, 0.94))), // manos hacia las paredes
    palm: smooth01(seg01(p, 0.38, 0.5)) * (1 - smooth01(seg01(p, 0.82, 0.92))), // fuego en las palmas
    jet: easeOutCubic(seg01(p, 0.46, 0.66)),                                    // el chorro avanza hacia la pared
    jetA: seg01(p, 0.46, 0.5) * (1 - smooth01(seg01(p, 0.78, 0.9))),            // visibilidad de los chorros
  };
}

// cada pared se enciende cuando le llega el fuego: k = 0..1
function brasaWallK(p, rank) {
  const st = 0.56 + 0.035 * rank;
  return smooth01(seg01(p, st, st + 0.2));
}

// posición de la mano (punta de los dedos) según la dirección d y cuánto se extendió el brazo k
function brasaHand(s, d, k) {
  if (s.characterKind && s.characterKind !== "stickman") {
    return { x: s.player.x + d.x * 13 * k, y: s.player.y - 2 + d.y * 13 * k };
  }
  return { x: s.player.x + d.x * 20 * k, y: s.player.y - 5 + d.y * 20 * k - 1.5 * k };
}

// Súper: elige a qué pared apunta cada mano (la más cercana de cada lado) y prepara la pausa
function startBrasaSuper(s, walls) {
  const px = s.player.x, py = s.player.y;
  const info = walls.map((w) => {
    const ox = Math.max(w.wl.x, Math.min(px, w.wl.x + w.wl.w));
    const oy = Math.max(w.wl.y, Math.min(py, w.wl.y + w.wl.h));
    return { wl: w.wl, cx: w.cx, cy: w.cy, ox, oy, dist: Math.hypot(ox - px, oy - py) };
  }).sort((a, b) => a.dist - b.dist);
  let a = info.find((w) => w.ox < px);
  let b = info.find((w) => w.ox >= px);
  if (a && !b) b = info.find((w) => w !== a) || a;
  if (b && !a) a = info.find((w) => w !== b) || b;
  const same = !!a && a === b;
  const mkHand = (w, sign, spread) => {
    if (!w) return { d: { x: sign * 0.98, y: -0.2 }, ax: px + sign * 85, ay: py - 12, wall: false };
    let dx = w.ox - px, dy = w.oy - (py - 5);
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl; dy /= dl;
    if (spread) {
      const ca = Math.cos(spread), sa = Math.sin(spread);
      [dx, dy] = [dx * ca - dy * sa, dx * sa + dy * ca];
    }
    return { d: { x: dx, y: dy }, ax: w.ox, ay: w.oy, wall: true };
  };
  const hands = [mkHand(a, -1, same ? -0.22 : 0), mkHand(b, 1, same ? 0.22 : 0)];
  const targets = [a, b].filter((w, i, arr) => w && arr.indexOf(w) === i);
  const ordered = [...targets, ...info.filter((w) => !targets.includes(w))];
  s.brasaFx = { superMode: true, walls: ordered, hands };
  s.brasaT = BRASA_SUPER_T;
  s.moving = false;
  s.superFx = null;
}

// Habilidad normal: pausa total y bola de fuego
function startBrasa(s, dur) {
  s.brasaFx = { superMode: false, dur };
  s.brasaT = BRASA_T;
  s.moving = false;
}

// Una lengua de fuego (capas anidadas roja → naranja → amarilla): base en (x,y), apunta hacia (dx,dy)
function drawFlame(ctx, x, y, dx, dy, h, w, flick, alpha, layers, from, to) {
  if (alpha <= 0.01 || h <= 0.5) return;
  const nx = -dy, ny = dx;
  const cols = ["210,50,10", "255,130,25", "255,226,120"];
  for (let L = from || 0; L < (to === undefined ? layers : to); L++) {
    const ww = w * (1 - L * 0.3), hh = h * (1 - L * 0.22);
    const f = flick * (1 - L * 0.12);
    const tx = x + dx * hh + nx * f, ty = y + dy * hh + ny * f;
    const mx = x + dx * hh * 0.5 + nx * f * 0.4, my = y + dy * hh * 0.5 + ny * f * 0.4;
    ctx.fillStyle = `rgba(${cols[L + (3 - layers)]},${Math.min(1, alpha * (0.85 + L * 0.06))})`;
    ctx.beginPath();
    ctx.moveTo(x - nx * ww, y - ny * ww);
    ctx.quadraticCurveTo(mx - nx * ww * 0.9, my - ny * ww * 0.9, tx, ty);
    ctx.quadraticCurveTo(mx + nx * ww * 0.9, my + ny * ww * 0.9, x + nx * ww, y + ny * ww);
    ctx.closePath();
    ctx.fill();
  }
}

// Gran bola de fuego alrededor de (x,y).
// o = { r: escala del radio, a: opacidad, hard: 0 = suave/ondulada .. 1 = dura (grietas de brasa), bloom: brillo cegador }
function drawBrasaBall(ctx, x, y, clock, o) {
  const a = clamp01(o.a);
  if (a <= 0.01) return;
  const hard = clamp01(o.hard), bloom = clamp01(o.bloom);
  const R = BRASA_BALL_R * o.r;
  const cy = y - 2;
  ctx.save();
  // resplandor grande
  const halo = ctx.createRadialGradient(x, cy, R * 0.5, x, cy, R * 2.7);
  halo.addColorStop(0, `rgba(255,150,40,${0.6 * a})`);
  halo.addColorStop(1, "rgba(255,90,10,0)");
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(x, cy, R * 2.7, 0, Math.PI * 2); ctx.fill();

  // lenguas de fuego alrededor (suaves = más largas y onduladas; duras = más cortas y nítidas)
  const n = 18;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + clock * (0.35 + 0.5 * (1 - hard));
    const wob = Math.sin(clock * (9 - 3.5 * (1 - hard)) + i * 1.9) * 0.5 + 0.5;
    const bx = x + Math.cos(ang) * R * 0.84, by = cy + Math.sin(ang) * R * 0.84;
    let dx = Math.cos(ang), dy = Math.sin(ang) - 0.8;
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl; dy /= dl;
    const h = R * (0.42 + 0.5 * wob) * (0.8 + 0.35 * (1 - hard));
    const flick = Math.sin(clock * 13 + i * 2.3) * (2 + 6 * (1 - hard));
    drawFlame(ctx, bx, by, dx, dy, h, R * 0.25, flick, a, 3);
  }

  // cuerpo de la bola: el borde ondula más cuanto más suave es
  const wv = 0.045 + 0.08 * (1 - hard);
  const body = ctx.createRadialGradient(x, cy - R * 0.1, 1, x, cy, R * 1.08);
  body.addColorStop(0, `rgba(255,248,215,${a})`);
  body.addColorStop(0.35, `rgba(255,205,75,${a})`);
  body.addColorStop(0.72, `rgba(255,112,22,${a * (0.75 + 0.25 * hard)})`);
  body.addColorStop(1, `rgba(215,45,8,${a * (0.3 + 0.65 * hard)})`);
  ctx.fillStyle = body;
  ctx.beginPath();
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    const rr = R * (1 + wv * Math.sin(th * 5 + clock * (7 - 3 * hard)) + 0.03 * Math.sin(th * 3 - clock * 8));
    const px = x + Math.cos(th) * rr, py = cy + Math.sin(th) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // grietas de brasa (solo cuando la llama es "dura")
  if (hard > 0.35) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const ha = (hard - 0.35) / 0.65;
    for (let j = 0; j < 7; j++) {
      const a0 = (j / 7) * Math.PI * 2 + 0.4 + clock * 0.12;
      ctx.beginPath();
      let rr = R * 0.22, ang = a0;
      ctx.moveTo(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
      for (let k = 1; k <= 4; k++) {
        rr += R * 0.2;
        ang = a0 + (hsh(j * 7 + k) - 0.5) * 0.7;
        ctx.lineTo(x + Math.cos(ang) * rr, cy + Math.sin(ang) * rr);
      }
      ctx.strokeStyle = `rgba(150,25,0,${0.55 * ha * a})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,236,150,${0.4 * ha * a})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  // brillo cegador: núcleo blanco-amarillo que tapa por completo al stickman
  if (bloom > 0.01) {
    const bg = ctx.createRadialGradient(x, cy, 0, x, cy, R * 1.22);
    bg.addColorStop(0, `rgba(255,255,242,${Math.min(1, 0.97 * bloom) * a})`);
    bg.addColorStop(0.55, `rgba(255,238,175,${0.72 * bloom * a})`);
    bg.addColorStop(1, "rgba(255,200,90,0)");
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(x, cy, R * 1.22, 0, Math.PI * 2); ctx.fill();
  }

  // chispas que suben
  for (let i = 0; i < 9; i++) {
    const ph = (clock * 1.1 + i * 0.117) % 1;
    const ex = x + Math.sin(i * 2.4 + clock * 2) * R * (0.35 + ph * 0.6);
    const ey = cy - R * 0.3 - ph * R * 1.7;
    ctx.fillStyle = `rgba(255,${200 + Math.floor(ph * 40)},90,${0.9 * (1 - ph) * a})`;
    ctx.beginPath(); ctx.arc(ex, ey, 1.7 * (1 - ph * 0.5), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// estado de la bola de fuego durante el juego (tras la pausa): sólida al principio, luego suave y se disipa
function brasaBallState(s) {
  if (!(s.activeEffectAbility === "fuego" && s.activeEffectT > 0)) return null;
  const D = s.brasaBallDur || 2.2;
  const rem = s.activeEffectT;
  const e = Math.max(0, D - rem);
  const c = smooth01(Math.min(1, rem / BRASA_FADE_T)); // 1 = pleno · 0 = disipado
  return {
    cover: c,
    r: 0.55 + 0.45 * c,
    a: Math.pow(c, 0.7),
    hard: c,
    bloom: c * (0.45 + 0.55 * (1 - smooth01(seg01(e, 0, 0.6)))),
  };
}

// Llamas sobre el monstruo (o un clon) mientras está quemado
function drawBurnFlames(ctx, x, y, clock, k, sc) {
  if (k <= 0.01) return;
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 2, x, y, 30 * sc);
  g.addColorStop(0, `rgba(255,150,40,${0.4 * k})`);
  g.addColorStop(1, "rgba(232,70,15,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, 30 * sc, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 6; i++) {
    const ox = (i - 2.5) * 5.6 * sc;
    const wob = Math.sin(clock * 11 + i * 1.7) * 0.5 + 0.5;
    drawFlame(ctx, x + ox, y + 8 * sc, 0, -1, (12 + 13 * wob) * k * sc, 4.2 * sc, Math.sin(clock * 15 + i * 2) * 2.4, k, 3);
  }
  ctx.restore();
}

// Una pared envuelta en llamas por completo. k = 0..1 (intensidad). origin = punto desde donde se propaga el fuego
// (durante la súper); sin origin la pared está encendida entera.
function drawWallFire(ctx, wl, clock, k, origin) {
  if (k <= 0.01) return;
  const x0 = wl.x, y0 = wl.y, w = wl.w, h = wl.h;
  const reach = origin ? k * (Math.max(w, h) + 40) : 1e9;
  const pulse = 0.85 + 0.15 * Math.sin(clock * 12 + x0 * 0.05);
  ctx.save();
  // resplandor alrededor de la pared
  const gcx = x0 + w / 2, gcy = y0 + h / 2, gr = Math.max(w, h) * 0.55 + 22;
  const glow = ctx.createRadialGradient(gcx, gcy, 4, gcx, gcy, gr);
  glow.addColorStop(0, `rgba(255,150,40,${0.34 * k})`);
  glow.addColorStop(1, "rgba(232,70,15,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(gcx, gcy, gr, 0, Math.PI * 2); ctx.fill();

  // la pared al rojo vivo (con grietas de brasa)
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 3, y0 - 3, w + 6, h + 6); ctx.clip();
  if (origin) {
    const g = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, Math.max(6, reach));
    g.addColorStop(0, `rgba(255,160,40,${0.8 * pulse})`);
    g.addColorStop(0.75, `rgba(255,100,15,${0.62 * pulse})`);
    g.addColorStop(1, "rgba(220,60,10,0)");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = `rgba(255,105,20,${0.62 * k * pulse})`;
  }
  ctx.fillRect(x0 - 3, y0 - 3, w + 6, h + 6);
  ctx.lineCap = "round";
  const long = w >= h;
  const len = long ? w : h;
  const nCr = Math.max(1, Math.floor(len / 26));
  for (let i = 0; i < nCr; i++) {
    const t = (i + 0.5) / nCr;
    const px = long ? x0 + w * t : x0 + w / 2, py = long ? y0 + h / 2 : y0 + h * t;
    if (origin && Math.hypot(px - origin.x, py - origin.y) > reach) continue;
    ctx.strokeStyle = `rgba(255,224,130,${0.6 * k})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const sp = long ? h : w;
    for (let z = 0; z <= 3; z++) {
      const off = (z / 3 - 0.5) * sp * 1.1;
      const jit = (hsh(i * 5 + z + x0 * 0.1) - 0.5) * 7;
      const qx = long ? px + jit : px + off, qy = long ? py + off : py + jit;
      if (z === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // masa de fuego continua sobre toda la pared (une las llamas en una sola envoltura)
  const cols = Math.max(1, Math.round(w / 10)), rows = Math.max(1, Math.round(h / 10));
  const cw = w / cols, ch = h / rows;
  const cells = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx0 = x0 + (i + 0.5) * cw, cy0 = y0 + (j + 0.5) * ch;
      let q = 1;
      if (origin) q = clamp01((reach - Math.hypot(cx0 - origin.x, cy0 - origin.y)) / 22);
      if (q <= 0.02) continue;
      const sd = i * 7.13 + j * 3.71 + x0 * 0.013 + y0 * 0.029;
      const w1 = Math.sin(clock * 7.3 + sd) + Math.sin(clock * 12.1 + sd * 2.3);
      const wob = w1 * 0.25 + 0.5;
      cells.push({ cx: cx0 + (hsh(sd) - 0.5) * cw * 0.9, cy: cy0, q, sd, wob });
    }
  }
  cells.forEach((c) => {
    const rr = (9 + 6 * c.wob) * k * c.q;
    ctx.fillStyle = `rgba(255,105,20,${0.32 * k * c.q})`;
    ctx.beginPath(); ctx.arc(c.cx, c.cy - 3, rr, 0, Math.PI * 2); ctx.fill();
  });
  // llamas por toda la superficie, en dos pasadas (primero las rojas grandes, luego las naranjas y amarillas)
  for (let pass = 0; pass < 2; pass++) {
    cells.forEach((c) => {
      const jt = hsh(c.sd + 3.3);
      const hh = (9 + 22 * c.wob * (0.6 + 0.6 * jt) + 4 * (jt > 0.7 ? 1 : 0)) * k * c.q;
      const flick = Math.sin(clock * 15 + c.sd * 1.7) * 3.2;
      const ww = Math.max(4.8, cw * (0.62 + 0.3 * jt));
      const a2 = Math.min(1, c.q * (0.35 + 0.65 * k));
      if (pass === 0) drawFlame(ctx, c.cx, c.cy + ch * 0.4, 0, -1, hh * 1.12, ww * 1.15, flick, a2, 3, 0, 1);
      else drawFlame(ctx, c.cx, c.cy + ch * 0.4, 0, -1, hh, ww, flick * 0.9, a2, 3, 1, 3);
    });
  }
  // chispas que suben de la pared
  const nEm = Math.max(2, Math.floor(len / 22));
  for (let i = 0; i < nEm; i++) {
    const ph = (clock * 1.2 + i * 0.37 + x0 * 0.01) % 1;
    const t = (i + 0.5) / nEm;
    const ex = (long ? x0 + w * t : x0 + w / 2) + Math.sin(clock * 3 + i * 2) * 6;
    const ey = (long ? y0 : y0 + h * t) - ph * 32;
    if (origin && Math.hypot(ex - origin.x, ey - origin.y) > reach + 20) continue;
    ctx.fillStyle = `rgba(255,${190 + Math.floor(ph * 50)},90,${0.85 * (1 - ph) * k})`;
    ctx.beginPath(); ctx.arc(ex, ey, 1.7 * (1 - ph * 0.5), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Chorro de fuego (lanzallamas) de la mano (x1,y1) hacia la pared (x2,y2). head = 0..1 hasta dónde llegó.
function drawFireJet(ctx, x1, y1, x2, y2, head, clock, size, alpha) {
  if (head <= 0.01 || alpha <= 0.01) return;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const N = 28;
  ctx.save();
  for (let i = N; i >= 0; i--) {   // de la punta hacia la mano: la base queda más brillante, encima
    const t = (i / N) * head;
    const wig = Math.sin(clock * 21 - t * 15 + i) * (1 + 3.6 * t) * size;
    const px = x1 + dx * t + nx * wig, py = y1 + dy * t + ny * wig - t * 4;
    const r = (2.6 + 9.5 * t) * size;
    ctx.fillStyle = `rgba(${t > 0.6 ? "240,80,14" : "255,125,22"},${0.5 * alpha * (1 - 0.3 * t)})`;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,${t > 0.4 ? 190 : 236},${t > 0.4 ? 70 : 150},${0.75 * alpha * (1 - 0.6 * t)})`;
    ctx.beginPath(); ctx.arc(px, py, r * 0.56, 0, Math.PI * 2); ctx.fill();
  }
  // frente de llamas en la punta del chorro
  const hx = x1 + dx * head, hy = y1 + dy * head;
  const ang = Math.atan2(uy, ux);
  for (let i = -1; i <= 1; i++) {
    const a2 = ang + i * 0.5;
    drawFlame(ctx, hx, hy, Math.cos(a2), Math.sin(a2), (9 + 4 * Math.sin(clock * 16 + i)) * size, 3.6 * size, Math.sin(clock * 18 + i * 2) * 2, alpha, 3);
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Descarga / Aturdir (rayo amarillo)
//  · Habilidad: el juego se pausa por completo, la cámara se centra en el stickman y le cae encima una
//    lluvia de rayos amarillos mientras se carga; luego extiende la mano y lanza un gran rayo directo al
//    monstruo que lo paraliza (después el juego sigue con normalidad).
//  · Súper: pausa total; el stickman levanta la mano y luego la baja con fuerza. De ese golpe salen rayos
//    que forman una pared eléctrica circular a su alrededor: bloquea al monstruo y lo paraliza si la toca,
//    y dura lo mismo que dura la súper habilidad.
const ELECTRICO_T = 1.25;        // pausa total (habilidad normal)
const ELECTRICO_SUPER_T = 1.3;   // pausa total (súper habilidad)
const ELECTRICO_WALL_T = 4;      // segundos que dura la pared eléctrica tras la súper
const ELECTRICO_WALL_R = 58;     // radio de la pared eléctrica alrededor del stickman

function electricoTimeline(p) {
  return {
    dim: smooth01(seg01(p, 0, 0.08)) * (1 - smooth01(seg01(p, 0.93, 1))),
    zoom: smooth01(seg01(p, 0, 0.2)) * (1 - smooth01(seg01(p, 0.85, 1))),
    rain: smooth01(seg01(p, 0.02, 0.16)) * (1 - smooth01(seg01(p, 0.56, 0.7))),
    charge: smooth01(seg01(p, 0.1, 0.6)),
    arm: smooth01(seg01(p, 0.58, 0.74)) * (1 - smooth01(seg01(p, 0.9, 0.98))),
    travel: easeOutCubic(seg01(p, 0.68, 0.9)),
    hit: smooth01(seg01(p, 0.86, 1)),
  };
}

function electricoSuperTimeline(p) {
  return {
    dim: smooth01(seg01(p, 0, 0.08)) * (1 - smooth01(seg01(p, 0.93, 1))),
    zoom: smooth01(seg01(p, 0, 0.2)) * (1 - smooth01(seg01(p, 0.85, 1))),
    raise: smooth01(seg01(p, 0.06, 0.38)) * (1 - smooth01(seg01(p, 0.62, 0.76))),
    slam: easeOutCubic(seg01(p, 0.4, 0.56)),
    bolts: smooth01(seg01(p, 0.48, 0.68)),
    wall: smooth01(seg01(p, 0.58, 0.88)),
  };
}

// Habilidad normal: pausa total, luego cae la lluvia de rayos sobre el stickman
function startElectrico(s) {
  s.electricoFx = {
    superMode: false,
    bolts: Array.from({ length: 7 }, (_, i) => ({
      ox: (hsh(i * 31 + 4) - 0.5) * 64,
      seed: hsh(i * 17 + 9) * 100,
      delay: hsh(i * 53 + 11),
    })),
  };
  s.electricoT = ELECTRICO_T;
  s.moving = false;
}

// Súper: levanta la mano, la baja con fuerza y de ahí nacen los rayos que forman la pared eléctrica
function startElectricoSuper(s) {
  s.electricoFx = {
    superMode: true,
    bolts: Array.from({ length: 10 }, (_, i) => ({
      ang: (i / 10) * Math.PI * 2 + hsh(i * 13 + 2) * 0.3,
      seed: hsh(i * 29 + 7) * 100,
      delay: hsh(i * 41 + 3) * 0.4,
    })),
  };
  s.electricoT = ELECTRICO_SUPER_T;
  s.moving = false;
  s.superFx = null;
}

// Luz: el juego se pausa por completo, el personaje se gira hacia el monstruo, se carga con
// un resplandor blanco-dorado y lanza un ultra gigantesco rayo de luz desde las manos que lo
// deja aturdido.
//  · Súper: pausa total; el personaje brilla con una luz blanca intensa hasta casi fundirse en
//    el resplandor y se teletransporta a otro punto.
const LUZ_T = 1.35;         // pausa total (habilidad normal)
const LUZ_SUPER_T = 1.2;    // pausa total (súper habilidad)
const LUZ_STUN = 3.2;       // segundos que el rayo deja aturdido al monstruo

function luzTimeline(p) {
  return {
    dim: smooth01(seg01(p, 0, 0.08)) * (1 - smooth01(seg01(p, 0.93, 1))),
    zoom: smooth01(seg01(p, 0, 0.2)) * (1 - smooth01(seg01(p, 0.85, 1))),
    charge: smooth01(seg01(p, 0.06, 0.48)),
    arm: smooth01(seg01(p, 0.4, 0.58)) * (1 - smooth01(seg01(p, 0.9, 0.98))),
    beam: easeOutCubic(seg01(p, 0.54, 0.76)),
    hit: smooth01(seg01(p, 0.72, 1)),
  };
}

function luzSuperTimeline(p) {
  return {
    dim: smooth01(seg01(p, 0, 0.08)) * (1 - smooth01(seg01(p, 0.93, 1))),
    zoom: smooth01(seg01(p, 0, 0.2)) * (1 - smooth01(seg01(p, 0.85, 1))),
    glow: smooth01(seg01(p, 0.08, 0.58)),
    vanish: smooth01(seg01(p, 0.5, 0.64)),
    reveal: 1 - smooth01(seg01(p, 0.66, 0.92)),
  };
}

// Habilidad normal: pausa total; el personaje se gira hacia el monstruo, se carga con un
// resplandor blanco-dorado y lanza el rayo gigante de luz que lo aturde.
function startLuz(s) {
  s.luzFx = { superMode: false, applied: false };
  s.luzT = LUZ_T;
  s.moving = false;
}

// Súper: el personaje brilla con una luz intensa hasta casi desaparecer y se teletransporta.
function startLuzSuper(s) {
  const wallsNow = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
  const land = faseLanding(s.player, s.facing, wallsNow, s.levelSpikes);
  s.luzFx = { superMode: true, fromX: s.player.x, fromY: s.player.y, toX: land.x, toY: land.y };
  s.luzT = LUZ_SUPER_T;
  s.moving = false;
  s.superFx = null;
}

// Metal: el juego se pausa mientras una capa de metal recubre al stickman; después corre mucho
// más rápido y los ataques que lo toquen rebotan de vuelta hacia quien lo golpeó.
//  · Súper: pausa total; el stickman apunta ambas manos al frente y dispara 30 rayos metálicos
//    de cada mano. Donde cada rayo cae se forma un bulto de metal que bloquea al monstruo, pero
//    que el propio stickman puede atravesar sin problema.
const METAL_T = 1.1;              // pausa total (habilidad normal)
const METAL_SPEED_MULT = 2.2;     // multiplicador de velocidad mientras el blindaje está activo
const METAL_SUPER_T = 1.1;        // pausa total (súper habilidad)
const METAL_RAYS_PER_HAND = 30;   // rayos disparados por cada mano en la súper
const METAL_BLOB_LIFE = 7;        // segundos que dura cada bulto metálico
const METAL_BLOB_R = 11;          // radio de cada bulto metálico

function metalTimeline(p) {
  return {
    rise: smooth01(seg01(p, 0.06, 0.6)) * (1 - smooth01(seg01(p, 0.94, 1))), // la capa de metal sube por el cuerpo
    shine: smooth01(seg01(p, 0.55, 1)),                                      // brillo final del blindaje ya puesto
  };
}

// Habilidad normal: pausa total y capa de metal recubriendo el cuerpo
function startMetal(s, dur) {
  s.metalFx = { dur };
  s.metalT = METAL_T;
  s.moving = false;
}

function metalSuperTimeline(p) {
  return {
    aim: smooth01(seg01(p, 0.05, 0.46)) * (1 - smooth01(seg01(p, 0.92, 1))), // ambas manos se extienden al frente
    fire: seg01(p, 0.42, 0.95),                                              // los rayos salen disparados
  };
}

// Súper: ambas manos apuntan al frente y disparan 30 rayos cada una; cada impacto deja un bulto metálico
function startMetalSuper(s) {
  const fl = Math.hypot(s.facing.x, s.facing.y) || 1;
  const fx0 = s.facing.x / fl, fy0 = s.facing.y / fl;
  const baseAng = Math.atan2(fy0, fx0);
  const handDirs = [
    { x: Math.cos(baseAng - 0.3), y: Math.sin(baseAng - 0.3) },
    { x: Math.cos(baseAng + 0.3), y: Math.sin(baseAng + 0.3) },
  ];
  const rays = [];
  handDirs.forEach((hd, hi) => {
    for (let i = 0; i < METAL_RAYS_PER_HAND; i++) {
      const spread = (hsh(i * 37 + hi * 91 + 5) - 0.5) * 1.05;
      const ang = baseAng + spread;
      const dist = 55 + hsh(i * 53 + hi * 61 + 13) * 205;
      const lx = Math.max(16, Math.min(WORLD_W - 16, s.player.x + Math.cos(ang) * dist));
      const ly = Math.max(16, Math.min(WORLD_H - 16, s.player.y + Math.sin(ang) * dist));
      rays.push({ hand: hi, x: lx, y: ly, delay: hsh(i * 29 + hi * 71 + 7) * 0.55, seed: hsh(i * 43 + hi * 19 + 3) });
    }
  });
  s.metalSuperFx = { hands: handDirs, rays };
  s.metalSuperT = METAL_SUPER_T;
  s.moving = false;
  s.superFx = null;
}

// Rayo en zigzag de (x1,y1) a (x2,y2): resplandor exterior + cuerpo + núcleo blanco brillante
function drawLightningBolt(ctx, x1, y1, x2, y2, seed, alpha, color, width) {
  if (alpha <= 0.01) return;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const segs = Math.max(3, Math.round(len / 16));
  const jag = Math.min(16, len * 0.16);
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const off = i > 0 && i < segs ? (hsh(seed * 91.7 + i * 13.3) - 0.5) * jag : 0;
    pts.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off]);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  [[width * 2.4, alpha * 0.3, color], [width, alpha, color], [Math.max(1, width * 0.4), alpha, "#FFF9DC"]].forEach(([w, a, c]) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  });
  ctx.restore();
}

// Rayo gigante de luz: haz sólido blanco-dorado (sin zigzag), con destello pulsante y cabeza brillante
function drawLightBeam(ctx, x1, y1, x2, y2, clock, alpha, color) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2 || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = "lighter";
  [[110, "rgba(255,255,255,0.08)"], [70, "rgba(255,255,255,0.14)"], [42, "rgba(255,246,205,0.34)"], [20, color]].forEach(([w, c]) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
  const shimmer = 0.7 + 0.3 * Math.sin(clock * 26);
  ctx.strokeStyle = `rgba(255,255,255,${0.6 * shimmer})`;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = Math.min(1, alpha);
  const hg = ctx.createRadialGradient(x2, y2, 0, x2, y2, 46);
  hg.addColorStop(0, "rgba(255,255,255,0.95)");
  hg.addColorStop(0.5, "rgba(255,244,190,0.5)");
  hg.addColorStop(1, "rgba(255,244,190,0)");
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.arc(x2, y2, 46, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Portal azul: par de anillos vistos de canto (el eje corto apunta en la dirección del salto)
function drawFasePortal(ctx, x, y, dx, dy, open, clock, alpha) {
  if (open <= 0.01 || alpha <= 0.01) return;
  const rx = FASE_PORTAL_B * open, ry = FASE_PORTAL_A * open;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(dy, dx));
  // resplandor exterior
  ctx.save();
  ctx.scale(0.6, 1);
  const R = ry * 1.9;
  const halo = ctx.createRadialGradient(0, 0, ry * 0.5, 0, 0, R);
  halo.addColorStop(0, "rgba(80,160,255,0.55)");
  halo.addColorStop(1, "rgba(40,110,255,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // interior del portal
  ctx.save();
  ctx.scale(rx / ry, 1);
  const disc = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
  disc.addColorStop(0, "#04122E");
  disc.addColorStop(0.65, "#0B2A6B");
  disc.addColorStop(1, "#2F7BFF");
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(0, 0, ry, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // remolino
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(170,220,255,0.75)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a0 = clock * 5 + i * 2.09;
    const k = 0.42 + 0.16 * i;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * k, ry * k, 0, a0, a0 + 1.4);
    ctx.stroke();
  }
  // anillo exterior, anillo interior y onda que se expande
  ctx.strokeStyle = "#2F7BFF";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#BFE6FF";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.78, ry * 0.78, 0, 0, Math.PI * 2);
  ctx.stroke();
  const ph = (clock * 1.4) % 1;
  ctx.strokeStyle = `rgba(120,190,255,${0.5 * (1 - ph)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * (1.1 + ph * 0.4), ry * (1.1 + ph * 0.4), 0, 0, Math.PI * 2);
  ctx.stroke();
  // chispas orbitando
  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < 6; i++) {
    const a = clock * 3 + i * 1.047;
    ctx.globalAlpha = Math.min(1, alpha) * (0.5 + 0.5 * Math.sin(clock * 9 + i * 2));
    ctx.beginPath();
    ctx.arc(Math.cos(a) * rx * 1.05, Math.sin(a) * ry * 1.05, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// eje/barra que une los dos portales (crece desde la entrada hacia la salida)
function drawFaseLink(ctx, x1, y1, x2, y2, k, clock, alpha) {
  if (k <= 0.01 || alpha <= 0.01) return;
  const ex = x1 + (x2 - x1) * k, ey = y1 + (y2 - y1) * k;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = `rgba(40,120,255,${0.28 * alpha})`;
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = `rgba(190,230,255,${0.9 * alpha})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.lineDashOffset = -clock * 70;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.restore();
}

// destello al entrar / salir del portal
function drawFaseFlash(ctx, x, y, k) {
  if (k <= 0 || k >= 1) return;
  ctx.save();
  const R = 12 + 34 * k;
  const g = ctx.createRadialGradient(x, y, 1, x, y, R);
  g.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - k)})`);
  g.addColorStop(0.5, `rgba(120,190,255,${0.6 * (1 - k)})`);
  g.addColorStop(1, "rgba(40,110,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

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
    rachaChargeT: 0,
    rachaDur: 0,
    rachaClock: 0,
    rachaReveal: 0,
    rachaTrail: [],
    cd: 0,
    cd2: 0,
    activeEffectT: 0,
    activeEffectAbility: null,
    web: null,
    gas: null,
    projectile: null,
    spark: null,
    luzT: 0,
    luzFx: null,
    faseT: 0,
    faseFx: null,
    faseArm: 0,
    portalFx: null,
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
    ladronT: 0,
    ladronFx: null,
    brasaT: 0,
    brasaFx: null,
    brasaArms: null,
    brasaBallDur: 0,
    monsterBurnT: 0,
    ladronCut: false,
    cutFx: null,
    cutGap: 0,
    cutGlow: 0,
    armDir: null,
    armColor: null,
    metalHitApplied: false,
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
    tiempoT: 0,
    tiempoFx: null,
    motoT: 0,
    motoFx: null,
    electricoT: 0,
    electricoFx: null,
    metalT: 0,
    metalFx: null,
    metalSuperT: 0,
    metalSuperFx: null,
    metalBlobs: [],
    muerteT: 0,
    muerteFx: null,
    monsterCutFx: null,
    electricWall: null,
    burningWalls: [],
    vineWalls: [],
    shockwaveFx: null,
    laserStormT: 0,
    laserStormTick: 0,
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

// Best-effort: go fullscreen and lock the screen to landscape when a run starts.
// Every call here is guarded and silently ignored if the browser/device doesn't
// support it (e.g. iOS Safari has no orientation lock), so it never breaks anything.
function tryEnterLandscapeFullscreen() {
  // El juego ahora se queda en vertical: ya no forzamos pantalla completa
  // ni bloqueo de orientación horizontal.
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
    tryEnterLandscapeFullscreen();
    state.current = freshState(0, playerColor, characterKind);
    setAbility(ab);
    setHud({ lives: 3, cd: 0, status: "playing", level: 0, monsterLives: 5, monsterDefeated: false, energy: 100 });
    audio.ensureCtx();
    audio.startMusic();
  }, [playerColor, characterKind]);

  const nextLevel = useCallback(() => {
    tryEnterLandscapeFullscreen();
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
      s.rachaClock = (s.rachaClock || 0) + dt;
      // Racha: mientras el stickman se transforma en energía, TODO el juego queda congelado
      const rachaFrozen = s.status === "playing" && s.rachaChargeT > 0;
      // Fase: mientras el stickman abre el portal y salta, TODO el juego queda congelado
      const faseFrozen = s.status === "playing" && s.faseT > 0;
      // Ladrón: mientras el stickman se une y lanza el rayo, TODO el juego queda congelado
      const ladronFrozen = s.status === "playing" && s.ladronT > 0;
      // Brasa: mientras el stickman se envuelve en fuego (o incendia las paredes), TODO el juego queda congelado
      const brasaFrozen = s.status === "playing" && s.brasaT > 0;
      // Tiempo: mientras el stickman se voltea, extiende el brazo y lanza la esfera, TODO el juego queda congelado
      const tiempoFrozen = s.status === "playing" && s.tiempoT > 0;
      // Súper Tiempo: mientras el stickman salta y sube a la motocicleta de relojes, TODO el juego queda congelado
      const motoFrozen = s.status === "playing" && s.motoT > 0;
      // Descarga: mientras caen los rayos (o el golpe de mano de la súper), TODO el juego queda congelado
      const electricoFrozen = s.status === "playing" && s.electricoT > 0;
      const luzFrozen = s.status === "playing" && s.luzT > 0;
      // Metal: mientras la capa de metal recubre al stickman, TODO el juego queda congelado
      const metalFrozen = s.status === "playing" && s.metalT > 0;
      // Súper Metal: mientras apunta las manos y dispara los rayos, TODO el juego queda congelado
      const metalSuperFrozen = s.status === "playing" && s.metalSuperT > 0;
      // Muerte: mientras brilla morado, crece la hoz y da el corte (o antes toca la pared en la súper), TODO el juego queda congelado
      const muerteFrozen = s.status === "playing" && s.muerteT > 0;
      if (rachaFrozen) {
        s.rachaChargeT -= dt;
        if (s.rachaChargeT <= 0) {
          s.rachaChargeT = 0;
          s.dashT = s.rachaDur; // termina la transformación: empieza la súper velocidad
        }
      } else if (faseFrozen) {
        s.faseT -= dt;
        if (s.faseT <= 0) {
          // termina el salto: reaparece del otro lado y todo vuelve a la normalidad
          const fz = s.faseFx;
          s.faseT = 0;
          s.faseFx = null;
          if (fz) {
            s.player.x = fz.toX;
            s.player.y = fz.toY;
            s.teleportGrace = 0.3;
            s.portalFx = { ...fz, t: FASE_CLOSE_T };
          }
        }
      } else if (ladronFrozen) {
        s.ladronT -= dt;
        const lf = s.ladronFx;
        if (lf) {
          const elapsed = lf.total - s.ladronT;
          if (!lf.applied && elapsed >= lf.applyAt) {
            // el rayo entrega la vida robada
            lf.applied = true;
            if (lf.superMode) s.lives = Math.max(s.lives, 5);
            else if (!s.monsterDefeated && s.monsterLives > 0) { s.lives += 1; damageMonster(s); }
            setHud({ lives: s.lives, cd: Math.max(0, s.cd), status: s.status, level: s.level, monsterLives: s.monsterLives, monsterDefeated: s.monsterDefeated, energy: s.energy });
          }
        }
        if (s.ladronT <= 0) {
          s.ladronT = 0;
          s.ladronFx = null;
          s.faseArm = 0;
          s.armDir = null;
          s.armColor = null;
        }
      } else if (brasaFrozen) {
        s.brasaT -= dt;
        if (s.brasaT <= 0) {
          // termina la pausa: la bola sigue encendida (habilidad) o las paredes siguen ardiendo (súper)
          const bf = s.brasaFx;
          s.brasaT = 0;
          s.brasaFx = null;
          s.brasaArms = null;
          if (bf) {
            if (bf.superMode) {
              s.burningWalls = bf.walls.map((w) => ({ x: w.cx, y: w.cy, wl: w.wl, t: BRASA_WALL_T }));
            } else {
              s.brasaBallDur = bf.dur;
              s.activeEffectT = bf.dur;
              s.activeEffectAbility = "fuego";
            }
          }
        }
      } else if (tiempoFrozen) {
        s.tiempoT -= dt;
        if (s.tiempoT <= 0) {
          // termina la pausa: la esfera llegó y el monstruo queda congelado
          s.tiempoT = 0;
          const tf = s.tiempoFx;
          s.tiempoFx = null;
          s.faseArm = 0;
          s.armDir = null;
          s.armColor = null;
          if (tf) s.freezeT = tf.dur;
        }
      } else if (motoFrozen) {
        s.motoT -= dt;
        if (s.motoT <= 0) {
          // termina la pausa: arranca la motocicleta con súper velocidad e inmunidad
          s.motoT = 0;
          s.motoFx = null;
          s.timeRushT = 4;
          s.invuln = Math.max(s.invuln, 4);
        }
      } else if (electricoFrozen) {
        s.electricoT -= dt;
        if (s.electricoT <= 0) {
          // termina la pausa: se lanza el rayo (habilidad normal) o se activa la pared eléctrica (súper)
          const ef = s.electricoFx;
          s.electricoT = 0;
          s.electricoFx = null;
          s.faseArm = 0;
          s.armDir = null;
          s.armColor = null;
          if (ef) {
            if (ef.superMode) {
              s.electricWall = { t: ELECTRICO_WALL_T };
            } else {
              const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
              const d0 = Math.hypot(dx0, dy0) || 1;
              s.projectile = { x: s.player.x, y: s.player.y, vx: (dx0 / d0) * 560, vy: (dy0 / d0) * 560, kind: "electrico", t: 0 };
            }
          }
        }
      } else if (luzFrozen) {
        s.luzT -= dt;
        const lf = s.luzFx;
        if (lf && !lf.superMode && !lf.applied) {
          const elapsed = LUZ_T - s.luzT;
          if (elapsed >= LUZ_T * 0.72) {
            lf.applied = true;
            if (!s.monsterDefeated) s.stunT = Math.max(s.stunT, LUZ_STUN);
            s.cloneMonsters.forEach((c) => { c.stunT = Math.max(c.stunT, LUZ_STUN); });
          }
        }
        if (s.luzT <= 0) {
          s.luzT = 0;
          if (lf && lf.superMode) {
            s.player.x = lf.toX;
            s.player.y = lf.toY;
          }
          s.luzFx = null;
          s.faseArm = 0;
          s.armDir = null;
          s.armColor = null;
        }
      } else if (metalFrozen) {
        s.metalT -= dt;
        if (s.metalT <= 0) {
          // termina la pausa: la capa de metal queda puesta y empieza el blindaje (velocidad + reflejo)
          s.metalT = 0;
          const mf = s.metalFx;
          s.metalFx = null;
          if (mf) { s.activeEffectT = mf.dur; s.activeEffectAbility = "metal"; }
        }
      } else if (metalSuperFrozen) {
        s.metalSuperT -= dt;
        if (s.metalSuperT <= 0) {
          // termina la pausa: los rayos ya cayeron y dejan los bultos metálicos en el mapa
          s.metalSuperT = 0;
          const msf = s.metalSuperFx;
          s.metalSuperFx = null;
          if (msf) {
            s.metalBlobs.push(...msf.rays.map((r) => ({ x: r.x, y: r.y, t: METAL_BLOB_LIFE, seed: r.seed })));
          }
        }
      } else if (muerteFrozen) {
        s.muerteT -= dt;
        const mf = s.muerteFx;
        if (mf) {
          const elapsed = mf.total - s.muerteT;
          if (!mf.applied && elapsed >= mf.applyAt) {
            mf.applied = true;
            damageMonster(s);
            damageMonster(s);
            s.monsterCutFx = { x: mf.monsterX, y: mf.monsterY, t: MUERTE_CUT_FX_T };
            setHud({ lives: s.lives, cd: Math.max(0, s.cd), status: s.status, level: s.level, monsterLives: s.monsterLives, monsterDefeated: s.monsterDefeated, energy: s.energy });
          }
        }
        if (s.muerteT <= 0) {
          s.muerteT = 0;
          s.muerteFx = null;
          s.faseArm = 0;
          s.armDir = null;
          s.armColor = null;
        }
      } else {
        s.time += dt;
      }

      if (s.status === "playing" && !rachaFrozen && !faseFrozen && !ladronFrozen && !brasaFrozen && !tiempoFrozen && !motoFrozen && !electricoFrozen && !luzFrozen && !metalFrozen && !metalSuperFrozen && !muerteFrozen) {
        const ab = ABILITIES[ability];
        if (s.cd > 0) s.cd -= dt;
        if (s.invuln > 0) s.invuln -= dt;
        if (s.activeEffectT > 0) s.activeEffectT -= dt;
        if (s.stunT > 0) s.stunT -= dt;
        if (s.danceT > 0) s.danceT -= dt;
        if (s.monsterBurnT > 0) s.monsterBurnT -= dt;
        s.cloneMonsters.forEach((c) => { if (c.burnT > 0) c.burnT -= dt; });
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
            s.rachaChargeT = RACHA_CHARGE_T;
            s.rachaDur = ab.dur;
          }
          if (ability === "muerte") startMuerte(s, false, null);
          if (ability === "fuego") startBrasa(s, ab.dur);
          if (ability === "metal") startMetal(s, ab.dur);
          if (ability === "tiempo") startTiempo(s, ab.dur);
          if (ability === "luz") startLuz(s);
          if (ability === "fase") {
            // el juego se pausa: el stickman extiende la mano, abre un portal hacia el otro lado, salta y reaparece
            const wallsNow = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
            const land = faseLanding(s.player, s.facing, wallsNow, s.levelSpikes);
            const travel = Math.hypot(land.x - s.player.x, land.y - s.player.y);
            const fl = Math.hypot(s.facing.x, s.facing.y) || 1;
            const ux = s.facing.x / fl, uy = s.facing.y / fl;
            const ed = Math.min(34, travel * 0.45); // el portal de entrada se abre justo delante de la mano
            s.faseFx = {
              dx: ux, dy: uy,
              fromX: s.player.x, fromY: s.player.y,
              ex: s.player.x + ux * ed, ey: s.player.y - 3 + uy * ed, // centro del portal de entrada
              toX: land.x, toY: land.y,
              xx: land.x, xy: land.y - 3,                              // centro del portal de salida
            };
            s.faseT = FASE_T;
            s.moving = false;
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
          if (ability === "ladron") startLadron(s, false);
          if (ability === "electrico") startElectrico(s);
          if (ability === "mutar" || ability === "roquero") {
            const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
            const d0 = Math.hypot(dx0, dy0) || 1;
            const speed = ability === "roquero" ? 420 : 320;
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
            s.rachaChargeT = RACHA_CHARGE_T;
            s.rachaDur = ab2.dur;
          } else if (secondaryAbility === "fuego") {
            startBrasa(s, ab2.dur);
          } else if (secondaryAbility === "mutar") {
            const dx0 = s.monster.x - s.player.x, dy0 = s.monster.y - s.player.y;
            const d0 = Math.hypot(dx0, dy0) || 1;
            s.projectile = { x: s.player.x, y: s.player.y, vx: (dx0 / d0) * 320, vy: (dy0 / d0) * 320, kind: "mutar", t: 0 };
          } else if (secondaryAbility === "tiempo") {
            startTiempo(s, ab2.dur);
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
        if (s.dashT > 0) {
          s.dashT -= dt;
          if (s.dashT <= 0) { s.dashT = 0; s.rachaReveal = RACHA_REVEAL_T; }
        }
        if (s.rachaReveal > 0) s.rachaReveal -= dt;
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
        if (s.portalFx) {
          s.portalFx.t -= dt;
          if (s.portalFx.t <= 0) s.portalFx = null;
        }
        const activeWalls = s.levelWalls.filter((_, i) => !s.destroyedWalls.has(i));
        const metalActive = s.activeEffectAbility === "metal" && s.activeEffectT > 0;

        // super ability: fires once the button has been held long enough, costs the whole energy bar
        const fireSuper = (targetId) => {
          const targetAb = ABILITIES[targetId];
          s.superFx = { x: s.player.x, y: s.player.y, t: 0.6, color: targetAb.accent };
          const nearWalls = (radius, byDist) => {
            const list = activeWalls
              .map((wl, i) => ({ wl, i, cx: wl.x + wl.w / 2, cy: wl.y + wl.h / 2 }))
              .filter((w) => w.i > 2 && Math.hypot(w.cx - s.player.x, w.cy - s.player.y) < radius);
            if (byDist) list.sort((a, b) => Math.hypot(a.cx - s.player.x, a.cy - s.player.y) - Math.hypot(b.cx - s.player.x, b.cy - s.player.y));
            return list.slice(0, 6);
          };

          if (targetId === "viento") {
            s.slowAura = { x: s.player.x, y: s.player.y, r: 100, t: 5 };
          } else if (targetId === "muerte") {
            const near = nearWalls(220, true)[0] || null;
            startMuerte(s, true, near);
          } else if (targetId === "tiempo") {
            startMotoSuper(s);
          } else if (targetId === "luz") {
            startLuzSuper(s);
          } else if (targetId === "fase") {
            if (!s.monsterDefeated) {
              s.monster.x = s.monsterStartPos.x;
              s.monster.y = s.monsterStartPos.y;
              s.path = [];
              s.pathIdx = 1;
              s.repathT = 0;
            }
          } else if (targetId === "electrico") {
            startElectricoSuper(s);
          } else if (targetId === "fuego") {
            // súper Brasa: pausa total; las manos apuntan a las paredes cercanas y las envuelven en fuego
            startBrasaSuper(s, nearWalls(220, true));
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
          } else if (targetId === "metal") {
            startMetalSuper(s);
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
            startLadron(s, true);
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
            // pared eléctrica circular alrededor del stickman: bloquea al monstruo (lo empuja hacia afuera)
            // y lo paraliza si la toca
            const R = ELECTRICO_WALL_R;
            const pushOut = (tx, ty) => {
              const dx = tx - s.player.x, dy = ty - s.player.y;
              const d = Math.hypot(dx, dy) || 1;
              if (d >= R) return null;
              return {
                x: Math.max(MONSTER_R, Math.min(WORLD_W - MONSTER_R, s.player.x + (dx / d) * R)),
                y: Math.max(MONSTER_R, Math.min(WORLD_H - MONSTER_R, s.player.y + (dy / d) * R)),
              };
            };
            if (!s.monsterDefeated) {
              const hit = pushOut(s.monster.x, s.monster.y);
              if (hit) {
                s.monster.x = hit.x; s.monster.y = hit.y;
                if (s.stunT <= 0) damageMonster(s);
                s.stunT = Math.max(s.stunT, 2.4);
              }
            }
            s.cloneMonsters.forEach((c) => {
              const hit = pushOut(c.x, c.y);
              if (hit) {
                c.x = hit.x; c.y = hit.y;
                c.stunT = Math.max(c.stunT, 2.4);
              }
            });
          }
        }
        if (s.burningWalls.length > 0) {
          s.burningWalls = s.burningWalls.filter((bw) => {
            bw.t -= dt;
            if (bw.t <= 0) return false;
            // la pared arde entera: quema al monstruo que toque cualquier parte de ella
            const wallDist = (mx, my) => bw.wl
              ? Math.hypot(mx - Math.max(bw.wl.x, Math.min(mx, bw.wl.x + bw.wl.w)), my - Math.max(bw.wl.y, Math.min(my, bw.wl.y + bw.wl.h)))
              : Math.hypot(bw.x - mx, bw.y - my) - 20;
            if (!s.monsterDefeated && wallDist(s.monster.x, s.monster.y) < MONSTER_R + 10) {
              if (s.stunT <= 0) damageMonster(s);
              s.stunT = Math.max(s.stunT, 2.2);
              s.monsterBurnT = Math.max(s.monsterBurnT, 1.0);
            }
            s.cloneMonsters.forEach((c) => {
              if (wallDist(c.x, c.y) < MONSTER_R * 0.86 + 10) { c.stunT = Math.max(c.stunT, 2.2); c.burnT = 1.0; }
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
        if (s.metalBlobs.length > 0) {
          s.metalBlobs = s.metalBlobs.filter((mb) => {
            mb.t -= dt;
            return mb.t > 0;
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

        // el blindaje de metal aparta a los animales cercanos
        if (metalActive && s.levelAnimals.length > 0) {
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
        if (s.cutFx) {
          s.cutFx.t -= dt;
          if (s.cutFx.t <= 0) s.cutFx = null;
        }
        if (s.defeatFx) {
          s.defeatFx.t -= dt;
          if (s.defeatFx.t <= 0) s.defeatFx = null;
        }
        if (s.monsterCutFx) {
          s.monsterCutFx.t -= dt;
          if (s.monsterCutFx.t <= 0) s.monsterCutFx = null;
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
            if (metalActive) {
              // el blindaje de metal refleja el ataque de vuelta hacia el monstruo
              if (!fb.reflected) {
                fb.reflected = true;
                fb.vx = -fb.vx;
                fb.vy = -fb.vy;
                fb.t = 0;
              }
            } else {
              if (s.invuln <= 0) {
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
            }
          } else if (fb.reflected && !s.monsterDefeated && Math.hypot(fb.x - s.monster.x, fb.y - s.monster.y) < MONSTER_R + 8) {
            // el rayo reflejado alcanza al monstruo
            if (s.stunT <= 0) damageMonster(s);
            s.stunT = Math.max(s.stunT, 2.2);
            s.fireballBurst = { x: fb.x, y: fb.y, t: 0.4 };
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
              if (s.invuln <= 0 && !metalActive) {
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
            const seesPlayerNow = true;
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
              s.metalBlobs.forEach((mb) => circleRectPush(c, MONSTER_R * 0.86, { x: mb.x - METAL_BLOB_R, y: mb.y - METAL_BLOB_R, w: METAL_BLOB_R * 2, h: METAL_BLOB_R * 2 }));

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
                  if (s.invuln <= 0 && !metalActive) {
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

        // el blindaje de metal aturde a lo que lo toque (refleja el ataque)
        if (metalActive && !s.metalHitApplied) {
          const dPS = Math.hypot(s.monster.x - s.player.x, s.monster.y - s.player.y);
          if (!s.monsterDefeated && dPS < 40) {
            if (s.stunT <= 0) damageMonster(s);
            s.stunT = Math.max(s.stunT, 3);
            s.metalHitApplied = true;
          }
          s.cloneMonsters.forEach((c) => {
            const dCS = Math.hypot(c.x - s.player.x, c.y - s.player.y);
            if (dCS < 40) {
              c.stunT = Math.max(c.stunT, 3);
              s.metalHitApplied = true;
            }
          });
        }
        if (!metalActive) s.metalHitApplied = false;

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
          const speed = 126 * (s.dashT > 0 ? 2.1 : 1) * (s.tornadoT > 0 ? 2.8 : 1) * (s.timeRushT > 0 ? 2.4 : 1) * (metalActive ? METAL_SPEED_MULT : 1) * (slowed ? PUDDLE_SLOW : 1);
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

        // estela de energía de Racha
        if (s.rachaTrail) {
          s.rachaTrail.forEach((pt) => (pt.age += dt));
          if (s.dashT > 0) s.rachaTrail.push({ x: s.player.x, y: s.player.y - 2, age: 0 });
          while (s.rachaTrail.length && s.rachaTrail[0].age > RACHA_TRAIL_LIFE) s.rachaTrail.shift();
        }

        // spikes hazard
        if (s.invuln <= 0 && !metalActive) {
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
          const seesPlayer = true;
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
          s.metalBlobs.forEach((mb) => circleRectPush(s.monster, MONSTER_R, { x: mb.x - METAL_BLOB_R, y: mb.y - METAL_BLOB_R, w: METAL_BLOB_R * 2, h: METAL_BLOB_R * 2 }));
        }

        // bola de fuego: el monstruo que se acerca queda quemado (el radio se encoge cuando el fuego se disipa)
        if (s.activeEffectAbility === "fuego" && s.activeEffectT > 0) {
          const ballK = smooth01(Math.min(1, s.activeEffectT / BRASA_FADE_T));
          const burnR = BRASA_BURN_R * (0.55 + 0.45 * ballK);
          if (!s.monsterDefeated && Math.hypot(s.monster.x - s.player.x, s.monster.y - s.player.y) < burnR) {
            if (s.stunT <= 0) damageMonster(s);
            s.stunT = Math.max(s.stunT, 0.4);
            s.monsterBurnT = Math.max(s.monsterBurnT, 1.0);
          }
          s.cloneMonsters.forEach((c) => {
            if (Math.hypot(c.x - s.player.x, c.y - s.player.y) < burnR * 0.92) { c.stunT = Math.max(c.stunT, 0.4); c.burnT = 1.0; }
          });
        }

        // collisions
        const threats = [
          ...(s.monsterDefeated ? [] : [{ x: s.monster.x, y: s.monster.y, r: MONSTER_R }]),
          ...s.cloneMonsters.filter((c) => c.stunT <= 0).map((c) => ({ x: c.x, y: c.y, r: MONSTER_R * 0.86 })),
        ];
        const caughtBy = threats.find((t) => Math.hypot(t.x - s.player.x, t.y - s.player.y) < PLAYER_R + t.r - 4);
        const stealthSafe = false;
        if (caughtBy && s.invuln <= 0 && !stealthSafe && !metalActive) {
          if (ability === "ladron") {
            // el monstruo lo toca: queda cortado por la mitad hasta que use el robo
            s.ladronCut = true;
            s.cutFx = { x: s.player.x, y: s.player.y, t: LADRON_CUT_FX_T, fx: s.facing.x, fy: s.facing.y, moving: !!s.moving };
          }
          s.lives -= 1;
          s.invuln = 1.6;
          s.player = { ...s.startPos };
          s.monster = { ...s.monsterStartPos };
          s.cloneMonsters = [];
          if (s.lives <= 0) s.status = "lost";
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
    // Ladrón: mientras esté cortado se dibuja partido en dos (salvo al ganar)
    s.cutGap = s.ladronCut && s.status !== "won" ? LADRON_GAP : 0;
    s.cutGlow = s.cutGap > 0 ? 0.4 : 0;
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

    const camFor = (wx) => Math.max(0, Math.min(wx - VIEW_W / 2, WORLD_W - VIEW_W));
    let camX = camFor(s.player.x);
    // Fase: la cámara se desliza hacia el lugar de llegada para que al reanudar no haya salto
    const faseOn = s.faseT > 0 && !!s.faseFx;
    const faseP = faseOn ? 1 - s.faseT / FASE_T : 0;
    if (faseOn) camX += (camFor(s.faseFx.toX) - camX) * smooth01(seg01(faseP, 0.4, 0.85));
    // Ladrón: durante el rayo la cámara acompaña a la energía hacia el monstruo y vuelve al stickman
    const ladOn = s.ladronT > 0 && !!s.ladronFx;
    const ladInfo = ladOn ? ladronPhase(s.ladronFx, s.ladronT) : null;
    const ladRay = ladOn && ladInfo.phase === "ray";
    if (ladRay) {
      const ltl = ladronTimeline(ladInfo.p);
      const ldist = Math.abs(s.monster.x - s.player.x);
      const panMax = ldist < VIEW_W * 0.55 ? 0.5 : 1;
      camX = camFor(s.player.x + (s.monster.x - s.player.x) * ltl.pan * panMax);
    }

    // Muerte: durante el corte la cámara acompaña el salto hacia el monstruo; en la pared de la súper, se centra entre ambos
    const muerteOn = s.muerteT > 0 && !!s.muerteFx;
    const muertePh = muerteOn ? muertePhase(s.muerteFx, s.muerteT) : null;
    if (muerteOn && muertePh.phase === "strike") {
      const mtl = muerteStrikeTimeline(muertePh.p);
      const mdist = Math.abs(s.monster.x - s.player.x);
      const mPanMax = mdist < VIEW_W * 0.55 ? 0.5 : 1;
      camX = camFor(s.player.x + (s.monster.x - s.player.x) * mtl.pan * mPanMax);
    } else if (muerteOn && muertePh.phase === "wall" && s.muerteFx.wall) {
      camX = camFor((s.player.x + s.muerteFx.wall.touchX) / 2);
    }

    // Brasa: pausa total, la cámara se centra en el stickman
    const brasaOn = s.brasaT > 0 && !!s.brasaFx;
    const brasaP = brasaOn ? 1 - s.brasaT / (s.brasaFx.superMode ? BRASA_SUPER_T : BRASA_T) : 0;

    ctx.save();
    // Fase: acercamiento suave a los dos portales durante la pausa
    if (faseOn) {
      const fzk = smooth01(seg01(faseP, 0, 0.2)) * (1 - smooth01(seg01(faseP, 0.85, 1)));
      const fz = s.faseFx;
      const pvx = (fz.ex + fz.xx) / 2 - camX, pvy = (fz.ey + fz.xy) / 2;
      let zz = 1 + 0.3 * fzk;
      // que el acercamiento nunca deje al stickman ni a los portales fuera de la pantalla (cerca del borde del mapa)
      const zTop = Math.min(fz.ey, fz.xy, fz.fromY - 3) - 30, zBot = Math.max(fz.ey, fz.xy, fz.fromY - 3) + 30;
      if (zTop < pvy) zz = Math.min(zz, Math.max(1, (pvy - 4) / (pvy - zTop)));
      if (zBot > pvy) zz = Math.min(zz, Math.max(1, (VIEW_H - 4 - pvy) / (zBot - pvy)));
      ctx.translate(pvx, pvy);
      ctx.scale(zz, zz);
      ctx.translate(-pvx, -pvy);
    }
    // Racha: pequeño acercamiento al stickman durante la pausa
    if (s.rachaChargeT > 0) {
      const pz = 1 - s.rachaChargeT / RACHA_CHARGE_T;
      const kz = pz < 0.6 ? pz / 0.6 : 1 - (pz - 0.6) / 0.4;
      const rz = 1 + 0.28 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(rz, rz);
      ctx.translate(-pvx, -pvy);
    }
    // Tiempo: pequeño acercamiento al stickman mientras se voltea y dispara la esfera
    if (s.tiempoT > 0) {
      const pz = 1 - s.tiempoT / TIEMPO_T;
      const kz = pz < 0.5 ? pz / 0.5 : 1 - (pz - 0.5) / 0.5;
      const tz = 1 + 0.22 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(tz, tz);
      ctx.translate(-pvx, -pvy);
    }
    // Súper Tiempo: acercamiento al stickman mientras salta y sube a la motocicleta
    if (s.motoT > 0) {
      const pz = 1 - s.motoT / MOTO_T;
      const kz = pz < 0.55 ? pz / 0.55 : 1 - (pz - 0.55) / 0.45;
      const mz = 1 + 0.25 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(mz, mz);
      ctx.translate(-pvx, -pvy);
    }
    // Descarga: pequeño acercamiento al stickman durante la lluvia de rayos o el golpe de mano de la súper
    if (s.electricoT > 0) {
      const eT = s.electricoFx && s.electricoFx.superMode ? ELECTRICO_SUPER_T : ELECTRICO_T;
      const pz = 1 - s.electricoT / eT;
      const kz = pz < 0.5 ? pz / 0.5 : 1 - (pz - 0.5) / 0.5;
      const ez = 1 + 0.24 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(ez, ez);
      ctx.translate(-pvx, -pvy);
    }
    // Luz: pequeño acercamiento al stickman mientras se carga y lanza el rayo, o brilla y se teletransporta
    if (s.luzT > 0) {
      const eT = s.luzFx && s.luzFx.superMode ? LUZ_SUPER_T : LUZ_T;
      const pz = 1 - s.luzT / eT;
      const kz = pz < 0.5 ? pz / 0.5 : 1 - (pz - 0.5) / 0.5;
      const lz = 1 + 0.24 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(lz, lz);
      ctx.translate(-pvx, -pvy);
    }
    // Metal: pequeño acercamiento al stickman mientras la capa de metal lo recubre
    if (s.metalT > 0) {
      const pz = 1 - s.metalT / METAL_T;
      const kz = pz < 0.5 ? pz / 0.5 : 1 - (pz - 0.5) / 0.5;
      const mz = 1 + 0.22 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(mz, mz);
      ctx.translate(-pvx, -pvy);
    }
    // Súper Metal: acercamiento al stickman mientras apunta las manos y dispara los rayos
    if (s.metalSuperT > 0) {
      const pz = 1 - s.metalSuperT / METAL_SUPER_T;
      const kz = pz < 0.5 ? pz / 0.5 : 1 - (pz - 0.5) / 0.5;
      const mz = 1 + 0.24 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(mz, mz);
      ctx.translate(-pvx, -pvy);
    }
    // Muerte: pequeño acercamiento al stickman durante toda la pausa (pared, brillo y corte)
    if (muerteOn) {
      const mTotal = s.muerteFx.total || 1;
      const mp = 1 - s.muerteT / mTotal;
      const kz = mp < 0.5 ? mp / 0.5 : 1 - (mp - 0.5) / 0.5;
      const mz = 1 + 0.28 * (kz * kz * (3 - 2 * kz));
      const pvx = s.player.x - camX, pvy = s.player.y;
      ctx.translate(pvx, pvy);
      ctx.scale(mz, mz);
      ctx.translate(-pvx, -pvy);
    }
    // Ladrón: acercamiento al stickman (unión) y al cargar el rayo
    if (ladOn) {
      let lz = 1;
      if (ladInfo.phase === "join") {
        lz = 1 + 0.42 * smooth01(seg01(ladInfo.p, 0, 0.22)) * (1 - 0.4 * smooth01(seg01(ladInfo.p, 0.8, 1)));
      } else {
        const lead = s.ladronFx.wasCut ? 1 : smooth01(seg01(ladInfo.p, 0, 0.12));
        lz = 1 + 0.25 * lead * (1 - smooth01(seg01(ladInfo.p, 0.26, 0.5)));
      }
      const lvx = s.player.x - camX, lvy = s.player.y;
      ctx.translate(lvx, lvy);
      ctx.scale(lz, lz);
      ctx.translate(-lvx, -lvy);
    }
    // Brasa: la cámara se acerca y CENTRA al stickman (sin dejar nunca al descubierto lo que hay fuera del mapa)
    if (brasaOn) {
      const bt = s.brasaFx.superMode ? brasaSuperTimeline(brasaP) : brasaTimeline(brasaP);
      const zz = 1 + (s.brasaFx.superMode ? 0.45 : 0.5) * bt.zoom;
      const Px = s.player.x - camX, Py = s.player.y;
      const cxT = Math.max(VIEW_W - zz * (VIEW_W - Px), Math.min(zz * Px, Px + (VIEW_W / 2 - Px) * bt.zoom));
      const cyT = Math.max(VIEW_H - zz * (VIEW_H - Py), Math.min(zz * Py, Py + (VIEW_H / 2 - Py) * bt.zoom));
      ctx.translate(cxT, cyT);
      ctx.scale(zz, zz);
      ctx.translate(-Px, -Py);
    }
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
      // pared eléctrica circular (súper Descarga): rodea al stickman y se desvanece en el último tramo
      const clock = s.rachaClock || 0;
      const k = Math.min(1, s.electricWall.t / 0.4);
      const R = ELECTRICO_WALL_R;
      const n = 14;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 + clock * 0.6;
        const a1 = ((i + 1) / n) * Math.PI * 2 + clock * 0.6;
        const x1 = s.player.x + Math.cos(a0) * R, y1 = s.player.y + Math.sin(a0) * R;
        const x2 = s.player.x + Math.cos(a1) * R, y2 = s.player.y + Math.sin(a1) * R;
        drawLightningBolt(ctx, x1, y1, x2, y2, i * 7 + Math.floor(clock * 6), (0.55 + 0.45 * Math.sin(clock * 22 + i)) * k, ABILITIES.electrico.accent, 2.4);
      }
    }

    // paredes en llamas (súper Brasa): envueltas por completo; al final las llamas se apagan
    s.burningWalls.forEach((bw) => {
      const wl = bw.wl || { x: bw.x - 12, y: bw.y - 12, w: 24, h: 24 };
      if (wl.x + wl.w < camX - 40 || wl.x > camX + VIEW_W + 40) return;
      drawWallFire(ctx, wl, s.rachaClock || 0, Math.min(1, bw.t / BRASA_WALL_FADE), null);
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

    s.metalBlobs.forEach((mb) => {
      const fadeK = mb.t < 1 ? mb.t : 1;
      ctx.save();
      ctx.globalAlpha = fadeK;
      ctx.translate(mb.x, mb.y);
      ctx.rotate(mb.seed * 6.28);
      ctx.fillStyle = "#8A93A0";
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a3 = (i / 7) * Math.PI * 2;
        const rr = METAL_BLOB_R * (0.75 + 0.35 * hsh(mb.seed * 97 + i * 13));
        const px2 = Math.cos(a3) * rr, py2 = Math.sin(a3) * rr;
        if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4A4E52";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath(); ctx.ellipse(-METAL_BLOB_R * 0.25, -METAL_BLOB_R * 0.3, METAL_BLOB_R * 0.3, METAL_BLOB_R * 0.16, -0.4, 0, Math.PI * 2); ctx.fill();
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
    // (la bola de fuego de Brasa se dibuja junto con el jugador: ver drawPlayer)

    // portales de Fase cerrándose (el juego ya corrió de nuevo; el stickman queda delante)
    if (s.portalFx) {
      const pf = s.portalFx;
      const kc = Math.max(0, pf.t / FASE_CLOSE_T);
      const oc = kc * kc;
      drawFaseLink(ctx, pf.ex, pf.ey, pf.xx, pf.xy, 1, s.rachaClock || 0, kc);
      drawFasePortal(ctx, pf.xx, pf.xy, pf.dx, pf.dy, oc, s.rachaClock || 0, kc);
      drawFasePortal(ctx, pf.ex, pf.ey, pf.dx, pf.dy, oc, s.rachaClock || 0, kc);
    }

    // Súper Tiempo: mientras dura la súper velocidad, la motocicleta de relojes va debajo del jugador
    if (s.timeRushT > 0) drawMotoBody(ctx, s.player.x, s.player.y, 1, (s.rachaClock || 0) * 46);

    // player (durante la carga de Racha y la pausa de Fase/Ladrón/Brasa/Tiempo/Moto se dibuja al final, encima del oscurecido)
    if (!(s.rachaChargeT > 0) && !(s.faseT > 0) && !(s.ladronT > 0) && !(s.brasaT > 0) && !(s.tiempoT > 0) && !(s.motoT > 0) && !(s.muerteT > 0)) drawPlayerMaybeMetal(ctx, s, abilityId);
    // Ladrón: el tajo donde el monstruo lo tocó (las dos mitades se separan y caen)
    if (s.cutFx) drawCutGhost(ctx, s, abilityId);

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

    // capa de metal activa: brillo que recorre el contorno del cuerpo (ya gris y más grande)
    if (s.activeEffectAbility === "metal" && s.activeEffectT > 0) {
      const px = s.player.x, py = s.player.y;
      ctx.save();
      const sweep = (s.time * 2.2) % 1;
      ctx.strokeStyle = `rgba(240,245,250,${0.5 + 0.4 * Math.sin(s.time * 10)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(px, py - 4, 15, sweep * Math.PI * 2, sweep * Math.PI * 2 + 1.2);
      ctx.stroke();
      ctx.restore();
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

    if (!s.monsterDefeated && !ladRay) {
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
      // quemado por la bola de fuego o por las paredes en llamas
      if (s.monsterBurnT > 0) drawBurnFlames(ctx, s.monster.x, s.monster.y, s.rachaClock || 0, Math.min(1, s.monsterBurnT / 0.5), 1);
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
      if (c.burnT > 0) drawBurnFlames(ctx, c.x, c.y, s.rachaClock || 0, Math.min(1, c.burnT / 0.5), 0.86);
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

    // Muerte: tajo morado brillante donde la hoz cortó al monstruo
    if (s.monsterCutFx) {
      const fx = s.monsterCutFx;
      const u = 1 - fx.t / MUERTE_CUT_FX_T;
      ctx.save();
      ctx.globalAlpha = Math.min(1, fx.t / MUERTE_CUT_FX_T);
      ctx.strokeStyle = "#C77DFF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(180,80,255,0.9)";
      ctx.shadowBlur = 10;
      const a = MUERTE_CUT_A;
      const len = MONSTER_R * 1.7 + u * 14;
      ctx.beginPath();
      ctx.moveTo(fx.x - Math.cos(a) * len, fx.y - Math.sin(a) * len);
      ctx.lineTo(fx.x + Math.cos(a) * len, fx.y + Math.sin(a) * len);
      ctx.stroke();
      ctx.restore();
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

    // Racha: escena oscurecida y luz solo sobre el stickman mientras el juego está en pausa
    if (s.rachaChargeT > 0) {
      const pd = 1 - s.rachaChargeT / RACHA_CHARGE_T;
      const dimK = pd < 0.12 ? pd / 0.12 : pd > 0.85 ? Math.max(0, (1 - pd) / 0.15) : 1;
      const px = s.player.x, py = s.player.y;
      const vg = ctx.createRadialGradient(px, py, 30, px, py, 260);
      vg.addColorStop(0, `rgba(4,12,36,${0.25 * dimK})`);
      vg.addColorStop(1, `rgba(4,12,36,${0.78 * dimK})`);
      ctx.fillStyle = vg;
      ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);
      drawPlayer(ctx, s, abilityId);
    }

    // Fase: escena oscurecida, mano extendida, portal, salto y reaparición
    if (faseOn) drawFaseScene(ctx, s, abilityId, camX, faseP);

    // Ladrón: unión de las dos mitades y rayo al monstruo (juego en pausa)
    if (ladOn) drawLadronScene(ctx, s, abilityId, camX, ladInfo);

    // Brasa: escena oscurecida, bola de fuego (habilidad) o manos que incendian las paredes (súper)
    if (brasaOn) drawBrasaScene(ctx, s, abilityId, camX, brasaP);

    // Tiempo: escena oscurecida, giro, brazo extendido y esfera verde hacia el monstruo
    if (s.tiempoT > 0 && s.tiempoFx) drawTiempoScene(ctx, s, abilityId, camX, 1 - s.tiempoT / TIEMPO_T, s.tiempoFx);

    // Súper Tiempo: escena oscurecida, salto y motocicleta de relojes apareciendo debajo
    if (s.motoT > 0) drawMotoScene(ctx, s, abilityId, camX, 1 - s.motoT / MOTO_T);
    if (s.electricoT > 0 && s.electricoFx) {
      const eT = s.electricoFx.superMode ? ELECTRICO_SUPER_T : ELECTRICO_T;
      drawElectricoScene(ctx, s, abilityId, camX, 1 - s.electricoT / eT);
    }

    // Luz: escena oscurecida — rayo gigante de luz al monstruo (habilidad) o brillo y teletransporte (súper)
    if (s.luzT > 0 && s.luzFx) {
      const eT = s.luzFx.superMode ? LUZ_SUPER_T : LUZ_T;
      drawLuzScene(ctx, s, abilityId, camX, 1 - s.luzT / eT);
    }

    // Metal: escena oscurecida, capa de metal recubriendo el cuerpo
    if (s.metalT > 0 && s.metalFx) drawMetalScene(ctx, s, abilityId, camX, 1 - s.metalT / METAL_T);

    // Súper Metal: escena oscurecida, manos apuntando al frente y rayos formando bultos metálicos
    if (s.metalSuperT > 0 && s.metalSuperFx) drawMetalSuperScene(ctx, s, abilityId, camX, 1 - s.metalSuperT / METAL_SUPER_T);
    // Muerte: escena oscurecida — pared (súper) o brillo morado + hoz + corte al monstruo
    if (muerteOn) drawMuerteScene(ctx, s, abilityId, camX, muertePh);

    ctx.restore();
  }

  // Dibuja el cuerpo (cualquier personaje) con una transformación: ancla (ox,oy) -> (px,py), escala sc*(sx,sy)
  function drawBodyXf(ctx, s, abilityId, ox, oy, px, py, sc, sx, sy) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(sc * sx, sc * sy);
    ctx.translate(-ox, -oy);
    drawPlayerBody(ctx, s, abilityId);
    ctx.restore();
  }

  function drawFaseScene(ctx, s, abilityId, camX, p) {
    const fz = s.faseFx;
    if (!fz) return;
    const tl = faseTimeline(p);
    const clock = s.rachaClock || 0;
    const ox = fz.fromX, oy = fz.fromY;

    // escena oscurecida, con la luz sobre los dos portales
    const dimK = p < 0.12 ? p / 0.12 : p > 0.88 ? Math.max(0, (1 - p) / 0.12) : 1;
    const mx = (fz.ex + fz.xx) / 2, my = (fz.ey + fz.xy) / 2;
    const vg = ctx.createRadialGradient(mx, my, 40, mx, my, 300);
    vg.addColorStop(0, `rgba(3,14,40,${0.2 * dimK})`);
    vg.addColorStop(1, `rgba(3,14,40,${0.78 * dimK})`);
    ctx.fillStyle = vg;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // chispa en la punta de los dedos justo antes de que se abra el portal
    if (tl.spark > 0.01) {
      const hx = ox + fz.dx * 20, hy = oy - 5 + fz.dy * 20;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 4 + 9 * tl.spark);
      g.addColorStop(0, `rgba(255,255,255,${tl.spark})`);
      g.addColorStop(1, "rgba(60,140,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hx, hy, 4 + 9 * tl.spark, 0, Math.PI * 2); ctx.fill();
    }

    // eje + portales
    drawFaseLink(ctx, fz.ex, fz.ey, fz.xx, fz.xy, tl.link, clock, 1);
    drawFasePortal(ctx, fz.xx, fz.xy, fz.dx, fz.dy, tl.exit, clock, 1);
    drawFasePortal(ctx, fz.ex, fz.ey, fz.dx, fz.dy, tl.entry, clock, 1);

    // stickman: mano extendida -> se agacha -> salta al portal -> sale por el segundo
    s.faseArm = tl.arm;
    const cy0 = oy - 3; // centro del cuerpo
    if (p < 0.8) {
      if (tl.jump <= 0) {
        // de pie (o agachándose un poco) mirando al portal
        const cr = Math.sin(tl.crouch * Math.PI * 0.5);
        const feetY = oy + 15;
        drawBodyXf(ctx, s, abilityId, ox, feetY, ox, feetY, 1, 1 + 0.06 * cr, 1 - 0.14 * cr);
      } else {
        const u = tl.jump;
        const px = ox + (fz.ex - ox) * u;
        const py = cy0 + (fz.ey - cy0) * u - Math.sin(u * Math.PI) * 18;
        const sc = 1 - 0.68 * u * u;
        drawBodyXf(ctx, s, abilityId, ox, cy0, px, py, sc, 1, 1);
      }
    } else {
      const v = tl.emerge;
      const sc = 0.3 + 0.7 * easeOutBack(seg01(v, 0, 0.75));
      const py = fz.xy - Math.sin(v * Math.PI) * 8;
      drawBodyXf(ctx, s, abilityId, ox, cy0, fz.xx, py, sc, 1, 1);
    }
    s.faseArm = 0;

    // destellos: al entrar y al salir
    drawFaseFlash(ctx, fz.ex, fz.ey, seg01(p, 0.76, 0.92));
    drawFaseFlash(ctx, fz.xx, fz.xy, seg01(p, 0.8, 0.96));
  }


  // Dibuja el cuerpo (cualquier personaje) teñido de naranja brillante y con resplandor
  function drawBodyOrange(ctx, s, abilityId, tint, clock) {
    if (tint <= 0.01) { drawPlayerBody(ctx, s, abilityId); return; }
    const S = 3, N = 240;
    const x = s.player.x, y = s.player.y;
    if (!_brasaOff) {
      _brasaOff = document.createElement("canvas");
      _brasaOff.width = N * S;
      _brasaOff.height = N * S;
    }
    const o = _brasaOff.getContext("2d");
    o.save();
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalAlpha = 1;
    o.globalCompositeOperation = "source-over";
    o.clearRect(0, 0, N * S, N * S);
    o.setTransform(S, 0, 0, S, (N / 2 - x) * S, (N / 2 - y) * S);
    drawPlayerBody(o, s, abilityId);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = "source-atop";
    const gr = o.createLinearGradient(0, (N / 2 - 24) * S, 0, (N / 2 + 18) * S);
    gr.addColorStop(0, "#FFD24A");
    gr.addColorStop(0.45, "#FF9A1A");
    gr.addColorStop(1, "#FF5A0A");
    o.globalAlpha = Math.min(1, tint * 1.05);
    o.fillStyle = gr;
    o.fillRect(0, 0, N * S, N * S);
    o.restore();
    ctx.save();
    ctx.shadowColor = "rgba(255,120,20,0.95)";
    ctx.shadowBlur = 14 * tint;
    ctx.drawImage(_brasaOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
    // pasada aditiva: hace que el naranja brille
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.45 * tint * (0.85 + 0.15 * Math.sin(clock * 14));
    ctx.drawImage(_brasaOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
  }

  // Dibuja el cuerpo (cualquier personaje) teñido de gris metálico brillante
  function drawBodyGray(ctx, s, abilityId, tint) {
    if (tint <= 0.01) { drawPlayerBody(ctx, s, abilityId); return; }
    const S = 3, N = 240;
    const x = s.player.x, y = s.player.y;
    if (!_metalOff) {
      _metalOff = document.createElement("canvas");
      _metalOff.width = N * S;
      _metalOff.height = N * S;
    }
    const o = _metalOff.getContext("2d");
    o.save();
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalAlpha = 1;
    o.globalCompositeOperation = "source-over";
    o.clearRect(0, 0, N * S, N * S);
    o.setTransform(S, 0, 0, S, (N / 2 - x) * S, (N / 2 - y) * S);
    drawPlayerBody(o, s, abilityId);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = "source-atop";
    const gr = o.createLinearGradient(0, (N / 2 - 24) * S, 0, (N / 2 + 18) * S);
    gr.addColorStop(0, "#E7ECEF");
    gr.addColorStop(0.45, "#9AA5B1");
    gr.addColorStop(1, "#5C6266");
    o.globalAlpha = Math.min(1, tint * 1.05);
    o.fillStyle = gr;
    o.fillRect(0, 0, N * S, N * S);
    o.restore();
    ctx.save();
    ctx.shadowColor = "rgba(225,230,235,0.75)";
    ctx.shadowBlur = 10 * tint;
    ctx.drawImage(_metalOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.3 * tint * (0.85 + 0.15 * Math.sin((s.rachaClock || 0) * 14));
    ctx.drawImage(_metalOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
  }

  // Dibuja el cuerpo (cualquier personaje) teñido de un morado intenso y brillante
  function drawBodyPurple(ctx, s, abilityId, tint) {
    if (tint <= 0.01) { drawPlayerBody(ctx, s, abilityId); return; }
    const S = 3, N = 240;
    const x = s.player.x, y = s.player.y;
    if (!_muerteOff) {
      _muerteOff = document.createElement("canvas");
      _muerteOff.width = N * S;
      _muerteOff.height = N * S;
    }
    const o = _muerteOff.getContext("2d");
    o.save();
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalAlpha = 1;
    o.globalCompositeOperation = "source-over";
    o.clearRect(0, 0, N * S, N * S);
    o.setTransform(S, 0, 0, S, (N / 2 - x) * S, (N / 2 - y) * S);
    drawPlayerBody(o, s, abilityId);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = "source-atop";
    const gr = o.createLinearGradient(0, (N / 2 - 24) * S, 0, (N / 2 + 18) * S);
    gr.addColorStop(0, "#E4B8FF");
    gr.addColorStop(0.45, "#9B3FD1");
    gr.addColorStop(1, "#4A0F73");
    o.globalAlpha = Math.min(1, tint * 1.05);
    o.fillStyle = gr;
    o.fillRect(0, 0, N * S, N * S);
    o.restore();
    ctx.save();
    ctx.shadowColor = "rgba(190,110,255,0.95)";
    ctx.shadowBlur = 16 * tint;
    ctx.drawImage(_muerteOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.5 * tint * (0.85 + 0.15 * Math.sin((s.rachaClock || 0) * 14));
    ctx.drawImage(_muerteOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
  }

  // Igual que drawBodyPurple pero con un tinte blanco-dorado (carga/brillo de Luz)
  function drawBodyLight(ctx, s, abilityId, tint) {
    if (tint <= 0.01) { drawPlayerBody(ctx, s, abilityId); return; }
    const S = 3, N = 240;
    const x = s.player.x, y = s.player.y;
    if (!_luzOff) {
      _luzOff = document.createElement("canvas");
      _luzOff.width = N * S;
      _luzOff.height = N * S;
    }
    const o = _luzOff.getContext("2d");
    o.save();
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalAlpha = 1;
    o.globalCompositeOperation = "source-over";
    o.clearRect(0, 0, N * S, N * S);
    o.setTransform(S, 0, 0, S, (N / 2 - x) * S, (N / 2 - y) * S);
    drawPlayerBody(o, s, abilityId);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.globalCompositeOperation = "source-atop";
    const gr = o.createLinearGradient(0, (N / 2 - 24) * S, 0, (N / 2 + 18) * S);
    gr.addColorStop(0, "#FFFFFF");
    gr.addColorStop(0.45, "#FFE9A8");
    gr.addColorStop(1, "#FFC93C");
    o.globalAlpha = Math.min(1, tint * 1.05);
    o.fillStyle = gr;
    o.fillRect(0, 0, N * S, N * S);
    o.restore();
    ctx.save();
    ctx.shadowColor = "rgba(255,240,200,0.95)";
    ctx.shadowBlur = 18 * tint;
    ctx.drawImage(_luzOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55 * tint * (0.85 + 0.15 * Math.sin((s.rachaClock || 0) * 14));
    ctx.drawImage(_luzOff, x - N / 2, y - N / 2, N, N);
    ctx.restore();
  }

  // Dibuja la hoz gigante de Muerte: mango oscuro + hoja curva morada brillante
  function drawScythe(ctx, x, y, dirx, diry, k, alpha) {
    if (k <= 0.01 || alpha <= 0.01) return;
    const ang = Math.atan2(diry, dirx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha = alpha;
    const shaftLen = 34 * k;
    ctx.strokeStyle = "#241326";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6 * k, 0);
    ctx.lineTo(shaftLen, 0);
    ctx.stroke();
    ctx.strokeStyle = "#C77DFF";
    ctx.lineWidth = 4.2 * k;
    ctx.shadowColor = "rgba(180,80,255,0.9)";
    ctx.shadowBlur = 12 * k;
    ctx.beginPath();
    ctx.arc(shaftLen, 10 * k, 20 * k, Math.PI * 1.1, Math.PI * 1.85, false);
    ctx.stroke();
    ctx.restore();
  }

  // Muerte (súper): el stickman camina hacia la pared más cercana, extiende el brazo y la toca;
  // la pared brilla en morado y el personaje desaparece justo ahí.
  function drawMuerteWallScene(ctx, s, abilityId, camX, p, fx) {
    const tl = muerteWallTimeline(p);
    const w = fx.wall;
    const wx = w.fromX + (w.walkToX - w.fromX) * tl.walk;
    const wy = w.fromY + (w.walkToY - w.fromY) * tl.walk;
    const alpha = 1 - tl.fade;
    const gs = { ...s, player: { x: wx, y: wy }, facing: w.dir, moving: false };
    if (alpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = alpha;
      drawBodyPurple(ctx, gs, abilityId, Math.max(0.22, tl.reach));
      ctx.restore();
    }
    if (tl.reach > 0.02 && alpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = alpha * tl.reach;
      ctx.strokeStyle = "#C77DFF";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(wx, wy - 4);
      ctx.lineTo(w.touchX, w.touchY);
      ctx.stroke();
      ctx.restore();
    }
    if (tl.wallGlow > 0.02) {
      ctx.save();
      ctx.globalAlpha = tl.wallGlow;
      ctx.fillStyle = "rgba(160,70,230,0.55)";
      ctx.shadowColor = "rgba(190,110,255,0.95)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(w.touchX, w.touchY, 20 + 6 * tl.wallGlow, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Muerte: el stickman brilla morado, hace crecer una hoz gigante, se desvanece de su lugar y
  // aparece de golpe junto al monstruo dando el tajo; luego reaparece en su posición original.
  function drawMuerteStrikeScene(ctx, s, abilityId, camX, p, fx) {
    const tl = muerteStrikeTimeline(p);
    const originX = fx.wall ? fx.wall.walkToX : fx.fromX;
    const originY = fx.wall ? fx.wall.walkToY : fx.fromY;
    const alphaOrigin = p < 0.5 ? 1 - smooth01(seg01(p, 0.4, 0.5)) : smooth01(seg01(p, 0.82, 1));
    if (alphaOrigin > 0.02) {
      const gs = { ...s, player: { x: originX, y: originY } };
      ctx.save();
      ctx.globalAlpha = alphaOrigin;
      drawBodyPurple(ctx, gs, abilityId, tl.glow || (p >= 0.82 ? 0 : 1));
      if (tl.scytheA > 0.02) {
        drawScythe(ctx, originX, originY - 4, s.facing.x || 1, s.facing.y || 0, tl.scythe, tl.scytheA);
      }
      ctx.restore();
    }
    if (p > 0.36 && p < 0.56) {
      const flashA = smooth01(seg01(p, 0.4, 0.48)) * (1 - smooth01(seg01(p, 0.5, 0.56)));
      if (flashA > 0.02) {
        ctx.save();
        ctx.globalAlpha = flashA;
        ctx.fillStyle = "#E4B8FF";
        ctx.beginPath();
        ctx.arc(originX, originY - 4, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    if (p >= 0.46) {
      const mAlpha = smooth01(seg01(p, 0.46, 0.54)) * (1 - smooth01(seg01(p, 0.78, 0.92)));
      if (mAlpha > 0.02) {
        const mx = fx.monsterX, my = fx.monsterY;
        const swing = easeOutCubic(seg01(p, 0.5, 0.62));
        const gs2 = { ...s, player: { x: mx - 16, y: my }, facing: { x: 1, y: 0 } };
        ctx.save();
        ctx.globalAlpha = mAlpha;
        drawBodyPurple(ctx, gs2, abilityId, 1);
        drawScythe(ctx, mx - 16 + swing * 20, my - 4, 1, 0, 1, 1);
        ctx.restore();
      }
      if (tl.impact > 0.02) {
        ctx.save();
        ctx.globalAlpha = tl.impact;
        ctx.fillStyle = "rgba(200,120,255,0.85)";
        ctx.shadowColor = "rgba(200,120,255,0.9)";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(fx.monsterX, fx.monsterY, MONSTER_R * 0.9 + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function drawMuerteScene(ctx, s, abilityId, camX, info) {
    const fx = s.muerteFx;
    if (!fx) return;
    if (info.phase === "wall" && fx.wall) drawMuerteWallScene(ctx, s, abilityId, camX, info.p, fx);
    else drawMuerteStrikeScene(ctx, s, abilityId, camX, info.phase === "wall" ? 0 : info.p, fx);
  }

  // Mientras el blindaje de Metal está activo, el personaje se ve más grande y gris (teñido + escalado
  // desde los pies, para que quede parado en el suelo).
  function drawPlayerMaybeMetal(ctx, s, abilityId) {
    const metalOn = s.activeEffectAbility === "metal" && s.activeEffectT > 0;
    if (!metalOn) { drawPlayer(ctx, s, abilityId); return; }
    const px = s.player.x, feetY = s.player.y + 15;
    ctx.save();
    ctx.translate(px, feetY);
    ctx.scale(1.55, 1.55);
    ctx.translate(-px, -feetY);
    drawBodyGray(ctx, s, abilityId, 1);
    ctx.restore();
  }

  // Tiempo: el stickman se voltea hacia el monstruo, extiende el brazo y lanza una esfera verde
  // brillante que, al llegar, deja al monstruo congelado dentro de un anillo verde.
  function drawTiempoScene(ctx, s, abilityId, camX, p, fx) {
    const clock = s.rachaClock || 0;
    const tl = tiempoTimeline(p);
    const px = s.player.x, py = s.player.y;
    const mx = s.monster.x, my = s.monster.y;
    const dx = fx.dx, dy = fx.dy;
    const shY = py - 5;

    const dimK = p < 0.1 ? p / 0.1 : p > 0.92 ? Math.max(0, (1 - p) / 0.08) : 1;
    ctx.fillStyle = `rgba(6,24,20,${0.55 * dimK})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // el stickman se voltea hacia el monstruo y extiende el brazo
    s.facing = { x: dx, y: dy };
    s.faseArm = tl.arm;
    s.armDir = { x: dx, y: dy };
    s.armColor = ABILITIES.tiempo.accent;
    drawPlayerBody(ctx, s, abilityId);
    s.faseArm = 0;
    s.armDir = null;
    s.armColor = null;

    const reach = 19 * tl.arm;
    const hx = px + dx * reach, hy = shY + dy * reach - 2 * tl.arm;

    // chispas verdes que convergen en la mano mientras la esfera se forma
    const chargeA = tl.arm * (1 - tl.travel);
    if (chargeA > 0.05) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 8; i++) {
        const ph = (clock * 1.7 + i * 0.12) % 1;
        const ang = i * 2.399 + clock * 3;
        const d1 = (24 + 5 * (i % 3)) * (1 - ph);
        ctx.strokeStyle = `rgba(120,225,190,${chargeA * (0.3 + 0.7 * ph)})`;
        ctx.beginPath();
        ctx.moveTo(hx + Math.cos(ang) * d1, hy + Math.sin(ang) * d1);
        ctx.lineTo(hx + Math.cos(ang) * (d1 + 6), hy + Math.sin(ang) * (d1 + 6));
        ctx.stroke();
      }
      ctx.restore();
    }
    // esfera formándose en la mano
    if (chargeA > 0.01) {
      const cr = 10 + 16 * tl.charge;
      const og = ctx.createRadialGradient(hx, hy, 0, hx, hy, cr * 1.8);
      og.addColorStop(0, `rgba(235,255,248,${chargeA})`);
      og.addColorStop(0.35, `rgba(90,220,180,${chargeA * 0.95})`);
      og.addColorStop(1, "rgba(63,160,137,0)");
      ctx.fillStyle = og;
      ctx.beginPath(); ctx.arc(hx, hy, cr * 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(235,255,248,${chargeA})`;
      ctx.beginPath(); ctx.arc(hx, hy, cr * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    // la esfera viaja de la mano al monstruo — grande, sólida y con halo bien visible
    if (tl.travel > 0.001) {
      const sx = hx + (mx - hx) * tl.travel, sy = hy + (my - hy) * tl.travel;
      const r = TIEMPO_SPHERE_R * (1 - 0.2 * tl.hit);
      // halo exterior amplio
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.6);
      g.addColorStop(0, "rgba(120,255,210,0.55)");
      g.addColorStop(0.55, "rgba(63,220,170,0.35)");
      g.addColorStop(1, "rgba(63,160,137,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx, sy, r * 2.6, 0, Math.PI * 2); ctx.fill();
      // cuerpo sólido de la esfera
      const b = ctx.createRadialGradient(sx - r * 0.25, sy - r * 0.25, 0, sx, sy, r);
      b.addColorStop(0, "#F2FFFA");
      b.addColorStop(0.45, "#6BE3B4");
      b.addColorStop(1, "#2E8F72");
      ctx.fillStyle = b;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      // brillo central
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(sx - r * 0.28, sy - r * 0.28, r * 0.32, 0, Math.PI * 2); ctx.fill();
    }
    // impacto: el monstruo queda congelado dentro de un anillo verde
    if (tl.travel > 0.9) {
      ctx.strokeStyle = ABILITIES.tiempo.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.55 + 0.45 * tl.hit;
      ctx.beginPath();
      ctx.arc(mx, my, MONSTER_R + 14 + 8 * (1 - tl.hit), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Súper Tiempo: el stickman se agacha, salta y aterriza sobre una motocicleta que en vez de
  // ruedas tiene relojes analógicos; al arrancar obtiene la súper velocidad y la inmunidad de Racha.
  function drawMotoScene(ctx, s, abilityId, camX, p) {
    const tl = motoTimeline(p);
    const px = s.player.x, py = s.player.y;

    const dimK = p < 0.1 ? p / 0.1 : p > 0.92 ? Math.max(0, (1 - p) / 0.08) : 1;
    ctx.fillStyle = `rgba(8,12,22,${0.5 * dimK})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    const jumpH = 24 * Math.sin(Math.PI * clamp01(tl.jump));
    const crouch = 3 * tl.crouch * (1 - tl.jump);
    const spin = (s.rachaClock || 0) * (6 + 46 * tl.rev);

    drawMotoBody(ctx, px, py + crouch, tl.bike, spin);

    ctx.save();
    ctx.translate(0, -jumpH + crouch * 0.6);
    drawPlayerBody(ctx, s, abilityId);
    ctx.restore();
  }

  function drawBrasaScene(ctx, s, abilityId, camX, p) {
    const fx = s.brasaFx;
    if (!fx) return;
    if (fx.superMode) { drawBrasaSuperScene(ctx, s, abilityId, camX, p); return; }
    const tl = brasaTimeline(p);
    const clock = s.rachaClock || 0;
    const px = s.player.x, py = s.player.y;

    // escena oscurecida (tono cálido) y luz solo sobre el stickman
    const vg = ctx.createRadialGradient(px, py, 30, px, py, 300);
    vg.addColorStop(0, `rgba(30,8,0,${0.3 * tl.dim})`);
    vg.addColorStop(1, `rgba(20,5,0,${0.88 * tl.dim})`);
    ctx.fillStyle = vg;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // el stickman se ve al principio y desaparece dentro de la bola de fuego
    if (tl.body < 0.02) drawPlayerBody(ctx, s, abilityId);
    else drawPlayerFaded(ctx, s, abilityId, 1 - tl.body);
    drawBrasaBall(ctx, px, py, clock, { r: 0.3 + 0.7 * tl.grow, a: tl.ball, hard: tl.hard, bloom: tl.bloom });
  }

  function drawBrasaSuperScene(ctx, s, abilityId, camX, p) {
    const fx = s.brasaFx;
    const tl = brasaSuperTimeline(p);
    const clock = s.rachaClock || 0;
    const px = s.player.x, py = s.player.y;

    // escena oscurecida (tono cálido) y luz solo sobre el stickman
    const vg = ctx.createRadialGradient(px, py, 40, px, py, 340);
    vg.addColorStop(0, `rgba(30,8,0,${0.26 * tl.dim})`);
    vg.addColorStop(1, `rgba(20,5,0,${0.84 * tl.dim})`);
    ctx.fillStyle = vg;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // paredes: se encienden de a poco, con luz propia por encima del oscurecido
    fx.walls.forEach((w, i) => {
      const k = brasaWallK(p, i);
      if (k > 0.01) drawWallFire(ctx, w.wl, clock, k, { x: w.ox, y: w.oy });
    });

    // aura de calor alrededor del stickman
    if (tl.tint > 0.02) {
      const ag = ctx.createRadialGradient(px, py - 2, 4, px, py - 2, 46);
      ag.addColorStop(0, `rgba(255,190,70,${0.55 * tl.tint})`);
      ag.addColorStop(1, "rgba(255,110,20,0)");
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.arc(px, py - 2, 46, 0, Math.PI * 2); ctx.fill();
    }

    // stickman naranja brillante con las dos manos apuntando hacia las paredes
    s.brasaArms = { a: fx.hands[0].d, b: fx.hands[1].d, k: tl.arm };
    drawBodyOrange(ctx, s, abilityId, tl.tint, clock);
    s.brasaArms = null;

    // llamitas que le salen del cuerpo
    if (tl.tint > 0.05) {
      for (let i = 0; i < 7; i++) {
        const ph = (clock * 1.3 + i * 0.19) % 1;
        const ox = (i - 3) * 3.2 + Math.sin(clock * 6 + i) * 1.6;
        const oy = -15 + (i % 3) * 9;
        drawFlame(ctx, px + ox, py + oy, 0, -1, (5 + 8 * ph) * tl.tint, 2.4, Math.sin(clock * 14 + i) * 1.6, tl.tint * (1 - ph * 0.6), 2);
      }
    }

    // fuego en las palmas y chorros hacia las paredes
    fx.hands.forEach((h) => {
      const hp = brasaHand(s, h.d, tl.arm);
      if (tl.jetA > 0.02) drawFireJet(ctx, hp.x, hp.y, h.ax, h.ay, tl.jet, clock, 1.25, tl.jetA);
      if (tl.palm > 0.02) {
        const gl = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 16 * tl.palm);
        gl.addColorStop(0, `rgba(255,250,215,${0.95 * tl.palm})`);
        gl.addColorStop(0.5, `rgba(255,170,50,${0.7 * tl.palm})`);
        gl.addColorStop(1, "rgba(255,90,10,0)");
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(hp.x, hp.y, 16 * tl.palm, 0, Math.PI * 2); ctx.fill();
        const ang = Math.atan2(h.d.y, h.d.x);
        for (let i = -1; i <= 1; i++) {
          const a2 = ang + i * 0.42;
          drawFlame(ctx, hp.x, hp.y, Math.cos(a2), Math.sin(a2), (7 + 6 * Math.sin(clock * 17 + i * 2)) * tl.palm + 3, 3, Math.sin(clock * 19 + i) * 1.8, tl.palm, 3);
        }
      }
    });
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

  // Cuerpo del personaje: si está cortado (Ladrón) se dibuja partido en dos
  function drawPlayerBody(ctx, s, abilityId) {
    if ((s.cutGap || 0) > 0.05) {
      drawSplitBody(ctx, s, abilityId, { gap: s.cutGap, glow: s.cutGlow || 0 });
      return;
    }
    drawPlayerBodyRaw(ctx, s, abilityId);
  }

  // Parte el cuerpo (cualquier personaje) por una línea diagonal a la altura de la cintura.
  // o = { gap, glow, slide?, upX?, upY?, upR?, upA?, loX?, loY?, loR?, loA? }
  function drawSplitBody(ctx, s, abilityId, o) {
    const x = s.player.x, y = s.player.y, cy0 = y - 2;
    if (!_cutOff) {
      _cutOff = document.createElement("canvas");
      _cutOff.width = 480;
      _cutOff.height = 480;
    }
    const octx = _cutOff.getContext("2d");
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, 480, 480);
    octx.setTransform(2, 0, 0, 2, (120 - x) * 2, (120 - y) * 2);
    drawPlayerBodyRaw(octx, s, abilityId);
    octx.setTransform(1, 0, 0, 1, 0, 0);

    const ux = Math.cos(LADRON_CUT_A), uy = Math.sin(LADRON_CUT_A);
    const nx = Math.sin(LADRON_CUT_A), ny = -Math.cos(LADRON_CUT_A); // normal hacia arriba
    const g = o.gap || 0;
    const sl = o.slide ?? g * 0.55;
    const glow = o.glow || 0;
    const clock = s.rachaClock || 0;
    const rot = 0.05 * Math.min(1.6, g / LADRON_GAP);

    // resplandor de energía entre las dos mitades
    if (glow > 0.02) {
      const gr = ctx.createRadialGradient(x, cy0, 1, x, cy0, 15 + g * 1.5);
      gr.addColorStop(0, `rgba(255,214,120,${0.55 * glow})`);
      gr.addColorStop(1, "rgba(255,150,30,0)");
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(x, cy0, 15 + g * 1.5, 0, Math.PI * 2); ctx.fill();
    }

    const half = (dir, ox, oy, r, alpha) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(x + ox, cy0 + oy);
      ctx.rotate(r);
      ctx.translate(-x, -cy0);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x - ux * 90, cy0 - uy * 90);
      ctx.lineTo(x + ux * 90, cy0 + uy * 90);
      ctx.lineTo(x + ux * 90, cy0 + uy * 90 + dir * 130);
      ctx.lineTo(x - ux * 90, cy0 - uy * 90 + dir * 130);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(_cutOff, x - 120, y - 120, 240, 240);
      ctx.restore();
      // filo brillante del corte
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(255,190,70,${0.25 * glow})`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x - ux * 8, cy0 - uy * 8); ctx.lineTo(x + ux * 8, cy0 + uy * 8); ctx.stroke();
      ctx.strokeStyle = `rgba(255,214,110,${Math.min(1, 0.55 + 0.45 * glow)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - ux * 8, cy0 - uy * 8); ctx.lineTo(x + ux * 8, cy0 + uy * 8); ctx.stroke();
      ctx.restore();
    };
    half(1, -nx * g - ux * sl + (o.loX || 0), -ny * g - uy * sl + (o.loY || 0) + Math.sin(clock * 4 + 2) * 0.5, o.loR ?? rot, o.loA ?? 1);
    half(-1, nx * g + ux * sl + (o.upX || 0), ny * g + uy * sl + (o.upY || 0) + Math.sin(clock * 4) * 0.5, o.upR ?? -rot, o.upA ?? 1);
  }

  // El tajo en el lugar donde el monstruo tocó al stickman: las dos mitades se separan, caen y se desvanecen
  function drawCutGhost(ctx, s, abilityId) {
    const f = s.cutFx;
    if (!f) return;
    const u = 1 - f.t / LADRON_CUT_FX_T;
    const cy0 = f.y - 2;
    const ux = Math.cos(LADRON_CUT_A), uy = Math.sin(LADRON_CUT_A);
    const gs = { ...s, player: { x: f.x, y: f.y }, facing: { x: f.fx, y: f.fy }, moving: f.moving, invuln: 0, faseArm: 0, cutGap: 0 };
    const a = 1 - smooth01(seg01(u, 0.45, 1));
    drawSplitBody(ctx, gs, abilityId, {
      gap: LADRON_GAP + 7 * easeOutCubic(u), glow: 1 - u,
      upX: -16 * u, upY: -8 * u + 34 * u * u, upR: -1.1 * u, upA: a,
      loX: 11 * u, loY: 4 * u + 26 * u * u, loR: 0.8 * u, loA: a,
    });
    // destello del tajo
    const sl = 1 - seg01(u, 0, 0.28);
    if (sl > 0.01) {
      ctx.save();
      ctx.globalAlpha = sl;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,150,40,0.7)";
      ctx.lineWidth = 8 * sl;
      ctx.beginPath(); ctx.moveTo(f.x - ux * 30, cy0 - uy * 30); ctx.lineTo(f.x + ux * 30, cy0 + uy * 30); ctx.stroke();
      ctx.strokeStyle = "#FFF6D6";
      ctx.lineWidth = 1 + 3 * sl;
      ctx.beginPath(); ctx.moveTo(f.x - ux * 30, cy0 - uy * 30); ctx.lineTo(f.x + ux * 30, cy0 + uy * 30); ctx.stroke();
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        const ang = i * 1.05 + 0.4;
        const d1 = 6 + (1 - sl) * 16;
        ctx.beginPath();
        ctx.moveTo(f.x + Math.cos(ang) * d1, cy0 + Math.sin(ang) * d1);
        ctx.lineTo(f.x + Math.cos(ang) * (d1 + 7), cy0 + Math.sin(ang) * (d1 + 7));
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Metal: el juego se pausa, se centra en el personaje y una capa de metal lo va recubriendo.
  function drawMetalScene(ctx, s, abilityId, camX, p) {
    const tl = metalTimeline(p);
    const px = s.player.x, py = s.player.y;

    ctx.fillStyle = `rgba(16,18,22,${0.4 * smooth01(seg01(p, 0, 0.12)) * (1 - smooth01(seg01(p, 0.9, 1)))})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    {
      const growK = smooth01(p);
      const feetY = py + 15;
      ctx.save();
      ctx.translate(px, feetY);
      ctx.scale(1 + 0.55 * growK, 1 + 0.55 * growK);
      ctx.translate(-px, -feetY);
      drawBodyGray(ctx, s, abilityId, growK);
      ctx.restore();
    }

    if (tl.rise > 0.02) {
      const r = 10 + 16 * tl.rise;
      const g = ctx.createRadialGradient(px, py - 4, 0, px, py - 4, r);
      g.addColorStop(0, `rgba(226,231,236,${0.5 * tl.rise})`);
      g.addColorStop(0.55, `rgba(154,165,177,${0.5 * tl.rise})`);
      g.addColorStop(1, "rgba(124,134,141,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py - 4, r, 0, Math.PI * 2); ctx.fill();
    }
    if (tl.shine > 0.02) {
      ctx.save();
      ctx.strokeStyle = `rgba(240,245,250,${0.8 * (1 - tl.shine)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py - 4, 16 + tl.shine * 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Súper Metal: ambas manos apuntan al frente y disparan 30 rayos metálicos cada una; donde caen
  // dejan un bulto de metal que sólo el propio stickman puede atravesar.
  function drawMetalSuperScene(ctx, s, abilityId, camX, p) {
    const fx = s.metalSuperFx;
    if (!fx) return;
    const tl = metalSuperTimeline(p);
    const px = s.player.x, py = s.player.y;

    ctx.fillStyle = `rgba(16,18,22,${0.42 * smooth01(seg01(p, 0, 0.1)) * (1 - smooth01(seg01(p, 0.92, 1)))})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    s.brasaArms = { a: fx.hands[0], b: fx.hands[1], k: tl.aim };
    drawPlayerBody(ctx, s, abilityId);
    s.brasaArms = null;

    if (tl.fire > 0.001) {
      fx.hands.forEach((d, hi) => {
        const hp = brasaHand(s, d, 1);
        fx.rays.filter((r) => r.hand === hi).forEach((r) => {
          const local = clamp01((tl.fire - r.delay) / Math.max(0.05, 1 - r.delay));
          if (local <= 0) return;
          const travel = easeOutCubic(Math.min(1, local * 1.5));
          const rx = hp.x + (r.x - hp.x) * travel;
          const ry = hp.y + (r.y - hp.y) * travel;
          const fade = local < 1 ? 1 : Math.max(0, 1 - (local - 1) * 3);
          ctx.strokeStyle = `rgba(210,218,224,${0.85 * fade})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(hp.x, hp.y);
          ctx.lineTo(rx, ry);
          ctx.stroke();
          if (local >= 0.97) {
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.fillStyle = "#9AA5B1";
            ctx.beginPath(); ctx.arc(r.x, r.y, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#4A4E52";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
          }
        });
      });
    }
  }

  // Descarga / Aturdir: el juego se pausa, le caen rayos amarillos encima y luego lanza un gran rayo al monstruo.
  function drawElectricoScene(ctx, s, abilityId, camX, p) {
    const fx = s.electricoFx;
    if (!fx) return;
    if (fx.superMode) { drawElectricoSuperScene(ctx, s, abilityId, camX, p); return; }
    const tl = electricoTimeline(p);
    const clock = s.rachaClock || 0;
    const px = s.player.x, py = s.player.y;
    const mx = s.monster.x, my = s.monster.y;

    ctx.fillStyle = `rgba(24,20,4,${0.55 * tl.dim})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // lluvia de rayos amarillos cayendo sobre el personaje
    fx.bolts.forEach((b) => {
      const lp = smooth01(seg01(tl.rain, b.delay * 0.7, b.delay * 0.7 + 0.5));
      if (lp <= 0.01) return;
      const topY = py - 240;
      const endY = py - 6 - 30 * (1 - lp);
      drawLightningBolt(ctx, px + b.ox, topY, px + b.ox * 0.25, endY, b.seed, lp * (0.7 + 0.3 * Math.sin(clock * 30 + b.seed)), ABILITIES.electrico.accent, 3);
      if (lp > 0.7) {
        ctx.save();
        ctx.globalAlpha = (lp - 0.7) / 0.3;
        ctx.fillStyle = "#FFF6C8";
        ctx.beginPath(); ctx.arc(px + b.ox * 0.25, endY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });

    // el personaje se carga en amarillo mientras le caen los rayos encima
    if (tl.charge > 0.01) {
      const g = ctx.createRadialGradient(px, py - 6, 4, px, py - 6, 34);
      g.addColorStop(0, `rgba(255,240,170,${0.55 * tl.charge})`);
      g.addColorStop(1, "rgba(255,200,40,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py - 6, 34, 0, Math.PI * 2); ctx.fill();
    }

    // extiende la mano hacia el monstruo
    const dx0 = mx - px, dy0 = my - py;
    const d0 = Math.hypot(dx0, dy0) || 1;
    const dx = dx0 / d0, dy = dy0 / d0;
    s.facing = { x: dx, y: dy };
    s.faseArm = tl.arm;
    s.armDir = { x: dx, y: dy };
    s.armColor = ABILITIES.electrico.accent;
    drawPlayerBody(ctx, s, abilityId);
    s.faseArm = 0;
    s.armDir = null;
    s.armColor = null;

    const reach = 19 * tl.arm;
    const hx = px + dx * reach, hy = py - 5 + dy * reach;

    // el gran rayo viaja de la mano al monstruo
    if (tl.travel > 0.001) {
      const tx = hx + (mx - hx) * tl.travel, ty = hy + (my - hy) * tl.travel;
      drawLightningBolt(ctx, hx, hy, tx, ty, 3, 1, ABILITIES.electrico.accent, 5);
    }
    // impacto: el monstruo queda paralizado
    if (tl.travel > 0.9) {
      ctx.save();
      ctx.strokeStyle = ABILITIES.electrico.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.55 + 0.45 * tl.hit;
      ctx.beginPath();
      ctx.arc(mx, my, MONSTER_R + 14 + 8 * (1 - tl.hit), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Súper Descarga: el personaje levanta la mano, la baja con fuerza y de ahí nacen los rayos
  // que forman la pared eléctrica circular a su alrededor.
  function drawElectricoSuperScene(ctx, s, abilityId, camX, p) {
    const tl = electricoSuperTimeline(p);
    const fx = s.electricoFx;
    const px = s.player.x, py = s.player.y;
    const clock = s.rachaClock || 0;

    ctx.fillStyle = `rgba(24,20,4,${0.55 * tl.dim})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    drawPlayerBody(ctx, s, abilityId);

    // brazo: se levanta y luego baja con fuerza
    const shX = px, shY = py - 16;
    const raiseY = shY - 22 * tl.raise;
    const downY = shY - 22 * (1 - tl.slam) + 5 * tl.slam;
    const handY = tl.slam > 0.01 ? downY : raiseY;
    ctx.save();
    ctx.strokeStyle = "#3A342E";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(shX, handY);
    ctx.stroke();
    if (tl.raise > 0.05 || tl.slam > 0.01) {
      const g = ctx.createRadialGradient(shX, handY, 1, shX, handY, 12);
      g.addColorStop(0, "rgba(255,240,170,0.85)");
      g.addColorStop(1, "rgba(255,200,40,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(shX, handY, 12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // del golpe de la mano nacen rayos que caen alrededor y forman la pared
    if (tl.bolts > 0.01) {
      fx.bolts.forEach((b) => {
        const lp = smooth01(seg01(tl.bolts, b.delay, b.delay + 0.5));
        if (lp <= 0.01) return;
        const ex = px + Math.cos(b.ang) * ELECTRICO_WALL_R, ey = py + Math.sin(b.ang) * ELECTRICO_WALL_R;
        drawLightningBolt(ctx, ex, ey - 180, ex, ey, b.seed, lp, ABILITIES.electrico.accent, 2.6);
      });
    }
    // la pared eléctrica circular se forma alrededor del stickman
    if (tl.wall > 0.01) {
      const R = ELECTRICO_WALL_R;
      const n = fx.bolts.length;
      for (let i = 0; i < n; i++) {
        const a0 = fx.bolts[i].ang, a1 = fx.bolts[(i + 1) % n].ang + (i === n - 1 ? Math.PI * 2 : 0);
        const x1 = px + Math.cos(a0) * R, y1 = py + Math.sin(a0) * R;
        const x2 = px + Math.cos(a1) * R, y2 = py + Math.sin(a1) * R;
        drawLightningBolt(ctx, x1, y1, x2, y2, i * 5 + Math.floor(clock * 8), tl.wall * (0.6 + 0.4 * Math.sin(clock * 20 + i)), ABILITIES.electrico.accent, 2.4);
      }
    }
  }

  // Luz: el personaje se gira hacia el monstruo, se carga con un resplandor blanco-dorado y
  // lanza un ultra gigantesco rayo de luz desde las manos que lo deja aturdido.
  function drawLuzScene(ctx, s, abilityId, camX, p) {
    const fx = s.luzFx;
    if (!fx) return;
    if (fx.superMode) { drawLuzSuperScene(ctx, s, abilityId, camX, p); return; }
    const tl = luzTimeline(p);
    const clock = s.rachaClock || 0;
    const px = s.player.x, py = s.player.y;
    const mx = s.monster.x, my = s.monster.y;

    ctx.fillStyle = `rgba(20,18,10,${0.5 * tl.dim})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // se gira hacia el monstruo
    const dx0 = mx - px, dy0 = my - py;
    const d0 = Math.hypot(dx0, dy0) || 1;
    const dx = dx0 / d0, dy = dy0 / d0;
    s.facing = { x: dx, y: dy };

    // se carga con un resplandor blanco-dorado
    if (tl.charge > 0.01) {
      const g = ctx.createRadialGradient(px, py - 6, 4, px, py - 6, 40);
      g.addColorStop(0, `rgba(255,250,225,${0.6 * tl.charge})`);
      g.addColorStop(1, "rgba(255,220,110,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py - 6, 40, 0, Math.PI * 2); ctx.fill();
    }

    // extiende las manos hacia el monstruo
    s.faseArm = Math.max(tl.arm, tl.charge * 0.4);
    s.armDir = { x: dx, y: dy };
    s.armColor = ABILITIES.luz.accent;
    drawBodyLight(ctx, s, abilityId, Math.max(tl.charge, tl.arm * 0.7));
    s.faseArm = 0;
    s.armDir = null;
    s.armColor = null;

    const reach = 22 * tl.arm;
    const hx = px + dx * reach, hy = py - 5 + dy * reach;
    const nx = -dy, ny = dx;

    // el ultra gigantesco rayo de luz viaja de las manos al monstruo
    if (tl.beam > 0.001) {
      const tx = hx + (mx - hx) * tl.beam, ty = hy + (my - hy) * tl.beam;
      drawLightBeam(ctx, hx - nx * 9, hy - ny * 9, tx - nx * 5, ty - ny * 5, clock, 1, ABILITIES.luz.accent);
      drawLightBeam(ctx, hx + nx * 9, hy + ny * 9, tx + nx * 5, ty + ny * 5, clock, 1, ABILITIES.luz.accent);
    }
    // impacto: el monstruo queda aturdido
    if (tl.beam > 0.9) {
      ctx.save();
      ctx.strokeStyle = ABILITIES.luz.accent;
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.6 + 0.4 * tl.hit;
      ctx.beginPath();
      ctx.arc(mx, my, MONSTER_R + 26 + 16 * (1 - tl.hit), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // Súper Luz: el personaje brilla con una luz blanca intensa hasta casi fundirse en el
  // resplandor y se teletransporta a otro punto.
  function drawLuzSuperScene(ctx, s, abilityId, camX, p) {
    const tl = luzSuperTimeline(p);
    const fx = s.luzFx;
    if (!fx) return;

    ctx.fillStyle = `rgba(20,18,10,${0.5 * tl.dim})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    const atTarget = p > 0.58;
    const savedX = s.player.x, savedY = s.player.y;
    s.player.x = atTarget ? fx.toX : fx.fromX;
    s.player.y = atTarget ? fx.toY : fx.fromY;

    const tint = atTarget ? tl.reveal : tl.glow;
    drawBodyLight(ctx, s, abilityId, tint);

    if (!atTarget && tl.vanish > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const r = 30 * tl.vanish;
      const g = ctx.createRadialGradient(fx.fromX, fx.fromY, 0, fx.fromX, fx.fromY, r);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * tl.vanish})`);
      g.addColorStop(1, "rgba(255,240,190,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(fx.fromX, fx.fromY, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (atTarget) {
      const rp = 1 - tl.reveal;
      const r = 34 * (0.3 + 0.7 * rp);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(fx.toX, fx.toY, 0, fx.toX, fx.toY, r);
      g.addColorStop(0, `rgba(255,255,255,${0.85 * (0.3 + 0.7 * rp)})`);
      g.addColorStop(1, "rgba(255,240,190,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(fx.toX, fx.toY, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    s.player.x = savedX;
    s.player.y = savedY;
  }

  function drawLadronScene(ctx, s, abilityId, camX, info) {
    const fx = s.ladronFx;
    if (!fx) return;
    if (info.phase === "join") drawLadronJoin(ctx, s, abilityId, camX, info.p);
    else drawLadronRay(ctx, s, abilityId, camX, info.p, fx);
  }

  // Pausa 1: las dos mitades flotan, se atraen con hilos de energía y se unen con un destello
  function drawLadronJoin(ctx, s, abilityId, camX, p) {
    const clock = s.rachaClock || 0;
    const px = s.player.x, py = s.player.y;
    const ux = Math.cos(LADRON_CUT_A), uy = Math.sin(LADRON_CUT_A);
    const nx = Math.sin(LADRON_CUT_A), ny = -Math.cos(LADRON_CUT_A);

    const dimK = p < 0.12 ? p / 0.12 : p > 0.88 ? Math.max(0, (1 - p) / 0.12) : 1;
    const vg = ctx.createRadialGradient(px, py, 26, px, py, 250);
    vg.addColorStop(0, `rgba(24,12,2,${0.22 * dimK})`);
    vg.addColorStop(1, `rgba(24,12,2,${0.8 * dimK})`);
    ctx.fillStyle = vg;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    const rise = smooth01(seg01(p, 0.14, 0.46));         // se separan y flotan
    const pull = Math.pow(seg01(p, 0.5, 0.72), 2.2);      // se atraen con fuerza
    const gap = (LADRON_GAP + (8.5 - LADRON_GAP) * rise) * (1 - pull);
    const glow = (0.4 + 0.6 * seg01(p, 0.12, 0.7)) * (1 - smooth01(seg01(p, 0.78, 0.98)));
    const lift = 4 * rise * (1 - pull);
    const cyL = py - 2 - lift;

    s.cutGap = gap;
    s.cutGlow = glow;
    const q = seg01(p, 0.72, 1);
    const sq = Math.sin(q * Math.PI * 3) * (1 - q) * 0.13; // rebote al unirse
    const feetY = py + 15;
    drawBodyXf(ctx, s, abilityId, px, feetY, px, feetY - lift, 1, 1 - sq * 0.6, 1 + sq);
    s.cutGap = 0;
    s.cutGlow = 0;

    // hilos de energía entre las dos mitades
    const thr = smooth01(seg01(p, 0.26, 0.46)) * (1 - seg01(p, 0.68, 0.74));
    if (thr > 0.02 && gap > 0.6) {
      ctx.save();
      ctx.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        const t = -8 + i * 3.2;
        const ax = px + ux * t + nx * gap, ay = cyL + uy * t + ny * gap;
        const bx = px + ux * t - nx * gap, by = cyL + uy * t - ny * gap;
        const wob = Math.sin(clock * 14 + i * 1.7) * 2.2;
        ctx.strokeStyle = `rgba(255,${190 + (i % 2) * 30},80,${0.85 * thr})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo((ax + bx) / 2 + wob, (ay + by) / 2, bx, by);
        ctx.stroke();
      }
      ctx.restore();
    }

    // motas de luz dorada subiendo alrededor
    const moteA = smooth01(seg01(p, 0.05, 0.25)) * (1 - smooth01(seg01(p, 0.8, 0.98)));
    for (let i = 0; i < 12; i++) {
      const ph = (clock * 0.8 + i * 0.083) % 1;
      const mx0 = px + Math.sin(i * 2.4 + clock * 2.2) * (9 + (i % 3) * 5);
      const my0 = py + 16 - ph * 44;
      ctx.fillStyle = `rgba(255,${200 + (i % 3) * 18},90,${moteA * Math.sin(ph * Math.PI) * 0.9})`;
      ctx.beginPath(); ctx.arc(mx0, my0, 1.5 + (i % 2), 0, Math.PI * 2); ctx.fill();
    }

    // destello y onda al unirse
    const snap = seg01(p, 0.7, 0.9);
    if (snap > 0 && snap < 1) {
      const R = 10 + 36 * snap;
      const fg = ctx.createRadialGradient(px, cyL, 0, px, cyL, R);
      fg.addColorStop(0, `rgba(255,250,225,${0.9 * (1 - snap)})`);
      fg.addColorStop(1, "rgba(255,170,50,0)");
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(px, cyL, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,190,70,${0.9 * (1 - snap)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(px, cyL, 8 + 40 * snap, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // Pausa 2: el stickman extiende la mano, carga energía y lanza un gran rayo al monstruo;
  // por el rayo vuelve la vida robada hacia él
  function drawLadronRay(ctx, s, abilityId, camX, p, fx) {
    const clock = s.rachaClock || 0;
    const sup = fx.superMode;
    const tl = ladronTimeline(p);
    const px = s.player.x, py = s.player.y;
    const mx = s.monster.x, my = s.monster.y;
    const dx = fx.dx, dy = fx.dy;
    const shY = py - 5;

    const dimK = p < 0.1 ? p / 0.1 : p > 0.9 ? Math.max(0, (1 - p) / 0.1) : 1;
    ctx.fillStyle = `rgba(22,10,2,${0.6 * dimK})`;
    ctx.fillRect(camX - 700, -350, VIEW_W + 1400, VIEW_H + 700);

    // stickman con el brazo extendido hacia el monstruo (retrocede un poco al disparar)
    const recoil = 3.2 * Math.sin(Math.PI * seg01(p, 0.32, 0.56));
    s.faseArm = tl.arm;
    s.armDir = { x: dx, y: dy };
    s.armColor = "#FFB03B";
    ctx.save();
    ctx.translate(-dx * recoil, -dy * recoil * 0.5);
    drawPlayerBody(ctx, s, abilityId);
    ctx.restore();
    s.faseArm = 0;
    s.armDir = null;
    s.armColor = null;

    const reach = 19 * tl.arm;
    const hx0 = px + dx * reach - dx * recoil, hy0 = shY + dy * reach - 2 * tl.arm - dy * recoil * 0.5;
    const ox = hx0 + dx * 4, oy = hy0 + dy * 4; // origen del rayo, justo delante de la mano

    // monstruo: mira al stickman y tiembla con el impacto
    const shakeA = seg01(p, 0.5, 0.56) * (1 - seg01(p, 0.8, 0.9)) * 2.4;
    const shx = Math.sin(clock * 95) * shakeA, shy = Math.cos(clock * 83) * shakeA * 0.8;
    drawMonsterBody(ctx, s, abilityId, {
      x: mx + shx, y: my + shy, facingAngle: Math.atan2(-dy, -dx),
      stunned: s.stunT > 0, dancing: s.danceT > 0, alpha: 1, seed: 0, echo: false,
    });

    // chispas que convergen en la mano mientras carga
    const orbA = tl.arm * (1 - smooth01(seg01(p, 0.8, 0.92)));
    const orbR = 2 + (sup ? 17 : 12) * tl.charge * (1 - 0.25 * tl.beam);
    if (tl.arm > 0.2 && tl.beam < 0.99) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 10; i++) {
        const ph = (clock * 1.7 + i * 0.1) % 1;
        const ang = i * 2.399 + clock * 3;
        const d1 = (34 + 6 * (i % 3)) * (1 - ph) + orbR;
        ctx.strokeStyle = `rgba(255,190,80,${orbA * (0.3 + 0.7 * ph) * (1 - tl.beam)})`;
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(ang) * d1, oy + Math.sin(ang) * d1);
        ctx.lineTo(ox + Math.cos(ang) * (d1 + 7), oy + Math.sin(ang) * (d1 + 7));
        ctx.stroke();
      }
      ctx.restore();
    }

    // el gran rayo
    if (tl.beam > 0.01) {
      const tx = mx + shx * 0.3, ty = my + shy * 0.3;
      const bx = ox + (tx - ox) * tl.head, by = oy + (ty - oy) * tl.head;
      const W = (sup ? 13 : 9) * (1 - 0.35 * tl.drain) * (1 + 0.08 * Math.sin(clock * 45)) * (0.5 + 0.5 * seg01(p, 0.32, 0.42));
      drawLadronBeam(ctx, ox, oy, bx, by, W, clock, tl.beam);
    }
    if (tl.head > 0.98) drawLadronImpact(ctx, mx, my, tl.hit, tl.beam, sup, clock);

    // orbe de energía en la mano
    if (tl.arm > 0.2 && orbA > 0.01) {
      const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, orbR * 1.8);
      og.addColorStop(0, `rgba(255,252,235,${orbA})`);
      og.addColorStop(0.35, `rgba(255,200,80,${orbA * 0.9})`);
      og.addColorStop(1, "rgba(255,110,20,0)");
      ctx.fillStyle = og;
      ctx.beginPath(); ctx.arc(ox, oy, orbR * 1.8, 0, Math.PI * 2); ctx.fill();
    }

    // la vida robada viaja por el rayo de vuelta al stickman
    if (tl.drain > 0.001) {
      const nxv = -dy, nyv = dx;
      const moteA = smooth01(seg01(p, 0.56, 0.62)) * (1 - smooth01(seg01(p, 0.84, 0.9)));
      for (let i = 0; i < 16; i++) {
        const m = (clock * 1.4 + i / 16) % 1;
        const wob = Math.sin(m * 12 + i) * 4;
        ctx.fillStyle = `rgba(255,${170 + (i % 3) * 30},70,${0.85 * moteA})`;
        ctx.beginPath();
        ctx.arc(mx + (ox - mx) * m + nxv * wob, my + (oy - my) * m + nyv * wob, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      const nH = sup ? 5 : 1;
      const span = 1 - (nH - 1) * 0.12;
      for (let j = 0; j < nH; j++) {
        const u = Math.max(0, Math.min(1, (tl.drain - j * 0.12) / span));
        if (u <= 0 || u >= 1) continue;
        const e = u * u * (3 - 2 * u);
        const wob = Math.sin(u * Math.PI * 3 + j * 1.3) * 5;
        const hx = mx + (ox - mx) * e + nxv * wob, hy = my + (oy - my) * e + nyv * wob;
        const size = (sup ? 6.5 : 10) * (0.45 + 0.55 * Math.min(1, u * 4)) * (1 - 0.45 * seg01(u, 0.85, 1));
        ctx.fillStyle = "rgba(255,170,60,0.35)";
        ctx.beginPath(); ctx.arc(hx, hy, size * 2.2, 0, Math.PI * 2); ctx.fill();
        drawHeartShape(ctx, hx, hy, size);
        ctx.fillStyle = "#FF5A36";
        ctx.fill();
        ctx.strokeStyle = "#FFF3D0";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    // la vida llega al stickman
    if (tl.land > 0 && tl.land < 1) {
      const lx = px, ly = py - 3;
      const gl = ctx.createRadialGradient(lx, ly, 2, lx, ly, 34);
      gl.addColorStop(0, `rgba(255,236,170,${0.7 * (1 - tl.land)})`);
      gl.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(lx, ly, 34, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,190,70,${0.9 * (1 - tl.land)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(lx, ly, 10 + 34 * tl.land, 0, Math.PI * 2); ctx.stroke();
      const ta = smooth01(seg01(tl.land, 0, 0.25)) * (1 - seg01(tl.land, 0.75, 1));
      const label = fx.gain > 0 ? `+${fx.gain} ♥` : "♥ MAX";
      const ty = py < 50 ? py + 34 + 12 * tl.land : py - 26 - 12 * tl.land;
      ctx.save();
      ctx.globalAlpha = ta;
      ctx.font = "bold 15px 'Kalam', cursive";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(120,40,0,0.9)";
      ctx.strokeText(label, lx, ty);
      ctx.fillStyle = "#FFE7A8";
      ctx.fillText(label, lx, ty);
      ctx.restore();
    }
  }

  // Dibuja el cuerpo (cualquier personaje) con transparencia usando un canvas auxiliar
  function drawPlayerFaded(ctx, s, abilityId, alpha) {
    if (alpha <= 0.01) return;
    if (!_rachaOff) {
      _rachaOff = document.createElement("canvas");
      _rachaOff.width = 240;
      _rachaOff.height = 240;
    }
    const octx = _rachaOff.getContext("2d");
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, 240, 240);
    octx.translate(120 - s.player.x, 120 - s.player.y);
    drawPlayerBody(octx, s, abilityId);
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(_rachaOff, s.player.x - 120, s.player.y - 120);
    ctx.restore();
  }

  // Con la bola de fuego de Brasa encendida el stickman se ve cada vez menos: dentro del fuego no se ve y,
  // cuando el fuego se suaviza y se disipa, reaparece.
  function drawPlayer(ctx, s, abilityId) {
    const ball = brasaBallState(s);
    if (!ball) { drawPlayerNoFire(ctx, s, abilityId); return; }
    const rachaOn = s.rachaChargeT > 0 || s.dashT > 0 || s.rachaReveal > 0 || !!(s.rachaTrail && s.rachaTrail.length > 1);
    if (rachaOn) drawPlayerNoFire(ctx, s, abilityId);
    else if (ball.cover < 0.02) drawPlayerBody(ctx, s, abilityId);
    else drawPlayerFaded(ctx, s, abilityId, 1 - ball.cover);
    drawBrasaBall(ctx, s.player.x, s.player.y, s.rachaClock || 0, ball);
  }

  function drawPlayerNoFire(ctx, s, abilityId) {
    const charging = s.rachaChargeT > 0;
    const dashing = s.dashT > 0;
    const revealing = s.rachaReveal > 0;
    const hasTrail = !!(s.rachaTrail && s.rachaTrail.length > 1);
    if (!charging && !dashing && !revealing && !hasTrail) {
      drawPlayerBody(ctx, s, abilityId);
      return;
    }
    const { x, y } = s.player;
    drawRachaTrail(ctx, s);
    if (charging) {
      // brilla en azul hasta que el cuerpo desaparece y solo queda la energía
      const p = 1 - s.rachaChargeT / RACHA_CHARGE_T;
      const glow = Math.min(1, p / 0.8);
      drawRachaHalo(ctx, s, x, y, glow, true, p);
      drawPlayerFaded(ctx, s, abilityId, 1 - Math.min(1, Math.max(0, (glow - 0.15) / 0.8)));
      drawRachaCore(ctx, s, x, y, glow);
    } else if (dashing) {
      // súper velocidad: solo se ve la energía azul
      drawRachaHalo(ctx, s, x, y, 1, false, 1);
      drawRachaCore(ctx, s, x, y, 1);
    } else if (revealing) {
      // la energía se disipa y el stickman reaparece
      const q = s.rachaReveal / RACHA_REVEAL_T;
      drawRachaHalo(ctx, s, x, y, q, false, 1);
      drawPlayerFaded(ctx, s, abilityId, 1 - q);
      drawRachaCore(ctx, s, x, y, q * 0.8);
      ctx.save();
      ctx.strokeStyle = `rgba(63,140,255,${q * 0.8})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y - 2, 14 + (1 - q) * 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      drawPlayerBody(ctx, s, abilityId);
    }
  }

  function drawPlayerBodyRaw(ctx, s, abilityId) {
    const { x, y } = s.player;
    const bodyColor = s.playerColor || "#2B2A28";
    const stealthActive = false;

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
    } else if (s.brasaArms && s.brasaArms.k > 0) {
      // súper Brasa: los dos brazos se extienden hacia las paredes, con las palmas abiertas
      const ba = s.brasaArms, kk = ba.k;
      const shY = hipY - 7;
      const reach = 20 * kk;
      const hands = [];
      [ba.a, ba.b].forEach((d) => {
        const hx = x + d.x * reach, hy = shY + d.y * reach - 1.5 * kk;
        const ex = x + d.x * reach * 0.5 - d.y * 1.8 * (1 - 0.6 * kk), ey = shY + d.y * reach * 0.5 + d.x * 1.8 * (1 - 0.6 * kk);
        ctx.moveTo(x, shY);
        ctx.lineTo(ex, ey);
        ctx.lineTo(hx, hy);
        hands.push([hx, hy, d]);
      });
      lHandX = hands[0][0]; lHandY = hands[0][1];
      rHandX = hands[1][0]; rHandY = hands[1][1];
      ctx.stroke();
      // dedos abiertos en abanico hacia la pared
      ctx.lineWidth = 1.3;
      hands.forEach(([hx, hy, d]) => {
        const ha = Math.atan2(d.y, d.x);
        [-0.55, -0.18, 0.18, 0.55].forEach((off) => {
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + Math.cos(ha + off) * 4.6 * kk, hy + Math.sin(ha + off) * 4.6 * kk);
          ctx.stroke();
        });
      });
      ctx.lineWidth = 2.4;
      ctx.beginPath();
    } else if (s.faseArm > 0) {
      // Fase: un brazo cuelga y el otro se extiende hacia el portal con la mano abierta
      const fa = s.faseArm;
      const fdx = s.armDir ? s.armDir.x : s.faseFx ? s.faseFx.dx : s.facing.x, fdy = s.armDir ? s.armDir.y : s.faseFx ? s.faseFx.dy : s.facing.y;
      const side = fdx >= 0 ? 1 : -1;
      const shY = hipY - 7;
      const reach = 19 * fa;
      const rhx = x + fdx * reach, rhy = shY + fdy * reach - 2 * fa;
      const rex = x + fdx * reach * 0.5 - fdy * 2.4 * (1 - 0.6 * fa), rey = shY + fdy * reach * 0.5 + fdx * 2.4 * (1 - 0.6 * fa) - fa;
      const idleX = x - side * 6.5, idleY = hipY;
      if (side > 0) { lHandX = idleX; lHandY = idleY; rHandX = rhx; rHandY = rhy; }
      else { rHandX = idleX; rHandY = idleY; lHandX = rhx; lHandY = rhy; }
      ctx.moveTo(x, shY);
      ctx.lineTo(idleX, idleY);
      ctx.moveTo(x, shY);
      ctx.lineTo(rex, rey);
      ctx.lineTo(rhx, rhy);
      ctx.stroke();
      // mano abierta, dedos abiertos en abanico hacia el portal
      const ha = Math.atan2(fdy, fdx);
      ctx.strokeStyle = s.armColor || ABILITIES.fase.accent;
      ctx.lineWidth = 1.3;
      [-0.55, -0.18, 0.18, 0.55].forEach((off) => {
        ctx.beginPath();
        ctx.moveTo(rhx, rhy);
        ctx.lineTo(rhx + Math.cos(ha + off) * 4.6 * fa, rhy + Math.sin(ha + off) * 4.6 * fa);
        ctx.stroke();
      });
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
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

    if (abilityId === "fase" && !victory && !(s.faseArm > 0)) {
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
      className="w-full flex flex-col items-center py-4 px-3 game-root"
      style={{
        background: "#F4F1E9",
        fontFamily: "'Patrick Hand', cursive",
        minHeight: "100vh",
        touchAction: "pan-y",
        userSelect: "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Kalam:wght@400;700&display=swap');
        .marker{font-family:'Kalam',cursive;}
      `}</style>

      <h1 className="marker text-2xl sm:text-3xl mb-0.5" style={{ color: "#2B2A28" }}>La persecución</h1>
      <p className="text-xs sm:text-sm mb-3 text-center" style={{ color: "#5B5850" }}>
        Desliza el joystick para moverte · Toca el botón para tu habilidad
      </p>

      {hud.status === "menu" && (
        <div
          className="mb-4 p-4 rounded-lg border-2 w-full max-w-md"
          style={{ borderColor: "#2B2A28", background: "#FBFAF5" }}
        >
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

      {ability === "luz" && (
        <g stroke="#FFE066" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <circle cx="150" cy="120" r="10" fill="#FFF6D8" stroke="none">
            <animate attributeName="r" values="8;12;8" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <path d="M60 60 L120 108 M60 180 L120 132 M40 120 L118 120" strokeWidth="3">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.6s" repeatCount="indefinite" />
          </path>
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

      {ability === "metal" && (
        <g>
          <circle cx="110" cy="146" r="26" fill="none" stroke="#F0F5FA" strokeWidth="2" opacity="0.8">
            <animate attributeName="stroke-dasharray" values="0 165;165 165" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
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
        opacity={1}
      >
        <circle cx="110" cy="55" r="26" fill={color} stroke="none" />
        <line x1="110" y1="81" x2="110" y2="190" />
        <line x1="110" y1="115" x2="70" y2="150" />
        <line x1="110" y1="115" x2="150" y2="150" />
        <line x1="110" y1="190" x2="75" y2="260" />
        <line x1="110" y1="190" x2="145" y2="260" />
      </g>

      {ability === "muerte" && (
        <g>
          <circle cx="110" cy="140" r="70" fill="none" stroke="#7B1FA2" strokeWidth="3" opacity="0.6">
            <animate attributeName="r" values="55;75;55" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.25;0.7" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <path d="M150 130 L172 130 A18 18 0 1 1 158 112" fill="none" stroke="#C77DFF" strokeWidth="4" strokeLinecap="round" />
        </g>
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
