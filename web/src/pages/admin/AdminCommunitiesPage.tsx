import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Pagination from "../../components/user/Pagination";
import { communityService } from "../../services/communityService";
import { toast } from "react-hot-toast";

const BASE_URL = "http://localhost:8000";

interface Community {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  creator?: { name?: string; email?: string } | string;
  members: string[];
  createdAt: string;
}

const AdminCommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getCreatorName = (community: Community) =>
    typeof community.creator === "string" ? community.creator : community.creator?.name;

  const getCreatorEmail = (community: Community) =>
    typeof community.creator === "string" ? undefined : community.creator?.email;

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityService.adminGetAll();
      setCommunities(data);
    } catch {
      toast.error("Không thể tải danh sách cộng đồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // === XÓA CỘNG ĐỒNG ===
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa cộng đồng này?")) return;
    try {
      await communityService.adminDelete(id);
      setCommunities(communities.filter((c) => c._id !== id));
      toast.success("Đã xóa cộng đồng!");
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  // === XÓA AVATAR ===
  const handleDeleteAvatar = async (id: string) => {
  if (!confirm("Bạn có chắc muốn xóa avatar cộng đồng này?")) return;

  try {
    const community = communities.find((c) => c._id === id);
    if (!community) return;

    // Gửi avatar = "" để backend xóa file
    await communityService.adminUpdate(id, {
      name: community.name,
      description: community.description,
      avatar: ""
    });

    // Cập nhật giao diện
    setCommunities(
      communities.map((c) =>
        c._id === id ? { ...c, avatar: "" } : c
      )
    );

    toast.success("Đã xóa avatar!");
  } catch {
    toast.error("Không thể xóa avatar");
  }
};

  // === ĐỔI TÊN CỘNG ĐỒNG ===
  const handleChangeName = async (id: string, currentName: string) => {
    const newName = prompt("Nhập tên mới:", currentName);
    if (!newName) return;
    try {
      await communityService.adminUpdate(id, { name: newName });
      setCommunities(
        communities.map((c) =>
          c._id === id ? { ...c, name: newName } : c
        )
      );
      toast.success("Đổi tên thành công!");
    } catch {
      toast.error("Tên đã tồn tại hoặc không hợp lệ!");
    }
  };

  // === ĐỔI MÔ TẢ ===
  const handleChangeDesc = async (id: string, currentDesc: string) => {
    const newDesc = prompt("Nhập mô tả mới:", currentDesc);
    if (newDesc === null) return;
    try {
      await communityService.adminUpdate(id, { description: newDesc });
      setCommunities(
        communities.map((c) =>
          c._id === id ? { ...c, description: newDesc } : c
        )
      );
      toast.success("Cập nhật mô tả thành công!");
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  // === SEARCH + PAGINATION ===
  const filtered = communities.filter((c) => {
    const description = c.description?.toLowerCase() || "";
    const creatorName = getCreatorName(c)?.toLowerCase() || "";
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase()) ||
      creatorName.includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full text-gray-500">
          Đang tải danh sách cộng đồng...
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Quản lý cộng đồng</h1>

          <input
            type="text"
            placeholder="Tìm theo tên, mô tả hoặc người tạo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-sm text-gray-700">
                <th className="p-3">Avatar</th>
                <th className="p-3">Tên cộng đồng</th>
                <th className="p-3">Người tạo</th>
                <th className="p-3">Thành viên</th>
                <th className="p-3">Mô tả</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((c) => (
                <tr key={c._id} className="border-t hover:bg-gray-50 text-gray-700">
                  <td className="p-3">
                    {c.avatar ? (
                      <img
                        src={`${BASE_URL}${c.avatar}`}
                        className="w-12 h-12 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        No Img
                      </div>
                    )}
                  </td>

                  <td className="p-3 font-medium">
                    {c.name}
                  </td>

                  <td className="p-3">
                    {getCreatorName(c) || "(Không rõ)"} <br />
                    <span className="text-xs text-gray-500">{getCreatorEmail(c)}</span>
                  </td>

                  <td className="p-3">{c.members.length}</td>

                  <td className="p-3 max-w-[250px] truncate">{c.description || "-"}</td>

                  {/* === CỘT HÀNH ĐỘNG === */}
                  <td className="p-3 text-center space-y-1">
                    <button
                      onClick={() => handleChangeName(c._id, c.name)}
                      className="block w-full text-blue-600 hover:underline"
                    >
                      Đổi tên
                    </button>

                    <button
                      onClick={() => handleChangeDesc(c._id, c.description || "")}
                      className="block w-full text-indigo-600 hover:underline"
                    >
                      Sửa mô tả
                    </button>

                    <button
                      onClick={() => handleDeleteAvatar(c._id)}
                      className="block w-full text-yellow-600 hover:underline"
                    >
                      Xóa avatar
                    </button>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="block w-full text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500 italic">
                    Không có cộng đồng nào
                  </td>
                </tr>
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

export default AdminCommunitiesPage;
