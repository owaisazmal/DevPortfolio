"use client";

import { useEffect, useState } from "react";

import { reducedMotion } from "@/utils/zoomRects";

const TypedWord = ({ text }: { text: string }) => {
  const [shown, setShown] = useState(text.length);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const restart = () => setRound((value) => value + 1);
    window.addEventListener("portfolio:restart", restart);
    return () => window.removeEventListener("portfolio:restart", restart);
  }, []);

  useEffect(() => {
    if (reducedMotion()) return;
    try {
      if (round === 0 && sessionStorage.getItem("typed")) return;
    } catch {}

    let count = 0;
    let interval = 0;
    setShown(0);
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        count += 1;
        setShown(count);
        if (count < text.length) return;
        window.clearInterval(interval);
        try {
          sessionStorage.setItem("typed", "1");
        } catch {}
      }, 80);
    }, 600);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
      setShown(text.length);
    };
  }, [text, round]);

  const typing = shown < text.length;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split("").map((ch, index) => (
          <span key={index} className={index < shown ? undefined : "invisible"}>
            {ch}
          </span>
        ))}
      </span>
      <span aria-hidden className={typing ? undefined : "animate-blink"}>
        _
      </span>
    </>
  );
};

export default TypedWord;
