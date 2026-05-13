"use client";

import { createClient } from "@/lib/supabase";
import { 
  Github, MapPin, Link as LinkIcon, Star, GitFork, 
  ExternalLink, LayoutDashboard, Edit3, Save, X, Camera, Plus,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ContributionHeatmap from "@/components/charts/ContributionHeatmap";
import LanguageChart from "@/components/charts/LanguageChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PortfolioClient({ initialUser, session }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(initialUser);
  const originalUser = useRef(initialUser);

  // Stats extraction
  const rawStats = user.github_stats;
  const stats = Array.isArray(rawStats) ? rawStats[0] : rawStats;
  const displayStats = {
    total_repos: stats?.total_repos ?? 0,
    total_stars: stats?.total_stars ?? 0,
    followers: stats?.followers ?? 0,
    languages: stats?.languages ?? {},
    contribution_data: stats?.contribution_data ?? [],
    top_repos: stats?.top_repos ?? []
  };

  const isOwner = session?.user?.username?.toLowerCase() === user.username.toLowerCase();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Profile
      const profileRes = await fetch("/api/portfolio/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: user.headline,
          portfolio_about: user.portfolio_about,
          custom_logo_url: user.custom_logo_url
        })
      });

      if (!profileRes.ok) throw new Error("Failed to save profile");

      // Note: Repo updates are handled via individual modal saves or 
      // we could batch them here if we tracked changed repos.
      // For this implementation, we assume user & basic profile info is the main save.

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
      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setUser({ ...user, custom_logo_url: data.url });
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  // Determine primary color
  const topLang = displayStats.languages ? Object.entries(displayStats.languages).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] : null;
  const accentColor = topLang === 'TypeScript' ? '#3178c6' : 
                      topLang === 'JavaScript' ? '#f1e05a' : 
                      topLang === 'Python' ? '#3572A5' : 
                      topLang === 'Go' ? '#00ADD8' : '#23c55e';

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-300">
      {/* Admin Controls */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 items-end">
        {session && (
          <Link href="/dashboard">
            <Button className="rounded-full bg-background/90 backdrop-blur-md border border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:shadow-[0_0_25px_rgba(74,222,128,0.6)] hover:scale-105 transition-all font-bold text-xs gap-2 py-2 px-5 h-auto group text-foreground">
              <LayoutDashboard size={14} className="group-hover:text-green-400 transition-colors" /> 
              Back to Dashboard
            </Button>
          </Link>
        )}

        {isOwner && !isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-white text-black font-bold text-xs gap-2 py-2 px-5 h-auto shadow-xl hover:scale-105 transition-all"
          >
            <Edit3 size={14} /> Edit Portfolio
          </Button>
        )}

        {isEditing && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
            <Button 
              variant="ghost" 
              onClick={handleCancel}
              className="rounded-full bg-white/5 backdrop-blur-md text-white border border-white/10 font-bold text-xs px-5 h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-green-500 hover:bg-green-600 text-black font-bold text-xs px-6 h-10 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
            >
              {isSaving ? "Saving..." : <><Save size={14} className="mr-2" /> Save Changes</>}
            </Button>
          </div>
        )}
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b">
        <div 
          className="absolute inset-0 -z-10 opacity-20 blur-[100px]"
          style={{
            background: `radial-gradient(circle at 20% 30%, ${accentColor}, transparent), 
                         radial-gradient(circle at 80% 70%, #2563eb, transparent)`
          }}
        />

        <div className="container max-w-5xl mx-auto px-6 font-sans text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="relative shrink-0 group">
              <img 
                src={user.custom_logo_url || user.avatar_url || ""} 
                alt={user.username} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border-4 border-dashed border-white/20">
                  <Camera size={24} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Change Photo</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-background" title="Available for work" />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {user.name || user.username}
                </h1>
                
                {isEditing ? (
                  <div className="pt-2">
                    <Input 
                      value={user.headline || ""} 
                      onChange={(e) => setUser({...user, headline: e.target.value})}
                      placeholder="Your professional headline (e.g. Full-stack Developer)"
                      className="bg-white/5 border-none border-b border-white/20 rounded-none focus-visible:ring-0 px-0 h-8 text-xl text-green-400 placeholder:text-gray-700"
                    />
                  </div>
                ) : (
                  <p className="text-xl text-green-400 font-medium h-8">
                    {user.headline || (isOwner ? "Add a headline..." : "")}
                  </p>
                )}
                <p className="text-sm text-muted-foreground font-mono">@{user.username}</p>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {user.bio || "No bio provided."}
              </p>

              <div className="flex flex-wrap gap-4 text-sm font-medium">
                {user.location && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={16} /> {user.location}
                  </div>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-primary hover:underline">
                    <LinkIcon size={16} /> {user.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4">
                <div>
                  <div className="text-2xl font-bold">{displayStats.total_repos}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Repos</div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div>
                  <div className="text-2xl font-bold">{displayStats.total_stars}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Stars</div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div>
                  <div className="text-2xl font-bold">{displayStats.followers}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Followers</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a href={`https://github.com/${user.username}`} target="_blank" rel="noopener">
                  <Button className="rounded-full px-6 font-bold shadow-lg hover:shadow-primary/20 transition-all">
                    <Github className="mr-2" size={18} /> Follow on GitHub
                  </Button>
                </a>
                <Button variant="outline" className="rounded-full px-6 font-bold">
                  Hire Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 border-b">
        <div className="container max-w-5xl mx-auto px-6">
           <div className="space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary pl-4 uppercase tracking-widest text-sm">About Me</h2>
              {isEditing ? (
                <Textarea 
                  value={user.portfolio_about || ""}
                  onChange={(e) => setUser({...user, portfolio_about: e.target.value})}
                  placeholder="Tell recruiters more about your journey, interests, and what you're looking for..."
                  className="min-h-[150px] bg-white/[0.02] border-white/10 text-lg leading-relaxed focus:border-green-500/50"
                />
              ) : (
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                  {user.portfolio_about || (isOwner ? "Click edit to add a detailed about section..." : "Passionate about building great products and solving complex problems.")}
                </p>
              )}
           </div>
        </div>
      </section>

      {/* 2. SKILLS */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6 text-left">
              <h2 className="text-2xl font-bold border-l-4 border-primary pl-4 uppercase tracking-widest text-sm text-foreground">Skills & Tech</h2>
              <p className="text-muted-foreground leading-relaxed">
                Analysis based on the volume of code pushed across GitHub repositories.
              </p>
            </div>
            <div className="lg:col-span-2">
              <LanguageChart languages={displayStats.languages} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="space-y-2 text-left w-full mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Featured Projects</h2>
            <p className="text-muted-foreground">My most impactful work on GitHub.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayStats.top_repos.length > 0 ? displayStats.top_repos.map((repo: any) => (
              <ProjectCard key={repo.id} repo={repo} isEditing={isEditing} />
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl opacity-50 text-foreground">
                <p>No projects synced yet. Visit dashboard to sync GitHub data.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CONTRIBUTION HEATMAP */}
      <section className="py-20 border-t bg-muted/10">
        <div className="container max-w-5xl mx-auto px-6 text-foreground">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Coding Activity</h2>
            <p className="text-muted-foreground">Snapshot of my contributions over the past year.</p>
          </div>
          <div className="bg-card p-8 rounded-3xl border-2 shadow-sm overflow-hidden">
            <ContributionHeatmap data={displayStats.contribution_data} range="1y" />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-16 border-t text-foreground">
        <div className="container max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Built with</p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full font-black text-xl shadow-xl hover:scale-105 transition-transform">
              <div className="w-8 h-8 bg-background text-primary rounded flex items-center justify-center font-black">G</div>
              GitFolio
            </div>
          </div>
          
          <div className="flex justify-center gap-8">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-bold text-sm">Create Your Own</Link>
            <a href={`https://twitter.com/intent/tweet?text=Check out my dev portfolio on GitFolio!&url=https://gitfolio.app/${user.username}`} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors font-bold text-sm">
              Share Portfolio
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground font-medium opacity-60">
            &copy; {new Date().getFullYear()} GitFolio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
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

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/portfolio/repos/${repo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/portfolio/upload", { method: "POST", body: formData });
      const resData = await res.json();
      if (resData.url) setData({...data, screenshot_url: resData.url});
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <div className="group relative h-full">
        {isEditing && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-in zoom-in"
          >
            <Edit3 size={14} />
          </button>
        )}
        
        <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card overflow-hidden flex flex-col">
          {data.screenshot_url && (
            <div className="h-48 w-full overflow-hidden border-b">
              <img src={data.screenshot_url} alt={repo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <CardContent className="p-6 flex flex-col flex-1 text-left">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate pr-4">{repo.name}</h3>
              <div className="flex gap-2">
                {data.live_url && (
                  <a href={data.live_url} target="_blank" rel="noopener" className="text-green-500 hover:text-green-400">
                    <Globe size={16} />
                  </a>
                )}
                <a href={repo.html_url} target="_blank" rel="noopener">
                  <ExternalLink size={16} className="text-muted-foreground hover:text-primary shrink-0" />
                </a>
              </div>
            </div>
            <p className="text-muted-foreground text-sm line-clamp-3 mb-8 flex-grow">
              {data.custom_description || repo.description || "No description provided."}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <Badge variant="secondary" className="rounded-md font-bold px-3 py-1">
                {repo.language || "Unknown"}
              </Badge>
              <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {repo.stargazers_count || 0}</span>
                <span className="flex items-center gap-1.5"><GitFork size={14} /> {repo.forks_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0d1117] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project: {repo.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Project Screenshot</Label>
              <div className="relative group h-40 bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden">
                {data.screenshot_url ? (
                  <img src={data.screenshot_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Plus size={24} />
                    <span className="text-xs mt-2 font-bold uppercase">Upload Image</span>
                  </div>
                )}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleScreenshotUpload} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Custom Description</Label>
              <Textarea 
                value={data.custom_description}
                onChange={(e) => setData({...data, custom_description: e.target.value})}
                placeholder="Override GitHub description..."
                className="bg-white/5 border-white/10 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Live Demo URL</Label>
              <Input 
                value={data.live_url}
                onChange={(e) => setData({...data, live_url: e.target.value})}
                placeholder="https://..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="space-y-0.5">
                <Label>Featured Project</Label>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Highlight this on your main profile</p>
              </div>
              <Switch checked={data.is_featured} onCheckedChange={(val) => setData({...data, is_featured: val})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-green-500 hover:bg-green-600 text-black font-bold px-8">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
