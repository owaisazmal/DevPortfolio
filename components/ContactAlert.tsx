"use client";

import { useEffect, useState } from "react";
import { FiArrowUpRight, FiCheck, FiCopy } from "react-icons/fi";

import { contactEmail } from "@/data";
import { cn } from "@/utils/cn";

import { PixelIcon } from "./ui/PixelIcon";

const stopMap = [
  "....########....",
  "...#oooooooo#...",
  "..#oooooooooo#..",
  ".#oooooooooooo#.",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  "#oooooooooooooo#",
  "#oooooo##oooooo#",
  "#oooooo##oooooo#",
  ".#oooooooooooo#.",
  "..#oooooooooo#..",
  "...#oooooooo#...",
  "....########....",
];

const fills = { "#": "currentColor", o: "rgb(var(--paper))" };

const ContactAlert = ({ className }: { className?: string }) => {
  const [copied, setCopied] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!copied && !cancelled) return;
    const id = window.setTimeout(() => {
      setCopied(false);
      setCancelled(false);
    }, 2600);
    return () => window.clearTimeout(id);
  }, [copied, cancelled]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  const note = cancelled
    ? "No worries. The offer stays open."
    : copied
      ? "Email address copied. Talk soon."
      : `OK opens an email to ${contactEmail}. Cancel does nothing, as usual.`;

  return (
    <div
      role="group"
      aria-labelledby="contact-alert-title"
      className={cn("border-2 border-ink bg-paper p-1 shadow-retro", className)}
    >
      <div className="flex h-full flex-col border border-ink p-6 md:p-8">
        <div className="flex items-start gap-5">
          <PixelIcon map={stopMap} fills={fills} size={56} className="shrink-0 text-ink" />
          <div className="min-w-0">
            <h3 id="contact-alert-title" className="font-serif text-[2rem] leading-[1.12] md:text-[2.4rem]">
              Do you want to start a project together?
            </h3>
            <p className="mt-4 font-mono text-xs leading-relaxed text-ink-soft" aria-live="polite">
              {note}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 md:mt-auto md:pt-8">
          <button type="button" onClick={copy} className="btn-retro btn-paper">
            {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
            {copied ? "Copied" : "Copy email"}
          </button>
          <button type="button" onClick={() => setCancelled(true)} className="btn-retro btn-paper">
            Cancel
          </button>
          <a href={`mailto:${contactEmail}`} className="btn-retro btn-ink btn-default">
            OK <FiArrowUpRight aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactAlert;
