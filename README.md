# Game Feel Lab

Game Feel Lab is a browser-based tuning tool for game developers working on platformer movement and action feedback. It lets you adjust movement, jumping, dash force, hit stop, and camera shake while immediately testing the result in a small playable sandbox.

Live demo: [https://persids-py.github.io/game-feel-lab/](https://persids-py.github.io/game-feel-lab/)

The exported JSON is engine-neutral, so it can be copied into Unity, Godot, Unreal, custom engines, or design docs.

![Game Feel Lab screenshot](docs/game-feel-lab.png)

## Features

- Live movement sandbox with keyboard input.
- Tunable run speed, acceleration, friction, turn acceleration, gravity, jump velocity, coyote time, and jump buffering.
- Variable jump height, fall gravity multiplier, max fall speed, and air control.
- Dash force, dash duration, dash cooldown, air dash count, hit stop, screen shake, and landing impact.
- Jump arc preview, A/B curves, intensity score, and hand-feel profile meters.
- Engine-neutral JSON import/export.
- Unity and Godot snippet export.
- Shareable profile URLs.
- A/B comparison slots for tuning passes.
- Touch controls for mobile testing.
- Runs as a static site with no build step.

## Controls

- `A` / `D` or arrow keys: move.
- `Space`: jump.
- `Shift`: dash.
- `J`: trigger hit stop and shake.
- On touch screens: use the on-canvas Left, Right, Jump, Dash, and Hit buttons.

## Workflow

- Use the preset buttons to start from a known feel profile.
- Switch export format between JSON, Unity, and Godot.
- Paste an exported JSON profile into the export box and press `Import JSON`.
- Press `Share URL` to encode the current profile into the page URL.
- Press `Save A` and `Save B` to compare two tuning passes.

## Completed

- JSON import/export.
- Unity and Godot snippet export.
- Shareable URLs.
- A/B comparison.
- Preset profiles.
- Variable jump height and fall tuning.
- Dash duration, cooldown, and air dash tuning.
- Touch controls.

## Run Locally

Open [index.html](index.html) in a browser.

If your browser blocks module loading from local files, run a tiny local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Test

```bash
npm test
```

## Project Structure

```text
index.html
package.json
src/
  app.js
  simulation.js
  styles.css
presets/
  balanced.json
  heavy.json
  moon.json
  snappy.json
  speedrun.json
tests/
  simulation.test.mjs
```

## Export Format

```json
{
  "schemaVersion": "1.1",
  "profileName": "custom-feel-profile",
  "movement": {
    "runSpeed": 420,
    "acceleration": 2600,
    "friction": 3200,
    "turnAcceleration": 4200
  },
  "air": {
    "jumpVelocity": 720,
    "gravity": 1850,
    "jumpCutMultiplier": 2.2,
    "fallGravityMultiplier": 1.65,
    "maxFallSpeed": 980,
    "airControl": 0.72,
    "coyoteTime": 90,
    "jumpBuffer": 100
  },
  "impact": {
    "dashForce": 620,
    "dashDuration": 150,
    "dashCooldown": 420,
    "airDashCount": 1,
    "hitStop": 70,
    "shake": 8,
    "landingImpact": 7
  }
}
```

## Roadmap

- Timeline view for input buffering and coyote windows.
- Platforming, combat dummy, and dash challenge rooms.
- Blind A/B testing.
- Local profile library with named saved profiles.
- Gamepad support.
- More player archetypes, including top-down and twin-stick movement.
- Direct export templates for more engines.

## Contributing

Pull requests are welcome. Keep the app dependency-free unless a dependency clearly improves the core workflow for game developers.

## License

MIT
