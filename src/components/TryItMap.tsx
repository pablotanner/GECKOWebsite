import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { Listbox, type Option } from './map/Listbox';
import { areas, clamp, explain, kiosk, RANGE, scan, START, VIEW, type Network, type Point } from './map/model';

const CUSTOM = '__custom__';
const MAX_SSID = 32;

const options: Option[] = [
  ...areas.map((a) => ({ value: a.ssid, label: a.ssid })),
  { value: CUSTOM, label: 'Custom name...' },
];

type Handle = 'phone' | 'attacker';

export default function TryItMap() {
  const [phone, setPhone] = useState<Point>(START.phone);
  const [attackerPos, setAttackerPos] = useState<Point | null>(null);
  const [choice, setChoice] = useState(areas[0].ssid);
  const [custom, setCustom] = useState('Free Airport WiFi');
  const [placing, setPlacing] = useState(false);
  const [dragging, setDragging] = useState<Handle | null>(null);
  const [k, setK] = useState(1); // map units per screen pixel

  const svg = useRef<SVGSVGElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const attackerRef = useRef<SVGGElement>(null);
  const focusAttacker = useRef(false);

  // Keep labels and handles a constant on-screen size, however wide the map is.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(VIEW.w / Math.max(1, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // CSS touch-action is not honoured on SVG elements, so a drag on a marker
  // would turn into a page scroll and be cancelled. Block scrolling only for
  // touches that start on a marker; the rest of the map still scrolls the page.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const stop = (e: TouchEvent) => {
      if ((e.target as Element).closest?.('.map-handle')) e.preventDefault();
    };
    el.addEventListener('touchstart', stop, { passive: false });
    return () => el.removeEventListener('touchstart', stop);
  }, []);

  useEffect(() => {
    if (focusAttacker.current && attackerPos) { attackerRef.current?.focus(); focusAttacker.current = false; }
  }, [attackerPos]);

  useEffect(() => {
    if (!placing) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setPlacing(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [placing]);

  const customValid = custom.trim().length > 0 && custom.length <= MAX_SSID;
  const attackerSsid = choice === CUSTOM ? (customValid ? custom.trim() : '') : choice;
  const attacker: Network | null = useMemo(
    () => (attackerPos && attackerSsid ? { id: 'attacker', ssid: attackerSsid, pos: attackerPos, kind: 'attacker' } : null),
    [attackerPos, attackerSsid],
  );
  const { here, rows } = useMemo(() => scan(phone, attacker), [phone, attacker]);
  const sentence = explain(here, rows, attacker);

  const s = Math.min(2.6, Math.max(1, k * 0.85)); // handle scale
  const labelSize = Math.max(12, 12 * k);
  const showSsidLabels = k < 1.35;

  const toMap = (e: { clientX: number; clientY: number }): Point => {
    const el = svg.current!;
    const pt = el.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse());
    return clamp({ x: p.x, y: p.y });
  };

  const move = (h: Handle, p: Point) => (h === 'phone' ? setPhone(clamp(p)) : setAttackerPos(clamp(p)));

  const handleProps = (h: Handle, pos: Point) => ({
    tabIndex: 0,
    role: 'button',
    'aria-roledescription': 'movable marker',
    className: `map-handle ${h === 'phone' ? 'map-phone' : 'map-ap map-ap--attacker'}`,
    'data-dragging': dragging === h,
    transform: `translate(${pos.x} ${pos.y}) scale(${s})`,
    onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
      (e.currentTarget as SVGGElement).focus();
      setDragging(h);
    },
    onPointerMove: (e: React.PointerEvent) => { if (dragging === h) move(h, toMap(e)); },
    onPointerUp: () => setDragging(null),
    onPointerCancel: () => setDragging(null),
    onKeyDown: (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 40 : 10;
      const d = ({ ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] } as Record<string, number[]>)[e.key];
      if (!d) return;
      e.preventDefault();
      move(h, { x: pos.x + d[0], y: pos.y + d[1] });
    },
  });

  const dropAttacker = (e: React.MouseEvent) => {
    if (attackerPos) { setAttackerPos(null); setPlacing(false); return; }
    if (e.detail === 0) {
      // Keyboard: drop it next to the phone and move focus to it.
      focusAttacker.current = true;
      setAttackerPos(clamp({ x: phone.x + 90, y: phone.y + 40 }));
    } else {
      if (!placing) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        wrap.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
      setPlacing((p) => !p);
    }
  };

  const onMapClick = (e: React.MouseEvent) => {
    if (!placing) return;
    setAttackerPos(toMap(e));
    setPlacing(false);
  };

  const reset = () => {
    setPhone(START.phone); setAttackerPos(null); setChoice(areas[0].ssid);
    setCustom('Free Airport WiFi'); setPlacing(false);
  };

  const where = here ? here.name : 'Outside any registered area';

  return (
    <div className="tryit">
      <div className="tryit__stage">
        <div className="map tryit__map" ref={wrap} data-placing={placing}>
          <svg
            ref={svg}
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            role="group"
            aria-label="Map of a fictional neighbourhood with an airport terminal, a café and a university"
            onClick={onMapClick}
          >
            <defs>
              <pattern id="tryit-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)" className="map-area-hatch">
                <line x1="0" y1="0" x2="0" y2="8" />
              </pattern>
            </defs>
            <rect className="map-ground" width={VIEW.w} height={VIEW.h} />
            <path className="map-road" d="M0 325 H800" strokeWidth="44" />
            <path className="map-road" d="M520 0 V500" strokeWidth="36" />
            <path className="map-road" d="M330 325 V500" strokeWidth="20" />

            {/* buildings */}
            <rect className="map-building" x="36" y="36" width="440" height="260" rx="8" />
            <rect className="map-building" x="560" y="44" width="208" height="166" rx="8" />
            <rect className="map-building" x="560" y="356" width="208" height="128" rx="8" />
            <rect className="map-building" x="96" y="380" width="110" height="80" rx="8" />
            <rect className="map-building" x="380" y="372" width="100" height="96" rx="8" />

            {/* registered areas */}
            {areas.map((a) => {
              const pts = a.points.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <g key={a.id} aria-hidden="true">
                  <polygon className="map-area" points={pts} />
                  <polygon points={pts} fill="url(#tryit-hatch)" />
                  <text className="map-label" x={a.labelAt.x} y={a.labelAt.y} style={{ fontSize: labelSize }}>{a.label}</text>
                  {showSsidLabels && (
                    <text className="map-label map-label--ssid" x={a.labelAt.x} y={a.labelAt.y + labelSize * 1.4} style={{ fontSize: labelSize * 0.85 }}>
                      {a.ssid}
                    </text>
                  )}
                </g>
              );
            })}
            <text className="map-label map-label--ssid" x="96" y="372" style={{ fontSize: labelSize * 0.85 }} aria-hidden="true">Kiosk: nothing registered</text>

            {/* genuine and unregistered access points */}
            {[...areas.map((a) => a.ap), kiosk.pos].map((p, i) => (
              <g key={i} className="map-ap" transform={`translate(${p.x} ${p.y}) scale(${s})`} aria-hidden="true">
                <circle className="map-ap__mast" r="13" />
                <g transform="translate(-7.5 -7.5) scale(0.625)"><path className="map-ap__glyph" d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0" /></g>
              </g>
            ))}

            {/* the phone's reception range */}
            <circle className="map-radius" cx={phone.x} cy={phone.y} r={RANGE} aria-hidden="true" />

            {attackerPos && (
              <g ref={attackerRef} {...handleProps('attacker', attackerPos)} aria-label={`Attacker access point, broadcasting ${attackerSsid || 'no name yet'}. Arrow keys move it.`}>
                <circle className="map-focus" r="22" />
                <circle className="map-hit" r="22" />
                <circle className="map-ap__mast" r="14" />
                <g transform="translate(-8 -8) scale(0.667)"><path className="map-ap__glyph" d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" /></g>
              </g>
            )}

            <g {...handleProps('phone', phone)} aria-label={`Your phone, ${here ? 'inside ' + here.name : 'outside any registered area'}. Arrow keys move it.`}>
              <circle className="map-focus" r="22" />
              <circle className="map-hit" r="22" />
              <rect className="map-phone__body" x="-9" y="-15" width="18" height="30" rx="4" />
              <rect className="map-phone__screen" x="-6" y="-11" width="12" height="19" rx="1.5" />
            </g>
          </svg>
          {placing && <p className="tryit__hint" role="status">Click or tap on the map to drop the attacker. Escape cancels.</p>}
        </div>

        <ul className="tryit__legend" aria-label="Legend">
          <li><span className="tryit__swatch tryit__swatch--area hatch" aria-hidden="true" />Registered area</li>
          <li><span className="tryit__swatch tryit__swatch--ap" aria-hidden="true"><Icon name="wifi" size="sm" /></span>Access point</li>
          <li><span className="tryit__swatch tryit__swatch--attacker" aria-hidden="true"><Icon name="laptop" size="sm" /></span>Attacker</li>
          <li><span className="tryit__swatch tryit__swatch--range" aria-hidden="true" />What your phone can hear</li>
        </ul>

      </div>

      <div className="tryit__panel">
        <div className="tryit__phone">
          <div className="tryit__phone-head">
            <p className="title">Nearby networks</p>
            <p className="caption"><Icon name="phone" size="sm" /> {where}</p>
          </div>
          <ul className="tryit__list" aria-label="Nearby networks and their verdicts">
            {rows.length === 0 && <li className="caption tryit__empty">No networks in range.</li>}
            {rows.map((r) => (
              <li key={r.net.id} className="network" data-verdict={r.verdict}>
                <span className="network__icon"><Icon name={r.net.kind === 'attacker' ? 'laptop' : 'wifi'} /></span>
                <span className="network__ssid">{r.net.ssid}</span>
                <span className="network__meta">
                  <Chip verdict={r.verdict} />
                  {r.net.kind === 'attacker' && <span>Attacker</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="tryit__explain" aria-live="polite">{sentence}</p>

        <div className="tryit__controls">
          <button type="button" className="btn btn--secondary" aria-pressed={placing} onClick={dropAttacker}>
            <Icon name={attackerPos ? 'close' : 'laptop'} size="sm" />
            {attackerPos ? 'Remove attacker' : placing ? 'Cancel' : 'Drop an attacker'}
          </button>
          <Listbox label="The attacker copies" options={options} value={choice} onChange={setChoice} />
          {choice === CUSTOM && (
            <div className="field">
              <label className="label" htmlFor="tryit-custom">Custom network name</label>
              <input
                id="tryit-custom"
                className="input"
                value={custom}
                maxLength={MAX_SSID + 8}
                aria-invalid={!customValid}
                aria-describedby="tryit-custom-msg"
                onChange={(e) => setCustom(e.target.value)}
              />
              {customValid
                ? <span className="field__hint" id="tryit-custom-msg">Up to {MAX_SSID} characters, like a real network name.</span>
                : <span className="field__error" id="tryit-custom-msg"><Icon name="alert" size="sm" />{custom.trim() ? `Network names are at most ${MAX_SSID} characters.` : 'Type a name, or pick one from the list.'}</span>}
            </div>
          )}
          <button type="button" className="btn btn--ghost tryit__reset" onClick={reset}>
            <Icon name="reset" size="sm" />Reset
          </button>
        </div>
      </div>
    </div>
  );
}
