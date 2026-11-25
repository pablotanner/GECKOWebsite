import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../Icon';

// The kit's listbox pattern (never a native <select>): a button that announces
// the current value, a popup listbox, and full keyboard support (arrows,
// Home/End, typeahead, Enter/Space, Escape, Tab closes).

export interface Option { value: string; label: string }

export function Listbox({ label, options, value, onChange }: {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    if (!open) return;
    setActive(selected);
    list.current?.focus();
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
    trigger.current?.focus();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const n = options.length;
    switch (e.key) {
      case 'ArrowDown': setActive((a) => (a + 1) % n); break;
      case 'ArrowUp': setActive((a) => (a - 1 + n) % n); break;
      case 'Home': setActive(0); break;
      case 'End': setActive(n - 1); break;
      case 'Enter': case ' ': choose(active); break;
      case 'Escape': setOpen(false); trigger.current?.focus(); break;
      case 'Tab': setOpen(false); return;
      default: {
        if (e.key.length !== 1) return;
        const i = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
        if (i >= 0) setActive(i);
      }
    }
    e.preventDefault();
  };

  return (
    <div className="listbox" ref={root}>
      <span className="label" id={`${id}-label`}>{label}</span>
      <button
        ref={trigger}
        type="button"
        className="listbox__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); } }}
      >
        <span id={`${id}-value`}>{options[selected]?.label}</span>
        <Icon name="chevron" size="sm" />
      </button>
      <ul
        ref={list}
        className="listbox__popup"
        role="listbox"
        tabIndex={-1}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        hidden={!open}
        onKeyDown={onListKey}
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={`${id}-opt-${i}`}
            role="option"
            className="listbox__option"
            aria-selected={i === selected}
            data-active={i === active}
            onClick={() => choose(i)}
            onPointerMove={() => setActive(i)}
          >
            {o.label}
            <Icon name="check" size="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
