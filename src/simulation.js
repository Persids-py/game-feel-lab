export const controlKeys = [
  "runSpeed",
  "acceleration",
  "friction",
  "turnAcceleration",
  "jumpVelocity",
  "gravity",
  "jumpCutMultiplier",
  "fallGravityMultiplier",
  "maxFallSpeed",
  "airControl",
  "coyoteTime",
  "jumpBuffer",
  "dashForce",
  "dashDuration",
  "dashCooldown",
  "airDashCount",
  "hitStop",
  "shake",
  "landingImpact",
];

export const presets = {
  balanced: {
    runSpeed: 420,
    acceleration: 2600,
    friction: 3200,
    turnAcceleration: 4200,
    jumpVelocity: 720,
    gravity: 1850,
    jumpCutMultiplier: 2.2,
    fallGravityMultiplier: 1.65,
    maxFallSpeed: 980,
    airControl: 0.72,
    coyoteTime: 90,
    jumpBuffer: 100,
    dashForce: 620,
    dashDuration: 150,
    dashCooldown: 420,
    airDashCount: 1,
    hitStop: 70,
    shake: 8,
    landingImpact: 7,
  },
  floaty: {
    runSpeed: 360,
    acceleration: 1800,
    friction: 1800,
    turnAcceleration: 2600,
    jumpVelocity: 760,
    gravity: 1250,
    jumpCutMultiplier: 1.55,
    fallGravityMultiplier: 1.18,
    maxFallSpeed: 760,
    airControl: 0.88,
    coyoteTime: 140,
    jumpBuffer: 140,
    dashForce: 480,
    dashDuration: 220,
    dashCooldown: 520,
    airDashCount: 1,
    hitStop: 90,
    shake: 5,
    landingImpact: 4,
  },
  snappy: {
    runSpeed: 560,
    acceleration: 4200,
    friction: 5000,
    turnAcceleration: 6400,
    jumpVelocity: 840,
    gravity: 2600,
    jumpCutMultiplier: 3.1,
    fallGravityMultiplier: 2.35,
    maxFallSpeed: 1350,
    airControl: 0.62,
    coyoteTime: 60,
    jumpBuffer: 70,
    dashForce: 860,
    dashDuration: 120,
    dashCooldown: 330,
    airDashCount: 1,
    hitStop: 45,
    shake: 13,
    landingImpact: 9,
  },
  heavy: {
    runSpeed: 310,
    acceleration: 1450,
    friction: 2200,
    turnAcceleration: 2300,
    jumpVelocity: 660,
    gravity: 2300,
    jumpCutMultiplier: 2.5,
    fallGravityMultiplier: 2.15,
    maxFallSpeed: 1500,
    airControl: 0.38,
    coyoteTime: 80,
    jumpBuffer: 90,
    dashForce: 390,
    dashDuration: 180,
    dashCooldown: 620,
    airDashCount: 0,
    hitStop: 120,
    shake: 15,
    landingImpact: 16,
  },
  speedrun: {
    runSpeed: 690,
    acceleration: 5000,
    friction: 5600,
    turnAcceleration: 7000,
    jumpVelocity: 900,
    gravity: 2850,
    jumpCutMultiplier: 2.8,
    fallGravityMultiplier: 2,
    maxFallSpeed: 1600,
    airControl: 0.76,
    coyoteTime: 110,
    jumpBuffer: 120,
    dashForce: 1040,
    dashDuration: 130,
    dashCooldown: 250,
    airDashCount: 2,
    hitStop: 25,
    shake: 7,
    landingImpact: 6,
  },
  moon: {
    runSpeed: 300,
    acceleration: 1200,
    friction: 950,
    turnAcceleration: 1600,
    jumpVelocity: 720,
    gravity: 900,
    jumpCutMultiplier: 1.25,
    fallGravityMultiplier: 1.05,
    maxFallSpeed: 620,
    airControl: 1,
    coyoteTime: 170,
    jumpBuffer: 160,
    dashForce: 520,
    dashDuration: 260,
    dashCooldown: 580,
    airDashCount: 2,
    hitStop: 35,
    shake: 4,
    landingImpact: 2,
  },
};

export const controlRanges = {
  runSpeed: { min: 180, max: 720, step: 10 },
  acceleration: { min: 600, max: 5000, step: 100 },
  friction: { min: 400, max: 6000, step: 100 },
  turnAcceleration: { min: 1000, max: 7000, step: 100 },
  jumpVelocity: { min: 420, max: 1100, step: 10 },
  gravity: { min: 900, max: 3200, step: 50 },
  jumpCutMultiplier: { min: 1, max: 4, step: 0.05 },
  fallGravityMultiplier: { min: 1, max: 4, step: 0.05 },
  maxFallSpeed: { min: 500, max: 1800, step: 25 },
  airControl: { min: 0.15, max: 1, step: 0.05 },
  coyoteTime: { min: 0, max: 180, step: 10 },
  jumpBuffer: { min: 0, max: 180, step: 10 },
  dashForce: { min: 250, max: 1100, step: 10 },
  dashDuration: { min: 60, max: 360, step: 10 },
  dashCooldown: { min: 150, max: 1000, step: 10 },
  airDashCount: { min: 0, max: 3, step: 1 },
  hitStop: { min: 0, max: 180, step: 10 },
  shake: { min: 0, max: 20, step: 1 },
  landingImpact: { min: 0, max: 20, step: 1 },
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
    dashRemaining: 0,
    dashDirection: 1,
    airDashesUsed: 0,
    hitStop: 0,
    shakeTime: 0,
    landingPulse: 0,
    dashStartX: 170,
    dashDistance: 0,
    maxJumpY: 378,
    lastAirTime: 0,
    airTimer: 0,
  };
}

export function stepPlayer(player, input, configInput, dt, world) {
  const config = normalizeConfig(configInput);

  if (player.hitStop > 0) {
    player.hitStop = Math.max(0, player.hitStop - dt * 1000);
    player.shakeTime = Math.max(0, player.shakeTime - dt * 1000);
    player.landingPulse = Math.max(0, player.landingPulse - dt * 1000);
    return;
  }

  const groundY = world.groundY - player.height;
  player.coyote = player.grounded ? config.coyoteTime / 1000 : Math.max(0, player.coyote - dt);
  player.jumpQueued = input.jumpPressed ? config.jumpBuffer / 1000 : Math.max(0, player.jumpQueued - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.dashRemaining = Math.max(0, player.dashRemaining - dt);
  player.shakeTime = Math.max(0, player.shakeTime - dt * 1000);
  player.landingPulse = Math.max(0, player.landingPulse - dt * 1000);

  const axis = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (player.dashRemaining <= 0) {
    applyHorizontalMovement(player, config, axis, dt);
  }

  if (player.jumpQueued > 0 && player.coyote > 0) {
    player.vy = -config.jumpVelocity;
    player.grounded = false;
    player.coyote = 0;
    player.jumpQueued = 0;
    player.maxJumpY = player.y;
    player.airTimer = 0;
  }

  if (input.dashPressed && player.dashCooldown <= 0 && canDash(player, config)) {
    if (!player.grounded) {
      player.airDashesUsed += 1;
    }
    player.dashDirection = axis || player.facing || 1;
    player.facing = player.dashDirection;
    player.vx = player.dashDirection * config.dashForce;
    player.vy *= 0.25;
    player.dashRemaining = config.dashDuration / 1000;
    player.dashCooldown = config.dashCooldown / 1000;
    player.dashStartX = player.x;
  }

  if (input.hitPressed) {
    player.hitStop = config.hitStop;
    player.shakeTime = config.hitStop;
  }

  if (player.dashRemaining > 0) {
    player.vx = player.dashDirection * config.dashForce;
  } else {
    const gravity = gravityForState(player, input, config);
    player.vy = Math.min(player.vy + gravity * dt, config.maxFallSpeed);
  }

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
      player.shakeTime = Math.max(player.shakeTime, config.landingImpact * 6);
      player.landingPulse = config.landingImpact * 10;
    }
    player.y = groundY;
    player.vy = 0;
    player.grounded = true;
    player.airTimer = 0;
    player.airDashesUsed = 0;
  } else {
    player.grounded = false;
  }

  player.dashDistance = Math.max(player.dashDistance, Math.abs(player.x - player.dashStartX));
}

export function estimateJump(configInput, groundY = 378, options = {}) {
  const config = normalizeConfig(configInput);
  const dt = 1 / 120;
  const jumpHoldTime = options.jumpHoldTime ?? 10;
  let y = groundY;
  let vy = -config.jumpVelocity;
  let apex = y;
  let time = 0;
  const points = [];

  while (time < 2.5) {
    const jumpHeld = time < jumpHoldTime;
    const gravity =
      vy < 0 && !jumpHeld
        ? config.gravity * config.jumpCutMultiplier
        : vy > 0
          ? config.gravity * config.fallGravityMultiplier
          : config.gravity;
    vy = Math.min(vy + gravity * dt, config.maxFallSpeed);
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

export function intensityScore(configInput) {
  const config = normalizeConfig(configInput);
  const jump = estimateJump(config);
  const speedScore = normalize(config.runSpeed + config.dashForce * 0.35, 250, 1120) * 32;
  const impactScore = normalize(config.hitStop + config.shake * 8 + config.landingImpact * 5, 0, 400) * 30;
  const snapScore =
    normalize(config.acceleration + config.friction + config.turnAcceleration, 2000, 18000) * 22;
  const airScore = normalize(jump.apexHeight, 80, 260) * 16;
  return Math.round(speedScore + impactScore + snapScore + airScore);
}

export function feelScore(config) {
  return intensityScore(config);
}

export function feelProfileMetrics(configInput) {
  const config = normalizeConfig(configInput);
  const jump = estimateJump(config);
  return {
    speed: Math.round(normalize(config.runSpeed + config.dashForce * 0.35, 240, 1100) * 100),
    precision: Math.round(
      normalize(config.acceleration + config.friction + config.turnAcceleration, 2500, 18500) *
        normalize(config.airControl, 0.15, 1) *
        100,
    ),
    float: Math.round(
      (normalize(jump.airTime, 0.35, 1.35) * 0.72 +
        normalize(1 / config.fallGravityMultiplier, 0.25, 1) * 0.28) *
        100,
    ),
    impact: Math.round(normalize(config.hitStop + config.shake * 8 + config.landingImpact * 6, 0, 420) * 100),
    accessibility: Math.round(
      (normalize(config.coyoteTime, 0, 180) * 0.35 +
        normalize(config.jumpBuffer, 0, 180) * 0.35 +
        normalize(config.maxFallSpeed, 1800, 500) * 0.3) *
        100,
    ),
  };
}

export function exportConfig(configInput) {
  const normalized = normalizeConfig(configInput);
  return {
    schemaVersion: "1.1",
    profileName: "custom-feel-profile",
    units: {
      distance: "pixels",
      time: "milliseconds",
    },
    movement: {
      runSpeed: normalized.runSpeed,
      acceleration: normalized.acceleration,
      friction: normalized.friction,
      turnAcceleration: normalized.turnAcceleration,
    },
    air: {
      jumpVelocity: normalized.jumpVelocity,
      gravity: normalized.gravity,
      jumpCutMultiplier: normalized.jumpCutMultiplier,
      fallGravityMultiplier: normalized.fallGravityMultiplier,
      maxFallSpeed: normalized.maxFallSpeed,
      airControl: normalized.airControl,
      coyoteTime: normalized.coyoteTime,
      jumpBuffer: normalized.jumpBuffer,
    },
    impact: {
      dashForce: normalized.dashForce,
      dashDuration: normalized.dashDuration,
      dashCooldown: normalized.dashCooldown,
      airDashCount: normalized.airDashCount,
      hitStop: normalized.hitStop,
      shake: normalized.shake,
      landingImpact: normalized.landingImpact,
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
    dashReach: Math.round(
      rightConfig.dashForce * (rightConfig.dashDuration / 1000) -
        leftConfig.dashForce * (leftConfig.dashDuration / 1000),
    ),
    intensity: intensityScore(rightConfig) - intensityScore(leftConfig),
  };
}

export function renderEngineSnippet(configInput, engine) {
  const exported = exportConfig(configInput);
  if (engine === "unity") {
    return [
      "var feel = new GameFeelProfile {",
      `    RunSpeed = ${exported.movement.runSpeed}f,`,
      `    Acceleration = ${exported.movement.acceleration}f,`,
      `    Friction = ${exported.movement.friction}f,`,
      `    TurnAcceleration = ${exported.movement.turnAcceleration}f,`,
      `    JumpVelocity = ${exported.air.jumpVelocity}f,`,
      `    Gravity = ${exported.air.gravity}f,`,
      `    JumpCutMultiplier = ${exported.air.jumpCutMultiplier}f,`,
      `    FallGravityMultiplier = ${exported.air.fallGravityMultiplier}f,`,
      `    MaxFallSpeed = ${exported.air.maxFallSpeed}f,`,
      `    AirControl = ${exported.air.airControl}f,`,
      `    CoyoteTimeMs = ${exported.air.coyoteTime},`,
      `    JumpBufferMs = ${exported.air.jumpBuffer},`,
      `    DashForce = ${exported.impact.dashForce}f,`,
      `    DashDurationMs = ${exported.impact.dashDuration},`,
      `    DashCooldownMs = ${exported.impact.dashCooldown},`,
      `    AirDashCount = ${exported.impact.airDashCount},`,
      `    HitStopMs = ${exported.impact.hitStop},`,
      `    ShakePixels = ${exported.impact.shake},`,
      `    LandingImpact = ${exported.impact.landingImpact}`,
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
      `@export var turn_acceleration := ${exported.movement.turnAcceleration}.0`,
      `@export var jump_velocity := ${exported.air.jumpVelocity}.0`,
      `@export var gravity := ${exported.air.gravity}.0`,
      `@export var jump_cut_multiplier := ${exported.air.jumpCutMultiplier}`,
      `@export var fall_gravity_multiplier := ${exported.air.fallGravityMultiplier}`,
      `@export var max_fall_speed := ${exported.air.maxFallSpeed}.0`,
      `@export var air_control := ${exported.air.airControl}`,
      `@export var coyote_time_ms := ${exported.air.coyoteTime}`,
      `@export var jump_buffer_ms := ${exported.air.jumpBuffer}`,
      `@export var dash_force := ${exported.impact.dashForce}.0`,
      `@export var dash_duration_ms := ${exported.impact.dashDuration}`,
      `@export var dash_cooldown_ms := ${exported.impact.dashCooldown}`,
      `@export var air_dash_count := ${exported.impact.airDashCount}`,
      `@export var hit_stop_ms := ${exported.impact.hitStop}`,
      `@export var shake_pixels := ${exported.impact.shake}`,
      `@export var landing_impact := ${exported.impact.landingImpact}`,
    ].join("\n");
  }

  return JSON.stringify(exported, null, 2);
}

function applyHorizontalMovement(player, config, axis, dt) {
  const groundedFactor = player.grounded ? 1 : config.airControl;
  if (axis !== 0) {
    player.facing = axis;
    const reversing = Math.sign(player.vx) !== 0 && Math.sign(player.vx) !== axis;
    const accel = (reversing ? config.turnAcceleration : config.acceleration) * groundedFactor;
    player.vx = approach(player.vx, axis * config.runSpeed, accel * dt);
  } else if (player.grounded) {
    player.vx = approach(player.vx, 0, config.friction * dt);
  } else {
    player.vx = approach(player.vx, 0, config.friction * config.airControl * 0.18 * dt);
  }
}

function canDash(player, config) {
  return player.grounded || player.airDashesUsed < config.airDashCount;
}

function gravityForState(player, input, config) {
  if (player.vy < 0 && !input.jumpHeld) {
    return config.gravity * config.jumpCutMultiplier;
  }
  if (player.vy > 0) {
    return config.gravity * config.fallGravityMultiplier;
  }
  return config.gravity;
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
  if (max < min) {
    return clamp((min - value) / (min - max), 0, 1);
  }
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
  ta: "turnAcceleration",
  jv: "jumpVelocity",
  gr: "gravity",
  jc: "jumpCutMultiplier",
  fg: "fallGravityMultiplier",
  mf: "maxFallSpeed",
  ar: "airControl",
  ct: "coyoteTime",
  jb: "jumpBuffer",
  df: "dashForce",
  dd: "dashDuration",
  dc: "dashCooldown",
  ad: "airDashCount",
  hs: "hitStop",
  sh: "shake",
  li: "landingImpact",
};
