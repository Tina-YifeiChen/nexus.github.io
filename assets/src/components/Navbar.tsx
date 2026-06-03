import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onAuthClick: () => void;
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/status', label: '状态' },
    { path: '/timeline', label: '地图' },
    { path: '/advisors', label: '顾问' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#081614]/8">
      <div className="max-w-[1180px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#22d3a6] to-[#58d7ff] grid place-items-center font-bold text-white">
            NX
          </div>
          <div>
            <div className="font-bold text-lg text-[#081614]">Nexus AI</div>
            <div className="text-xs text-[#081614]/55">港校申请智能助手</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#081614]/72">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`no-underline transition-colors hover:text-[#087b64] ${
                location.pathname === item.path ? 'text-[#087b64]' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#081614]/70">你好，{user.full_name || user.email.split('@')[0]}</span>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg bg-[#081614] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-4 py-2 rounded-lg bg-[#081614] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
