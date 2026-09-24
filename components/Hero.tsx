import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";

import { contactEmail } from "@/data";

import PhoneMock from "./PhoneMock";
import TypedWord from "./TypedWord";

const facts = [
  { term: "Based in", value: "Los Angeles, CA" },
  { term: "Builds for", value: "iOS + Android" },
  { term: "Status", value: "Shipping things" },
];

const Hero = () => (
  <section id="top" className="pb-20 pt-28 md:pb-28 md:pt-36">
    <div className="grid items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="label text-steel-deep">Hello, world &mdash; I&apos;m Owais</p>

        <h1 className="mt-5 font-serif text-[2.9rem] leading-[0.98] sm:text-6xl lg:text-[5.25rem]">
          Building intuitive mobile apps with precision &amp;{" "}
          <em className="text-steel">
            <TypedWord text="passion" />
          </em>
        </h1>

        <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Mobile developer in Los Angeles, crafting sleek, scalable, user-friendly apps for
          iOS and Android. The kind that earns a permanent spot on your home screen.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <a href={`mailto:${contactEmail}`} className="btn-retro btn-ink">
            Contact me <FiArrowUpRight aria-hidden />
          </a>
          <a href="#projects" className="btn-retro btn-paper">
            See my work <FiArrowDown aria-hidden />
          </a>
        </div>

        <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 font-mono text-xs uppercase tracking-wider">
          {facts.map((fact) => (
            <div key={fact.term}>
              <dt className="text-steel-deep">{fact.term}</dt>
              <dd className="mt-1 font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <PhoneMock />
    </div>
  </section>
);

export default Hero;
