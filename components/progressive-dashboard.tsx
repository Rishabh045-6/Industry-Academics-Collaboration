"use client";

import { useState } from "react";
import { ChartsPanel } from "@/components/charts-panel";
import { DrilldownTable } from "@/components/drilldown-table";
import { InfoTooltip } from "@/components/info-tooltip";
import { KpiGrid } from "@/components/kpi-grid";
import { DashboardData } from "@/lib/aggregation";
import { RoleKey } from "@/lib/types";
import { ROLES } from "@/lib/roles";

function SummaryCard({
  label,
  value,
  helper,
  onClick
}: {
  label: string;
  value: string;
  helper: string;
  onClick: () => void;
}) {
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="panel p-5 text-left transition hover:border-secondary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-secondary/30"
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="eyebrow">{label}</p>
        <InfoTooltip description={helper} />
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function ProgressiveDashboard({
  role,
  data,
  includeTable = true
}: {
  role: RoleKey;
  data: DashboardData;
  includeTable?: boolean;
}) {
  const isHighLevelRole =
    role === ROLES.INSTITUTE_COORDINATOR ||
    role === ROLES.CAMPUS_COORDINATOR ||
    role === ROLES.DEPUTY_DIRECTOR ||
    role === ROLES.VICE_CHANCELLOR ||
    role === ROLES.CORPORATE_RELATIONS_DIRECTOR;

  const [showDetails, setShowDetails] = useState(!isHighLevelRole);
  const summaryKpis = data.kpis.filter((item) =>
    ["Total collaborations", "Internships", "Placements", "Total industries"].includes(item.label)
  );

  if (data.kpis[0]?.value === "0") {
    return (
      <section className="panel p-6">
        <p className="eyebrow text-blue-600">No data available</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">No collaboration records match this scope yet</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Try clearing one or more filters, or confirm that your current role has an assigned scope with collaboration records.
        </p>
      </section>
    );
  }

  const insightsBlock = (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.insights.map((insight) => (
        <article key={insight.title} className="panel p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="eyebrow text-blue-600">{insight.title}</p>
            <InfoTooltip description={insight.helper} />
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-900">{insight.value}</p>
        </article>
      ))}
    </section>
  );

  if (!isHighLevelRole) {
    return (
      <>
        {data.insights.length > 0 ? insightsBlock : null}
        <KpiGrid items={data.kpis} />
        <ChartsPanel
          activeStatus={data.charts.activeStatus}
          thrustArea={data.charts.thrustArea}
          comparison={data.charts.comparison}
          activity={data.charts.activity}
          trends={data.charts.trends}
          performers={data.charts.performers}
          meta={data.chartMeta}
        />
        {includeTable ? <DrilldownTable rows={data.drilldown} /> : null}
      </>
    );
  }

  return (
    <>
      <section className="space-y-4">
        <div className="panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-blue-600">Summary first</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{data.chartMeta.summaryTitle}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{data.chartMeta.summaryDescription}</p>
            </div>
            {!showDetails ? (
              <button
                className="primary-button"
                onClick={() => setShowDetails(true)}
                type="button"
              >
                View details
              </button>
            ) : (
              <button
                className="secondary-button"
                onClick={() => setShowDetails(false)}
                type="button"
              >
                Hide details
              </button>
            )}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Current level: <span className="font-semibold text-ink">{data.hierarchy.scopeLabel}</span>
            {data.hierarchy.scopePath.length > 0 ? ` (${data.hierarchy.scopePath.join(" / ")})` : ""}
          </p>
        </div>

        {data.insights.length > 0 ? insightsBlock : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryKpis.map((item) => (
            <SummaryCard key={item.label} label={item.label} value={item.value} helper={item.insight ?? item.helper} onClick={() => setShowDetails(true)} />
          ))}
        </section>
      </section>

      {showDetails ? (
        <section className="space-y-4">
          <ChartsPanel
            activeStatus={data.charts.activeStatus}
            thrustArea={data.charts.thrustArea}
            comparison={data.charts.comparison}
            activity={data.charts.activity}
            trends={data.charts.trends}
            performers={data.charts.performers}
            meta={data.chartMeta}
          />

          <section className="panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-blue-600">Top industries</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{data.chartMeta.topIndustriesTitle}</h3>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {data.topIndustries.length > 0 ? (
                data.topIndustries.map((industry, index) => (
                  <div key={industry.name} className="flex items-center justify-between rounded-2xl bg-[#EFF6FF] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {index + 1}. {industry.name}
                      </p>
                      <p className="text-xs text-slate-500">Collaboration count</p>
                    </div>
                    <p className="text-lg font-semibold text-blue-600">{industry.value}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#EFF6FF] px-4 py-6 text-sm text-slate-700">No summary data available for the current scope and filters.</p>
              )}
            </div>
          </section>

          {includeTable ? <DrilldownTable rows={data.drilldown} /> : null}
        </section>
      ) : null}
    </>
  );
}
