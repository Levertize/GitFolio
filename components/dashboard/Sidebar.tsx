"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, User, Notebook, LogOut, Settings
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Use the username directly from the session
  const displayUsername = session?.user?.username || session?.user?.name?.toLowerCase().replace(/\s/g, "");

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 h-screen sticky top-0 bg-[#0a0a0a] hidden md:flex">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-black font-bold">G</div>
          <span className="font-bold text-xl tracking-tight text-white">GitFolio</span>
        </Link>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-8">
          <img src={session?.user?.image || ""} alt="" className="w-10 h-10 rounded-full border border-white/10" />
          <div className="overflow-hidden">
            <div className="font-medium truncate text-white text-sm">{session?.user?.name}</div>
            <div className="text-xs text-gray-500 truncate">@{displayUsername}</div>
          </div>
        </div>

        <nav className="space-y-1">
          <NavLink 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            href="/dashboard" 
            active={pathname === "/dashboard"} 
          />
          <NavLink 
            icon={<User size={18} />} 
            label="Portfolio" 
            href={`/${displayUsername}`} 
            active={pathname === `/${displayUsername}`}
          />
          <NavLink 
            icon={<Notebook size={18} />} 
            label="Notes" 
            href="/dashboard/notes" 
            active={pathname.startsWith("/dashboard/notes")} 
          />
          <NavLink 
            icon={<Settings size={18} />} 
            label="Settings" 
            href="/dashboard/settings" 
            active={pathname === "/dashboard/settings"} 
          />
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 text-gray-500 hover:text-red-400 transition-colors text-sm font-medium w-full text-left"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function NavLink({ icon, label, active, href }: { icon: any, label: string, active?: boolean, href: string }) {
  return (
    <Link href={href} className="block group">
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
        active 
          ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}>
        {icon}
        {label}
      </div>
    </Link>
  );
}
