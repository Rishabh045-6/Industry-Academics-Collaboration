"use client";

import { CollaborationListItem } from "@/lib/collaborations";

function escapeCsv(value: string | number | boolean | null | undefined) {
  if (value == null) {
    return "";
  }
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(rows: CollaborationListItem[]) {
  const headers = [
    "Industry",
    "Thrust area",
    "Department",
    "MoU date",
    "Status",
    "Internships",
    "Placements"
  ];

  const lines = [headers.map(escapeCsv).join(",")];

  rows.forEach((row) => {
    lines.push(
      [
        escapeCsv(row.industryName),
        escapeCsv(row.thrustArea),
        escapeCsv(row.departmentName),
        escapeCsv(row.mouDate),
        escapeCsv(row.isActive ? "Active" : "Inactive"),
        escapeCsv(row.internships),
        escapeCsv(row.placements)
      ].join(",")
    );
  });

  return lines.join("\n");
}

export function CollaborationDownloadButton({ rows }: { rows: CollaborationListItem[] }) {
  function handleDownload() {
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "collaboration-records.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="primary-button"
    >
      Download records
    </button>
  );
}
