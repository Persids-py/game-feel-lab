import {
  compareProfiles,
  controlKeys,
  createPlayer,
  decodeProfile,
  encodeProfile,
  estimateJump,
  feelProfileMetrics,
  intensityScore,
  normalizeConfig,
  parseImportedConfig,
  presets,
  renderEngineSnippet,
  stepPlayer,
} from "./simulation.js";

const config = { ...presets.balanced };
const player = createPlayer();
const stage = document.querySelector("#stage");
const ctx = stage.getContext("2d");
const arc = document.querySelector("#arc");
const arcCtx = arc.getContext("2d");
const exportText = document.querySelector("#exportText");
const presetName = document.querySelector("#presetName");
const statusText = document.querySelector("#statusText");
const exportModeLabel = document.querySelector("#exportModeLabel");
const subtitle = document.querySelector(".topbar p");
const input = {
  left: false,
  right: false,
  jumpHeld: false,
  jumpPressed: false,
  dashPressed: false,
  hitPressed: false,
};

const world = {
  width: stage.width,
  height: stage.height,
  groundY: 426,
};

let activePreset = "balanced";
let outputFormat = "json";
let lastTime = performance.now();
let compareA = { ...presets.balanced };
let compareB = { ...presets.snappy };

for (const key of controlKeys) {
  const inputElement = document.querySelector(`#${key}`);
  inputElement.value = config[key];
  inputElement.addEventListener("input", () => {
    config[key] = Number(inputElement.value);
    activePreset = "custom";
    updateControls();
  });
}

for (const button of document.querySelectorAll(".preset")) {
  button.addEventListener("click", () => {
    applyConfig(presets[button.dataset.preset], button.dataset.preset);
    setStatus(`${titleCase(button.dataset.preset)} preset loaded`);
  });
}

for (const button of document.querySelectorAll(".format")) {
  button.addEventListener("click", () => {
    outputFormat = button.dataset.format;
    updateControls();
    setStatus(`${outputFormatLabel(outputFormat)} export ready`);
  });
}

const sharedConfig = decodeProfile(window.location.search);
if (sharedConfig) {
  applyConfig(sharedConfig, "shared");
  setStatus("Shared profile loaded");
}

document.querySelector("#resetBtn").addEventListener("click", () => {
  applyConfig(presets.balanced, "balanced");
  setStatus("Balanced preset restored");
});

document.querySelector("#shareBtn").addEventListener("click", async () => {
  const url = `${window.location.origin}${window.location.pathname}?${encodeProfile(config)}`;
  window.history.replaceState(null, "", url);
  await copyText(url);
  setStatus("Share URL copied");
});

document.querySelector("#importBtn").addEventListener("click", () => {
  try {
    outputFormat = "json";
    applyConfig(parseImportedConfig(exportText.value), "imported");
    setStatus("Imported JSON profile");
  } catch {
    setStatus("Paste a valid exported JSON profile first");
  }
});

document.querySelector("#saveABtn").addEventListener("click", () => {
  compareA = normalizeConfig(config);
  updateCompare();
  drawArc();
  setStatus("Saved current profile as A");
});

document.querySelector("#saveBBtn").addEventListener("click", () => {
  compareB = normalizeConfig(config);
  updateCompare();
  drawArc();
  setStatus("Saved current profile as B");
});

document.querySelector("#exportBtn").addEventListener("click", async () => {
  exportText.select();
  await copyText(exportText.value);
  const label = outputFormat === "json" ? "Export JSON" : `Copy ${titleCase(outputFormat)}`;
  document.querySelector("#exportBtn").textContent = "Copied";
  window.setTimeout(() => {
    document.querySelector("#exportBtn").textContent = label;
  }, 900);
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "KeyA" || event.code === "ArrowLeft") input.left = true;
  if (event.code === "KeyD" || event.code === "ArrowRight") input.right = true;
  if (event.code === "Space") {
    input.jumpPressed = true;
    input.jumpHeld = true;
  }
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") input.dashPressed = true;
  if (event.code === "KeyJ") input.hitPressed = true;
});

window.addEventListener("keyup", (event) => {
  if (event.code === "KeyA" || event.code === "ArrowLeft") input.left = false;
  if (event.code === "KeyD" || event.code === "ArrowRight") input.right = false;
  if (event.code === "Space") input.jumpHeld = false;
});

for (const button of document.querySelectorAll(".touch-controls button")) {
  const hold = button.dataset.hold;
  const action = button.dataset.action;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (hold) input[hold] = true;
    if (action === "jump") {
      input.jumpPressed = true;
      input.jumpHeld = true;
    }
    if (action === "dash") input.dashPressed = true;
    if (action === "hit") input.hitPressed = true;
  });
  button.addEventListener("pointerup", () => {
    if (hold) input[hold] = false;
    if (action === "jump") input.jumpHeld = false;
  });
  button.addEventListener("pointercancel", () => {
    if (hold) input[hold] = false;
    if (action === "jump") input.jumpHeld = false;
  });
}

function applyConfig(nextConfig, presetLabel = "custom") {
  Object.assign(config, normalizeConfig(nextConfig));
  activePreset = presetLabel;
  Object.assign(player, createPlayer());
  updateControls();
}

function updateControls() {
  for (const key of controlKeys) {
    document.querySelector(`#${key}`).value = config[key];
    document.querySelector(`[data-value-for="${key}"]`).textContent = formatValue(key, config[key]);
  }

  presetName.textContent = activePreset === "custom" ? "Custom" : titleCase(activePreset);
  subtitle.textContent = `${presetName.textContent} profile · ${outputFormatLabel(outputFormat)} export`;

  for (const button of document.querySelectorAll(".preset")) {
    button.classList.toggle("active", button.dataset.preset === activePreset);
  }
  for (const button of document.querySelectorAll(".format")) {
    button.classList.toggle("active", button.dataset.format === outputFormat);
  }

  exportModeLabel.textContent = outputFormatLabel(outputFormat);
  document.querySelector("#exportBtn").textContent =
    outputFormat === "json" ? "Export JSON" : `Copy ${titleCase(outputFormat)}`;
  exportText.value = renderEngineSnippet(config, outputFormat);
  drawArc();
  updateCompare();
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  stepPlayer(player, input, config, dt, world);
  input.jumpPressed = false;
  input.dashPressed = false;
  input.hitPressed = false;

  drawStage();
  updateStats();
  requestAnimationFrame(loop);
}

function drawStage() {
  const shake = player.shakeTime > 0 ? config.shake : 0;
  const offsetX = (Math.random() - 0.5) * shake;
  const offsetY = (Math.random() - 0.5) * shake;

  ctx.save();
  ctx.clearRect(0, 0, stage.width, stage.height);
  ctx.translate(offsetX, offsetY);

  const sky = ctx.createLinearGradient(0, 0, 0, stage.height);
  sky.addColorStop(0, "#dff2ff");
  sky.addColorStop(0.58, "#f7fbff");
  sky.addColorStop(1, "#e8efe7");
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, stage.width + 40, stage.height + 40);

  drawBackground();
  drawTarget();
  drawGround();
  drawGhostArc();
  drawPlayer();
  ctx.restore();
}

function drawBackground() {
  ctx.fillStyle = "rgba(31, 70, 97, 0.08)";
  for (let x = 70; x < stage.width; x += 120) {
    ctx.fillRect(x, 128 + (x % 3) * 18, 58, 220);
    ctx.fillRect(x + 16, 104 + (x % 4) * 14, 26, 34);
  }
}

function drawGround() {
  ctx.fillStyle = "#243b2f";
  ctx.fillRect(0, world.groundY, stage.width, stage.height - world.groundY);
  ctx.fillStyle = "#79b46d";
  ctx.fillRect(0, world.groundY, stage.width, 12);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;
  for (let x = 0; x < stage.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, world.groundY + 12);
    ctx.lineTo(x + 28, world.groundY + 24);
    ctx.stroke();
  }
}

function drawTarget() {
  ctx.fillStyle = "#ffcf5a";
  ctx.fillRect(722, world.groundY - 86, 82, 86);
  ctx.fillStyle = "#583a20";
  ctx.fillRect(742, world.groundY - 54, 24, 54);
  ctx.fillStyle = "#fb6f54";
  ctx.beginPath();
  ctx.arc(770, world.groundY - 86, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawGhostArc() {
  const arcData = estimateJump(config, player.y);
  ctx.strokeStyle = "rgba(22, 93, 126, 0.36)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 9]);
  ctx.beginPath();
  arcData.points.slice(0, 80).forEach((point, index) => {
    const x = player.x + player.width / 2 + point.x * config.runSpeed * 0.58 * player.facing;
    const y = point.y + player.height / 2;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.fillStyle = "rgba(25, 32, 37, 0.2)";
  ctx.beginPath();
  ctx.ellipse(player.width / 2, player.height + 8, 25, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = player.hitStop > 0 ? "#f85f55" : "#276ef1";
  roundRect(ctx, 0, 0, player.width, player.height, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(player.facing > 0 ? 21 : 8, 12, 6, 6);
  ctx.fillStyle = "#172339";
  ctx.fillRect(player.facing > 0 ? 24 : 8, 14, 3, 3);

  ctx.fillStyle = "#152f56";
  ctx.fillRect(7, 39, 7, 12);
  ctx.fillRect(22, 39, 7, 12);
  ctx.restore();
}

function drawArc() {
  const profileA = estimateJump(compareA);
  const profileB = estimateJump(compareB);
  arcCtx.clearRect(0, 0, arc.width, arc.height);
  arcCtx.fillStyle = "#f6f8fb";
  arcCtx.fillRect(0, 0, arc.width, arc.height);

  arcCtx.strokeStyle = "#d6dde7";
  arcCtx.lineWidth = 1;
  for (let x = 28; x < arc.width; x += 54) {
    arcCtx.beginPath();
    arcCtx.moveTo(x, 18);
    arcCtx.lineTo(x, arc.height - 30);
    arcCtx.stroke();
  }
  for (let y = 30; y < arc.height; y += 42) {
    arcCtx.beginPath();
    arcCtx.moveTo(24, y);
    arcCtx.lineTo(arc.width - 20, y);
    arcCtx.stroke();
  }

  drawArcLine(profileA.points, "#276ef1", 4);
  drawArcLine(profileB.points, "rgba(248, 95, 85, 0.62)", 3);

  arcCtx.fillStyle = "#152336";
  arcCtx.font = "600 13px system-ui";
  arcCtx.fillText(`A ${Math.round(profileA.apexHeight)} px`, 26, 24);
  arcCtx.fillText(`B ${Math.round(profileB.apexHeight)} px`, 26, 44);
}

function drawArcLine(points, color, width) {
  arcCtx.strokeStyle = color;
  arcCtx.lineWidth = width;
  arcCtx.beginPath();
  points.forEach((point, index) => {
    const x = 34 + point.x * 185;
    const y = arc.height - 32 - (378 - point.y) * 0.58;
    if (index === 0) arcCtx.moveTo(x, y);
    else arcCtx.lineTo(x, y);
  });
  arcCtx.stroke();
}

function updateStats() {
  const jump = estimateJump(config);
  const metrics = feelProfileMetrics(config);
  document.querySelector("#apexStat").textContent = `${Math.round(jump.apexHeight)} px`;
  document.querySelector("#airTimeStat").textContent = `${Math.round(jump.airTime * 1000)} ms`;
  document.querySelector("#dashStat").textContent = `${Math.round(player.dashDistance)} px`;
  document.querySelector("#intensityStat").textContent = intensityScore(config);
  document.querySelector("#speedMeter").value = metrics.speed;
  document.querySelector("#precisionMeter").value = metrics.precision;
  document.querySelector("#floatMeter").value = metrics.float;
  document.querySelector("#impactMeter").value = metrics.impact;
  document.querySelector("#accessibilityMeter").value = metrics.accessibility;
}

function updateCompare() {
  const diff = compareProfiles(compareA, compareB);
  document.querySelector("#compareApex").textContent = signed(diff.apexHeight, " px");
  document.querySelector("#compareAir").textContent = signed(diff.airTime, " ms");
  document.querySelector("#compareDash").textContent = signed(diff.dashReach, " px");
  document.querySelector("#compareIntensity").textContent = signed(diff.intensity, "");
}

function formatValue(key, value) {
  if (
    key === "coyoteTime" ||
    key === "jumpBuffer" ||
    key === "hitStop" ||
    key === "dashDuration" ||
    key === "dashCooldown"
  ) {
    return `${value} ms`;
  }
  if (key === "shake") return `${value}px`;
  if (key === "airControl" || key === "jumpCutMultiplier" || key === "fallGravityMultiplier") {
    return Number(value).toFixed(2);
  }
  return String(value);
}

function titleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function outputFormatLabel(value) {
  if (value === "json") return "JSON";
  return titleCase(value);
}

function signed(value, suffix) {
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function setStatus(message) {
  statusText.textContent = message;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    exportText.focus();
  }
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

updateControls();
requestAnimationFrame(loop);
