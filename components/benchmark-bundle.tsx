import { createBenchmarkBundle } from "@/lib/semantic-benchmark";
import type { WorkSnapshot } from "@/lib/semantic-next-moves";

export function BenchmarkBundle({ snapshot }: { snapshot: WorkSnapshot }) {
  const bundle = createBenchmarkBundle(snapshot);
  return (
    <section className="benchmark-bundle">
      <div className="semantic-experiment-heading">
        <div><span className="experimental-label">Next falsification</span><h2>LLM benchmark bundle</h2></div>
        <span className="experiment-verdict">v1</span>
      </div>
      <p>Run both conditions independently with the same model and settings. The prose and topology are identical; only semantic labels differ.</p>
      {bundle.prompts.map((prompt) => (
        <details key={prompt.condition}>
          <summary>{prompt.condition === "semantic" ? "A · semantic prompt" : "B · blinded prompt"}</summary>
          <pre>{prompt.system + "\n\n" + prompt.input}</pre>
        </details>
      ))}
      <details>
        <summary>Scoring rubric</summary>
        <ol>{bundle.rubric.map((item) => <li key={item}>{item}</li>)}</ol>
      </details>
    </section>
  );
}
