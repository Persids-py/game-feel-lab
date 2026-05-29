import { createPlayer, estimateJump, exportConfig, feelScore, presets, stepPlayer } from "./simulation.js";

const config = { ...presets.balanced };
const player = createPlayer();
const stage = document.querySelector("#stage");
const ctx = stage.getContext("2d");
const arc = document.querySelector("#arc");
const arcCtx = arc.getContext("2d");
const exportText = document.querySelector("#exportText");
const presetName = document.querySelector("#presetName");
const input = {
  left: false,
  right: false,
  jumpPressed: false,
  dashPressed: false,
  hitPressed: false,
};

const controls = [
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

const world = {
  width: stage.width,
  height: stage.height,
  groundY: 426,
};

let activePreset = "balanced";
let lastTime = performance.now();

for (const key of controls) {
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
    activePreset = button.dataset.preset;
    Object.assign(config, presets[activePreset]);
    Object.assign(player, createPlayer());
    updateControls();
  });
}

document.querySelector("#resetBtn").addEventListener("click", () => {
  Object.assign(player, createPlayer());
});

document.querySelector("#exportBtn").addEventListener("click", async () => {
  exportText.select();
  try {
    await navigator.clipboard.writeText(exportText.value);
    document.querySelector("#exportBtn").textContent = "Copied";
    window.setTimeout(() => {
      document.querySelector("#exportBtn").textContent = "Export JSON";
    }, 900);
  } catch {
    document.querySelector("#exportBtn").textContent = "Select JSON";
  }
});

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.code === "KeyA" || event.code === "ArrowLeft") input.left = true;
  if (event.code === "KeyD" || event.code === "ArrowRight") input.right = true;
  if (event.code === "Space") input.jumpPressed = true;
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") input.dashPressed = true;
  if (event.code === "KeyJ") input.hitPressed = true;
});

window.addEventListener("keyup", (event) => {
  if (event.code === "KeyA" || event.code === "ArrowLeft") input.left = false;
  if (event.code === "KeyD" || event.code === "ArrowRight") input.right = false;
});

function updateControls() {
  for (const key of controls) {
    document.querySelector(`#${key}`).value = config[key];
    document.querySelector(`[data-value-for="${key}"]`).textContent = formatValue(key, config[key]);
  }
  presetName.textContent = activePreset === "custom" ? "Custom" : titleCase(activePreset);
  for (const button of document.querySelectorAll(".preset")) {
    button.classList.toggle("active", button.dataset.preset === activePreset);
  }
  exportText.value = JSON.stringify(exportConfig(config), null, 2);
  drawArc();
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
  const data = estimateJump(config);
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

  arcCtx.strokeStyle = "#276ef1";
  arcCtx.lineWidth = 4;
  arcCtx.beginPath();
  data.points.forEach((point, index) => {
    const x = 34 + point.x * 185;
    const y = arc.height - 32 - (378 - point.y) * 0.58;
    if (index === 0) arcCtx.moveTo(x, y);
    else arcCtx.lineTo(x, y);
  });
  arcCtx.stroke();

  arcCtx.fillStyle = "#152336";
  arcCtx.font = "600 13px system-ui";
  arcCtx.fillText(`${Math.round(data.apexHeight)} px apex`, 26, 24);
  arcCtx.fillText(`${Math.round(data.airTime * 1000)} ms air`, 26, 44);
}

function updateStats() {
  const jump = estimateJump(config);
  document.querySelector("#apexStat").textContent = `${Math.round(jump.apexHeight)} px`;
  document.querySelector("#airTimeStat").textContent = `${Math.round(jump.airTime * 1000)} ms`;
  document.querySelector("#dashStat").textContent = `${Math.round(player.dashDistance)} px`;
  document.querySelector("#feelStat").textContent = feelScore(config);
}

function formatValue(key, value) {
  if (key === "coyoteTime" || key === "jumpBuffer" || key === "hitStop") return `${value} ms`;
  if (key === "shake") return `${value}px`;
  return String(value);
}

function titleCase(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
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

