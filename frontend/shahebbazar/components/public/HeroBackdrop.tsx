// Crossfading hero backdrop, in pure CSS — no client component and no
// JavaScript, so the home page stays server rendered and crawlable. The
// keyframes are generated below rather than kept in globals.css, so the timing
// always matches however many slides there are.

// No licensed photography of Rajshahi yet, so the drawn scenes are used
// instead. To switch: drop files in public/hero/ and list them here.
const PHOTOS: { src: string; alt: string }[] = [];

const HOLD_SECONDS = 7;
const FADE_SECONDS = 1.4;

export function HeroBackdrop() {
    const scenes = PHOTOS.length > 0 ? PHOTOS.map(() => null) : SCENES;
    const count = PHOTOS.length > 0 ? PHOTOS.length : SCENES.length;

    const cycle = count * HOLD_SECONDS;
    const fadePct = (FADE_SECONDS / cycle) * 100;
    const holdPct = 100 / count;

    // The incoming slide sits above the outgoing one, so fading it in is what
    // produces the crossfade.
    const keyframes = `
@keyframes shbHeroSlide {
    0% { opacity: 0; }
    ${fadePct.toFixed(3)}% { opacity: 1; }
    ${holdPct.toFixed(3)}% { opacity: 1; }
    ${(holdPct + fadePct).toFixed(3)}% { opacity: 0; }
    100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
    .shb-hero-slide { animation: none !important; opacity: 0 !important; }
}`;

    const slide = (index: number) => ({
        animationName: "shbHeroSlide",
        animationDuration: `${cycle}s`,
        animationDelay: `${index * HOLD_SECONDS}s`,
        animationIterationCount: "infinite" as const,
        animationTimingFunction: "ease-in-out",
        animationFillMode: "both" as const,
    });

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: keyframes }} />

            {/* The last slide also sits underneath as a still base layer, which
                is what the first slide fades in over at the end of every cycle.
                No seam, nothing blank on first paint, and it is what shows when
                motion is turned down. */}
            <div className="absolute inset-0">
                {PHOTOS.length > 0 ? (
                    <HeroPhoto photo={PHOTOS[PHOTOS.length - 1]} eager />
                ) : (
                    SCENES[SCENES.length - 1].Scene()
                )}
            </div>

            {scenes.map((_, i) => (
                <div
                    key={i}
                    className="shb-hero-slide absolute inset-0"
                    style={slide(i)}
                >
                    {PHOTOS.length > 0 ? (
                        <HeroPhoto photo={PHOTOS[i]} />
                    ) : (
                        SCENES[i].Scene()
                    )}
                </div>
            ))}
        </div>
    );
}

// Only the base layer is on screen at first paint, so the rest are lazy —
// four hero-sized images at once would delay the largest paint.
function HeroPhoto({
    photo,
    eager = false,
}: {
    photo: { src: string; alt: string };
    eager?: boolean;
}) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={photo.src}
            // Decorative — the heading beside it carries the meaning.
            alt=""
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "low"}
            decoding="async"
            className="size-full object-cover"
        />
    );
}

/* ------------------------------------------------------------------ scenes */

// Each scene crops rather than distorts at any aspect ratio. The palettes are
// deliberately far apart so the change reads as intentional.
const SCENES: { key: string; Scene: () => React.ReactElement }[] = [
    { key: "bazar", Scene: BazarAtDawn },
    { key: "river", Scene: PadmaRiver },
    { key: "market", Scene: SilkMarket },
    { key: "orchard", Scene: MangoOrchard },
];

function SceneFrame({ children }: { children: React.ReactNode }) {
    return (
        <svg
            viewBox="0 0 1200 420"
            preserveAspectRatio="xMidYMid slice"
            className="size-full"
        >
            {children}
        </svg>
    );
}

/** Shaheb Bazar's colonial facade at first light. */
function BazarAtDawn() {
    return (
        <SceneFrame>
            <defs>
                <linearGradient id="shbDawnSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="60%" stopColor="#ffedd5" />
                    <stop offset="100%" stopColor="#fff7ed" />
                </linearGradient>
            </defs>

            <rect width="1200" height="420" fill="url(#shbDawnSky)" />
            <circle cx="920" cy="140" r="52" fill="#fcd34d" opacity="0.6" />

            {/* Shopfronts, stepped so the roofline reads as a row */}
            <g fill="#fdba74" opacity="0.55">
                <rect x="60" y="250" width="150" height="170" rx="4" />
                <rect x="1010" y="238" width="160" height="182" rx="4" />
            </g>
            <g fill="#fb923c" opacity="0.6">
                <rect x="240" y="196" width="180" height="224" rx="4" />
                <rect x="800" y="210" width="180" height="210" rx="4" />
            </g>

            {/* The central building, with its clock tower */}
            <g fill="#f97316" opacity="0.7">
                <rect x="450" y="160" width="320" height="260" rx="4" />
                <rect x="586" y="86" width="48" height="80" rx="4" />
                <path d="M610 52l30 36h-60z" />
            </g>

            {/* Arcade of arched windows */}
            <g fill="#fff7ed" opacity="0.9">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <rect key={i} x={478 + i * 42} y={212} width="26" height="60" rx="13" />
                ))}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <rect key={`b${i}`} x={478 + i * 42} y={300} width="26" height="54" rx="13" />
                ))}
            </g>

            <rect y="396" width="1200" height="24" fill="#ea580c" opacity="0.2" />
        </SceneFrame>
    );
}

/** The Padma at Rajshahi, with country boats on the water. */
function PadmaRiver() {
    return (
        <SceneFrame>
            <defs>
                <linearGradient id="shbRiverSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bfdbfe" />
                    <stop offset="100%" stopColor="#eff6ff" />
                </linearGradient>
                <linearGradient id="shbWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
            </defs>

            <rect width="1200" height="420" fill="url(#shbRiverSky)" />
            <g fill="#ffffff" opacity="0.65">
                <ellipse cx="250" cy="90" rx="96" ry="26" />
                <ellipse cx="880" cy="66" rx="74" ry="20" />
            </g>

            {/* Far bank */}
            <path d="M0 250 Q300 226 600 246 T1200 236 V300 H0z" fill="#93c5fd" opacity="0.5" />

            <rect y="286" width="1200" height="134" fill="url(#shbWater)" opacity="0.55" />

            {/* Country boats */}
            <g fill="#1d4ed8" opacity="0.45">
                <path d="M300 320h190l-26 34H326z" />
                <rect x="390" y="248" width="5" height="72" />
                <path d="M395 250l70 66h-70z" />
            </g>
            <g fill="#2563eb" opacity="0.32">
                <path d="M760 300h120l-17 22h-86z" />
                <rect x="816" y="252" width="4" height="48" />
                <path d="M820 254l44 44h-44z" />
            </g>

            {/* Ripples */}
            <g stroke="#ffffff" strokeWidth="3" opacity="0.4" strokeLinecap="round">
                <path d="M120 372h110" />
                <path d="M560 392h150" />
                <path d="M930 360h120" />
            </g>
        </SceneFrame>
    );
}

/** Stalls of the silk market, the trade the city is known for. */
function SilkMarket() {
    return (
        <SceneFrame>
            <defs>
                <linearGradient id="shbMarketSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fce7f3" />
                    <stop offset="100%" stopColor="#faf5ff" />
                </linearGradient>
            </defs>

            <rect width="1200" height="420" fill="url(#shbMarketSky)" />

            {/* Awnings over a row of stalls */}
            {[0, 1, 2, 3, 4].map((i) => {
                const x = 40 + i * 240;
                const tint = ["#f9a8d4", "#c4b5fd", "#fbcfe8", "#a5b4fc", "#f5d0fe"][i];
                return (
                    <g key={i}>
                        <path
                            d={`M${x} 214h200l-24 44H${x + 24}z`}
                            fill={tint}
                            opacity="0.8"
                        />
                        <rect
                            x={x + 24}
                            y="258"
                            width="152"
                            height="162"
                            fill={tint}
                            opacity="0.35"
                        />
                        <rect x={x + 22} y="252" width="6" height="168" fill="#a855f7" opacity="0.3" />
                        <rect x={x + 172} y="252" width="6" height="168" fill="#a855f7" opacity="0.3" />
                    </g>
                );
            })}

            {/* Bolts of silk on the counters */}
            <g opacity="0.55">
                {[0, 1, 2, 3, 4].map((i) =>
                    [0, 1, 2].map((j) => (
                        <rect
                            key={`${i}-${j}`}
                            x={76 + i * 240 + j * 34}
                            y={310 + (j % 2) * 8}
                            width="24"
                            height="70"
                            rx="6"
                            fill={["#ec4899", "#8b5cf6", "#f472b6"][j]}
                        />
                    ))
                )}
            </g>

            <rect y="398" width="1200" height="22" fill="#a855f7" opacity="0.16" />
        </SceneFrame>
    );
}

/** Mango orchards outside the city, which Rajshahi is famous for. */
function MangoOrchard() {
    return (
        <SceneFrame>
            <defs>
                <linearGradient id="shbOrchardSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d1fae5" />
                    <stop offset="100%" stopColor="#f0fdf4" />
                </linearGradient>
            </defs>

            <rect width="1200" height="420" fill="url(#shbOrchardSky)" />
            <circle cx="180" cy="110" r="44" fill="#fde68a" opacity="0.55" />

            {/* Far rows are smaller and paler */}
            <g fill="#6ee7b7" opacity="0.45">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={i}>
                        <ellipse cx={120 + i * 200} cy="244" rx="72" ry="54" />
                        <rect x={114 + i * 200} y="244" width="12" height="60" fill="#34d399" />
                    </g>
                ))}
            </g>

            <g fill="#34d399" opacity="0.6">
                {[0, 1, 2, 3, 4].map((i) => (
                    <g key={i}>
                        <ellipse cx={220 + i * 230} cy="312" rx="96" ry="72" />
                        <rect x={212 + i * 230} y="312" width="16" height="84" fill="#10b981" />
                    </g>
                ))}
            </g>

            {/* Fruit */}
            <g fill="#fbbf24" opacity="0.75">
                {[0, 1, 2, 3, 4].map((i) =>
                    [0, 1, 2].map((j) => (
                        <ellipse
                            key={`${i}-${j}`}
                            cx={186 + i * 230 + j * 40}
                            cy={300 + (j % 2) * 26}
                            rx="11"
                            ry="14"
                        />
                    ))
                )}
            </g>

            <rect y="392" width="1200" height="28" fill="#059669" opacity="0.18" />
        </SceneFrame>
    );
}
