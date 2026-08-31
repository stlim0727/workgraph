import Link from "next/link";
import { PageShell } from "@/components/app-shell";

export default function NotFound() {
  return <PageShell><div className="not-found"><span>404</span><h1>찾을 수 없는 페이지예요.</h1><p>Work로 돌아가 대화를 계속해 보세요.</p><Link className="primary-button" href="/">홈으로 돌아가기</Link></div></PageShell>;
}
