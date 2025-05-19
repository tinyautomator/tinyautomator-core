import "./App.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Settings as GearIcon } from "lucide-react";
import { SignInButton } from "@clerk/react-router";
import { cn } from "@/lib/utils";

export interface Block {
  heading: string
  blurb: string
}

const defaultBlocks: Block[] = [
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
    blurb: "No tutorials needed. Just snap together triggers and actions to create working automations in minutes.",
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
]

interface TinyAutomatorProps {
  blocks?: Block[]
  buttonText?: string
  subtitle?: string
  accentColor?: string
}

export default function App({
  blocks = defaultBlocks,
  buttonText = "Get Started",
  subtitle = "Automate your workflow with ease.",
  accentColor = "#00ffaa",
}: TinyAutomatorProps) {
  const firstGearRef = useRef<SVGSVGElement>(null)
  const secondGearRef = useRef<SVGSVGElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const gearClass = "inline-block w-12 h-12 md:w-16 md:h-16"
  const gearStyle = { color: "#fb923c" }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const firstGearAnimation = gsap.to(firstGearRef.current, {
      rotation: 360,
      duration: 8,
      ease: "none",
      repeat: -1,
      transformOrigin: "center center",
    })

    const secondGearAnimation = gsap.to(secondGearRef.current, {
      rotation: -360,
      duration: 10,
      ease: "none",
      repeat: -1,
      transformOrigin: "center center",
    })

    const buttonAnimation = gsap.to(buttonRef.current, {
      scale: 1.05,
      boxShadow: `0 0 20px ${accentColor}99`,
      duration: 1.5,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    })

    sectionRefs.current.forEach((section, index) => {
      if (!section) return

      const isEven = index % 2 === 1 
      const xOffset = isEven ? 100 : -100

      gsap.fromTo(
        section,
        {
          x: xOffset,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => {
      firstGearAnimation.kill()
      secondGearAnimation.kill()
      buttonAnimation.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [accentColor])

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white mr-37 text-left">
          <span
            className="inline-block origin-center"
            style={{
              color: "#7c3aed", 
              transform: "scale(0.4) rotate(-70deg) translateX(5vw) translateY(13vw)",
            }}
          >
            Tiny
          </span>
          Aut
          <span className="inline-block relative">
            <GearIcon
              ref={firstGearRef}
              className={gearClass}
              style={gearStyle}
            />
          </span>
          mat
          <span className="inline-block relative">
            <GearIcon
              ref={secondGearRef}
              className={gearClass}
              style={gearStyle}
            />
          </span>
          r
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-2xl text-gray-400">{subtitle}</p>
        <SignInButton mode="modal">
        <Button
          ref={buttonRef}
          className="px-8 py-6 text-lg transition-all duration-300 bg-white text-black"
        >
          {buttonText}
        </Button>
        </SignInButton>
      </section>

      <div className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        {blocks.map((block, index) => (
          <div
            key={index}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            className={cn(
              "mb-32 flex flex-col items-center gap-8 md:gap-16",
              index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            )}
          >
            <div className="w-full md:w-1/2">
              <div className="aspect-square max-w-md mx-auto flex items-center justify-center bg-gray-900 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-center w-full h-full text-6xl font-bold text-gray-700">
                  {index + 1}
                </div>
              </div>
            </div>
            <div className={cn(
              "w-full md:w-1/2",
              index % 2 === 1 ? "text-right" : "text-left"
              )}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{block.heading}</h2>
              <p className="text-lg text-gray-400">{block.blurb}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}