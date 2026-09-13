import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { relateThings, updateThing } from "@/app/actions";
import { getThingBySlug, getWorkBySlug, listRelatedThings, listThingEvents, listThings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function ThingPage({ params }: { params: Promise<{ workSlug: string; thingSlug: string }> }) {
  const { workSlug, thingSlug } = await params;
  const work = await getWorkBySlug(workSlug);
  if (!work) notFound();
  const thing = await getThingBySlug(work.id, thingSlug);
  if (!thing) notFound();
  const [related, events, things] = await Promise.all([listRelatedThings(work.id, thing.id), listThingEvents(work.id, thing.id), listThings(work.id)]);
  const candidates = things.filter((item) => item.id !== thing.id && !related.some((relatedThing) => relatedThing.id === item.id));

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
            <div className="related-list">{related.map((item) => <ThingPill key={item.id} thing={item} workSlug={work.slug} />)}</div>
            {!related.length ? <p className="empty-state">아직 연결된 Thing이 없어요.</p> : null}
            {isSupabaseConfigured() && candidates.length ? <form action={relateThings} className="relation-form">
              <input type="hidden" name="workId" value={work.id} /><input type="hidden" name="workSlug" value={work.slug} /><input type="hidden" name="thingSlug" value={thing.slug} /><input type="hidden" name="fromThingId" value={thing.id} />
              <input name="relationType" required maxLength={40} defaultValue="related-to" aria-label="Relation type" />
              <select name="toThingId" aria-label="Related Thing">{candidates.map((item) => <option key={item.id} value={item.id}>@{item.name}</option>)}</select>
              <button type="submit">Connect</button>
            </form> : null}
          </div>
          <div className="detail-section activity-section">
            <h2>Recent activity</h2>
            {events.map((event) => <div className="activity-item" key={event.id}><span className="activity-icon">✦</span><div><p>{event.type}</p><span>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}</span></div></div>)}
            {!events.length ? <p className="empty-state">저장된 활동이 아직 없어요.</p> : null}
          </div>
          {isSupabaseConfigured() ? <details className="edit-thing"><summary>Edit Thing</summary><form action={updateThing} className="mutation-form">
            <input type="hidden" name="workId" value={work.id} /><input type="hidden" name="workSlug" value={work.slug} /><input type="hidden" name="thingId" value={thing.id} /><input type="hidden" name="thingSlug" value={thing.slug} />
            <label>Type<input name="type" required maxLength={40} defaultValue={thing.type} /></label>
            <label>Description<textarea name="description" maxLength={500} rows={4} defaultValue={thing.description ?? ""} /></label>
            <button className="primary-button" type="submit">Save changes</button>
          </form></details> : null}
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
