import React, { useEffect, useState } from "react";
import type { UserType } from "../../types/chat";
import { userService } from "../../services/userService";
import { conversationService } from "../../services/conversationService";
import { useAuth } from "../../context/AuthContext";
import { getUserAvatarUrl } from "../../utils/userUtils";

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
    if (!name.trim() || selected.length < 1 || !user) return;
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-lg p-4 rounded shadow">
        <div className="text-lg font-semibold mb-2">Tạo nhóm</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên nhóm" className="w-full border p-2 rounded mb-3" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập tên người dùng để thêm vào nhóm" className="w-full border p-2 rounded mb-2" />
        <div className="max-h-40 overflow-y-auto mb-3">
          {results.map((u) => (
            <div key={u._id} className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer" onClick={() => toggleSelect(u)}>
              <div className="flex items-center gap-2">
                <img src={getUserAvatarUrl(u)} className="w-8 h-8 rounded-full object-cover" alt="a" />
                <div>{u.name}</div>
              </div>
              <div>{selected.find((s) => s._id === u._id) ? "Đã gửi" : "Gửi yêu cầu"}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Hủy</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleCreate}>Tạo</button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
