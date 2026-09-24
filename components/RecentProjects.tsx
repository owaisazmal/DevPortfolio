"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp, FaLocationArrow } from "react-icons/fa6";

import { moreProjects, projects } from "@/data";

import MagicButton from "./ui/MagicButton";
import { PinContainer } from "./ui/Pin";

type Project = (typeof projects)[number];

const ProjectCard = ({ title, des, img, iconLists, link }: Project) => (
  <div className="sm:h-[41rem] lg:min-h-[32.5rem] h-[32rem] flex items-center justify-center sm:w-[570px] w-[80vw]">
    <PinContainer
      title={link}
      href={link}
    >
      <div className="relative flex items-center justify-center sm:w-[570px] w-[80vw] overflow-hidden sm:h-[40vh] h-[30vh] mb-10">
        <div
          className="relative w-full h-full overflow-hidden lg:rounded-3xl"
          style={{ backgroundColor: "#13162D" }}
        >
          <img src="./bg.png" alt="bgimg" />
        </div>
        <img
          src={img}
          alt="cover"
          className="z-10 absolute bottom-0"
        />
      </div>

      <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
        {title}
      </h1>

      <p
        className="lg:text-xl lg:font-normal font-light text-sm line-clamp-2"
        style={{
          color: "#BEC1DD",
          margin: "1vh 0",
        }}
      >
        {des}
      </p>

      <div className="flex items-center justify-between mt-7 mb-3">
        <div className="flex items-center">
          {iconLists.map((icon, index) => (
            <div
              key={index}
              className="border border-white/[.2] rounded-full bg-black lg:w-10 lg:h-10 w-8 h-8 flex justify-center items-center"
              style={{
                transform: `translateX(-${5 * index + 2}px)`,
              }}
            >
              <img src={icon} alt="icon5" className="p-2" />
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center">
          <p className="flex lg:text-xl md:text-xs text-sm text-purple">
            {link.includes("github.com") ? "Show Git Repo" : "View Live"}
          </p>
          <FaLocationArrow className="ms-3" color="#CBACF9" />
        </div>

      </div>
    </PinContainer>
  </div>
);

const RecentProjects = () => {
  const [showMore, setShowMore] = useState(false);
  const visibleProjects = showMore ? [...projects, ...moreProjects] : projects;

  return (
    <div className="py-20" id = "projects">
      <h1 className="heading">
        A small selection of{" "}
        <span className="text-purple">recent projects</span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-4 gap-x-24 gap-y-8 mt-10">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {moreProjects.length > 0 && (
        <div className="flex justify-center mt-10">
          <MagicButton
            title={showMore ? "Show fewer projects" : "Show more projects"}
            icon={showMore ? <FaChevronUp /> : <FaChevronDown />}
            position="right"
            handleClick={() => setShowMore(!showMore)}
          />
        </div>
      )}
    </div>
  );
};

export default RecentProjects;
