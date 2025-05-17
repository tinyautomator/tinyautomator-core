"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------------- */
/*  content                                                                   */
/* ------------------------------------------------------------------------- */

type Block = { heading: string; blurb: string };

const blocks: Block[] = [
  {
    heading: "Automate Without Limits",
    blurb:
      "Designed for non-coders and coders alike, TinyAutomator makes it easy to automate repetitive tasks through a simple visual builder or powerful custom code blocks.",
  },
  {
    heading: "Reclaim Your Time",
    blurb:
      "From daily digests to lead capture, streamline your workflow and free up hours in your day. Focus on what matters, let automation handle the rest.",
  },
  {
    heading: "Built for Teams, Loved by Individuals",
    blurb:
      "Whether you're flying solo or part of a small team, TinyAutomator delivers productivity without the overhead of bloated enterprise tools.",
  },
  {
    heading: "Drag. Drop. Done.",
    blurb:
      "No tutorials needed. Just snap together triggers and actions to create working automations in minutes.",
  },
  {
    heading: "Extend It. Share It. Remix It.",
    blurb:
      "Build once, reuse forever. Share your workflows or customize templates from the community to meet your exact needs.",
  },
  {
    heading: "Your Digital Assistant That Never Sleeps",
    blurb:
      "Schedule, trigger, and run tasks in the background—day or night. TinyAutomator works around the clock so you don't have to.",
  },
];

/* ------------------------------------------------------------------------- */
/*  Section                                                                  */
/* ------------------------------------------------------------------------- */

function Section({ heading, blurb, index }: Block & { index: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const blurbRef   = useRef<HTMLParagraphElement>(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    if (!wrapRef.current || !headingRef.current || !blurbRef.current) return;

    const ctx = gsap.context(() => {
      // master timeline that handles pinning + exit
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onEnter: () => sectionReveal(index, headingRef.current!, blurbRef.current!)
        }
      });

      // exit fade
      tl.to(wrapRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: "power2.in"
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [index]);

  return (
    <section
      ref={wrapRef}
      className={`w-full h-screen flex items-center px-6 text-${
        isEven ? "left" : "right"
      } text-white`}
    >
      <div
        className={`max-w-2xl ${
          isEven ? "ml-8 md:ml-16 lg:ml-24" : "mr-8 md:mr-16 lg:mr-24 ml-auto"
        }`}
      >
        <h2 ref={headingRef} className="mb-4 text-3xl font-bold sm:text-4xl">
          {index === 4
            ? heading.split(" ").map((w, i) => (
                <span key={i} className="inline-block mr-2">
                  {w}
                </span>
              ))
            : heading.split("").map((l, i) => (
                <span key={i} className="inline-block">
                  {l}
                </span>
              ))}
        </h2>
        <p ref={blurbRef} className="text-lg opacity-80">
          {blurb}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/*  per-section reveal logic (unchanged styling, fixed execution)            */
/* ------------------------------------------------------------------------- */

function sectionReveal(idx: number, h: HTMLElement, p: HTMLElement) {
  switch (idx) {
    case 0: { // Automate Without Limits
      gsap.fromTo(
        h.querySelectorAll("span"),
        { y: 100, opacity: 0, rotationX: 90, transformOrigin: "50% 50% -50" },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          stagger: 0.03,
          duration: 0.8,
          ease: "back.out(1.7)"
        }
      );
      gsap.fromTo(
        p,
        { opacity: 0, y: 30, skewY: 5 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power2.out", delay: 0.4 }
      );
      break;
    }
    case 1: { // Reclaim Your Time
      gsap.fromTo(
        h,
        { opacity: 0, scale: 0.5, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: "elastic.out(1,0.5)" }
      );
      gsap.fromTo(
        p,
        { opacity: 0, y: 30, skewY: 5 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power2.out", delay: 0.3 }
      );
      break;
    }
    case 2: { // Built for Teams
      gsap.fromTo(
        h,
        { opacity: 0, x: -100 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        p,
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
      );
      break;
    }
    case 3: { // Drag. Drop. Done.
      gsap.fromTo(
        h,
        { scale: 0.5, opacity: 0, rotation: 45 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1,0.3)" }
      );
      gsap.fromTo(
        p,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.3 }
      );
      break;
    }
    case 4: { // Extend It. Share It. Remix It.
      gsap.fromTo(
        h.querySelectorAll("span"),
        { scale: 0.7, opacity: 0, rotation: 180 },
        { scale: 1, opacity: 1, rotation: 0, stagger: 0.1, duration: 0.5, ease: "back.out(1.4)" }
      );
      gsap.fromTo(
        p,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.4 }
      );
      break;
    }
    case 5: { // Your Digital Assistant
      gsap.fromTo(
        h.parentElement, // whole card
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: "power1.inOut" }
      );
      gsap.to(h.parentElement, {
        backgroundColor: "oklch(0.14 0.04 265)",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      break;
    }
  }
}

/* ------------------------------------------------------------------------- */
/*  LandingPage (hero unchanged)                                             */
/* ------------------------------------------------------------------------- */

export function LandingPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const title = "TinyAutomator";

  useEffect(() => {
    if (!titleRef.current) return;

    // Create a timeline for the main container fade in
    const tl = gsap.timeline();
    
    // Fade in the container
    tl.to(titleRef.current, {
      opacity: 1,
      duration: 2,
      ease: "power2.out"
    });

    // Animate each letter
    const letters = titleRef.current.querySelectorAll('span');
    letters.forEach((letter, index) => {
      gsap.fromTo(letter,
        {
          y: 100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.03,
          ease: "back.out(1.7)"
        }
      );
    });
  }, []);

  return (
    <main className="min-h-screen bg-[oklch(0.129 0.042 264.695)]">
      {/* hero */}
      <div className="relative w-full flex items-center justify-center min-h-screen">
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <div
            ref={titleRef}
            className="max-w-4xl mx-auto opacity-0"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter text-white">
              {title.split("").map((letter, index) => (
                <span
                  key={index}
                  className="inline-block"
                >
                  {letter}
                </span>
              ))}
            </h1>

            <div
              className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
              dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
              overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <Button
                variant="ghost"
                className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                text-black dark:text-white transition-all duration-300 
                group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                hover:shadow-md dark:hover:shadow-neutral-800/50"
              >
                <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                  <SignInButton mode="modal">
                    Sign In
                  </SignInButton>
                </span>
                <span
                  className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                  transition-all duration-300"
                >
                  →
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* sections */}
      {blocks.map((b, idx) => (
        <Section key={b.heading} {...b} index={idx} />
      ))}
    </main>
  );
}
