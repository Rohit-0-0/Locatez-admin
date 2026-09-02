import React, { useEffect, useState } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { getCategories } from "../../api/categories.api";
import { createVideoRequest } from "../../api/videoRequests.api";
import { Category } from "../../types";
import { MapPin } from "lucide-react";

interface InitialVideoRequestData {
  title?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rewardAmount?: number;
}

interface CreateVideoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: InitialVideoRequestData | null;
}

export const CreateVideoRequestModal: React.FC<CreateVideoRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [rewardAmount, setRewardAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

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
    if (isOpen) {
      fetchUserCategories();

      // Populate prefilled data if provided (e.g. from Popular Place "Request Video")
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setAddress(initialData.address || "");
        setLatitude(typeof initialData.latitude === "number" ? initialData.latitude : "");
        setLongitude(typeof initialData.longitude === "number" ? initialData.longitude : "");
        if (typeof initialData.rewardAmount === "number") {
          setRewardAmount(initialData.rewardAmount);
        }
      } else {
        setTitle("");
        setDescription("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        setRewardAmount("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedCategoryId) {
      alert("Please fill in title, description, and select a category.");
      return;
    }

    setLoading(true);
    try {
      await createVideoRequest({
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId,
        rewardAmount: typeof rewardAmount === "number" ? rewardAmount : 0,
        address: address.trim() || undefined,
        latitude: typeof latitude === "number" ? latitude : undefined,
        longitude: typeof longitude === "number" ? longitude : undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errCode = err.response?.data?.code || err.response?.data?.errorCode;
      const errMsg = err.response?.data?.message || err.message || "";

      if (errCode === "SERVICE_AREA_RESTRICTED" || errMsg.includes("SERVICE_AREA_RESTRICTED")) {
        const availableAreas = err.response?.data?.availableAreas || err.response?.data?.data?.availableAreas;
        const areasListText = Array.isArray(availableAreas) && availableAreas.length > 0
          ? ` Available areas: ${availableAreas.map((a: any) => (typeof a === "string" ? a : a.name)).join(", ")}.`
          : "";
        alert(`Locatez is currently available only in selected service areas.${areasListText}`);
      } else {
        alert(errMsg || "Failed to create video request");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Video Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        {initialData?.address && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>
              Pre-filled from Popular Place: <strong>{initialData.address}</strong>
            </span>
          </div>
        )}

        <Input
          id="req-title"
          type="text"
          label="Request Title"
          placeholder="e.g. Live crowd update at Marine Drive"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <div>
          <label htmlFor="req-desc" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="req-desc"
            rows={3}
            required
            className="block w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Describe the video coverage required..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="req-category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
            <span>Category</span>
            {categoriesLoading && <span className="text-xs text-gray-400">Loading categories...</span>}
          </label>
          {categoriesError ? (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{categoriesError}</div>
          ) : (
            <select
              id="req-category"
              required
              className="block w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              disabled={loading || categoriesLoading}
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
          id="req-address"
          type="text"
          label="Location / Address"
          placeholder="e.g. Marine Drive, Mumbai, Maharashtra"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="req-lat"
            type="number"
            step="any"
            label="Latitude"
            placeholder="18.9432"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : "")}
            disabled={loading}
          />
          <Input
            id="req-lng"
            type="number"
            step="any"
            label="Longitude"
            placeholder="72.8236"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : "")}
            disabled={loading}
          />
        </div>

        <Input
          id="req-reward"
          type="number"
          step="0.01"
          label="Reward Amount (₹)"
          placeholder="15.00"
          required
          value={rewardAmount}
          onChange={(e) => setRewardAmount(e.target.value ? parseFloat(e.target.value) : "")}
          disabled={loading}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} disabled={!selectedCategoryId}>
            Submit Video Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
