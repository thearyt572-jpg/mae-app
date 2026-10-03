/**
 * ម៉ែ — by FlowErs
 * Short Maternal Onboarding Flow
 *
 * Steps:
 * Step 1: តើម៉ែគួរហៅអ្នកថាបែបណា? (What should Mea call you?)
 * Step 2: តើអ្នកពពោះបានប៉ុន្មានសប្ដាហ៍ហើយ? (How far along are you?)
 * Step 3: ភាសាប្រើប្រាស់ (Language: Khmer default)
 * Step 4: ការទទួលការរំលឹកពីម៉ែ (Reminder frequency: Daily, Weekly, None)
 * Finish: «សូមស្វាគមន៍មកកាន់ ម៉ែ 🌸»
 */

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Bell, Calendar, Globe, Heart } from 'lucide-react';
import { UserLanguage, NotificationPreference } from '../types';
import { useApp } from '../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { user, isOnboardingOpen, completeOnboarding, t } = useApp();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(user?.name || '');
  const [calculationMode, setCalculationMode] = useState<'week' | 'dueDate'>('week');
  const [pregnancyWeek, setPregnancyWeek] = useState<number>(9);
  const [dueDate, setDueDate] = useState<string>('');
  const [language, setLanguage] = useState<UserLanguage>('km');
  const [notificationPreference, setNotificationPreference] = useState<NotificationPreference>('weekly');

  if (!isOnboardingOpen) return null;

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDueDate(val);
    if (val) {
      const targetDate = new Date(val);
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const remainingWeeks = diffDays / 7;
      const calculatedWeek = Math.max(1, Math.min(40, Math.round(40 - remainingWeeks)));
      if (!isNaN(calculatedWeek)) {
        setPregnancyWeek(calculatedWeek);
      }
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setStep(5);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      name: name.trim() || 'Mama',
      pregnancy_week: pregnancyWeek,
      due_date: dueDate || undefined,
      language,
      notification_preference: notificationPreference,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FAF9F5] border-t sm:border border-[#E5EADF] shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-slide-up">
        {/* Step Indicator - Sticky */}
        {step <= 4 && (
          <div className="p-4 sm:p-5 bg-white border-b border-[#E5EADF] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    i === step
                      ? 'bg-[#88A04D] w-8'
                      : i < step
                      ? 'bg-[#88A04D]/60'
                      : 'bg-[#E5EADF]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-medium text-[#5F6E60]">
              {step} / 4
            </span>
          </div>
        )}

        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-xl">
                🌸
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#233125]">
                  {t('តើម៉ែគួរហៅអ្នកបែបណា?', 'What should Mea call you?')}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6E60]">
                  {t('ឈ្មោះហៅក្រៅ ឬឈ្មោះផ្ទាល់ខ្លួនដែលអ្នកពេញចិត្ត។', 'A sweet name or nickname you love.')}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('ឧទាហរណ៍៖ ស្រីស្រស់ ឬ ចាន់ថន', 'e.g. Sreysros')}
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white border border-[#E5EADF] text-base text-[#233125] focus:border-[#88A04D] focus:ring-1 focus:ring-[#88A04D]"
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full min-h-[48px] py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{t('បន្តទៅមុខ', 'Continue')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Pregnancy Week or Due Date */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-xl">
                🌱
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#233125]">
                  {t('តើអ្នកពពោះបានប៉ុន្មានសប្ដាហ៍ហើយ?', 'How far along are you?')}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6E60]">
                  {t('ដើម្បីឱ្យម៉ែអាចរៀបចំសារនិងការណែនាំបានត្រឹមត្រូវ។', 'So Mea can share the right guidance at each stage.')}
                </p>
              </div>

              {/* Mode switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF9F5] rounded-xl border border-[#E5EADF]">
                <button
                  type="button"
                  onClick={() => setCalculationMode('week')}
                  className={`min-h-[40px] py-2 text-xs font-semibold rounded-lg transition-colors ${
                    calculationMode === 'week'
                      ? 'bg-white text-[#233125] shadow-2xs'
                      : 'text-[#5F6E60]'
                  }`}
                >
                  {t('ដឹងចំនួនសប្ដាហ៍', 'By Week')}
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode('dueDate')}
                  className={`min-h-[40px] py-2 text-xs font-semibold rounded-lg transition-colors ${
                    calculationMode === 'dueDate'
                      ? 'bg-white text-[#233125] shadow-2xs'
                      : 'text-[#5F6E60]'
                  }`}
                >
                  {t('ដឹងថ្ងៃសម្រាល', 'By Due Date')}
                </button>
              </div>

              {calculationMode === 'week' ? (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#5F6E60]">
                    {t('ជ្រើសរើសសប្ដាហ៍ពពោះបច្ចុប្បន្ន', 'Select current week')}:
                  </label>
                  <select
                    value={pregnancyWeek}
                    onChange={(e) => setPregnancyWeek(parseInt(e.target.value, 10))}
                    className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white border border-[#E5EADF] text-base text-[#233125] font-semibold focus:border-[#88A04D]"
                  >
                    {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        {t(`សប្ដាហ៍ទី ${w} (ខែទី ${Math.min(9, Math.ceil(w / 4.4))})`, `Week ${w}`)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#5F6E60]">
                    {t('ថ្ងៃសម្រាលប៉ាន់ស្មាន (តាមគ្រូពេទ្យប្រាប់)', 'Estimated due date')}:
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={handleDueDateChange}
                    className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white border border-[#E5EADF] text-base text-[#233125] focus:border-[#88A04D]"
                  />
                  {dueDate && (
                    <p className="text-xs text-[#5C7034] font-medium">
                      {t(`ត្រូវនឹងសប្ដាហ៍ទី ${pregnancyWeek}`, `Matches approx. Week ${pregnancyWeek}`)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-[48px] min-w-[48px] px-4 py-3 rounded-full border border-[#E5EADF] text-xs font-semibold text-[#5F6E60] hover:bg-white flex items-center justify-center"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 min-h-[48px] py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('បន្តទៅមុខ', 'Continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Language Selection (Khmer Default) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-xl">
                🌐
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#233125]">
                  {t('ភាសាដែលអ្នកចង់ប្រើ', 'Choose your language')}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6E60]">
                  {t('អ្នកអាចប្តូរភាសាបានគ្រប់ពេល។', 'You can change this at any time.')}
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setLanguage('km')}
                  className={`w-full min-h-[52px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    language === 'km'
                      ? 'bg-[#EBF1E4] border-[#88A04D] shadow-2xs'
                      : 'bg-white border-[#E5EADF]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#233125]">ភាសាខ្មែរ (Khmer)</div>
                    <div className="text-xs text-[#5C7034]">ភាសាដើម និងសំឡេងម៉ែជាភាសាខ្មែរ</div>
                  </div>
                  {language === 'km' && <Check className="w-5 h-5 text-[#88A04D]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`w-full min-h-[52px] p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    language === 'en'
                      ? 'bg-[#EBF1E4] border-[#88A04D] shadow-2xs'
                      : 'bg-white border-[#E5EADF]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#233125]">English</div>
                    <div className="text-xs text-[#5F6E60]">Secondary English interface</div>
                  </div>
                  {language === 'en' && <Check className="w-5 h-5 text-[#88A04D]" />}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[48px] min-w-[48px] px-4 py-3 rounded-full border border-[#E5EADF] text-xs font-semibold text-[#5F6E60] hover:bg-white flex items-center justify-center"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 min-h-[48px] py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('បន្តទៅមុខ', 'Continue')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Notification / Reminder Preference */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-xl">
                🔔
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#233125]">
                  {t('ការទទួលការរំលឹកពីម៉ែ', 'Reminder frequency')}
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6E60]">
                  {t('ជ្រើសរើសរបៀបដែលអ្នកចង់ទទួលការរំលឹកសុខភាព។', 'Choose how you would like gentle reminders.')}
                </p>
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
                    descKh: 'ចូលមកអាននិងស្តាប់តាមការចង់បានរបស់អ្នក',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNotificationPreference(item.id)}
                    className={`w-full min-h-[50px] p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all ${
                      notificationPreference === item.id
                        ? 'bg-[#EBF1E4] border-[#88A04D] shadow-2xs'
                        : 'bg-white border-[#E5EADF]'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#233125]">{item.labelKh}</div>
                      <div className="text-[11px] text-[#5F6E60] mt-0.5">{item.descKh}</div>
                    </div>
                    {notificationPreference === item.id && <Check className="w-4 h-4 text-[#88A04D] shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[48px] min-w-[48px] px-4 py-3 rounded-full border border-[#E5EADF] text-xs font-semibold text-[#5F6E60] hover:bg-white flex items-center justify-center"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 min-h-[48px] py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('រួចរាល់', 'Complete')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Welcome Complete */}
          {step === 5 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                💐
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#233125]">
                  {t(`សូមស្វាគមន៍មកកាន់ «ម៉ែ», ${name} 🌸`, `Welcome to ម៉ែ, ${name} 🌸`)}
                </h3>
                <p className="text-xs sm:text-sm text-[#233125]/85 italic leading-relaxed max-w-sm mx-auto">
                  “{t('ម៉ែនៅទីនេះចាំមើលថែអ្នកជានិច្ច។ ធ្វើចិត្តឱ្យត្រជាក់ ញញឹមឱ្យច្រើនណា។', 'Hey, do not worry. Mea is right here with you. Keep a peaceful heart and take gentle care.')}”
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5EADF] text-xs text-[#5F6E60]">
                {t(`អ្នកកំពុងស្ថិតនៅសប្ដាហ៍ទី ${pregnancyWeek} (ខែទី ${Math.min(9, Math.ceil(pregnancyWeek / 4.4))})`, `Current stage: Week ${pregnancyWeek}`)}
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full min-h-[48px] py-3.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-sm font-bold shadow-xs transition-all"
              >
                {t('ចាប់ផ្ដើមដំណើរ 🌸', 'Enter Your Journey 🌸')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
