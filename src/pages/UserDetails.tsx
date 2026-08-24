import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserById } from "../api/users.api";
import { User } from "../types";
import { Badge } from "../components/common/Badge";
import { ArrowLeft } from "lucide-react";

export const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchUser = async () => {
      try {
        const response = await getUserById(id);
        setUser(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">Error loading user</h3>
        <p className="mt-2 text-sm text-red-700">{error || "User not found"}</p>
        <Link to="/users" className="mt-4 inline-block text-sm text-primary hover:underline">
          &larr; Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/users" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Users
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account status.</p>
          </div>
          <div>
            <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "BLOCKED" ? "danger" : "warning"}>
              {user.status}
            </Badge>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user.username}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user.email}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{user.phone || "Not provided"}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <Badge variant="info">{user.role}</Badge>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Profile Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {user.isProfileComplete ? (
                  <Badge variant="success">COMPLETE</Badge>
                ) : (
                  <Badge variant="warning">INCOMPLETE</Badge>
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(user.createdAt).toLocaleString()}
              </dd>
            </div>
            {user.lastLoginAt && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {new Date(user.lastLoginAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};
