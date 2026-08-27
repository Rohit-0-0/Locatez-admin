import React, { useEffect, useState } from "react";
import { getVideoRequests, createVideoRequest } from "../api/videoRequests.api";
import { getCategories } from "../api/categories.api";
import { VideoRequest, Category } from "../types";
import { Pagination } from "../components/common/Pagination";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/common/Input";
import { Link } from "react-router-dom";
import { Eye, AlertTriangle, Plus } from "lucide-react";

export const VideoRequests: React.FC = () => {
  const [requests, setRequests] = useState<VideoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Create Video Request Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [rewardAmount, setRewardAmount] = useState<number | "">("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;

      const response = await getVideoRequests(params);
      const resData = response.data as any;
      setRequests(Array.isArray(resData) ? resData : (resData?.items || []));
      setTotal(resData?.pagination?.total || resData?.meta?.total || 0);
      setTotalPages(resData?.pagination?.totalPages || resData?.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch video requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await getCategories();
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
      setCategories(list);
      if (list.length > 0) {
        setSelectedCategoryId(list[0].id);
      }
    } catch (err: any) {
      setCategoriesError(err.response?.data?.message || err.message || "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, limit, statusFilter]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    fetchUserCategories();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedCategoryId) {
      alert("Please fill in all required fields and select a category.");
      return;
    }

    setCreateLoading(true);
    try {
      await createVideoRequest({
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId,
        rewardAmount: typeof rewardAmount === "number" ? rewardAmount : 0,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setRewardAmount("");
      setIsCreateModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to create video request");
    } finally {
      setCreateLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Video Requests</h1>
          <p className="mt-2 text-sm text-gray-700">Manage and moderate video requests.</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="mt-4 sm:mt-0 flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Create Video Request
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select
          className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="OPEN">OPEN</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Requester</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reward</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-gray-900">{request.title}</div>
                    {request.isRestrictedArea && (
                      <div className="mt-1 flex items-center text-xs text-red-600 font-medium">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Restricted Area ({request.restrictedAreaType})
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {request.category?.name || "None"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {request.requester?.username || "Unknown"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    ${(request.rewardAmount || 0).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link to={`/video-requests/${request.id}`} className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create Video Request Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Video Request">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            id="title"
            type="text"
            label="Request Title"
            placeholder="e.g. Check stock of iPhone 15 at Downtown Store"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createLoading}
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              required
              className="block w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Describe what video coverage you need..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createLoading}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>Category (Dynamic API Feed)</span>
              {categoriesLoading && <span className="text-xs text-gray-400">Loading categories...</span>}
            </label>
            {categoriesError ? (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{categoriesError}</div>
            ) : categories.length === 0 && !categoriesLoading ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                No active categories returned from API.
              </div>
            ) : (
              <select
                id="category"
                required
                className="block w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                disabled={createLoading || categoriesLoading}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Input
            id="rewardAmount"
            type="number"
            step="0.01"
            label="Reward Amount ($)"
            placeholder="15.00"
            required
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value ? parseFloat(e.target.value) : "")}
            disabled={createLoading}
          />

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createLoading} disabled={!selectedCategoryId}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
