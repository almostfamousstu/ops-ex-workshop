interface StatusPillProps {
  status: 'evaluating' | 'complete' | 'error' | 'locked' | 'active';
  label?: string;
}

const COLOR_MAP: Record<string, string> = {
  evaluating: 'var(--amber)',
  complete: 'var(--green)',
  error: 'var(--accent)',
  locked: 'var(--text-3)',
  active: 'var(--text-1)',
};

const LABEL_MAP: Record<string, string> = {
  evaluating: 'EVALUATING',
  complete: 'COMPLETE',
  error: 'ERROR',
  locked: 'LOCKED',
  active: 'ACTIVE',
};

export default function StatusPill({ status, label }: StatusPillProps) {
  const color = COLOR_MAP[status] ?? 'var(--text-2)';
  const text = label ?? LABEL_MAP[status] ?? status.toUpperCase();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color,
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
        }}
      />
      {text}
    </span>
  );
}
