import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Target, Map, Users } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/status', icon: Target, label: '状态' },
  { path: '/timeline', icon: Map, label: '地图' },
  { path: '/advisors', icon: Users, label: '顾问' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(620px,calc(100%-28px))]">
      <div className="bg-white/92 backdrop-blur-xl rounded-3xl border border-[rgba(8,22,20,0.1)] shadow-[0_22px_70px_rgba(8,22,20,0.16)] p-2">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 min-h-[50px] rounded-[17px] text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#ecfff8] to-[#eefcff] text-[#087b64]' 
                    : 'text-[rgba(8,22,20,0.68)] hover:bg-[rgba(8,22,20,0.04)]'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
