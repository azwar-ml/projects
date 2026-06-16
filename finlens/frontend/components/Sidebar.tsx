"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wallet, PieChart, Settings, LogOut, ShieldCheck, BarChart3, MessageSquare } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-2xl p-6 flex flex-col fixed h-full z-50">
      <div className="mb-10 px-2">
        <h2 className="text-2xl font-black tracking-tighter text-violet-500">
          FinLens <span className="text-white">AI</span>
        </h2>
        <p className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase mt-1">
          Financial Dashboard
        </p>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        <SidebarItem 
          icon={<LayoutDashboard size={18}/>} 
          label="Dashboard" 
          href="/dashboard" 
          active={pathname === "/dashboard"} 
        />
        <SidebarItem 
          icon={<Wallet size={18}/>} 
          label="Transactions" 
          href="/transactions" 
          active={pathname === "/transactions"} 
        />
        <SidebarItem 
          icon={<PieChart size={18}/>} 
          label="Analytics" 
          href="/analytics" 
          active={pathname === "/analytics"} 
        />
        <SidebarItem 
          icon={<BarChart3 size={18}/>} 
          label="Expenses" 
          href="/expenses" 
          active={pathname === "/expenses"} 
        />
        <SidebarItem 
          icon={<MessageSquare size={18}/>} 
          label="Advisor" 
          href="/messaging" 
          active={pathname === "/messaging"} 
        />
        <SidebarItem 
          icon={<ShieldCheck size={18}/>} 
          label="Admin" 
          href="/admin" 
          active={pathname === "/admin"} 
        />
        <div className="pt-4 mt-4 border-t border-zinc-900">
          <SidebarItem 
            icon={<Settings size={18}/>} 
            label="Settings" 
            href="/settings" 
            active={pathname === "/settings"} 
          />
        </div>
      </nav>

      <button 
        onClick={handleLogout} 
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full justify-start text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
      >
        <LogOut size={18}/> 
        <span className="font-bold text-sm">Logout</span>
      </button>
    </aside>
  );
}

function SidebarItem({ icon, label, href, active }: { icon: any; label: string; href: string; active: boolean }) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
        active 
          ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]' 
          : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
      }`}>
        <span className={`${active ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
          {icon}
        </span>
        <span className="font-bold text-xs tracking-tight">{label}</span>
      </div>
    </Link>
  );
}