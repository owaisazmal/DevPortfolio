import { betaSeats } from "@/data";
import { cn } from "@/utils/cn";

const segments = 20;

const BetaSeats = () => {
  const { taken, total } = betaSeats;
  const filled = Math.round((taken / total) * segments);

  return (
    <div className="border-2 border-ink bg-paper p-3">
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-wider">
        <span>Beta seats</span>
        <span className="tabular-nums">
          {taken} of {total} taken
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Beta seats taken"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={taken}
        className="mt-2 flex gap-[3px]"
      >
        {Array.from({ length: segments }, (_, index) => (
          <span
            key={index}
            className={cn("h-3 flex-1 border border-ink", index < filled ? "bg-ink" : "bg-surface")}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-ink-soft">
        {total - taken} left. First come, first served.
      </p>
    </div>
  );
};

export default BetaSeats;
