"use client";

import { useEffect, useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

import { Project, techLabel } from "@/data";
import { Box } from "@/utils/zoomRects";

import { Dialog } from "./ui/Dialog";

type Meta = { created: string; modified: string; size: string };

const cache = new Map<string, Promise<Meta | null>>();

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const relative = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return dateFormat.format(new Date(iso));
};

const formatSize = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

const fetchMeta = (repo: string) => {
  if (!cache.has(repo)) {
    cache.set(
      repo,
      fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Accept: "application/vnd.github+json" },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) =>
          data
            ? {
                created: dateFormat.format(new Date(data.created_at)),
                modified: relative(data.pushed_at),
                size: formatSize(data.size),
              }
            : null,
        )
        .catch(() => null),
    );
  }
  return cache.get(repo)!;
};

const AppIcon = ({ project }: { project: Project }) =>
  project.icon ? (
    <img
      src={project.icon}
      alt=""
      width={48}
      height={48}
      className="h-12 w-12 shrink-0 border-2 border-ink object-cover"
    />
  ) : (
    <span className="grid h-12 w-12 shrink-0 place-items-center border-2 border-ink bg-paper">
      <svg viewBox="0 0 16 16" width="28" height="28" shapeRendering="crispEdges" fill="currentColor" aria-hidden>
        <rect x="4" y="1" width="8" height="14" />
        <rect x="5" y="3" width="6" height="9" fill="rgb(var(--paper))" />
        <rect x="7" y="13" width="2" height="1" fill="rgb(var(--paper))" />
      </svg>
    </span>
  );

type Props = {
  project: Project | null;
  from: Box | null;
  onClose: () => void;
};

const ProjectInfoDialog = ({ project, from, onClose }: Props) => {
  const last = useRef<Project | null>(null);
  if (project) last.current = project;
  const shown = project ?? last.current;
  const [meta, setMeta] = useState<Meta | null | "loading">(null);

  useEffect(() => {
    if (!project?.repo) {
      setMeta(null);
      return;
    }
    let live = true;
    setMeta("loading");
    fetchMeta(project.repo).then((result) => {
      if (live) setMeta(result);
    });
    return () => {
      live = false;
    };
  }, [project]);

  const isRepo = shown?.link.includes("github.com") ?? false;

  return (
    <Dialog open={Boolean(project)} onClose={onClose} from={from} title={shown ? `${shown.title} Info` : "Info"}>
      {shown && (
        <>
          <div className="flex items-center gap-4">
            <AppIcon project={shown} />
            <div className="min-w-0">
              <p className="font-serif text-2xl leading-tight">{shown.title}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-soft">{shown.kind}</p>
            </div>
          </div>

          <div className="mt-5 aspect-[16/10] overflow-hidden border-2 border-ink bg-ink">
            <img src={shown.img} alt="" className="h-full w-full object-cover object-top" />
          </div>

          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 font-mono text-xs">
            <dt className="text-ink-soft">Kind</dt>
            <dd>{shown.kind}</dd>
            <dt className="text-ink-soft">Built with</dt>
            <dd>{shown.iconLists.map(techLabel).join(", ")}</dd>
            <dt className="text-ink-soft">Where</dt>
            <dd className="min-w-0 truncate">
              <a
                href={shown.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-steel-deep underline-offset-4"
              >
                {shown.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </dd>
            {meta === "loading" && (
              <>
                <dt className="text-ink-soft">Created</dt>
                <dd className="animate-blink">…</dd>
              </>
            )}
            {meta && meta !== "loading" && (
              <>
                <dt className="text-ink-soft">Created</dt>
                <dd>{meta.created}</dd>
                <dt className="text-ink-soft">Modified</dt>
                <dd>{meta.modified}</dd>
                <dt className="text-ink-soft">Size</dt>
                <dd>{meta.size}</dd>
              </>
            )}
          </dl>

          <div className="mt-5 border-2 border-ink bg-surface p-4">
            <p className="label text-steel-deep">Comments</p>
            <p className="mt-2 leading-relaxed">{shown.des}</p>
            {shown.highlights && (
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                {shown.highlights.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 bg-steel-deep" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-retro btn-paper">
              Close
            </button>
            <a href={shown.link} target="_blank" rel="noopener noreferrer" className="btn-retro btn-ink">
              {isRepo ? "Open repo" : "View live"} <FiArrowUpRight aria-hidden />
            </a>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default ProjectInfoDialog;
