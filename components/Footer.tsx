import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { FiArrowUp, FiArrowUpRight } from "react-icons/fi";

import { contactEmail, socialMedia } from "@/data";

import { SectionHeading } from "./ui/SectionHeading";

const socialIcons: Record<string, React.ReactNode> = {
  GitHub: <FaGithub aria-hidden />,
  LinkedIn: <FaLinkedinIn aria-hidden />,
};

const Footer = () => (
  <footer id="contact" className="dots-dark border-t-2 border-ink bg-ink text-paper">
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 md:pt-28">
      <SectionHeading index="04" label="Contact" onDark className="max-w-4xl">
        Got an idea that belongs in someone&apos;s <em className="text-steel-light">pocket</em>?
      </SectionHeading>

      <p className="-mt-4 max-w-xl text-lg leading-relaxed text-fog">
        Reach out today. Let&apos;s connect and build something amazing together, or at least
        have a very good conversation about it.
      </p>

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
        <p className="font-mono text-xs uppercase tracking-wider text-fog">
          &copy; {new Date().getFullYear()} Owais Khan
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
