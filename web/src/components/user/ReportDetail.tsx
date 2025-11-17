// src/components/user/ReportDetail.tsx
import React from "react";
import type { Report } from "../../types/Report";

interface Props {
  target: any;
  reports: Report[];
  onHide: () => void;
  onDelete: () => void;
}

const ReportDetail: React.FC<Props> = ({ target, reports, onHide, onDelete }) => {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold">Target Detail</h2>
      <pre>{JSON.stringify(target, null, 2)}</pre>

      <h3 className="mt-4 font-semibold">Reports:</h3>
      <ul>
        {reports.map((r) => (
          <li key={r._id}>
            {r.reporter && typeof r.reporter !== "string" && r.reporter.username} - {r.reason} - {r.status}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <button onClick={onHide} className="bg-yellow-500 px-2 py-1 rounded text-white">
          Ẩn
        </button>
        <button onClick={onDelete} className="bg-red-500 px-2 py-1 rounded text-white">
          Xóa
        </button>
      </div>
    </div>
  );
};

export default ReportDetail;
