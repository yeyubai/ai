'use client';

type Point = {
  date: string;
  weightKg: number | null;
};

function buildPath(points: Point[], width: number, height: number): {
  path: string;
  dots: Array<{ x: number; y: number; point: Point }>;
} {
  const validPoints = points.filter((point) => point.weightKg !== null);
  if (validPoints.length === 0) {
    return { path: '', dots: [] };
  }

  const weights = validPoints.map((point) => point.weightKg ?? 0);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const dots = validPoints.map((point, index) => {
    const x = validPoints.length === 1 ? width / 2 : (width / (validPoints.length - 1)) * index;
    const y = height - (((point.weightKg ?? min) - min) / range) * (height - 16) - 8;
    return { x, y, point };
  });

  const path = dots
    .map((dot, index) => `${index === 0 ? 'M' : 'L'} ${dot.x.toFixed(2)} ${dot.y.toFixed(2)}`)
    .join(' ');

  return { path, dots };
}

export function MiniLineChart({
  points,
  onSelect,
}: {
  points: Point[];
  onSelect?: (point: Point) => void;
}) {
  const width = 320;
  const height = 220;
  const { path, dots } = buildPath(points, width, height);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[240px] w-full overflow-visible"
      role="img"
      aria-label="体重趋势图"
    >
      {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
        <line
          key={ratio}
          x1="0"
          y1={height * ratio}
          x2={width}
          y2={height * ratio}
          className="stroke-white/15"
          strokeWidth="1"
        />
      ))}
      {path ? (
        <>
          <path
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {dots.map((dot) => (
            <g key={dot.point.date}>
              <circle cx={dot.x} cy={dot.y} r="7" fill="rgba(255,255,255,0.18)" />
              <circle
                cx={dot.x}
                cy={dot.y}
                r="4.5"
                fill="#ffffff"
                onClick={() => onSelect?.(dot.point)}
                className="cursor-pointer"
              />
            </g>
          ))}
        </>
      ) : null}
    </svg>
  );
}
