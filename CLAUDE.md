# Dungeon Sleepers: project brief

Read `dungeon-sleepers.html` first. It's a single-file prototype (HTML, CSS and vanilla JS, no build step). This brief explains the idea behind it and where I want it to go.

## What it is
A cooperative pixel-art game for a hackathon (HackTheBurgh) that links focus and sleep. It combines two earlier ideas: "Procrastination Dungeon" (tasks as monsters you defeat in focus sessions) and "Sleep Heist" (friends' bedtimes affect a shared outcome). The sleep side should get a bit more emphasis than the dungeon side.

## The problem it tackles
Procrastination and poor sleep feed each other, especially for students. The game makes that link visible and a little fun, using friendly peer accountability instead of guilt.

## Core loop
1. **Day (Dungeon):** each task is a monster with HP equal to its estimated minutes. A focus session (25 min) damages the targeted monster.
2. **Night (Camp):** set a bedtime and press "Lights out". On time means within 30 minutes of the bedtime. The party camps around a shared fire.
3. **Morning:** "Wake up" shows a recap and sets tomorrow's state:
   - on time: hero is rested (100% energy)
   - late: hero is tired (60% damage)
   - all 4 campers on time: camp bonus of +20% damage
   - the fire size reflects how many people slept on time

## Design principles (please keep these)
- **Only last night counts.** There are no streaks that punish one bad night.
- **Never reward sleeping less.** Rewards are about consistency, not extremes.
- **Friendly, not guilt-based.** Late friends cost the group a bonus, but the tone stays light and funny.
- **Demoable in a weekend:** the bedtime check-in is a button with a timestamp, with no sleep sensors. A demo mode (5-second sessions and a forced on-time/late option) exists so judges can see the whole loop quickly.

## Visual style
Pixel art drawn on canvas from string-grid sprites, with a dreamy night palette (purple, pink, mint, ember orange) and fonts Press Start 2P and VT323. The same style as my personal memory-bank website. There is a light "dawn" theme for light mode.

## Current state
- Five monster types (slime, ghost, bat, mushroom, skull), picked by task id, each with a silly name ("Sleepy Slime")
- Idle animations at about 10 fps (bobbing hero and monsters, flapping bat, flickering fire, drifting z's, twinkling stars), a hit flash with a damage number, and a poof when a monster is defeated. All motion is off with `prefers-reduced-motion`.
- Camp scene where on-time campers sleep under blankets with floating z's, and late ones stay up with a glowing phone
- Morning recap cutscene: the sky turns to dawn, on-time campers wake refreshed, late ones doze off, the fire settles at its new size, and the recap lines appear one by one (skippable)
- On time = from 3 hours before bedtime up to 30 minutes after. Turning in early is labelled "turned in early"; earlier than that is treated as a misclick.
- "Last 7 nights" chart in the Camp tab (display only, it never affects the game)
- Sound effects and a lullaby made with the Web Audio API, both off by default
- The focus timer stores when the fight ends, so it stays accurate in background tabs and survives a reload
- Progress saved in localStorage

## Shared camps (`server.js`)
- Zero-dependency Node server (`node server.js`, port 3000) that serves the game and stores camps in `data/camps.json` (gitignored)
- Start a camp to get a 5-letter code and an invite link (`?camp=CODE`). Up to 4 campers.
- Each player has a public id and a secret kept in their browser, so nobody can check in for someone else. The server trusts the on-time result the client sends.
- The camp bonus needs everyone in the camp on time, with at least 2 campers. The fire scales with the share on time. Friends who never check in count as not on time.
- When the game is opened as a plain file, or before you join a camp, the three practice friends (Mira, Sam, Jo; 65% on time) fill the camp.

## Ideas for next steps
- Host the server somewhere public for the demo (Render, Fly.io, Railway or similar)
- Notifications or reminders near bedtime
- A proper "dawn" palette for the canvas in light mode

## Working preferences
- Keep the code readable and human-looking: clear names, simple structure, and comments only where something isn't obvious.
- Keep the game a single self-contained file. The only other code is `server.js`, which has no dependencies.
