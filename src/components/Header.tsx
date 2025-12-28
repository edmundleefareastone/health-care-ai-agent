import React from 'react';
import { Bell, Activity, ClipboardList, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  currentView: 'dashboard' | 'alerts' | 'tasks' | 'patients';
  onViewChange: (view: 'dashboard' | 'alerts' | 'tasks' | 'patients') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { getPendingAlertsCount } = useApp();
  const pendingCount = getPendingAlertsCount();

  const navItems = [
    { id: 'dashboard' as const, label: '儀表板', icon: Activity },
    { id: 'alerts' as const, label: 'AI 提醒', icon: Bell, badge: pendingCount },
    { id: 'tasks' as const, label: '追蹤事項', icon: ClipboardList },
    { id: 'patients' as const, label: '病患列表', icon: Users },
  ];

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">健康照護 AI Agent</h1>
              <p className="text-sm text-gray-500">護理人員智能助手</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  relative flex items-center space-x-2 px-4 py-2 rounded-lg text-base font-medium transition-colors
                  ${currentView === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-sm rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-base font-medium text-gray-900">護理師 Edmund</p>
              <p className="text-sm text-gray-500">日班 · 3F 病房</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-base">
              E
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
