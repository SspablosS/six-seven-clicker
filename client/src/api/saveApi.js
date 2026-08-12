export async function loadSave(playerId) {
  const res = await fetch(`/api/save/${playerId}`);
  if (!res.ok) {
    throw new Error(`Failed to load save: ${res.status}`);
  }
  return res.json();
}

export async function persistSave(playerId, save) {
  const res = await fetch(`/api/save/${playerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(save),
  });
  if (!res.ok) {
    throw new Error(`Failed to save: ${res.status}`);
  }
  return res.json();
}
