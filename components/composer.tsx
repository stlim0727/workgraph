export function Composer({ placeholder = "이 Work에 대해 무엇이든 물어보세요…", mention }: { placeholder?: string; mention?: string }) {
  return (
    <div className="composer-wrap">
      {mention ? <div className="composer-mention">@{mention}</div> : null}
      <div className="composer">
        <button className="composer-add" aria-label="추가">＋</button>
        <textarea aria-label="메시지" placeholder={placeholder} rows={1} defaultValue={mention ? `@${mention}에 대해 ` : ""} />
        <div className="composer-actions">
          <span className="mention-hint"><kbd>@</kbd> Things</span>
          <button className="send-button" aria-label="메시지 보내기">↑</button>
        </div>
      </div>
      <p className="composer-caption">현재 Work의 맥락을 바탕으로 답해요</p>
    </div>
  );
}
