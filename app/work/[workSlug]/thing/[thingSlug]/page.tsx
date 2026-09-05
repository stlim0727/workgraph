import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { getRecentEventsForThing, getThingBySlug, getThingsForWork, getWorkBySlug } from "@/lib/data";
import { formatEventLabel, formatRelativeKorean } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ThingPage({ params }: { params: Promise<{ workSlug: string; thingSlug: string }> }) {
  const { workSlug, thingSlug } = await params;
  const work = await getWorkBySlug(workSlug);
  if (!work) notFound();

  const thing = await getThingBySlug(work.id, thingSlug);
  if (!thing) notFound();

  const [things, activity] = await Promise.all([
    getThingsForWork(work.id),
    getRecentEventsForThing(thing.id),
  ]);
  const related = things.filter((item) => item.slug !== thing.slug).slice(0, 3);

  return (
    <PageShell backHref={`/work/${work.slug}`} context={work.title} className="thing-page">
      <div className="thing-layout">
        <article className="thing-detail">
          <div className="thing-title-row">
            <div><span className={`large-dot ${thing.color}`} /><span className="type-badge">{thing.type}</span><h1>@{thing.name}</h1></div>
            <button className="secondary-button">•••</button>
          </div>
          <p className="thing-description">{thing.description}</p>
          <div className="detail-section">
            <h2>Related Things</h2>
            <div className="related-list">{related.map((item) => <ThingPill key={item.slug} thing={item} workSlug={work.slug} />)}</div>
          </div>
          <div className="detail-section activity-section">
            <h2>Recent activity</h2>
            {activity.map((event) => (
              <div className="activity-item" key={event.id}>
                <span className={`activity-icon${event.type === "thing_created" ? " created" : ""}`}>
                  {event.type === "thing_created" ? "＋" : "✦"}
                </span>
                <div><p>{formatEventLabel(event.type)}</p><span>{formatRelativeKorean(event.createdAt)}</span></div>
              </div>
            ))}
          </div>
        </article>
        <aside className="ask-panel">
          <div><p className="eyebrow">ASK ABOUT THIS THING</p><h2>@{thing.name}의 맥락에서<br />대화를 이어가세요.</h2><p>현재 Work와 연결된 Things를 함께 살펴봐요.</p></div>
          <Composer mention={thing.name} placeholder="이 Thing에 대해 물어보세요…" />
          <Link className="back-to-work" href={`/work/${work.slug}`}>전체 대화로 돌아가기 <span>→</span></Link>
        </aside>
      </div>
    </PageShell>
  );
}
