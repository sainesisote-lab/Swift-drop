import React from 'react';
import { Language, i18n } from '../i18n';
import { UserRole } from '../types';
import { Globe, ShieldCheck, ChevronDown, User, Truck, Building2, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  activeRole: UserRole;
  onOpenRoleSwitcher: () => void;
  onOpenRegister: () => void;
  onGuestBookClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  activeRole,
  onOpenRoleSwitcher,
  onOpenRegister,
  onGuestBookClick,
}) => {
  const t = i18n[lang];

  const getRoleBadgeLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return lang === 'sw' ? 'Msimamizi Mkuu' : 'Super Admin';
      case 'company_admin':
        return lang === 'sw' ? 'Kampuni' : 'Carrier Admin';
      case 'dispatcher':
        return lang === 'sw' ? 'Mratibu' : 'Dispatcher';
      case 'accountant':
        return lang === 'sw' ? 'Mhasibu' : 'Accountant';
      case 'driver':
        return lang === 'sw' ? 'Dereva' : 'Driver';
      case 'customer':
        return lang === 'sw' ? 'Mteja' : 'Customer';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#14213D] text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark with East Africa Logistics Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF7A00] flex items-center justify-center font-extrabold text-white text-lg shadow-md group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
                SwiftDrop<span className="text-[#FF7A00]">.</span>
              </span>
              <span className="hidden sm:block text-[10px] text-blue-200 font-semibold tracking-wider uppercase -mt-1">
                Transport Tanzania
              </span>
            </div>
          </button>

          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-[#2563EB]/25 text-blue-300 border border-[#2563EB]/40 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>LATRA & PDPA 2022</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-4 text-sm font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'overview'
                ? 'text-white bg-slate-800/80 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {lang === 'sw' ? 'Mwanzo' : 'Home'}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('services')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'services'
                ? 'text-white bg-slate-800/80 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {t.nav.services}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('tracking')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'tracking'
                ? 'text-white bg-slate-800/80 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {t.nav.track}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('pricing')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'pricing'
                ? 'text-white bg-slate-800/80 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {t.nav.pricing}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('portal')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'portal'
                ? 'text-[#FF7A00] bg-slate-800/80 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span>{t.nav.portal}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('architecture')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentTab === 'architecture'
                ? 'text-white bg-slate-800/80 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {t.nav.architecture}
          </button>
        </nav>

        {/* Zone 3: Actions (Guest Quick Booking, Role Switcher, Language, Register) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Lugha / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Persona Switcher Selector */}
          <button
            type="button"
            onClick={onOpenRoleSwitcher}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Badili Jukumu la Kujaribu (Demo Persona)"
          >
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="hidden sm:inline text-slate-400">Role:</span>
            <span className="font-bold text-white">{getRoleBadgeLabel(activeRole)}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Primary Action Button in Vibrant Orange #FF7A00 */}
          <button
            type="button"
            onClick={onGuestBookClick}
            className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-extrabold shadow-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{lang === 'sw' ? 'Agiza Mzigo' : 'Book Delivery'}</span>
          </button>

          {/* Secondary Registration Button */}
          <button
            type="button"
            onClick={onOpenRegister}
            className="hidden sm:flex px-3.5 py-2 rounded-xl bg-transparent hover:bg-white/10 text-white border border-slate-600 text-xs font-bold transition-all whitespace-nowrap"
          >
            {t.nav.register}
          </button>
        </div>
      </div>
    </header>
  );
};
