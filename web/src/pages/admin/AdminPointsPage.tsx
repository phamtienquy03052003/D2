import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "../../components/user/Pagination";
import { pointService } from "../../services/pointService";
import { toast } from "react-hot-toast";

const BASE_URL = "http://localhost:8000";

interface PointRecord {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    avatar?: string;
  };
  points: number;
  reason?: string;
  createdAt: string;
}

const AdminPointsPage: React.FC = () => {
  const [points, setPoints] = useState<PointRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pointsPerPage = 10;

  // Lấy tất cả record điểm
  const fetchPoints = async () => {
    try {
      setLoading(true);
      const data = await pointService.adminGetAll();
      setPoints(data);
    } catch (err) {
      toast.error("Không thể tải dữ liệu điểm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  // Xóa record điểm (Admin)
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa record điểm này?")) return;
    try {
      await pointService.adminDelete(id);
      setPoints(points.filter((p) => p._id !== id));
      toast.success("Đã xóa record điểm!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  // Lọc và phân trang
  const filteredPoints = points.filter((p) =>
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPoints.length / pointsPerPage);
  const startIndex = (currentPage - 1) * pointsPerPage;
  const currentPoints = filteredPoints.slice(startIndex, startIndex + pointsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          Đang tải dữ liệu điểm...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Quản lý điểm người dùng</h1>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full sm:w-64 focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="p-3">Người dùng</th>
                <th className="p-3 text-center">Điểm</th>
                <th className="p-3">Lý do</th>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentPoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500 italic">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                currentPoints.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50 text-gray-700">
                    <td className="p-3 flex items-center gap-2">
                      {p.user?.avatar && (
                        <img
                          src={`${BASE_URL}${p.user.avatar}`}
                          alt={p.user?.name || "Người dùng"}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{p.user?.name || "Ẩn danh"}</span>
                    </td>
                    <td className="p-3 text-center font-semibold">{p.points}</td>
                    <td className="p-3">{p.reason || "-"}</td>
                    <td className="p-3">{new Date(p.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-500 hover:text-red-600 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPointsPage;
