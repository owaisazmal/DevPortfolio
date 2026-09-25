"use client";

import { FiArrowUpRight } from "react-icons/fi";

type OfferCtaProps = {
  href: string;
  dialog: string;
  children: React.ReactNode;
};

const OfferCta = ({ href, dialog, children }: OfferCtaProps) => (
  <a
    href={href}
    className="btn-retro btn-steel mt-auto self-start"
    onClick={(event) => {
      event.preventDefault();
      window.dispatchEvent(
        new CustomEvent("portfolio:dialog", {
          detail: { name: dialog, from: event.currentTarget.getBoundingClientRect() },
        }),
      );
    }}
  >
    {children} <FiArrowUpRight aria-hidden />
  </a>
);

export default OfferCta;
