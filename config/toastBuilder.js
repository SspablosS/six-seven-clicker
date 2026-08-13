/**
 * Собирает toast для случайного события без мутаций.
 * @param {{ eventId: string, def: object, now: number, echoLoss?: number|null, endsAt?: number|null }} params
 */
export function buildEventToast({ eventId, def, now, echoLoss = null, endsAt = null }) {
  const description =
    echoLoss != null
      ? echoLoss > 0
        ? `Списано ${echoLoss} Эха`
        : 'Списывать было нечего'
      : def.description;

  const resolvedEndsAt =
    endsAt ?? (def.durationMs > 0 ? now + def.durationMs : null);

  return {
    id: `${eventId}-${now}`,
    eventId,
    type: def.type,
    title: def.title,
    description,
    endsAt: resolvedEndsAt,
  };
}
