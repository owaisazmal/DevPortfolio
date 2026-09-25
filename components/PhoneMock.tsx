"use client";

import { useEffect, useState } from "react";
import { FiArrowUp, FiFileText, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

import { Project, contactEmail, moreProjects, projects, resumeUrl, socialMedia } from "@/data";
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

const apps = [...projects, ...moreProjects];

const social = (name: string) => socialMedia.find((item) => item.name === name)?.link ?? "#";

const dock = [
  { label: "Email Owais", href: `mailto:${contactEmail}`, icon: <FiMail aria-hidden /> },
  { label: "Open résumé", href: resumeUrl, icon: <FiFileText aria-hidden /> },
  { label: "GitHub", href: social("GitHub"), icon: <FiGithub aria-hidden /> },
  { label: "LinkedIn", href: social("LinkedIn"), icon: <FiLinkedin aria-hidden /> },
];

const thread = [
  { from: "them", text: "hey, I have an app idea" },
  { from: "me", text: "Pitch it. If I like it, I'll build it for free." },
  { from: "them", text: "what's the catch?" },
  { from: "me", text: "I have to like it. That's the whole catch." },
  { from: "them", text: "and beta testing?" },
  { from: "me", text: "Open. Snacks not included." },
];

const pages = [
  { name: "Lock screen", duration: 5500 },
  { name: "Home screen", duration: 6500 },
  { name: "Messages", duration: 11500 },
];

const shortTitle = (title: string) => title.split(" - ")[0];

const initials = (title: string) =>
  shortTitle(title)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

const openProject = (id: number) =>
  window.dispatchEvent(new CustomEvent("portfolio:project", { detail: id }));

const AppTile = ({ app }: { app: Project }) =>
  app.icon ? (
    <img
      src={app.icon}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 rounded-lg border-2 border-ink object-cover shadow-retro-sm transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5"
    />
  ) : (
    <span className="grid h-10 w-10 place-items-center rounded-lg border-2 border-ink bg-steel-wash font-serif text-lg leading-none shadow-retro-sm transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0.5">
      {initials(app.title)}
    </span>
  );

const PhoneMock = () => {
  const [page, setPage] = useState(0);
  const [round, setRound] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reducedMotion() || paused) return;
    const id = window.setTimeout(() => {
      if (!document.hidden) setPage((current) => (current + 1) % pages.length);
    }, pages[page].duration);
    return () => window.clearTimeout(id);
  }, [page, paused, round]);

  useEffect(() => {
    if (!paused) return;
    const id = window.setTimeout(() => setPaused(false), 20000);
    return () => window.clearTimeout(id);
  }, [paused]);

  useEffect(() => {
    if (page === 0) setRound((value) => value + 1);
  }, [page]);

  useEffect(() => {
    const restart = () => {
      setPage(0);
      setPaused(false);
      setRound((value) => value + 1);
    };
    window.addEventListener("portfolio:restart", restart);
    return () => window.removeEventListener("portfolio:restart", restart);
  }, []);

  const goTo = (index: number) => {
    setPage(index);
    setPaused(true);
  };

  return (
    <div role="group" aria-label="Phone preview" className="relative mx-auto w-full max-w-[290px] sm:max-w-[320px]">
      <div className="rounded-[2.9rem] border-2 border-ink bg-ink p-2.5 shadow-retro-lg">
        <div
          onClick={() => goTo((page + 1) % pages.length)}
          className="relative aspect-[9/19] overflow-hidden rounded-[2.3rem] bg-paper bg-[radial-gradient(rgb(var(--ink)_/_0.12)_1px,transparent_1px)] bg-[length:14px_14px]"
        >
          <div
            aria-hidden={page !== 0}
            className={cn(
              "absolute inset-0 flex flex-col px-3.5 transition-opacity duration-500",
              page === 0 ? "opacity-100" : "pointer-events-none opacity-0",
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

          <div
            aria-hidden={page !== 1}
            className={cn(
              "absolute inset-0 flex flex-col px-4 pb-8 pt-12 transition-opacity duration-500",
              page === 1 ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
              {apps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  tabIndex={page === 1 ? 0 : -1}
                  aria-label={`Get info: ${app.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    openProject(app.id);
                  }}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <AppTile app={app} />
                  <span className="w-full truncate text-center font-mono text-[8px] uppercase tracking-wider">
                    {shortTitle(app.title)}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-around rounded-2xl border-2 border-ink bg-surface px-2 py-2 shadow-retro-sm">
              {dock.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  tabIndex={page === 1 ? 0 : -1}
                  aria-label={item.label}
                  onClick={(event) => event.stopPropagation()}
                  className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-paper text-base transition-colors hover:bg-ink hover:text-paper"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div
            aria-hidden={page !== 2}
            className={cn(
              "absolute inset-0 flex flex-col pt-10 transition-opacity duration-500",
              page === 2 ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div className="flex flex-col items-center border-b-2 border-ink pb-2">
              <img
                src="./avatar.jpg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full border-2 border-ink object-cover"
              />
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider">Owais</p>
            </div>

            <ul key={`${round}-${page}`} className="flex flex-1 flex-col justify-end gap-2 px-3 pb-3">
              {thread.map((message, index) => {
                const delay = 700 + index * 1500;
                const mine = message.from === "me";
                return (
                  <li key={index} className={cn("relative flex", mine ? "justify-end" : "justify-start")}>
                    {mine && (
                      <span
                        aria-hidden
                        className="animate-typing absolute right-0 top-0 flex items-center gap-1 rounded-2xl border-2 border-ink bg-surface px-3 py-2.5 opacity-0"
                        style={{ animationDelay: `${delay - 1150}ms` }}
                      >
                        {[0, 1, 2].map((dot) => (
                          <span key={dot} className="h-1.5 w-1.5 rounded-full bg-ink" />
                        ))}
                      </span>
                    )}
                    <span
                      className={cn(
                        "animate-notif max-w-[80%] rounded-2xl border-2 border-ink px-3 py-1.5 text-[11px] leading-snug",
                        mine ? "bg-ink text-paper" : "bg-surface",
                      )}
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      {message.text}
                    </span>
                  </li>
                );
              })}
            </ul>

            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent("I have an app idea for you")}`}
              tabIndex={page === 2 ? 0 : -1}
              onClick={(event) => event.stopPropagation()}
              className="mx-3 mb-7 flex items-center justify-between rounded-full border-2 border-ink bg-surface py-1.5 pl-3.5 pr-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-ink hover:text-paper"
            >
              Pitch your idea
              <span className="grid h-6 w-6 place-items-center rounded-full bg-steel-deep text-paper">
                <FiArrowUp aria-hidden />
              </span>
            </a>
          </div>

          <span aria-hidden className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />

          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
            {pages.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-label={`Show ${item.name}`}
                aria-pressed={index === page}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index);
                }}
                className={cn(
                  "h-2 w-2 border border-ink transition-colors",
                  index === page ? "bg-ink" : "bg-paper hover:bg-steel-wash",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <span
        aria-hidden
        className="absolute -left-4 bottom-32 -rotate-6 border-2 border-ink bg-steel-deep px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper shadow-retro-sm sm:-left-10"
      >
        iOS + Android
      </span>
    </div>
  );
};

export default PhoneMock;
