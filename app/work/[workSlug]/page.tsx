import { notFound } from "next/navigation";
import { PageShell } from "@/components/app-shell";
import { Composer } from "@/components/composer";
import { ThingPill } from "@/components/thing-pill";
import { createThing, sendMessage } from "@/app/actions";
import { getWorkBySlug, listMessages, listThings } from "@/lib/data";
import { conversationDateKey, formatConversationDay, formatMessageTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase";

export default async function WorkPage({ params }: { params: Promise<{ workSlug: string }> }) {
  const { workSlug } = await params;
  const work = await getWorkBySlug(workSlug);
  if (!work) notFound();
  const [things, messages] = await Promise.all([listThings(work.id), listMessages(work.id)]);
  const messageAction = isSupabaseConfigured() ? sendMessage.bind(null, work.id, work.slug) : undefined;
  const messageGroups = messages.reduce<Array<{ key: string; label: string; messages: typeof messages }>>((groups, message) => {
    const key = conversationDateKey(message.createdAt);
    const current = groups.at(-1);
    if (current?.key === key) current.messages.push(message);
    else groups.push({ key, label: formatConversationDay(message.createdAt), messages: [message] });
    return groups;
  }, []);

  return (
    <PageShell backHref="/" context={work.title} className="work-page">
      <section className="work-heading">
        <div><span className="status"><i /> Active</span><h1>{work.title}</h1><p>{work.summary}</p></div>
        <button className="secondary-button">•••</button>
      </section>

      <div className="work-layout">
        <section className="conversation-panel">
          <div className="panel-heading"><div><span className="live-dot" />Conversation</div><span>{messageGroups.at(-1)?.label ?? "대화 없음"}</span></div>
          <div className="messages">
            {messageGroups.map((group) => <section className="message-day" key={group.key}>
              <div className="day-divider"><span>{group.label}</span></div>
              {group.messages.map((message) => (
                <article className={`message ${message.role}`} key={message.id}>
                  <div className="message-avatar">{message.role === "user" ? "나" : <span className="mini-mark">✦</span>}</div>
                  <div><div className="message-meta"><strong>{message.role === "user" ? "나" : "Workgraph"}</strong><time dateTime={message.createdAt}>{formatMessageTime(message.createdAt)}</time></div><p>{message.content}</p></div>
                </article>
              ))}
            </section>)}
            {!messages.length ? <p className="empty-state">첫 메시지로 대화를 시작하세요.</p> : null}
          </div>
          <Composer action={messageAction} />
        </section>

        <aside className="things-panel">
          <div className="panel-heading"><div>Things <span className="count">{things.length}</span></div></div>
          <p className="panel-description">계속 기억하고 참조할 것들</p>
          <div className="things-list">{things.map((thing) => <ThingPill key={thing.id} thing={thing} workSlug={work.slug} />)}</div>
          {isSupabaseConfigured() ? <details className="inline-create"><summary>＋ Add Thing</summary><form action={createThing} className="mutation-form">
            <input type="hidden" name="workId" value={work.id} /><input type="hidden" name="workSlug" value={work.slug} />
            <label>Name<input name="name" required maxLength={80} placeholder="prototype" /></label>
            <label>Type<input name="type" required maxLength={40} placeholder="concept" /></label>
            <label>Description<textarea name="description" maxLength={500} rows={3} /></label>
            <button className="primary-button" type="submit">Create Thing</button>
          </form></details> : null}
        </aside>
      </div>
    </PageShell>
  );
}
