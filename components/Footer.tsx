import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { FiArrowUp, FiArrowUpRight } from "react-icons/fi";
import { SiLeetcode } from "react-icons/si";

import { contactEmail, socialMedia } from "@/data";

import { SectionHeading } from "./ui/SectionHeading";

const designCredit = "https://github.com/owaisazmal/DevPortfolio";

const socialIcons: Record<string, React.ReactNode> = {
  GitHub: <FaGithub aria-hidden />,
  LinkedIn: <FaLinkedinIn aria-hidden />,
  LeetCode: <SiLeetcode aria-hidden />,
};

const Postmark = () => (
  <svg
    viewBox="0 0 220 120"
    width="220"
    height="120"
    aria-hidden
    className="absolute right-0 top-40 hidden -rotate-12 text-steel-light opacity-80 lg:block"
  >
    <defs>
      <path id="postmark-ring" d="M60 60 m -42 0 a 42 42 0 1 1 84 0 a 42 42 0 1 1 -84 0" />
    </defs>
    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
    <text fill="currentColor" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4">
      <textPath href="#postmark-ring" startOffset="2">
        LOS ANGELES · CA · SENT WITH CARE ·
      </textPath>
    </text>
    <text x="60" y="67" textAnchor="middle" fill="currentColor" fontFamily="var(--font-serif)" fontSize="22">
      {new Date().getFullYear()}
    </text>
    {[36, 50, 64, 78].map((y) => (
      <path
        key={y}
        d={`M122 ${y} q 8 -6 16 0 t 16 0 t 16 0 t 16 0 t 16 0`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    ))}
  </svg>
);

const Footer = () => (
  <footer id="contact" className="dots-dark border-t-2 border-ink bg-ink text-paper">
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 md:pt-28">
      <div className="relative">
        <Postmark />
        <SectionHeading index="04" label="Contact" onDark className="max-w-4xl">
          Got an idea that belongs in someone&apos;s <em className="text-steel-light">pocket</em>?
        </SectionHeading>

        <p className="-mt-4 max-w-xl text-lg leading-relaxed text-fog">
          Reach out today. Let&apos;s connect and build something amazing together, or at least
          have a very good conversation about it.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        <a href={`mailto:${contactEmail}`} className="btn-retro btn-on-dark">
          Let&apos;s get in touch <FiArrowUpRight aria-hidden />
        </a>
        <a
          href={`mailto:${contactEmail}`}
          className="font-mono text-sm text-fog underline decoration-steel underline-offset-4 hover:text-paper"
        >
          {contactEmail}
        </a>
      </div>

      <div className="mt-24 flex flex-col-reverse gap-6 border-t border-ink-soft pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-col items-start gap-2 font-mono text-xs uppercase tracking-wider text-fog sm:flex-row sm:items-center sm:gap-3">
          <span>&copy; {new Date().getFullYear()} Owais Khan</span>
          <span aria-hidden className="hidden text-steel-light sm:inline">
            &middot;
          </span>
          <a
            href={designCredit}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline decoration-steel underline-offset-4 hover:text-paper"
          >
            Design by Owais Khan <FiArrowUpRight aria-hidden />
          </a>
        </p>

        <div className="flex items-center gap-3">
          {socialMedia.map((social) => (
            <a
              key={social.id}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="grid h-10 w-10 place-items-center border-2 border-paper text-lg transition-colors hover:bg-paper hover:text-ink"
            >
              {socialIcons[social.name]}
            </a>
          ))}
          <a
            href="#top"
            className="ml-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fog hover:text-paper"
          >
            Back to top <FiArrowUp aria-hidden />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
