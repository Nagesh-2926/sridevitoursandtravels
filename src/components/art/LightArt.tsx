import { AirlinerArt, CarArt, CoachArt, PalmArt, TrainArt } from "./TravelArt";

/**
 * Light-theme artwork (Phase 03.2), following the owner-approved
 * reference: one cohesive sunrise travel scene and two-tone service
 * pictograms (deep navy + controlled orange). Vector stand-ins for the
 * photographic renders in the reference; see docs/ASSETS.md.
 */
const NAVY = "#10213B";
const CHARCOAL = "#1F2937";
const FLAME = "#F36B08";

const niches = (width: number) => Math.max(2, Math.floor(width / 26));

/** Sunlit temple gopuram with tiered niches and kalasams. viewBox 300×440. */
function SunlitGopuram() {
  const tiers = [
    { w: 236, h: 58 },
    { w: 206, h: 50 },
    { w: 178, h: 45 },
    { w: 152, h: 40 },
    { w: 128, h: 36 },
    { w: 106, h: 32 },
  ];
  let y = 420;
  return (
    <svg viewBox="0 0 300 440" x="0" y="0" width="300" height="440">
      <defs>
        <linearGradient id="lh-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8F9CAD" />
          <stop offset="0.45" stopColor="#C4CDD8" />
          <stop offset="0.75" stopColor="#E7ECF2" />
          <stop offset="1" stopColor="#F7D3AE" />
        </linearGradient>
      </defs>
      <rect x="24" y="420" width="252" height="20" fill="#7F8C9D" />
      {tiers.map((tier, i) => {
        const top = y - tier.h;
        const next = tiers[i + 1]?.w ?? tier.w - 24;
        const x0 = 150 - tier.w / 2;
        const x1 = 150 - next / 2;
        const g = (
          <g key={i}>
            <path
              d={`M${x0} ${y} L${x1} ${top} L${300 - x1} ${top} L${300 - x0} ${y} Z`}
              fill="url(#lh-stone)"
              stroke={CHARCOAL}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
            <rect
              x={x1 - 2}
              y={top - 3}
              width={300 - 2 * x1 + 4}
              height="5"
              rx="2"
              fill="#7F8C9D"
            />
            {Array.from({ length: niches(tier.w) }, (_, k) => {
              const cx = x0 + 18 + ((tier.w - 36) / (niches(tier.w) - 1)) * k;
              return (
                <path
                  key={k}
                  d={`M${cx - 4} ${y - 6} L${cx - 4} ${top + tier.h * 0.4} Q${cx} ${top + tier.h * 0.22} ${cx + 4} ${top + tier.h * 0.4} L${cx + 4} ${y - 6} Z`}
                  fill={CHARCOAL}
                  opacity="0.45"
                />
              );
            })}
            <path
              d={`M${300 - x1} ${top} L${300 - x0} ${y}`}
              stroke={FLAME}
              strokeOpacity="0.55"
              strokeWidth="1.4"
            />
          </g>
        );
        y = top;
        return g;
      })}
      <path
        d={`M98 ${y} C98 ${y - 40} 202 ${y - 40} 202 ${y} Z`}
        fill="url(#lh-stone)"
        stroke={CHARCOAL}
        strokeOpacity="0.35"
      />
      {[118, 150, 182].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y - 34} rx="6" ry="8" fill={FLAME} />
          <path d={`M${cx} ${y - 42} L${cx} ${y - 54}`} stroke={FLAME} strokeWidth="2" />
        </g>
      ))}
      <path d="M128 440 L128 392 C128 376 172 376 172 392 L172 440 Z" fill={CHARCOAL} />
    </svg>
  );
}

/**
 * One cohesive sunrise scene: airliner overhead, train, coach and car on a
 * misty ground plane, temple gopuram in morning light. viewBox 1000×620;
 * rendered with "meet" so no subject is ever cropped.
 */
export function LightHeroPanorama() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      data-hero-panorama=""
    >
      <defs>
        <radialGradient id="lh-sun" cx="72%" cy="62%" r="48%">
          <stop offset="0" stopColor="#FFD9A8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#FCE7CC" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lh-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3ECF6" />
          <stop offset="0.5" stopColor="#F4F7FB" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lh-fade-x" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.14" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.86" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask
          id="lh-edges"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1000"
          height="620"
        >
          <rect width="1000" height="620" fill="url(#lh-fade-x)" />
        </mask>
        <filter id="lh-blur" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="lh-shadow" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* sunrise glow and soft cloud banks */}
      <g mask="url(#lh-edges)">
        <rect width="1000" height="620" fill="url(#lh-sun)" />
        <g filter="url(#lh-blur)" fill="#FFFFFF" opacity="0.9">
          <ellipse cx="300" cy="270" rx="260" ry="34" />
          <ellipse cx="760" cy="330" rx="300" ry="30" />
          <ellipse cx="520" cy="120" rx="200" ry="22" opacity="0.7" />
        </g>
      </g>

      {/* flight path */}
      <path
        d="M90 300 Q 320 120 640 92"
        fill="none"
        stroke={FLAME}
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />

      {/* temple, behind the vehicles */}
      <g transform="translate(690 52) scale(0.96)">
        <SunlitGopuram />
      </g>
      <PalmArt x="636" y="300" width="70" height="128" />
      <PalmArt x="932" y="292" width="72" height="136" />

      {/* misty ground plane */}
      <rect
        x="0"
        y="440"
        width="1000"
        height="180"
        fill="url(#lh-ground)"
        mask="url(#lh-edges)"
      />
      <path
        d="M0 452 Q 500 432 1000 452"
        fill="none"
        stroke={FLAME}
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />

      {/* contact shadows */}
      <g filter="url(#lh-shadow)" fill={NAVY} opacity="0.28">
        <ellipse cx="300" cy="462" rx="300" ry="11" />
        <ellipse cx="560" cy="478" rx="150" ry="9" />
        <ellipse cx="772" cy="500" rx="110" ry="8" />
      </g>

      {/* train: last coach + power car, facing right */}
      <svg x="0" y="336" width="600" height="120" viewBox="352 0 848 170">
        <TrainArt id="lh-train" outline={CHARCOAL} />
      </svg>
      {/* coach */}
      <CoachArt id="lh-bus" outline={CHARCOAL} x="420" y="372" width="290" height="100" />
      {/* car in the near lane */}
      <CarArt id="lh-car" outline={CHARCOAL} x="652" y="420" width="240" height="87" />
      {/* airliner overhead */}
      <g transform="rotate(-8 520 130)">
        <AirlinerArt
          id="lh-plane"
          outline={CHARCOAL}
          x="300"
          y="40"
          width="460"
          height="144"
        />
      </g>
    </svg>
  );
}

export type PictogramName = "plane" | "train" | "bus" | "temple" | "digital";

/** Two-tone service pictograms (navy + orange), viewBox 96×80. */
export function ServicePictogram({
  name,
  className,
}: {
  name: PictogramName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 80"
      aria-hidden="true"
      className={className}
      data-pictogram={name}
    >
      {name === "plane" && (
        <>
          <path
            d="M10 64 Q 44 74 86 50"
            fill="none"
            stroke={FLAME}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g transform="rotate(-28 48 38)" fill={NAVY}>
            <rect x="12" y="34" width="70" height="9" rx="4.5" />
            <path d="M78 34 C86 35 90 37 90 38.5 C90 40 86 42 78 43 Z" />
            <path d="M38 35 L54 35 L42 10 L35 10 Z" />
            <path d="M38 42 L54 42 L42 67 L35 67 Z" />
            <path d="M14 35 L22 35 L16 24 L12 24 Z" />
            <path d="M14 42 L22 42 L16 53 L12 53 Z" />
          </g>
        </>
      )}
      {name === "train" && (
        <>
          <rect x="24" y="6" width="48" height="52" rx="12" fill={NAVY} />
          <rect x="31" y="14" width="34" height="18" rx="4" fill="#FFFFFF" />
          <rect x="31" y="38" width="34" height="5" rx="2.5" fill={FLAME} />
          <circle cx="34" cy="50" r="3.5" fill="#FFFFFF" />
          <circle cx="62" cy="50" r="3.5" fill="#FFFFFF" />
          <path
            d="M34 58 L24 72 M62 58 L72 72"
            stroke={FLAME}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M18 72 L78 72" stroke={FLAME} strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {name === "bus" && (
        <>
          <rect x="10" y="12" width="76" height="48" rx="10" fill={FLAME} />
          <rect x="17" y="19" width="62" height="20" rx="4" fill={NAVY} />
          <path d="M37 19 L37 39 M57 19 L57 39" stroke={FLAME} strokeWidth="3" />
          <rect x="10" y="44" width="76" height="5" fill={NAVY} opacity="0.85" />
          <circle cx="28" cy="62" r="9" fill={NAVY} />
          <circle cx="68" cy="62" r="9" fill={NAVY} />
          <circle cx="28" cy="62" r="3.5" fill="#FFFFFF" />
          <circle cx="68" cy="62" r="3.5" fill="#FFFFFF" />
        </>
      )}
      {name === "temple" && (
        <>
          <path d="M48 4 L52 12 L44 12 Z" fill={FLAME} />
          <path d="M38 26 L42 12 L54 12 L58 26 Z" fill={FLAME} />
          <path d="M30 44 L36 26 L60 26 L66 44 Z" fill={FLAME} />
          <path d="M22 66 L28 44 L68 44 L74 66 Z" fill={FLAME} />
          <path d="M42 66 L42 54 C42 48 54 48 54 54 L54 66 Z" fill="#FFFFFF" />
          <path d="M14 66 L82 66 L82 74 L14 74 Z" fill={NAVY} />
        </>
      )}
      {name === "digital" && (
        <>
          <rect x="16" y="8" width="64" height="44" rx="5" fill={NAVY} />
          <rect x="21" y="13" width="54" height="34" rx="2" fill="#FFFFFF" />
          <path d="M6 58 L90 58 L84 66 L12 66 Z" fill={NAVY} />
          <g transform="translate(48 30)" fill={FLAME}>
            <circle r="7" />
            {Array.from({ length: 8 }, (_, i) => (
              <rect
                key={i}
                x="-2.5"
                y="-12"
                width="5"
                height="6"
                rx="1"
                transform={`rotate(${i * 45})`}
              />
            ))}
            <circle r="3" fill="#FFFFFF" />
          </g>
        </>
      )}
    </svg>
  );
}
