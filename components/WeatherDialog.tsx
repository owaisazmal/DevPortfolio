"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";
import { Day, Unit, Weather, icons, place, toUnit, useWeather } from "@/utils/weather";

import { Dialog } from "./ui/Dialog";
import { PixelIcon } from "./ui/PixelIcon";

const fills = { "#": "currentColor" };
const unitKey = "weather-unit";

const rowGrid =
  "grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[1rem_minmax(0,1fr)_7rem_5rem_auto]";

const coords = `${place.latitude.toFixed(2)}° N, ${Math.abs(place.longitude).toFixed(2)}° W`;

const Range = ({ day, min, max }: { day: Day; min: number; max: number }) => {
  const span = Math.max(1, max - min);
  const left = ((day.low - min) / span) * 100;
  const width = ((day.high - day.low) / span) * 100;
  return (
    <span aria-hidden className="relative hidden h-2 border border-current sm:block">
      <span
        className="absolute inset-y-0 bg-current"
        style={{ left: `${left}%`, width: `${width}%`, minWidth: 2 }}
      />
    </span>
  );
};

const Report = ({ weather, unit, onUnit }: { weather: Weather; unit: Unit; onUnit: () => void }) => {
  const lows = weather.days.map((day) => day.low);
  const highs = weather.days.map((day) => day.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);

  return (
    <>
      <div className="flex items-center gap-5">
        <PixelIcon map={weather.icon} fills={fills} size={56} className="shrink-0" />
        <div className="min-w-0">
          <button
            type="button"
            onClick={onUnit}
            aria-label={`Show in ${unit === "F" ? "Celsius" : "Fahrenheit"}`}
            className="group flex items-start gap-1.5 text-left"
          >
            <span className="font-serif text-6xl leading-none">{toUnit(weather.temp, unit)}°</span>
            <span className="mt-1 border-2 border-ink px-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors group-hover:bg-ink group-hover:text-paper">
              {unit}
            </span>
          </button>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            {weather.label} &middot; {place.name}
          </p>
        </div>
      </div>

      <div className="mt-6 border-2 border-ink bg-surface text-sm">
        <p className="border-b-2 border-ink px-3 py-1 text-center font-mono text-[11px] text-ink-soft">
          {weather.days.length} items, {coords}
        </p>
        <div
          className={cn(
            rowGrid,
            "border-b-2 border-ink px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
          )}
        >
          <span />
          <span>Day</span>
          <span className="hidden sm:block">Sky</span>
          <span className="hidden sm:block">Range</span>
          <span className="text-right">Hi / Lo</span>
        </div>
        <ul>
          {weather.days.map((day, i) => (
            <li
              key={day.date}
              className={cn(
                rowGrid,
                "border-b-2 border-dotted border-ash px-3 py-2 last:border-b-0",
                i === 0 ? "bg-ink text-paper" : "hover:bg-steel-wash",
              )}
            >
              <PixelIcon map={day.icon} fills={fills} size={16} className="shrink-0" />
              <span className="min-w-0">
                <span className="flex items-baseline gap-2">
                  <span className="truncate font-medium">{day.weekday}</span>
                  {i === 0 && (
                    <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">today</span>
                  )}
                </span>
                <span className="block truncate font-mono text-[11px] opacity-70 sm:hidden">{day.label}</span>
              </span>
              <span className="hidden truncate font-mono text-xs sm:block">{day.label}</span>
              <Range day={day} min={min} max={max} />
              <span className="whitespace-nowrap text-right font-mono text-xs tabular-nums">
                {toUnit(day.high, unit)}°<span className="opacity-60"> / {toUnit(day.low, unit)}°</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        Updated {weather.updated} &middot;{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-steel-deep underline-offset-4"
        >
          Open-Meteo
        </a>
      </p>
    </>
  );
};

const Loading = () => (
  <div className="flex items-center gap-5">
    <span aria-hidden className="h-14 w-14 shrink-0 border-2 border-dotted border-ash" />
    <div>
      <p className="font-serif text-6xl leading-none">
        <span className="animate-blink">…</span>
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        Fetching &middot; {place.name}
      </p>
    </div>
  </div>
);

const Offline = () => (
  <div className="flex items-start gap-5">
    <PixelIcon map={icons.sun} fills={fills} size={56} className="shrink-0" />
    <div>
      <p className="font-serif text-2xl leading-tight">Weather is offline.</p>
      <p className="mt-2 leading-relaxed text-ink-soft">Assume sunny, it usually is.</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        {place.name} &middot; No data
      </p>
    </div>
  </div>
);

const WeatherDialog = () => {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<Unit>("F");
  const { weather, loading, refresh } = useWeather(open);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onDialog = (event: Event) =>
      setOpen((event as CustomEvent<{ name: string }>).detail.name === "weather");
    window.addEventListener("portfolio:dialog", onDialog);
    return () => window.removeEventListener("portfolio:dialog", onDialog);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(unitKey) === "C") setUnit("C");
    } catch {}
  }, []);

  const toggleUnit = () => {
    const next: Unit = unit === "F" ? "C" : "F";
    play("click");
    setUnit(next);
    try {
      localStorage.setItem(unitKey, next);
    } catch {}
  };

  return (
    <Dialog open={open} onClose={close} title="Weather Util">
      {loading ? <Loading /> : weather ? <Report weather={weather} unit={unit} onUnit={toggleUnit} /> : <Offline />}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {!loading && !weather && (
          <button
            type="button"
            onClick={() => {
              play("click");
              refresh();
            }}
            className="btn-retro btn-paper"
          >
            Try again
          </button>
        )}
        <button type="button" onClick={close} className="btn-retro btn-ink">
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default WeatherDialog;
