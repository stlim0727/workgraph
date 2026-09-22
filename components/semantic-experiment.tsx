import type { SemanticExperimentResult } from "@/lib/semantic-next-moves";

const rows: Array<[keyof SemanticExperimentResult["semanticMetrics"], string]> = [
  ["unresolvedDetected", "Unresolved gaps detected"],
  ["groundedMoves", "Grounded next moves"],
  ["provenanceSteps", "Provenance steps"],
  ["intentConnectedMoves", "Moves connected to intent"],
];

export function SemanticExperiment({ result }: { result: SemanticExperimentResult }) {
  return (
    <section className="semantic-experiment">
      <div className="semantic-experiment-heading">
        <div>
          <span className="experimental-label">Control</span>
          <h2>Does semantics earn its keep?</h2>
        </div>
        <span className="experiment-verdict">A/B</span>
      </div>
      <p>{result.interpretation}</p>
      <div className="experiment-table" role="table" aria-label="Semantic versus blinded graph metrics">
        <div className="experiment-row experiment-header" role="row">
          <span>Signal</span><span>Semantic</span><span>Blinded</span><span>Δ</span>
        </div>
        {rows.map(([key, label]) => (
          <div className="experiment-row" role="row" key={key}>
            <span>{label}</span>
            <strong>{result.semanticMetrics[key]}</strong>
            <span>{result.blindedMetrics[key]}</span>
            <span>{result.delta[key] > 0 ? `+${result.delta[key]}` : result.delta[key]}</span>
          </div>
        ))}
      </div>
      <details>
        <summary>What was blinded?</summary>
        <p>The node text and graph topology stay identical. Node types become <code>thing</code> and relation types become <code>related_to</code>. The control therefore removes semantic labels, not information-bearing prose.</p>
      </details>
    </section>
  );
}
