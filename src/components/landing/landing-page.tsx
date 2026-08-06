"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, BookOpen, MessageSquareText, Upload } from "lucide-react";
import { routes } from "@/config/routes";
import { ProductVisual } from "./product-visual";
import { cn } from "@/lib/utils/cn";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-landing-display",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-landing-sans",
});

const steps = [
  {
    icon: Upload,
    title: "Upload your materials",
    body: "Drop lecture PDFs, notes, or past papers. StudyBuddy ingests them into a searchable knowledge base.",
  },
  {
    icon: MessageSquareText,
    title: "Ask your AI tutor",
    body: "Chat grounded in your documents — answers cite the pages you actually studied from.",
  },
  {
    icon: BookOpen,
    title: "Practice to mastery",
    body: "Generate chapter notes and quizzes from the same materials, then track what sticks.",
  },
];

const testimonials = [
  {
    name: "Amara",
    place: "University of Lagos",
    quote:
      "I stopped rereading the same slides. The tutor pulls the exact paragraph I need, and the quizzes catch what I skimmed past.",
  },
  {
    name: "Noah",
    place: "Manchester",
    quote:
      "Upload night → quiz morning. It’s the first study tool that feels built around how I actually revise.",
  },
  {
    name: "Priya",
    place: "Toronto",
    quote:
      "Having chat and practice in one place cut my prep time in half for midterms.",
  },
];

const faqs = [
  {
    q: "How does StudyBuddy work?",
    a: "Upload your course materials, wait for ingest to finish, then chat with an AI tutor grounded in those documents. Generate study cards and quizzes when you’re ready to practice.",
  },
  {
    q: "What can I upload?",
    a: "Lecture PDFs and study documents. Once processing completes, they’re available for tutor chat and study-card generation.",
  },
  {
    q: "Is it only for STEM?",
    a: "No — any subject with readable materials works. The tutor and quizzes follow whatever you upload.",
  },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div
      className={cn(
        display.variable,
        sans.variable,
        "landing min-h-dvh overflow-x-hidden font-[family-name:var(--font-landing-sans)] text-[#0c2420]",
      )}
    >
      <div className="landing-atmosphere" aria-hidden />

      <header className="relative z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href={routes.home}
            className="font-[family-name:var(--font-landing-display)] text-xl font-bold tracking-tight text-[#0c2420] sm:text-2xl"
          >
            Study<span className="text-[#0f766e]">Buddy</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={routes.login}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#0c2420]/80 transition hover:text-[#0c2420]"
            >
              Log in
            </Link>
            <Link
              href={routes.register}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0c2420] px-4 py-2.5 text-sm font-semibold text-[#f3faf7] transition hover:bg-[#134e4a]"
            >
              Start learning
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero — brand, headline, support, CTAs, dominant visual */}
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-10">
          <div>
            <motion.h1
              className="font-[family-name:var(--font-landing-display)] text-5xl font-bold tracking-tight text-[#0c2420] sm:text-6xl lg:text-7xl lg:leading-[0.95]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Study
              <span className="text-[#0f766e]">Buddy</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg font-[family-name:var(--font-landing-display)] text-2xl font-medium leading-snug tracking-tight text-[#0c2420] sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              Personalise learning and see improvement in weeks.
            </motion.p>

            <motion.p
              className="mt-4 max-w-md text-base leading-relaxed text-[#3d5c56] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16 }}
            >
              Turn your lecture notes into an AI tutor, chapter summaries, and
              quizzes — grounded in materials you already have.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.24 }}
            >
              <Link
                href={routes.register}
                className="inline-flex items-center gap-2 rounded-full bg-[#f0c419] px-6 py-3.5 text-sm font-bold text-[#0c2420] shadow-[0_12px_30px_-10px_rgba(240,196,25,0.7)] transition hover:bg-[#f5d24a] hover:shadow-[0_16px_36px_-10px_rgba(240,196,25,0.85)]"
              >
                Start learning free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={routes.login}
                className="inline-flex items-center gap-2 rounded-full border border-[#0c2420]/15 bg-white/50 px-6 py-3.5 text-sm font-semibold text-[#0c2420] backdrop-blur-sm transition hover:border-[#0c2420]/30 hover:bg-white/80"
              >
                Log in
              </Link>
            </motion.div>
          </div>

          <ProductVisual />
        </section>

        {/* How it works */}
        <section className="relative border-t border-[#0c2420]/08 bg-[#0c2420] text-[#e8f5f1]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <motion.div
              className="max-w-2xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5eead4]">
                How it works
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
                Mastery learning, powered by your own notes
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#9eb8b1] sm:text-lg">
                StudyBuddy builds a unique path from what you upload — assess
                gaps through chat, reinforce with quizzes, and move on when
                you’ve got it.
              </p>
            </motion.div>

            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((step, i) => (
                <motion.li
                  key={step.title}
                  className="relative"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14b8a6]/15 text-[#5eead4]">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5eead4]/70">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-landing-display)] text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#9eb8b1]">
                    {step.body}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Single product story */}
        <section className="relative overflow-hidden bg-[#e8f3ef]">
          <div className="landing-mesh" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Grounded answers
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#0c2420] sm:text-4xl">
                A tutor that studied your syllabus — not the whole internet
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#3d5c56] sm:text-lg">
                Every reply is anchored in your uploaded materials, so
                explanations match how your lecturer taught it — page references
                included.
              </p>
              <Link
                href={routes.register}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0f766e] transition hover:text-[#134e4a]"
              >
                Try the tutor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65 }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f766e] via-[#115e59] to-[#0c2420] p-8 shadow-[0_30px_60px_-25px_rgba(12,36,32,0.45)]">
                <div className="flex h-full flex-col justify-between text-[#e8f5f1]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5eead4]/80">
                      Citation
                    </p>
                    <p className="mt-4 font-[family-name:var(--font-landing-display)] text-2xl font-semibold leading-snug sm:text-3xl">
                      “The electrophile adds to the less substituted carbon…”
                    </p>
                  </div>
                  <p className="text-sm text-[#9eb8b1]">
                    Source · Lecture 04 — Alkenes · page 7
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[#f7fbf9]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <motion.div
              className="max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                What students say
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#0c2420] sm:text-4xl">
                Built for how real people revise
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.blockquote
                  key={t.name}
                  className="border-t-2 border-[#0f766e]/30 pt-6"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <p className="text-[15px] leading-relaxed text-[#3d5c56]">
                    “{t.quote}”
                  </p>
                  <footer className="mt-5">
                    <cite className="not-italic font-semibold text-[#0c2420]">
                      {t.name}
                    </cite>
                    <p className="text-sm text-[#5a7a73]">{t.place}</p>
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-[#0c2420]/08 bg-white">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-24">
            <h2 className="text-center font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#0c2420] sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-center text-[#5a7a73]">
              Everything you need to know about StudyBuddy.
            </p>

            <div className="mt-12 divide-y divide-[#0c2420]/10">
              {faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div key={faq.q} className="py-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                    >
                      <span className="font-semibold text-[#0c2420]">{faq.q}</span>
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f3ef] text-lg text-[#0f766e] transition",
                          open && "rotate-45 bg-[#0c2420] text-[#e8f5f1]",
                        )}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 pr-12 text-sm leading-relaxed text-[#3d5c56]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden bg-[#0c2420]">
          <div className="landing-cta-glow" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-28">
            <motion.h2
              className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-[#e8f5f1] sm:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              Join students using StudyBuddy to excel
            </motion.h2>
            <motion.p
              className="mx-auto mt-5 max-w-lg text-base text-[#9eb8b1] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              Upload tonight. Chat and quiz tomorrow. Make every study session
              count.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.16 }}
            >
              <Link
                href={routes.register}
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#f0c419] px-8 py-4 text-sm font-bold text-[#0c2420] shadow-[0_16px_40px_-12px_rgba(240,196,25,0.55)] transition hover:bg-[#f5d24a]"
              >
                Start learning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-[#081614] px-5 py-10 text-[#7a9a92] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="font-[family-name:var(--font-landing-display)] text-lg font-bold text-[#e8f5f1]">
            Study<span className="text-[#5eead4]">Buddy</span>
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href={routes.login} className="transition hover:text-[#e8f5f1]">
              Log in
            </Link>
            <Link href={routes.register} className="transition hover:text-[#e8f5f1]">
              Register
            </Link>
          </div>
          <p className="text-xs text-[#5a7a73]">
            © {new Date().getFullYear()} StudyBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
