import express from 'express';
import { createDefaultSave } from './defaultSave.js';
import { applyOfflineEarnings } from './offline.js';
import { ensureSavesFile, getSave, putSave } from './saveStore.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

ensureSavesFile();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/save/:playerId', async (req, res) => {
  const { playerId } = req.params;
  if (!playerId) {
    return res.status(400).json({ error: 'playerId required' });
  }

  const existing = getSave(playerId);

  if (!existing) {
    const save = createDefaultSave(playerId);
    return res.json({ save, offlineEarned: 0 });
  }

  const { save, offlineEarned } = applyOfflineEarnings({ ...existing });
  await putSave(playerId, save);
  return res.json({ save, offlineEarned });
});

app.post('/api/save/:playerId', async (req, res) => {
  const { playerId } = req.params;
  const body = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId required' });
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'save body required' });
  }

  const save = {
    ...createDefaultSave(playerId),
    ...body,
    playerId,
    lastSeenAt: new Date().toISOString(),
  };

  await putSave(playerId, save);
  return res.json({ save });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
