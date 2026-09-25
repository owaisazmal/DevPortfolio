type Name = "click" | "open" | "close" | "shade" | "error" | "type";

type Tone = [frequency: number, seconds: number, wave: OscillatorType];

const tones: Record<Name, Tone[]> = {
  click: [[1200, 0.03, "square"]],
  open: [[520, 0.05, "square"], [780, 0.07, "square"]],
  close: [[780, 0.05, "square"], [520, 0.07, "square"]],
  shade: [[660, 0.04, "triangle"], [440, 0.06, "triangle"]],
  error: [[180, 0.18, "sawtooth"]],
  type: [[2000, 0.012, "square"]],
};

let context: AudioContext | null = null;
let enabled = false;

export const soundEnabled = () => enabled;

export const initSound = () => {
  try {
    enabled = localStorage.getItem("sound") === "on";
  } catch {}
  return enabled;
};

const audio = () => {
  if (!enabled || typeof window === "undefined") return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
};

export const play = (name: Name) => {
  try {
    const ctx = audio();
    if (!ctx) return;
    let at = ctx.currentTime;
    for (const [frequency, seconds, wave] of tones[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.08, at + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + seconds + 0.02);
      at += seconds;
    }
  } catch {}
};

export const chime = () => {
  try {
    const ctx = audio();
    if (!ctx || (ctx.state !== "running" && !navigator.userActivation?.isActive)) return;
    const at = ctx.currentTime + 0.02;
    for (const frequency of [174.61, 261.63, 349.23, 440, 523.25]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.035, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 1.85);
    }
  } catch {}
};

export const setSound = (on: boolean) => {
  enabled = on;
  try {
    localStorage.setItem("sound", on ? "on" : "off");
  } catch {}
  window.dispatchEvent(new CustomEvent("portfolio:sound", { detail: on }));
  if (on) play("open");
};
