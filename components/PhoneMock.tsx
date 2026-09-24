"use client";

import { useEffect, useState } from "react";

import { projects } from "@/data";
import { cn } from "@/utils/cn";
import { reducedMotion } from "@/utils/zoomRects";

const notifications = [
  {
    app: "Rin",
    icon: "./rin-icon.png",
    time: "now",
    text: "Day 23 of showing up. Your habits are proud of you.",
  },
  {
    app: "Kitefold",
    icon: "./kitefold-icon.png",
    time: "2 min ago",
    text: "3 files converted. Not a single one left your phone.",
  },
  {
    app: "Owais",
    icon: "./avatar.jpg",
    time: "5 min ago",
    text: "Now recruiting beta testers. Snacks not included.",
  },
];

const apps = projects.filter((project) => project.icon);
const pageCount = apps.length + 1;

const PhoneMock = () => {
  const [page, setPage] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setPage((current) => (current + 1) % pageCount);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (page === 0) setRound((value) => value + 1);
  }, [page]);

  useEffect(() => {
    const restart = () => {
      setPage(0);
      setRound((value) => value + 1);
    };
    window.addEventListener("portfolio:restart", restart);
    return () => window.removeEventListener("portfolio:restart", restart);
  }, []);

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[290px] sm:max-w-[320px]">
      <div className="rounded-[2.9rem] border-2 border-ink bg-ink p-2.5 shadow-retro-lg">
        <div
          onClick={() => setPage((current) => (current + 1) % pageCount)}
          className="relative aspect-[9/19] overflow-hidden rounded-[2.3rem] bg-paper bg-[radial-gradient(rgb(var(--ink)_/_0.12)_1px,transparent_1px)] bg-[length:14px_14px]"
        >
          <div
            className={cn(
              "absolute inset-0 flex flex-col px-3.5 transition-opacity duration-500",
              page === 0 ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="flex items-center justify-between px-3 pt-3 font-mono text-[11px] font-semibold">
              <span>9:41</span>
              <span className="h-5 w-20" />
              <span className="flex items-end gap-[2px]">
                {[4, 6, 8, 10].map((height) => (
                  <span key={height} className="w-[3px] bg-ink" style={{ height }} />
                ))}
              </span>
            </div>

            <div className="mt-7 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
                It&apos;s always
              </p>
              <p className="font-serif text-7xl leading-none">9:41</p>
            </div>

            <ul key={round} className="mt-7 space-y-2.5">
              {notifications.map((n, index) => (
                <li
                  key={n.app}
                  className="animate-notif flex gap-2.5 rounded-xl border-2 border-ink bg-surface p-2.5 shadow-retro-sm"
                  style={{ animationDelay: `${400 + index * 500}ms` }}
                >
                  <img
                    src={n.icon}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-lg border border-ink/20 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="flex justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-ink-soft">
                      <span className="font-semibold text-ink">{n.app}</span>
                      <span>{n.time}</span>
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug">{n.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {apps.map((app, index) => (
            <div
              key={app.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                page === index + 1 ? "opacity-100" : "opacity-0",
              )}
            >
              <img src={app.img} alt="" loading="lazy" className="h-full w-full object-cover object-center" />
              <div className="absolute inset-x-3 bottom-9 flex items-center gap-2.5 rounded-xl border-2 border-ink bg-surface p-2.5 shadow-retro-sm">
                <img
                  src={app.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-lg border border-ink/20 object-cover"
                />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-soft">Now building</p>
                  <p className="truncate text-[11.5px] font-semibold leading-snug">{app.title}</p>
                </div>
              </div>
            </div>
          ))}

          <span className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: pageCount }, (_, index) => (
              <span
                key={index}
                className={cn("h-1.5 w-1.5 border border-ink", index === page ? "bg-ink" : "bg-paper")}
              />
            ))}
          </div>
        </div>
      </div>

      <span className="absolute -left-4 bottom-32 -rotate-6 border-2 border-ink bg-steel-deep px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper shadow-retro-sm sm:-left-10">
        iOS + Android
      </span>
    </div>
  );
};

export default PhoneMock;
