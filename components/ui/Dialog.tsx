"use client";

import { useEffect, useId, useRef } from "react";

import { cn } from "@/utils/cn";
import { Box, centerBox, zoomRects } from "@/utils/zoomRects";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  from?: Box | null;
  className?: string;
  children: React.ReactNode;
};

export const Dialog = ({ open, onClose, title, from, className, children }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const fromRef = useRef(from);
  fromRef.current = from;
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      const to = dialog.getBoundingClientRect();
      dialog.style.visibility = "hidden";
      zoomRects(fromRef.current ?? centerBox(to), to).then(() => {
        dialog.style.visibility = "";
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      if (open) document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.style.overflow = "";
      onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn("sys-dialog", className)}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="m-1 border border-ink">
        <div className="flex select-none items-center gap-2.5 border-b-2 border-ink px-2 py-1.5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-3.5 w-3.5 shrink-0 border-2 border-ink bg-paper transition-colors hover:bg-steel-wash"
          />
          <span aria-hidden className="titlebar-stripes h-2.5 min-w-3 flex-1" />
          <h2
            id={titleId}
            className="max-w-[70%] truncate font-pixel text-[14px] leading-none"
          >
            {title}
          </h2>
          <span aria-hidden className="titlebar-stripes h-2.5 min-w-3 flex-1" />
          <span aria-hidden className="h-3.5 w-3.5 shrink-0" />
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </dialog>
  );
};
