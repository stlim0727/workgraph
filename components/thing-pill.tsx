import Link from "next/link";
import type { Thing } from "@/lib/data";

export function ThingPill({ thing, workSlug, compact = false }: { thing: Thing; workSlug: string; compact?: boolean }) {
  return (
    <Link className={`thing-pill ${compact ? "compact" : ""}`} href={`/work/${workSlug}/thing/${thing.slug}`}>
      <span className={`thing-dot ${thing.color}`} />
      <span>@{thing.name}</span>
      {!compact ? <span className="thing-arrow">↗</span> : null}
    </Link>
  );
}
