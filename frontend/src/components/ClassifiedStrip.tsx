/** Horizontal classified strip footer / header decoration */
export default function ClassifiedStrip({ text = 'TOP SECRET // OPERATION QUICKSILVER // EYES ONLY' }: { text?: string }) {
  return (
    <div
      style={{
        background: 'var(--accent)',
        color: '#fff',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '4px 0',
        userSelect: 'none',
      }}
    >
      {text}
    </div>
  );
}
