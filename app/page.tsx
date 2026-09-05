import Link from "next/link";
import { PageShell } from "@/components/app-shell";
import { ThingPill } from "@/components/thing-pill";
import { getThingsForWork } from "@/lib/data";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Work } from "@/lib/data";
import { formatRelativeKorean } from "@/lib/format";

export const dynamic = "force-dynamic";

async function listActiveWorks(): Promise<Work[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("works")
    .select("id, slug, title, summary, status, created_at, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export default async function Home() {
  const works = await listActiveWorks();
  const worksWithThings = await Promise.all(
    works.map(async (work) => ({ work, things: await getThingsForWork(work.id) }))
  );

  return (
    <PageShell className="home-page">
      <section className="home-hero">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <div className="hero-row">
          <div>
            <h1>계속 이어지는 일을 위한<br />조용한 공간.</h1>
            <p>생각하고, 대화하고, 중요한 맥락을 잃지 마세요.</p>
          </div>
          <button className="primary-button"><span>＋</span> Start something</button>
        </div>
      </section>

      <section className="works-section">
        <div className="section-title-row">
          <h2>Active Works</h2><span>{works.length}</span>
        </div>
        {worksWithThings.map(({ work, things }) => (
          <article className="work-card" key={work.id}>
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
              {things.slice(0, 4).map((thing) => (
                <ThingPill key={thing.slug} thing={thing} workSlug={work.slug} compact />
              ))}
              {things.length > 4 ? <span className="more-things">+{things.length - 4}</span> : null}
            </div>
            <Link className="work-card-footer" href={`/work/${work.slug}`}>
              <span>마지막 활동 {formatRelativeKorean(work.updatedAt)}</span><strong>열기 <b>→</b></strong>
            </Link>
          </article>
        ))}
      </section>
      <p className="home-note">하나의 Work에서 시작하세요. 필요한 구조는 대화 속에서 생겨납니다.</p>
    </PageShell>
  );
}
