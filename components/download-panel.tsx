"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { DashboardData } from "@/lib/aggregation";
import { RoleKey } from "@/lib/types";
import { ROLES } from "@/lib/roles";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]/gi, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function sanitizeSheetName(value: string) {
  return value
    .replace(/[\\\/?*\[\]]/g, "_")
    .slice(0, 31)
    .trim() || "Sheet";
}

function buildSheetData(
  title: string,
  scopeLabel: string,
  scopePath: string[],
  kpis: { label: string; value: string }[],
  rows: Array<Record<string, string | number>>
) {
  const data: Array<Array<string | number>> = [];
  data.push([title]);
  data.push([`Scope: ${scopeLabel}`]);
  if (scopePath.length > 0) {
    data.push([`Path: ${scopePath.join(" / ")}`]);
  }
  data.push([]);
  if (kpis.length > 0) {
    kpis.forEach((kpi) => {
      data.push([kpi.label, kpi.value]);
    });
    data.push([]);
  }

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]);
    data.push(headers);
    rows.forEach((row) => {
      data.push(headers.map((header) => row[header]));
    });
  } else {
    data.push(["No records available for this sheet."]);
  }

  return data;
}

function downloadWorkbook(filename: string, sheets: Array<{ name: string; data: Array<Array<string | number>> }>) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheet.name));
  });

  const workbookArray = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([workbookArray], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function groupRows(rows: DashboardData["drilldown"], key: (row: DashboardData["drilldown"][number]) => string) {
  const groups = new Map<string, typeof rows>();
  rows.forEach((row) => {
    const label = key(row) || "unknown";
    const group = groups.get(label) ?? [];
    group.push(row);
    groups.set(label, group);
  });
  return Array.from(groups.entries()).map(([groupLabel, groupRows]) => ({ groupLabel, groupRows }));
}

function buildRow(record: DashboardData["drilldown"][number]) {
  return {
    Scope: record.scopeName,
    University: record.universityName,
    Campus: record.campusName,
    Institute: record.instituteName,
    Department: record.departmentName,
    Industry: record.industryName,
    "Thrust area": record.thrustArea,
    Status: record.status,
    "MoU date": record.mouDate,
    Internships: record.internships,
    Placements: record.placements
  };
}

export function DownloadPanel({ role, data }: { role: RoleKey; data: DashboardData }) {
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedInstituteId, setSelectedInstituteId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const canDownload = role !== ROLES.DEPARTMENT_COORDINATOR;
  const canSend = role === ROLES.DEPARTMENT_COORDINATOR;

  const campusOptions = data.hierarchy.campusOptions;
  const instituteOptions = data.hierarchy.instituteOptions;
  const departmentOptions = data.hierarchy.departmentOptions;

  const eligibleRows = useMemo(() => {
    let rows = data.drilldown;
    if (role === ROLES.INSTITUTE_COORDINATOR && selectedDepartmentId) {
      rows = rows.filter((row) => row.departmentName === departmentOptions.find((option) => option.id === selectedDepartmentId)?.label || row.departmentName);
    }
    if (role === ROLES.CAMPUS_COORDINATOR && selectedInstituteId) {
      rows = rows.filter((row) => row.instituteName === instituteOptions.find((option) => option.id === selectedInstituteId)?.label || row.instituteName);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedCampusId) {
      rows = rows.filter((row) => row.campusName === campusOptions.find((option) => option.id === selectedCampusId)?.label || row.campusName);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedInstituteId) {
      rows = rows.filter((row) => row.instituteName === instituteOptions.find((option) => option.id === selectedInstituteId)?.label || row.instituteName);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedDepartmentId) {
      rows = rows.filter((row) => row.departmentName === departmentOptions.find((option) => option.id === selectedDepartmentId)?.label || row.departmentName);
    }
    return rows;
  }, [data.drilldown, role, selectedCampusId, selectedInstituteId, selectedDepartmentId, campusOptions, instituteOptions, departmentOptions]);

  const reportKpis = useMemo(() => data.kpis.map((item) => ({ label: item.label, value: item.value })), [data.kpis]);
  const currentScopeLabel = data.hierarchy.scopeLabel;

  function createAndDownloadWorkbook(filenamePrefix: string, sheets: Array<{ name: string; rows: DashboardData["drilldown"] }>) {
    const filename = `${sanitizeFileName(filenamePrefix)}.xlsx`;
    const workbookSheets = sheets.map((sheet) => ({
      name: sheet.name,
      data: buildSheetData(
        `${currentScopeLabel} report`,
        sheet.name,
        data.hierarchy.scopePath,
        reportKpis,
        sheet.rows.map(buildRow)
      )
    }));
    downloadWorkbook(filename, workbookSheets);
  }

  function handleDownload() {
    if (!canDownload) {
      return;
    }

    setIsDownloading(true);
    try {
      if (role === ROLES.INSTITUTE_COORDINATOR) {
        if (selectedDepartmentId) {
          const department = departmentOptions.find((option) => option.id === selectedDepartmentId);
          const sheetName = department?.label ?? selectedDepartmentId;
          createAndDownloadWorkbook(`${currentScopeLabel}_${sheetName}`, [
            { name: sheetName, rows: eligibleRows }
          ]);
        } else {
          const groups = groupRows(eligibleRows, (row) => row.departmentName);
          createAndDownloadWorkbook(`${currentScopeLabel}_departments`, groups.map(({ groupLabel, groupRows }) => ({ name: groupLabel, rows: groupRows })));
        }
      } else if (role === ROLES.CAMPUS_COORDINATOR) {
        if (selectedInstituteId) {
          const institute = instituteOptions.find((option) => option.id === selectedInstituteId);
          const sheetName = institute?.label ?? selectedInstituteId;
          createAndDownloadWorkbook(`${currentScopeLabel}_${sheetName}`, [
            { name: sheetName, rows: eligibleRows }
          ]);
        } else {
          const groups = groupRows(eligibleRows, (row) => row.instituteName);
          createAndDownloadWorkbook(`${currentScopeLabel}_institutes`, groups.map(({ groupLabel, groupRows }) => ({ name: groupLabel, rows: groupRows })));
        }
      } else {
        const selectedGroup = selectedDepartmentId || selectedInstituteId || selectedCampusId;
        if (selectedGroup) {
          const selectedLabel =
            selectedDepartmentId
              ? departmentOptions.find((option) => option.id === selectedDepartmentId)?.label ?? selectedDepartmentId
              : selectedInstituteId
              ? instituteOptions.find((option) => option.id === selectedInstituteId)?.label ?? selectedInstituteId
              : campusOptions.find((option) => option.id === selectedCampusId)?.label ?? selectedCampusId;
          createAndDownloadWorkbook(`${currentScopeLabel}_${selectedLabel}`, [
            { name: selectedLabel, rows: eligibleRows }
          ]);
        } else {
          const groups = groupRows(eligibleRows, (row) => row.campusName);
          if (groups.length > 1) {
            createAndDownloadWorkbook(`${currentScopeLabel}_campuses`, groups.map(({ groupLabel, groupRows }) => ({ name: groupLabel, rows: groupRows })));
          } else {
            createAndDownloadWorkbook(currentScopeLabel, [
              { name: currentScopeLabel, rows: eligibleRows }
            ]);
          }
        }
      }
    } finally {
      setIsDownloading(false);
    }
  }

  function handleSendReport() {
    const subject = encodeURIComponent(`Collaboration report from ${currentScopeLabel}`);
    const body = encodeURIComponent(`Please review the collaboration report for ${currentScopeLabel}.

Scope path: ${data.hierarchy.scopePath.join(" / ")}

Total records: ${data.drilldown.length}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <section className="panel p-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="eyebrow">Download report</p>
          <h2 className="mt-2 text-2xl font-semibold">Export current hierarchy data</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {canDownload
              ? "Pick the applicable scope and download the report as an XLSX workbook. Campus and institute heads can export separate sheets by unit."
              : "Download is disabled for department coordinators. Use the send report action instead."}
          </p>
        </div>

        {role !== ROLES.DEPARTMENT_COORDINATOR ? (
          <div className="grid gap-3 md:grid-cols-3">
            {role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN ? (
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                value={selectedCampusId}
                onChange={(event) => {
                  setSelectedCampusId(event.target.value);
                  setSelectedInstituteId("");
                  setSelectedDepartmentId("");
                }}
              >
                <option value="">All campuses</option>
                {campusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {(role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN || role === ROLES.CAMPUS_COORDINATOR) ? (
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                value={selectedInstituteId}
                onChange={(event) => {
                  setSelectedInstituteId(event.target.value);
                  setSelectedDepartmentId("");
                }}
              >
                <option value="">All institutes</option>
                {instituteOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            {(role === ROLES.INSTITUTE_COORDINATOR || role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) ? (
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                value={selectedDepartmentId}
                onChange={(event) => setSelectedDepartmentId(event.target.value)}
              >
                <option value="">All departments</option>
                {departmentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {canDownload ? (
            <button
              type="button"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isDownloading || data.drilldown.length === 0}
              onClick={handleDownload}
            >
              {isDownloading ? "Preparing download…" : "Download report"}
            </button>
          ) : null}
          {canSend ? (
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={handleSendReport}
            >
              Send report
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
