import Link from "next/link";
import { CollaborationListItem } from "@/lib/collaborations";

export function RecordTable({ rows }: { rows: CollaborationListItem[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="eyebrow">Collaboration list</p>
        <h2 className="mt-2 text-2xl font-semibold">Department-entered records</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surf">
            <tr>
              <th className="px-5 py-4">Industry</th>
              <th className="px-5 py-4">Thrust area</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">MoU date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Internships</th>
              <th className="px-5 py-4">Placements</th>
              <th className="px-5 py-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold">
                  <Link href={`/collaborations/${item.id}`}>{item.industryName}</Link>
                </td>
                <td className="px-5 py-4">{item.thrustArea}</td>
                <td className="px-5 py-4">{item.departmentName}</td>
                <td className="px-5 py-4">{item.mouDate}</td>
                <td className="px-5 py-4">{item.isActive ? "Active" : "Inactive"}</td>
                <td className="px-5 py-4">{item.internships}</td>
                <td className="px-5 py-4">{item.placements}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/collaborations/${item.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr className="border-t border-slate-100">
                <td className="px-5 py-8 text-slate-500" colSpan={7}>
                  No collaboration records match your current scope or filters yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
