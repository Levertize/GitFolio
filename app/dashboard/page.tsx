"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  RefreshCw, Star, GitCommit, BookOpen, Users, 
  LayoutDashboard, User, Settings, Notebook, ExternalLink,
  LogOut, ChevronRight
} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ContributionHeatmap from "@/components/charts/ContributionHeatmap";
import LanguageChart from "@/components/charts/LanguageChart";

dayjs.extend(relativeTime);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [heatmapRange, setHeatmapRange] = useState<"3m" | "6m" | "1y">("1y");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/github/sync", { method: "POST" });
      const data = await res.json();
      
      console.log("📊 DASHBOARD DATA RECEIVED:", data.data);

      if (res.ok && data.data) {
        setStats(data.data);
        console.log("🔥 RECENT ACTIVITY DATA:", data.data.recent_activity);
      } else {
        setError(data.error || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("Network error occurred while fetching stats");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (status === "loading") return <DashboardSkeleton />;
  if (error) return <ErrorState error={error} retry={fetchStats} />;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-black font-bold">G</div>
            <span className="font-bold text-xl tracking-tight">GitFolio</span>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-8">
            <img src={session?.user?.image || ""} alt="" className="w-10 h-10 rounded-full border border-white/10" />
            <div className="overflow-hidden">
              <div className="font-medium truncate">{session?.user?.name}</div>
              <div className="text-xs text-gray-500 truncate">@{session?.user?.name?.toLowerCase().replace(/\s/g, "")}</div>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink icon={<LayoutDashboard size={18} />} label="Dashboard" active />
            <NavLink icon={<User size={18} />} label="Portfolio" href={`/${session?.user?.name?.toLowerCase().replace(/\s/g, "")}`} />
            <NavLink icon={<Notebook size={18} />} label="Notes" />
            <NavLink icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium w-full text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}</h1>
            <p className="text-xs text-gray-500">
              {stats?.synced_at ? `Last synced ${dayjs(stats.synced_at).fromNow()}` : "Never synced"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync} 
              disabled={syncing}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-9"
            >
              <RefreshCw size={14} className={`mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync GitHub"}
            </Button>
            <Link href={`/${session?.user?.name?.toLowerCase().replace(/\s/g, "")}`}>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black h-9 px-4 rounded-md font-semibold">
                View Portfolio <ChevronRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Commits" value={stats?.total_commits} icon={<GitCommit size={20} className="text-green-400" />} />
            <StatCard title="Total Stars" value={stats?.total_stars} icon={<Star size={20} className="text-yellow-400" />} />
            <StatCard title="Public Repos" value={stats?.total_repos} icon={<BookOpen size={20} className="text-blue-400" />} />
            <StatCard title="Followers" value={stats?.followers} icon={<Users size={20} className="text-purple-400" />} />
          </div>

          {/* Contribution Heatmap */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Contribution Activity</CardTitle>
              <div className="flex gap-1 p-1 bg-white/5 rounded-md border border-white/5">
                {(['3m', '6m', '1y'] as const).map(range => (
                  <button 
                    key={range} 
                    onClick={() => setHeatmapRange(range)}
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${heatmapRange === range ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ContributionHeatmap 
                data={stats?.contribution_data || []} 
                loading={loading} 
                range={heatmapRange}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Language Breakdown */}
            <Card className="bg-white/[0.02] border-white/5">
              <CardHeader>
                <CardTitle className="text-base font-medium">Language Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <LanguageChart languages={stats?.languages || {}} loading={loading} />
              </CardContent>
            </Card>

            {/* Top Repos */}
            <div className="space-y-4">
              <h3 className="text-base font-medium flex items-center justify-between">
                Top Repositories
                <span className="text-xs text-gray-500 font-normal">Sorted by stars</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats?.top_repos?.map((repo: any) => (
                  <a 
                    key={repo.id} 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer h-full">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm truncate group-hover:text-green-400 transition-colors">{repo.name}</h4>
                          <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-grow">
                          {repo.description || "No description provided."}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <Badge variant="outline" className="text-[10px] py-0 px-2 border-white/10 text-gray-400">
                            {repo.language || "Unknown"}
                          </Badge>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1"><Star size={10} /> {repo.stargazers_count}</span>
                            <span className="flex items-center gap-1"><BookOpen size={10} /> {repo.forks_count}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats?.recent_activity || []).length > 0 ? (
                  stats.recent_activity.map((commit: any, i: number) => (
                    <div key={commit.sha + i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0 mt-1">
                        <GitCommit size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-white">{commit.message}</p>
                          <span className="text-[10px] text-gray-600 whitespace-nowrap">{dayjs(commit.date).fromNow()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Commited to <span className="text-green-400/80 font-mono">{commit.repo_name}</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No recent activity found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function NavLink({ icon, label, active, href }: { icon: any, label: string, active?: boolean, href?: string }) {
  const content = (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${active ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}
      {label}
    </div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : <button className="block w-full text-left">{content}</button>;
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all hover:-translate-y-1">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          {icon}
        </div>
        <div className="text-3xl font-bold">{value ?? '0'}</div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <aside className="w-64 border-r border-white/5 p-6 hidden md:block">
        <Skeleton className="h-8 w-32 bg-white/5 mb-8" />
        <Skeleton className="h-20 w-full bg-white/5 rounded-xl mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full bg-white/5" />)}
        </div>
      </aside>
      <main className="flex-1 p-8 space-y-8">
        <div className="flex justify-between">
          <Skeleton className="h-12 w-64 bg-white/5" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32 bg-white/5" />
            <Skeleton className="h-10 w-32 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full bg-white/5 rounded-xl" />
      </main>
    </div>
  );
}

function ErrorState({ error, retry }: { error: string, retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6 text-3xl">!</div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-gray-400 mb-8 max-w-md text-center">{error}</p>
      <Button onClick={retry} className="bg-white text-black hover:bg-gray-200">Try Again</Button>
    </div>
  );
}
