import React, { useState, useEffect, useCallback } from "react";
import { FaMapMarkerAlt, FaFilter } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { FieldList } from "../Field/FieldList";
import axiosInstance from "../../api/axiosInstance";

export function FieldsSummary({
  onStartLoading,
  onStopLoading,
  location,
}: {
  onStartLoading: () => void;
  onStopLoading: () => void;
  location: { lat: number; lon: number } | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationFetched, setIsLocationFetched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: string; lng: string } | null>(null);

  const fieldTypes = [
    { id: "cat-uuid-001", name: "Sân 5" },
    { id: "cat-uuid-002", name: "Sân 7" },
    { id: "cat-uuid-003", name: "Sân 11" },
  ];

  const fetchAllFields = useCallback(async () => {
    try {
      setIsLoading(true);
      setFields([]);
      const response = await axiosInstance.get("/fields");
      const filteredFields = response.data.data.filter(
        (field: any) => field.state?.id === "state-001"
      );
      setFields(filteredFields);
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFields = useCallback(
    async (lat: string | null, lng: string | null, categoryId: string | null) => {
      try {
        setIsLoading(true);
        setFields([]);

        const params = new URLSearchParams();
        if (categoryId) params.append("category_id", categoryId);
        if (lat && lng) {
          params.append("latitude", lat);
          params.append("longitude", lng);
        }
        params.append("page", "1");

        const response = await axiosInstance.post(`/fields/filter?${params.toString()}`);
        const filteredFields = response.data.data.filter(
          (field: any) => field.state?.id === "state-001"
        );
        setFields(filteredFields);
      } catch (error) {
        console.error("Lỗi khi lọc sân:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getLocation = useCallback(() => {
    return new Promise<{ lat: string; lng: string }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Trình duyệt không hỗ trợ Geolocation.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toString();
          const lng = pos.coords.longitude.toString();
          resolve({ lat, lng });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

const applyFilters = async () => {
  // Nếu không có thay đổi vị trí, reset trạng thái vị trí
  if (!userLocation) {
    setIsLocationFetched(false); // Reset trạng thái vị trí
  }

  const categoryId = selectedTypes.length > 0 ? selectedTypes[0] : null;

  try {
    if (!userLocation) {
      const loc = await getLocation();
      setUserLocation(loc);
      setIsLocationFetched(true);
      await fetchFields(loc.lat, loc.lng, categoryId);
    } else {
      await fetchFields(userLocation.lat, userLocation.lng, categoryId);
    }
  } catch (err) {
    console.error("Không thể lấy vị trí:", err);
  }

  setShowFilters(false);
};


  const handleToggleLocation = async () => {
    if (isLocationFetched) {
      setIsLocationFetched(false);
      setUserLocation(null);
      await fetchAllFields();
    } else {
      try {
        const loc = await getLocation();
        setUserLocation(loc);
        setIsLocationFetched(true);
        const categoryId = selectedTypes.length > 0 ? selectedTypes[0] : null;
        await fetchFields(loc.lat, loc.lng, categoryId);
      } catch (err) {
        console.error("Không thể lấy vị trí:", err);
      }
    }
  };

  const toggleFieldType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const handleResetFilters = async () => {
    setSelectedTypes([]);
    setIsLocationFetched(false);
    setUserLocation(null);
    setShowFilters(false);
    await fetchAllFields();
  };

  useEffect(() => {
    fetchAllFields();
  }, [fetchAllFields]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl pl-5 font-bold text-gray-800">Danh sách sân bóng</h2>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={handleToggleLocation}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors
              ${isLocationFetched
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
              ${isLoading ? "opacity-70 cursor-wait" : ""}`}
          >
            <FaMapMarkerAlt className="flex-shrink-0" />
            <span className="whitespace-nowrap">
              {isLoading
                ? "Đang tìm..."
                : isLocationFetched
                ? "Đã xác định vị trí (nhấn lại để quay về)"
                : "Tìm theo vị trí"}
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaFilter className="flex-shrink-0" />
              <span className="whitespace-nowrap">Lọc</span>
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 mb-4">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-700">Loại sân</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 min-h-[100px]">
                    {fieldTypes.length > 0 ? (
                      fieldTypes.map((type) => (
                        <label
                          key={type.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type.id)}
                            onChange={() => toggleFieldType(type.id)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{type.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">
                        Không có loại sân nào
                      </div>
                    )}
                  </div>

                  <button
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={applyFilters}
                  >
                    Áp dụng
                  </button>

                  <button
                    className="mt-2 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={handleResetFilters}
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={showFilters ? "pt-[200px]" : ""}>
        <FieldList fields={fields} />
      </div>
    </div>
  );
}
