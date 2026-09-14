"use client";

import React, { useState, useMemo } from "react";
import { ResetItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { Search, ExternalLink, Filter, ChevronDown, ChevronUp, RefreshCw, Ticket } from "lucide-react";

interface HistoryTableProps {
  resets: ResetItem[];
  lang: "en" | "zh";
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ resets, lang }) => {
  const isZh = lang === "zh";
  const [filterType, setFilterType] = useState<"all" | "regular" | "banked">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtered list
  const filteredResets = useMemo(() => {
    return resets.filter((item) => {
      // Type filter
      if (filterType !== "all" && item.reset_type !== filterType) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = item.text.toLowerCase().includes(query);
        const authorMatch = item.source?.author?.toLowerCase().includes(query);
        const idMatch = item.id.includes(query);
        return textMatch || authorMatch || idMatch;
      }
      return true;
    });
  }, [resets, filterType, searchQuery]);

  return (
    <div className="rounded-2xl glass-panel p-6 sm:p-8 mb-8 border border-white/10">
      {/* Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <span>{isZh ? "历史重置与补偿卡官方日志" : "OFFICIAL RESET & COMPENSATION LOGS"}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isZh
              ? "收录来自官方公告与验证事件的全部记录，点击可直达 X 原推验证"
              : "Every officially announced usage reset and banked card, directly linked to source"}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter Pills */}
          <div className="inline-flex rounded-lg bg-white/[0.04] p-1 border border-white/[0.08]">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filterType === "all"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isZh ? "全部" : "All"} ({resets.length})
            </button>
            <button
              onClick={() => setFilterType("regular")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filterType === "regular"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isZh ? "全员重置" : "Usage Reset"}
            </button>
            <button
              onClick={() => setFilterType("banked")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filterType === "banked"
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isZh ? "补偿卡" : "Banked Cards"}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={isZh ? "搜索关键词..." : "Search logs..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg bg-white/[0.04] border border-white/[0.08] pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 w-36 sm:w-44 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Clean Modern Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 w-28">{isZh ? "发生时间" : "Date"}</th>
              <th className="py-3 px-3 w-32">{isZh ? "事件类型" : "Type"}</th>
              <th className="py-3 px-3 w-40">{isZh ? "适用范围" : "Scope"}</th>
              <th className="py-3 px-3">{isZh ? "官方原因与内容说明" : "Reason & Announcement"}</th>
              <th className="py-3 px-3 w-24 text-right">{isZh ? "官方来源" : "Source"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredResets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  {isZh ? "未找到匹配的历史记录" : "No matching reset records found."}
                </td>
              </tr>
            ) : (
              filteredResets.map((item) => {
                const dateObj = new Date(item.announced_at);
                const isRegular = item.reset_type === "regular";
                const isExpanded = expandedId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        <div>
                          {dateObj.toLocaleDateString(isZh ? "zh-CN" : "en-US", {
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {dateObj.toLocaleTimeString(isZh ? "zh-CN" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isRegular ? (
                          <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                            <RefreshCw className="h-3 w-3" />
                            <span>{isZh ? "全员重置" : "Usage Reset"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
                            <Ticket className="h-3 w-3" />
                            <span>{isZh ? "补偿卡" : "Reset Card"}</span>
                          </span>
                        )}
                      </td>

                      {/* Scope */}
                      <td className="py-3.5 px-3 text-slate-300 font-medium">
                        {isRegular
                          ? isZh
                            ? "全员付费账号"
                            : "All paid users"
                          : isZh
                          ? "受影响账号补发"
                          : "Affected subscribers"}
                      </td>

                      {/* Reason & Content */}
                      <td className="py-3.5 px-3 text-slate-300">
                        <div className="line-clamp-1 group-hover:text-white transition-colors">
                          {item.text}
                        </div>
                      </td>

                      {/* Source Link */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {item.source?.url ? (
                          <a
                            href={item.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            <span>X Post</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500">System</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable detail row */}
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={5} className="py-4 px-6 border-l-2 border-emerald-500/60">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-slate-400 text-xs">
                              <span className="font-semibold text-slate-300">
                                @{item.source?.author || "thsottiaux"}
                              </span>
                              <span>•</span>
                              <span>{formatRelativeTime(item.announced_at, lang)}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px]">ID: {item.id}</span>
                            </div>
                            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                              {item.text}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
