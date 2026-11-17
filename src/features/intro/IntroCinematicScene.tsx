import {
  AirlinerArt,
  CarArt,
  CoachArt,
  GlobeArt,
  PalmArt,
  TrainArt,
} from "@/components/art/TravelArt";
import { Logo } from "@/components/brand/Logo";

/**
 * The five-second intro scene: globe → airplane → train → coach & car →
 * official logo. Every animated element carries data-intro-part (the
 * contract with timeline.ts). The stage is one 1600×900 SVG sized so that
 * on portrait phones roughly half its width stays visible.
 *
 * Asset-independent vector artwork; see docs/ASSETS.md for the licensed
 * footage / 3D renders a production cut would use instead.
 */
export function IntroCinematicScene({ logoAlt }: { logoAlt: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        data-intro-part="light"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgb(30 41 59 / 0.95), transparent 70%), radial-gradient(70% 45% at 50% 110%, rgb(139 107 70 / 0.35), transparent 70%)",
        }}
      />

      <svg
        viewBox="0 0 1600 900"
        className="absolute top-1/2 left-1/2 aspect-[16/9] w-[max(100vw,min(160vh,230vw))] -translate-x-1/2 -translate-y-1/2"
      >
        <defs>
          <linearGradient id="intro-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D4A762" stopOpacity="0" />
            <stop offset="1" stopColor="#D4A762" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="intro-horizon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D4A762" stopOpacity="0.28" />
            <stop offset="1" stopColor="#D4A762" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 0–1 s: globe */}
        <g data-intro-part="globe">
          <GlobeArt id="intro-globe" x="500" y="150" width="600" height="600" />
        </g>

        {/* 1–2 s: airliner with a soft light trail */}
        <g data-intro-part="plane">
          <rect
            data-intro-part="trail"
            x="-260"
            y="402"
            width="760"
            height="6"
            rx="3"
            fill="url(#intro-trail)"
          />
          <AirlinerArt id="intro-plane" x="420" y="300" width="760" height="238" />
        </g>

        {/* 2–3 s: train on its track */}
        <g data-intro-part="track">
          <rect x="0" y="600" width="1600" height="60" fill="url(#intro-horizon)" />
          <rect x="0" y="606" width="1600" height="3" fill="#5B6472" />
          <rect x="0" y="616" width="1600" height="2" fill="#374151" />
          {Array.from({ length: 54 }, (_, i) => (
            <rect key={i} x={i * 30} y="610" width="14" height="5" fill="#2A3240" />
          ))}
        </g>
        <g data-intro-part="train">
          <TrainArt id="intro-train" x="300" y="440" width="1500" height="212" />
        </g>

        {/* 3–4 s: coach and car on the highway */}
        <g data-intro-part="road">
          <rect x="0" y="560" width="1600" height="70" fill="url(#intro-horizon)" />
          <rect x="0" y="690" width="1600" height="90" fill="#111827" />
          <rect x="0" y="688" width="1600" height="2" fill="#8B6B46" opacity="0.6" />
          {Array.from({ length: 20 }, (_, i) => (
            <rect
              key={i}
              x={i * 84}
              y="734"
              width="44"
              height="3"
              fill="#D4A762"
              opacity="0.45"
            />
          ))}
          <PalmArt x="120" y="470" width="110" height="220" />
          <PalmArt x="1380" y="480" width="100" height="210" />
        </g>
        <g data-intro-part="bus">
          <CoachArt id="intro-bus" x="380" y="540" width="520" height="180" />
        </g>
        <g data-intro-part="car">
          <CarArt id="intro-car" x="420" y="660" width="340" height="123" />
        </g>
      </svg>

      {/* 4–5 s: the official logo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* The intro is always dark, so this shows the black-background logo. */}
        <div data-intro-part="logo" className="w-[min(88vw,36rem)]">
          <Logo alt={logoAlt} sizes="(min-width: 640px) 36rem, 88vw" />
        </div>
        <div
          data-intro-part="rule"
          className="rule-bronze mt-6 w-[min(60vw,20rem)] origin-center"
        />
      </div>
    </div>
  );
}
