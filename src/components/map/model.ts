// The "Try it" map: a small, fictional neighbourhood and the rule that turns
// positions into verdicts. This illustrates the idea; it is not the protocol.
// No lookup, proof or certificate check happens here.

import type { Verdict } from '../../lib/icons';

export interface Point { x: number; y: number }

export interface Area {
  id: string;
  /** Full name, used in sentences and the panel. */
  name: string;
  /** Short label drawn on the map. */
  label: string;
  /** The network registered for this area. */
  ssid: string;
  points: Point[];
  /** Where the genuine access point stands. */
  ap: Point;
  labelAt: Point;
}

export interface Network {
  id: string;
  ssid: string;
  pos: Point;
  kind: 'genuine' | 'unregistered' | 'attacker';
  /** For genuine networks: the area it is registered for. */
  areaId?: string;
}

export const VIEW = { w: 800, h: 500 };
/** How far the phone can hear a network, in map units. */
export const RANGE = 200;

export const areas: Area[] = [
  {
    id: 'airport',
    name: 'Airport Wipkingen',
    label: 'Airport Wipkingen',
    ssid: 'Wipkingen Airport Free',
    points: [{ x: 48, y: 48 }, { x: 462, y: 48 }, { x: 462, y: 196 }, { x: 330, y: 196 }, { x: 330, y: 282 }, { x: 48, y: 282 }],
    ap: { x: 238, y: 150 },
    labelAt: { x: 64, y: 76 },
  },
  {
    id: 'cafe',
    name: 'StarCoffee',
    label: 'StarCoffee',
    ssid: 'StarCoffee Free',
    points: [{ x: 572, y: 56 }, { x: 756, y: 56 }, { x: 756, y: 198 }, { x: 572, y: 198 }],
    ap: { x: 690, y: 150 },
    labelAt: { x: 586, y: 84 },
  },
  {
    id: 'uni',
    name: 'Wipkingen University',
    label: 'Wipkingen University',
    ssid: 'UniWip 5G',
    points: [{ x: 572, y: 368 }, { x: 756, y: 368 }, { x: 756, y: 472 }, { x: 572, y: 472 }],
    ap: { x: 700, y: 436 },
    labelAt: { x: 586, y: 396 },
  },
];

/** A network nobody registered: always Unverified, wherever you stand. */
export const kiosk: Network = { id: 'kiosk', ssid: 'Kiosk Free WiFi', pos: { x: 150, y: 420 }, kind: 'unregistered' };

export const genuine: Network[] = areas.map((a) => ({ id: a.id, ssid: a.ssid, pos: a.ap, kind: 'genuine', areaId: a.id }));

export const START = {
  phone: { x: 170, y: 200 },
};

export const clamp = (p: Point): Point => ({
  x: Math.min(VIEW.w - 16, Math.max(16, p.x)),
  y: Math.min(VIEW.h - 16, Math.max(16, p.y)),
});

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Ray casting. */
export function inPolygon(p: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export const areaAt = (p: Point): Area | undefined => areas.find((a) => inPolygon(p, a.points));

/**
 * The whole rule:
 * - a network whose name is registered where the phone is, and which is that
 *   registered network -> Verified;
 * - a network whose name is registered where the phone is, but which is not
 *   that network -> Conflict;
 * - anything else (nothing registered here under that name) -> Unverified.
 */
export function verdictFor(net: Network, here: Area | undefined): Verdict {
  if (!here || here.ssid !== net.ssid) return 'unverified';
  return net.kind === 'genuine' && net.areaId === here.id ? 'verified' : 'conflict';
}

export interface Row { net: Network; verdict: Verdict }

export function scan(phone: Point, attacker: Network | null): { here: Area | undefined; rows: Row[] } {
  const here = areaAt(phone);
  const all = [...genuine, kiosk, ...(attacker ? [attacker] : [])];
  const order: Record<Verdict, number> = { conflict: 0, verified: 1, unverified: 2 };
  const rows = all
    .filter((n) => dist(phone, n.pos) <= RANGE)
    .map((net) => ({ net, verdict: verdictFor(net, here) }))
    .sort((a, b) => order[a.verdict] - order[b.verdict] || dist(phone, a.net.pos) - dist(phone, b.net.pos));
  return { here, rows };
}

/** One sentence describing the current state, most important thing first. */
export function explain(here: Area | undefined, rows: Row[], attacker: Network | null): string {
  const att = attacker && rows.find((r) => r.net.kind === 'attacker');
  if (att?.verdict === 'conflict' && here) {
    return `The attacker copied ${att.net.ssid}, but its sign-in page isn't the one registered for ${here.name}. Flagged before you type anything.`;
  }
  if (att && att.verdict === 'unverified') {
    const owner = areas.find((a) => a.ssid === att.net.ssid);
    if (owner && owner.id !== here?.id) {
      return `The attacker copied ${att.net.ssid}, but that name is registered at ${owner.name}, not where you are. With nothing to compare against, the best it can get is Unverified. Never Verified.`;
    }
    return `The attacker uses a name nobody registered, so it shows as Unverified. It can't borrow anyone's Verified.`;
  }
  if (!here) {
    return rows.length
      ? 'Nothing is registered where your phone is, so every network shows as Unverified. No worse than today.'
      : 'No networks in range. Move the phone closer to a building.';
  }
  const real = rows.find((r) => r.verdict === 'verified');
  if (real) {
    return attacker
      ? `${real.net.ssid} matches what ${here.name} registered here. The attacker is out of range.`
      : `${real.net.ssid} matches what ${here.name} registered here. Now drop an attacker and copy its name.`;
  }
  return `You are inside ${here.name}'s registered area, but its network is out of range.`;
}
