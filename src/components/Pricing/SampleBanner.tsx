export default function SampleBanner({ count, onClear }: { count: number; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <div role="note" className="flex items-center justify-between gap-2 bg-amber-100 px-3 py-1 text-xs text-amber-900">
      <span><strong>Sample data</strong> — {count} demo price records near Jhansi. Not real prices.</span>
      <button type="button" className="underline" style={{ minHeight: 44 }} onClick={onClear}>Clear sample data</button>
    </div>
  );
}
