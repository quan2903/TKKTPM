import * as React from "react";
import { useState, useCallback } from "react";
import { Comment } from "../../types/comment";
import { updateComment, deleteComment } from "../../actions/commentActions";
import { useToast } from "../../hooks/use-toast";
import { CommentInput } from "./CommentInput";

interface CommentItemProps extends Comment {
  onCommentUpdated?: (updatedComment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  childComments?: Comment[];
  isChild?: boolean; // New prop to identify child comments
}

export const CommentItem: React.FC<CommentItemProps> = ({
  user_id,
  content,
  fieldId,
  id,
  updatedAt,
  createdAt,
  user,
  image_url,
  onCommentUpdated,
  onCommentDeleted,
  childComments = [],
  isChild = false, // Default to false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showOldImage, setShowOldImage] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const isAdmin =localStorage.getItem("isAdmin") === "true";
  const toast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleEdit = useCallback(async () => {
    try {
      await updateComment(
        id,
        editedContent,
        newImage,
        showOldImage,
        image_url,
        (updatedComment) => {
          if (onCommentUpdated) {
            onCommentUpdated(updatedComment);
          }
          resetEditState();
          toast.toast({
            variant: "success",
            title: "Thành công!",
            description: "Bình luận đã được cập nhật.",
          });
        }
      );
    } catch (error) {
      toast.toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật bình luận.",
      });
    }
  }, [id, editedContent, newImage, showOldImage, image_url, onCommentUpdated, toast]);

  const handleDelete = useCallback(() => {
    deleteComment(
      id,
      () => {
        if (onCommentDeleted) {
          onCommentDeleted(id);
        }
        toast.toast({
          variant: "success",
          title: "Thành công!",
          description: "Bình luận đã được xóa.",
        });
        setShowConfirm(false);
      },
      (errorMessage) => {
        toast.toast({
          variant: "destructive",
          title: "Lỗi",
          description: errorMessage,
        });
      }
    );
  }, [id, onCommentDeleted, toast]);

  const resetEditState = () => {
    setIsEditing(false);
    setEditedContent(content);
    setNewImage(null);
    setPreviewImageUrl(null);
    setShowOldImage(true);
  };

  return (
    <article className="flex flex-col items-start w-full mb-4">
      <div
        className={`flex flex-col items-start px-12 pt-4 pb-2 mt-10 ${
          isChild ? "ml-10" : "ml-14"
        } w-full font-semibold bg-zinc-300 max-w-[780px] rounded-[50px] max-md:px-5 max-md:max-w-full`}
      >
        {isEditing ? (
          <>
            <textarea
              className="w-full p-2 rounded resize-none"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex items-center gap-4 mt-2">
              {showOldImage && image_url && (
                <div className="relative">
                  <img
                    src={`http://localhost:8000/${image_url}`}
                    alt="Ảnh cũ"
                    className="w-32 h-32 object-cover rounded shadow-md"
                  />
                  <button
                    onClick={() => setShowOldImage(false)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-center"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="relative">
                {previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    alt="Ảnh mới"
                    className="w-32 h-32 object-cover rounded shadow-md"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewImage(file);
                      setPreviewImageUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Lưu
              </button>
              <button
                onClick={resetEditState}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              {user?.avatar && (
                <img
                  src={"http://localhost:8000/" + user?.avatar}
                  alt="Avatar"
                  className="w-8 h-8 object-cover rounded-full"
                />
              )}
              <h4 className="text-lg font-semibold">{user?.name || "Người dùng"}</h4>
            </div>
            <p className="text-base text-black mb-2">{content}</p>
            {image_url && (
              <div className="w-full mb-2">
                <img
                  src={`http://localhost:8000/${image_url}`}
                  alt="Image comment"
                  className="w-32 h-32 object-cover rounded shadow-md"
                />
              </div>
            )}
            <div className="flex gap-1 mt-3 text-xs text-stone-300">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e9cec473df0839e3f3c4212b90778e9706f278e9"
                alt="Calendar icon"
                className="object-contain shrink-0 aspect-[1.05] w-[21px]"
              />
              <time className="text-gray-600">
                {updatedAt || createdAt
                  ? new Date(updatedAt || createdAt).toLocaleDateString()
                  : "Invalid Date"}
              </time>
            </div>
          </>
        )}
      </div>

{(String(currentUser?.id) === String(user_id) || isAdmin) && (
  <div className="flex gap-3 mt-5 ml-14 justify-end w-[85%]">
    
    {/* Nếu là chủ sở hữu thì được sửa */}
    {String(currentUser?.id) === String(user_id) && (
      <span className="text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => setIsEditing(true)}>
        Sửa
      </span>
    )}

    {/* Nếu là chủ sở hữu hoặc admin thì được xóa */}
    <span
      className="text-sm text-red-500 cursor-pointer hover:underline"
      onClick={() => setShowConfirm(true)}
    >
      Xóa
    </span>

    {/* Nếu không phải bình luận con thì được phản hồi */}
    {!isChild && (
      <span
        className="text-sm text-green-500 cursor-pointer hover:underline"
        onClick={() => setIsReplying(!isReplying)}
      >
        Phản hồi
      </span>
    )}
  </div>
)}

    

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-4">Bạn có chắc chắn muốn xóa bình luận này không?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isReplying && (
        <div className="ml-14 mt-2 w-[85%]">
          <CommentInput 
            fieldId={fieldId} 
            userId={currentUser?.id} 
            parentId={id} 
            compact={true} // Add this prop to make it smaller
          />
        </div>
      )}

      {childComments && childComments.length > 0 && (
        <div className="ml-10 mt-4 border-l-2 border-gray-300 pl-4">
          {childComments.map((child) => (
            <CommentItem
              key={child.id}
              id={child.id}
              content={child.content}
              fieldId={child.fieldId}
              createdAt={child.createdAt}
              updatedAt={child.updatedAt}
              image_url={child.image_url}
              user={child.user}
              user_id={child.user?.id}
              childComments={child.child || []}
              onCommentDeleted={onCommentDeleted}
              isChild={true} // Mark as child comment
            />
          ))}
        </div>
      )}
    </article>
  );
};