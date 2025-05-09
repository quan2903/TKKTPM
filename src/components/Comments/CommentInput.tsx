import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useParams } from "react-router-dom";
import Button from "../Shared_components/Button";
import { useToast } from "../../hooks/use-toast"; // Thêm useToast

interface CommentInputProps {
  fieldId: number;
  userId: number;
}

export const CommentInput: React.FC<CommentInputProps> = ({ fieldId, userId }) => {
  const { fieldId: urlFieldId } = useParams();
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const toast = useToast();

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const selected = files.slice(0, 3 - images.length); // Max 3 images
    setImages((prev) => [...prev, ...selected]);

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendComment = async () => {
    // Kiểm tra nếu không có nội dung bình luận và ảnh
    if ( images.length === 0) {
      toast.toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng  thêm ảnh.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId.toString());
    formData.append("field_id", String(fieldId || urlFieldId));
    formData.append("content", comment);
    formData.append("status", "active");

    // Thêm ảnh vào formData
    images.forEach((img) => {
      formData.append("image", img);
    });
    
    try {
      // Gửi request API
      const response = await axiosInstance.post("/comment/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response);

      // setComment(""); // Xóa bình luận sau khi gửi
      // setImages([]); // Xóa ảnh đã chọn
      // setPreviews([]); // Xóa các preview ảnh

      toast.toast({
        variant: "success",
        title: "Bình luận thành công",
        description: "Bình luận của bạn đã được gửi thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi gửi:", error.response || error);
      toast.toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 mt-10 rounded-2xl bg-zinc-100 shadow-md border border-zinc-200">
      <textarea
        value={comment}
        onChange={handleCommentChange}
        placeholder="Hãy chia sẻ cảm nhận của bạn..."
        rows={4}
        className="w-full resize-none border border-zinc-300 rounded-xl p-4 text-base text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white placeholder-zinc-400"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        {previews.map((src, index) => (
          <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
            <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-opacity-80"
            >
              ✕
            </button>
          </div>
        ))}

        {images.length < 3 && (
          <label className="w-24 h-24 border border-dashed border-zinc-400 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer hover:border-amber-400 hover:text-amber-500 bg-white">
            +
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              multiple
            />
          </label>
        )}
      </div>

      <div className="flex justify-end mt-5">
        <Button
          text="Gửi"
          type="primary"
          onClick={handleSendComment}
          customStyle={{
            padding: "12px 32px",
            borderRadius: "999px",
            fontWeight: 600,
            backgroundColor: "#f59e0b",
            color: "white",
            fontSize: "1rem",
          }}
        />
      </div>
    </div>
  );
};
