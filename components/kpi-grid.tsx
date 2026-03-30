import { InfoTooltip } from "./info-tooltip";
import { KpiMetric } from "@/lib/types";

export function KpiGrid({ items }: { items: KpiMetric[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.label} className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="eyebrow">{item.label}</p>
            {item.helper ? <InfoTooltip description={item.helper} /> : null}
          </div>
          <p className="mt-3 text-3xl font-semibold">{item.value}</p>
          {item.insight ? <p className="mt-3 text-xs font-semibold text-blue-600">{item.insight}</p> : null}
        </article>
      ))}
    </section>
  );
}

