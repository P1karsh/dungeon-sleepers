// Dungeon Sleepers camp server: serves the game and stores shared camps.
// No dependencies. Run it with `node server.js` (Node 18 or newer).

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const GAME_FILE = path.join(__dirname, 'dungeon-sleepers.html');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'camps.json');
const MAX_CAMPERS = 4;
const NIGHTS_KEPT = 14;
const CODE_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   // no 0/O or 1/I/L mix-ups

let camps = loadCamps();

function loadCamps() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return {};
  }
}

// write to a temp file first so a crash mid-write can't corrupt the camps
function saveCamps() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempFile = DATA_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(camps, null, 2));
  fs.renameSync(tempFile, DATA_FILE);
}

function newCode() {
  let code;
  do {
    code = Array.from({ length: 5 }, () => CODE_LETTERS[crypto.randomInt(CODE_LETTERS.length)]).join('');
  } while (camps[code]);
  return code;
}

// Each player has a public id that the camp sees, and a secret only their
// browser knows, so nobody can check in on someone else's behalf.
function newPlayer(name) {
  return { id: crypto.randomUUID(), secret: crypto.randomUUID(), name, joinedAt: new Date().toISOString() };
}

function publicCamp(camp) {
  return {
    code: camp.code,
    players: camp.players.map(({ id, name }) => ({ id, name })),
    nights: camp.nights
  };
}

function cleanName(value) {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ');
  return name.length >= 1 && name.length <= 20 ? name : null;
}

function findPlayer(camp, body) {
  const player = camp.players.find((p) => p.id === body.playerId);
  return player && player.secret === body.secret ? player : null;
}

function pruneNights(camp) {
  const nights = Object.keys(camp.nights).sort();
  nights.slice(0, -NIGHTS_KEPT).forEach((night) => delete camp.nights[night]);
}

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 10000) {
        reject(new RequestError(413, 'Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new RequestError(400, 'Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

// Routes:
//   GET  /api/health
//   POST /api/camps                  { name }                  start a camp
//   GET  /api/camps/:code                                      players and check-ins
//   POST /api/camps/:code/join       { name }
//   POST /api/camps/:code/checkins   { playerId, secret, night, onTime, early }
//   POST /api/camps/:code/leave      { playerId, secret }
async function handleApi(req, res, parts) {
  const [, resource, rawCode, action] = parts;

  if (resource === 'health' && req.method === 'GET') return sendJson(res, 200, { ok: true });
  if (resource !== 'camps') throw new RequestError(404, 'Not found');

  if (!rawCode) {
    if (req.method !== 'POST') throw new RequestError(405, 'Method not allowed');
    const name = cleanName((await readBody(req)).name);
    if (!name) throw new RequestError(400, 'Pick a name between 1 and 20 characters.');

    const player = newPlayer(name);
    const camp = { code: newCode(), createdAt: new Date().toISOString(), players: [player], nights: {} };
    camps[camp.code] = camp;
    saveCamps();
    return sendJson(res, 201, { camp: publicCamp(camp), playerId: player.id, secret: player.secret });
  }

  const code = rawCode.toUpperCase();
  const camp = Object.hasOwn(camps, code) ? camps[code] : null;
  if (!camp) throw new RequestError(404, 'Camp not found');

  if (!action && req.method === 'GET') return sendJson(res, 200, { camp: publicCamp(camp) });
  if (req.method !== 'POST') throw new RequestError(405, 'Method not allowed');
  const body = await readBody(req);

  if (action === 'join') {
    const name = cleanName(body.name);
    if (!name) throw new RequestError(400, 'Pick a name between 1 and 20 characters.');
    if (camp.players.length >= MAX_CAMPERS) throw new RequestError(409, 'This camp is full (4 campers max).');

    const player = newPlayer(name);
    camp.players.push(player);
    saveCamps();
    return sendJson(res, 201, { camp: publicCamp(camp), playerId: player.id, secret: player.secret });
  }

  const player = findPlayer(camp, body);
  if (!player) throw new RequestError(403, 'You are not part of this camp.');

  if (action === 'checkins') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.night)) throw new RequestError(400, 'Invalid night');

    camp.nights[body.night] = camp.nights[body.night] || {};
    camp.nights[body.night][player.id] = {
      onTime: body.onTime === true,
      early: body.early === true,
      at: new Date().toISOString()
    };
    pruneNights(camp);
    saveCamps();
    return sendJson(res, 200, { camp: publicCamp(camp) });
  }

  if (action === 'leave') {
    camp.players = camp.players.filter((p) => p.id !== player.id);
    if (camp.players.length === 0) delete camps[code];
    saveCamps();
    return sendJson(res, 200, { ok: true });
  }

  throw new RequestError(404, 'Not found');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  try {
    if (parts[0] === 'api') return await handleApi(req, res, parts);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/dungeon-sleepers.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(GAME_FILE).pipe(res);
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    if (!(err instanceof RequestError)) console.error(err);
    sendJson(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong on the server.' });
  }
});

server.listen(PORT, () => {
  console.log(`Dungeon Sleepers camp is open at http://localhost:${PORT}`);
});
