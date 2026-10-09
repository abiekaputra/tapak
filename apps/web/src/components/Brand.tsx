// Module responsible for rendering the Tapak product identity.
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <img src="/tapak-mark.png" alt="" />
      <div>
        <strong>Tapak</strong>
        {!compact && <span>Every handoff leaves a trace.</span>}
      </div>
    </div>
  );
}
