export default function RoomDetailLoading() {
  return (
    <div className="min-h-screen bg-[#EEF6FB] dark:bg-[#0B132B] transition-colors">
      {/* Top Header Skeleton */}
      <div className="bg-linear-to-r from-[#034A75] via-[#026AA7] to-[#01588B] text-white py-2.5 px-4 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-white/20 rounded-2xl animate-pulse" />
          </div>
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="h-8 bg-white/15 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-white/20 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-[#FF7A00]/80 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Skeleton Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse" />
          <span>›</span>
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse" />
          <span>›</span>
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse" />
        </div>

        {/* Loading Indicator Pill */}
        <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-950/60 border border-sky-300/60 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-ping" />
          <span>Đang mở chi tiết phòng trọ Nha Trang...</span>
        </div>

        {/* Detail Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cột trái (2 cột): Ảnh & Thông tin */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ảnh lớn */}
            <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                <span className="text-4xl opacity-30">🏖️</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 flex gap-2 overflow-hidden border-t border-slate-100 dark:border-slate-800">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Thông tin phòng */}
            <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="h-7 w-3/4 bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse" />
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="h-8 w-36 bg-rose-200 dark:bg-rose-900/40 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-md animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>

            {/* Đánh giá đa nguồn skeleton */}
            <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700/60 rounded animate-pulse" />
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Cột phải (1 cột): Chủ trọ & Tiện ích */}
          <div className="space-y-4">
            {/* Card chủ trọ */}
            <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-full bg-emerald-200 dark:bg-emerald-900/40 rounded-xl animate-pulse" />
              <div className="h-10 w-full bg-blue-200 dark:bg-blue-900/40 rounded-xl animate-pulse" />
            </div>

            {/* Card khoảng cách */}
            <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-2.5">
              <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
