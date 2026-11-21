# Sam's Side-Scrolling Runner

A pixel-art endless runner built with **p5.js**, **p5.play** and **Matter.js**. Sam runs through a volcanic landscape, jumping over spikes, fighting off homing monsters with a swinging flail, and grabbing potions to stay alive. The longer you survive, the faster and meaner it gets.

## Controls

| Key / Input | Action |
|---|---|
| **Space** | Jump |
| **Down arrow** | Fast-fall (descend while in the air) |
| **E** | Swing the flail |
| **R** | Restart (on the game over screen) |
| **Mouse** | Click the menu buttons (Play, How to Play, Main Menu) |

## How to play

- **Survive.** You start with 100 health. Spikes deal 10 damage and monsters deal 15.
- **Jump spikes, or smash them.** Spikes scroll in from the right, sometimes in pairs.
- **Swing the flail (E).** The flail only hurts things for a short moment after you swing it, so just dangling it does nothing. Each swing costs 35 of your 100 stamina, which refills over time (the bar under your health turns red when you can't swing).
- **Fight monsters.** They home in on your height, so jumping isn't always enough. Killing one gives a 50% chance of dropping a potion.
- **Build combos.** Kills within about 2 seconds of each other raise your combo multiplier (up to x5). Getting hit resets it.
- **Heal.** Potions restore 6 health. A free one also spawns every 15 seconds or so.
- **Score** is based on survival time plus kill bonuses (spikes: 10, monsters: 50, both multiplied by your combo).

### Difficulty scaling

As your score climbs, the scroll speed rises (5 up to 12), obstacles spawn more often and more frequently in pairs, and monsters appear more often.

## Running the game

The game loads images and a font at startup, so browsers block it when opened directly from disk (`file://`). Serve the folder with any local web server, for example:

```bash
# from the project folder
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Alternatively, use the VS Code **Live Server** extension or `npx serve`.

## Project structure

```
.
├── index.html          # Page: loads libraries + scripts, centers and scales the canvas
├── style.css
├── sketch.js           # Main game: states, spawning, collisions, scoring, UI, backgrounds
├── game_over.ttf       # Pixel font
├── p5.js
├── p5.dom.min.js
├── p5.sound.min.js
├── p5.play.js
├── matter.js
├── js/
│   ├── ground.js       # Static ground physics body
│   ├── player.js       # Sam: body, jumping, drawing
│   ├── obstacle.js     # Spikes
│   ├── enemy.js        # Homing monsters
│   ├── sword.js        # The flail head
│   └── swordLash.js    # One-way rope tether for the flail
└── images/
    ├── sam.png         # Player (100x100)
    ├── flail.png       # Spiked flail ball
    ├── spikes.png
    ├── monster.png
    ├── potion.png
    ├── ground.png
    ├── gameLandscape.png
    ├── play.png
    ├── howtoplay.png
    └── return.png
```

(`constraint.js` is an old leftover and isn't loaded by anything.)

## How it works

- **Game states:** `start`, `howto`, `play` and `end`, all handled in `draw()` in `sketch.js`.
- **Physics:** Matter.js handles the player's jumping and gravity, and the flail's swing. Obstacles and monsters are static sensor bodies that are moved manually, so they never physically push the player. Collisions are simple box checks.
- **The flail:** `SwordLash` is a custom one-way tether rather than a Matter constraint. It only pulls the sword back when it gets more than 90px from the player and never applies force to the player, so you can't stand on it or use it to fly.
- **Backgrounds:** the landscape and ground are drawn in code as scrolling tiles with every other tile mirrored, so there's never a visible seam.
- **Clicks:** buttons use their own click handling that converts mouse position to canvas coordinates, so they work at any window size.
- **Pixel art:** image smoothing is off and the canvas is scaled with `image-rendering: pixelated`, so sprites stay crisp.

## Tuning

Most of the feel of the game can be changed in a few places:

| What | Where |
|---|---|
| Starting / max scroll speed | `gameSpeed = Math.min(5 + score / 150, 12)` in `sketch.js` |
| Obstacle spawn rate and pair chance | `nextObstacleFrame` logic in `sketch.js` |
| Monster spawn rate | `nextMonsterFrame` logic in `sketch.js` |
| Potion heal amount | `HEAL` in `sketch.js` |
| Free potion interval | `nextPotionFrame` logic in `sketch.js` |
| Damage from spikes / monsters | `player.health -= ...` in the obstacle and monster loops |
| Swing strength | the `{ x: 20, y: -10 }` velocity in the swing code |
| Swing kill window | `swingUntil = gameFrames + 30` |
| Stamina cost / regen | `stamina -= 35` / `stamina + 0.6` |
| Flail rope length | `this.length` in `js/swordLash.js` |
| Player sprite size and hitbox | `this.width`, `this.height`, and the `image(...)` call in `js/player.js` |

## Credits

Built with [p5.js](https://p5js.org/), [p5.play](https://molleindustria.github.io/p5.play/) and [Matter.js](https://brm.io/matter-js/). Sprites were drawn for this project.
