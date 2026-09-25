"use client";

import { useMemo, useState } from "react";

import { workExperience } from "@/data";
import { cn } from "@/utils/cn";

import { PixelIcon } from "./ui/PixelIcon";
import { SectionHeading } from "./ui/SectionHeading";
import { Window } from "./ui/Window";

type Job = (typeof workExperience)[number];
type SortKey = "org" | "role" | "date";

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const startOf = (date: string) => {
  const [month, year] = date.split(" ");
  return new Date(Number(year), months.indexOf(month.slice(0, 3).toLowerCase()), 1).getTime();
};

const folderMap = [
  "................",
  ".######.........",
  "#......#########",
  "#..............#",
  "#..............#",
  "#..............#",
  "#..............#",
  "#..............#",
  "#..............#",
  "#..............#",
  "#..............#",
  "################",
  "................",
];

const docMap = [
  "..#########.....",
  "..#.......##....",
  "..#.......#.#...",
  "..#.......#..#..",
  "..#.......#####.",
  "..#...........#.",
  "..#.######....#.",
  "..#...........#.",
  "..#.########..#.",
  "..#...........#.",
  "..#.########..#.",
  "..#...........#.",
  "..#.######....#.",
  "..#...........#.",
  "..#############.",
  "................",
];

const fills = { "#": "currentColor" };

const columns: { key: SortKey; label: string; className?: string }[] = [
  { key: "org", label: "Name" },
  { key: "role", label: "Kind", className: "hidden md:flex" },
  { key: "date", label: "Date Modified" },
];

const rowGrid =
  "grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[1rem_minmax(0,1fr)_11rem_11rem]";

const Experience = () => {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [open, setOpen] = useState<number[]>([workExperience[0].id]);

  const rows = useMemo(() => {
    const value = (job: Job) => (sort.key === "date" ? startOf(job.date) : job[sort.key].toLowerCase());
    return [...workExperience].sort((a, b) => {
      const left = value(a);
      const right = value(b);
      return (left < right ? -1 : left > right ? 1 : 0) * sort.dir;
    });
  }, [sort]);

  const since = new Date(Math.min(...workExperience.map((job) => startOf(job.date)))).getFullYear();
  const years = new Date().getFullYear() - since;

  const toggleSort = (key: SortKey) =>
    setSort((current) => ({
      key,
      dir: current.key === key ? (current.dir === 1 ? -1 : 1) : key === "date" ? -1 : 1,
    }));

  const toggleRow = (id: number) =>
    setOpen((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]));

  return (
    <section id="workExperience" className="py-20 md:py-28">
      <SectionHeading index="03" label="Experience">
        My work <em className="text-steel">experience</em>.
      </SectionHeading>

      <Window title="Work" bodyClassName="text-sm">
        <p className="border-b-2 border-ink px-3 py-1 text-center font-mono text-[11px] text-ink-soft">
          {workExperience.length} items, {years} years and counting
        </p>

        <div className={cn(rowGrid, "border-b-2 border-ink px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider")}>
          <span />
          {columns.map((column) => (
            <button
              key={column.key}
              type="button"
              onClick={() => toggleSort(column.key)}
              aria-pressed={sort.key === column.key}
              className={cn(
                "flex items-center gap-1.5 text-left",
                column.className,
                sort.key === column.key && "underline underline-offset-4",
              )}
            >
              {column.label}
              {sort.key === column.key && (
                <span aria-hidden className="font-mono text-[9px]">
                  {sort.dir === 1 ? "▲" : "▼"}
                </span>
              )}
            </button>
          ))}
        </div>

        <ul>
          {rows.map((job) => {
            const expanded = open.includes(job.id);
            const bodyId = `job-${job.id}`;
            return (
              <li key={job.id} className="border-b-2 border-dotted border-ash last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleRow(job.id)}
                  aria-expanded={expanded}
                  aria-controls={bodyId}
                  className={cn(
                    rowGrid,
                    "w-full px-3 py-2.5 text-left transition-colors",
                    expanded ? "bg-ink text-paper" : "hover:bg-steel-wash",
                  )}
                >
                  <span aria-hidden className="font-mono text-[9px]">
                    {expanded ? "▼" : "▶"}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <PixelIcon map={folderMap} fills={fills} size={18} className="shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{job.org}</span>
                      <span className="block truncate font-mono text-[11px] opacity-70 md:hidden">
                        {job.role}
                      </span>
                    </span>
                  </span>
                  <span className="hidden truncate font-mono text-xs md:block">{job.role}</span>
                  <span className="whitespace-nowrap font-mono text-xs">{job.date}</span>
                </button>

                <ul id={bodyId} style={{ display: expanded ? undefined : "none" }} className="bg-surface">
                  {job.desc.split("|").map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 border-t border-dotted border-ash py-2 pl-10 pr-4 leading-relaxed text-ink-soft md:pl-14"
                    >
                      <PixelIcon map={docMap} fills={fills} size={16} className="mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Window>
    </section>
  );
};

export default Experience;
