import { cn } from "@/utils/cn";

type StampProps = {
  children: React.ReactNode;
  className?: string;
};

export const Stamp = ({ children, className }: StampProps) => (
  <span className={cn("stamp pointer-events-none", className)}>{children}</span>
);
