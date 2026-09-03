import { apiClient } from "./client";

export type PlacePhoto = {
  url: string;
  width: number | null;
  height: number | null;
  source: string | null;
};

export type PlacePhotosResponse = {
  mapboxId: string | null;
  name: string | null;
  fullAddress: string | null;
  photos: PlacePhoto[];
  resolvedFrom: "mapboxId" | "coordinates" | "none";
};

/**
 * Fetch Mapbox place photo URLs for admin image selection.
 * GET /api/v1/maps/places/photos
 */
export const getPlacePhotos = async (params: {
  mapboxId?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await apiClient.get<{
    success: boolean;
    data: PlacePhotosResponse;
  }>("/maps/places/photos", { params });
  return response.data;
};
