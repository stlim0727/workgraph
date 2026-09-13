import Link from "next/link";
import { PageShell } from "@/components/app-shell";
import { ThingPill } from "@/components/thing-pill";
import { createWork } from "@/app/actions";
import { listThings, listWorks } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function Home() {
  const works = await listWorks();
  const workThings = await Promise.all(works.map((work) => listThings(work.id)));
  const persistenceEnabled = isSupabaseConfigured();

  return (
    <PageShell className="home-page">
      <section className="home-hero">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <div className="hero-row">
          <div>
            <h1>계속 이어지는 일을 위한<br />조용한 공간.</h1>
            <p>생각하고, 대화하고, 중요한 맥락을 잃지 마세요.</p>
          </div>
          {persistenceEnabled ? (
            <details className="create-menu">
              <summary className="primary-button"><span>＋</span> Start something</summary>
              <form action={createWork} className="mutation-form">
                <label>Title<input name="title" required maxLength={120} placeholder="새로운 Work" /></label>
                <label>Summary<textarea name="summary" maxLength={500} rows={3} placeholder="어떤 일을 이어가나요?" /></label>
                <button className="primary-button" type="submit">Create Work</button>
              </form>
            </details>
          ) : <span className="setup-badge">Demo data · configure Supabase to edit</span>}
        </div>
      </section>

      <section className="works-section">
        <div className="section-title-row">
          <h2>Active Works</h2><span>{works.length}</span>
        </div>
        <div className="works-grid">{works.map((work, index) => {
          const things = workThings[index];
          return <article className="work-card" key={work.id}>
          <Link className="work-card-link" href={`/work/${work.slug}`}>
            <div className="work-card-top">
              <span className="status"><i /> Active</span>
              <span className="more">•••</span>
            </div>
            <div className="work-card-body">
              <h3>{work.title}</h3>
              <p>{work.summary}</p>
            </div>
          </Link>
          <div className="work-things">
            {things.slice(0, 4).map((thing) => <ThingPill key={thing.id} thing={thing} workSlug={work.slug} compact />)}
            {things.length > 4 ? <span className="more-things">+{things.length - 4}</span> : null}
          </div>
          <Link className="work-card-footer" href={`/work/${work.slug}`}><span>마지막 활동 {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(work.updatedAt))}</span><strong>열기 <b>→</b></strong></Link>
        </article>})}</div>
      </section>
      <p className="home-note">하나의 Work에서 시작하세요. 필요한 구조는 대화 속에서 생겨납니다.</p>
    </PageShell>
  );
}
