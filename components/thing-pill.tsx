import Link from "next/link";
import type { Thing } from "@/lib/mock-data";

export function ThingPill({ thing, compact = false }: { thing: Thing; compact?: boolean }) {
  return (
    <Link className={`thing-pill ${compact ? "compact" : ""}`} href={`/work/graph-app/thing/${thing.slug}`}>
      <span className={`thing-dot ${thing.color}`} />
      <span>@{thing.name}</span>
      {!compact ? <span className="thing-arrow">↗</span> : null}
    </Link>
  );
}
