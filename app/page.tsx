import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  LayoutDashboard, 
  BarChart3, 
  Share2, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Heart,
  Code2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 selection:text-green-200 overflow-x-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid-white -z-10" />
      <div className="fixed top-0 -left-4 w-72 h-72 bg-green-500/10 rounded-full blur-[120px] -z-10 animate-slow-spin" />
      <div className="fixed bottom-0 -right-4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(74,222,128,0.3)]">
              G
            </div>
            <span className="font-black text-xl tracking-tighter">GitFolio</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#showcase" className="hover:text-white transition-colors">Showcase</Link>
            <Link href="https://github.com/lev" className="hover:text-white transition-colors">GitHub</Link>
          </div>

          <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }}>
            <Button size="sm" className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-5 h-9 transition-all active:scale-95">
              Get Started
            </Button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in">
            <Sparkles size={12} fill="currentColor" />
            0+ Devs are building their brands here
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-fade-in [animation-delay:200ms]">
            Your GitHub, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500">beautifully presented.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl mb-12 animate-fade-in [animation-delay:400ms] leading-relaxed">
            Auto-generate your professional dev portfolio and coding dashboard 
            from your GitHub activity in seconds. No manual setup required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in [animation-delay:600ms]">
            <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }}>
              <Button size="lg" className="h-14 px-10 text-lg font-black bg-green-500 hover:bg-green-400 text-black rounded-2xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(74,222,128,0.3)] group">
                <Github className="mr-3 h-6 w-6" />
                Connect GitHub — It's Free
              </Button>
            </form>
            <Button variant="ghost" className="h-14 px-8 text-lg font-bold text-gray-400 hover:text-white transition-all gap-2 group">
              View Example <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Overlay */}
      <section className="container mx-auto px-6 mb-32" id="showcase">
        <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl animate-fade-in [animation-delay:800ms]">
          <div className="bg-[#0a0a0a] rounded-[2.2rem] overflow-hidden border border-white/10 aspect-[16/9] relative">
            {/* Mock Header */}
            <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-6 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
              <div className="mx-auto bg-white/5 h-6 w-48 rounded-md border border-white/5 flex items-center justify-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">gitfolio.app/lev</span>
              </div>
            </div>
            
            {/* Mock Dashboard Content */}
            <div className="p-8 grid grid-cols-12 gap-6 opacity-40 group-hover:opacity-60 transition-opacity">
              <div className="col-span-3 space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/10" />
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="space-y-3 pt-4">
                  <div className="h-10 bg-white/5 rounded-xl" />
                  <div className="h-10 bg-white/5 rounded-xl" />
                  <div className="h-10 bg-white/5 rounded-xl" />
                </div>
              </div>
              <div className="col-span-9 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                  <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                  <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                </div>
                <div className="h-64 bg-white/5 rounded-3xl border border-white/5" />
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-32 bg-white/5 rounded-3xl border border-white/5" />
                   <div className="h-32 bg-white/5 rounded-3xl border border-white/5" />
                </div>
              </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-black shadow-[0_0_50px_rgba(74,222,128,0.5)] transition-transform group-hover:scale-110 cursor-pointer">
                <div className="ml-1 w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white/[0.01] border-y border-white/5" id="features">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Everything you need to <span className="text-green-500">shine.</span></h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built by developers, for developers. We focus on the presentation so you can focus on the code.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group space-y-6 p-8 rounded-3xl bg-black/40 border border-white/5 transition-all hover:border-green-500/20 hover:bg-green-500/[0.02]">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 transition-colors group-hover:bg-green-500 group-hover:text-black">
                <LayoutDashboard size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black flex items-center gap-2">Auto Portfolio <ChevronRight size={16} className="text-gray-600" /></h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Transform your repositories into a stunning public portfolio page. 
                  Zero configuration, infinite possibilities.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group space-y-6 p-8 rounded-3xl bg-black/40 border border-white/5 transition-all hover:border-blue-500/20 hover:bg-blue-500/[0.02]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-black">
                <BarChart3 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black flex items-center gap-2">Visual Analytics <ChevronRight size={16} className="text-gray-600" /></h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  D3.js charts visualizing your language distribution, commit heatmaps, 
                  and repository growth. Data-driven branding.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group space-y-6 p-8 rounded-3xl bg-black/40 border border-white/5 transition-all hover:border-purple-500/20 hover:bg-purple-500/[0.02]">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-black">
                <Share2 size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black flex items-center gap-2">Social Sharing <ChevronRight size={16} className="text-gray-600" /></h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Generate beautiful OG images for your portfolio. Perfect for 
                  showcasing your skills on LinkedIn, Twitter, and Polywork.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6 text-center space-y-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to showcase <br/> your <span className="text-green-500 italic underline underline-offset-8">journey?</span></h2>
          <div className="flex flex-col items-center gap-6">
            <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }}>
               <Button size="lg" className="h-16 px-12 text-xl font-black bg-white text-black hover:bg-gray-100 rounded-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] group">
                 Build Your Portfolio Now
                 <Zap className="ml-3 h-6 w-6 fill-black" />
               </Button>
            </form>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Takes less than 10 seconds to setup</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-32 pb-20 group overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-green-500/20 rounded-[100%] blur-[100px] -z-10 group-hover:bg-green-500/30 transition-all duration-1000" />
        
        <div className="container mx-auto px-6 border-t border-white/5 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-transform hover:rotate-6">
                  G
                </div>
                <span className="font-black text-2xl tracking-tighter">GitFolio</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                The ultimate branding tool for developers. Turn your activity into opportunity.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Product</h4>
                <ul className="space-y-2 text-sm text-gray-500 font-bold">
                  <li><Link href="#" className="hover:text-green-500 transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-green-500 transition-colors">Showcase</Link></li>
                  <li><Link href="#" className="hover:text-green-500 transition-colors">Changelog</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-500 font-bold">
                  <li><Link href="#" className="hover:text-green-500 transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-green-500 transition-colors">Terms</Link></li>
                </ul>
              </div>
              <div className="space-y-4 col-span-2 sm:col-span-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Connect</h4>
                <div className="flex gap-4">
                  <a href="https://github.com/lev" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-400/50 hover:bg-green-400/5 transition-all">
                    <Github size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all">
                    <Code2 size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">
              &copy; {new Date().getFullYear()} GitFolio &bull; Open Source
            </p>
            
            <a 
              href="https://github.com/lev" 
              target="_blank" 
              className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 group hover:border-green-500/50 hover:bg-green-500/5 transition-all"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/50 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Github size={16} className="text-gray-400 group-hover:text-green-400 relative z-10" />
              </div>
              <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors flex items-center gap-1.5">
                made by <span className="text-white font-black group-hover:text-green-400">Lev</span> with <Heart size={12} className="text-red-500 fill-red-500 group-hover:scale-125 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
