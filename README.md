# Dungeon Sleepers

A cooperative pixel-art game for HackTheBurgh that links focus and sleep. Beat tasks by day, make camp by night, and sleep well so your hero hits harder.

## Play

- **On your own:** open `dungeon-sleepers.html` in a browser. Three practice friends keep you company at camp.
- **With friends:** run the camp server (Node 18+), then open http://localhost:3000.

  ```
  node server.js
  ```

  Start a camp in the Camp tab and share the code or invite link with up to 3 friends.

## How it works

1. **Day:** add tasks. Each one becomes a monster with HP equal to its minutes. A 25-minute focus session hits the targeted monster.
2. **Night:** set a bedtime and press **Lights out**. Up to 30 minutes after your bedtime counts as on time, and so does turning in early.
3. **Morning:** press **Wake up**. If you were on time, your hero is rested and deals full damage. If you were late, it deals 60%. When the whole camp is on time, everyone gets +20% damage.

Only last night counts, so there are no streaks to lose.

## Demo tips

- Tick **Demo mode** for 5-second focus sessions.
- Use the **Demo** dropdown in the Camp tab to pretend you went to bed on time or late.
