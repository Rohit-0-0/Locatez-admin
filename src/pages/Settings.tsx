import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getVideoRequestSettings,
  updateVideoRequestSettings,
  getChatSettings,
  updateChatSettings,
} from "../api/settings.api";
import { Switch } from "../components/common/Switch";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { Shield, Info, CheckCircle2, XCircle, AlertTriangle, MessageSquare } from "lucide-react";

export const Settings: React.FC = () => {
  const { role } = useAuth();
  const { toast } = useToast();

  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  // Video Requests Setting State
  const [requireApproval, setRequireApproval] = useState<boolean>(false);

  // Chat Settings State
  const [confirmedChatLimit, setConfirmedChatLimit] = useState<number>(50);
  const [chatLimitInput, setChatLimitInput] = useState<string>("");
  const [chatValidationError, setChatValidationError] = useState<string | null>(null);

  // General Loading & Action States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [chatSaving, setChatSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation Modal state for Video Request Approval
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingValue, setPendingValue] = useState<boolean>(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vrData, chatData] = await Promise.all([
        getVideoRequestSettings(),
        getChatSettings(),
      ]);

      setRequireApproval(!!vrData.requireApprovalForAll);

      const limit = typeof chatData.preAcceptanceMessageLimit === "number"
        ? chatData.preAcceptanceMessageLimit
        : 50;
      setConfirmedChatLimit(limit);
      setChatLimitInput(limit.toString());
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Video Request Toggle Handlers
  const handleToggleClick = (newValue: boolean) => {
    if (!isAdmin || actionLoading) return;
    setPendingValue(newValue);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    const previousState = requireApproval;
    const targetState = pendingValue;

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
      setRequireApproval(previousState);
      toast.error("Failed to update video request approval setting. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Chat Settings Input Validation & Handlers
  const validateChatInput = (value: string): string | null => {
    if (!value || value.trim() === "") {
      return "Maximum chat messages is required.";
    }
    const num = Number(value);
    if (isNaN(num)) {
      return "Maximum chat messages must be a valid number.";
    }
    if (!Number.isInteger(num) || value.includes(".")) {
      return "Maximum chat messages must be a whole number (no decimals).";
    }
    if (num <= 0) {
      return "Maximum chat messages must be greater than 0.";
    }
    return null;
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChatLimitInput(val);
    setChatValidationError(validateChatInput(val));
  };

  const handleSaveChatSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || chatSaving) return;

    const validationErr = validateChatInput(chatLimitInput);
    if (validationErr) {
      setChatValidationError(validationErr);
      return;
    }

    const newLimit = parseInt(chatLimitInput, 10);
    if (newLimit === confirmedChatLimit) return;

    setChatSaving(true);
    try {
      const updatedData = await updateChatSettings(newLimit);
      const confirmedValue = typeof updatedData.preAcceptanceMessageLimit === "number"
        ? updatedData.preAcceptanceMessageLimit
        : newLimit;

      setConfirmedChatLimit(confirmedValue);
      setChatLimitInput(confirmedValue.toString());
      setChatValidationError(null);
      toast.success("Chat settings updated successfully.");
    } catch (err: any) {
      // Revert input to last confirmed backend value on error
      setChatLimitInput(confirmedChatLimit.toString());
      setChatValidationError(null);
      toast.error(err.response?.data?.message || "Failed to update chat settings. Please try again.");
    } finally {
      setChatSaving(false);
    }
  };

  const isChatSaveDisabled =
    !isAdmin ||
    chatSaving ||
    !!chatValidationError ||
    !chatLimitInput ||
    parseInt(chatLimitInput, 10) === confirmedChatLimit;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage global administrative preferences, video request policies, and chat settings.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
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
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6 space-y-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="py-4 border-t border-gray-100 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video Requests Section */}
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

          {/* Chat Settings Section */}
          <div className="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">Chat</h2>
            </div>

            {/* Setting Content */}
            <div className="p-6 space-y-4">
              <form onSubmit={handleSaveChatSettings} className="space-y-4">
                <div>
                  <label
                    htmlFor="chat-limit-input"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Maximum chat messages
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                      id="chat-limit-input"
                      type="number"
                      min="1"
                      step="1"
                      disabled={!isAdmin || chatSaving}
                      value={chatLimitInput}
                      onChange={handleChatInputChange}
                      className="block w-full sm:w-48 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={chatSaving}
                      disabled={isChatSaveDisabled}
                    >
                      Save
                    </Button>
                  </div>
                  {chatValidationError && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {chatValidationError}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Controls the maximum number of messages allowed in a chat.
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block font-medium mt-2">
                      Note: As a Moderator, you can view this setting but cannot modify it.
                    </p>
                  )}
                </div>
              </form>
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
