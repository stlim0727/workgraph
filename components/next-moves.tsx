import type { NextMovesResult } from "@/lib/semantic-next-moves";
import type { Thing } from "@/lib/types";

export function NextMoves({ result, things }: { result: NextMovesResult; things: Thing[] }) {
  const byId = new Map(things.map((thing) => [thing.id, thing]));
  return (
    <section className="next-moves">
      <div className="next-moves-heading">
        <div><span className="experimental-label">Experiment</span><h2>Possible next moves</h2></div>
        <span className="count">{result.moves.length}</span>
      </div>
      <p className="next-moves-summary">{result.summary}</p>
      <div className="next-moves-list">
        {result.moves.map((move) => (
          <article className="next-move-card" key={move.targets.join(":")}>
            <div className="next-move-top"><strong>{move.title}</strong><span className="confidence">{move.confidence}</span></div>
            <p>{move.rationale}</p>
            <details>
              <summary>Why this?</summary>
              <ol className="because-chain">
                {move.because.map((step, index) => {
                  const thing = byId.get(step.thingId);
                  return <li key={`${step.thingId}-${index}`}><span className="because-kind">{thing?.type ?? "thing"}</span><span>{step.explanation}</span></li>;
                })}
              </ol>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
