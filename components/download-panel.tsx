"use client";

import { useMemo, useState } from "react";
import { DashboardData } from "@/lib/aggregation";
import { RoleKey } from "@/lib/types";
import { ROLES } from "@/lib/roles";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]/gi, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
}

function sanitizeSheetName(value: string) {
  return value
    .replace(/[\\/?*[\]]/g, "_")
    .slice(0, 31)
    .trim() || "Sheet";
}

function buildScopeSectionData(
  title: string,
  sheetLabel: string,
  scopePath: string[],
  groups: Array<{
    scopeLabel: string;
    rows: Array<Record<string, string | number>>;
    summary: Array<{ label: string; value: string | number }>;
  }>
) {
  const data: Array<Array<string | number>> = [];
  data.push([title]);
  data.push([`Sheet: ${sheetLabel}`]);
  if (scopePath.length > 0) {
    data.push([`Path: ${scopePath.join(" / ")}`]);
  }
  data.push([]);

  groups.forEach((group, index) => {
    data.push([`Scope: ${group.scopeLabel}`]);
    group.summary.forEach((item) => {
      data.push([item.label, item.value]);
    });
    data.push([]);

    if (group.rows.length > 0) {
      const headers = Object.keys(group.rows[0]);
      data.push(headers);
      group.rows.forEach((row) => {
        data.push(headers.map((header) => row[header]));
      });
    } else {
      data.push(["No records available for this scope."]);
    }

    if (index < groups.length - 1) {
      data.push([]);
      data.push([]);
    }
  });

  return data;
}

function computeColumnWidths(data: Array<Array<string | number>>) {
  const widths: number[] = [];
  const wideColumnNames = new Set([
    "Consultancy amount",
    "Research grant amount",
    "Consultancy projects",
    "Research grants",
    "Thrust area"
  ]);

  data.forEach((row) => {
    row.forEach((cell, index) => {
      const value = String(cell ?? "");
      const length = value.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
      const baseWidth = wideColumnNames.has(value) ? 24 : 12;
      const maxWidth = wideColumnNames.has(value) ? 48 : 34;
      const width = Math.min(Math.max(length + 3, baseWidth), maxWidth);
      widths[index] = Math.max(widths[index] ?? 0, width);
    });
  });

  return widths.map((width) => ({ wch: width || 12 }));
}

function safeMergeCells(worksheet: any, startRow: number, startCol: number, endRow: number, endCol: number) {
  if (startRow > endRow || startCol > endCol) {
    return;
  }
  try {
    worksheet.mergeCells(startRow, startCol, endRow, endCol);
  } catch (error: any) {
    if (error?.message?.includes("Cannot merge already merged cells")) {
      return;
    }
    throw error;
  }
}

function normalizeInstituteDisplayName(name: string) {
  if (name.includes("Leadership and Management Studi")) {
    return "T. A. Pai Management Institute (TAPMI), Bangalore";
  }

  return name;
}

function makeUniqueSheetName(name: string, usedNames: Set<string>) {
  const baseName = sanitizeSheetName(normalizeInstituteDisplayName(name));
  let uniqueName = baseName;
  let suffix = 1;

  while (usedNames.has(uniqueName)) {
    const suffixText = `_${suffix}`;
    uniqueName = `${baseName.slice(0, 31 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  usedNames.add(uniqueName);
  return uniqueName;
}

function getRowKind(row: Array<string | number>) {
  const firstCell = String(row[0] ?? "");
  if (row.length === 0) return "blank";
  if (firstCell.startsWith("Sheet: ") || firstCell.startsWith("Path: ")) return "info";
  if (firstCell.startsWith("Scope: ")) return "scope";
  if (row.length === 2 && !firstCell.startsWith("No records")) return "summary";
  if (row.length > 3 && row.every((cell) => String(cell ?? "").trim() !== "")) return "header";
  return "body";
}

async function downloadWorkbook(filename: string, sheets: Array<{ name: string; data: Array<Array<string | number>> }>) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const usedNames = new Set<string>();
  const headerFills = ["FED7AA", "DBEAFE", "DCFCE7", "FEF3C7", "FFE4E6"];
  const headerFonts = ["7C2D12", "1E3A8A", "166534", "92400E", "9F1239"];

  const border = {
    top: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
    left: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin" as const, color: { argb: "FFCBD5E1" } },
    right: { style: "thin" as const, color: { argb: "FFCBD5E1" } }
  };

  const applyRowBase = (row: any, fill: string, fontColor = "0F172A", bold = false) => {
    row.eachCell({ includeEmpty: true }, (cell: any) => {
      cell.border = border;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${fill}` } };
      cell.font = { name: "Calibri", size: 11, bold, color: { argb: `FF${fontColor}` } };
      cell.alignment = { vertical: "middle", wrapText: false };
    });
  };

  sheets.forEach((sheet) => {
    const worksheet = workbook.addWorksheet(makeUniqueSheetName(sheet.name, usedNames));
    const widths = computeColumnWidths(sheet.data);
    const multilineColumns = new Set<number>();
    const researchGrantColumns = new Set<number>();
    let bodyStripeIndex = 0;
    let maxColumns = Math.max(...sheet.data.map((row) => row.length), 1);
    const researchGrantHeaderIndex = sheet.data.find((row) => row.includes("Research grants"));
    if (researchGrantHeaderIndex) {
      const grantsColumn = researchGrantHeaderIndex.findIndex((cell) => cell === "Research grants");
      if (grantsColumn >= 0) {
        maxColumns = Math.max(maxColumns, grantsColumn + 5);
      }
    }

    for (let columnNumber = 1; columnNumber <= maxColumns; columnNumber += 1) {
      worksheet.getColumn(columnNumber).width = widths[columnNumber - 1]?.wch ?? 12;
    }

    sheet.data.forEach((rowData, rowIndex) => {
      const row = worksheet.addRow(rowData);
      const kind = getRowKind(rowData);

      row.height = rowIndex === 0 ? 22 : kind === "blank" ? 9 : kind === "scope" ? 22 : 20;

      if (kind === "blank") {
        return;
      }

      if (rowIndex === 0) {
        worksheet.mergeCells(row.number, 1, row.number, maxColumns);
        applyRowBase(row, "FFEDD5", "9A3412", true);
        return;
      }

      if (kind === "info") {
        worksheet.mergeCells(row.number, 1, row.number, maxColumns);
        applyRowBase(row, "FFEDD5", "9A3412", true);
        return;
      }

      if (kind === "scope") {
        const mergeAcross = Math.max(Math.min(maxColumns, 6), 1);
        if (mergeAcross > 1) {
          worksheet.mergeCells(row.number, 1, row.number, mergeAcross);
        }
        applyRowBase(row, "EA580C", "FFFFFF", true);
        row.getCell(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
        return;
      }

      if (kind === "summary") {
        row.getCell(1).border = border;
        row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF7ED" } };
        row.getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF7C2D12" } };
        row.getCell(1).alignment = { vertical: "middle", wrapText: false };

        row.getCell(2).border = border;
        row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFBEB" } };
        row.getCell(2).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
        row.getCell(2).alignment = { vertical: "middle", wrapText: false };
        return;
      }

      if (kind === "header") {
        row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
          const colorIndex = (colNumber - 1) % headerFills.length;
          cell.border = border;
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${headerFills[colorIndex]}` } };
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: `FF${headerFonts[colorIndex]}` } };
          cell.alignment = { vertical: "middle", wrapText: false };

          const headerValue = String(rowData[colNumber - 1] ?? "");
          if (headerValue === "Consultancy projects" || headerValue === "Research grants") {
            multilineColumns.add(colNumber);
            worksheet.getColumn(colNumber).width = Math.max(worksheet.getColumn(colNumber).width ?? 12, 56);
            researchGrantColumns.add(colNumber);
            const endColumn = Math.min(colNumber + 4, maxColumns);
            if (endColumn > colNumber) {
              safeMergeCells(worksheet, row.number, colNumber, row.number, endColumn);
            }
          }
        });
        return;
      }

      const fill = bodyStripeIndex % 2 === 0 ? "FFFFFF" : "FFF7ED";
      bodyStripeIndex += 1;
      applyRowBase(row, fill);
      row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
        const isMultiline = multilineColumns.has(colNumber);
        cell.alignment = { vertical: "top", wrapText: isMultiline };
        if (isMultiline) {
          cell.font = { name: "Calibri", size: 11, color: { argb: "FF9A3412" } };
        }
      });
      researchGrantColumns.forEach((colNumber) => {
        const endColumn = Math.min(colNumber + 4, maxColumns);
        if (endColumn > colNumber) {
          safeMergeCells(worksheet, row.number, colNumber, row.number, endColumn);
        }
      });
      if (Array.from(multilineColumns).some((colNumber) => String(row.getCell(colNumber).value ?? "").includes("\n"))) {
        row.height = 42;
      }
    });
  });

  const workbookBuffer = await workbook.xlsx.writeBuffer();
  const blob = new globalThis.Blob([workbookBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.replace(/\.xml$/i, ".xlsx");
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatCurrencyValue(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function formatProjects(items: Array<{ title: string; amount: number; fundingAgency?: string }>) {
  if (items.length === 0) {
    return "None";
  }

  return items
    .map((item) =>
      item.fundingAgency
        ? `${item.title} (${item.fundingAgency}) - ${formatCurrencyValue(item.amount)}`
        : `${item.title} - ${formatCurrencyValue(item.amount)}`
    )
    .join("\n");
}

function buildLabel(name: string, code?: string) {
  const normalizedName = normalizeInstituteDisplayName(name);
  if (code && name.includes(`(${code})`)) {
    return normalizedName;
  }
  return code ? `${normalizedName} (${code})` : normalizedName;
}

function getSharedValue(records: DashboardData["records"], getValue: (record: DashboardData["records"][number]) => string) {
  if (records.length === 0) {
    return "";
  }

  const firstValue = getValue(records[0]);
  return records.every((record) => getValue(record) === firstValue) ? firstValue : "";
}

function buildReadableScopeLabel(records: DashboardData["records"], level: "campus" | "institute" | "department") {
  if (records.length === 0) {
    return "Scope";
  }

  const record = records[0];

  if (level === "department") {
    return `Department - ${buildLabel(record.departmentName, record.departmentCode)}`;
  }

  if (level === "institute") {
    return `Institute - ${buildLabel(record.instituteName, record.instituteCode)}`;
  }

  return `Campus - ${record.campusName}`;
}

function buildFullRecordRow(
  record: DashboardData["records"][number],
  options: {
    includeUniversity: boolean;
    includeCampus: boolean;
    includeInstitute: boolean;
    includeDepartment: boolean;
  }
) {
  const row: Record<string, string | number> = {};

  if (options.includeUniversity) {
    row.University = record.universityName;
  }
  if (options.includeCampus) {
    row.Campus = record.campusName;
  }
  if (options.includeInstitute) {
    row.Institute = buildLabel(record.instituteName, record.instituteCode);
  }
  if (options.includeDepartment) {
    row.Department = buildLabel(record.departmentName, record.departmentCode);
  }

  return {
    ...row,
    Industry: record.industryName,
    "Thrust area": record.thrustArea,
    "MoU date": record.mouDate,
    "Duration (months)": record.durationMonths,
    Status: record.isActive ? "Active" : "Inactive",
    Academic: record.academicActivities,
    "New courses": record.newCourses,
    "Case studies": record.caseStudies,
    "Partial delivery": record.partialDelivery,
    "Consultancy count": record.consultancyCount,
    "Consultancy amount": formatCurrencyValue(record.consultancyAmount),
    "Research grant count": record.researchGrantCount,
    "Research grant amount": formatCurrencyValue(record.researchGrantAmount),
    "CSR fund": formatCurrencyValue(record.csrFund),
    "Centres of excellence": record.centresOfExcellence,
    "Innovation labs": record.innovationLabs,
    "Student projects": record.studentProjects,
    Internships: record.internships,
    Placements: record.placements,
    "Faculty trainings": record.faculty.trainings,
    "Faculty seminars": record.faculty.seminars,
    "Faculty workshops": record.faculty.workshops,
    "Faculty conferences": record.faculty.conferences,
    "Student trainings": record.students.trainings,
    "Student seminars": record.students.seminars,
    "Student workshops": record.students.workshops,
    "Student conferences": record.students.conferences,
    "Consultancy projects": formatProjects(record.consultancyProjects),
    "Research grants": formatProjects(record.researchGrants)
  };
}

function buildScopeSummary(records: DashboardData["records"]) {
  const activeCount = records.filter((record) => record.isActive).length;
  const industries = new Set(records.map((record) => record.industryId).filter(Boolean));
  const consultancyAmount = records.reduce((sum, record) => sum + record.consultancyAmount, 0);
  const grantAmount = records.reduce((sum, record) => sum + record.researchGrantAmount, 0);
  const internships = records.reduce((sum, record) => sum + record.internships, 0);
  const placements = records.reduce((sum, record) => sum + record.placements, 0);

  return [
    { label: "Total collaborations", value: records.length },
    { label: "Active collaborations", value: activeCount },
    { label: "Inactive collaborations", value: records.length - activeCount },
    { label: "Total industries", value: industries.size },
    { label: "Consultancy amount", value: formatCurrencyValue(consultancyAmount) },
    { label: "Research grant amount", value: formatCurrencyValue(grantAmount) },
    { label: "Internships", value: internships },
    { label: "Placements", value: placements }
  ];
}

function groupRecordValues<T extends DashboardData["records"][number]>(
  records: DashboardData["records"],
  getKey: (record: DashboardData["records"][number]) => string,
  getLabel: (record: DashboardData["records"][number]) => string
) {
  const groups = new Map<string, { label: string; records: T[] }>();

  records.forEach((record) => {
    const key = getKey(record);
    const existing = groups.get(key);

    if (existing) {
      existing.records.push(record as T);
      return;
    }

    groups.set(key, {
      label: getLabel(record),
      records: [record as T]
    });
  });

  return Array.from(groups.values());
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
      rows = rows.filter((row) => row.departmentId === selectedDepartmentId);
    }
    if (role === ROLES.CAMPUS_COORDINATOR && selectedInstituteId) {
      rows = rows.filter((row) => row.instituteId === selectedInstituteId);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedCampusId) {
      rows = rows.filter((row) => row.campusId === selectedCampusId);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedInstituteId) {
      rows = rows.filter((row) => row.instituteId === selectedInstituteId);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedDepartmentId) {
      rows = rows.filter((row) => row.departmentId === selectedDepartmentId);
    }
    return rows;
  }, [data.drilldown, role, selectedCampusId, selectedInstituteId, selectedDepartmentId]);

  const eligibleRecords = useMemo(() => {
    let records = data.records;
    if (role === ROLES.INSTITUTE_COORDINATOR && selectedDepartmentId) {
      records = records.filter((record) => record.departmentId === selectedDepartmentId);
    }
    if (role === ROLES.CAMPUS_COORDINATOR && selectedInstituteId) {
      records = records.filter((record) => record.instituteId === selectedInstituteId);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedCampusId) {
      records = records.filter((record) => record.campusId === selectedCampusId);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedInstituteId) {
      records = records.filter((record) => record.instituteId === selectedInstituteId);
    }
    if ((role === ROLES.DEPUTY_DIRECTOR || role === ROLES.VICE_CHANCELLOR || role === ROLES.CORPORATE_RELATIONS_DIRECTOR || role === ROLES.ADMIN) && selectedDepartmentId) {
      records = records.filter((record) => record.departmentId === selectedDepartmentId);
    }
    return records;
  }, [data.records, role, selectedCampusId, selectedInstituteId, selectedDepartmentId]);

  const currentScopeLabel = data.hierarchy.scopeLabel;

  async function createScopedWorkbook(
    filenamePrefix: string,
    sheets: Array<{
      name: string;
      groups: Array<{
        scopeLabel: string;
        records: DashboardData["records"];
      }>;
    }>
  ) {
    const filename = `${sanitizeFileName(filenamePrefix)}.xlsx`;
    const workbookSheets = sheets.map((sheet) => ({
      name: normalizeInstituteDisplayName(sheet.name),
      data: buildScopeSectionData(
        `${currentScopeLabel} report`,
        normalizeInstituteDisplayName(sheet.name),
        data.hierarchy.scopePath,
        sheet.groups.map((group) => {
          const includeUniversity = !getSharedValue(group.records, (record) => record.universityName);
          const includeCampus = !getSharedValue(sheet.groups.flatMap((item) => item.records), (record) => record.campusName);
          const includeInstitute = !getSharedValue(sheet.groups.flatMap((item) => item.records), (record) => record.instituteId);
          const includeDepartment = false;

          return {
            scopeLabel: normalizeInstituteDisplayName(group.scopeLabel),
            summary: buildScopeSummary(group.records),
            rows: group.records.map((record) =>
              buildFullRecordRow(record, {
                includeUniversity,
                includeCampus,
                includeInstitute,
                includeDepartment
              })
            )
          };
        })
      )
    }));

    await downloadWorkbook(filename, workbookSheets);
  }

  function buildScopedSheets(records: DashboardData["records"]) {
    const campusGroups = groupRecordValues(
      records,
      (record) => record.campusId,
      (record) => record.campusName
    );

    if (campusGroups.length > 1) {
      return campusGroups.map((campusGroup) => ({
        name: campusGroup.label,
        groups: groupRecordValues(
          campusGroup.records,
          (record) => `${record.instituteId}:${record.departmentId}`,
          (record) => `${buildReadableScopeLabel([record], "institute")} / ${buildReadableScopeLabel([record], "department")}`
        ).map((group) => ({
          scopeLabel: group.label,
          records: group.records
        }))
      }));
    }

    const instituteGroups = groupRecordValues(
      records,
      (record) => record.instituteId,
      (record) => record.instituteName
    );

    if (instituteGroups.length > 1) {
      return instituteGroups.map((instituteGroup) => ({
        name: normalizeInstituteDisplayName(instituteGroup.label),
        groups: groupRecordValues(
          instituteGroup.records,
          (record) => record.departmentId,
          (record) => buildReadableScopeLabel([record], "department")
        ).map((group) => ({
          scopeLabel: group.label,
          records: group.records
        }))
      }));
    }

    const departmentGroups = groupRecordValues(
      records,
      (record) => record.departmentId,
      (record) => buildReadableScopeLabel([record], "department")
    );

    return [
      {
        name: normalizeInstituteDisplayName(instituteGroups[0]?.label ?? campusGroups[0]?.label ?? currentScopeLabel),
        groups: departmentGroups.map((group) => ({
          scopeLabel: group.label,
          records: group.records
        }))
      }
    ];
  }

  async function handleDownload() {
    if (!canDownload) {
      return;
    }

    setIsDownloading(true);
    try {
      if (role === ROLES.INSTITUTE_COORDINATOR) {
        if (selectedDepartmentId) {
          const department = departmentOptions.find((option) => option.id === selectedDepartmentId);
          const sheetName = department?.label ?? selectedDepartmentId;
          await createScopedWorkbook(`${currentScopeLabel}_${sheetName}`, [
            {
              name: sheetName,
              groups: [
                {
                  scopeLabel: sheetName,
                  records: eligibleRecords
                }
              ]
            }
          ]);
        } else {
          await createScopedWorkbook(`${currentScopeLabel}_departments`, buildScopedSheets(eligibleRecords));
        }
      } else if (role === ROLES.CAMPUS_COORDINATOR) {
        await createScopedWorkbook(`${currentScopeLabel}_departments`, buildScopedSheets(eligibleRecords));
      } else {
        const selectedGroup = selectedDepartmentId || selectedInstituteId || selectedCampusId;
        if (selectedGroup) {
          const selectedLabel =
            selectedDepartmentId
              ? departmentOptions.find((option) => option.id === selectedDepartmentId)?.label ?? selectedDepartmentId
              : selectedInstituteId
              ? instituteOptions.find((option) => option.id === selectedInstituteId)?.label ?? selectedInstituteId
              : campusOptions.find((option) => option.id === selectedCampusId)?.label ?? selectedCampusId;

          if (selectedDepartmentId) {
            await createScopedWorkbook(`${currentScopeLabel}_${selectedLabel}`, [
              {
                name: selectedLabel,
                groups: [
                  {
                    scopeLabel: selectedLabel,
                    records: eligibleRecords
                  }
                ]
              }
            ]);
          } else {
            await createScopedWorkbook(`${currentScopeLabel}_${selectedLabel}`, buildScopedSheets(eligibleRecords));
          }
        } else {
          await createScopedWorkbook(`${currentScopeLabel}_hierarchy`, buildScopedSheets(eligibleRecords));
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

Total records: ${data.drilldown.length}
Filtered records: ${eligibleRows.length}`);
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
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
              className="primary-button disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isDownloading || eligibleRecords.length === 0}
              onClick={handleDownload}
            >
              {isDownloading ? "Preparing download…" : "Download report"}
            </button>
          ) : null}
          {canSend ? (
            <button
              type="button"
              className="secondary-button"
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
