import React, { useEffect, useState } from "react";
import { getStats } from "../api/videoRequests.api";
import { getUsers } from "../api/users.api";
import { Activity, Users as UsersIcon, Video, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          getStats(),
          getUsers({ limit: 1 }) // Just to get total users, if backend provides total
        ]);
        
        setStats(statsResponse.data);
        setUserStats({ total: usersResponse.meta.total });
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  const statCards = [
    { name: "Total Users", value: userStats?.total || 0, icon: UsersIcon, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Pending Requests", value: stats?.pending || 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { name: "Open Requests", value: stats?.open || 0, icon: Video, color: "text-indigo-600", bg: "bg-indigo-100" },
    { name: "Completed", value: stats?.completed || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { name: "Rejected", value: stats?.rejected || 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    { name: "In Progress", value: stats?.inProgress || 0, icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.name} className="overflow-hidden rounded-lg bg-white shadow border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{card.name}</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Raw stats dump just in case some statuses were missed */}
      <div className="mt-8 overflow-hidden rounded-lg bg-white shadow border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Other Request Statistics</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(stats || {}).filter(([k]) => !['pending', 'open', 'completed', 'rejected', 'inProgress'].includes(k)).map(([key, value]) => (
              <div key={key} className="bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                <dt className="text-sm font-medium text-gray-500">{key}</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900">{String(value)}</dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
