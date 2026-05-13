import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Github, LayoutDashboard, BarChart3, Share2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30 selection:text-green-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Subtle Animated Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.1),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-50" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-fade-in [animation-delay:200ms] opacity-0 mb-6">
            <span className="px-3 py-1 text-sm font-medium border border-green-500/30 bg-green-500/10 text-green-400 rounded-full">
              Coming soon: WakaTime Integration
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in [animation-delay:400ms] opacity-0">
            Your GitHub, <br />
            <span className="text-green-400">beautifully presented.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-10 animate-fade-in [animation-delay:600ms] opacity-0">
            Auto-generate your professional dev portfolio and coding dashboard 
            from your GitHub activity in seconds. No manual setup required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:800ms] opacity-0">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <Button size="lg" className="h-12 px-8 text-lg font-semibold bg-green-500 hover:bg-green-600 text-black rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                <Github className="mr-2 h-5 w-5" />
                Connect GitHub — it&apos;s free
              </Button>
            </form>
          </div>
          
          <p className="mt-8 text-sm text-gray-500 animate-fade-in [animation-delay:1000ms] opacity-0">
            Join <span className="text-white font-medium">0+</span> developers showcasing their progress.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:-translate-y-2">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 text-green-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Auto Portfolio</h3>
            <p className="text-gray-400 leading-relaxed">
              Transform your repositories into a stunning public portfolio page. 
              URL: gitfolio.app/username.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:-translate-y-2">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Coding Stats</h3>
            <p className="text-gray-400 leading-relaxed">
              Visualize your contribution history, language breakdown, and commit 
              activity with beautiful D3.js charts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:-translate-y-2">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Share & Pamer</h3>
            <p className="text-gray-400 leading-relaxed">
              Generate one-click OG cards for LinkedIn and Twitter. 
              Showcase your coding streaks and top languages.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-black font-bold text-lg">
              G
            </div>
            <span className="font-bold text-xl tracking-tight">GitFolio</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link href="https://github.com/your-repo" className="hover:text-white transition-colors">
              GitHub Repo
            </Link>
            <span className="">&copy; {new Date().getFullYear()} GitFolio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
