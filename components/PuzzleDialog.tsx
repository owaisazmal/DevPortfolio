"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/utils/cn";
import { play } from "@/utils/sound";
import { reducedMotion } from "@/utils/zoomRects";

import { Dialog } from "./ui/Dialog";

const SIZE = 4;
const TOTAL = SIZE * SIZE;
const EMPTY = TOTAL - 1;
const SHUFFLE_MOVES = 200;
const src = "./avatar.jpg";

const tiles = Array.from({ length: TOTAL }, (_, i) => i);

const row = (index: number) => Math.floor(index / SIZE);
const col = (index: number) => index % SIZE;

const isSolved = (board: number[]) => board.every((tile, index) => tile === index);

const slide = (board: number[], from: number) => {
  if (from < 0 || from >= TOTAL) return null;
  const empty = board.indexOf(EMPTY);
  if (from === empty) return null;
  const sameRow = row(from) === row(empty);
  if (!sameRow && col(from) !== col(empty)) return null;
  const step = (sameRow ? 1 : SIZE) * (from < empty ? 1 : -1);
  const next = board.slice();
  for (let pos = empty; pos !== from; pos -= step) next[pos] = next[pos - step];
  next[from] = EMPTY;
  return next;
};

const neighbors = (empty: number) => {
  const list: number[] = [];
  if (col(empty) > 0) list.push(empty - 1);
  if (col(empty) < SIZE - 1) list.push(empty + 1);
  if (empty >= SIZE) list.push(empty - SIZE);
  if (empty < TOTAL - SIZE) list.push(empty + SIZE);
  return list;
};

const shuffle = () => {
  let board = tiles;
  do {
    board = tiles.slice();
    let last = -1;
    for (let i = 0; i < SHUFFLE_MOVES; i++) {
      const empty = board.indexOf(EMPTY);
      const options = neighbors(empty).filter((index) => index !== last);
      const pick = options[Math.floor(Math.random() * options.length)];
      board[empty] = board[pick];
      board[pick] = EMPTY;
      last = empty;
    }
  } while (isSolved(board));
  return board;
};

const arrows: Partial<Record<string, number>> = {
  ArrowLeft: 1,
  ArrowRight: -1,
  ArrowUp: SIZE,
  ArrowDown: -SIZE,
};

const cell = "absolute left-0 top-0 h-14 w-14 min-[360px]:h-16 min-[360px]:w-16";

const place = (position: number) => `translate(${col(position) * 100}%, ${row(position) * 100}%)`;

const cut = (tile: number) => ({
  backgroundImage: `url(${src})`,
  backgroundSize: "400% 400%",
  backgroundPosition: `${(col(tile) * 100) / (SIZE - 1)}% ${(row(tile) * 100) / (SIZE - 1)}%`,
});

const PuzzleDialog = () => {
  const [open, setOpen] = useState(false);
  const [board, setBoard] = useState(tiles);
  const [moves, setMoves] = useState(0);
  const [animate, setAnimate] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const reset = useCallback(() => {
    setBoard(shuffle());
    setMoves(0);
  }, []);

  useEffect(() => {
    const onDialog = (event: Event) => {
      if ((event as CustomEvent<{ name: string }>).detail.name !== "puzzle") return;
      setAnimate(!reducedMotion());
      reset();
      setOpen(true);
    };
    window.addEventListener("portfolio:dialog", onDialog);
    return () => window.removeEventListener("portfolio:dialog", onDialog);
  }, [reset]);

  const solved = isSolved(board);

  const moveTile = useCallback(
    (from: number) => {
      if (isSolved(board)) return;
      const next = slide(board, from);
      if (!next) return;
      setBoard(next);
      setMoves((count) => count + 1);
      play(isSolved(next) ? "open" : "click");
    },
    [board],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      const step = arrows[event.key];
      if (step === undefined || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      moveTile(board.indexOf(EMPTY) + step);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, board, moveTile]);

  const motion = animate && "transition-transform duration-200 ease-out";
  const empty = board.indexOf(EMPTY);

  return (
    <Dialog open={open} onClose={close} title="Puzzle" className="w-fit max-w-[92vw]">
      <div className="flex w-[228px] flex-col items-center gap-4 min-[360px]:w-[260px]">
        <div
          role="group"
          aria-label="Sliding puzzle"
          className={cn(
            "relative h-[228px] w-[228px] border-2 border-ink bg-paper shadow-retro-sm min-[360px]:h-[260px] min-[360px]:w-[260px]",
            solved && "ring-2 ring-steel-deep ring-offset-2 ring-offset-paper",
          )}
        >
          <div
            aria-hidden
            style={{ transform: place(empty), ...(solved ? cut(EMPTY) : undefined) }}
            className={cn(
              cell,
              motion,
              solved
                ? "border border-ink [image-rendering:pixelated]"
                : "border-2 border-dotted border-ash bg-paper",
            )}
          />
          {tiles.slice(0, EMPTY).map((tile) => {
            const position = board.indexOf(tile);
            return (
              <button
                key={tile}
                type="button"
                aria-label={`Tile ${tile + 1}, row ${row(position) + 1}, column ${col(position) + 1}`}
                onClick={() => moveTile(position)}
                style={{ transform: place(position), ...cut(tile) }}
                className={cn(
                  cell,
                  motion,
                  "touch-manipulation border border-ink [image-rendering:pixelated] focus-visible:z-10",
                )}
              />
            );
          })}
        </div>

        <div className="w-full border-2 border-ink bg-surface px-3 py-2">
          <p className="font-mono text-[11px] uppercase tracking-wider tabular-nums">Moves: {moves}</p>
          <p aria-live="polite" className="mt-1 min-h-[2.5rem] text-sm leading-snug text-ink-soft">
            {solved
              ? `Solved in ${moves} move${moves === 1 ? "" : "s"}. He does look like that.`
              : "Slide tiles into the gap until the picture lines up."}
          </p>
        </div>

        <div className="flex w-full flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              play("click");
              reset();
            }}
            className="btn-retro btn-paper"
          >
            Shuffle
          </button>
          <button type="button" onClick={close} className="btn-retro btn-ink">
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default PuzzleDialog;
