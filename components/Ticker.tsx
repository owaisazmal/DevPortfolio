const items = [
  "Mobile developer",
  "iOS + Android",
  "Based in Los Angeles",
  "Beta testers wanted",
  "Will build your idea for free*",
  "*If I like it",
];

const Ticker = () => (
  <div className="overflow-hidden border-y-2 border-ink bg-ink py-3 text-paper">
    <p className="sr-only">{items.join(". ")}</p>
    <div aria-hidden className="flex w-max animate-marquee">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex shrink-0 items-center">
          {items.map((item) => (
            <span key={item} className="flex items-center font-mono text-xs uppercase tracking-[0.22em] sm:text-sm">
              <span className="px-6">{item}</span>
              <span className="text-steel-light">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Ticker;
