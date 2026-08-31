import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Workgraph 홈">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>workgraph</span>
    </Link>
  );
}

export function TopBar({ backHref, context }: { backHref?: string; context?: string }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          {backHref ? <Link className="icon-button" href={backHref} aria-label="뒤로 가기">←</Link> : null}
          <Brand />
          {context ? <><span className="crumb">/</span><span className="context-label">{context}</span></> : null}
        </div>
        <button className="avatar" aria-label="프로필">SL</button>
      </div>
    </header>
  );
}

export function PageShell({ children, backHref, context, className = "" }: {
  children: React.ReactNode;
  backHref?: string;
  context?: string;
  className?: string;
}) {
  return <><TopBar backHref={backHref} context={context} /><main className={`page ${className}`}>{children}</main></>;
}
