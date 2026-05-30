import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BadgePercent, CalendarDays, FileText, LayoutDashboard, LogOut, Package, ShoppingBag, ShoppingCart, Users, Bell, TicketPercent } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAdminOrderWebSocket } from "../hooks/useAdminOrderWebSocket";
import { useEffect, useState } from "react";
import type { AdminOrderEvent } from "../types/admin";

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { lastEvent } = useAdminOrderWebSocket();
  const [notifications, setNotifications] = useState<AdminOrderEvent[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (lastEvent) {
      setNotifications(prev => [lastEvent, ...prev].slice(0, 50));
    }
  }, [lastEvent]);

  const unreadCount = notifications.length;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ADMIN");

  const allMenuItems = [
    { name: "Bảng điều khiển", path: "/admin/dashboard", icon: LayoutDashboard, adminOnly: true },
    { name: "Bán hàng tại quầy", path: "/admin/pos", icon: ShoppingCart },
    { name: "Quản lý sản phẩm", path: "/admin/products", icon: Package },
    { name: "Đơn hàng", path: "/admin/orders", icon: ShoppingBag },
    { name: "Hóa đơn", path: "/admin/invoices", icon: FileText },
    { name: "Khuyến mại (SP)", path: "/admin/promotions", icon: BadgePercent },
    { name: "Mã giảm giá (Đơn)", path: "/admin/coupons", icon: TicketPercent },
    { name: "Khách hàng", path: "/admin/users", icon: Users, adminOnly: true },
    {
      name: "Nhân sự",
      path: "/admin/staffs",
      icon: Users,
      adminOnly: true,
      children: [
        { name: "Ca làm việc", path: "/admin/shifts", icon: Package },
        { name: "Lịch làm", path: "/admin/schedules", icon: CalendarDays }
      ]
    }
  ];

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  const activeMenuItem =
    menuItems.flatMap((item) => [item, ...(item.children ?? [])]).find((item) => pathname.startsWith(item.path)) ??
    menuItems[0];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="relative w-64 border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <Link to="/admin/dashboard" className="text-xl font-black text-[#E32A15]">
            SHOE<span className="text-slate-900">ADMIN</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            const hasActiveChild = item.children?.some((child) => pathname.startsWith(child.path));
            const isExpanded = isActive || hasActiveChild;

            return (
              <div key={item.path} className="space-y-1">
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isExpanded ? "bg-[#E32A15]/10 text-[#E32A15]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={20} className={isExpanded ? "text-[#E32A15]" : "text-slate-400"} />
                  {item.name}
                </Link>

                {item.children && (
                  <div className="space-y-1 pl-9">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = pathname.startsWith(child.path);

                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            isChildActive
                              ? "bg-[#E32A15]/10 text-[#E32A15]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <ChildIcon size={18} className={isChildActive ? "text-[#E32A15]" : "text-slate-400"} />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">A</div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-900">{user?.email}</p>
              <p className="text-xs text-slate-500">{isAdmin ? "Administrator" : "Nhân viên"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h1 className="text-lg font-bold text-slate-800">{activeMenuItem.name}</h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); if (showNotifications) setNotifications([]); }}
                className="relative flex items-center justify-center p-2 text-slate-600 transition hover:bg-slate-100 rounded-full"
                title="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E32A15] text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50">
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Thông báo mới</h3>
                    <button onClick={() => setNotifications([])} className="text-xs text-[#E32A15] hover:underline">Xóa tất cả</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">Không có thông báo nào</div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((notif, idx) => (
                          <div key={idx} className="border-b border-slate-50 p-4 hover:bg-slate-50 transition">
                            <p className="text-sm font-medium text-slate-800">{notif.message || (notif.orderCode ? `Đơn hàng #${notif.orderCode}` : "Thông báo hệ thống")}</p>
                            <p className="mt-1 text-xs text-slate-500 capitalize">{(notif.eventType || "").replace(/_/g, " ").toLowerCase()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link to="/" className="text-sm font-medium text-[#E32A15] hover:underline">Xem trang cửa hàng</Link>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
