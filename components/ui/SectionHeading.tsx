import { cn } from "@/utils/cn";

type SectionHeadingProps = {
  index: string;
  label: string;
  onDark?: boolean;
  className?: string;
  children: React.ReactNode;
};

export const SectionHeading = ({ index, label, onDark, className, children }: SectionHeadingProps) => (
  <div className={cn("mb-10 md:mb-14", className)}>
    <p className={cn("label", onDark ? "text-steel-light" : "text-steel-deep")}>
      [{index}] &mdash; {label}
    </p>
    <h2 className="mt-3 font-serif text-[2.6rem] leading-[1.02] sm:text-5xl md:text-6xl">
      {children}
    </h2>
  </div>
);
