import {
  AirlinerArt,
  CarArt,
  CoachArt,
  GopuramArt,
  PalmArt,
  TrainArt,
} from "@/components/art/TravelArt";

/**
 * Art-directed hero scenes (one per slide), used until licensed destination
 * photography is supplied for the slot. Anchored right so the editorial
 * text column on the left stays readable; purely decorative.
 */
export type HeroSceneName = "flights" | "railRoad" | "rail" | "road" | "darshanam";

function Sky({ id, glow }: { id: string; glow: { x: string; y: string } }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--scene-sky-0)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--scene-sky-1)" }} />
          <stop offset="1" style={{ stopColor: "var(--scene-sky-2)" }} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx={glow.x} cy={glow.y} r="55%">
          <stop
            offset="0"
            style={{ stopColor: "var(--scene-glow)" }}
            stopOpacity="0.38"
          />
          <stop offset="1" style={{ stopColor: "var(--scene-glow)" }} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id}-sky)`} />
      <rect width="1600" height="900" fill={`url(#${id}-glow)`} />
    </>
  );
}

function Clouds({ id, y, opacity = 0.5 }: { id: string; y: number; opacity?: number }) {
  return (
    <g
      filter={`url(#${id}-soft)`}
      style={{ fill: "var(--scene-cloud)" }}
      opacity={opacity}
    >
      <ellipse cx="900" cy={y} rx="420" ry="46" />
      <ellipse cx="1350" cy={y + 30} rx="360" ry="40" />
      <ellipse
        cx="1100"
        cy={y + 70}
        rx="520"
        ry="34"
        style={{ fill: "var(--scene-cloud-deep)" }}
      />
    </g>
  );
}

function Hills({ y, fill, d }: { y: number; fill: string; d: string }) {
  return <path d={`M0 ${y} ${d} L1600 900 L0 900 Z`} style={{ fill }} />;
}

export function HeroScene({
  name,
  instance = "hero",
}: {
  name: HeroSceneName;
  /** Unique per placement so SVG gradient ids never collide on a page. */
  instance?: string;
}) {
  const id = `${instance}-${name}`;
  const rail = name === "railRoad" || name === "rail";
  const road = name === "railRoad" || name === "road";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMaxYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      {name === "flights" && (
        <>
          <Sky id={id} glow={{ x: "78%", y: "30%" }} />
          <Clouds id={id} y={640} opacity={0.55} />
          <path
            d="M600 760 Q 1050 420 1580 170"
            fill="none"
            style={{ stroke: "var(--scene-lane)" }}
            strokeOpacity="0.4"
            strokeWidth="1.4"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
          <g transform="rotate(-9 1140 160)">
            <AirlinerArt id={`${id}-plane`} x="780" y="40" width="760" height="238" />
          </g>
          <Clouds id={id} y={820} opacity={0.75} />
        </>
      )}

      {(rail || road) && (
        <>
          <Sky id={id} glow={{ x: "70%", y: "62%" }} />
          <Hills
            y={560}
            fill="var(--scene-hill-far)"
            d="C 300 520 520 470 780 500 C 1020 528 1240 450 1600 480"
          />
          <Hills
            y={620}
            fill="var(--scene-hill-near)"
            d="C 360 600 700 560 1000 590 C 1250 612 1420 580 1600 590"
          />
          {rail && (
            <>
              {/* embankment and track */}
              <rect
                x="560"
                y="640"
                width="1040"
                height="14"
                style={{ fill: "var(--scene-embankment)" }}
              />
              <rect
                x="560"
                y="636"
                width="1040"
                height="3"
                style={{ fill: "var(--scene-rail)" }}
              />
              <g transform="translate(560 0)">
                <TrainArt id={`${id}-train`} x="0" y="482" width="1100" height="156" />
              </g>
            </>
          )}
          {/* highway */}
          <rect
            x="0"
            y="742"
            width="1600"
            height="158"
            style={{ fill: "var(--scene-ground)" }}
          />
          <rect
            x="0"
            y="740"
            width="1600"
            height="2"
            style={{ fill: "var(--scene-edge)" }}
            opacity="0.6"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={620 + i * 90}
              y="812"
              width="46"
              height="3"
              style={{ fill: "var(--scene-lane)" }}
              opacity="0.4"
            />
          ))}
          {road && (
            <>
              <CoachArt id={`${id}-bus`} x="820" y="650" width="380" height="132" />
              <CarArt id={`${id}-car`} x="1260" y="726" width="250" height="90" />
            </>
          )}
          <PalmArt x="1480" y="430" width="120" height="230" />
        </>
      )}

      {name === "darshanam" && (
        <>
          <Sky id={id} glow={{ x: "74%", y: "58%" }} />
          <Hills
            y={700}
            fill="var(--scene-hill-near)"
            d="C 400 680 800 640 1100 660 C 1300 672 1460 650 1600 655"
          />
          <GopuramArt id={`${id}-gopuram`} x="980" y="180" width="440" height="572" />
          <PalmArt x="840" y="520" width="130" height="250" />
          <PalmArt x="1430" y="500" width="140" height="270" />
          <rect
            x="0"
            y="748"
            width="1600"
            height="152"
            style={{ fill: "var(--scene-ground)" }}
          />
          <rect
            x="0"
            y="746"
            width="1600"
            height="2"
            style={{ fill: "var(--scene-edge)" }}
            opacity="0.5"
          />
        </>
      )}
    </svg>
  );
}
