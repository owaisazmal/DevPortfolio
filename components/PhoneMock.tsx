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

const PhoneMock = () => (
  <div aria-hidden className="relative mx-auto w-full max-w-[290px] sm:max-w-[320px]">
    <div className="rounded-[2.9rem] border-2 border-ink bg-ink p-2.5 shadow-retro-lg">
      <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[2.3rem] bg-paper bg-[radial-gradient(rgb(var(--ink)_/_0.12)_1px,transparent_1px)] bg-[length:14px_14px] px-3.5">
        <div className="flex items-center justify-between px-3 pt-3 font-mono text-[11px] font-semibold">
          <span>9:41</span>
          <span className="h-5 w-20 rounded-full bg-ink" />
          <span className="flex items-end gap-[2px]">
            {[4, 6, 8, 10].map((h) => (
              <span key={h} className="w-[3px] bg-ink" style={{ height: h }} />
            ))}
          </span>
        </div>

        <div className="mt-7 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">
            It&apos;s always
          </p>
          <p className="font-serif text-7xl leading-none">9:41</p>
        </div>

        <ul className="mt-7 space-y-2.5">
          {notifications.map((n) => (
            <li
              key={n.app}
              className="flex gap-2.5 rounded-xl border-2 border-ink bg-surface p-2.5 shadow-retro-sm"
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

        <span className="mx-auto mb-2 mt-auto h-1 w-24 rounded-full bg-ink" />
      </div>
    </div>

    <span className="absolute -left-4 bottom-32 -rotate-6 border-2 border-ink bg-steel-deep px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-paper shadow-retro-sm sm:-left-10">
      iOS + Android
    </span>
  </div>
);

export default PhoneMock;
