"use client";

import { motion } from "framer-motion";

export function ProductVisual() {
  return (
    <motion.div
      className="landing-product relative mx-auto w-full max-w-xl lg:max-w-none"
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="landing-product-glow" aria-hidden />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/50 bg-[#0b1f1c]/[0.92] shadow-[0_40px_80px_-20px_rgba(8,40,34,0.45)] backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#06d6a0]/80" />
          <span className="ml-3 text-[11px] tracking-wide text-white/40">
            studybuddy · organic chemistry
          </span>
        </div>

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-4 md:border-b-0 md:border-r">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7dd3c0]">
              Your library
            </p>
            <ul className="space-y-2.5">
              {[
                { title: "Lecture 04 — Alkenes", meta: "Ready · 12 pages", active: true },
                { title: "Lab notes — Week 3", meta: "Ready · 6 pages", active: false },
                { title: "Past paper 2024", meta: "Processing…", active: false },
              ].map((doc) => (
                <li
                  key={doc.title}
                  className={`rounded-xl px-3 py-2.5 ${
                    doc.active
                      ? "bg-[#14b8a6]/20 ring-1 ring-[#2dd4bf]/40"
                      : "bg-white/[0.04]"
                  }`}
                >
                  <p className="text-[13px] font-medium text-white/90">{doc.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/45">{doc.meta}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7dd3c0]">
              AI tutor
            </p>
            <div className="flex flex-1 flex-col gap-3">
              <div className="max-w-[92%] self-end rounded-2xl rounded-br-md bg-[#14b8a6] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#042f2a]">
                Explain Markovnikov’s rule using my lecture notes.
              </div>
              <div className="max-w-[95%] rounded-2xl rounded-bl-md bg-white/[0.07] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/85">
                From <span className="text-[#5eead4]">Lecture 04, p. 7</span>: in
                electrophilic addition to unsymmetrical alkenes, the electrophile
                bonds to the carbon with more hydrogens…
              </div>
              <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-[12px] text-white/35">
                Ask anything about this document…
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
