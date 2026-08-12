import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const SAVES_PATH = path.join(DATA_DIR, 'saves.json');

/** Простая очередь записи — зона роста: lock-файл / БД */
let writeChain = Promise.resolve();

export function ensureSavesFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SAVES_PATH)) {
    fs.writeFileSync(SAVES_PATH, JSON.stringify({}, null, 2), 'utf8');
  }
}

export function readAllSaves() {
  ensureSavesFile();
  const raw = fs.readFileSync(SAVES_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeAllSaves(saves) {
  writeChain = writeChain.then(() => {
    ensureSavesFile();
    fs.writeFileSync(SAVES_PATH, JSON.stringify(saves, null, 2), 'utf8');
  });
  return writeChain;
}

export function getSave(playerId) {
  const saves = readAllSaves();
  return saves[playerId] ?? null;
}

export async function putSave(playerId, save) {
  const saves = readAllSaves();
  saves[playerId] = { ...save, playerId };
  await writeAllSaves(saves);
  return saves[playerId];
}
