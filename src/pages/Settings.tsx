import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getVideoRequestSettings, updateVideoRequestSettings } from "../api/settings.api";
import { Switch } from "../components/common/Switch";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { Shield, Info, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export const Settings: React.FC = () => {
  const { role } = useAuth();
  const { toast } = useToast();

  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  const [requireApproval, setRequireApproval] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingValue, setPendingValue] = useState<boolean>(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVideoRequestSettings();
      setRequireApproval(!!data.requireApprovalForAll);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load video request settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleClick = (newValue: boolean) => {
    if (!isAdmin || actionLoading) return;
    setPendingValue(newValue);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    const previousState = requireApproval;
    const targetState = pendingValue;

    // Optimistically close modal & set loading state on switch
    setIsConfirmModalOpen(false);
    setActionLoading(true);

    try {
      const response = await updateVideoRequestSettings(targetState);
      const newState = typeof response.requireApprovalForAll === "boolean"
        ? response.requireApprovalForAll
        : targetState;

      setRequireApproval(newState);
      if (newState) {
        toast.success("Video request approval requirement enabled.");
      } else {
        toast.success("Video request approval requirement disabled.");
      }
    } catch (err: any) {
      // Rollback to previous state on failure
      setRequireApproval(previousState);
      toast.error("Failed to update video request approval setting. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage global administrative preferences and video request policies.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white shadow rounded-lg border border-gray-200 p-6 space-y-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div className="space-y-2 w-3/4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-gray-900">Video Requests</h2>
          </div>

          {/* Setting Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <label
                  htmlFor="video-approval-switch"
                  className="text-base font-medium text-gray-900 cursor-pointer"
                >
                  Require approval for all video requests
                </label>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                  {requireApproval
                    ? "All valid video requests require moderator/admin approval before becoming available. Hard-restricted locations remain blocked."
                    : "Normal video requests are created immediately. Conditionally restricted locations require moderator approval. Hard-restricted locations remain blocked."}
                </p>
                {!isAdmin && (
                  <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block font-medium mt-2">
                    Note: As a Moderator, you can view this setting but cannot modify it.
                  </p>
                )}
              </div>

              <div className="flex items-center pt-1">
                <Switch
                  id="video-approval-switch"
                  checked={requireApproval}
                  onChange={handleToggleClick}
                  disabled={!isAdmin || actionLoading}
                  label="Require approval for all video requests"
                />
              </div>
            </div>

            {/* Clarification Box / Matrix Card */}
            <div className="rounded-lg bg-blue-50/70 p-4 border border-blue-200/80 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Restriction Policy & Approval Matrix</span>
              </div>
              <p className="text-xs text-blue-800 leading-normal">
                This switch specifically controls approval requirements for <strong>otherwise-valid video requests</strong>. It does not override or allow hard-restricted locations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-white p-3 rounded border border-blue-100 space-y-1.5 shadow-xs">
                  <div className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>When Switch is OFF:</span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-normal">Default</span>
                  </div>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      <span><strong>HARD:</strong> Blocked</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <span><strong>CONDITIONAL:</strong> Moderator approval</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      <span><strong>NORMAL:</strong> Created normally</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded border border-blue-100 space-y-1.5 shadow-xs">
                  <div className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>When Switch is ON:</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-normal">Strict</span>
                  </div>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      <span><strong>HARD:</strong> Blocked</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <span><strong>CONDITIONAL:</strong> Moderator approval</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <span><strong>NORMAL:</strong> Moderator approval</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !actionLoading && setIsConfirmModalOpen(false)}
        title={pendingValue ? "Enable approval for all video requests?" : "Disable approval for all video requests?"}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {pendingValue
              ? "All valid video requests will require moderator/admin approval before becoming available."
              : "Normal unrestricted video requests will be created immediately. Conditionally restricted requests will still require moderator approval."}
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={handleConfirmUpdate}
              isLoading={actionLoading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
