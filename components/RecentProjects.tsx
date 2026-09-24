"use client";

import { useCallback, useState } from "react";
import { FiArrowUpRight, FiChevronDown, FiChevronUp, FiInfo } from "react-icons/fi";

import { Project, moreProjects, projects, techLabel } from "@/data";
import { Box } from "@/utils/zoomRects";

import DitheredImage from "./DitheredImage";
import ProjectInfoDialog from "./ProjectInfoDialog";
import { SectionHeading } from "./ui/SectionHeading";
import { Window } from "./ui/Window";

type Info = { project: Project; from: Box };

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
        className="block w-full border-b-2 border-ink text-left"
      >
        <DitheredImage src={img} className="aspect-[16/10]" />
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
  const [info, setInfo] = useState<Info | null>(null);
  const closeInfo = useCallback(() => setInfo(null), []);
  const visibleProjects = showMore ? [...projects, ...moreProjects] : projects;

  return (
    <section id="projects" className="py-20 md:py-28">
      <SectionHeading index="02" label="Projects">
        A small selection of <em className="text-steel">recent projects</em>.
      </SectionHeading>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onInfo={setInfo} />
        ))}
      </div>

      {moreProjects.length > 0 && (
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
