import React from 'react';
import { 
  Home, 
  TrendingUp,  
  X,
  ChevronDown,
  ChevronUp,
  Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeItem = 'home',
  onItemClick 
}) => {
  const [showRecent, setShowRecent] = React.useState(true);
  const [showCommunities, setShowCommunities] = React.useState(true);
  const navigate = useNavigate();

  const feedItems: MenuItem[] = [
    { id: 'home', label: 'Trang chủ', icon: <Home className="w-5 h-5" />, path: '/trangchu' },
    { id: 'popular', label: 'Phổ biến', icon: <TrendingUp className="w-5 h-5" />, path: '/phobien' },
  ];

  const recentCommunities = [
    { name: 'reactjs', members: '245k', color: 'bg-blue-500' },
    { name: 'programming', members: '4.2M', color: 'bg-green-500' },
    { name: 'webdev', members: '892k', color: 'bg-purple-500' },
    { name: 'javascript', members: '2.1M', color: 'bg-yellow-500' },
  ];

  const handleItemClick = (item: MenuItem | { name: string }) => {
    if ('id' in item) {
      onItemClick?.(item.id);
      navigate(item.path);
    } else {
      onItemClick?.(item.name);
      navigate(`/${item.name}`);
    }

    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className={`w-full flex items-center px-3 py-2 text-left rounded hover:bg-gray-100 transition-colors text-sm ${
        activeItem === item.id ? 'bg-gray-100 font-medium' : 'text-gray-700'
      }`}
    >
      <div className="mr-3 text-gray-600">{item.icon}</div>
      <span>{item.label}</span>
    </button>
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-20 left-0 h-full w-64 bg-white border-r border-gray-300 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:fixed lg:translate-x-0 lg:block lg:top-20 lg:h-[calc(100vh-4rem)]
        [scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:rgba(0,0,0,0.2)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-3 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 space-y-4">
          <div>
            <div className="space-y-1">
              {feedItems.map(renderMenuItem)}
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowRecent(!showRecent)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-100 rounded"
            >
              <span>Gần đây</span>
              {showRecent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showRecent && (
              <div className="space-y-1 mt-2">
                {recentCommunities.slice(0, 3).map((community, index) => (
                  <button
                    key={index}
                    onClick={() => handleItemClick(community)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
                  >
                    <div className={`w-6 h-6 ${community.color} rounded-full mr-3 flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">
                        {community.name.charAt(2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{community.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setShowCommunities(!showCommunities)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-100 rounded"
            >
              <span>Cộng đồng</span>
              {showCommunities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showCommunities && (
              <div className="space-y-1 mt-2">
                <button className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm">
                  <Settings  className="w-4 h-4 mr-3 text-gray-500" />
                  <span
                  onClick={() => navigate("/communities")}
                  className="text-gray-700"
                  >
                    Quản lý cộng đồng
                  </span>
                </button>
                
                {recentCommunities.map((community, index) => (
                  <button
                    key={index}
                    onClick={() => handleItemClick(community)}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
                  >
                    <div className={`w-6 h-6 ${community.color} rounded-full mr-3 flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">
                        {community.name.charAt(2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 truncate">{community.name}</p>
                      <p className="text-xs text-gray-500">{community.members} members</p>
                    </div>
                  </button>
                ))}
                
                <button className="w-full px-3 py-2 text-left text-sm text-blue-500 hover:bg-gray-100 rounded">
                  Xem thêm
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
