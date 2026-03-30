"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { InfoTooltip } from "./info-tooltip";

const piePalette = ["#2563eb", "#0f172a", "#60a5fa", "#94a3b8", "#cbd5e1", "#38bdf8"];

function truncateLabel(value: string, max = 18) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatMonthLabel(value: string) {
  if (!value || value === "Unknown") {
    return value;
  }

  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(date);
}

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function formatLakhs(value: number) {
  return `${Math.round(value / 100000)}L`;
}

function buildPieData(data: { name: string; value: number }[], maxSlices = 5, minShare = 0.06) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const sorted = [...data].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

  const major = sorted.filter((item, index) => index < maxSlices - 1 && (total ? item.value / total >= minShare : true));
  const remainder = sorted.filter((item) => !major.includes(item));
  const othersValue = remainder.reduce((sum, item) => sum + item.value, 0);
  const result = othersValue > 0 ? [...major, { name: "Others", value: othersValue }] : major;

  return result.map((item) => ({
    ...item,
    shortName: truncateLabel(item.name, 18),
    percentage: total ? (item.value / total) * 100 : 0
  }));
}

const chartDescriptions: Record<string, string> = {
  "Status split": "Shows how many collaborations are currently active versus inactive in the selected scope.",
  "Thrust mix": "Breaks down current collaborations by thrust area to highlight where collaboration effort is concentrated.",
  "Comparison": "Compares funding amounts across the chosen groups in the current scope, displayed in lakhs.",
  "Activity mix": "Shows faculty and student activity counts across collaboration categories in the current scope.",
  "Trend view": "Tracks MoUs, research grant amounts, and consultancy amounts over time in the selected scope.",
  "Top performers": "Ranks the top partners by internship and placement contributions within the current scope."
};

function ChartCard({ eyebrow, title, info, children, className = "" }: { eyebrow: string; title: string; info?: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`panel p-6 ${className}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-blue-600">{eyebrow}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">{title}</h3>
        </div>
        {info ? <InfoTooltip description={info} /> : null}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function PieLegend({ payload }: { payload?: Array<{ color?: string; payload?: { shortName?: string; name: string; value: number; percentage?: number } }> }) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
      {payload.map((entry) => (
        <div key={entry.payload?.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="truncate font-medium text-slate-700">{entry.payload?.shortName ?? entry.payload?.name}</span>
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {entry.payload?.value} ({Math.round(entry.payload?.percentage ?? 0)}%)
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: { name: string; value: number; percentage?: number } }> }) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
      <p className="text-xs text-slate-600">{item.value} records</p>
      <p className="text-xs text-slate-500">{Math.round(item.percentage ?? 0)}% of current scope</p>
    </div>
  );
}

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; dataKey?: string }>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{formatMonthLabel(label ?? "")}</p>
      {payload.map((item) => {
        const itemName = item.dataKey === "mous" ? "MoUs" : item.dataKey === "grants" ? "Research grants" : "Consultancy";
        const itemValue = item.dataKey === "mous" ? Number(item.value ?? 0).toLocaleString("en-IN") : formatCurrency(Number(item.value ?? 0));

        return (
          <p key={String(item.dataKey ?? item.name)} className="text-xs text-slate-600">
            {itemName}: {itemValue}
          </p>
        );
      })}
    </div>
  );
}

function DefaultTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-xs text-slate-600">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function ComparisonTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: { name: string; value: number } }> }) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
      <p className="text-xs text-slate-600">Funding: {formatLakhs(item.value)}</p>
      <p className="text-xs text-slate-500">Each unit on the y-axis represents 1 lakh.</p>
    </div>
  );
}

function ChartPlaceholder({ message }: { message: string }) {
  return (
    <div className="h-72 flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

export function ChartsPanel({
  activeStatus,
  thrustArea,
  comparison,
  activity,
  trends,
  performers,
  meta,
  showTrend = true
}: {
  activeStatus: { name: string; value: number }[];
  thrustArea: { name: string; value: number }[];
  comparison: { name: string; value: number }[];
  activity: { name: string; faculty: number; students: number }[];
  trends: { month: string; mous: number; grants: number; consultancy: number }[];
  performers: { name: string; score: number }[];
  meta: {
    activeStatusTitle: string;
    thrustAreaTitle: string;
    comparisonTitle: string;
    comparisonAxisLabel: string;
    activityTitle: string;
    trendsTitle: string;
    performersTitle: string;
  };
  showTrend?: boolean;
}) {
  const activeStatusData = buildPieData(activeStatus, 4);
  const thrustAreaData = buildPieData(thrustArea, 5);
  const hasActiveStatusData = activeStatusData.some((item) => item.value > 0);
  const hasThrustAreaData = thrustAreaData.some((item) => item.value > 0);
  const hasComparisonData = comparison.some((item) => item.value > 0);
  const hasActivityData = activity.some((item) => item.faculty > 0 || item.students > 0);
  const hasTrendData = trends.some((item) => item.mous > 0 || item.grants > 0 || item.consultancy > 0);
  const hasPerformersData = performers.some((item) => item.score > 0);

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <ChartCard eyebrow="Status split" title={meta.activeStatusTitle} info={chartDescriptions["Status split"]}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {hasActiveStatusData ? (
              <PieChart>
                <Pie
                  data={activeStatusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="70%"
                  paddingAngle={2}
                  labelLine={false}
                  minAngle={8}
                >
                  {activeStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend verticalAlign="bottom" align="center" content={<PieLegend />} />
              </PieChart>
            ) : (
              <ChartPlaceholder message="No status data available for the current scope." />
            )}
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard eyebrow="Thrust mix" title={meta.thrustAreaTitle} info={chartDescriptions["Thrust mix"]}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {hasThrustAreaData ? (
              <PieChart>
                <Pie
                  data={thrustAreaData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  paddingAngle={2}
                  labelLine={false}
                  minAngle={8}
                >
                  {thrustAreaData.map((entry, index) => (
                    <Cell key={entry.name} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend verticalAlign="bottom" align="center" content={<PieLegend />} />
              </PieChart>
            ) : (
              <ChartPlaceholder message="No thrust area data available for the current scope." />
            )}
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard eyebrow="Comparison" title={meta.comparisonTitle} info={chartDescriptions["Comparison"]}>
        <div className="h-72">
          {hasComparisonData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ top: 8, right: 10, left: 0, bottom: 12 }} barCategoryGap="26%">
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickFormatter={(value) => truncateLabel(String(value), 14)} interval={0} angle={-10} textAnchor="end" height={58}>
                  <Label value={meta.comparisonAxisLabel} offset={-4} position="insideBottom" />
                </XAxis>
                <YAxis stroke="#64748b" allowDecimals={false} width={60} tickFormatter={(value) => formatLakhs(Number(value))}>
                  <Label value="Funding (Lakhs)" angle={-90} position="insideLeft" style={{ textAnchor: "middle" }} />
                </YAxis>
                <Tooltip content={<ComparisonTooltip />} />
                <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} maxBarSize={46} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder message="No comparison data available for the current scope." />
          )}
        </div>
      </ChartCard>

      <ChartCard eyebrow="Top performers" title={meta.performersTitle} info={chartDescriptions["Top performers"]}>
        <div className="h-72">
          {hasPerformersData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performers} margin={{ top: 8, right: 10, left: 0, bottom: 12 }} barCategoryGap="24%">
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickFormatter={(value) => truncateLabel(String(value), 14)} interval={0} angle={-10} textAnchor="end" height={58} />
                <YAxis stroke="#64748b" allowDecimals={false} width={52} />
                <Tooltip content={<DefaultTooltip />} />
                <Bar dataKey="score" fill="#2563eb" radius={[10, 10, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder message="No performer outcome data available for the current scope." />
          )}
        </div>
      </ChartCard>

      <ChartCard eyebrow="Activity mix" title={meta.activityTitle} info={chartDescriptions["Activity mix"]}>
        <div className="h-72">
          {hasActivityData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} barCategoryGap="24%">
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} width={44}>
                  <Label value="Activity count" angle={-90} position="insideLeft" style={{ textAnchor: "middle" }} />
                </YAxis>
                <Tooltip content={<DefaultTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Bar dataKey="faculty" stackId="activities" fill="#0f172a" radius={[10, 10, 0, 0]} maxBarSize={42} />
                <Bar dataKey="students" stackId="activities" fill="#60a5fa" radius={[10, 10, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder message="No activity data available for the current scope." />
          )}
        </div>
      </ChartCard>

      {showTrend ? (
        <ChartCard eyebrow="Trend view" title={meta.trendsTitle} className="xl:col-span-2" info={chartDescriptions["Trend view"]}>
          <div className="h-80">
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trends} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#cbd5e1" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" tickFormatter={formatMonthLabel}>
                    <Label value="Month" offset={-2} position="insideBottom" />
                  </XAxis>
                  <YAxis yAxisId="amount" orientation="right" stroke="#2563eb" tickFormatter={(value) => formatLakhs(Number(value))} width={52}>
                    <Label value="Amount (Lakhs)" angle={90} position="insideRight" style={{ textAnchor: "middle" }} />
                  </YAxis>
                  <Tooltip content={<TrendTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(value) => (value === "grants" ? "Research grants" : "Consultancy")} />
                  <Line yAxisId="amount" type="monotone" dataKey="grants" name="Research grants" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                  <Line yAxisId="amount" type="monotone" dataKey="consultancy" name="Consultancy" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder message="No trend data available for the current scope." />
            )}
          </div>
        </ChartCard>
      ) : null}
    </section>
  );
}
