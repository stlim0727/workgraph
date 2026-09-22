import { createLongHorizonBenchmark } from "@/lib/long-horizon-benchmark";

export function LongHorizonBenchmark() {
  const benchmark = createLongHorizonBenchmark();

  return (
    <section className="experiment-panel">
      <div className="panel-heading">
        <div><span className="live-dot" />Long-horizon recovery</div>
        <span>Experiment 4</span>
      </div>
      <p className="panel-description">
        Same evolving project, three projections. Run each prompt in a fresh agent and score the outputs blind.
      </p>
      <div className="benchmark-prompts">
        {(["A", "B", "C"] as const).map((condition) => (
          <details key={condition} className="benchmark-prompt">
            <summary>Condition {condition} prompt</summary>
            <textarea readOnly rows={14} value={benchmark[condition].prompt} aria-label={`Condition ${condition} benchmark prompt`} />
          </details>
        ))}
        <details className="benchmark-prompt">
          <summary>Blind scoring rubric</summary>
          <ul>{benchmark.scoring.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
      </div>
    </section>
  );
}
