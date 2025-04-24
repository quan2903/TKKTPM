"use client";

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Button from "../Shared_components/Button";
import { CommentOverlay } from "../Comments/CommentsOverLay";
import { useField } from "../../hooks/useField";

const FieldInfo: React.FC = () => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = React.useState(false);
  const { selectedField, setSelectedField } = useField();

  useEffect(() => {
    if (!selectedField) {
      const storedField = localStorage.getItem("selectedField");
      if (storedField) {
        try {
          const parsed = JSON.parse(storedField);
          setSelectedField(parsed);
        } catch (e) {
          console.error("Không thể parse selectedField từ localStorage:", e);
        }
      }
    }
  }, [selectedField, setSelectedField]);

  if (!selectedField) {
    return (
      <div className="text-center text-red-500 mt-10">
        Không tìm thấy thông tin sân. Vui lòng quay lại và chọn lại.
      </div>
    );
  }

  return (
    <>
      <div className={`self-stretch w-full max-md:mt-8 ${showComments ? "blur-sm" : ""}`}>
        <div className="flex flex-col py-4 px-6 w-full bg-white rounded-[30px] shadow-[0px_0px_15px_rgba(0,0,0,0.15)]">
          {/* Tên sân */}
          <div className="flex gap-1 text-xl font-bold text-slate-800 mb-3">
            {selectedField.name}
          </div>

          {/* Thông tin liên hệ */}
          <div className="flex items-center gap-2 mb-3 text-base text-gray-600">
            <PhoneIcon className="w-5 h-5 text-gray-600" />
            <span>0933290303</span>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-start gap-2 mb-4 text-sm text-gray-600">
            <LocationOnIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
            <span className="flex-1">{selectedField.address}</span>
          </div>

          {/* Hình ảnh */}
          <div className="relative w-full  rounded-lg overflow-hidden mb-4">
            {selectedField.images && selectedField.images.length > 0 && (
              <img
                src={selectedField.images[0]}
                alt={selectedField.name}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Thông tin giá và loại sân */}
          <div className="flex flex-col gap-2 border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Giá sân:</span>
              <span className="font-bold text-amber-600">
                {selectedField.price.toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Kiểu sân:</span>
              <span className="font-bold text-slate-800">
                {selectedField.category?.name || "Không xác định"}
              </span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-4 mt-4">
          <Button
            onClick={() =>
              navigate("/dashboard/booking", {
                state: {
                  fieldId: selectedField.id,
                  fieldName: selectedField.name,
                },
                replace: true,
              })
            }
            text="Đặt sân"
            variant="tertiary"
            className="flex-1 py-3 bg-amber-500 rounded-[34px] shadow-md text-white font-bold hover:bg-amber-600 transition-colors"
          />
          <Button
            onClick={() => setShowComments(true)}
            text="Bình luận"
            variant="tertiary"
            className="flex-1 py-3 bg-amber-500 rounded-[34px] shadow-md text-white font-bold hover:bg-amber-600 transition-colors"
          />
        </div>
      </div>

      <CommentOverlay
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        fieldInfo={selectedField}
      />
    </>
  );
};

export default FieldInfo;