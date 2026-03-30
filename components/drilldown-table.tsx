import Link from "next/link";
import { DrilldownRow } from "@/lib/types";

export function DrilldownTable({ rows }: { rows: DrilldownRow[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="eyebrow">Drill-down table</p>
        <h3 className="mt-2 text-xl font-semibold">Progressive hierarchy review</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surf">
            <tr>
              <th className="px-5 py-4">Scope</th>
              <th className="px-5 py-4">University</th>
              <th className="px-5 py-4">Campus</th>
              <th className="px-5 py-4">Institute</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Industry</th>
              <th className="px-5 py-4">Thrust area</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">MoU date</th>
              <th className="px-5 py-4">Internships</th>
              <th className="px-5 py-4">Placements</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.scopeId} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold text-ink">
                  <Link href={`/collaborations/${row.scopeId}`}>{row.scopeName}</Link>
                </td>
                <td className="px-5 py-4">{row.universityName}</td>
                <td className="px-5 py-4">{row.campusName}</td>
                <td className="px-5 py-4">{row.instituteName}</td>
                <td className="px-5 py-4">{row.departmentName}</td>
                <td className="px-5 py-4">{row.industryName}</td>
                <td className="px-5 py-4">{row.thrustArea}</td>
                <td className="px-5 py-4">{row.status}</td>
                <td className="px-5 py-4">{row.mouDate}</td>
                <td className="px-5 py-4">{row.internships}</td>
                <td className="px-5 py-4">{row.placements}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr className="border-t border-slate-100">
                <td className="px-5 py-8 text-slate-500" colSpan={11}>
                  No drill-down records found for your scope.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
