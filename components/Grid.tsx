import { FiArrowUpRight } from "react-icons/fi";

import { aboutIntro, contactEmail, offers } from "@/data";

import CopyEmailButton from "./CopyEmailButton";
import { SectionHeading } from "./ui/SectionHeading";
import { Window } from "./ui/Window";

const Grid = () => (
  <section id="about" className="py-20 md:py-28">
    <SectionHeading index="01" label="About">
      Small screens, big <em className="text-steel">ideas</em>.
    </SectionHeading>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
      <Window
        title="about_me.txt"
        className="md:col-span-7"
        bodyClassName="flex h-full flex-col justify-between gap-10 p-6 md:p-10"
      >
        <p className="font-serif text-[2rem] leading-[1.12] md:text-[2.6rem]">{aboutIntro}</p>
        <p className="font-mono text-xs text-ink-soft">
          &mdash; Owais, probably nudging a corner radius by 1pt right now
        </p>
      </Window>

      {offers.map((offer) => (
        <Window
          key={offer.id}
          title={offer.window}
          className="md:col-span-5"
          bodyClassName="flex h-full flex-col gap-4 p-6 md:p-8"
        >
          <h3 className="font-serif text-3xl leading-tight">{offer.title}</h3>
          <p className="leading-relaxed text-ink-soft">{offer.body}</p>
          <p className="font-mono text-[11px] leading-relaxed text-ink-soft">{offer.finePrint}</p>
          <a href={offer.href} className="btn-retro btn-steel mt-auto self-start">
            {offer.cta} <FiArrowUpRight aria-hidden />
          </a>
        </Window>
      ))}

      <Window
        title="contact.card"
        tone="steel"
        className="md:col-span-7"
        bodyClassName="flex h-full flex-col justify-between gap-8 p-6 md:p-10"
      >
        <h3 className="font-serif text-[2rem] leading-[1.12] md:text-[2.6rem]">
          Do you want to start a project together?
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <a href={`mailto:${contactEmail}`} className="font-mono text-sm underline decoration-steel-deep underline-offset-4">
            {contactEmail}
          </a>
          <CopyEmailButton />
        </div>
      </Window>
    </div>
  </section>
);

export default Grid;
