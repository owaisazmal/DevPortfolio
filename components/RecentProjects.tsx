"use client";

import { useCallback, useEffect, useState } from "react";
import { FiArrowUpRight, FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";

import { Project, moreProjects, projects, techLabel } from "@/data";
import { cn } from "@/utils/cn";
import { Box } from "@/utils/zoomRects";

import DitheredImage from "./DitheredImage";
import ProjectInfoDialog from "./ProjectInfoDialog";
import { SectionHeading } from "./ui/SectionHeading";
import { Stamp } from "./ui/Stamp";
import { Window } from "./ui/Window";

type Info = { project: Project; from: Box | null };

const kinds = ["All", "iOS", "Android", "Web"];

const ProjectCard = ({ project, onInfo }: { project: Project; onInfo: (info: Info) => void }) => {
  const { title, des, img, iconLists, link } = project;
  const isRepo = link.includes("github.com");
  const open = (event: React.MouseEvent<HTMLElement>) =>
    onInfo({ project, from: event.currentTarget.getBoundingClientRect() });

  return (
    <Window title={title} titleAs="h3" className="h-full" bodyClassName="flex h-full flex-col">
      <button
        type="button"
        onClick={open}
        aria-label={`Get info: ${title}`}
        className="relative block w-full border-b-2 border-ink text-left"
      >
        <DitheredImage src={img} className="aspect-[16/10]" />
        <Stamp className="absolute right-3 top-3">{project.stamp ?? (isRepo ? "Open source" : "Live")}</Stamp>
      </button>

      <div className="flex flex-1 flex-col gap-6 p-5 md:p-6">
        <p className="leading-relaxed text-ink-soft">{des}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
          <ul className="flex items-center" aria-label="Built with">
            {iconLists.map((icon) => (
              <li
                key={icon}
                className="-ml-1.5 grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-black first:ml-0"
              >
                <img src={icon} alt={techLabel(icon)} className="h-[18px] w-[18px] object-contain" />
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={open} className="btn-retro btn-paper px-4 py-2 text-xs">
              Get Info <FiInfo aria-hidden />
              <span className="sr-only">: {title}</span>
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-retro btn-ink px-4 py-2 text-xs"
            >
              {isRepo ? "View repo" : "View live"} <FiArrowUpRight aria-hidden />
              <span className="sr-only">: {title}</span>
            </a>
          </div>
        </div>
      </div>
    </Window>
  );
};

const RecentProjects = () => {
  const [showMore, setShowMore] = useState(false);
  const [kind, setKind] = useState("All");
  const [info, setInfo] = useState<Info | null>(null);
  const closeInfo = useCallback(() => setInfo(null), []);

  useEffect(() => {
    const onProject = (event: Event) => {
      const id = (event as CustomEvent<number>).detail;
      const project = [...projects, ...moreProjects].find((item) => item.id === id);
      if (project) setInfo({ project, from: null });
    };
    window.addEventListener("portfolio:project", onProject);
    return () => window.removeEventListener("portfolio:project", onProject);
  }, []);

  const filtering = kind !== "All";
  const pool = showMore || filtering ? [...projects, ...moreProjects] : projects;
  const visibleProjects = filtering ? pool.filter((project) => project.kind.includes(kind)) : pool;

  return (
    <section id="projects" className="py-20 md:py-28">
      <SectionHeading index="02" label="Projects">
        A small selection of <em className="text-steel">recent projects</em>.
      </SectionHeading>

      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="label text-steel-deep">View by kind</span>
        <div role="group" aria-label="Filter projects by kind" className="flex flex-wrap gap-2">
          {kinds.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
              className={cn(
                "border-2 border-ink px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors",
                kind === option ? "bg-graphite text-paper shadow-retro-sm" : "bg-paper hover:bg-steel-wash",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft" aria-live="polite">
          {visibleProjects.length} of {projects.length + moreProjects.length} items
        </span>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onInfo={setInfo} />
        ))}
      </div>

      {visibleProjects.length === 0 && (
        <p className="border-2 border-dotted border-ash p-8 text-center font-mono text-xs uppercase tracking-wider text-ink-soft">
          No items of that kind yet.
        </p>
      )}

      {moreProjects.length > 0 && !filtering && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
            className="btn-retro btn-paper"
          >
            {showMore ? "Show fewer projects" : `Show more projects (+${moreProjects.length})`}
            {showMore ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
          </button>
        </div>
      )}

      <ProjectInfoDialog project={info?.project ?? null} from={info?.from ?? null} onClose={closeInfo} />
    </section>
  );
};

export default RecentProjects;
