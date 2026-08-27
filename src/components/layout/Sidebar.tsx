import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Video, Tag, Compass, ShieldAlert, MessageSquare, Settings } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "Popular Places Feed", path: "/popular-places", icon: Compass, roles: ["ADMIN", "MODERATOR", "SUPERADMIN", "USER"] },
    { name: "Users", path: "/users", icon: Users, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "Video Requests", path: "/video-requests", icon: Video, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "Categories", path: "/categories", icon: Tag, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "Popular Places (Admin)", path: "/admin/popular-places", icon: Compass, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "Audit Logs", path: "/audit-logs", icon: ShieldAlert, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "Admin Settings", path: "/settings", icon: Settings, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
    { name: "LiveKit Chat Demo", path: "/chat-demo", icon: MessageSquare, roles: ["ADMIN", "MODERATOR", "SUPERADMIN"] },
  ];

  const filteredNav = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
        <h1 className="text-xl font-bold text-primary">Locatez Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={clsx(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
