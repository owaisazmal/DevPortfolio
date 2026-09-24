export type Box = { x: number; y: number; width: number; height: number };

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const centerBox = (box: Box, size = 28): Box => ({
  x: box.x + box.width / 2 - size / 2,
  y: box.y + box.height / 2 - size / 2,
  width: size,
  height: size,
});

const frame = (box: Box) => ({
  left: `${box.x}px`,
  top: `${box.y}px`,
  width: `${box.width}px`,
  height: `${box.height}px`,
});

export function zoomRects(from: Box, to: Box, count = 5): Promise<void> {
  if (
    typeof document === "undefined" ||
    reducedMotion() ||
    typeof Element.prototype.animate !== "function"
  ) {
    return Promise.resolve();
  }

  const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "43 43 43";
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;z-index:9990;pointer-events:none;";

  const animations = Array.from({ length: count }, (_, i) => {
    const rect = document.createElement("div");
    rect.style.cssText = `position:absolute;box-sizing:border-box;border:2px solid rgb(${ink});`;
    layer.appendChild(rect);
    return rect.animate([frame(from), frame(to)], {
      duration: 240,
      delay: i * 35,
      easing: "steps(7, end)",
      fill: "both",
    });
  });

  document.body.appendChild(layer);
  const done = Promise.all(animations.map((animation) => animation.finished));
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 900));
  const cleanup = () => {
    animations.forEach((animation) => animation.cancel());
    layer.remove();
  };
  return Promise.race([done, timeout]).then(cleanup, cleanup);
}
