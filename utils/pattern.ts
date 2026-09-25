export type Pattern = boolean[];

export const side = 8;
const cells = side * side;
const tile = side * 2;

export const fromMap = (rows: string[]): Pattern =>
  Array.from({ length: cells }, (_, i) => rows[Math.floor(i / side)]?.[i % side] === "#");

export const encode = (pattern: Pattern) => pattern.map((on) => (on ? "1" : "0")).join("");

export const decode = (text: string): Pattern | null =>
  text.length === cells && /^[01]+$/.test(text) ? Array.from(text, (ch) => ch === "1") : null;

export const same = (a: Pattern, b: Pattern) =>
  a.length === b.length && a.every((on, i) => on === b[i]);

export const presets = [
  {
    name: "Dots",
    map: ["#.......", "........", "........", "........", "........", "........", "........", "........"],
  },
  {
    name: "Checker",
    map: ["#.#.#.#.", ".#.#.#.#", "#.#.#.#.", ".#.#.#.#", "#.#.#.#.", ".#.#.#.#", "#.#.#.#.", ".#.#.#.#"],
  },
  {
    name: "Diagonal",
    map: ["#...#...", ".#...#..", "..#...#.", "...#...#", "#...#...", ".#...#..", "..#...#.", "...#...#"],
  },
  {
    name: "Brick",
    map: ["########", "#.......", "#.......", "#.......", "########", "....#...", "....#...", "....#..."],
  },
  {
    name: "Weave",
    map: ["#####.#.", "....#.#.", "#####.#.", "....#.#.", "#.#.####", "#.#.....", "#.#.####", "#.#....."],
  },
  {
    name: "Scales",
    map: ["...##...", "..#..#..", ".#....#.", "#......#", "#......#", ".#....#.", "..#..#..", "...##..."],
  },
  {
    name: "Crosses",
    map: [".#......", "###.....", ".#......", "........", ".....#..", "....###.", ".....#..", "........"],
  },
  {
    name: "Blank",
    map: ["........", "........", "........", "........", "........", "........", "........", "........"],
  },
].map(({ name, map }) => ({ name, pattern: fromMap(map) }));

export const readInk = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "43 43 43";

export const buildPatternUrl = (pattern: Pattern, inkRgb: string) => {
  const fill = `rgb(${inkRgb.trim().split(/\s+/).join(",")})`;
  const d = pattern
    .map((on, i) => (on ? `M${i % side} ${Math.floor(i / side)}h1v1h-1z` : ""))
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges">` +
    (d ? `<path d="${d}" fill="${fill}" fill-opacity="0.16"/>` : "") +
    "</svg>";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const applyPattern = (pattern: Pattern | null) => {
  const style = document.documentElement.style;
  const css = pattern ? `url("${buildPatternUrl(pattern, readInk())}")` : null;
  if (css) {
    style.setProperty("--desktop-pattern", css);
    style.setProperty("--desktop-size", `${tile}px ${tile}px`);
  } else {
    style.removeProperty("--desktop-pattern");
    style.removeProperty("--desktop-size");
  }
  try {
    if (pattern && css) {
      localStorage.setItem("pattern", encode(pattern));
      localStorage.setItem("pattern-css", css);
    } else {
      localStorage.removeItem("pattern");
      localStorage.removeItem("pattern-css");
    }
  } catch {}
};

export const restorePattern = (): Pattern | null => {
  let pattern: Pattern | null = null;
  try {
    const saved = localStorage.getItem("pattern");
    pattern = saved ? decode(saved) : null;
  } catch {}
  applyPattern(pattern);
  return pattern;
};
