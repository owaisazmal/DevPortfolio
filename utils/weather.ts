import { useCallback, useEffect, useState } from "react";

export type Unit = "F" | "C";
export type Condition = { label: string; icon: string[] };
export type Day = Condition & { date: string; weekday: string; high: number; low: number };
export type Weather = Condition & {
  temp: number;
  isDay: boolean;
  updated: string;
  days: Day[];
};

type Forecast = {
  current?: { time?: string; temperature_2m?: number; weather_code?: number; is_day?: number };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

export const place = { name: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437 };

const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
  "&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min" +
  "&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles&forecast_days=5";

const cacheKey = "weather:la";
const ttl = 15 * 60_000;

const sun = [
  ".......#........",
  ".......#........",
  "..#.........#...",
  "...#..###..#....",
  ".....#...#......",
  "....#.....#.....",
  "....#.....#.....",
  "##..#.....#..##.",
  "....#.....#.....",
  "....#.....#.....",
  ".....#...#......",
  "...#..###..#....",
  "..#.........#...",
  ".......#........",
  ".......#........",
  "................",
];

const moon = [
  "................",
  ".....#####......",
  "...######.......",
  "..#####.........",
  "..####.......#..",
  ".#####......###.",
  ".#####.......#..",
  ".#####..........",
  ".#####..........",
  ".#####..........",
  "..####..........",
  "..#####.........",
  "...######.......",
  ".....#####......",
  "................",
  "................",
];

const partly = [
  "..........#.....",
  "..........#.....",
  ".......#.....#..",
  ".........###....",
  "........#...#...",
  ".....##.#...#.##",
  "........#...#...",
  "...####..###....",
  "..#....#.....#..",
  ".#......##......",
  "#.........#.....",
  "#.........#.....",
  "#.........#.....",
  ".#########......",
  "................",
  "................",
];

const overcast = [
  "................",
  "................",
  "................",
  "................",
  "......####......",
  ".....#.#.##.....",
  "....#.#.#.##....",
  "..##.#.#.#.###..",
  ".##.#.#.#.#.#.#.",
  "##.#.#.#.#.#.#.#",
  "#.#.#.#.#.#.#.##",
  ".#.#.#.#.#.#.##.",
  "..############..",
  "................",
  "................",
  "................",
];

const fog = [
  "................",
  "................",
  "................",
  "..###########...",
  "................",
  "....###########.",
  "................",
  ".###########....",
  "................",
  "...###########..",
  "................",
  ".....#########..",
  "................",
  "..#########.....",
  "................",
  "................",
];

const cloudTop = [
  "................",
  "......####......",
  ".....#....#.....",
  "....#......#....",
  "..##........##..",
  ".#............#.",
  "#..............#",
  "#..............#",
  ".#............#.",
  "..############..",
  "................",
];

const rain = [
  ...cloudTop,
  ".....#...#...#..",
  "....#...#...#...",
  "................",
  "...#...#...#....",
  "..#...#...#.....",
];

const snow = [
  ...cloudTop,
  "...#......#.....",
  "..###....###....",
  "...#..#...#.....",
  ".....###........",
  "......#.........",
];

const thunder = [
  ...cloudTop,
  "........###.....",
  ".......##.......",
  "......#####.....",
  "........##......",
  ".......#........",
];

export const icons = { sun, moon, partly, overcast, fog, rain, snow, thunder };

const conditions: [codes: number[], label: string, icon: string[]][] = [
  [[0], "Clear", sun],
  [[1], "Mostly clear", sun],
  [[2], "Partly cloudy", partly],
  [[3], "Overcast", overcast],
  [[45, 48], "Fog", fog],
  [[51, 53, 55, 56, 57], "Drizzle", rain],
  [[61, 63, 65, 66, 67, 80, 81, 82], "Rain", rain],
  [[71, 73, 75, 77, 85, 86], "Snow", snow],
  [[95, 96, 99], "Thunderstorm", thunder],
];

export const condition = (code: number, isDay = true): Condition => {
  const match = conditions.find(([codes]) => codes.includes(code));
  if (!match) return { label: `Code ${code}`, icon: overcast };
  const [, label, icon] = match;
  return { label, icon: icon === sun && !isDay ? moon : icon };
};

export const toUnit = (fahrenheit: number, unit: Unit) =>
  Math.round(unit === "C" ? ((fahrenheit - 32) * 5) / 9 : fahrenheit);

const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long" });

const weekday = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return weekdayFormat.format(new Date(year, month - 1, day, 12));
};

const clock = (iso: string) => {
  const [hours, minutes] = iso.slice(11, 16).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
};

const parse = (data: Forecast): Weather | null => {
  const current = data.current;
  const daily = data.daily;
  if (!current || !daily || !Array.isArray(daily.time)) return null;

  const days = daily.time.slice(0, 5).map((date, i) => ({
    date,
    weekday: weekday(date),
    high: Number(daily.temperature_2m_max?.[i]),
    low: Number(daily.temperature_2m_min?.[i]),
    ...condition(Number(daily.weather_code?.[i])),
  }));

  const temp = Number(current.temperature_2m);
  const valid =
    Number.isFinite(temp) &&
    days.length > 0 &&
    days.every((day) => Number.isFinite(day.high) && Number.isFinite(day.low));
  if (!valid) return null;

  const isDay = current.is_day !== 0;
  return {
    temp,
    isDay,
    updated: clock(current.time ?? ""),
    days,
    ...condition(Number(current.weather_code), isDay),
  };
};

const readCache = (): Weather | null => {
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: Forecast };
    return Date.now() - at < ttl ? parse(data) : null;
  } catch {
    return null;
  }
};

const writeCache = (data: Forecast) => {
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data }));
  } catch {}
};

let inflight: Promise<Weather | null> | null = null;

export const fetchWeather = (): Promise<Weather | null> => {
  if (typeof window === "undefined") return Promise.resolve(null);
  const cached = readCache();
  if (cached) return Promise.resolve(cached);

  inflight ??= fetch(url)
    .then((res) => (res.ok ? (res.json() as Promise<Forecast>) : null))
    .then((data) => {
      const weather = data ? parse(data) : null;
      if (data && weather) writeCache(data);
      return weather;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

type State = { weather: Weather | null; loading: boolean };

export const useWeather = (enabled = true) => {
  const [state, setState] = useState<State>({ weather: null, loading: true });
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    setState((current) => (current.weather ? current : { weather: null, loading: true }));
    fetchWeather().then((weather) => {
      if (live) setState({ weather, loading: false });
    });
    return () => {
      live = false;
    };
  }, [enabled, attempt]);

  return { ...state, refresh };
};
