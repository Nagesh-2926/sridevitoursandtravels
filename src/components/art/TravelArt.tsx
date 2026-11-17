import type { SVGProps } from "react";

/**
 * Asset-independent travel artwork (Phase 03). Side-profile vehicles and
 * landmarks drawn as nested <svg> elements so scenes can place them with
 * x/y/width/height and animate a wrapping <g>. Each piece takes an `id`
 * prefix so gradients never collide when the hero and intro share a page.
 *
 * These are art-directed vector stand-ins, not licensed photography or 3D
 * renders — see docs/ASSETS.md for the production assets still required.
 */
type ArtProps = {
  id: string;
  /** Optional crisp body outline (used on light backgrounds for contrast). */
  outline?: string;
} & Omit<SVGProps<SVGSVGElement>, "id">;

const stroke = (outline?: string) =>
  outline ? { stroke: outline, strokeWidth: 2.2, strokeLinejoin: "round" as const } : {};

const METAL = ["#F7F8FA", "#D9DEE5", "#9AA3B0", "#5B6472"];
const GLASS = "#0E1622";
const GOLD = "#D4A762";
const BRONZE = "#8B6B46";

function Metal({ id, dir = "v" }: { id: string; dir?: "v" | "h" }) {
  return (
    <linearGradient
      id={id}
      x1="0"
      y1="0"
      x2={dir === "h" ? "1" : "0"}
      y2={dir === "v" ? "1" : "0"}
    >
      <stop offset="0" stopColor={METAL[0]} />
      <stop offset="0.45" stopColor={METAL[1]} />
      <stop offset="0.8" stopColor={METAL[2]} />
      <stop offset="1" stopColor={METAL[3]} />
    </linearGradient>
  );
}

/** Wide-body airliner, facing right. viewBox 640×200. */
export function AirlinerArt({ id, outline, ...props }: ArtProps) {
  const windows = Array.from({ length: 30 }, (_, i) => 150 + i * 12.5);
  return (
    <svg viewBox="0 0 640 200" {...props}>
      <defs>
        <Metal id={`${id}-body`} />
        <linearGradient id={`${id}-engine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9EDF2" />
          <stop offset="1" stopColor="#6B7482" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E293B" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
      </defs>
      {/* far wing (in shadow) */}
      <path d="M300 96 L250 58 L282 56 L380 94 Z" fill="#7D8693" />
      {/* tail fin with bronze livery */}
      <path d="M58 94 L36 18 L78 18 L150 92 Z" fill={`url(#${id}-tail)`} />
      <path d="M44 38 L66 38 L104 78 L92 78 Z" fill={GOLD} opacity="0.85" />
      {/* fuselage */}
      <path
        d="M36 108 C36 94 58 86 92 86 L548 86 C586 86 616 96 630 108 C616 122 586 130 548 130 L92 130 C58 130 36 122 36 108 Z"
        fill={`url(#${id}-body)`}
        {...stroke(outline)}
      />
      {/* belly shadow and cheat line */}
      <path
        d="M92 122 L548 122 C580 122 606 118 622 112 C606 124 580 130 548 130 L92 130 C64 130 44 126 38 116 C52 121 70 122 92 122 Z"
        fill="#000"
        opacity="0.18"
      />
      <rect x="100" y="111" width="480" height="2.2" rx="1" fill={BRONZE} />
      {/* windows */}
      {windows.map((x) => (
        <rect
          key={x}
          x={x}
          y="97"
          width="6"
          height="8"
          rx="3"
          fill={GLASS}
          opacity="0.85"
        />
      ))}
      <path d="M592 96 C604 97 614 101 620 106 L598 106 Z" fill={GLASS} />
      {/* horizontal stabiliser */}
      <path d="M60 110 L18 132 L44 134 L118 114 Z" fill="#AEB6C1" />
      {/* near wing */}
      <path
        d="M270 116 L196 178 L236 180 L372 118 Z"
        fill={`url(#${id}-body)`}
        {...stroke(outline)}
      />
      <path d="M270 116 L372 118 L360 122 L278 121 Z" fill="#000" opacity="0.2" />
      {/* engine */}
      <rect x="250" y="132" width="78" height="26" rx="13" fill={`url(#${id}-engine)`} />
      <ellipse cx="326" cy="145" rx="5" ry="12" fill="#2A3240" />
      <rect x="258" y="132" width="40" height="3" rx="1.5" fill="#fff" opacity="0.6" />
      {/* gold rim light along the top */}
      <path
        d="M92 86 L548 86 C586 86 616 96 630 108"
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />
    </svg>
  );
}

/** Indian-railway-inspired passenger train: power car + two coaches, facing right. viewBox 1200×170. */
export function TrainArt({ id, outline, ...props }: ArtProps) {
  const coach = (x: number, key: string) => (
    <g key={key} transform={`translate(${x} 0)`}>
      <rect
        x="0"
        y="44"
        width="340"
        height="82"
        rx="10"
        fill={`url(#${id}-body)`}
        {...stroke(outline)}
      />
      <rect x="0" y="62" width="340" height="24" fill="#1E293B" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect
          key={i}
          x={14 + i * 29}
          y="66"
          width="20"
          height="16"
          rx="3"
          fill={GLASS}
          stroke="#3B4658"
          strokeWidth="0.8"
        />
      ))}
      <rect x="0" y="94" width="340" height="4" fill={GOLD} opacity="0.9" />
      <rect x="0" y="100" width="340" height="2" fill={BRONZE} />
      {bogie(40, key + "a")}
      {bogie(250, key + "b")}
    </g>
  );
  const bogie = (x: number, key: string) => (
    <g key={key}>
      <rect x={x} y="124" width="56" height="12" rx="3" fill="#1A2029" />
      <circle
        cx={x + 12}
        cy="140"
        r="9"
        fill="#232B36"
        stroke="#59616E"
        strokeWidth="2"
      />
      <circle
        cx={x + 44}
        cy="140"
        r="9"
        fill="#232B36"
        stroke="#59616E"
        strokeWidth="2"
      />
    </g>
  );
  return (
    <svg viewBox="0 0 1200 170" {...props}>
      <defs>
        <Metal id={`${id}-body`} />
      </defs>
      {coach(0, "c1")}
      {coach(352, "c2")}
      {/* power car with aerodynamic nose */}
      <g transform="translate(704 0)">
        <path
          d="M0 44 L300 44 C380 44 450 80 488 126 L0 126 Z"
          fill={`url(#${id}-body)`}
          {...stroke(outline)}
        />
        <path d="M0 62 L330 62 C364 62 398 74 420 86 L0 86 Z" fill="#1E293B" />
        <path
          d="M352 62 C384 64 410 74 428 88 L360 88 Z"
          fill={GLASS}
          stroke={GOLD}
          strokeOpacity="0.5"
        />
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={i}
            x={14 + i * 34}
            y="66"
            width="22"
            height="16"
            rx="3"
            fill={GLASS}
            stroke="#3B4658"
            strokeWidth="0.8"
          />
        ))}
        <path d="M0 94 L452 94 L462 98 L0 98 Z" fill={GOLD} opacity="0.9" />
        <rect x="0" y="100" width="470" height="2" fill={BRONZE} />
        <circle cx="470" cy="112" r="3.5" fill="#FFF4D6" />
        <path
          d="M120 44 L140 22 L190 22 L172 44"
          fill="none"
          stroke="#59616E"
          strokeWidth="2.5"
        />
        {bogie(40, "pa")}
        {bogie(330, "pb")}
      </g>
      <path d="M0 44 L1004 44" stroke={GOLD} strokeOpacity="0.45" strokeWidth="1" />
    </svg>
  );
}

/** Modern travel coach, facing right. viewBox 520×180. */
export function CoachArt({ id, outline, ...props }: ArtProps) {
  return (
    <svg viewBox="0 0 520 180" {...props}>
      <defs>
        <Metal id={`${id}-body`} />
      </defs>
      <path
        d="M10 40 C10 26 20 18 36 18 L462 18 C486 18 500 30 506 56 L512 132 C512 140 506 146 498 146 L20 146 C14 146 10 142 10 136 Z"
        fill={`url(#${id}-body)`}
        {...stroke(outline)}
      />
      {/* window band */}
      <path d="M24 34 L456 34 C474 34 484 42 488 58 L494 92 L24 92 Z" fill={GLASS} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={70 + i * 50} y="34" width="3" height="58" fill="#C9D0DA" />
      ))}
      <path d="M462 34 C478 36 486 44 490 60 L494 92 L470 92 Z" fill="#1E293B" />
      {/* livery */}
      <path d="M10 104 L508 104 L509 112 L10 112 Z" fill={GOLD} opacity="0.9" />
      <path d="M10 114 L509 114 L509 117 L10 117 Z" fill={BRONZE} />
      {/* door */}
      <rect
        x="420"
        y="96"
        width="34"
        height="48"
        rx="3"
        fill="none"
        stroke="#8A94A3"
        strokeWidth="1.2"
      />
      {/* wheels */}
      {[100, 400].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 34} 146 A34 34 0 0 1 ${cx + 34} 146 Z`} fill="#0E1218" />
          <circle
            cx={cx}
            cy="146"
            r="25"
            fill="#1A2029"
            stroke="#606A78"
            strokeWidth="4"
          />
          <circle cx={cx} cy="146" r="9" fill="#9AA3B0" />
        </g>
      ))}
      <circle cx="502" cy="128" r="4" fill="#FFF4D6" />
      <path d="M36 18 L462 18" stroke={GOLD} strokeOpacity="0.5" strokeWidth="1" />
    </svg>
  );
}

/** Passenger sedan, facing right. viewBox 360×130. */
export function CarArt({ id, outline, ...props }: ArtProps) {
  return (
    <svg viewBox="0 0 360 130" {...props}>
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A4556" />
          <stop offset="0.5" stopColor="#1E293B" />
          <stop offset="1" stopColor="#0E141C" />
        </linearGradient>
      </defs>
      <path
        d="M14 82 C14 70 24 64 40 62 L92 56 L132 26 C140 20 150 18 162 18 L232 18 C246 18 258 24 268 34 L296 58 L332 64 C344 66 350 74 350 84 L350 98 C350 104 346 108 340 108 L20 108 C16 108 14 104 14 100 Z"
        fill={`url(#${id}-paint)`}
        {...stroke(outline)}
      />
      <path
        d="M104 58 L140 30 C146 26 152 24 160 24 L192 24 L192 58 Z"
        fill={GLASS}
        stroke="#4A5566"
        strokeWidth="1"
      />
      <path
        d="M200 24 L232 24 C242 24 250 28 258 36 L280 58 L200 58 Z"
        fill={GLASS}
        stroke="#4A5566"
        strokeWidth="1"
      />
      <path
        d="M40 62 L92 56 L132 26 C140 20 150 18 162 18 L232 18 C246 18 258 24 268 34 L296 58 L332 64"
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.7"
        strokeWidth="1.4"
      />
      <path d="M20 80 L346 80" stroke="#5B6472" strokeWidth="1" />
      <rect x="196" y="66" width="18" height="3" rx="1.5" fill="#9AA3B0" />
      <path d="M338 70 L350 74 L350 80 L336 78 Z" fill="#FFF4D6" />
      <path d="M14 74 L22 72 L22 80 L14 82 Z" fill="#B4473A" />
      {[84, 284].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="106" r="22" fill="#0E1218" />
          <circle
            cx={cx}
            cy="106"
            r="16"
            fill="#1A2029"
            stroke="#7A8492"
            strokeWidth="3"
          />
          <circle cx={cx} cy="106" r="5" fill="#B9C1CC" />
        </g>
      ))}
    </svg>
  );
}

/** South Indian temple gopuram silhouette with rim light. viewBox 400×520. */
export function GopuramArt({ id, ...props }: ArtProps) {
  const tiers = [
    { w: 300, h: 70 },
    { w: 262, h: 60 },
    { w: 226, h: 54 },
    { w: 192, h: 48 },
    { w: 160, h: 42 },
    { w: 130, h: 38 },
  ];
  let y = 500;
  return (
    <svg viewBox="0 0 400 520" {...props}>
      <defs>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#151C27" />
          <stop offset="0.55" stopColor="#202A39" />
          <stop offset="1" stopColor="#334055" />
        </linearGradient>
      </defs>
      <rect x="40" y="500" width="320" height="20" fill="#0B0F14" />
      {tiers.map((tier, i) => {
        const top = y - tier.h;
        const next = tiers[i + 1]?.w ?? tier.w - 30;
        const x0 = 200 - tier.w / 2;
        const x1 = 200 - next / 2;
        const d = `M${x0} ${y} L${x1} ${top} L${400 - x1} ${top} L${400 - x0} ${y} Z`;
        const el = (
          <g key={i}>
            <path d={d} fill={`url(#${id}-stone)`} />
            <path
              d={`M${400 - x1} ${top} L${400 - x0} ${y}`}
              stroke={GOLD}
              strokeOpacity="0.55"
              strokeWidth="1.2"
            />
            <path
              d={`M${x1} ${top} L${400 - x1} ${top}`}
              stroke={GOLD}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            {Array.from({ length: Math.floor(tier.w / 34) }, (_, k) => (
              <rect
                key={k}
                x={x0 + 18 + k * 34}
                y={top + tier.h * 0.35}
                width="8"
                height={tier.h * 0.4}
                rx="4"
                fill="#000"
                opacity="0.35"
              />
            ))}
          </g>
        );
        y = top;
        return el;
      })}
      {/* barrel-vault crown and kalasams */}
      <path
        d={`M128 ${y} C128 ${y - 46} 272 ${y - 46} 272 ${y} Z`}
        fill={`url(#${id}-stone)`}
      />
      <path
        d={`M200 ${y - 34} C240 ${y - 34} 268 ${y - 18} 272 ${y}`}
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.6"
        strokeWidth="1.2"
      />
      {[152, 200, 248].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y - 40} rx="7" ry="9" fill={GOLD} />
          <path d={`M${cx} ${y - 49} L${cx} ${y - 62}`} stroke={GOLD} strokeWidth="2" />
        </g>
      ))}
      {/* entrance */}
      <path d="M176 500 L176 452 C176 436 224 436 224 452 L224 500 Z" fill="#05080C" />
      <path
        d="M176 452 C176 436 224 436 224 452"
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.5"
      />
    </svg>
  );
}

/** Coconut palm silhouette. viewBox 120×220. */
export function PalmArt(props: Omit<SVGProps<SVGSVGElement>, "id">) {
  return (
    <svg viewBox="0 0 120 220" {...props}>
      <path
        d="M58 220 C56 170 62 120 70 70"
        fill="none"
        stroke="#0B0F14"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {[
        "M70 70 C40 50 18 58 4 76",
        "M70 70 C46 40 34 22 22 16",
        "M70 70 C78 40 92 24 108 20",
        "M70 70 C96 56 110 62 118 78",
        "M70 70 C60 60 44 84 38 100",
        "M70 70 C86 76 94 92 96 108",
      ].map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="#0B0F14"
          strokeWidth="6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

const GLOBE_LATITUDES = [-0.72, -0.45, -0.16, 0.16, 0.45, 0.72];
const GLOBE_MERIDIANS = [-0.85, -0.55, -0.22, 0.12, 0.45, 0.76];

/**
 * Cinematic globe: lit sphere, atmosphere rim, graticule and golden routes.
 * viewBox 600×600. Inner parts are marked with data-art for animation.
 */
export function GlobeArt({ id, ...props }: ArtProps) {
  const cx = 300;
  const cy = 300;
  const r = 210;
  return (
    <svg viewBox="0 0 600 600" {...props}>
      <defs>
        <radialGradient id={`${id}-sphere`} cx="34%" cy="30%" r="80%">
          <stop offset="0" stopColor="#3B4E6B" />
          <stop offset="0.45" stopColor="#1E293B" />
          <stop offset="0.85" stopColor="#0E1520" />
          <stop offset="1" stopColor="#0B0F14" />
        </radialGradient>
        <radialGradient id={`${id}-atmos`} cx="50%" cy="50%" r="50%">
          <stop offset="0.82" stopColor="#7FA6D9" stopOpacity="0" />
          <stop offset="0.9" stopColor="#7FA6D9" stopOpacity="0.22" />
          <stop offset="1" stopColor="#7FA6D9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-terminator`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.18} fill={`url(#${id}-atmos)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-sphere)`} />
      <g clipPath={`url(#${id}-clip)`} fill="none" stroke="#9FB3CF" strokeWidth="0.8">
        {GLOBE_LATITUDES.map((k) => (
          <ellipse
            key={k}
            cx={cx}
            cy={cy + k * r}
            rx={r * Math.sqrt(1 - k * k)}
            ry={r * 0.16 * Math.sqrt(1 - k * k)}
            opacity="0.22"
          />
        ))}
        <g data-art="graticule" opacity="0.28">
          {GLOBE_MERIDIANS.map((k) => (
            <ellipse key={k} cx={cx} cy={cy} rx={Math.abs(k) * r} ry={r} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-terminator)`} stroke="none" />
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* golden routes; pathLength=1 lets GSAP draw them with dashoffset */}
      <g
        data-art="routes"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        {[
          "M190 330 Q 280 170 420 230",
          "M210 380 Q 330 300 440 350",
          "M250 250 Q 320 120 400 190",
        ].map((d) => (
          <path key={d} d={d} pathLength={1} strokeDasharray="1" strokeDashoffset="0" />
        ))}
      </g>
      <g fill={GOLD}>
        {[
          [190, 330],
          [420, 230],
          [440, 350],
          [400, 190],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" />
        ))}
      </g>
    </svg>
  );
}
