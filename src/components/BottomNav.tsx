/**
 * ម៉ែ — by FlowErs
 * Mobile Bottom Navigation Bar
 * Ergonomic thumb-zone navigation for smartphones (ទំព័រដើម, ដំណើររបស់កូន, ស្វែងយល់, គណនី).
 */

import React from 'react';
import { Home, Compass, Search, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const navItems = [
    { id: 'home' as const, labelKh: 'ទំព័រដើម', labelEn: 'Home', icon: Home },
    { id: 'journey' as const, labelKh: 'ដំណើររបស់អ្នក', labelEn: 'Journey', icon: Compass },
    { id: 'explore' as const, labelKh: 'ស្វែងយល់', labelEn: 'Explore', icon: Search },
    { id: 'profile' as const, labelKh: 'គណនី', labelEn: 'Profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/96 backdrop-blur-md border-t border-[#E5EADF] shadow-lg pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
                isActive ? 'text-[#5C7034]' : 'text-[#5F6E60] hover:text-[#233125]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#88A04D]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium leading-none ${isActive ? 'font-semibold text-[#233125]' : ''}`}>
                {t(item.labelKh, item.labelEn)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
