import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { getThing, things, work } from "@/lib/mock-data";

export function generateStaticParams() {
  return things.map((thing) => ({ workSlug: work.slug, thingSlug: thing.slug }));
}

export default async function ThingPage({ params }: { params: Promise<{ workSlug: string; thingSlug: string }> }) {
  const { workSlug, thingSlug } = await params;
  const thing = getThing(thingSlug);
  if (workSlug !== work.slug || !thing) notFound();
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
            <div className="related-list">{related.map((item) => <ThingPill key={item.slug} thing={item} />)}</div>
          </div>
          <div className="detail-section activity-section">
            <h2>Recent activity</h2>
            <div className="activity-item"><span className="activity-icon">✦</span><div><p>Workgraph가 대화에서 이 Thing을 참조했어요</p><span>오늘, 오전 10:37</span></div></div>
            <div className="activity-item"><span className="activity-icon created">＋</span><div><p>이 Thing이 만들어졌어요</p><span>어제, 오후 4:12</span></div></div>
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
