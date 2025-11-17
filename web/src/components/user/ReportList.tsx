// src/components/user/ReportList.tsx
import React from "react";
import type { ReportGroup } from "../../types/Report";

interface Props {
  reports: ReportGroup[];
  onClickDetail: (targetId: string) => void;
}

const ReportList: React.FC<Props> = ({ reports, onClickDetail }) => {
  if (reports.length === 0) return <p>Không có báo cáo nào.</p>;

  return (
    <table className="table-auto w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Target ID</th>
          <th className="p-2">Type</th>
          <th className="p-2">Reports</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r._id} className="border-b">
            <td className="p-2">{r._id}</td>
            <td className="p-2">{r.targetType}</td>
            <td className="p-2">{r.reportCount}</td>
            <td className="p-2">
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => onClickDetail(r._id)}
              >
                Xem chi tiết
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportList;
