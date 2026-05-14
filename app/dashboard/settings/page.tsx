"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Check, 
  Trash2, 
  Palette,
  Github,
  Globe,
  Settings as SettingsIcon,
  ShieldCheck,
  Zap,
  Layout,
  ChevronDown,
  Eye,
  Copy,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  Circle
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

dayjs.extend(relativeTime);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [savingSync, setSavingSync] = useState(false);
  const [savingCustomization, setSavingCustomization] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Account State
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [slugMessage, setSlugMessage] = useState("");

  // Sync State
  const [syncFrequency, setSyncFrequency] = useState("1h");
  const [excludedRepos, setExcludedRepos] = useState<number[]>([]);
  const [allRepos, setAllRepos] = useState<any[]>([]);
  const [repoSearch, setRepoSearch] = useState("");
  const [syncCooldown, setSyncCooldown] = useState(0);

  // Customization State
  const [accentColor, setAccentColor] = useState('green');
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  // Danger Zone State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setSlug(data.custom_slug || data.username);
        setAccentColor(data.accent_color || 'green');
        setSyncFrequency(data.sync_frequency || '1h');
        setExcludedRepos(data.excluded_repos || []);
        setHiddenSections(data.hidden_sections || []);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRepos = async () => {
    try {
      const res = await fetch("/api/github/repos");
      if (res.ok) {
        const data = await res.json();
        setAllRepos(data);
      }
    } catch (err) {
      console.error("Failed to fetch all repos:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAllRepos();
  }, []);

  // Sync Cooldown Timer
  useEffect(() => {
    if (syncCooldown <= 0) return;
    const timer = setInterval(() => {
      setSyncCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [syncCooldown]);

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Filtered Repos
  const filteredRepos = useMemo(() => {
    return allRepos.filter(repo => 
      repo.name.toLowerCase().includes(repoSearch.toLowerCase())
    );
  }, [allRepos, repoSearch]);

  // Debounce slug check (rest of code...)
  useEffect(() => {
    if (!user || slug === (user.custom_slug || user.username)) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }

    if (slug.length < 3) {
      setSlugStatus("idle");
      setSlugMessage("Too short");
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus("checking");
      try {
        const res = await fetch(`/api/settings/check-slug?slug=${slug}`);
        const data = await res.json();
        if (data.available) {
          setSlugStatus("available");
          setSlugMessage("Available");
        } else {
          setSlugStatus("taken");
          setSlugMessage(data.message || "Taken");
        }
      } catch (err) {
        setSlugStatus("idle");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [slug, user]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    try {
      const res = await fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_slug: slug })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Account settings saved!");
        setUser({ ...user, custom_slug: data.slug });
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSavingAccount(false);
    }
  };

  const handleToggleVisibility = async (checked: boolean) => {
    setSavingVisibility(true);
    try {
      const res = await fetch("/api/settings/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: checked })
      });
      if (res.ok) {
        setUser({ ...user, is_public: checked });
        showToast(`Portfolio set to ${checked ? "public" : "private"}`);
      } else {
        showToast("Failed to update visibility", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleManualSync = async () => {
    if (syncCooldown > 0) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/github/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser({ 
          ...user, 
          github_stats: { 
            ...user.github_stats, 
            synced_at: new Date().toISOString() 
          } 
        });
        showToast("GitHub data synced successfully!");
        setSyncCooldown(300); // 5 minutes
      } else {
        showToast("Sync failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveSyncSettings = async () => {
    setSavingSync(true);
    try {
      const res = await fetch("/api/settings/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sync_frequency: syncFrequency, 
          excluded_repos: excludedRepos 
        })
      });
      if (res.ok) {
        showToast("Sync settings saved!");
      } else {
        showToast("Failed to save sync settings", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSavingSync(false);
    }
  };

  const handleSaveCustomization = async () => {
    setSavingCustomization(true);
    try {
      const res = await fetch("/api/settings/customization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          accent_color: accentColor, 
          hidden_sections: hiddenSections 
        })
      });
      if (res.ok) {
        showToast("Appearance settings saved!");
      } else {
        showToast("Failed to save customization", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSavingCustomization(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/?deleted=true" });
      } else {
        showToast("Failed to delete account", "error");
        setDeleting(false);
      }
    } catch (err) {
      showToast("Network error", "error");
      setDeleting(false);
    }
  };

  const toggleRepo = (repoId: number) => {
    setExcludedRepos(prev => 
      prev.includes(repoId) 
        ? prev.filter(id => id !== repoId) 
        : [...prev, repoId]
    );
  };

  const toggleSection = (section: string) => {
    setHiddenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const copyLink = () => {
    const link = `gitfolio.app/${user.custom_slug || user.username}`;
    navigator.clipboard.writeText(link);
    showToast("Link copied to clipboard!");
  };

  if (loading) return <SettingsSkeleton />;

  const portfolioUrl = `gitfolio.app/${slug}`;
  const stats = Array.isArray(user.github_stats) ? user.github_stats[0] : user.github_stats;
  const lastSyncedAt = stats?.synced_at;

  const colorMap: Record<string, string> = {
    green: "bg-[#4ade80]",
    blue: "bg-[#3b82f6]",
    purple: "bg-[#a855f7]",
    orange: "bg-[#f97316]",
    pink: "bg-[#ec4899]",
    cyan: "bg-[#06b6d4]"
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      <Sidebar />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          toast.type === "success" ? "bg-green-500 text-black border-green-400" : "bg-red-500 text-white border-red-400"
        }`}>
          {toast.type === "success" ? <Check size={18} strokeWidth={3} /> : <AlertTriangle size={18} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-red-500 flex items-center gap-2">
              <AlertTriangle size={20} /> Are you sure?
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-2 leading-relaxed">
              This action will permanently delete your account, your portfolio, and all your saved notes. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Type your username <span className="text-white">"{user.username}"</span> to confirm:
            </p>
            <Input 
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={user.username}
              className="bg-black/40 border-white/10 h-12 rounded-xl focus:border-red-500/50 transition-all font-bold"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteModal(false)}
              className="font-bold rounded-xl hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={deleteInput !== user.username || deleting}
              onClick={handleDeleteAccount}
              className="font-black rounded-xl px-6 bg-red-600 hover:bg-red-500"
            >
              {deleting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto w-full px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-green-500 shadow-inner">
                <SettingsIcon size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Settings</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">System Configuration</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-4">
          
          {/* 1. Account */}
          <SettingsSection 
            title="Profile URL" 
            description="Customize your public handle and portfolio link."
          >
            <div className="grid gap-8">
              {/* Avatar & Read-only info */}
              <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full border-2 border-white/10" />
                <div>
                  <div className="text-base font-bold text-white">{user.name} <span className="text-gray-500 font-normal ml-1">(@{user.username})</span></div>
                  <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">Synced from GitHub — cannot be changed</div>
                  <Link href={`/${user.username}`} className="text-[10px] text-green-500 hover:underline font-bold mt-2 block uppercase tracking-tighter">View Public Profile</Link>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                  <Globe size={12} className="text-green-500" /> Public Handle
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-bold select-none">gitfolio.app/</div>
                    <Input 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                      placeholder={user.username} 
                      className="pl-[100px] bg-black/40 border-white/10 h-14 rounded-2xl focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-white" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {slugStatus === "checking" && <Loader2 size={14} className="animate-spin text-gray-500" />}
                      {slugStatus === "available" && <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase"><Check size={12} strokeWidth={3} /> Available</div>}
                      {slugStatus === "taken" && <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase"><Trash2 size={12} /> {slugMessage}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-gray-400 font-medium">Your portfolio will be at: <span className="text-green-500">{portfolioUrl}</span></p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-white/5 p-3 rounded-xl border border-white/5">
                    <Zap size={12} className="text-yellow-500" />
                    <span>Changing your handle will break your current portfolio link immediately.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveAccount}
                  disabled={savingAccount || slugStatus === "checking" || (slugStatus === "taken" && slug !== user.custom_slug)}
                  className="bg-green-500 text-black hover:bg-green-400 font-black h-12 px-10 rounded-2xl shadow-[0_0_20px_rgba(74,222,128,0.2)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingAccount ? "Saving..." : "Save handle"}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* 2. Portfolio Visibility */}
          <SettingsSection 
            title="Privacy" 
            description="Manage your profile's public accessibility."
          >
            <div className="space-y-6">
              <div className={`group flex items-center justify-between p-6 bg-black/40 border transition-all rounded-3xl ${user.is_public ? "border-white/10 hover:border-white/20" : "border-yellow-500/20 bg-yellow-500/[0.02]"}`}>
                <div className="flex gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${user.is_public ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}>
                    {user.is_public ? <Eye size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">
                      {user.is_public ? "Public Profile" : "Private Profile"}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 max-w-[300px]">
                      {user.is_public 
                        ? "Anyone with the link can view your portfolio" 
                        : "Only you can see your portfolio"}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  {savingVisibility && <Loader2 size={16} className="absolute -left-8 top-1/2 -translate-y-1/2 animate-spin text-green-500" />}
                  <Switch 
                    checked={user.is_public} 
                    onCheckedChange={handleToggleVisibility}
                    disabled={savingVisibility}
                    className="data-[state=checked]:bg-green-500 scale-125 mr-2" 
                  />
                </div>
              </div>

              {!user.is_public && (
                <div className="flex items-start gap-4 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-yellow-200/80 leading-relaxed font-medium">
                    Your portfolio at <span className="font-bold text-yellow-500">gitfolio.app/{user.custom_slug || user.username}</span> will return 404 for visitors until you set it back to public.
                  </p>
                </div>
              )}

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-gray-500 uppercase font-black tracking-widest">Your Link:</div>
                  <a 
                    href={`/${user.custom_slug || user.username}`} 
                    target="_blank" 
                    className="text-sm font-bold text-green-500 hover:underline flex items-center gap-1"
                  >
                    gitfolio.app/{user.custom_slug || user.username}
                    <ExternalLink size={12} />
                  </a>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyLink}
                  className="h-9 px-4 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all font-bold text-xs gap-2"
                >
                  <Copy size={14} /> Copy link
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* 3. GitHub Sync */}
          <SettingsSection 
            title="GitHub Sync" 
            description="Control how GitFolio fetches your GitHub activity."
          >
            <div className="grid gap-10">
              {/* Sync Status */}
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                    <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Last synced: <span className="text-green-500">{lastSyncedAt ? dayjs(lastSyncedAt).fromNow() : "Never"}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Automated sync runs in the background</div>
                  </div>
                </div>
                <Button 
                  onClick={handleManualSync}
                  disabled={syncing || syncCooldown > 0}
                  className="h-12 px-6 rounded-2xl bg-white text-black hover:bg-gray-200 font-black text-xs gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {syncCooldown > 0 ? `Available in ${formatCooldown(syncCooldown)}` : "Sync Now"}
                </Button>
              </div>

              {/* Sync Frequency */}
              <div className="space-y-4">
                <Label className="text-[11px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-green-500" /> Sync Frequency
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Every 1 hour", value: "1h" },
                    { label: "Every 6 hours", value: "6h" },
                    { label: "Manual only", value: "manual" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSyncFrequency(option.value)}
                      className={`h-14 rounded-2xl border font-bold text-xs transition-all ${
                        syncFrequency === option.value 
                          ? "bg-green-500 border-green-400 text-black shadow-[0_0_15px_rgba(74,222,128,0.2)]" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excluded Repos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                    <Github size={12} className="text-green-500" /> Repositories visibility
                  </Label>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">{allRepos.length} Repos Found</div>
                </div>
                
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input 
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Search repositories..."
                    className="pl-11 bg-black/40 border-white/10 h-12 rounded-xl text-sm"
                  />
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredRepos.length > 0 ? filteredRepos.map((repo) => {
                      const isExcluded = excludedRepos.includes(repo.id);
                      return (
                        <div 
                          key={repo.id}
                          onClick={() => toggleRepo(repo.id)}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isExcluded ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                              <Github size={14} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">{repo.name}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{repo.language || "No language"}</div>
                            </div>
                          </div>
                          <Switch 
                            checked={!isExcluded}
                            onCheckedChange={() => toggleRepo(repo.id)}
                            className="data-[state=checked]:bg-green-500 scale-90"
                          />
                        </div>
                      );
                    }) : (
                      <div className="py-12 text-center text-gray-600 font-bold text-xs uppercase tracking-widest">No repositories found</div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 italic bg-white/5 p-3 rounded-xl border border-white/5">
                  Excluded repos won't appear in your portfolio or contribute to your stats.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveSyncSettings}
                  disabled={savingSync}
                  className="bg-green-500 text-black hover:bg-green-400 font-black h-12 px-10 rounded-2xl shadow-[0_0_20px_rgba(74,222,128,0.2)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingSync ? "Saving..." : "Save Sync Settings"}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* 4. Portfolio Customization */}
          <SettingsSection 
            title="Portfolio Appearance" 
            description="Customize the aesthetic of your public profile."
          >
            <div className="grid gap-12">
              {/* Accent Color */}
              <div className="space-y-5">
                <Label className="text-[11px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                  <Palette size={12} className="text-green-500" /> Portfolio accent color
                </Label>
                <div className="flex flex-wrap gap-5">
                  {['green', 'blue', 'purple', 'orange', 'pink', 'cyan'].map((c) => (
                    <button 
                      key={c}
                      onClick={() => setAccentColor(c)}
                      className={`w-12 h-12 rounded-2xl transition-all relative group active:scale-90 ${colorMap[c]} ${accentColor === c ? "ring-4 ring-white shadow-2xl scale-110 z-10" : "opacity-40 hover:opacity-100"}`}
                    >
                      {accentColor === c && (
                        <div className="absolute inset-0 flex items-center justify-center text-black">
                          <Check size={20} strokeWidth={3} />
                        </div>
                      )}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {c}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visible Sections */}
              <div className="space-y-5">
                <Label className="text-[11px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-2">
                  <Layout size={12} className="text-green-500" /> Show/hide portfolio sections
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "skills", label: "Skills & Tech", desc: "Show your language distribution chart" },
                    { key: "projects", label: "Featured Projects", desc: "Display your selected repositories" },
                    { key: "heatmap", label: "Contribution Activity", desc: "Show your GitHub heatmap" }
                  ].map((section) => {
                    const isHidden = hiddenSections.includes(section.key);
                    return (
                      <div 
                        key={section.key}
                        onClick={() => toggleSection(section.key)}
                        className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                          !isHidden ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5 opacity-50"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{section.label}</div>
                          <div className="text-[10px] text-gray-500 mt-1">{section.desc}</div>
                        </div>
                        <Switch 
                          checked={!isHidden}
                          onCheckedChange={() => toggleSection(section.key)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <Circle size={10} className="text-blue-500 fill-blue-500" />
                  <p className="text-[10px] text-gray-400 font-medium">Hidden sections won't be visible to portfolio visitors</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveCustomization}
                  disabled={savingCustomization}
                  className="bg-green-500 text-black hover:bg-green-400 font-black h-12 px-10 rounded-2xl shadow-[0_0_20px_rgba(74,222,128,0.2)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingCustomization ? "Saving..." : "Save Customization"}
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* 5. Danger Zone */}
          <SettingsSection 
            title="Danger Zone" 
            description="Destructive actions that cannot be undone."
          >
            <div className="p-8 border border-red-500/20 bg-red-500/[0.03] rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle size={120} className="text-red-500" />
              </div>
              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-lg font-black text-red-400">Delete Account</div>
                  <div className="text-xs text-gray-500 mt-1 max-w-[350px]">Permanently delete your account and all associated data. This action cannot be undone.</div>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteModal(true)}
                className="font-black h-14 px-10 rounded-2xl border-2 border-red-500/20 bg-transparent hover:bg-red-500 text-red-500 hover:text-white transition-all active:scale-95"
              >
                Delete Account
              </Button>
            </div>
          </SettingsSection>

          <footer className="pt-20 pb-24 text-center">
            <div className="h-px w-24 bg-white/5 mx-auto mb-6" />
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">GitFolio &bull; Version 1.0.4</p>
          </footer>

        </div>
      </main>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 p-8 space-y-12 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-12 h-12 rounded-2xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-white/5" />
            <Skeleton className="h-4 w-48 bg-white/5" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-1/3 space-y-4">
              <Skeleton className="h-8 w-40 bg-white/5" />
              <Skeleton className="h-20 w-full bg-white/5" />
            </div>
            <Skeleton className="flex-1 h-64 bg-white/5 rounded-3xl" />
          </div>
        ))}
      </main>
    </div>
  );
}
