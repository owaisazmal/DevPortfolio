type PixelIconProps = {
  map: string[];
  fills: Record<string, string>;
  size?: number;
  className?: string;
};

export const PixelIcon = ({ map, fills, size = 16, className }: PixelIconProps) => {
  const width = Math.max(...map.map((row) => row.length));
  return (
    <svg
      viewBox={`0 0 ${width} ${map.length}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {map.flatMap((row, y) =>
        row.split("").map((ch, x) =>
          fills[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fills[ch]} /> : null,
        ),
      )}
    </svg>
  );
};
