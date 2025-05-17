import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/react-router";
import gsap from "gsap";

export function TitleSection({
    title = "TinyAutomator",
}: {
    title?: string;
}) {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const words = title.split(" ");

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
        <div className="relative w-full flex items-center justify-center">
            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <div
                    ref={titleRef}
                    className="max-w-4xl mx-auto opacity-0"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter text-white">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <span
                                        key={`${wordIndex}-${letterIndex}`}
                                        className="inline-block"
                                    >
                                        {letter}
                                    </span>
                                ))}
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
    );
} 