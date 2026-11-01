import type { GameState, Plan } from "./sim/types";

export type SlotMeta = { index: number; week: number; at: number; total: number } | null;

const KEY = (i: number) => "hs-life-sim.slot." + String(i);
export const SLOT_COUNT = 3;

export function listSlots(): SlotMeta[] {
  const out: SlotMeta[] = [];
  for (let i = 1; i <= SLOT_COUNT; i++) {
    try {
      const raw = localStorage.getItem(KEY(i));
      if (!raw) { out.push(null); continue; }
      const d = JSON.parse(raw);
      out.push({ index: i, week: d.week || 1, at: d.at || 0, total: d.total || 10 });
    } catch {
      out.push(null);
    }
  }
  return out;
}

export function saveSlot(i: number, game: GameState, plan: Plan) {
  const payload = { at: Date.now(), week: game.week, total: game.totalWeeks, game, plan };
  localStorage.setItem(KEY(i), JSON.stringify(payload));
}

export function loadSlot(i: number): { game: GameState; plan: Plan } | null {
  try {
    const raw = localStorage.getItem(KEY(i));
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d.game || !d.plan) return null;
    return { game: d.game, plan: d.plan };
  } catch {
    return null;
  }
}

export function clearSlot(i: number) {
  localStorage.removeItem(KEY(i));
}
