import { formatNumber } from "@/lib/utils";

/** Dependency-free SVG bar chart (one series, one bar per day). Hover shows the value. */
export function BarChart({ data, label, height = 160, color = "#059669" }: { data: { day: string; value: number }[]; label: string; height?: number; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / data.length;
  const total = data.reduce((s, d) => s + d.value, 0);
  const ticks = max >= 4 ? [max, Math.round(max / 2), 0] : [max, 0];
  return (
    <figure>
      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-right text-[10px] text-ink-400 num" style={{ height }}>
          {ticks.map((t, i) => <span key={i}>{formatNumber(t)}</span>)}
        </div>
        <div className="relative flex-1" style={{ height }}>
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((_, i) => <div key={i} className="border-t border-dashed border-ink-100" />)}
          </div>
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label={`${label}: ${formatNumber(total)} in ${data.length} days`}>
            {data.map((d, i) => {
              const h = (d.value / max) * (height - 2);
              return (
                <g key={d.day}>
                  <rect x={i * w} y={0} width={w} height={height} fill="transparent">
                    <title>{`${d.day}: ${formatNumber(d.value)}`}</title>
                  </rect>
                  {d.value > 0 && (
                    <rect x={i * w + w * 0.18} y={height - h} width={w * 0.64} height={h} rx={0.6} fill={color}>
                      <title>{`${d.day}: ${formatNumber(d.value)}`}</title>
                    </rect>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 flex justify-between pl-8 text-[10px] text-ink-400">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{data.at(-1)?.day.slice(5)}</span>
      </figcaption>
    </figure>
  );
}
