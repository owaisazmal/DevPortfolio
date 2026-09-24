"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

import { contactEmail } from "@/data";

const CopyEmailButton = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  return (
    <>
      <button type="button" onClick={copy} className="btn-retro btn-ink">
        {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
        {copied ? "Copied!" : "Copy email"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </>
  );
};

export default CopyEmailButton;
