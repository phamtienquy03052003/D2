import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RightSidebar from "../components/RightSidebar";
import CommunityCard from "../components/CommunityCard";
import CreateCommunityModal from "../components/CreateCommunityModal";
import { communityApi } from "../api/communityApi";
import { ChevronRight } from "lucide-react";

const CommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCommunities = async () => {
    const res = await communityApi.getAll();
    setCommunities(res);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        onLoginClick={() => {}}
        onRegisterClick={() => {}}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          activeItem="communities"
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-5">
                  <h1 className="text-xl font-bold text-gray-800">Cộng đồng</h1>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-all"
                  >
                    + Tạo cộng đồng
                  </button>
                </div>

                <div className="space-y-4">
                  {communities.length > 0 ? (
                    communities.map((c) => (
                      <CommunityCard
                        key={c._id}
                        community={c}
                        onRefresh={fetchCommunities}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      Chưa có cộng đồng nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <RightSidebar />
          </div>
        </div>
      </div>

      {showModal && (
        <CreateCommunityModal
          onClose={() => setShowModal(false)}
          onCreated={fetchCommunities}
        />
      )}
    </div>
  );
};

export default CommunitiesPage;
