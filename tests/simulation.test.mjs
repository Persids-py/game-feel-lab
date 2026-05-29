import assert from "node:assert/strict";
import {
  createPlayer,
  estimateJump,
  exportConfig,
  feelScore,
  presets,
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

  stepFrames(player, { jumpPressed: true }, presets.balanced, 2);

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

  assert.ok(jump.apexHeight > 0);
  assert.ok(jump.airTime > 0.1);
  assert.ok(jump.points.length > 4);
}

{
  const exported = exportConfig(presets.snappy);

  assert.equal(exported.name, "custom-feel-profile");
  assert.equal(exported.movement.runSpeed, presets.snappy.runSpeed);
  assert.equal(exported.air.gravity, presets.snappy.gravity);
  assert.equal(exported.impact.shake, presets.snappy.shake);
}

{
  const score = feelScore(presets.balanced);

  assert.ok(Number.isInteger(score));
  assert.ok(score >= 0);
  assert.ok(score <= 100);
}

console.log("simulation tests ok");
