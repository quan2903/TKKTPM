import React, { useState } from "react";
import { FaMapMarkerAlt, FaFilter } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { FieldList } from "./FieldList";

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

  const fieldTypes = [
    { id: "5", name: "Sân 5" },
    { id: "7", name: "Sân 7" },
    { id: "11", name: "Sân 11" },
  ];

  const handleLocationClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLocationFetched(true);
    }, 1500);
  };

  const toggleFieldType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách sân bóng</h2>
        
        {/* Nhóm nút bên phải */}
        <div className="flex items-center gap-3 relative">
          {/* Nút tìm theo vị trí */}
          <button
            onClick={handleLocationClick}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors
              ${isLocationFetched 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
              ${isLoading ? "opacity-70 cursor-wait" : ""}`}
          >
            <FaMapMarkerAlt className="flex-shrink-0" />
            <span className="whitespace-nowrap">
              {isLoading ? "Đang tìm..." : 
               isLocationFetched ? "Đã xác định vị trí" : "Tìm theo vị trí"}
            </span>
          </button>

          {/* Nút lọc */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaFilter className="flex-shrink-0" />
              <span className="whitespace-nowrap">Lọc</span>
            </button>

            {/* Panel lọc - Thêm margin-bottom để tạo khoảng cách */}
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
                  
                  {/* Thêm min-height để đảm bảo có khoảng trống ngay cả khi chưa có nội dung */}
                  <div className="space-y-2 min-h-[100px]">
                    {fieldTypes.length > 0 ? (
                      fieldTypes.map(type => (
                        <label key={type.id} className="flex items-center gap-2 cursor-pointer">
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
                    onClick={() => {
                      console.log("Loại sân đã chọn:", selectedTypes);
                      setShowFilters(false);
                    }}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thêm padding-top nếu dropdown đang mở để không bị che */}
      <div className={showFilters ? "pt-[200px]" : ""}>
        <FieldList />
      </div>
    </div>
  );
}