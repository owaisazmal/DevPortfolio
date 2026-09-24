"use client";

import { Fragment, useEffect, useState } from "react";

import { githubUser } from "@/data";
import { Push, fetchLatestPush, relative } from "@/utils/github";

import { Window } from "./ui/Window";

const link = "underline decoration-steel-deep underline-offset-4";

const CurrentlyWindow = ({ className }: { className?: string }) => {
  const [push, setPush] = useState<Push | null | "loading">("loading");

  useEffect(() => {
    let live = true;
    fetchLatestPush(githubUser).then((result) => {
      if (live) setPush(result);
    });
    return () => {
      live = false;
    };
  }, []);

  const rows: [string, React.ReactNode][] = [
    [
      "last push",
      push === "loading" ? (
        <span className="animate-blink">…</span>
      ) : push ? (
        <>
          {relative(push.at)} in{" "}
          <a href={push.url} target="_blank" rel="noopener noreferrer" className={link}>
            {push.repo}
          </a>
        </>
      ) : (
        <a href={`https://github.com/${githubUser}`} target="_blank" rel="noopener noreferrer" className={link}>
          see GitHub
        </a>
      ),
    ],
    ...(push && push !== "loading" && push.message
      ? ([["commit", `“${push.message}”`]] as [string, React.ReactNode][])
      : []),
    ["status", "Recruiting beta testers, building in public"],
    ["open to", "Freelance builds, beta feedback, good ideas"],
  ];

  return (
    <Window title="currently.log" className={className} bodyClassName="p-5 md:p-6">
      <dl className="grid gap-x-6 gap-y-2 font-mono text-xs sm:grid-cols-[7rem_1fr] sm:text-sm">
        {rows.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="text-steel-deep">&gt; {label}</dt>
            <dd className="min-w-0 break-words">{value}</dd>
          </Fragment>
        ))}
      </dl>
    </Window>
  );
};

export default CurrentlyWindow;
