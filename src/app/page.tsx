import fallbackResets from "@/data/fallback-resets.json";
import { calculateStats, formatRelativeTime, formatUtcTime } from "@/lib/utils";
import { ResetItem } from "@/lib/types";

export default function Home() {
  const resets = fallbackResets as ResetItem[];
  const stats = calculateStats(resets);
  const latest = resets[0];

  return (
    <main className="min-h-screen bg-[#0F111A] text-white p-4 md:p-8 flex flex-col items-center">
      {/* Test Banner for Card when-20260910-01 */}
      <div className="w-full max-w-4xl border-[3px] border-black bg-[#181B26] p-6 shadow-pixel mb-8">
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍄</span>
            <h1 className="font-pixel text-lg md:text-xl text-mario-coin">
              WHENRESET: MARIO EDITION
            </h1>
          </div>
          <span className="font-pixel text-xs bg-mario-green text-black px-2 py-1">
            STAGE 1 READY
          </span>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Base scaffold &amp; 53 fallback data successfully loaded. Next.js 15 App Router &amp; API routes operational.
        </p>

        {/* Quick Data Verification Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-pixel text-xs">
          <div className="border-2 border-black bg-[#0F111A] p-3 shadow-pixel-sm">
            <div className="text-gray-400 mb-1">TOTAL RESETS</div>
            <div className="text-xl text-mario-coin">{stats.total}</div>
          </div>
          <div className="border-2 border-black bg-[#0F111A] p-3 shadow-pixel-sm">
            <div className="text-gray-400 mb-1">AVG INTERVAL</div>
            <div className="text-xl text-mario-green">{stats.avg_interval_days}d</div>
          </div>
          <div className="border-2 border-black bg-[#0F111A] p-3 shadow-pixel-sm">
            <div className="text-gray-400 mb-1">LONGEST WAIT</div>
            <div className="text-xl text-mario-red">{stats.longest_wait_days}d</div>
          </div>
        </div>

        {/* Latest Reset Detail */}
        {latest && (
          <div className="border-2 border-black bg-[#0F111A] p-4 text-xs font-mono">
            <div className="font-pixel text-mario-coin text-xs mb-2 flex items-center gap-2">
              <span>🪙</span> LATEST DETECTED RESET ({latest.reset_type.toUpperCase()})
            </div>
            <div className="text-gray-300 mb-2 font-bold">{latest.text}</div>
            <div className="text-gray-500 text-[11px] flex flex-wrap gap-4">
              <span>Time: {formatUtcTime(latest.announced_at)}</span>
              <span>({formatRelativeTime(latest.announced_at)})</span>
              <a
                href={latest.source.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                View on X &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
