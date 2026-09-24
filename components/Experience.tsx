import { workExperience } from "@/data";

import { SectionHeading } from "./ui/SectionHeading";

const Experience = () => (
  <section id="workExperience" className="py-20 md:py-28">
    <SectionHeading index="03" label="Experience">
      My work <em className="text-steel">experience</em>.
    </SectionHeading>

    <ol className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
      {workExperience.map((job) => (
        <li key={job.id} className="relative flex min-w-0 flex-col pt-7">
          <p className="absolute left-5 top-0 h-7 border-2 border-b-0 border-ink bg-steel-wash px-3 pt-1 font-mono text-[11px] font-semibold uppercase tracking-wider">
            {job.date}
          </p>
          <article className="flex-1 border-2 border-ink bg-surface p-6 shadow-retro md:p-8">
            <h3 className="font-serif text-3xl leading-tight">{job.title}</h3>
            <ul className="mt-5 space-y-3 leading-relaxed text-ink-soft">
              {job.desc.split("|").map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 bg-steel-deep" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  </section>
);

export default Experience;
