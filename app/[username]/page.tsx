import { createAdminSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { 
  Github, MapPin, Link as LinkIcon, Star, GitFork, 
  ExternalLink, LayoutDashboard 
} from "lucide-react";
import ContributionHeatmap from "@/components/charts/ContributionHeatmap";
import LanguageChart from "@/components/charts/LanguageChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: { username: string };
}

// 1. Data Fetching
async function getPortfolioData(username: string) {
  const supabase = createAdminSupabase();

  console.log(`🔍 FETCHING PORTFOLIO FOR: "${username}"`);

  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      github_stats (*)
    `)
    .ilike("username", username)
    .single();

  if (error || !user) {
    console.warn("⚠️ USER NOT FOUND OR DB ERROR", error?.message);
    return null;
  }

  if (!user.is_public) {
    console.warn("🔒 USER PROFILE IS PRIVATE");
    return null;
  }

  return user;
}

// 2. Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getPortfolioData(params.username);

  if (!user) return { title: "User Not Found | GitFolio" };

  const title = `${user.name || user.username}'s Portfolio | GitFolio`;
  const description = user.bio || `Check out ${user.username}'s coding activity and projects on GitFolio.`;
  const ogImage = `/api/og?username=${user.username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const user = await getPortfolioData(params.username);
  const session = await auth();

  if (!user) notFound();

  // FIX: Access github_stats correctly from the joined array
  const stats = user.github_stats?.[0] || {};
  const topRepos = stats.top_repos || [];
  
  // Determine primary color from top language for the mesh gradient
  const topLang = stats.languages ? Object.entries(stats.languages).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] : null;
  const accentColor = topLang === 'TypeScript' ? '#3178c6' : 
                      topLang === 'JavaScript' ? '#f1e05a' : 
                      topLang === 'Python' ? '#3572A5' : 
                      topLang === 'Go' ? '#00ADD8' : '#23c55e';

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-300">
      {/* Dashboard Access Button (Floating Top Right) */}
      {session && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <Link href="/dashboard">
            <Button className="rounded-full bg-background/90 backdrop-blur-md border border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.4)] hover:shadow-[0_0_25px_rgba(74,222,128,0.6)] hover:scale-105 transition-all font-bold text-xs gap-2 py-2 px-5 h-auto group">
              <LayoutDashboard size={14} className="group-hover:text-green-400 transition-colors" /> 
              <span className="text-foreground">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b">
        {/* Subtle Mesh Gradient */}
        <div 
          className="absolute inset-0 -z-10 opacity-20 blur-[100px]"
          style={{
            background: `radial-gradient(circle at 20% 30%, ${accentColor}, transparent), 
                         radial-gradient(circle at 80% 70%, #2563eb, transparent)`
          }}
        />

        <div className="container max-w-5xl mx-auto px-6 font-sans">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            <div className="relative">
              <img 
                src={user.avatar_url || ""} 
                alt={user.username} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-background" title="Available for work" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {user.name || user.username}
                </h1>
                <p className="text-xl text-muted-foreground font-medium">@{user.username}</p>
              </div>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {user.bio || "No bio provided."}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium">
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

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 py-4">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold">{stats.total_repos || 0}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Repos</div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold">{stats.total_stars || 0}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Stars</div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold">{stats.followers || 0}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Followers</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
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

      {/* 2. ABOUT & SKILLS */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">Skills & Tech</h2>
              <p className="text-muted-foreground leading-relaxed">
                Analysis based on the volume of code pushed across {stats.total_repos || 0} repositories.
              </p>
            </div>
            <div className="lg:col-span-2">
              <LanguageChart languages={stats.languages || {}} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-12">
            <div className="space-y-2 text-left w-full">
              <h2 className="text-3xl font-bold tracking-tight text-primary">Featured Projects</h2>
              <p className="text-muted-foreground">My most impactful work on GitHub.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topRepos.length > 0 ? topRepos.map((repo: any) => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener" className="group">
                <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl bg-card">
                  <CardContent className="p-6 flex flex-col h-full text-left">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate pr-4">{repo.name}</h3>
                      <ExternalLink size={16} className="text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-8 flex-grow">
                      {repo.description || "No description provided."}
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
              </a>
            )) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground">
                No public repositories found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CONTRIBUTION HEATMAP */}
      <section className="py-20 border-t bg-muted/10">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Coding Activity</h2>
            <p className="text-muted-foreground">Snapshot of my contributions over the past year.</p>
          </div>
          <div className="bg-card p-8 rounded-3xl border-2 shadow-sm overflow-hidden">
            <ContributionHeatmap data={stats.contribution_data || []} range="1y" />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-16 border-t">
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
