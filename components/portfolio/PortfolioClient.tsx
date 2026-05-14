"use client";

import { 
  Github, MapPin, Link as LinkIcon, Star, GitFork, 
  ExternalLink, LayoutDashboard, Edit3, Save, X, Camera, Plus,
  Globe, Info, Image as ImageIcon, Mail, Linkedin, Instagram, Twitter, Trash2,
  GitCommit
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ContributionHeatmap from "@/components/charts/ContributionHeatmap";
import LanguageChart from "@/components/charts/LanguageChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import FadeUp from "./animations/FadeUp";
import StaggerContainer from "./animations/StaggerContainer";
import StatNumber from "./StatNumber";

dayjs.extend(relativeTime);

const accentColorMap: Record<string, string> = {
  green: "#4ade80",
  blue: "#3b82f6",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

export default function PortfolioClient({ initialUser, session }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(initialUser);
  const originalUser = useRef(initialUser);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Stats extraction
  const rawStats = user.github_stats;
  const stats = Array.isArray(rawStats) ? rawStats[0] : rawStats;
  
  // Debugging logs as requested
  console.log("🛠️ DEBUG: user.excluded_repos =", user.excluded_repos);
  console.log("🛠️ DEBUG: stats.top_repos before filter =", stats?.top_repos);

  const excludedRepos = user.excluded_repos || [];
  const visibleTopRepos = (stats?.top_repos ?? []).filter(
    (repo: any) => !excludedRepos.includes(repo.id) && !excludedRepos.includes(String(repo.id))
  );

  const displayStats = {
    total_repos: stats?.total_repos ?? 0,
    total_stars: stats?.total_stars ?? 0,
    followers: stats?.followers ?? 0,
    languages: stats?.languages ?? {},
    contribution_data: stats?.contribution_data ?? [],
    top_repos: visibleTopRepos,
    recent_activity: stats?.recent_activity ?? []
  };

  const isOwner = session?.user?.username?.toLowerCase() === user.username.toLowerCase();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Profile & Contacts
      const res = await Promise.all([
        fetch("/api/portfolio/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headline: user.headline,
            portfolio_about: user.portfolio_about,
            custom_logo_url: user.custom_logo_url
          })
        }),
        fetch("/api/portfolio/contacts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact_email: user.contact_email,
            linkedin_url: user.linkedin_url,
            instagram_url: user.instagram_url,
            twitter_url: user.twitter_url,
            custom_links: user.custom_links || []
          })
        })
      ]);

      if (res.some(r => !r.ok)) throw new Error("Failed to save some changes");

      originalUser.current = user;
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUser(originalUser.current);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/portfolio/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setUser({ ...user, custom_logo_url: data.url });
    } catch (error) { console.error(error); }
  };

  const addCustomLink = () => {
    const currentLinks = user.custom_links || [];
    if (currentLinks.length >= 3) return;
    setUser({
      ...user,
      custom_links: [...currentLinks, { label: "", url: "" }]
    });
  };

  const updateCustomLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...(user.custom_links || [])];
    newLinks[index][field] = value;
    setUser({ ...user, custom_links: newLinks });
  };

  const removeCustomLink = (index: number) => {
    const newLinks = (user.custom_links || []).filter((_: any, i: number) => i !== index);
    setUser({ ...user, custom_links: newLinks });
  };

  // Accent Color Logic
  const accentColor = accentColorMap[user.accent_color] || "#4ade80";

  // Section Visibility Logic
  const hiddenSections = user.hidden_sections || [];
  const showAbout = user.portfolio_about || isEditing;
  const showSkills = !hiddenSections.includes("skills") || isEditing;
  const showProjects = !hiddenSections.includes("projects") || isEditing;
  const showHeatmap = !hiddenSections.includes("heatmap") || isEditing;
  const showActivity = !hiddenSections.includes("activity") || isEditing;
  const showContact = isEditing || user.contact_email || user.linkedin_url || user.instagram_url || user.twitter_url || (user.custom_links && user.custom_links.length > 0);

  const shouldAnimate = !isEditing && !prefersReduced;

  return (
    <TooltipProvider>
      <div 
        className="min-h-screen bg-background text-foreground selection:bg-[var(--accent)]/20 transition-colors duration-300 overflow-x-hidden"
        style={{ 
          '--accent': accentColor,
          '--accent-rgb': accentColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', '),
          '--accent-transparent': `${accentColor}4D`
        } as any}
      >
        {/* Admin Controls */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 items-end">
          {session && (
            <Link href="/dashboard">
              <Button className="rounded-full bg-background/90 backdrop-blur-md border border-[var(--accent)]/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.4)] hover:shadow-[0_0_25px_rgba(var(--accent-rgb),0.6)] hover:scale-105 transition-all font-bold text-xs gap-2 py-2 px-5 h-auto group text-foreground">
                <LayoutDashboard size={14} className="group-hover:text-[var(--accent)] transition-colors" /> 
                Back to Dashboard
              </Button>
            </Link>
          )}

          {isOwner && !isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-white text-black font-bold text-xs gap-2 py-2 px-5 h-auto shadow-xl hover:scale-105 transition-all border border-black/10"
            >
              <Edit3 size={14} /> Edit Portfolio
            </Button>
          )}

          {isEditing && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
              <Button variant="ghost" onClick={handleCancel} className="rounded-full bg-white/5 backdrop-blur-md text-white border border-white/10 font-bold text-xs px-5 h-10 hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-full bg-[var(--accent)] hover:brightness-110 text-black font-bold text-xs px-6 h-10 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] transition-all">
                {isSaving ? "Saving..." : <><Save size={14} className="mr-2" /> Save Changes</>}
              </Button>
            </div>
          )}
        </div>

        {/* 1. HERO SECTION */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 opacity-20 blur-[100px]" style={{ background: `radial-gradient(circle at 20% 30%, var(--accent), transparent), radial-gradient(circle at 80% 70%, #2563eb, transparent)` }} />
          <div className="container max-w-5xl mx-auto px-6 font-sans text-left text-foreground">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              {/* Avatar Animation */}
              <div className="relative shrink-0 group">
                {shouldAnimate ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0, ease: "easeOut" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 rounded-full animate-avatar-pulse z-0" />
                    <img src={user.custom_logo_url || user.avatar_url || ""} alt={user.username} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl object-cover transition-transform duration-500 group-hover:scale-[1.02] relative z-10" />
                  </motion.div>
                ) : (
                  <div className="relative">
                    <img src={user.custom_logo_url || user.avatar_url || ""} alt={user.username} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                    {isEditing && (
                      <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border-4 border-dashed border-white/40 z-10">
                        <Camera size={28} className="mb-2 text-white" />
                        <span className="text-[10px] font-black uppercase text-white tracking-widest text-center px-4">Change Photo</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    )}
                    {isEditing && <div className="absolute -top-2 -left-2 bg-[var(--accent)] p-1.5 rounded-full shadow-lg z-20"><Edit3 size={12} className="text-black" /></div>}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1">
                  {/* Name Animation */}
                  {shouldAnimate ? (
                    <motion.h1 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      className="text-4xl md:text-5xl font-extrabold tracking-tight animated-gradient-text"
                      style={{ 
                        backgroundImage: `linear-gradient(90deg, #fff 0%, var(--accent) 50%, #fff 100%)`
                      }}
                    >
                      {user.name || user.username}
                    </motion.h1>
                  ) : (
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{user.name || user.username}</h1>
                  )}

                  {isEditing ? (
                    <div className="pt-2 relative group max-w-md">
                      <Input value={user.headline || ""} onChange={(e) => setUser({...user, headline: e.target.value})} placeholder="Professional Headline (e.g. Full-stack Developer)" className="bg-white/5 border-none border-b-2 border-[var(--accent)]/50 rounded-none focus-visible:ring-0 px-0 h-10 text-xl text-[var(--accent)] placeholder:text-gray-700 font-medium" />
                      <Edit3 size={14} className="absolute -right-6 top-1/2 -translate-y-1/2 text-[var(--accent)]/30" />
                    </div>
                  ) : shouldAnimate ? (
                    <FadeUp delay={0.25}>
                      <p className="text-xl text-[var(--accent)] font-medium">{user.headline || (isOwner ? "Add a headline..." : "")}</p>
                    </FadeUp>
                  ) : (
                    <p className="text-xl text-[var(--accent)] font-medium">{user.headline || (isOwner ? "Add a headline..." : "")}</p>
                  )}
                  
                  <p className="text-sm text-muted-foreground font-mono">@{user.username}</p>
                </div>

                {shouldAnimate ? (
                  <FadeUp delay={0.35} className="space-y-4">
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{user.bio || "No bio provided."}</p>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      {user.location && <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={16} /> {user.location}</div>}
                      {user.website && <a href={user.website} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-[var(--accent)] hover:underline"><LinkIcon size={16} /> {user.website.replace(/^https?:\/\//, '')}</a>}
                    </div>
                  </FadeUp>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{user.bio || "No bio provided."}</p>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      {user.location && <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin size={16} /> {user.location}</div>}
                      {user.website && <a href={user.website} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-[var(--accent)] hover:underline"><LinkIcon size={16} /> {user.website.replace(/^https?:\/\//, '')}</a>}
                    </div>
                  </div>
                )}

                {/* Stats Row Animation */}
                {shouldAnimate ? (
                  <StaggerContainer delay={0.4} className="flex flex-wrap items-center gap-6 py-4">
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}><StatItem value={displayStats.total_repos} label="Repos" /></motion.div>
                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}><StatItem value={displayStats.total_stars} label="Stars" /></motion.div>
                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}><StatItem value={displayStats.followers} label="Followers" /></motion.div>
                  </StaggerContainer>
                ) : (
                  <div className="flex flex-wrap items-center gap-6 py-4">
                    <StatItem value={displayStats.total_repos} label="Repos" />
                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                    <StatItem value={displayStats.total_stars} label="Stars" />
                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                    <StatItem value={displayStats.followers} label="Followers" />
                  </div>
                )}

                {/* Buttons Animation */}
                {shouldAnimate ? (
                  <FadeUp delay={0.5} className="flex flex-wrap gap-3 pt-2">
                    <a href={`https://github.com/${user.username}`} target="_blank" rel="noopener">
                      <Button 
                        className="rounded-full px-6 font-bold shadow-lg transition-all bg-[var(--accent)] text-black hover:brightness-110 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(var(--accent-rgb),0.4)]"
                      >
                        <Github className="mr-2" size={18} /> Follow on GitHub
                      </Button>
                    </a>
                    <Button variant="outline" className="rounded-full px-6 font-bold border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 hover:scale-[1.03] transition-all">Hire Me</Button>
                  </FadeUp>
                ) : (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a href={`https://github.com/${user.username}`} target="_blank" rel="noopener">
                      <Button 
                        className="rounded-full px-6 font-bold shadow-lg hover:shadow-[var(--accent)]/20 transition-all bg-[var(--accent)] text-black hover:brightness-110"
                      >
                        <Github className="mr-2" size={18} /> Follow on GitHub
                      </Button>
                    </a>
                    <Button variant="outline" className="rounded-full px-6 font-bold border-[var(--accent)]/30 hover:bg-[var(--accent)]/5">Hire Me</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        {showAbout && (
          <FadeUp delay={0} className="py-20 border-b">
            <div className="container max-w-5xl mx-auto px-6">
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold border-l-4 border-[var(--accent)] pl-4 uppercase tracking-widest text-sm">About Me</h2>
                  </div>
                  {isEditing ? (
                    <div className="relative group">
                      <Textarea value={user.portfolio_about || ""} onChange={(e) => setUser({...user, portfolio_about: e.target.value})} placeholder="Tell recruiters more about your journey..." className="min-h-[180px] bg-white/[0.02] border-[var(--accent)]/20 text-base leading-relaxed focus:border-[var(--accent)] p-6 rounded-2xl font-sans placeholder:text-gray-700" />
                      <Edit3 size={18} className="absolute right-4 bottom-4 text-[var(--accent)]/30" />
                    </div>
                  ) : (
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-wrap font-sans">{user.portfolio_about}</p>
                  )}
               </div>
            </div>
          </FadeUp>
        )}

        {/* 2. SKILLS */}
        {showSkills && (
          <FadeUp className="py-24 border-b">
            <div className="container max-w-5xl mx-auto px-6">
              <div className="flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold border-b-4 border-[var(--accent)] pb-2 uppercase tracking-[0.2em] text-sm mb-16 inline-block">
                  Technical Arsenal
                </h2>
                <div className="w-full">
                  <LanguageChart languages={displayStats.languages} accentColor={accentColor} />
                </div>
              </div>
            </div>
          </FadeUp>
        )}

        {/* 3. FEATURED PROJECTS */}
        {showProjects && (
          <section className="py-24">
            <div className="container max-w-5xl mx-auto px-6 text-foreground">
              <FadeUp className="space-y-2 text-left w-full mb-16">
                <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
                <p className="text-muted-foreground">My most impactful work on GitHub.</p>
              </FadeUp>

              {shouldAnimate ? (
                <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {displayStats.top_repos.length > 0 ? displayStats.top_repos.map((repo: any) => (
                    <FadeUp key={repo.id} duration={0.6}>
                      <ProjectCard repo={repo} isEditing={isEditing} />
                    </FadeUp>
                  )) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl opacity-50"><p>No projects synced yet.</p></div>
                  )}
                </StaggerContainer>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {displayStats.top_repos.length > 0 ? displayStats.top_repos.map((repo: any) => (
                    <ProjectCard key={repo.id} repo={repo} isEditing={isEditing} />
                  )) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl opacity-50"><p>No projects synced yet.</p></div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. CONTRIBUTION HEATMAP */}
        {showHeatmap && (
          <FadeUp className="py-24 border-t bg-muted/10">
            <div className="container max-w-5xl mx-auto px-6 text-foreground text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Coding Activity</h2>
              <p className="text-muted-foreground mb-12">Snapshot of my contributions over the past year.</p>
              <div className="bg-card p-8 rounded-3xl border-2 shadow-sm overflow-hidden">
                <ContributionHeatmap data={displayStats.contribution_data} range="1y" colorScheme={user.accent_color} />
              </div>
            </div>
          </FadeUp>
        )}

        {/* 5. RECENT ACTIVITY */}
        {showActivity && (
          <section className="py-24 border-t">
            <div className="container max-w-5xl mx-auto px-6">
              <FadeUp className="space-y-2 text-left w-full mb-16">
                <h2 className="text-3xl font-bold tracking-tight">Recent Activity</h2>
                <p className="text-muted-foreground">Latest commits and events from GitHub.</p>
              </FadeUp>
              
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {displayStats.recent_activity.length > 0 ? displayStats.recent_activity.map((item: any, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                    {/* Icon Circle */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:border-[var(--accent)]/50 group-hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)] transition-all">
                      <GitCommit size={16} className="text-[var(--accent)]" />
                    </div>
                    
                    {/* Content Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-[var(--accent)]/10 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <time className="text-[10px] font-black uppercase tracking-widest text-gray-500">{dayjs(item.date).fromNow()}</time>
                        <Badge variant="outline" className="text-[9px] px-2 py-0 border-white/10 text-gray-500 group-hover:text-[var(--accent)] transition-colors">{item.repo_name}</Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-50">
                    <p className="text-sm font-medium">No recent activity found.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 6. CONTACT SECTION */}
        {showContact && (
          <section className="py-24 border-t">
            <div className="container max-w-5xl mx-auto px-6 text-center">
              <FadeUp className="space-y-4 mb-16">
                <h2 className="text-4xl font-bold tracking-tight">Get in Touch</h2>
                <p className="text-muted-foreground text-lg">Feel free to reach out for collaborations or just a hello.</p>
              </FadeUp>

              {isEditing ? (
                <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Email</Label>
                    <Input value={user.contact_email || ""} onChange={(e) => setUser({...user, contact_email: e.target.value})} placeholder="hello@example.com" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-500">LinkedIn</Label>
                    <Input value={user.linkedin_url || ""} onChange={(e) => setUser({...user, linkedin_url: e.target.value})} placeholder="linkedin.com/in/..." className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Instagram</Label>
                    <Input value={user.instagram_url || ""} onChange={(e) => setUser({...user, instagram_url: e.target.value})} placeholder="instagram.com/..." className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Twitter / X</Label>
                    <Input value={user.twitter_url || ""} onChange={(e) => setUser({...user, twitter_url: e.target.value})} placeholder="twitter.com/..." className="bg-white/5 border-white/10" />
                  </div>
                  
                  {/* Custom Links Editor */}
                  <div className="col-span-full space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-gray-500">Custom Links (Max 3)</Label>
                      <Button variant="outline" size="sm" onClick={addCustomLink} disabled={(user.custom_links || []).length >= 3} className="h-7 text-[10px] font-black uppercase tracking-tighter bg-white/5 border-white/10">
                        <Plus size={12} className="mr-1" /> Add Link
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(user.custom_links || []).map((link: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left-2">
                          <Input value={link.label} onChange={(e) => updateCustomLink(idx, "label", e.target.value)} placeholder="Label (e.g. My Blog)" className="bg-white/5 border-white/10 flex-1" />
                          <Input value={link.url} onChange={(e) => updateCustomLink(idx, "url", e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10 flex-[2]" />
                          <Button variant="ghost" size="icon" onClick={() => removeCustomLink(idx)} className="text-gray-500 hover:text-red-500 shrink-0"><Trash2 size={16} /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <StaggerContainer staggerDelay={0.08} className="flex flex-wrap justify-center gap-8 md:gap-12">
                  {user.contact_email && <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}><ContactLink href={`mailto:${user.contact_email}`} icon={<Mail size={24} />} label="Email" accentColor={accentColor} /></motion.div>}
                  {user.linkedin_url && <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}><ContactLink href={user.linkedin_url} icon={<Linkedin size={24} />} label="LinkedIn" accentColor={accentColor} /></motion.div>}
                  {user.instagram_url && <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}><ContactLink href={user.instagram_url} icon={<Instagram size={24} />} label="Instagram" accentColor={accentColor} /></motion.div>}
                  {user.twitter_url && <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}><ContactLink href={user.twitter_url} icon={<Twitter size={24} />} label="Twitter" accentColor={accentColor} /></motion.div>}
                  {(user.custom_links || []).map((link: any, idx: number) => (
                    <motion.div key={idx} variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}><ContactLink href={link.url} icon={<LinkIcon size={24} />} label={link.label} accentColor={accentColor} /></motion.div>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </section>
        )}

        {/* 6. FOOTER */}
        <footer className="py-16 border-t text-foreground">
          <div className="container max-w-5xl mx-auto px-6 text-center space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Built with</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--accent)] text-black rounded-full font-black text-xl shadow-xl hover:scale-105 transition-transform cursor-default">
                <div className="w-8 h-8 bg-background text-[var(--accent)] rounded flex items-center justify-center font-black">G</div>
                GitFolio
              </div>
            </div>
            <div className="flex justify-center gap-8">
              <Link href="/" className="text-muted-foreground hover:text-[var(--accent)] transition-colors font-bold text-sm underline decoration-[var(--accent)]/30 underline-offset-4">Create Your Own</Link>
              <a href={`https://twitter.com/intent/tweet?text=Check out my dev portfolio on GitFolio!&url=https://gitfolio.app/${user.username}`} target="_blank" rel="noopener" className="text-muted-foreground hover:text-[var(--accent)] transition-colors font-bold text-sm underline decoration-[var(--accent)]/30 underline-offset-4">Share Portfolio</a>
            </div>
            <p className="text-xs text-muted-foreground font-medium opacity-60">&copy; {new Date().getFullYear()} GitFolio. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

function StatItem({ value, label }: { value: any, label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-2xl font-bold text-foreground">
        <StatNumber value={value || 0} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">{label}</div>
    </div>
  );
}

function ContactLink({ href, icon, label, accentColor }: { href: string, icon: any, label: string, accentColor: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4 transition-all hover:-translate-y-2">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/5 transition-all shadow-sm group-hover:shadow-[var(--accent)]/20">
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">{label}</span>
    </a>
  );
}

function ProjectCard({ repo, isEditing }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({
    custom_description: repo.custom_description || "",
    live_url: repo.live_url || "",
    screenshot_url: repo.screenshot_url || "",
    is_featured: repo.is_featured || false
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/portfolio/repos/${repo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) setIsModalOpen(false);
    } catch (e) { alert("Failed to update project"); }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/portfolio/upload", { method: "POST", body: formData });
      const resData = await res.json();
      if (resData.url) setData({...data, screenshot_url: resData.url});
    } catch (e) { console.error(e); } finally { setIsUploading(false); }
  };

  return (
    <>
      <div className="group relative h-full">
        {isEditing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsModalOpen(true)} className="absolute -top-4 -right-4 z-20 w-10 h-10 bg-[var(--accent)] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)] hover:scale-110 transition-transform animate-in zoom-in duration-300 border-4 border-background"><Edit3 size={18} /></button>
            </TooltipTrigger>
            <TooltipContent className="bg-[var(--accent)] text-black font-bold">Edit Project</TooltipContent>
          </Tooltip>
        )}
        
        <Card className={`h-full border-2 transition-all duration-300 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-card overflow-hidden flex flex-col group-hover:-translate-y-1 ${isEditing ? 'border-dashed border-[var(--accent)]/20' : 'border-transparent hover:border-[var(--accent)]/40 shadow-[0_0_0_1px_var(--accent-transparent)]'}`}>
          <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center">
            {data.screenshot_url ? (
              <img src={data.screenshot_url} alt={repo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a1a2a] to-[#0d0d14] flex items-center justify-center relative transition-colors duration-300 group-hover:from-[#2a2a3a] group-hover:to-[#151520]">
                 <Github size={40} className="text-white opacity-[0.15] transition-opacity duration-300 group-hover:opacity-25" />
              </div>
            )}
            
            {/* Dark Overlay & Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
               <motion.div 
                 initial={{ y: 8, opacity: 0 }}
                 whileHover={{ scale: 1.05 }}
                 className="flex gap-3"
                 animate="visible"
                 variants={{
                   visible: { 
                     y: 0, 
                     opacity: 1,
                     transition: { delay: 0.1 } 
                   }
                 }}
               >
                 <a href={repo.html_url} target="_blank" rel="noopener" className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all text-white shadow-xl">
                   <Github size={20} />
                 </a>
                 {data.live_url && (
                   <a href={data.live_url} target="_blank" rel="noopener" className="p-3 bg-[var(--accent)]/20 backdrop-blur-md border border-[var(--accent)]/30 rounded-full hover:bg-[var(--accent)]/40 transition-all text-[var(--accent)] shadow-xl">
                     <Globe size={20} />
                   </a>
                 )}
               </motion.div>
            </div>

            {isEditing && !data.screenshot_url && <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/5 backdrop-blur-[1px] pointer-events-none"><span className="text-[10px] font-black text-[var(--accent)] bg-black/50 px-3 py-1 rounded-full border border-[var(--accent)]/20">Edit to add Screenshot</span></div>}
          </div>

          <CardContent className="p-8 flex flex-col flex-1 text-left">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold group-hover:text-[var(--accent)] transition-colors truncate pr-4">{repo.name}</h3>
              <div className="flex gap-3 opacity-100 group-hover:opacity-0 transition-opacity">
                {data.live_url && <div className="text-[var(--accent)] p-1.5 bg-[var(--accent)]/10 rounded-lg"><Globe size={18} /></div>}
                <div className="p-1.5 bg-white/5 rounded-lg"><ExternalLink size={18} className="text-muted-foreground" /></div>
              </div>
            </div>
            <p className="text-muted-foreground text-base leading-relaxed line-clamp-3 mb-10 flex-grow font-sans">{data.custom_description || repo.description || "No description provided."}</p>
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
              <Badge variant="secondary" className="rounded-md font-bold px-3 py-1 text-xs tracking-wide">{repo.language || "Unknown"}</Badge>
              <div className="flex items-center gap-5 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {repo.stargazers_count || 0}</span>
                <span className="flex items-center gap-1.5"><GitFork size={14} /> {repo.forks_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0d1117] border-white/10 text-white max-w-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3"><div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]"><Edit3 size={20} /></div>Edit Project</DialogTitle>
            <DialogDescription className="text-gray-500">Customize how this project appears on your portfolio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Project Screenshot</Label>
              <div className="relative group h-48 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[var(--accent)]/50">
                {data.screenshot_url ? (
                  <img src={data.screenshot_url} className="w-full h-full object-cover group-hover:opacity-40" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Plus size={32} />
                    <span className="text-[10px] mt-3 font-black uppercase tracking-[0.2em]">Upload Image</span>
                  </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleScreenshotUpload} accept="image/*" />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Professional Description</Label>
              <Textarea value={data.custom_description} onChange={(e) => setData({...data, custom_description: e.target.value})} placeholder="What problem did you solve?" className="bg-white/5 border-white/10 min-h-[120px] rounded-xl focus:border-[var(--accent)]/50 resize-none text-base" />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Live Demo URL</Label>
              <div className="relative">
                <Input value={data.live_url} onChange={(e) => setData({...data, live_url: e.target.value})} placeholder="https://..." className="bg-white/5 border-white/10 pl-10 h-12 rounded-xl focus:border-[var(--accent)]/50" />
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>
            <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <Label className="text-sm font-bold">Featured Project</Label>
                <p className="text-[10px] text-gray-500 font-medium">Highlight this repo on your portfolio.</p>
              </div>
              <Switch checked={data.is_featured} onCheckedChange={(val) => setData({...data, is_featured: val})} className="data-[state=checked]:bg-[var(--accent)]" />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-gray-400">Cancel</Button>
            <Button onClick={handleUpdate} className="bg-[var(--accent)] hover:brightness-110 text-black font-black px-10 h-12 rounded-xl">Save Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
