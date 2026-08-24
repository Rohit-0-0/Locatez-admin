import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/common/Button";

export const Unauthorized: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You do not have permission to access this dashboard. This area is restricted to administrators and moderators.
        </p>
        <div className="flex gap-4">
          <Button variant="primary" onClick={() => logout()}>
            Sign out
          </Button>
          <Link to="/chat-demo">
            <Button variant="secondary">
              Go to LiveKit Chat Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
