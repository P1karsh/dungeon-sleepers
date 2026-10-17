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
- Five monster types (slime, ghost, bat, mushroom, skull), picked by task id
- Camp scene where on-time campers sleep under blankets with floating z's, and late ones stay up with a glowing phone
- Progress saved in localStorage
- **The three friends are mock players with random outcomes (65% on time).** There is no backend yet.

## Ideas for next steps
- Real shared camps: invite codes, real friends' check-ins, and a backend to store them
- A small sleep history chart (last 7 nights)
- Monster names next to tasks, and simple idle animations
- Sound or music option, and a polished morning recap cutscene
- Better mobile layout testing

## Working preferences
- Keep the code readable and human-looking: clear names, simple structure, and comments only where something isn't obvious.
- Keep it a single self-contained file unless a backend is added.
