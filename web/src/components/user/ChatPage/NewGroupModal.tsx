import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import type { UserType } from "../../../types/chat";
import { userService } from "../../../services/userService";
import { conversationService } from "../../../services/conversationService";
import { useAuth } from "../../../context/AuthContext";
import UserAvatar from "../../common/UserAvatar";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (conv: any) => void;
}

const NewGroupModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserType[]>([]);
  const [selected, setSelected] = useState<UserType[]>([]);
  const [name, setName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await userService.searchUsers(query);
        setResults(res.filter((u) => u._id !== user?._id));
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, user]);

  const toggleSelect = (u: UserType) => {
    setSelected((prev) => (prev.find((p) => p._id === u._id) ? prev.filter((p) => p._id !== u._id) : [...prev, u]));
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Tên nhóm không được để trống!");
    if (name.length < 3) return toast.error("Tên nhóm phải có ít nhất 3 ký tự!");
    if (name.length > 50) return toast.error("Tên nhóm không được vượt quá 50 ký tự!");
    if (selected.length < 2) return toast.error("Nhóm phải có ít nhất 3 thành viên (bao gồm bạn)!");
    if (!user) return;

    const members = Array.from(new Set([...selected.map((s) => s._id), user._id]));
    const conv = await conversationService.createGroup(name.trim(), members, user._id);
    onCreated(conv);
    setName("");
    setSelected([]);
    setQuery("");
    setResults([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a1d25] w-11/12 max-w-lg p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
        <div className="text-lg font-semibold mb-2">Tạo nhóm</div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tên nhóm</span>
          <span className={`text-xs ${name.length > 50 ? "text-red-500 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
            {name.length}/50
          </span>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên nhóm"
          className={`w-full border p-2 rounded mb-1 bg-white dark:bg-[#272a33] text-gray-900 dark:text-gray-100 ${name.length > 50 ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
        />
        {name.length > 50 && (
          <p className="text-xs text-red-500 mb-3">
            Tên nhóm không được vượt quá 50 ký tự
          </p>
        )}
        <div className="mb-3"></div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập tên người dùng để thêm vào nhóm"
          className="w-full border p-2 rounded mb-2 bg-white dark:bg-[#272a33] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
        />
        <div className="max-h-40 overflow-y-auto mb-3 custom-scrollbar">
          {results.map((u) => (
            <div key={u._id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-[#272a33] cursor-pointer rounded" onClick={() => toggleSelect(u)}>
              <div className="flex items-center gap-2">
                <UserAvatar user={u} size="w-8 h-8" />
                <div>{u.name}</div>
              </div>
              <div>{selected.find((s) => s._id === u._id) ? "Đã gửi" : "Gửi yêu cầu"}</div>
            </div>
          ))}
          {results.length === 0 && query && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-2">Không tìm thấy người dùng</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors" onClick={onClose}>Hủy</button>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors" onClick={handleCreate}>Tạo</button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
