import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getVideoRequestById, approveVideoRequest, rejectVideoRequest } from "../api/videoRequests.api";
import { VideoRequest } from "../types";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { ArrowLeft, AlertTriangle, Check, X } from "lucide-react";

export const VideoRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<VideoRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequest = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getVideoRequestById(id);
      setRequest(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to approve this video request?")) return;
    
    setActionLoading(true);
    try {
      await approveVideoRequest(id);
      fetchRequest();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("This request was already processed by another moderator/admin.");
      } else {
        alert(err.response?.data?.message || "Failed to approve request");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rejectionReason.trim()) return;
    
    setActionLoading(true);
    try {
      await rejectVideoRequest(id, rejectionReason);
      setIsRejectModalOpen(false);
      fetchRequest();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("This request was already processed by another moderator/admin.");
      } else {
        alert(err.response?.data?.message || "Failed to reject request");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <h3 className="text-sm font-medium text-red-800">Error loading request</h3>
        <p className="mt-2 text-sm text-red-700">{error || "Request not found"}</p>
        <Link to="/video-requests" className="mt-4 inline-block text-sm text-primary hover:underline">
          &larr; Back to requests
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="warning">PENDING</Badge>;
      case "OPEN": return <Badge variant="info">OPEN</Badge>;
      case "ACCEPTED": return <Badge variant="info" className="bg-blue-100 text-blue-800">ACCEPTED</Badge>;
      case "COMPLETED": return <Badge variant="success">COMPLETED</Badge>;
      case "REJECTED": return <Badge variant="danger">REJECTED</Badge>;
      case "CANCELLED": return <Badge variant="default">CANCELLED</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const renderParty = (
    party?: { id?: string; fullName?: string | null; name?: string | null; username?: string | null; firstName?: string; displayName?: string; email?: string } | null,
    fallbackId?: string | null
  ) => {
    const raw =
      party?.fullName ||
      party?.name ||
      party?.displayName ||
      party?.firstName ||
      party?.username ||
      (party?.email ? party.email.split("@")[0] : "") ||
      "";
    const label = raw || (fallbackId ? null : "N/A");
    const userId = party?.id || fallbackId;

    if (userId && label) {
      return (
        <Link to={`/users/${userId}`} className="text-primary hover:underline font-medium">
          {label}
        </Link>
      );
    }
    if (userId) {
      return (
        <Link to={`/users/${userId}`} className="text-primary hover:underline font-mono text-xs bg-gray-100 px-2.5 py-1 rounded inline-block font-semibold">
          {userId}
        </Link>
      );
    }
    return <span className="text-gray-500 font-medium">{label || "N/A"}</span>;
  };

  const renderRequester = () => {
    if (!request) return <span>User</span>;
    const u = request.requester || request.user || request.requestedBy || request.creator;
    return renderParty(u, request.requesterId || request.userId);
  };

  const renderFulfiller = () => {
    if (!request) return <span>—</span>;
    return renderParty(request.fulfilment?.fulfiller, request.fulfilment?.fulfillerId || null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/video-requests" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Video Requests
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Request Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Information and moderation controls.</p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(request.status)}
            
            {request.status === "PENDING" && (
              <div className="flex gap-2 ml-4 border-l pl-4 border-gray-200">
                <Button variant="primary" size="sm" onClick={handleApprove} isLoading={actionLoading} className="bg-green-600 hover:bg-green-700 border-green-600">
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
                <Button variant="danger" size="sm" onClick={() => setIsRejectModalOpen(true)} disabled={actionLoading}>
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>

        {request.isRestrictedArea && (
          <div className="bg-yellow-50 border-y border-yellow-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Restricted Area Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This video request is located in a restricted area of type: <strong>{request.restrictedAreaType || "UNKNOWN"}</strong>. 
                    Please review carefully before approving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {request.status === "REJECTED" && request.rejectionReason && (
          <div className="bg-red-50 border-y border-red-200 p-4">
            <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
            <p className="mt-1 text-sm text-red-700">{request.rejectionReason}</p>
          </div>
        )}

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{request.title}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{request.description}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Requester</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {renderRequester()}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fulfiller</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {renderFulfiller()}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{request.category?.name || "None"}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Reward</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">₹{(request.rewardAmount || 0).toFixed(2)}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payout Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{request.payoutType}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(request.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Video Request">
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason
            </label>
            <textarea
              id="reason"
              rows={4}
              required
              className="block w-full rounded-md border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Explain why this request is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="danger" isLoading={actionLoading}>Confirm Reject</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
