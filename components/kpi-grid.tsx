import { InfoTooltip } from "./info-tooltip";
import { KpiMetric } from "@/lib/types";

function getKpiAccent(label: string) {
  if (label.includes("Total collaborations")) return "border-secondary";
  if (label.includes("Internships")) return "border-accent";
  if (label.includes("Placements")) return "border-purple";
  if (label.includes("Active")) return "border-success";
  return "border-slate-200";
}

export function KpiGrid({ items }: { items: KpiMetric[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.label} className={`panel p-5 border-t-4 ${getKpiAccent(item.label)}`}>
          <div className="flex items-start justify-between gap-4">
            <p className="eyebrow">{item.label}</p>
            {item.helper ? <InfoTooltip description={item.helper} /> : null}
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
          {item.insight ? <p className="mt-3 text-xs font-semibold text-secondary">{item.insight}</p> : null}
        </article>
      ))}
    </section>
  );
}

