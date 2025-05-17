"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/react-router";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

function Section({ heading, blurb }: Block) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  return (
    <section
      ref={ref}
      className="mx-auto max-w-3xl px-6 py-28 text-center text-white"
    >
      <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
      <p className="text-lg opacity-80">{blurb}</p>
    </section>
  );
}

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
        <main className="min-h-screen bg-neutral-950">
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

            {blocks.map((b) => (
                <Section key={b.heading} {...b} />
            ))}
        </main>
    );
} 