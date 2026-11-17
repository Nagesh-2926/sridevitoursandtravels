import { cn } from "@/lib/cn";

/** Quiet loading indicator: a bronze hairline that sweeps; static under reduced motion. */
export function Spinner({ label, className }: { label: string; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative h-px w-40 overflow-hidden bg-white/15">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-sweep bg-bronze motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-60" />
      </div>
      <span className="text-eyebrow text-mist uppercase">{label}</span>
    </div>
  );
}
