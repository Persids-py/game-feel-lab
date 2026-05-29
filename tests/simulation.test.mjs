import assert from "node:assert/strict";
import {
  compareProfiles,
  createPlayer,
  decodeProfile,
  encodeProfile,
  estimateJump,
  exportConfig,
  feelProfileMetrics,
  intensityScore,
  parseImportedConfig,
  presets,
  renderEngineSnippet,
  stepPlayer
} from "../src/simulation.js";

const world = {
  width: 960,
  height: 540,
  groundY: 426
};

function stepFrames(player, input, config, frames = 1) {
  for (let frame = 0; frame < frames; frame += 1) {
    stepPlayer(player, frame === 0 ? input : {}, config, 1 / 60, world);
  }
}

function holdFrames(player, input, config, frames = 1) {
  for (let frame = 0; frame < frames; frame += 1) {
    stepPlayer(player, input, config, 1 / 60, world);
  }
}

{
  const player = createPlayer();

  stepFrames(player, { jumpPressed: true, jumpHeld: true }, presets.balanced, 2);

  assert.equal(player.grounded, false);
  assert.ok(player.vy < 0, "jump input should launch the player upward");
}

{
  const player = createPlayer();

  holdFrames(player, { right: true }, presets.snappy, 20);

  assert.ok(player.vx > 0, "right input should accelerate the player");
  assert.equal(player.facing, 1);
}

{
  const player = createPlayer();

  stepFrames(player, { dashPressed: true }, presets.balanced, 3);

  assert.ok(player.dashCooldown > 0, "dash should start a cooldown");
  assert.ok(player.dashDistance > 0, "dash should move the player horizontally");
}

{
  const player = createPlayer();

  stepFrames(player, { hitPressed: true }, presets.floaty, 1);

  assert.equal(player.hitStop, presets.floaty.hitStop);
  assert.equal(player.shakeTime, presets.floaty.hitStop);
}

{
  const jump = estimateJump(presets.balanced);
  const shortHop = estimateJump(presets.balanced, 378, { jumpHoldTime: 0 });

  assert.ok(jump.apexHeight > 0);
  assert.ok(jump.airTime > 0.1);
  assert.ok(jump.points.length > 4);
  assert.ok(shortHop.apexHeight < jump.apexHeight, "released jump should create a shorter hop");
}

{
  const exported = exportConfig(presets.snappy);

  assert.equal(exported.schemaVersion, "1.1");
  assert.equal(exported.profileName, "custom-feel-profile");
  assert.equal(exported.movement.runSpeed, presets.snappy.runSpeed);
  assert.equal(exported.air.gravity, presets.snappy.gravity);
  assert.equal(exported.air.fallGravityMultiplier, presets.snappy.fallGravityMultiplier);
  assert.equal(exported.impact.shake, presets.snappy.shake);
  assert.equal(exported.impact.dashDuration, presets.snappy.dashDuration);
}

{
  const imported = parseImportedConfig(JSON.stringify(exportConfig(presets.heavy)));

  assert.equal(imported.runSpeed, presets.heavy.runSpeed);
  assert.equal(imported.hitStop, presets.heavy.hitStop);
}

{
  const encoded = encodeProfile(presets.speedrun);
  const decoded = decodeProfile(encoded);

  assert.equal(decoded.runSpeed, presets.speedrun.runSpeed);
  assert.equal(decoded.jumpBuffer, presets.speedrun.jumpBuffer);
}

{
  const diff = compareProfiles(presets.balanced, presets.snappy);

  assert.ok(diff.dashReach > 0);
  assert.ok(Number.isInteger(diff.intensity));
}

{
  const unity = renderEngineSnippet(presets.balanced, "unity");
  const godot = renderEngineSnippet(presets.balanced, "godot");

  assert.ok(unity.includes("GameFeelProfile"));
  assert.ok(godot.includes("class_name GameFeelProfile"));
}

{
  const score = intensityScore(presets.balanced);
  const metrics = feelProfileMetrics(presets.balanced);

  assert.ok(Number.isInteger(score));
  assert.ok(score >= 0);
  assert.ok(score <= 100);
  assert.ok(metrics.speed >= 0 && metrics.speed <= 100);
  assert.ok(metrics.accessibility >= 0 && metrics.accessibility <= 100);
}

{
  const player = createPlayer();

  stepFrames(player, { dashPressed: true }, presets.speedrun, 1);
  assert.ok(player.dashRemaining > 0, "dash should last for a configured duration");
  assert.ok(player.dashCooldown > 0, "dash cooldown should be configured in milliseconds");
}

{
  const decoded = decodeProfile("rs=999999&gr=not-a-number&ad=2");

  assert.equal(decoded.runSpeed, 720);
  assert.equal(decoded.gravity, presets.balanced.gravity);
  assert.equal(decoded.airDashCount, 2);
}

{
  assert.throws(() => parseImportedConfig("{not valid json"));
}

{
  const player = createPlayer();
  player.grounded = false;
  player.coyote = 0;

  stepFrames(player, { jumpPressed: true, jumpHeld: true }, presets.balanced, 1);

  assert.ok(player.vy >= 0, "jump should not fire after coyote time expires");
}

{
  const player = createPlayer();
  player.vy = 5000;
  player.grounded = false;

  stepFrames(player, {}, presets.balanced, 1);

  assert.ok(player.vy <= presets.balanced.maxFallSpeed, "fall speed should be capped");
}

console.log("simulation tests ok");
