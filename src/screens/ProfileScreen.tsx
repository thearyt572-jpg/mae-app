/**
 * ម៉ែ — by FlowErs
 * Profile Screen: "គណនី"
 *
 * Implements Section 13:
 * Minimal profile containing strictly:
 * - Name
 * - Pregnancy week OR due date
 * - Language (Khmer / English)
 * - Notification preference (Daily / Weekly / None)
 * - Logout
 */

import React, { useState } from 'react';
import { User, Bell, Globe, LogOut, Calendar, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserLanguage, NotificationPreference } from '../types';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    isAuthenticated,
    logout,
    updateUserPreferences,
    currentWeek,
    setCurrentWeek,
    setIsAuthModalOpen,
    setAuthModalMode,
    t,
  } = useApp();

  const [editName, setEditName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-3xl mx-auto shadow-2xs">
          🌸
        </div>
        <h2 className="text-xl font-serif font-bold text-[#233125]">
          {t('ចូលប្រើដើម្បីតាមដានការវិវឌ្ឍន៍នៃការមានផ្ទៃពោះ', 'Sign in to Personalize Your Journey')}
        </h2>
        <p className="text-xs sm:text-sm text-[#5F6E60]">
          {t(
            'បង្កើតគណនីដើម្បីកត់ត្រាសប្ដាហ៍ពពោះ និងទទួលសារកក់ក្តៅពីម៉ែ។',
            'Save your pregnancy week and receive gentle words from mom.'
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          className="px-6 py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-sm font-semibold shadow-xs transition-all"
        >
          {t('ចូលប្រើ ឬចុះឈ្មោះ', 'Sign In or Register')}
        </button>
      </div>
    );
  }

  const handleLanguageChange = (lang: UserLanguage) => {
    updateUserPreferences({ language: lang });
  };

  const handleReminderChange = (pref: NotificationPreference) => {
    updateUserPreferences({ notification_preference: pref });
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      updateUserPreferences({ name: editName.trim() });
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233125]">
          {t('គណនីរបស់កូន', 'My Profile')}
        </h1>
        <p className="text-xs sm:text-sm text-[#5F6E60] mt-0.5">
          {t('ព័ត៌មានផ្ទាល់ខ្លួន និងការកំណត់ត្រាផ្សេងៗក្នុងកម្មវិធី «ម៉ែ»។', 'Manage your basic details and preferences.')}
        </p>
      </div>

      {/* 1. Name & Basic Info */}
      <section className="rounded-3xl bg-white border border-[#E5EADF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 text-[#88A04D] font-bold text-lg flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#88A04D] text-sm text-[#233125] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="px-3 py-1.5 rounded-xl bg-[#88A04D] text-white text-xs font-semibold"
                  >
                    {t('រក្សាទុក', 'Save')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#233125]">
                    {user.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(user.name);
                      setIsEditing(true);
                    }}
                    className="text-xs text-[#88A04D] hover:underline"
                  >
                    ({t('កែប្រែ', 'edit')})
                  </button>
                </div>
              )}
              <p className="text-xs text-[#5F6E60]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* 2. Pregnancy Week / Due Date */}
        <div className="pt-4 border-t border-[#E5EADF] space-y-2">
          <label className="block text-xs font-bold text-[#233125]">
            {t('សប្ដាហ៍នៃការពពោះបច្ចុប្បន្ន', 'Current Pregnancy Week')}
          </label>
          <div className="flex items-center gap-3">
            <select
              value={currentWeek}
              onChange={(e) => {
                const w = parseInt(e.target.value, 10);
                setCurrentWeek(w);
                updateUserPreferences({ pregnancy_week: w });
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5EADF] text-xs sm:text-sm text-[#233125] font-semibold focus:border-[#88A04D]"
            >
              {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  {t(`សប្ដាហ៍ទី ${w} (ខែទី ${Math.min(9, Math.ceil(w / 4.4))})`, `Week ${w}`)}
                </option>
              ))}
            </select>

            {user.due_date && (
              <span className="text-xs text-[#5F6E60]">
                {t('ប៉ាន់ស្មានថ្ងៃសម្រាល៖', 'Due date:')} {user.due_date}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 3. Language Selection (Khmer-First) */}
      <section className="rounded-3xl bg-white border border-[#E5EADF] p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7034]">
          <Globe className="w-4 h-4 text-[#88A04D]" />
          <span>{t('ភាសាប្រើប្រាស់', 'Language')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLanguageChange('km')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              user.language === 'km'
                ? 'bg-[#EBF1E4] border-[#88A04D] font-bold text-[#233125] shadow-2xs'
                : 'bg-[#FAF9F5] border-[#E5EADF] text-[#5F6E60] hover:text-[#233125]'
            }`}
          >
            <div className="text-sm font-semibold">ភាសាខ្មែរ (Khmer)</div>
            <div className="text-[11px] text-[#5C7034] mt-0.5">ភាសាដំបូងគេ (Default)</div>
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              user.language === 'en'
                ? 'bg-[#EBF1E4] border-[#88A04D] font-bold text-[#233125] shadow-2xs'
                : 'bg-[#FAF9F5] border-[#E5EADF] text-[#5F6E60] hover:text-[#233125]'
            }`}
          >
            <div className="text-sm font-semibold">English</div>
            <div className="text-[11px] text-[#5F6E60] mt-0.5">Secondary language</div>
          </button>
        </div>
      </section>

      {/* 4. Notification Preference (Validation Options: Daily / Weekly / None) */}
      <section className="rounded-3xl bg-white border border-[#E5EADF] p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7034]">
          <Bell className="w-4 h-4 text-[#88A04D]" />
          <span>{t('ការទទួលការរំលឹកពីម៉ែ', 'Reminder Frequency')}</span>
        </div>

        <div className="space-y-2">
          {[
            {
              id: 'weekly' as const,
              labelKh: 'រៀងរាល់សប្ដាហ៍ (Weekly)',
              descKh: 'ទទួលសាររំលឹកមួយដងក្នុងមួយសប្ដាហ៍',
            },
            {
              id: 'daily' as const,
              labelKh: 'រៀងរាល់ថ្ងៃ (Daily)',
              descKh: 'ទទួលការរំលឹកញ៉ាំទឹក សម្រាក និងថែរក្សាខ្លួនប្រចាំថ្ងៃ',
            },
            {
              id: 'none' as const,
              labelKh: 'មិនទទួល (None)',
              descKh: 'ស្វែងរកព័ត៌មានដែលអ្នកចង់ដឹងនៅទីនេះដោយមិនទទួលសាររំលឹកពីម៉ែ',
            },
          ].map((item) => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                user.notification_preference === item.id
                  ? 'bg-[#FAF9F5] border-[#88A04D] shadow-2xs'
                  : 'bg-white border-[#E5EADF] hover:bg-[#FAF9F5]/50'
              }`}
            >
              <input
                type="radio"
                name="notification_preference"
                checked={user.notification_preference === item.id}
                onChange={() => handleReminderChange(item.id)}
                className="mt-1 accent-[#88A04D]"
              />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#233125]">
                  {item.labelKh}
                </div>
                <div className="text-[11px] text-[#5F6E60] mt-0.5">
                  {item.descKh}
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* 5. Logout Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('ចាកចេញពីគណនី (Log Out)', 'Log Out')}</span>
        </button>
      </div>
    </div>
  );
};
