"use client";

import { useActionState } from "react";
import type { MessageActionState } from "@/app/actions";

const initialState: MessageActionState = { status: "idle", message: "" };

export function Composer({
  placeholder = "이 Work에 대해 무엇이든 물어보세요…",
  mention,
  action,
}: {
  placeholder?: string;
  mention?: string;
  action?: (state: MessageActionState, formData: FormData) => Promise<MessageActionState>;
}) {
  const [state, formAction, pending] = useActionState(action ?? passthrough, initialState);
  const enabled = Boolean(action);

  return (
    <div className="composer-wrap">
      {mention ? <div className="composer-mention">@{mention}</div> : null}
      <form action={formAction} className="composer">
        <button className="composer-add" aria-label="추가" type="button" disabled={!enabled}>＋</button>
        <textarea aria-label="메시지" name="content" placeholder={enabled ? placeholder : "Supabase 설정 후 메시지를 보낼 수 있어요"} rows={1} defaultValue={mention ? `@${mention}에 대해 ` : ""} required maxLength={10_000} disabled={!enabled || pending} />
        <div className="composer-actions">
          <span className="mention-hint"><kbd>@</kbd> Things</span>
          <button className="send-button" aria-label="메시지 보내기" type="submit" disabled={!enabled || pending}>{pending ? "…" : "↑"}</button>
        </div>
      </form>
      <p className={`composer-caption ${state.status}`} aria-live="polite">{state.message || (enabled ? "메시지와 임시 응답을 이 Work에 저장해요" : "현재 화면은 읽기 전용 데모예요")}</p>
    </div>
  );
}

async function passthrough(): Promise<MessageActionState> {
  return { status: "error", message: "이 대화 입력은 아직 사용할 수 없어요." };
}
