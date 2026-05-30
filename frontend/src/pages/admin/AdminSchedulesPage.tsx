import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { adminScheduleService } from "../../services/adminScheduleService";
import { adminStaffService } from "../../services/adminStaffService";
import { adminShiftService } from "../../services/adminShiftService";
import type { AdminId, AdminOpenShift, AdminSchedule, AdminScheduleSwapRequest, AdminStaff, AdminShift } from "../../types/admin";
import { CalendarCheck, Check, Copy, Plus, Trash2, Calendar as CalendarIcon, Repeat2, UserPlus, X, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  PRESENT: "Có mặt",
  ABSENT: "Vắng mặt"
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700"
};

const PUBLISH_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã công bố",
  LOCKED: "Đã khóa"
};

const PUBLISH_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-sky-100 text-sky-700",
  LOCKED: "bg-slate-200 text-slate-700"
};

const SWAP_STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy"
};

const SWAP_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-700"
};

const getInitials = (name?: string) => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NV";
  return parts.slice(-2).map((part) => part[0]).join("").toUpperCase();
};

const addDays = (dateString: string, days: number) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const AdminSchedulesPage = () => {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [openShifts, setOpenShifts] = useState<AdminOpenShift[]>([]);
  const [swapRequests, setSwapRequests] = useState<AdminScheduleSwapRequest[]>([]);
  const [staffs, setStaffs] = useState<AdminStaff[]>([]);
  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const dates = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // Calculate start and end of the currently viewed month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0); // Last day of the month

    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    };
  }, [calendarMonth]);

  const [showModal, setShowModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showAssignOpenShiftModal, setShowAssignOpenShiftModal] = useState(false);
  const [selectedOpenShift, setSelectedOpenShift] = useState<AdminOpenShift | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showCopyWeekModal, setShowCopyWeekModal] = useState(false);
  const [copyingWeek, setCopyingWeek] = useState(false);
  const [autoFillingWeek, setAutoFillingWeek] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AdminSchedule | null>(null);
  
  const [formData, setFormData] = useState<{ userId: AdminId; shiftId: AdminId; workDate: string; note: string }>({ userId: 0, shiftId: 0, workDate: new Date().toISOString().split('T')[0], note: "" });
  const [openShiftForm, setOpenShiftForm] = useState<{ shiftId: AdminId; workDate: string; note: string }>({ shiftId: 0, workDate: new Date().toISOString().split('T')[0], note: "" });
  const [assignOpenShiftForm, setAssignOpenShiftForm] = useState<{ userId: AdminId; note: string }>({ userId: 0, note: "" });
  const [swapForm, setSwapForm] = useState<{ targetUserId: AdminId; note: string }>({ targetUserId: 0, note: "" });
  const [copyWeekForm, setCopyWeekForm] = useState({ sourceStartDate: dates.startDate, targetStartDate: addDays(dates.startDate, 7) });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, staffRes, shiftRes] = await Promise.all([
        adminScheduleService.getSchedules(dates.startDate, dates.endDate),
        adminStaffService.getStaffs({ status: "ACTIVE", size: 100 }),
        adminShiftService.getAllShifts()
      ]);
      const [openShiftRes, swapRes] = await Promise.all([
        adminScheduleService.getOpenShifts(dates.startDate, dates.endDate),
        adminScheduleService.getSwapRequests()
      ]);
      setSchedules(schedRes);
      setOpenShifts(openShiftRes);
      setSwapRequests(swapRes);
      setStaffs(staffRes.content);
      setShifts(shiftRes);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu lịch làm việc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [dates]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.shiftId) {
      toast.error("Vui lòng chọn nhân viên và ca làm việc");
      return;
    }
    
    try {
      await adminScheduleService.assignSchedule(formData);
      toast.success("Xếp lịch thành công");
      setShowModal(false);
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xếp lịch thất bại");
    }
  };

  const handleDelete = async (id: AdminId) => {
    if (!window.confirm("Xóa lịch làm việc này?")) return;
    try {
      await adminScheduleService.deleteSchedule(id);
      toast.success("Đã xóa lịch");
      void fetchData();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const handleStatusChange = async (id: AdminId, status: string) => {
    try {
      await adminScheduleService.updateAttendance(id, { status });
      toast.success("Cập nhật điểm danh thành công");
      void fetchData();
    } catch (error) {
      toast.error("Cập nhật thất bại");
    }
  };

  const handlePublish = async () => {
    try {
      const published = await adminScheduleService.publishSchedules(dates.startDate, dates.endDate);
      toast.success(published.length > 0 ? "Đã công bố lịch làm việc" : "Không có lịch nháp để công bố");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Công bố lịch thất bại");
    }
  };

  const handleLock = async () => {
    try {
      const locked = await adminScheduleService.lockSchedules(dates.startDate, dates.endDate);
      toast.success(locked.length > 0 ? "Đã khóa lịch làm việc" : "Không có lịch đã công bố để khóa");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Khóa lịch thất bại");
    }
  };

  const openCopyWeek = () => {
    const today = new Date();
    const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1)).toISOString().split('T')[0];
    setCopyWeekForm({ sourceStartDate: currentWeekStart, targetStartDate: addDays(currentWeekStart, 7) });
    setShowCopyWeekModal(true);
  };

  const handleCopyWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (copyWeekForm.sourceStartDate === copyWeekForm.targetStartDate) {
      toast.error("Tuần đích phải khác tuần nguồn");
      return;
    }

    setCopyingWeek(true);
    try {
      const copied = await adminScheduleService.copyWeek(copyWeekForm);
      toast.success(copied.length > 0 ? `Đã sao chép ${copied.length} lịch sang tuần mới` : "Tuần nguồn chưa có lịch hoặc tuần đích đã có đủ lịch");
      setShowCopyWeekModal(false);
      // Optional: Navigate to the target week's month if needed
      const targetDate = new Date(copyWeekForm.targetStartDate);
      setCalendarMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Sao chép lịch tuần thất bại");
    } finally {
      setCopyingWeek(false);
    }
  };

  const handleAutoFillWeek = async () => {
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
    const startStr = currentWeekStart.toISOString().split('T')[0];

    if (!window.confirm(`Tự sắp xếp bổ sung lịch còn thiếu cho tuần từ ${startStr}?`)) {
      return;
    }

    setAutoFillingWeek(true);
    try {
      const created = await adminScheduleService.autoFillWeek(startStr);
      toast.success(created.length > 0
        ? `Đã tự xếp thêm ${created.length} lịch cho tuần`
        : "Tuần này đã đủ lịch hoặc không còn nhân viên phù hợp để xếp thêm");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tự sắp xếp lịch tuần thất bại");
    } finally {
      setAutoFillingWeek(false);
    }
  };

  const openAdd = (dateStr?: string) => {
    setFormData({ 
      userId: staffs[0]?.id || 0, 
      shiftId: shifts[0]?.id || 0, 
      workDate: dateStr || new Date().toISOString().split('T')[0], 
      note: "" 
    });
    setShowModal(true);
  };

  const openCreateOpenShift = () => {
    setOpenShiftForm({ shiftId: shifts[0]?.id || 0, workDate: new Date().toISOString().split('T')[0], note: "" });
    setShowOpenShiftModal(true);
  };

  const handleCreateOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openShiftForm.shiftId) {
      toast.error("Vui lòng chọn ca làm việc");
      return;
    }

    try {
      await adminScheduleService.createOpenShift(openShiftForm);
      toast.success("Đã tạo ca trống");
      setShowOpenShiftModal(false);
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tạo ca trống thất bại");
    }
  };

  const openAssignOpenShift = (openShift: AdminOpenShift) => {
    setSelectedOpenShift(openShift);
    setAssignOpenShiftForm({ userId: staffs[0]?.id || 0, note: "" });
    setShowAssignOpenShiftModal(true);
  };

  const handleAssignOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpenShift || !assignOpenShiftForm.userId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    try {
      await adminScheduleService.assignOpenShift(selectedOpenShift.id, assignOpenShiftForm);
      toast.success("Đã phân ca trống");
      setShowAssignOpenShiftModal(false);
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Phân ca trống thất bại");
    }
  };

  const openSwap = (schedule: AdminSchedule) => {
    setSelectedSchedule(schedule);
    setSwapForm({ targetUserId: staffs.find((staff) => staff.id !== schedule.userId)?.id || 0, note: "" });
    setShowSwapModal(true);
  };

  const handleCreateSwapRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule || !swapForm.targetUserId) {
      toast.error("Vui lòng chọn nhân viên nhận ca");
      return;
    }

    try {
      await adminScheduleService.createSwapRequest({
        scheduleId: selectedSchedule.id,
        targetUserId: swapForm.targetUserId,
        note: swapForm.note
      });
      toast.success("Đã tạo yêu cầu đổi ca");
      setShowSwapModal(false);
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Tạo yêu cầu đổi ca thất bại");
    }
  };

  const handleApproveSwap = async (id: AdminId) => {
    try {
      await adminScheduleService.approveSwapRequest(id);
      toast.success("Đã duyệt đổi ca");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Duyệt đổi ca thất bại");
    }
  };

  const handleRejectSwap = async (id: AdminId) => {
    try {
      await adminScheduleService.rejectSwapRequest(id);
      toast.success("Đã từ chối đổi ca");
      void fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Từ chối đổi ca thất bại");
    }
  };

  // Calendar Helpers
  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Add empty padding for days before the 1st of the month
    let startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday
    if (startDayOfWeek === 0) startDayOfWeek = 7; // Adjust Sunday to be end of week if we want Mon-Sun
    
    // We want Monday = 1, Tuesday = 2... Sunday = 7
    const padDays = startDayOfWeek - 1;
    
    for (let i = 0; i < padDays; i++) {
      const padDate = new Date(year, month, -padDays + i + 1);
      const mPad = String(padDate.getMonth() + 1).padStart(2, '0');
      const dPad = String(padDate.getDate()).padStart(2, '0');
      days.push({
        date: padDate,
        dateString: `${padDate.getFullYear()}-${mPad}-${dPad}`,
        isCurrentMonth: false,
      });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      // ensure formatting works without timezone offsets messing it up locally
      const dString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: d,
        dateString: dString,
        isCurrentMonth: true,
      });
    }

    // Pad end
    const remaining = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remaining; i++) {
      const padDate = new Date(year, month + 1, i);
      const padDateString = `${padDate.getFullYear()}-${String(padDate.getMonth() + 1).padStart(2, '0')}-${String(padDate.getDate()).padStart(2, '0')}`;
      days.push({
        date: padDate,
        dateString: padDateString,
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [calendarMonth]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const map: Record<string, AdminSchedule[]> = {};
    schedules.forEach(s => {
      if (!map[s.workDate]) map[s.workDate] = [];
      map[s.workDate].push(s);
    });
    return map;
  }, [schedules]);

  // Group open shifts by date
  const openShiftsByDate = useMemo(() => {
    const map: Record<string, AdminOpenShift[]> = {};
    openShifts.forEach(s => {
      if (!map[s.workDate]) map[s.workDate] = [];
      map[s.workDate].push(s);
    });
    return map;
  }, [openShifts]);

  // Make sure todayStr uses local time formatting
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch Làm Việc</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý ca làm việc dạng Calendar tháng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void handleAutoFillWeek()}
            disabled={autoFillingWeek}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CalendarCheck size={20} />
            {autoFillingWeek ? "Đang xếp..." : "Sắp xếp đủ tuần (Hiện tại)"}
          </button>
          <button
            onClick={openCopyWeek}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Copy size={20} />
            Sao chép tuần
          </button>
          <button
            onClick={openCreateOpenShift}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <UserPlus size={20} />
            Ca trống
          </button>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-2 rounded-xl bg-[#E32A15] px-4 py-2 font-semibold text-white hover:bg-[#247dad]"
          >
            <Plus size={20} />
            Xếp lịch mới
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <ChevronLeft size={20} />
            </button>
            <h3 className="w-32 text-center text-lg font-bold text-slate-800">
              Tháng {calendarMonth.getMonth() + 1}/{calendarMonth.getFullYear()}
            </h3>
            <button onClick={nextMonth} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <ChevronRight size={20} />
            </button>
          </div>
          <button onClick={goToToday} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Hôm nay
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void handlePublish()} className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">
            Công bố lịch (Tháng này)
          </button>
          <button onClick={() => void handleLock()} className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Khóa lịch (Tháng này)
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm"><div className="text-sm font-semibold text-[#E32A15]">Đang tải...</div></div>}
        
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 grid-rows-6">
          {calendarDays.map((dayObj, i) => {
            const isToday = dayObj.dateString === todayStr;
            const daySchedules = schedulesByDate[dayObj.dateString] || [];
            const dayOpenShifts = openShiftsByDate[dayObj.dateString] || [];
            
            return (
              <div 
                key={i} 
                className={`group relative min-h-[120px] border-b border-r border-slate-100 p-2 transition-colors hover:bg-slate-50 ${!dayObj.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${isToday ? 'bg-[#E32A15] font-bold text-white' : 'font-medium text-slate-700'}`}>
                    {dayObj.date.getDate()}
                  </span>
                  <button 
                    onClick={() => openAdd(dayObj.dateString)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-[#E32A15] hover:text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[85px] no-scrollbar">
                  {daySchedules.map(sched => (
                    <div 
                      key={sched.id} 
                      onClick={() => openSwap(sched)}
                      className={`cursor-pointer truncate rounded border px-1.5 py-1 text-[11px] font-semibold transition-colors hover:opacity-80 ${
                        sched.publishStatus === 'DRAFT' ? 'border-amber-200 bg-amber-50 text-amber-700' : 
                        sched.publishStatus === 'LOCKED' ? 'border-slate-300 bg-slate-100 text-slate-600' : 
                        'border-sky-200 bg-sky-50 text-sky-700'
                      }`}
                      title={`${sched.userFullName} - ${sched.shiftName} (${sched.startTime.substring(0,5)}-${sched.endTime.substring(0,5)})`}
                    >
                      {sched.shiftName.split(' ')[0]} - {getInitials(sched.userFullName)}
                    </div>
                  ))}
                  {dayOpenShifts.filter(o => o.status === 'OPEN').map(open => (
                    <div 
                      key={`open-${open.id}`}
                      onClick={() => openAssignOpenShift(open)}
                      className="cursor-pointer truncate rounded border border-dashed border-red-300 bg-red-50 px-1.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                      title={`Ca trống: ${open.shiftName}`}
                    >
                      Trống: {open.shiftName.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIST VIEWS (Kept below calendar for utility) */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-bold text-slate-800">Ca trống (Tháng này)</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-slate-600 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Ca</th>
                  <th className="px-4 py-3 text-right">Phân ca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openShifts.filter(o => o.status === "OPEN").length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Không có ca trống đang mở.</td></tr>
                ) : (
                  openShifts.filter(o => o.status === "OPEN").map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{new Date(item.workDate).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-3 text-[#E32A15] font-medium">
                        <div>{item.shiftName}</div>
                        {item.note ? <div className="mt-1 text-xs text-slate-400">{item.note}</div> : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openAssignOpenShift(item)}
                          className="text-slate-400 hover:text-[#E32A15]"
                          title="Phân ca trống"
                        >
                          <UserPlus size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-bold text-slate-800">Yêu cầu đổi ca</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-slate-600 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Đổi ca</th>
                  <th className="px-4 py-3 text-right">Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {swapRequests.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Chưa có yêu cầu đổi ca.</td></tr>
                ) : (
                  swapRequests.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{new Date(item.workDate).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div className="font-medium text-slate-900">{item.shiftName}</div>
                        <div className="text-xs text-slate-500">{item.fromUserFullName} → {item.targetUserFullName}</div>
                        <div className="mt-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SWAP_STATUS_COLORS[item.status] || "bg-slate-100 text-slate-700"}`}>
                            {SWAP_STATUS_LABELS[item.status] || item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => void handleApproveSwap(item.id)} className="text-slate-400 hover:text-emerald-600" title="Duyệt đổi ca">
                              <Check size={18} />
                            </button>
                            <button onClick={() => void handleRejectSwap(item.id)} className="text-slate-400 hover:text-red-600" title="Từ chối đổi ca">
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCopyWeekModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCopyWeek} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Sao chép lịch 1 tuần</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                Hệ thống sao chép 7 ngày từ tuần nguồn sang tuần đích, tạo lịch mới ở trạng thái nháp và bỏ qua lịch đã tồn tại cùng nhân viên/ca/ngày.
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ngày bắt đầu tuần nguồn (Thường là Thứ 2)</label>
                <input
                  required
                  type="date"
                  value={copyWeekForm.sourceStartDate}
                  onChange={e => setCopyWeekForm({
                    ...copyWeekForm,
                    sourceStartDate: e.target.value,
                    targetStartDate: copyWeekForm.targetStartDate || addDays(e.target.value, 7)
                  })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ngày bắt đầu tuần đích</label>
                <input
                  required
                  type="date"
                  value={copyWeekForm.targetStartDate}
                  onChange={e => setCopyWeekForm({ ...copyWeekForm, targetStartDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]"
                />
              </div>
              <div className="text-xs text-slate-500">
                Tuần đích sẽ là {copyWeekForm.targetStartDate} đến {addDays(copyWeekForm.targetStartDate, 6)}.
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCopyWeekModal(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button disabled={copyingWeek} type="submit" className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad] disabled:opacity-50">
                {copyingWeek ? "Đang sao chép..." : "Sao chép"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAssign} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Xếp lịch làm việc</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ngày làm việc</label>
                <input required type="date" value={formData.workDate} onChange={e => setFormData({...formData, workDate: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nhân viên</label>
                <select required value={formData.userId} onChange={e => setFormData({...formData, userId: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                  {staffs.length === 0 && <option value="">Không có nhân viên nào</option>}
                  {staffs.map(staff => <option key={staff.id} value={staff.id}>{staff.fullName} ({staff.email})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ca làm việc</label>
                <select required value={formData.shiftId} onChange={e => setFormData({...formData, shiftId: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                  {shifts.length === 0 && <option value="">Chưa có ca làm việc nào</option>}
                  {shifts.map(shift => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" disabled={!formData.userId || !formData.shiftId} className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad] disabled:opacity-50">Lưu phân ca</button>
            </div>
          </form>
        </div>
      )}

      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateOpenShift} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Tạo ca trống</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ngày làm việc</label>
                <input required type="date" value={openShiftForm.workDate} onChange={e => setOpenShiftForm({...openShiftForm, workDate: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ca làm việc</label>
                <select required value={openShiftForm.shiftId} onChange={e => setOpenShiftForm({...openShiftForm, shiftId: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                  {shifts.length === 0 && <option value="">Chưa có ca làm việc nào</option>}
                  {shifts.map(shift => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea rows={2} value={openShiftForm.note} onChange={e => setOpenShiftForm({...openShiftForm, note: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowOpenShiftModal(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" disabled={!openShiftForm.shiftId} className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad] disabled:opacity-50">Tạo ca trống</button>
            </div>
          </form>
        </div>
      )}

      {showAssignOpenShiftModal && selectedOpenShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAssignOpenShift} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-slate-800">Phân ca trống</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {selectedOpenShift.shiftName} - {new Date(selectedOpenShift.workDate).toLocaleDateString("vi-VN")}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nhân viên nhận ca</label>
                <select required value={assignOpenShiftForm.userId} onChange={e => setAssignOpenShiftForm({...assignOpenShiftForm, userId: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]">
                  {staffs.length === 0 && <option value="">Không có nhân viên nào</option>}
                  {staffs.map(staff => <option key={staff.id} value={staff.id}>{staff.fullName} ({staff.email})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea rows={2} value={assignOpenShiftForm.note} onChange={e => setAssignOpenShiftForm({...assignOpenShiftForm, note: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAssignOpenShiftModal(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
              <button type="submit" disabled={!assignOpenShiftForm.userId} className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad] disabled:opacity-50">Phân ca</button>
            </div>
          </form>
        </div>
      )}

      {showSwapModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Chi tiết / Đổi ca</h3>
              <button onClick={() => setShowSwapModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6 space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Nhân viên:</span>
                <span className="font-semibold text-slate-900">{selectedSchedule.userFullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Ca làm:</span>
                <span className="font-semibold text-slate-900">{selectedSchedule.shiftName} ({selectedSchedule.startTime.substring(0,5)} - {selectedSchedule.endTime.substring(0,5)})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Ngày làm:</span>
                <span className="font-semibold text-slate-900">{new Date(selectedSchedule.workDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Điểm danh:</span>
                <select
                  value={selectedSchedule.status}
                  onChange={(e) => void handleStatusChange(selectedSchedule.id, e.target.value)}
                  disabled={selectedSchedule.publishStatus === "DRAFT"}
                  className={`rounded-full px-2 py-1 text-xs font-semibold outline-none border border-transparent hover:border-slate-300 ${STATUS_COLORS[selectedSchedule.status] || "bg-slate-100 text-slate-700"}`}
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-white text-slate-900">{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleCreateSwapRequest} className="space-y-4">
              <h4 className="font-semibold text-slate-800">Tạo yêu cầu đổi ca</h4>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nhân viên nhận ca</label>
                <select required value={swapForm.targetUserId} onChange={e => setSwapForm({...swapForm, targetUserId: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" disabled={selectedSchedule.publishStatus === "LOCKED"}>
                  <option value="">Chọn nhân viên</option>
                  {staffs.filter(staff => staff.id !== selectedSchedule.userId).map(staff => <option key={staff.id} value={staff.id}>{staff.fullName} ({staff.email})</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú đổi ca</label>
                <textarea rows={2} value={swapForm.note} onChange={e => setSwapForm({...swapForm, note: e.target.value})} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-[#E32A15]" disabled={selectedSchedule.publishStatus === "LOCKED"} />
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => { handleDelete(selectedSchedule.id); setShowSwapModal(false); }} className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                  Xóa lịch này
                </button>
                <button type="submit" disabled={!swapForm.targetUserId || selectedSchedule.publishStatus === "LOCKED"} className="rounded-lg bg-[#E32A15] px-4 py-2 text-sm font-semibold text-white hover:bg-[#247dad] disabled:opacity-50">
                  Gửi yêu cầu đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedulesPage;
