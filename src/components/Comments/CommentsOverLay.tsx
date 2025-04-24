import React from "react";
import { CommentInput } from "../Comments/CommentInput"; // Import CommentInput
import { CommentHeader } from "./CommentHeader";

interface CommentOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  fieldInfo: any; // Thay đổi kiểu dữ liệu phù hợp với fieldInfo
}

export const CommentOverlay: React.FC<CommentOverlayProps> = ({
  isOpen,
  onClose,
  fieldInfo,
}) => {
  // Kiểm tra xem dữ liệu user có tồn tại trong localStorage không
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : {}; // Nếu không có, trả về đối tượng rỗng

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[60%] max-h-[90%] rounded-[20px] overflow-y-auto">
        <CommentHeader onClose={onClose} fieldInfo={fieldInfo} />

        {/* Truyền fieldId và userId vào CommentInput */}
        <CommentInput fieldId={fieldInfo.id} userId={parsedUser?.id || 0} />
      </div>
    </div>
  );
};
