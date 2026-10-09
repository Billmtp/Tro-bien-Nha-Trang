"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showAppAlert, showAppConfirm } from "@/components/AppNotificationModal";

export default function AdminPage() {
  const router = useRouter();

  // Authentication & Access
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminKeyInput, setAdminKeyInput] = useState("");

  // Active Tab: "overview" | "moderation" | "rooms" | "users" | "crawler" | "settings"
  const [activeTab, setActiveTab] = useState<
    "overview" | "moderation" | "rooms" | "users" | "crawler" | "settings"
  >("overview");

  // Stats Data
  const [stats, setStats] = useState<any>(null);
  const [recentPending, setRecentPending] = useState<any[]>([]);

  // Rooms Data & Filters
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsTotal, setRoomsTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSite, setFilterSite] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Users Data
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Crawler Status
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([
    "Sẵn sàng quét dữ liệu tự động từ các nguồn.",
  ]);

  // Reject Modal State
  const [rejectModalRoom, setRejectModalRoom] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Check Current User
  const checkAuth = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const u = data.user;
      setCurrentUser(u);

      if (u && u.role === "admin") {
        setIsAdminAuthorized(true);
      } else {
        // Check if saved admin bypass key in localStorage
        const savedKey = localStorage.getItem("chotot_admin_key");
        if (savedKey === "admin123") {
          setIsAdminAuthorized(true);
        }
      }
    } catch {
      setIsAdminAuthorized(false);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats?devKey=admin123");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentPending(data.recentPending || []);
      }
    } catch (e) {
      console.error("Lỗi khi tải stats:", e);
    }
  };

  // Fetch Rooms
  const fetchRooms = async () => {
    setRoomsLoading(true);
    try {
      const params = new URLSearchParams({
        devKey: "admin123",
        status: filterStatus,
        category: filterCategory,
        site: filterSite,
        q: searchQuery,
      });
      const res = await fetch(`/api/admin/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
        setRoomsTotal(data.total || 0);
      }
    } catch (e) {
      console.error("Lỗi khi tải rooms:", e);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users?devKey=admin123");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Lỗi khi tải users:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthorized) {
      fetchStats();
      if (activeTab === "rooms" || activeTab === "moderation") {
        fetchRooms();
      } else if (activeTab === "users") {
        fetchUsers();
      }
    }
  }, [isAdminAuthorized, activeTab, filterStatus, filterCategory, filterSite]);

  // Actions on Rooms
  const handleRoomAction = async (roomId: number, action: string, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}?devKey=admin123`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Thao tác thất bại");

      // Refresh data
      fetchStats();
      fetchRooms();
      if (action === "approve") {
        showAppAlert("✓ Đã phê duyệt bài đăng! Tin đã xuất hiện trên trang chủ.", "Duyệt thành công", "success");
      } else if (action === "reject") {
        showAppAlert("✕ Đã từ chối bài đăng.", "Đã từ chối", "info");
        setRejectModalRoom(null);
        setRejectionReason("");
      }
    } catch (e: any) {
      showAppAlert("Lỗi: " + e.message, "Thất bại", "error");
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    showAppConfirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài đăng này khỏi hệ thống?", {
      title: "Xác nhận xóa bài đăng",
      confirmText: "Xóa vĩnh viễn",
      type: "error",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/rooms/${roomId}?devKey=admin123`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          fetchStats();
          fetchRooms();
          showAppAlert("Đã xóa vĩnh viễn bài đăng.", "Đã xóa", "success");
        } catch (e: any) {
          showAppAlert("Lỗi: " + e.message, "Thất bại", "error");
        }
      },
    });
  };

  // Actions on Users
  const handleUserAction = async (userId: number, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}?devKey=admin123`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      fetchUsers();
      fetchStats();
      showAppAlert("Cập nhật trạng thái người dùng thành công.", "Thành công", "success");
    } catch (e: any) {
      showAppAlert("Lỗi: " + e.message, "Thất bại", "error");
    }
  };

  // Run Crawler Sync
  const handleTriggerCrawler = async () => {
    setIsCrawling(true);
    setCrawlerLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🚀 Bắt đầu quét đa nguồn: Facebook Groups, Batdongsan, Alonhadat, Homedy, Chợ Tốt...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      setCrawlerLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ✓ Quét hoàn tất! Thêm mới/cập nhật: ${data.inserted || 0} bài đăng.`,
        ...prev,
      ]);
      fetchStats();
      fetchRooms();
    } catch (err: any) {
      setCrawlerLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠️ Lỗi khi quét: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setIsCrawling(false);
    }
  };

  // Admin Key Login
  const handleKeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKeyInput.trim() === "admin123") {
      localStorage.setItem("chotot_admin_key", "admin123");
      setIsAdminAuthorized(true);
    } else {
      showAppAlert("Mật mã quản trị không chính xác (Gợi ý: admin123).", "Sai mật mã", "error");
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          <span className="animate-spin text-xl">⏳</span>
          <span className="text-sm font-semibold text-gray-700">Đang kiểm tra quyền quản trị...</span>
        </div>
      </div>
    );
  }

  // Not authorized view
  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔒
            </div>
            <h2 className="text-xl font-black text-gray-900">Bảng Quản Trị Hệ Thống</h2>
            <p className="text-xs text-gray-500">
              Khu vực dành riêng cho Quản Trị Viên kiểm duyệt tin đăng và điều hành hệ thống.
            </p>
          </div>

          <form onSubmit={handleKeyLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nhập Mật Mã Quản Trị Viên
              </label>
              <input
                type="password"
                placeholder="Nhập mã (Mặc định: admin123)"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
            >
              Đăng Nhập Quản Trị
            </button>
          </form>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
            <p className="font-bold">💡 Hướng dẫn kiểm thử localhost:</p>
            <p>Mật mã quản trị nhanh: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200">admin123</code></p>
            <p>Hoặc đăng nhập với tài khoản: <code className="font-mono bg-white px-1.5 py-0.5 rounded">0909000000</code> / <code className="font-mono bg-white px-1.5 py-0.5 rounded">admin123</code></p>
          </div>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 hover:underline">
              ← Quay lại trang chủ Trọ Biển Nha Trang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Navbar Admin */}
      <header className="bg-gray-900 text-white sticky top-0 z-40 border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="bg-[#FFBA00] text-gray-900 font-black text-sm px-2 py-0.5 rounded tracking-tight">
                CHO<span className="text-white ml-0.5">TOT</span>
              </div>
            </Link>
            <div className="h-5 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-purple-400">ADMIN CONTROL CENTER</span>
              <span className="text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-700 px-2 py-0.5 rounded-full">
                Quản Trị Nha Trang
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>🌐</span>
              <span className="hidden sm:inline">Xem Trang Chủ</span>
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("chotot_admin_key");
                setIsAdminAuthorized(false);
                router.push("/");
              }}
              className="text-xs font-semibold text-red-300 hover:text-red-100 bg-red-950/60 hover:bg-red-900 border border-red-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Thoát Admin
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="bg-gray-850 border-t border-gray-800 px-4">
          <div className="max-w-7xl mx-auto flex items-center overflow-x-auto whitespace-nowrap scrollbar-none gap-1 sm:gap-2 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "overview"
                  ? "border-[#FFBA00] text-[#FFBA00]"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>📊</span>
              <span>Tổng Quan &amp; Thống Kê</span>
            </button>

            <button
              onClick={() => {
                setFilterStatus("pending");
                setActiveTab("moderation");
              }}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "moderation"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>⏳</span>
              <span>Duyệt Tin Đăng User</span>
              {stats?.pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {stats.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setFilterStatus("all");
                setActiveTab("rooms");
              }}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "rooms"
                  ? "border-purple-400 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>📑</span>
              <span>Quản Lý Toàn Bộ Tin</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "users"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>👥</span>
              <span>Quản Trị Người Dùng</span>
            </button>

            <button
              onClick={() => setActiveTab("crawler")}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "crawler"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>🔄</span>
              <span>Trung Tâm Quét Tin (Crawler)</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "settings"
                  ? "border-gray-300 text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>⚙️</span>
              <span>Cài Đặt Hệ Thống</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-6">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Tổng Bài Đăng</p>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                    {stats?.totalRooms ?? 0}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Phòng trọ &amp; Nhà đất</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                  📑
                </div>
              </div>

              <div
                onClick={() => {
                  setFilterStatus("pending");
                  setActiveTab("moderation");
                }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all hover:shadow"
              >
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1">
                    <span>Chờ Kiểm Duyệt</span>
                    {stats?.pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                    {stats?.pendingCount ?? 0}
                  </p>
                  <p className="text-[11px] text-amber-500 font-semibold mt-0.5">Bấm để duyệt ngay →</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
                  ⏳
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase">Tin Đã Duyệt</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                    {stats?.approvedCount ?? 0}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Đang hiển thị công khai</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                  ✓
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase">Thành Viên Đăng Ký</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
                    {stats?.totalUsers ?? 0}
                  </p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                    {stats?.verifiedUsersCount ?? 0} thành viên đã xác thực ✓
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
            </div>

            {/* Quick Action: Pending Moderation Alert */}
            {stats?.pendingCount > 0 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h4 className="font-black text-base sm:text-lg">
                      Có {stats.pendingCount} tin đăng mới từ người dùng đang chờ bạn phê duyệt!
                    </h4>
                    <p className="text-xs text-amber-100">
                      Tin chỉ xuất hiện trên trang chủ sau khi được Quản Trị Viên chấp thuận.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFilterStatus("pending");
                    setActiveTab("moderation");
                  }}
                  className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-100 transition-colors shrink-0 shadow"
                >
                  Duyệt Tin Ngay Bây Giờ →
                </button>
              </div>
            )}

            {/* Source Distribution & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sources */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                    <span>📡</span>
                    <span>Phân Bổ Tin Đăng Theo Nguồn Cào &amp; Người Dùng</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("crawler")}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    Quản lý nguồn →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {stats?.bySource?.map((item: any) => (
                    <div
                      key={item.sourceSite}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-semibold text-gray-500 uppercase truncate">
                        {item.sourceSite.replace("facebook_group_", "FB: ")}
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1">
                        {item._count.id} tin
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <span>🏷️</span>
                  <span>Phân Loại Danh Mục</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-orange-800">🏠 Cho Thuê Phòng Trọ / Căn Hộ</p>
                      <p className="text-xl font-black text-orange-950 mt-0.5">
                        {stats?.byCategory?.find((c: any) => c.category === "rent")?._count.id || 0} tin
                      </p>
                    </div>
                    <span className="text-2xl">🔑</span>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-rose-800">🏢 Mua Bán Nhà Đất</p>
                      <p className="text-xl font-black text-rose-950 mt-0.5">
                        {stats?.byCategory?.find((c: any) => c.category === "sale")?._count.id || 0} tin
                      </p>
                    </div>
                    <span className="text-2xl">🏡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MODERATION (DUYỆT TIN USER) ================= */}
        {activeTab === "moderation" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>⏳</span>
                  <span>Hàng Đợi Kiểm Duyệt Bài Đăng Của Người Dùng</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Theo quy định hệ thống: Mọi bài đăng từ thành viên cần được Quản Trị Viên kiểm tra tính xác thực trước khi hiển thị.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRooms}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>🔄</span> Làm mới danh sách
                </button>
              </div>
            </div>

            {roomsLoading ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
                <span className="animate-spin text-2xl inline-block mb-2">⏳</span>
                <p className="text-sm font-semibold">Đang tải danh sách chờ duyệt...</p>
              </div>
            ) : rooms.filter((r) => r.status === "pending").length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-3">
                <div className="text-4xl">🎉</div>
                <h4 className="font-black text-lg text-gray-800">Không có bài đăng nào đang chờ duyệt!</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Tất cả bài đăng của thành viên đã được xử lý xong. Khi có người dùng đăng tin mới, tin sẽ xuất hiện ngay tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {rooms
                  .filter((r) => r.status === "pending")
                  .map((room) => (
                    <div
                      key={room.id}
                      className="bg-white rounded-2xl border-2 border-amber-300 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4"
                    >
                      {/* Thumbnail Image */}
                      <div className="w-full md:w-56 h-44 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                        <img
                          src={room.images?.[0] || "/placeholders/default-room.svg"}
                          alt={room.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                          CHỜ DUYỆT
                        </span>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          📷 {room.images?.length || 1} ảnh
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-[#C25E00]">
                            {room.category === "sale" ? "Mua Bán Nhà Đất" : "Cho Thuê Phòng Trọ"}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            Khu vực: <b className="text-gray-800">{room.district}</b>
                          </span>
                          <span className="text-xs text-gray-400">
                            • Gửi lúc {new Date(room.scrapedAt).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        <h4 className="font-black text-base text-gray-900 leading-snug">
                          {room.title}
                        </h4>

                        <div className="flex items-center gap-4 text-xs">
                          <span className="font-black text-sm text-[#FF7A00]">
                            💰 {room.price > 0 ? (room.price / 1_000_000).toLocaleString() + " triệu/tháng" : "Thỏa thuận"}
                          </span>
                          <span className="text-gray-600">📐 {room.area} m²</span>
                          <span className="text-gray-600 truncate">📍 {room.address}</span>
                        </div>

                        {/* Poster Info */}
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">👤 Người đăng:</span>
                            <span className="text-gray-700">{room.contact}</span>
                            {room.user?.isVerified && (
                              <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">
                                ✓ Đã xác minh
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description excerpt */}
                        <p className="text-xs text-gray-600 line-clamp-2 italic">
                          "{room.description}"
                        </p>
                      </div>

                      {/* Moderation Action Buttons */}
                      <div className="flex md:flex-col justify-end md:justify-center gap-2 shrink-0 md:w-44 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4">
                        <button
                          onClick={() => handleRoomAction(room.id, "approve")}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>✓</span>
                          <span>PHÊ DUYỆT TIN</span>
                        </button>

                        <button
                          onClick={() => {
                            setRejectModalRoom(room);
                            setRejectionReason("");
                          }}
                          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <span>✕</span>
                          <span>Từ Chối Tin</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="w-full py-1.5 text-gray-400 hover:text-red-600 text-xs font-semibold hover:underline"
                        >
                          Xóa bài đăng
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ALL ROOMS ================= */}
        {activeTab === "rooms" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề, địa chỉ, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchRooms()}
                  className="flex-1 w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white outline-none"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã duyệt (Công khai)</option>
                    <option value="pending">Chờ kiểm duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white outline-none"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="rent">Cho thuê phòng trọ</option>
                    <option value="sale">Mua bán nhà đất</option>
                  </select>

                  <button
                    onClick={fetchRooms}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
                  >
                    Lọc
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Tổng số kết quả: <b>{roomsTotal}</b> bài đăng</span>
              </div>
            </div>

            {/* Rooms Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">Hình ảnh &amp; Tiêu đề</th>
                      <th className="p-3.5">Giá / Diện tích</th>
                      <th className="p-3.5">Nguồn tin</th>
                      <th className="p-3.5">Trạng thái</th>
                      <th className="p-3.5">Nổi bật</th>
                      <th className="p-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3.5 max-w-xs sm:max-w-md">
                          <div className="flex items-start gap-2.5">
                            <img
                              src={room.images?.[0] || "/placeholders/default-room.svg"}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate" title={room.title}>
                                {room.title}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                {room.district} • {room.contact}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-[#FF7A00] block">
                            {room.price > 0 ? (room.price / 1_000_000).toLocaleString() + " tr" : "Thỏa thuận"}
                          </span>
                          <span className="text-[11px] text-gray-500">{room.area} m²</span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                            {room.sourceSite}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {room.status === "approved" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Đã duyệt
                            </span>
                          ) : room.status === "pending" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              ⏳ Chờ duyệt
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              ✕ Từ chối
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            onClick={() => handleRoomAction(room.id, "toggle_vip")}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                              room.isVip
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-400 hover:text-amber-500"
                            }`}
                            title={room.isVip ? "Bỏ ghim VIP" : "Ghim VIP"}
                          >
                            ⭐ {room.isVip ? "VIP" : "Thường"}
                          </button>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                          {room.status === "pending" ? (
                            <button
                              onClick={() => handleRoomAction(room.id, "approve")}
                              className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[11px] hover:bg-emerald-700"
                            >
                              Duyệt
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoomAction(room.id, "toggle_active")}
                              className={`px-2 py-1 font-bold rounded text-[11px] ${
                                room.isActive
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              {room.isActive ? "Ẩn tin" : "Hiện lại"}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="px-2 py-1 bg-red-50 text-red-600 font-bold rounded text-[11px] hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: USERS ================= */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <span>👥</span>
                  <span>Danh Sách Người Dùng &amp; Quản Lý Tích Xanh Xác Thực</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cấp tích xanh xác thực danh tính chính chủ hoặc xử lý vi phạm tài khoản.
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>🔄</span> Làm mới
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3.5">Họ và Tên</th>
                    <th className="p-3.5">Số Điện Thoại</th>
                    <th className="p-3.5">Vai Trò</th>
                    <th className="p-3.5">Xác Thực (Tích Xanh)</th>
                    <th className="p-3.5">Số Bài Đã Đăng</th>
                    <th className="p-3.5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold text-gray-900">{u.name}</td>
                      <td className="p-3.5">
                        <span className="font-mono text-gray-800 block">{u.phone}</span>
                        {u.email && <span className="text-[11px] text-gray-500 block truncate">{u.email}</span>}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role === "admin" ? "Quản Trị Viên" : "Thành Viên"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {u.isVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1 w-max">
                              <span>✓</span> SĐT Đã Xác Thực
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 block">• SĐT: Chưa xác thực</span>
                          )}

                          {u.isEmailVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-max">
                              <span>✓</span> Gmail Đã Xác Thực
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 block">• Gmail: Chưa xác thực</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-gray-800">{u._count?.rooms || 0} tin</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleUserAction(u.id, "toggle_verify")}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            u.isVerified
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {u.isVerified ? "Gỡ Tích Xanh" : "Cấp Tích Xanh ✓"}
                        </button>

                        <button
                          onClick={() => handleUserAction(u.id, "toggle_ban")}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            u.isBanned
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {u.isBanned ? "Mở Khóa" : "Khóa Nick"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CRAWLER HUB ================= */}
        {activeTab === "crawler" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <span>🔄</span>
                    <span>Trung Tâm Điều Khiển Quét Đa Nguồn (Crawler &amp; Sync)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tự động thu thập bài đăng thực tế từ các hội nhóm Facebook và cổng thông tin BĐS Nha Trang.
                  </p>
                </div>

                <button
                  onClick={handleTriggerCrawler}
                  disabled={isCrawling}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span className={isCrawling ? "animate-spin" : ""}>🔄</span>
                  <span>{isCrawling ? "Đang quét các nguồn..." : "QUÉT TẤT CẢ NGUỒN NGAY"}</span>
                </button>
              </div>

              {/* Source Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  { name: "Hội Tìm Trọ Nha Trang (45k)", site: "facebook_group_tro", status: "Hoạt động", icon: "👥" },
                  { name: "Phòng Trọ Sinh Viên ĐH Nha Trang", site: "facebook_group_ntu", status: "Hoạt động", icon: "🎓" },
                  { name: "Cho Thuê Trọ Nha Trang Giá Rẻ", site: "facebook_group_giare", status: "Hoạt động", icon: "🏷️" },
                  { name: "Căn Hộ & Homestay Nha Trang", site: "facebook_group_homestay", status: "Hoạt động", icon: "🏖️" },
                  { name: "BĐS Nha Trang - Khánh Hòa", site: "facebook_group_bds_nhatrang", status: "Hoạt động", icon: "🏢" },
                  { name: "Batdongsan.com.vn Nha Trang", site: "batdongsan", status: "Hoạt động", icon: "🏢" },
                  { name: "Alonhadat.com.vn Nha Trang", site: "alonhadat", status: "Hoạt động", icon: "🏡" },
                  { name: "Homedy.com Nha Trang", site: "homedy", status: "Hoạt động", icon: "🌐" },
                  { name: "Google Maps Địa Điểm Trọ", site: "google_maps", status: "Hoạt động", icon: "🗺️" },
                  { name: "Nhà Tốt / Chợ Tốt Nha Trang", site: "nhatot", status: "Hoạt động", icon: "🛒" },
                  { name: "Phongtro123 Nha Trang", site: "phongtro123", status: "Hoạt động", icon: "📌" },
                ].map((s) => (
                  <div key={s.site} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <span className="font-bold text-gray-800">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scraper Logs Terminal */}
            <div className="bg-gray-900 rounded-2xl p-5 shadow-lg space-y-2 border border-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                <span className="font-mono font-bold text-emerald-400">⚡ LIVE CRAWLER CONSOLE</span>
                <span>Chu kỳ tự động: 4 phút / lần</span>
              </div>
              <div className="font-mono text-xs text-gray-300 space-y-1 max-h-56 overflow-y-auto">
                {crawlerLogs.map((log, i) => (
                  <p key={i} className="leading-relaxed">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm max-w-2xl space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>⚙️</span>
                <span>Cấu Hình Quy Trình Kiểm Duyệt &amp; Bảo Mật</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Thiết lập các quy tắc tự động cho hệ thống Trọ Biển Nha Trang.
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">Yêu Cầu Kiểm Duyệt Mọi Bài Đăng Mới</p>
                  <p className="text-gray-500 text-[11px] font-normal mt-0.5">
                    Bài đăng của user mặc định ở trạng thái Chờ Duyệt (Pending) cho đến khi Admin cho phép.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">Bắt Buộc Xác Thực Mã Captcha</p>
                  <p className="text-gray-500 text-[11px] font-normal mt-0.5">
                    Chống bot tự động spam tin đăng và tạo tài khoản ảo.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">Tự Động Quét Nền Real-time (Cron)</p>
                  <p className="text-gray-500 text-[11px] font-normal mt-0.5">
                    Tự động đồng bộ tin mới từ hội nhóm Facebook và cổng BĐS mỗi 4 phút.
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-purple-600 rounded" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="font-black text-base text-gray-900 flex items-center gap-2">
              <span>✕</span>
              <span>Từ Chối Bài Đăng</span>
            </h4>
            <p className="text-xs text-gray-600">
              Nhập lý do từ chối để thông báo tới người đăng tin:
            </p>
            <textarea
              rows={3}
              placeholder="Vd: Hình ảnh không rõ ràng, giá thuê không khớp với thực tế, thông tin sai lệch..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalRoom(null)}
                className="w-1/2 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => handleRoomAction(rejectModalRoom.id, "reject", rejectionReason)}
                className="w-1/2 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
