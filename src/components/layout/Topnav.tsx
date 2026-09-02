import React from "react";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface TopnavProps {
  onToggleSidebar?: () => void;
}

export const Topnav: React.FC<TopnavProps> = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        <span className="font-bold text-primary text-lg md:hidden">Locatez</span>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm font-medium text-gray-900">{user?.username || user?.email}</span>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="Log out"
        >
          <span className="sr-only">Log out</span>
          <LogOut className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
