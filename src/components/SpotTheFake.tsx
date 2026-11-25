import { useState } from 'react';
import { Chip } from './Chip';
import { Icon } from './Icon';

// Two portals that look the same. Fictional airport, fictional domains
// (.example is reserved for documentation, so neither can ever resolve).
const portals = [
  {
    id: 'a',
    real: false,
    domain: 'login.wipkingen-airport.com',
    verdict: 'conflict' as const,
    note: 'Not the sign-in page registered for this location.',
  },
  {
    id: 'b',
    real: true,
    domain: 'login.airport-wipkingen.com',
    verdict: 'verified' as const,
    note: 'Registered for this location.',
  },
];

export default function SpotTheFake() {
  const [picked, setPicked] = useState<string | null>(null);
  const pickedReal = portals.find((p) => p.id === picked)?.real;

  return (
    <div className="quiz">
      <div className="quiz__pair">
        {portals.map((p, i) => (
          <article
            key={p.id}
            className="portal"
            data-picked={picked === p.id}
            data-revealed={picked !== null}
            aria-label={`Sign-in page ${i + 1}`}
          >
            <div className="portal__bar">
              <Icon name="lock" size="sm" />
              {/* The real domains are shown from the start: honest, and as easy to miss as on a phone. */}
              <span className="portal__url">{p.domain}</span>
            </div>
            <div className="portal__body">
              <p className="portal__brand">
                <Icon name="plane" />
                Airport Wipkingen
              </p>
              <p className="title">Welcome to Airport Wipkingen</p>
              <div className="portal__field" aria-hidden="true">
                Email
                <span className="portal__input">you@example.com</span>
              </div>
              <button
                type="button"
                className="btn btn--secondary"
                aria-pressed={picked === p.id}
                onClick={() => setPicked(p.id)}
              >
                This one is real
              </button>
            </div>
            <div className="portal__foot portal__reveal">
              <p className="caption">What GECKOGuard sees</p>
              <p className="mono">{p.domain}</p>
              <Chip verdict={p.verdict} />
              <p className="caption">{p.note}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="quiz__result" aria-live="polite">
        {picked !== null && (
          <>
            <p className="title-lg">
              {pickedReal ? 'That one is the real one.' : "That one is the attacker's."}
            </p>
            <p className="lead">
              {pickedReal ? "In reality, most people can't tell" : "You couldn't tell"} and neither can your phone. They look the same because copying a page is
              trivial. The difference is a small deviation from the real domain, which you probably don't even know. GECKOGuard doesn't need to spot it. It checks which sign-in page is registered here.
            </p>
            <button type="button" className="btn btn--ghost" onClick={() => setPicked(null)}>
              <Icon name="reset" size="sm" />
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
