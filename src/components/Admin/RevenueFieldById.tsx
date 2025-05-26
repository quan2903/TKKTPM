import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { ConfirmModal } from "../Shared_components/ConfirmModal";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from "../ui/select";
import { fetchRevenueReport } from "../../api/revenueApi";
import { toast } from "../../hooks/use-toast";
import { vi } from "date-fns/locale";
// Định dạng tiền tệ
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);

const timeSlots = [
  { value: "06:00:00-08:00:00", label: "6:00 - 8:00" },
  { value: "08:00:00-10:00:00", label: "08:00 - 10:00" },
  { value: "10:00:00-12:00:00", label: "10:00 - 12:00" },
  { value: "12:00:00-14:00:00", label: "12:00 - 14:00" },
  { value: "14:00:00-16:00:00", label: "14:00 - 16:00" },
  { value: "16:00:00-18:00:00", label: "16:00 - 18:00" },
  { value: "18:00:00-20:00:00", label: "18:00 - 20:00" },
  { value: "20:00:00-22:00:00", label: "20:00 - 22:00" },
];

interface Booking {
  id: string;
  booking_status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    address: string;
  };
  field: {
    id: string;
    name: string;
    price: number;
    address: string;
  };
  receipt: {
    id: string;
    total_price: number;
    deposit_price: number;
    is_fully_paid: number;
    status: string;
  };
  date_start: string;
  date_end: string;
}

interface RevenueReportData {
  total_revenue: number;
  bookings: Booking[];
  field?: {
    id: string;
    name: string;
    price: number;
    address: string;
  };
}

const RevenueFieldById = () => {
  const { id } = useParams<{ id: string }>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFilters, setHasFilters] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingReceiptId, setPendingReceiptId] = useState<string | null>(null);
  const [fieldName, setFieldName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Lấy tất cả dữ liệu khi mới vào trang
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchRevenueReport({
          field_id: id,
          start_date: "",
          end_date: "",
        });
        console.log("Data:", data);
        setReportData(data);
        if (data.field?.name) {
          setFieldName(data.field.name);
        } else if (data.bookings && data.bookings.length > 0) {
          setFieldName(data.bookings[0].field.name);
        } else {
          setFieldName("");
        }
      } catch (err) {
        setError("Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  // Fetch dữ liệu khi có filter
  const applyFilters = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page when applying new filters

    try {
      const params: any = {
        field_id: id,
      };

      if (startDate) {
        params.start_date = format(startDate, "yyyy-MM-dd");
      }
      if (endDate) {
        params.end_date = format(endDate, "yyyy-MM-dd");
      }
      if (selectedTimeSlot) {
        const [startTime, endTime] = selectedTimeSlot.split("-");
        params.start_time = startTime;
        params.end_time = endTime;
      }

      const data = await fetchRevenueReport(params);
      setReportData(data);
      setHasFilters(!!startDate || !!endDate || !!selectedTimeSlot);
    } catch (err) {
      setError("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Reset tất cả filter
  const resetFilters = async () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedTimeSlot("");
    setHasFilters(false);
    setCurrentPage(1); // Reset to first page when resetting filters

    if (id) {
      const data = await fetchRevenueReport({
        field_id: id,
        start_date: "",
        end_date: "",
      });
      try {
        const data = await fetchRevenueReport({
          field_id: id,
          start_date: "",
          end_date: "",
        });
        setReportData(data);
      } catch (err) {
        setError("Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmPayment = (receiptId: string) => {
    setPendingReceiptId(receiptId);
    setConfirmModalVisible(true);
  };

  // Hàm xử lý khi xác nhận trong modal
  const handleConfirmModal = async () => {
    if (!pendingReceiptId) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `http://127.0.0.1:8000/api/receipts/confirm-full-payment/${pendingReceiptId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast({
        title: "Thành công",
        description: "Xác nhận thanh toán thành công",
        variant: "success",
      });

      setConfirmModalVisible(false);
      setPendingReceiptId(null);

      // Refresh data
      await applyFilters();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi xác nhận thanh toán",
        variant: "destructive",
      });
      setConfirmModalVisible(false);
      setPendingReceiptId(null);
    }
  };

  // Hàm xử lý khi hủy modal
  const handleCancelModal = () => {
    setConfirmModalVisible(false);
    setPendingReceiptId(null);
  };

  // Calculate pagination data
  const totalBookings = reportData?.bookings?.length || 0;
  const totalPages = Math.ceil(totalBookings / rowsPerPage);
  const currentBookings =
    reportData?.bookings?.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage,
    ) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-2xl font-bold mb-4">
        Báo cáo doanh thu sân bóng
        {fieldName && <span className="ml-2 text-blue-600">- {fieldName}</span>}
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Từ ngày:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "dd/MM/yyyy")
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => setStartDate(date ?? null)}
                initialFocus
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Đến ngày:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[180px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(endDate, "dd/MM/yyyy")
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => setEndDate(date ?? null)}
                initialFocus
                fromDate={startDate || undefined}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Khung giờ:</span>
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Tất cả khung giờ" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Khung giờ</SelectLabel>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={applyFilters}
          disabled={!startDate && !endDate && !selectedTimeSlot}
        >
          Áp dụng
        </Button>

        {hasFilters && (
          <Button variant="outline" onClick={resetFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {reportData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {hasFilters ? "Kết quả lọc" : "Tất cả hóa đơn"}
            </h3>
            <div className="text-sm text-gray-600">
              Tổng doanh thu:{" "}
              <span className="font-bold text-green-600">
                {formatCurrency(reportData.total_revenue)}
              </span>
            </div>
          </div>

          {reportData.bookings && reportData.bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
                <thead>
                  <tr>
                    <th className="pl-12 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Người đặt
                    </th>
                    <th className="pl-5 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Ngày đặt
                    </th>
                    <th className="pl-5 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Khung giờ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Tiền cọc
                    </th>
                    <th className="pl-6 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Tổng thanh toán
                    </th>
                    <th className="pl-11 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
                      Xác nhận
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-blue-50 transition-colors border-b border-gray-100 text-base"
                    >
                      <td className="pl-12 py-4 whitespace-nowrap align-middle">
                        <div className="font-medium text-gray-900">
                          {booking.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.user.email}
                        </div>
                      </td>
                      <td className="pl-5 py-4 whitespace-nowrap text-gray-800 align-middle">
                        {format(new Date(booking.date_start), "dd/MM/yyyy")}
                      </td>
                      <td className="pl-5 py-4 whitespace-nowrap text-gray-800 align-middle">
                        {format(new Date(booking.date_start), "HH:mm")} -{" "}
                        {format(new Date(booking.date_end), "HH:mm")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-700 align-middle">
                        {formatCurrency(booking.receipt.deposit_price)}
                      </td>
                      <td className="pl-6 py-4 whitespace-nowrap font-semibold text-green-700 align-middle">
                        {formatCurrency(booking.receipt.total_price)}
                      </td>
                      <td className="pl-11 py-4 whitespace-nowrap align-middle">
                        {booking.booking_status === "cancelled_by_user" ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">
                            Đã huỷ
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  booking.receipt.is_fully_paid === 1
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
                          >
                            {booking.receipt.is_fully_paid === 1
                              ? "Đã thanh toán toàn bộ"
                              : "Đã thanh toán cọc"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap align-middle">
                        {booking.booking_status !== "cancelled_by_user" &&
                          booking.receipt.is_fully_paid === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleConfirmPayment(booking.receipt.id)
                              }
                            >
                              Xác nhận
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination giữ nguyên */}
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          page === currentPage ? "bg-blue-600 text-white" : ""
                        }
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Sau
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {hasFilters
                ? "Không có hóa đơn nào phù hợp với bộ lọc"
                : "Không có hóa đơn nào cho sân này"}
            </div>
          )}
        </div>
      )}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Xác nhận thanh toán"
        message="Bạn có chắc chắn muốn xác nhận thanh toán toàn bộ không?"
        onCancel={handleCancelModal}
        onConfirm={handleConfirmModal}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
};

export default RevenueFieldById;
