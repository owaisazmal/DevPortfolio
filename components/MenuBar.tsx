"use client";

import { useEffect, useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import { contactEmail, navItems, resumeUrl, socialMedia } from "@/data";
import { cn } from "@/utils/cn";

type Item =
  | { kind: "link"; label: string; href: string; external?: boolean }
  | {
      kind: "action";
      label: string;
      run: () => void;
      disabled?: boolean;
      checked?: boolean;
      keepOpen?: boolean;
    }
  | { kind: "sep" };

type Menu = { name: string; items: Item[] };

const laTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

const applyTheme = (night: boolean) => {
  const root = document.documentElement;
  if (night) root.setAttribute("data-theme", "night");
  else root.removeAttribute("data-theme");
  try {
    localStorage.setItem("theme", night ? "night" : "day");
  } catch {}
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", night ? "#1B1A16" : "#FFFFE3");
};

const emit = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

const MenuItem = ({ item, onDone }: { item: Item; onDone: () => void }) => {
  if (item.kind === "sep") return <li role="separator" className="menu-sep" />;

  if (item.kind === "link") {
    return (
      <li role="none">
        <a
          role="menuitem"
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          className="menu-item"
          onClick={onDone}
        >
          {item.label}
        </a>
      </li>
    );
  }

  const checkable = item.checked !== undefined;
  return (
    <li role="none">
      <button
        type="button"
        role={checkable ? "menuitemcheckbox" : "menuitem"}
        aria-checked={checkable ? item.checked : undefined}
        disabled={item.disabled}
        className="menu-item"
        onClick={() => {
          item.run();
          if (!item.keepOpen) onDone();
        }}
      >
        <span className="flex items-center gap-2">
          {checkable && (
            <span aria-hidden className="w-3 text-center">
              {item.checked ? "✓" : ""}
            </span>
          )}
          {item.label}
        </span>
      </button>
    </li>
  );
};

const MenuBar = () => {
  const [time, setTime] = useState("");
  const [night, setNight] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [focusFirst, setFocusFirst] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const titleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const tick = () => setTime(laTime.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setNight(document.documentElement.getAttribute("data-theme") === "night");
  }, []);

  useEffect(() => {
    if (openMenu === null && !mobileOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (headerRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu, mobileOpen]);

  useEffect(() => {
    if (openMenu === null || !focusFirst) return;
    panelRef.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])')?.focus();
    setFocusFirst(false);
  }, [openMenu, focusFirst]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  const toggleNight = () => {
    const next = !night;
    setNight(next);
    applyTheme(next);
  };

  const restart = () => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    emit("portfolio:restart");
  };

  const menus: Menu[] = [
    {
      name: "File",
      items: [
        { kind: "link", label: "Open Résumé", href: resumeUrl, external: true },
        ...socialMedia.map(
          (social): Item => ({
            kind: "link",
            label: `Open ${social.name}`,
            href: social.link,
            external: true,
          }),
        ),
        { kind: "sep" },
        { kind: "action", label: "Quit", run: () => {}, disabled: true },
      ],
    },
    {
      name: "Edit",
      items: [
        { kind: "action", label: copied ? "Copied!" : "Copy Email", run: copyEmail, keepOpen: true },
        { kind: "link", label: "Email Me…", href: `mailto:${contactEmail}` },
      ],
    },
    {
      name: "View",
      items: [
        { kind: "action", label: "Night Mode", run: toggleNight, checked: night },
        { kind: "sep" },
        { kind: "action", label: "Collapse All Windows", run: () => emit("portfolio:shade", true) },
        { kind: "action", label: "Expand All Windows", run: () => emit("portfolio:shade", false) },
      ],
    },
    {
      name: "Special",
      items: [
        {
          kind: "action",
          label: "About This Portfolio…",
          run: () => emit("portfolio:dialog", { name: "about" }),
        },
        { kind: "sep" },
        { kind: "action", label: "Restart", run: restart },
        { kind: "action", label: "Shut Down…", run: () => emit("portfolio:dialog", { name: "bomb" }) },
      ],
    },
  ];

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const openAt = (index: number, viaKeyboard: boolean) => {
    setOpenMenu(index);
    setFocusFirst(viaKeyboard);
  };

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLUListElement>, index: number) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])'),
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    const move = (offset: number) => {
      event.preventDefault();
      items[(current + offset + items.length) % items.length]?.focus();
    };

    if (event.key === "ArrowDown") move(1);
    else if (event.key === "ArrowUp") move(-1);
    else if (event.key === "ArrowRight") {
      event.preventDefault();
      openAt((index + 1) % menus.length, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      openAt((index - 1 + menus.length) % menus.length, true);
    } else if (event.key === "Escape") {
      setOpenMenu(null);
      titleRefs.current[index]?.focus();
    } else if (event.key === "Tab") {
      setOpenMenu(null);
    }
  };

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 border-b-2 border-ink bg-paper">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6"
      >
        <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="Owais Khan, back to top">
          <img
            src="./avatar.jpg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 border-2 border-ink object-cover"
          />
          <span className="hidden font-mono text-xs font-semibold uppercase tracking-[0.18em] sm:inline md:hidden lg:inline">
            Owais Khan
          </span>
        </a>

        <ul role="menubar" aria-label="Portfolio menus" className="hidden items-center md:flex">
          {menus.map((menu, index) => {
            const isOpen = openMenu === index;
            return (
              <li key={menu.name} role="none" className="relative">
                <button
                  ref={(el) => {
                    titleRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={(event) => (isOpen ? setOpenMenu(null) : openAt(index, event.detail === 0))}
                  onPointerEnter={() => {
                    if (openMenu !== null && !isOpen) openAt(index, false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowDown") return;
                    event.preventDefault();
                    openAt(index, true);
                  }}
                  className={cn(
                    "px-2.5 py-1 font-mono text-xs uppercase tracking-wider",
                    isOpen && "bg-ink text-paper",
                  )}
                >
                  {menu.name}
                </button>
                {isOpen && (
                  <ul
                    ref={panelRef}
                    role="menu"
                    aria-label={menu.name}
                    onKeyDown={(event) => onPanelKeyDown(event, index)}
                    className="absolute left-0 top-full z-50 mt-[2px] min-w-[13rem] border-2 border-ink bg-paper py-1 shadow-retro"
                  >
                    {menu.items.map((item, i) => (
                      <MenuItem key={i} item={item} onDone={closeAll} />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <ul className="ml-auto flex items-center gap-0.5 font-mono text-[10px] uppercase tracking-wider min-[380px]:gap-1 min-[380px]:text-[11px] sm:gap-3 sm:text-xs">
          {navItems.map((item) => (
            <li key={item.link}>
              <a
                href={item.link}
                className="block px-1 py-1 transition-colors hover:bg-ink hover:text-paper min-[380px]:px-1.5"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        <p className="hidden min-w-[9.5rem] text-right font-mono text-xs tabular-nums lg:block">
          <span className="text-ink-soft">LA</span> {time}
        </p>

        <button
          type="button"
          onClick={() => {
            setMobileOpen(!mobileOpen);
            setOpenMenu(null);
          }}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label="More options"
          className="grid h-8 w-8 shrink-0 place-items-center border-2 border-ink md:hidden"
        >
          {mobileOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t-2 border-ink bg-paper md:hidden">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-4 sm:grid-cols-2 sm:px-6">
            {menus.map((menu) => (
              <div key={menu.name}>
                <p className="label px-3 text-steel-deep">{menu.name}</p>
                <ul role="menu" aria-label={menu.name} className="mt-1">
                  {menu.items.map((item, i) => (
                    <MenuItem key={i} item={item} onDone={closeAll} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default MenuBar;
