"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { moreProjects, projects } from "@/data";
import { play } from "@/utils/sound";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Point = { x: number; y: number; touch: boolean } | null;
type Target = { el: Element; text: string };
type Copy = string | ((el: Element, point: Point) => string | Target | null);
type Entry = { match: string; text: Copy; hit?: boolean };
type Balloon = Target & { point: Point; hit: boolean };

const norm = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const lookup = (table: Record<string, string>, label: string) => {
  const key = Object.keys(table).find((name) => label.startsWith(name));
  return key ? table[key] : null;
};

const byText =
  (table: Record<string, string>, fallback?: (label: string) => string | null): Copy =>
  (el) => {
    const raw = el.textContent?.trim() ?? "";
    return lookup(table, norm(raw)) ?? fallback?.(raw) ?? null;
  };

const byLabel =
  (table: Record<string, string>, fallback?: (label: string) => string | null): Copy =>
  (el) => {
    const raw = el.getAttribute("aria-label") ?? "";
    return lookup(table, norm(raw)) ?? fallback?.(raw) ?? null;
  };

const titleOf = (frame: Element) =>
  frame.querySelector(":scope > div > .titlebar-stripes + *")?.textContent?.trim() ?? "";

const inside = (el: Element, point: Point) => {
  if (!point) return false;
  const rect = el.getBoundingClientRect();
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
};

const supportsPopover = () => typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

const raise = (layer: HTMLElement) => {
  if (!supportsPopover()) return;
  try {
    if (layer.matches(":popover-open")) layer.hidePopover();
    layer.showPopover();
  } catch {}
};

const apps = [...projects, ...moreProjects];

const menus: Record<string, string> = {
  file: "The File menu. Find, a fresh pitch, the beta installer, and my résumé, GitHub, LinkedIn and LeetCode. Quit is greyed out; you only just got here.",
  edit: "The Edit menu. Copies my email address to your clipboard, or opens a blank email so you can skip straight to the point.",
  view: "The View menu. Night Mode, sound effects, a desktop pattern you paint yourself, and a way to collapse every window at once.",
  special:
    "The Special menu. A puzzle, the LA weather, a screensaver, a Restart that boots the page again, and a Shut Down you probably shouldn't trust.",
  help: "The Help menu. You found it. Balloons switch off here whenever the chatter gets too much, and / opens Find from anywhere.",
};

const menuItems: Record<string, string> = {
  find: "Opens Find File. Search every project, job and command on the page. The / key does the same.",
  "new pitch": "Opens a stationery pad with four blanks. Fill them in and it writes the pitch email for you.",
  "install beta": "Opens the beta installer. Pick your apps and platform; it writes the sign-up email for you.",
  "desktop pattern": "Opens the pattern editor. Paint an 8 by 8 tile and the whole page wears it. It remembers, too.",
  puzzle: "The sliding-tile puzzle from the Apple menu, cut from my avatar. Every shuffle is solvable.",
  weather: "Live Los Angeles weather from Open-Meteo, in a one-bit remake of my own Weather Util app.",
  sleep: "Starts the screensaver right now. Move the mouse or press a key to wake the page back up.",
  "keyboard press to find": "A reminder that / opens Find from anywhere on the page. Cmd or Ctrl plus K works too.",
  "open resume": "Opens my résumé in a new tab.",
  "open github": "Opens my GitHub in a new tab. Every project on this page has its source there.",
  "open linkedin": "Opens my LinkedIn in a new tab, for the version of me with a job title.",
  "open leetcode": "Opens my LeetCode profile in a new tab, where the algorithm practice lives.",
  quit: "Quit is disabled. There's no leaving. Closing the tab works, but let's not.",
  "copy email": "Copies my email address to your clipboard. No email app required.",
  copied: "Done. My email address is on your clipboard.",
  "email me": "Opens your email app with a blank message addressed to me.",
  "night mode": "Flips the page to dark paper. Your choice is remembered next visit.",
  "sound effects":
    "Turns on tiny square-wave clicks and chirps for buttons, windows and dialogs. Off by default, out of politeness.",
  "collapse all windows": "Rolls every window on the page up into its title bar.",
  "expand all windows": "Rolls every window back down again.",
  "about this portfolio": "Opens the About box: system software, built-in memory, and the largest unused block.",
  restart: "Scrolls to the top and boots the page again, startup screen and all.",
  "shut down": "Do you trust a Shut Down item on a website? Try it and find out.",
  "show balloons": "This switch. Balloons on means every part of the page explains itself when you point at it.",
  "hide balloons": "This switch. Balloons off means the page goes quiet again.",
};

const sections: Record<string, string> = {
  about: "Jumps to About: who I am, plus two offers I'm serious about.",
  projects: "Jumps to Projects, where the apps live.",
  experience: "Jumps to Experience, a Finder list of the places I've worked.",
  contact: "Jumps to Contact, at the bottom, where the big email button lives.",
};

const facts: Record<string, string> = {
  "based in": "Los Angeles. The clock in the menu bar runs on the same time zone I do.",
  "builds for": "iOS and Android, usually both from one React Native codebase. Swift when the job calls for it.",
  status: "Shipping things. currently.log, further down, has the receipts: my latest push, straight from GitHub.",
};

const dock: Record<string, string> = {
  "email owais": "The dock's Mail. Opens a blank email to me.",
  "open resume": "My résumé, in the dock. Opens in a new tab.",
  github: "GitHub, in the dock. All the source code lives there.",
  linkedin: "LinkedIn, in the dock. The version of me with a job title.",
};

const filters: Record<string, string> = {
  all: "Every project, phones and browsers alike.",
  ios: "Only the apps that run on an iPhone.",
  android: "Only the apps that run on Android. Most of mine do both.",
  web: "The browser-based ones. Nothing to install.",
};

const stamps: Record<string, string> = {
  "open source": "A rubber stamp. Open source means the code is on GitHub for anyone to read, fork or judge.",
  live: "A rubber stamp. Live means it's running on the web right now, nothing to install.",
};

const columns: Record<string, string> = {
  name: "Sorts the list by employer. Click again to flip the order, Finder-style.",
  kind: "Sorts by role. Click again to reverse it.",
  "date modified": "Sorts by start date, newest first. Click again for the oldest first.",
};

const buttons: Record<string, string> = {
  "contact me": "Opens an email to me. Say hi, pitch something, or ask what the corner radius is up to.",
  "see my work": "Scrolls down to the projects.",
  "pitch me an idea":
    "Opens a stationery pad with four blanks. Fill them in and it writes the pitch email; the paywall-free build is my end of the deal.",
  "join the beta": "Opens the beta installer. Tick the apps you want to break and it writes the sign-up email for you.",
  "copy email": "Copies my email address to your clipboard, no email app required.",
  copied: "Copied. My email address is on your clipboard now.",
  cancel: "Cancel. Does nothing, as promised, then reassures you the offer still stands.",
  ok: "The default button, hence the extra ring. It follows the Regarding menu: an email, the pitch pad or the beta installer.",
  "send pitch": "Turns your four blanks into an email to me. Your mail app opens with it ready to send.",
  install: "Writes the beta sign-up email with your picks. Your mail app opens with it ready to send.",
  "join waitlist": "Every seat is taken, so this writes a waitlist email instead. You'll be first in line.",
  shuffle: "Scrambles the tiles again. Two hundred random slides from solved, so it always comes back.",
  "set desktop pattern": "Makes this pattern the page background. It sticks around for your next visit.",
  reset: "Puts the original dot grid back.",
  "try again": "Asks Open-Meteo for the weather one more time.",
  "get info": "Opens the Get Info window: kind, stack, and dates pulled live from GitHub.",
  "view repo": "Opens the source code on GitHub, in a new tab.",
  "open repo": "Opens the source code on GitHub, in a new tab.",
  "view live": "Opens the app itself, in a new tab.",
  "show more projects": "There are a couple more in the drawer. Click to lay them all out.",
  "show fewer projects": "Tidies the extra projects away again.",
  close: "Closes this window. Escape works too.",
  restart: "Closes the error and boots the page again from the top. No data was harmed.",
  "report bug": "Opens an email titled “I found the bomb”. I'll know what you mean.",
  "lets get in touch": "Opens an email to me. That's the whole funnel: no form, no newsletter.",
};

const dialogButtons: Record<string, string> = {
  cancel: "Closes this without sending anything. Nothing is kept.",
  close: "Closes this window. Escape works too.",
  ok: "Dismisses this box. In a dialog, that's all OK ever does.",
};

const socials: Record<string, string> = {
  github: "GitHub. Every project on this page has its source there.",
  linkedin: "LinkedIn, for the version of me with a headshot and a job title.",
  leetcode: "LeetCode, where the algorithm practice lives. Opens in a new tab.",
};

const windows: Record<string, string> = {
  "about me txt": "about_me.txt. The short version of who I am. The long version is the rest of the page.",
  "build request app": "build_request.app. The free-app offer, with its single condition spelled out in the fine print.",
  "beta tests log": "beta_tests.log. The beta programme, with a live count of the seats left.",
  "currently log":
    "currently.log. A status window. The last push line comes straight from GitHub, so it's as fresh as my commit history.",
  work: "Work. My experience as a Finder list view. Click a column to sort, click a folder to open it.",
};

const dialogs: Record<string, string> = {
  "about this portfolio":
    "The About box. Built-in memory is whatever I've used most; the largest unused block is, sadly, accurate.",
  "system error": "The bomb. A System 7 tradition. This one is harmless, and it's fishing for beta testers.",
  "find file": "Find File. Type to search every project, job and command on the page; arrows and Enter do the rest.",
  puzzle: "The Puzzle desk accessory, cut from my avatar. Slide tiles into the gap until I'm back in one piece.",
  "weather util": "A one-bit remake of my Weather Util app, running on live Los Angeles data from Open-Meteo.",
  "desktop patterns": "The General Controls pattern editor. Paint a tile, set it, and the whole page wears it.",
  "untitled pitch": "A stationery pad. Four blanks become one email, and you still get to press send yourself.",
  "install beta": "The beta installer. Nothing actually installs; it writes me an email with your picks.",
};

const frameCopy: Copy = (el) => {
  const title = titleOf(el);
  if (el.closest("dialog")) {
    return (
      lookup(dialogs, norm(title)) ??
      (title.endsWith("Info")
        ? "A Get Info window, like the Finder's. Created and modified come straight from GitHub."
        : null)
    );
  }
  const app = apps.find((project) => project.title === title);
  if (app) {
    return `${app.title}: ${app.kind}. Get Info opens the full spec sheet; the stamp says whether it's open source or live.`;
  }
  return lookup(windows, norm(title));
};

const entries: Entry[] = [
  {
    match: 'header [aria-haspopup="menu"]',
    text: byText(menus, (label) => `The ${label} menu. Click to see what's inside.`),
  },
  { match: "#mobile-menu .label", text: byText(menus, (label) => `The ${label} menu, unfolded below.`) },
  { match: "header .menu-item", text: byText(menuItems, (label) => `${label}. Pick it and find out.`) },
  { match: 'header a[href="#top"]', text: "That's me. Click to scroll back to the top." },
  { match: 'header nav a[href^="#"]', text: byText(sections, (label) => `Jumps to ${label}.`) },
  {
    match: 'header button[aria-label^="Weather:"]',
    text: "The temperature in Los Angeles right now, live from Open-Meteo. Click for the five-day forecast.",
  },
  {
    match: "header nav p.tabular-nums",
    text: "The time in Los Angeles, where I am. If it's late here, I'm probably still nudging a corner radius.",
  },
  {
    match: 'header button[aria-controls="mobile-menu"]',
    text: "The menu bar, folded up to fit your pocket. Tap for File, Edit, View and the rest.",
  },
  { match: "#mobile-menu", text: "The menu bar, unfolded. Same menus as the desktop version, stacked for thumbs." },

  {
    match: 'button[aria-label^="Collapse "]',
    text: "The collapse box. Click it and this window rolls up into its title bar, like a window shade.",
  },
  {
    match: 'button[aria-label^="Expand "]',
    text: "The collapse box, rolled up. Click to bring the window back down.",
  },
  {
    match: 'button[aria-label^="Zoom "]',
    text: "The zoom box. Click it and this window stretches across the full width of the page. Click again to put it back.",
  },
  {
    match: 'button[aria-label^="Restore "]',
    text: "The zoom box, zoomed. Click to shrink the window back to its usual size.",
  },
  {
    match: "span:has(+ .titlebar-stripes)",
    text: "A close box that closes nothing. On small screens it's here purely for the look.",
  },
  {
    match: ".titlebar-stripes",
    text: (el) =>
      el.closest("dialog")
        ? "Title bar stripes on a dialog. It's modal, so the rest of the page waits until you're done."
        : "Title bar stripes. In System 7 they meant this window was the active one. Double-click the bar to collapse it.",
  },
  {
    match: ".titlebar-stripes + :not(.titlebar-stripes)",
    text: (el) =>
      el.closest("dialog")
        ? "This dialog's title. Nothing to click here; the close box is on the left."
        : "The window's title. Double-click it to collapse the window into its title bar.",
  },
  {
    match: 'dialog button[aria-label="Close"]',
    text: "The close box. Click it, press Escape, or click outside the dialog. All three send it away.",
  },

  { match: "#top h1 em", text: "It types itself out once per session. Restart, under Special, plays it again." },
  { match: "#top dl > div", text: (el) => lookup(facts, norm(el.querySelector("dt")?.textContent)) },

  {
    match: '[aria-label="Phone preview"] button[aria-label^="Show "]',
    text: (el) =>
      `Page dot for the ${(el.getAttribute("aria-label") ?? "").slice(5).toLowerCase()}. Tap to jump there; the phone stops flipping on its own for a while when you do.`,
  },
  {
    match: '[aria-label="Phone preview"] button[aria-label^="Get info: "]',
    text: (el) =>
      `${(el.getAttribute("aria-label") ?? "").slice(10)}, as a home screen icon. Tap it for Get Info. No wobbling, no deleting.`,
  },
  {
    match: '[aria-label="Phone preview"] a[aria-label]',
    text: byLabel(dock, (label) => `${label}. Opens in a new tab.`),
  },
  {
    match: '[aria-label="Phone preview"] a[href^="mailto:"]',
    text: "Looks like a message field, works like a link. Tap it and your email app opens with the subject already typed.",
  },
  {
    match: '[aria-label="Phone preview"] li.animate-notif',
    text: "A lock screen notification. Two are from my apps; the third is me, recruiting. Tap the screen to flip pages.",
  },
  {
    match: '[aria-label="Phone preview"] span.animate-notif',
    text: "How the conversation usually goes. The catch really is the whole catch.",
  },
  {
    match: '[aria-label="Phone preview"] > span',
    text: "A sticker, not a button. iOS and Android, usually from one codebase, native Swift when it matters.",
  },
  {
    match: '[aria-label="Phone preview"] > div > div',
    text: "The phone. It flips through its screens on its own; tap the screen to skip ahead, or use the dots at the bottom.",
  },
  {
    match: '[aria-label="Phone preview"]',
    text: "A phone, because that's where my work ends up. It flips through a few screens on its own.",
  },

  {
    match: ".animate-marquee",
    text: "The ticker. Everything you need to know about me, on a loop, including the free-app offer and its one condition.",
  },

  {
    match: '[role="progressbar"]',
    text: (el) =>
      `${el.getAttribute("aria-valuenow")} of ${el.getAttribute("aria-valuemax")} beta seats are taken. Each block is a tester; the empty ones are waiting for you.`,
  },
  {
    match: 'div:has(> [role="progressbar"])',
    text: "The beta seat counter. Updated by hand, so it's honest, if occasionally a day behind.",
  },
  {
    match: '[aria-labelledby="contact-alert-title"] > div > div > svg',
    text: "The stop-sign icon. In System 7 it meant something serious had happened. Here it means an email might.",
  },
  {
    match: '[aria-labelledby="contact-alert-title"] select',
    text: "A pop-up menu, System 7 style. Pick what you're writing about and the OK button follows along.",
  },
  {
    match: 'button[aria-label^="Show in "]',
    text: "Flips between Fahrenheit and Celsius. It remembers which one you like.",
  },
  {
    match: '[aria-labelledby="contact-alert-title"]',
    text: "A System 7 alert, permanently on screen. Unlike the originals, it won't beep at you.",
  },

  { match: '[aria-label="Filter projects by kind"] button', text: byText(filters) },
  {
    match: "#projects span[aria-live]",
    text: "How many projects match the current filter. It keeps count so you don't have to.",
  },
  {
    match: 'ul[aria-label="Built with"] > li',
    text: (el) => {
      const alt = el.querySelector("img")?.alt;
      return alt ? `${alt}. One piece of this app's toolkit. Get Info lists the whole stack.` : null;
    },
  },
  {
    match: 'ul[aria-label="Built with"]',
    text: "The tools this app was built with, stacked like coins. Point at one for its name.",
  },
  {
    match: 'button[aria-label^="Get info: "]',
    hit: true,
    text: (el, point) => {
      const stamp = el.querySelector(".stamp");
      if (stamp && inside(stamp, point)) {
        const label = stamp.textContent?.trim() ?? "";
        return {
          el: stamp,
          text: lookup(stamps, norm(label)) ?? `A rubber stamp. It says “${label}”, in case you were wondering.`,
        };
      }
      return point?.touch
        ? "A screenshot, dithered down to one bit like a 1991 Mac would draw it. It comes into color as you scroll past. Tap for Get Info."
        : "A screenshot, dithered down to one bit like a 1991 Mac would draw it. Hover for the color version; click for Get Info.";
    },
  },

  { match: "#workExperience button[aria-pressed]", text: byText(columns) },
  {
    match: "#workExperience button[aria-expanded]",
    text: (el) => {
      const org = el.querySelector(".font-medium")?.textContent?.trim();
      if (!org) return null;
      const open = el.getAttribute("aria-expanded") === "true";
      return `${org}. Click to ${open ? "close the folder" : "open the folder"} and see what I actually did there.`;
    },
  },
  { match: "#workExperience ul ul > li", text: "One document from that folder: a thing I actually did there." },
  {
    match: "#workExperience p.text-center",
    text: "The Finder's status line: how many places I've worked, and how long it's been since the first.",
  },

  { match: "dialog .btn-retro", text: byText(dialogButtons) },
  {
    match: ".btn-retro",
    text: byText(buttons, () => "A button. It does what it says, which is more than most buttons can claim."),
  },

  { match: 'footer a[href^="mailto:"]', text: "My email address, spelled out for the copy-and-paste crowd." },
  { match: "footer a[aria-label]", text: byLabel(socials, (label) => `${label}. Opens in a new tab.`) },
  {
    match: 'footer a[href="#top"]',
    text: "Scrolls all the way back up. Restart, under Special, replays the intro while you're there.",
  },
  {
    match: 'footer svg[viewBox="0 0 220 120"]',
    text: "A postmark, because this section is a letter. Sent from Los Angeles, with care.",
  },

  {
    match: 'nav[aria-label="Page ruler"] a',
    text: (el) => `Ruler mark: ${el.textContent?.trim()}. Click to jump to that section.`,
  },
  {
    match: 'nav[aria-label="Page ruler"]',
    text: "The scroll ruler. The shaded band is the part of the page you're looking at; the marks are the sections.",
  },

  { match: "div:has(> div > .titlebar-stripes)", text: frameCopy },
  { match: ".flex-col.border-2.shadow-retro, dialog > div", text: frameCopy },
  {
    match: "dialog",
    text: "The rest of the page is waiting behind this dialog. Click out here, press Escape, or use the close box to get back to it.",
  },
];

const BalloonHelp = () => {
  const [active, setActive] = useState(false);
  const [balloon, setBalloon] = useState<Balloon | null>(null);
  const activeRef = useRef(false);
  const balloonRef = useRef<Balloon | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<SVGSVGElement>(null);

  const show = useCallback((next: Balloon | null) => {
    const current = balloonRef.current;
    if (!next) {
      if (!current) return;
      balloonRef.current = null;
      setBalloon(null);
      return;
    }
    if (current && current.el === next.el && current.text === next.text) return;
    balloonRef.current = next;
    setBalloon(next);
  }, []);

  const place = useCallback(() => {
    const box = boxRef.current;
    const tail = tailRef.current;
    const current = balloonRef.current;
    if (!box || !tail || !current) return;

    const rect = current.el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gone =
      !current.el.isConnected ||
      (!rect.width && !rect.height) ||
      rect.bottom < 0 ||
      rect.top > vh ||
      rect.right < 0 ||
      rect.left > vw;
    if (gone) {
      show(null);
      return;
    }

    const left = Math.max(rect.left, 0);
    const right = Math.min(rect.right, vw);
    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, vh);
    const anchor = current.point ? clamp(current.point.x, left, right) : (left + right) / 2;
    const w = box.offsetWidth;
    const h = box.offsetHeight;
    const below = bottom + h + 20 <= vh || top - h - 20 < 0;
    const x = clamp(anchor < vw / 2 ? anchor - 24 : anchor - w + 24, 8, Math.max(8, vw - w - 8));
    const y = clamp(below ? bottom + 12 : top - h - 12, 8, Math.max(8, vh - h - 8));

    box.style.left = `${Math.round(x)}px`;
    box.style.top = `${Math.round(y)}px`;
    tail.style.left = `${Math.round(clamp(anchor - x - 9, 10, Math.max(10, w - 28)))}px`;
    tail.style.top = below ? "-9px" : "auto";
    tail.style.bottom = below ? "auto" : "-9px";
    tail.style.transform = below ? "" : "scaleY(-1)";
  }, [show]);

  useEffect(() => {
    const onToggle = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      const next = typeof detail === "boolean" ? detail : !activeRef.current;
      if (next === activeRef.current) return;
      activeRef.current = next;
      play(next ? "open" : "close");
      setActive(next);
    };
    window.addEventListener("portfolio:balloons", onToggle);
    return () => window.removeEventListener("portfolio:balloons", onToggle);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("portfolio:balloons:state", { detail: active }));
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const probe = document.createElement("div");
    const live = entries.filter((entry) => {
      try {
        probe.matches(entry.match);
        return true;
      } catch {
        return false;
      }
    });

    let target: Element | null = null;
    let point: Point = null;
    let frame = 0;
    let timer = 0;

    const asElement = (value: EventTarget | null) => (value instanceof Element ? value : null);

    const resolve = (start: Element | null, at: Point): Balloon | null => {
      let node = start;
      while (node && node !== document.body) {
        for (const entry of live) {
          if (!node.matches(entry.match)) continue;
          const out = typeof entry.text === "string" ? entry.text : entry.text(node, at);
          if (!out) continue;
          const found = typeof out === "string" ? { el: node, text: out } : out;
          return { ...found, point: at, hit: Boolean(entry.hit) };
        }
        node = node.parentElement;
      }
      return null;
    };

    const refresh = () => {
      const modal = document.querySelector("dialog[open]");
      if (target && (!target.isConnected || (modal && !modal.contains(target)))) target = null;
      show(target ? resolve(target, point) : null);
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      target = asElement(event.target);
      point = { x: event.clientX, y: event.clientY, touch: false };
      show(resolve(target, point));
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      point = { x: event.clientX, y: event.clientY, touch: false };
      if (!balloonRef.current?.hit || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        refresh();
      });
    };

    const onOut = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.relatedTarget === null) show(null);
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      target = asElement(event.target);
      point = { x: event.clientX, y: event.clientY, touch: true };
      show(resolve(target, point));
    };

    const onClick = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(refresh, 0);
    };

    const onFocusIn = (event: FocusEvent) => {
      const el = asElement(event.target);
      if (!el || getComputedStyle(el).visibility === "hidden") return;
      if (point && target && el.contains(target)) return;
      target = el;
      point = null;
      show(resolve(el, null));
    };

    const onFocusOut = (event: FocusEvent) => {
      const current = balloonRef.current;
      const from = asElement(event.target);
      const to = asElement(event.relatedTarget);
      if (current && from && current.el.contains(from) && !(to && current.el.contains(to))) show(null);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") show(null);
    };

    const onScroll = () => {
      if (frame || !balloonRef.current) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };

    document.addEventListener("pointerover", onOver, true);
    document.addEventListener("pointermove", onMove, { capture: true, passive: true });
    document.addEventListener("pointerout", onOut, true);
    document.addEventListener("pointerup", onUp, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      document.removeEventListener("pointerover", onOver, true);
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerout", onOut, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      balloonRef.current = null;
      setBalloon(null);
    };
  }, [active, place, show]);

  useIsoLayoutEffect(() => {
    const layer = layerRef.current;
    if (!active || !layer || !supportsPopover()) return;
    layer.setAttribute("popover", "manual");
    raise(layer);
    return () => {
      try {
        layer.hidePopover();
      } catch {}
    };
  }, [active]);

  useIsoLayoutEffect(() => {
    if (!balloon) return;
    place();
    const layer = layerRef.current;
    if (layer && balloon.el.closest("dialog[open]")) raise(layer);
  }, [balloon, place]);

  if (!active) return null;

  return (
    <div
      ref={layerRef}
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[90] m-0 h-auto w-auto overflow-hidden border-0 bg-transparent p-0 text-ink"
    >
      {balloon && (
        <div
          ref={boxRef}
          role="tooltip"
          className="absolute left-0 top-0 w-max max-w-[240px] rounded-xl border-2 border-ink bg-paper px-3 py-2 font-sans text-[12px] leading-snug text-ink shadow-retro-sm"
        >
          {balloon.text}
          <svg
            ref={tailRef}
            aria-hidden
            width="18"
            height="11"
            viewBox="0 0 18 11"
            shapeRendering="crispEdges"
            className="absolute left-3 text-ink"
          >
            <path d="M0 11 L9 1 L18 11 Z" fill="rgb(var(--paper))" />
            <path d="M-1 12 L9 1 L19 12" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BalloonHelp;
