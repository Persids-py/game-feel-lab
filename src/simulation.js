export const controlKeys = [
  "runSpeed",
  "acceleration",
  "friction",
  "jumpVelocity",
  "gravity",
  "coyoteTime",
  "jumpBuffer",
  "dashForce",
  "hitStop",
  "shake",
];

export const presets = {
  balanced: {
    runSpeed: 420,
    acceleration: 2600,
    friction: 3200,
    jumpVelocity: 720,
    gravity: 1850,
    coyoteTime: 90,
    jumpBuffer: 100,
    dashForce: 620,
    hitStop: 70,
    shake: 8,
  },
  floaty: {
    runSpeed: 360,
    acceleration: 1800,
    friction: 1800,
    jumpVelocity: 760,
    gravity: 1250,
    coyoteTime: 140,
    jumpBuffer: 140,
    dashForce: 480,
    hitStop: 90,
    shake: 5,
  },
  snappy: {
    runSpeed: 560,
    acceleration: 4200,
    friction: 5000,
    jumpVelocity: 840,
    gravity: 2600,
    coyoteTime: 60,
    jumpBuffer: 70,
    dashForce: 860,
    hitStop: 45,
    shake: 13,
  },
  heavy: {
    runSpeed: 310,
    acceleration: 1450,
    friction: 2200,
    jumpVelocity: 660,
    gravity: 2300,
    coyoteTime: 80,
    jumpBuffer: 90,
    dashForce: 390,
    hitStop: 120,
    shake: 15,
  },
  speedrun: {
    runSpeed: 690,
    acceleration: 5000,
    friction: 5600,
    jumpVelocity: 900,
    gravity: 2850,
    coyoteTime: 110,
    jumpBuffer: 120,
    dashForce: 1040,
    hitStop: 25,
    shake: 7,
  },
  moon: {
    runSpeed: 300,
    acceleration: 1200,
    friction: 950,
    jumpVelocity: 720,
    gravity: 900,
    coyoteTime: 170,
    jumpBuffer: 160,
    dashForce: 520,
    hitStop: 35,
    shake: 4,
  },
};

export const controlRanges = {
  runSpeed: { min: 180, max: 720, step: 10 },
  acceleration: { min: 600, max: 5000, step: 100 },
  friction: { min: 400, max: 6000, step: 100 },
  jumpVelocity: { min: 420, max: 1100, step: 10 },
  gravity: { min: 900, max: 3200, step: 50 },
  coyoteTime: { min: 0, max: 180, step: 10 },
  jumpBuffer: { min: 0, max: 180, step: 10 },
  dashForce: { min: 250, max: 1100, step: 10 },
  hitStop: { min: 0, max: 180, step: 10 },
  shake: { min: 0, max: 20, step: 1 },
};

export function createPlayer() {
  return {
    x: 170,
    y: 378,
    vx: 0,
    vy: 0,
    width: 34,
    height: 48,
    facing: 1,
    grounded: true,
    coyote: 0,
    jumpQueued: 0,
    dashCooldown: 0,
    hitStop: 0,
    shakeTime: 0,
    dashStartX: 170,
    dashDistance: 0,
    maxJumpY: 378,
    lastAirTime: 0,
    airTimer: 0,
  };
}

export function stepPlayer(player, input, config, dt, world) {
  if (player.hitStop > 0) {
    player.hitStop = Math.max(0, player.hitStop - dt * 1000);
    player.shakeTime = Math.max(0, player.shakeTime - dt * 1000);
    return;
  }

  const groundY = world.groundY - player.height;
  player.coyote = player.grounded ? config.coyoteTime / 1000 : Math.max(0, player.coyote - dt);
  player.jumpQueued = input.jumpPressed ? config.jumpBuffer / 1000 : Math.max(0, player.jumpQueued - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.shakeTime = Math.max(0, player.shakeTime - dt * 1000);

  const axis = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (axis !== 0) {
    player.facing = axis;
    player.vx = approach(player.vx, axis * config.runSpeed, config.acceleration * dt);
  } else {
    player.vx = approach(player.vx, 0, config.friction * dt);
  }

  if (player.jumpQueued > 0 && player.coyote > 0) {
    player.vy = -config.jumpVelocity;
    player.grounded = false;
    player.coyote = 0;
    player.jumpQueued = 0;
    player.maxJumpY = player.y;
    player.airTimer = 0;
  }

  if (input.dashPressed && player.dashCooldown <= 0) {
    player.vx = player.facing * config.dashForce;
    player.vy *= 0.35;
    player.dashCooldown = 0.42;
    player.dashStartX = player.x;
  }

  if (input.hitPressed) {
    player.hitStop = config.hitStop;
    player.shakeTime = config.hitStop;
  }

  player.vy += config.gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.x = clamp(player.x, 24, world.width - player.width - 24);

  if (!player.grounded) {
    player.airTimer += dt;
    player.maxJumpY = Math.min(player.maxJumpY, player.y);
  }

  if (player.y >= groundY) {
    if (!player.grounded) {
      player.lastAirTime = player.airTimer;
    }
    player.y = groundY;
    player.vy = 0;
    player.grounded = true;
    player.airTimer = 0;
  } else {
    player.grounded = false;
  }

  player.dashDistance = Math.max(player.dashDistance, Math.abs(player.x - player.dashStartX));
}

export function estimateJump(config, groundY = 378) {
  const dt = 1 / 120;
  let y = groundY;
  let vy = -config.jumpVelocity;
  let apex = y;
  let time = 0;
  const points = [];

  while (time < 2.5) {
    vy += config.gravity * dt;
    y += vy * dt;
    time += dt;
    apex = Math.min(apex, y);
    points.push({ x: time, y });
    if (y >= groundY && time > 0.05) break;
  }

  return {
    apexHeight: Math.max(0, groundY - apex),
    airTime: time,
    points,
  };
}

export function feelScore(config) {
  const jump = estimateJump(config);
  const speedScore = normalize(config.runSpeed, 180, 720) * 28;
  const controlScore = normalize(config.acceleration + config.friction, 1000, 10000) * 30;
  const airScore = normalize(jump.apexHeight, 80, 240) * 24;
  const impactScore = normalize(config.hitStop + config.shake * 8, 0, 300) * 18;
  return Math.round(speedScore + controlScore + airScore + impactScore);
}

export function exportConfig(config) {
  const normalized = normalizeConfig(config);
  return {
    name: "custom-feel-profile",
    units: {
      distance: "pixels",
      time: "milliseconds",
    },
    movement: {
      runSpeed: normalized.runSpeed,
      acceleration: normalized.acceleration,
      friction: normalized.friction,
    },
    air: {
      jumpVelocity: normalized.jumpVelocity,
      gravity: normalized.gravity,
      coyoteTime: normalized.coyoteTime,
      jumpBuffer: normalized.jumpBuffer,
    },
    impact: {
      dashForce: normalized.dashForce,
      hitStop: normalized.hitStop,
      shake: normalized.shake,
    },
  };
}

export function normalizeConfig(input) {
  const merged = {
    ...presets.balanced,
    ...flattenConfig(input),
  };

  const normalized = {};
  for (const key of controlKeys) {
    const range = controlRanges[key];
    const numeric = Number.isFinite(Number(merged[key])) ? Number(merged[key]) : presets.balanced[key];
    const stepped = Math.round(numeric / range.step) * range.step;
    normalized[key] = clamp(stepped, range.min, range.max);
  }
  return normalized;
}

export function flattenConfig(input) {
  if (!input || typeof input !== "object") return {};
  return {
    ...pickControls(input),
    ...pickControls(input.movement),
    ...pickControls(input.air),
    ...pickControls(input.impact),
    ...pickControls(input.combatFeel),
  };
}

export function parseImportedConfig(text) {
  const parsed = JSON.parse(text);
  return normalizeConfig(parsed);
}

export function encodeProfile(config) {
  const normalized = normalizeConfig(config);
  const params = new URLSearchParams();
  for (const [shortKey, key] of Object.entries(profileParamKeys)) {
    params.set(shortKey, String(normalized[key]));
  }
  return params.toString();
}

export function decodeProfile(value) {
  const params = value instanceof URLSearchParams ? value : new URLSearchParams(value);
  const flat = {};
  for (const [shortKey, key] of Object.entries(profileParamKeys)) {
    if (params.has(shortKey)) {
      flat[key] = Number(params.get(shortKey));
    }
  }
  return Object.keys(flat).length ? normalizeConfig(flat) : null;
}

export function compareProfiles(left, right) {
  const leftConfig = normalizeConfig(left);
  const rightConfig = normalizeConfig(right);
  const leftJump = estimateJump(leftConfig);
  const rightJump = estimateJump(rightConfig);
  return {
    apexHeight: Math.round(rightJump.apexHeight - leftJump.apexHeight),
    airTime: Math.round((rightJump.airTime - leftJump.airTime) * 1000),
    dashReach: Math.round(rightConfig.dashForce * 0.42 - leftConfig.dashForce * 0.42),
    feelScore: feelScore(rightConfig) - feelScore(leftConfig),
  };
}

export function renderEngineSnippet(config, engine) {
  const exported = exportConfig(config);
  if (engine === "unity") {
    return [
      "var feel = new GameFeelProfile {",
      `    RunSpeed = ${exported.movement.runSpeed}f,`,
      `    Acceleration = ${exported.movement.acceleration}f,`,
      `    Friction = ${exported.movement.friction}f,`,
      `    JumpVelocity = ${exported.air.jumpVelocity}f,`,
      `    Gravity = ${exported.air.gravity}f,`,
      `    CoyoteTimeMs = ${exported.air.coyoteTime},`,
      `    JumpBufferMs = ${exported.air.jumpBuffer},`,
      `    DashForce = ${exported.impact.dashForce}f,`,
      `    HitStopMs = ${exported.impact.hitStop},`,
      `    ShakePixels = ${exported.impact.shake}`,
      "};",
    ].join("\n");
  }

  if (engine === "godot") {
    return [
      "extends Resource",
      "class_name GameFeelProfile",
      "",
      `@export var run_speed := ${exported.movement.runSpeed}.0`,
      `@export var acceleration := ${exported.movement.acceleration}.0`,
      `@export var friction := ${exported.movement.friction}.0`,
      `@export var jump_velocity := ${exported.air.jumpVelocity}.0`,
      `@export var gravity := ${exported.air.gravity}.0`,
      `@export var coyote_time_ms := ${exported.air.coyoteTime}`,
      `@export var jump_buffer_ms := ${exported.air.jumpBuffer}`,
      `@export var dash_force := ${exported.impact.dashForce}.0`,
      `@export var hit_stop_ms := ${exported.impact.hitStop}`,
      `@export var shake_pixels := ${exported.impact.shake}`,
    ].join("\n");
  }

  return JSON.stringify(exported, null, 2);
}

function approach(value, target, amount) {
  if (value < target) return Math.min(value + amount, target);
  if (value > target) return Math.max(value - amount, target);
  return target;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  return clamp((value - min) / (max - min), 0, 1);
}

function pickControls(input) {
  if (!input || typeof input !== "object") return {};
  const picked = {};
  for (const key of controlKeys) {
    if (Object.hasOwn(input, key)) {
      picked[key] = input[key];
    }
  }
  return picked;
}

const profileParamKeys = {
  rs: "runSpeed",
  ac: "acceleration",
  fr: "friction",
  jv: "jumpVelocity",
  gr: "gravity",
  ct: "coyoteTime",
  jb: "jumpBuffer",
  df: "dashForce",
  hs: "hitStop",
  sh: "shake",
};
