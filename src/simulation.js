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
  return {
    name: "custom-feel-profile",
    units: {
      distance: "pixels",
      time: "milliseconds",
    },
    movement: {
      runSpeed: config.runSpeed,
      acceleration: config.acceleration,
      friction: config.friction,
    },
    air: {
      jumpVelocity: config.jumpVelocity,
      gravity: config.gravity,
      coyoteTime: config.coyoteTime,
      jumpBuffer: config.jumpBuffer,
    },
    impact: {
      dashForce: config.dashForce,
      hitStop: config.hitStop,
      shake: config.shake,
    },
  };
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

