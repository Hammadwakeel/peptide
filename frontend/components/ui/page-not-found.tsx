"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND_COLORS } from "@/lib/brand/colors";

const STICK_ASSETS = {
  stick0: "/assets/404/sticks/stick0.svg",
  stick1: "/assets/404/sticks/stick1.svg",
  stick2: "/assets/404/sticks/stick2.svg",
  stick3: "/assets/404/sticks/stick3.svg",
} as const;

type StickFigure = {
  top?: string;
  bottom?: string;
  src: string;
  transform?: string;
  speedX: number;
  speedRotation?: number;
  animate?: boolean;
};

const STICK_FIGURES: StickFigure[] = [
  {
    top: "0%",
    src: STICK_ASSETS.stick0,
    transform: "rotateZ(-90deg)",
    speedX: 1500,
    animate: true,
  },
  {
    top: "10%",
    src: STICK_ASSETS.stick1,
    speedX: 3000,
    speedRotation: 2000,
    animate: true,
  },
  {
    top: "20%",
    src: STICK_ASSETS.stick2,
    speedX: 5000,
    speedRotation: 1000,
    animate: true,
  },
  {
    top: "25%",
    src: STICK_ASSETS.stick0,
    speedX: 2500,
    speedRotation: 1500,
    animate: true,
  },
  {
    top: "35%",
    src: STICK_ASSETS.stick0,
    speedX: 2000,
    speedRotation: 300,
    animate: true,
  },
  {
    bottom: "5%",
    src: STICK_ASSETS.stick3,
    speedX: 0,
    animate: false,
  },
];

export default function NotFoundPage() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-x-hidden bg-deep-teal">
      <CircleAnimation />
      <CharactersAnimation />
      <MessageDisplay />
    </div>
  );
}

function MessageDisplay() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="absolute z-[100] flex h-[90%] w-[90%] flex-col items-center justify-center">
      <div
        className={`flex flex-col items-center transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="m-[1%] text-[35px] font-light text-pure-white">Page Not Found</div>
        <div className="m-[1%] text-[80px] font-light text-pure-white">404</div>
        <div className="m-[1%] w-1/2 min-w-[40%] text-center text-[15px] text-pure-white/80">
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </div>
        <div className="mt-8 flex gap-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex h-auto items-center gap-2 border-2 border-pure-white px-6 py-2 text-base font-light text-pure-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-pure-white hover:text-deep-teal"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex h-auto items-center gap-2 bg-pacific-teal px-6 py-2 text-base font-light text-pure-white transition-all duration-300 ease-in-out hover:scale-105 hover:bg-coral-blush hover:text-deep-teal"
          >
            <Home className="size-5 transition-transform group-hover:translate-x-0.5" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

function CharactersAnimation() {
  const charactersRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);

  const mountCharacters = useCallback(() => {
    const container = charactersRef.current;
    if (!container) return;

    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
    container.replaceChildren();

    STICK_FIGURES.forEach((figure, index) => {
      const stick = document.createElement("img");
      stick.className = "characters";
      stick.style.position = "absolute";
      stick.style.width = "18%";
      stick.style.height = "18%";
      stick.style.left = "100%";
      stick.alt = "";

      if (figure.top) stick.style.top = figure.top;
      if (figure.bottom) stick.style.bottom = figure.bottom;
      stick.src = figure.src;
      if (figure.transform) stick.style.transform = figure.transform;

      container.appendChild(stick);

      if (!figure.animate) return;

      const moveAnimation = stick.animate(
        [{ left: "100%" }, { left: "-20%" }],
        { duration: figure.speedX, easing: "linear", fill: "forwards" },
      );
      animationsRef.current.push(moveAnimation);

      if (index === 0 || !figure.speedRotation) return;

      const rotateAnimation = stick.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }],
        { duration: figure.speedRotation, iterations: Infinity, easing: "linear" },
      );
      animationsRef.current.push(rotateAnimation);
    });
  }, []);

  useEffect(() => {
    mountCharacters();

    function handleResize() {
      mountCharacters();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      animationsRef.current.forEach((animation) => animation.cancel());
      animationsRef.current = [];
    };
  }, [mountCharacters]);

  return <div ref={charactersRef} className="absolute h-[95%] w-[99%]" aria-hidden="true" />;
}

type Circulo = {
  x: number;
  y: number;
  size: number;
};

function CircleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | undefined>(undefined);
  const timerRef = useRef(0);
  const circlesRef = useRef<Circulo[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;

    function initArr() {
      circlesRef.current = [];
      for (let index = 0; index < 300; index += 1) {
        const randomX =
          Math.floor(Math.random() * (canvas.width * 3 - canvas.width * 1.2 + 1)) +
          canvas.width * 1.2;
        const randomY =
          Math.floor(Math.random() * (canvas.height - canvas.height * -0.2 + 1)) +
          canvas.height * -0.2;
        const size = canvas.width / 1000;
        circlesRef.current.push({ x: randomX, y: randomY, size });
      }
    }

    function draw() {
      const context = canvas.getContext("2d");
      if (!context) return;

      timerRef.current += 1;
      context.setTransform(1, 0, 0, 1, 0, 0);

      const distanceX = canvas.width / 80;
      const growthRate = canvas.width / 1000;

      context.fillStyle = BRAND_COLORS.pureWhite;
      context.clearRect(0, 0, canvas.width, canvas.height);

      circlesRef.current.forEach((circle) => {
        context.beginPath();

        if (timerRef.current < 65) {
          circle.x -= distanceX;
          circle.size += growthRate;
        } else if (timerRef.current < 500) {
          circle.x -= distanceX * 0.02;
          circle.size += growthRate * 0.2;
        }

        context.arc(circle.x, circle.y, circle.size, 0, 360);
        context.fill();
      });

      if (timerRef.current > 500) {
        if (requestIdRef.current !== undefined) {
          cancelAnimationFrame(requestIdRef.current);
        }
        return;
      }

      requestIdRef.current = requestAnimationFrame(draw);
    }

    function start() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      timerRef.current = 0;
      initArr();
      if (requestIdRef.current !== undefined) {
        cancelAnimationFrame(requestIdRef.current);
      }
      draw();
    }

    start();

    function handleResize() {
      const context = canvas.getContext("2d");
      context?.reset();
      start();
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestIdRef.current !== undefined) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
