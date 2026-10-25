/**
 * ម៉ែ — by FlowErs
 * UpgradeModal Component
 *
 * Premium (My Plan) is switched on by the team in the Supabase database:
 * set `is_premium = true` for the person's `user_id` in the `entitlements` table.
 *
 * This modal shows what Premium includes and the person's ID (so the team can
 * find their row), and records an `upgrade_interest` event when they ask for access.
 * There is no Telegram, payment, reminder or calendar flow.
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  Copy,
  Check,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTimeUntilMidnightCambodia, FREE_LIMITS } from '../lib/entitlements';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  source = 'plan_feature',
}) => {
  const { user, isAuthenticated, isPremium, currentWeek, logEvent, showToast, startApp, t } = useApp();

  const [copied, setCopied] = useState(false);
  const [requested, setRequested] = useState(false);

  // Log paywall_shown event whenever the modal becomes visible
  useEffect(() => {
    if (isOpen && !isPremium) {
      logEvent('paywall_shown', undefined, currentWeek, {
        feature: source,
        timestamp: new Date().toISOString(),
      });
    }
    if (isOpen) setRequested(false);
  }, [isOpen, isPremium, source, currentWeek]);

  if (!isOpen) return null;

  const isDailyLimit = source === 'daily_limit';
  const resetTime = getTimeUntilMidnightCambodia();

  const handleCopyId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      showToast(t('បានចម្លងលេខសម្គាល់រួចរាល់ 📋', 'ID copied 📋'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(user.id);
    }
  };

  const handleRequestAccess = () => {
    logEvent('upgrade_interest', user?.id, currentWeek, { source, action: 'request_access' });
    setRequested(true);
    showToast(t('បានផ្ញើសំណើរួចរាល់ 🌸', 'Request sent 🌸'));
  };

  const FEATURES = [
    {
      icon: <BookOpen className="w-5 h-5 text-[#88A04D]" />,
      titleKh: 'ការអានសង្ខេបមិនកំណត់ (Unlimited Summaries)',
      titleEn: 'Unlimited Summaries Every Day',
      descKh: 'អានសង្ខេបគ្រប់ប្រធានបទទាំងអស់ដោយគ្មានដែនកំណត់ (គណនីឥតគិតថ្លៃអានបាន ២ អត្ថបទ/ថ្ងៃ)។',
      descEn: 'Read every curated summary freely without daily limits (free tier includes 2 summaries/day).',
    },
    {
      icon: <CalendarCheck className="w-5 h-5 text-[#88A04D]" />,
      titleKh: 'គម្រោងថែទាំសុខភាពប្រចាំថ្ងៃ (Daily Plan)',
      titleEn: 'Personal Daily Checklist',
      descKh: 'ជ្រើសរើសការណែនាំពីអត្ថបទ និងសារសំឡេង ដាក់ចូលបញ្ជីប្រចាំថ្ងៃដើម្បីងាយស្រួលអនុវត្ត។',
      descEn: 'Save curated recommendations directly into your daily routine with zero stress.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF9F5] border-t sm:border border-[#E5EADF] shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-slide-up">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#E5EADF] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-xl shadow-2xs">
              {isPremium ? '✅' : '🌸'}
            </span>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#88A04D] uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>{t('គម្រោងពិសេស', 'Premium')}</span>
              </div>
              <h2
                id="upgrade-modal-title"
                className="text-base sm:text-lg font-serif font-bold text-[#233125] leading-snug"
              >
                {isPremium
                  ? t('My Plan ត្រូវបានបើករួចហើយ', 'My Plan is unlocked')
                  : t('បើក My Plan', 'Unlock My Plan')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Daily Limit Warning if triggered from summary quota */}
          {isDailyLimit && !isPremium && (
            <div className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#E0C068]/50 text-left space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#B27B00] shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-[#5C4200]">
                  {t(
                    `អ្នកបានអានសង្ខេបឥតគិតថ្លៃគ្រប់ ${FREE_LIMITS.dailySummaries} អត្ថបទសម្រាប់ថ្ងៃនេះហើយ`,
                    `You've reached your free daily limit of ${FREE_LIMITS.dailySummaries} summaries for today.`
                  )}
                </p>
              </div>
              <p className="text-[11px] text-[#7A5B00] leading-relaxed pl-6">
                {t(
                  `ដែនកំណត់នឹងកំណត់ឡើងវិញនៅពាក់កណ្តាលអធ្រាត្រ (នៅសល់ប្រហែល ${resetTime.formattedKh})។`,
                  `Quota resets at midnight Asia/Phnom_Penh (in ~${resetTime.formattedEn}).`
                )}
              </p>
              <div className="pt-1.5 border-t border-[#E0C068]/30 text-[11px] text-[#5C4200] flex items-center gap-1.5 font-medium pl-6">
                <ShieldCheck className="w-3.5 h-3.5 text-[#88A04D]" />
                <span>
                  {t(
                    'អត្ថបទសញ្ញាគ្រោះថ្នាក់បន្ទាន់ និងសារសំឡេងទាំងអស់ នៅតែឥតគិតថ្លៃជានិច្ច!',
                    'Safety-critical warning signs and voice messages are always 100% free!'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* What's included */}
          <div className="space-y-2">
            {FEATURES.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-[#E5EADF] flex items-start gap-2.5 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#CAD6BE] flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#233125] leading-tight">{t(item.titleKh, item.titleEn)}</h4>
                  <p className="text-[11px] text-[#5F6E60] mt-0.5 leading-relaxed">{t(item.descKh, item.descEn)}</p>
                </div>
              </div>
            ))}
          </div>

          {!isAuthenticated ? (
            <div className="p-5 rounded-3xl bg-white border border-[#E5EADF] shadow-xs text-center space-y-3">
              <p className="text-xs text-[#5F6E60] max-w-sm mx-auto leading-relaxed">
                {t('សូមចុច «ចាប់ផ្ដើម» ជាមុនសិន។ មិនចាំបាច់មានគណនីទេ។', 'Please tap Start first. No account needed.')}
              </p>
              <button
                type="button"
                onClick={() => startApp()}
                className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('ចាប់ផ្ដើម 🌸', 'Start 🌸')}</span>
              </button>
            </div>
          ) : !isPremium ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5EADF] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#233125]">
                <Database className="w-4 h-4 text-[#88A04D]" />
                <span>{t('ក្រុមការងារបើកជូនក្នុងប្រព័ន្ធទិន្នន័យ', 'Turned on by our team in the database')}</span>
              </div>
              <p className="text-xs text-[#5F6E60] leading-relaxed">
                {t(
                  'ចុច «ស្នើសុំ» ហើយផ្ញើលេខសម្គាល់ខាងក្រោមទៅក្រុមការងារ។ នៅពេលបើកហើយ សូមបើកកម្មវិធីឡើងវិញ។',
                  'Tap Request, then send the ID below to our team. Once it is turned on, reopen the app.'
                )}
              </p>

              <div className="flex items-center gap-2 p-2.5 bg-[#FAF9F5] rounded-2xl border border-[#E5EADF]">
                <span className="flex-1 min-w-0 truncate font-mono text-[11px] sm:text-xs text-[#233125]">
                  {user?.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="min-h-[40px] px-3 rounded-xl bg-[#EBF1E4] text-[#5C7034] hover:bg-[#88A04D] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('បានចម្លង', 'Copied') : t('ចម្លង', 'Copy')}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#5C7034] text-center font-medium">
              {t('🌸 អ្នកមានសិទ្ធិប្រើប្រាស់ My Plan ពេញលេញ។', '🌸 You have full access to My Plan.')}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5EADF] flex items-center justify-between gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#E5EADF] text-xs font-semibold text-[#5F6E60] hover:text-[#233125] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
          >
            {t('បិទ', 'Close')}
          </button>

          {isAuthenticated && !isPremium && (
            <button
              type="button"
              disabled={requested}
              onClick={handleRequestAccess}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{requested ? t('បានស្នើសុំ ✓', 'Requested ✓') : t('ស្នើសុំ 🌸', 'Request 🌸')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
