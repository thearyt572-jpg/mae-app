/**
 * ម៉ែ — by FlowErs
 * UpgradeModal Component (Step 6 / Entitlements Paywall Screen)
 *
 * Friendly screen explaining what My Plan / Premium includes in Khmer & English:
 * - Unlimited summaries every day (free plan has 2 summaries/day, safety-critical & voice always free)
 * - Adding custom & curated suggestions to personal checklist
 * - Morning Telegram notifications (08:00 AM)
 * - Calendar export and reminder tracking
 *
 * Rules:
 * - Premium testers see none of this (if isPremium === true, modal does not show).
 * - Logs `paywall_shown` with { feature: source } each time it appears.
 * - Shows reset time for daily limit case ("Come back tomorrow, or ask for access").
 * - Button "Ask for access" logs `upgrade_interest` and shows a thank-you.
 * - Zero payment code and zero public price.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CalendarCheck,
  Send,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  BookOpen,
  AlertCircle,
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
  const { user, isPremium, currentWeek, logEvent, showToast, t } = useApp();

  const [hasRequested, setHasRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log paywall_shown event whenever the modal becomes visible
  useEffect(() => {
    if (isOpen && !isPremium) {
      logEvent('paywall_shown', undefined, currentWeek, {
        feature: source,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isOpen, isPremium, source, currentWeek]);

  // Premium testers see none of this
  if (!isOpen || isPremium) return null;

  const isDailyLimit = source === 'daily_limit';
  const resetTime = getTimeUntilMidnightCambodia();

  const handleAskForAccess = () => {
    setIsSubmitting(true);
    try {
      logEvent('upgrade_interest', undefined, currentWeek, {
        source,
        email: user?.email,
        name: user?.name,
        timestamp: new Date().toISOString(),
      });

      setHasRequested(true);
      showToast(
        t(
          'អរគុណដែលបានចាប់អារម្មណ៍! យើងបានកត់ត្រាសំណើរបស់អ្នករួចរាល់ហើយ 🌸',
          'Thank you! Your interest has been recorded 🌸'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setHasRequested(false);
    onClose();
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
      descKh: 'ជ្រើសរើសការណែនាំពីអត្ថបទ និងសារសំឡេង ដាក់ចូលកាលវិភាគដើម្បីងាយស្រួលអនុវត្ត។',
      descEn: 'Save curated recommendations directly into your daily routine with zero stress.',
    },
    {
      icon: <Send className="w-5 h-5 text-[#88A04D]" />,
      titleKh: 'ការរំលឹកតាម Telegram ផ្ទាល់ខ្លួន (Telegram Reminders)',
      titleEn: 'Daily Telegram Alerts',
      descKh: 'សាររំលឹកមួយលើកក្នុងមួយថ្ងៃ នៅម៉ោង ៨:០០ ព្រឹក អំពីកិច្ចការដែលត្រូវធ្វើក្នុងថ្ងៃនោះ។',
      descEn: 'One gentle morning message at 8:00 AM (Phnom Penh) with your daily reminders.',
    },
    {
      icon: <Clock className="w-5 h-5 text-[#88A04D]" />,
      titleKh: 'ការរំលឹកញ៉ាំថ្នាំ និងការណាត់ជួបពេទ្យ',
      titleEn: 'Supplements & Antenatal Checkups',
      descKh: 'កុំឱ្យភ្លេចលេបថ្នាំជាតិដែក អាស៊ីតហ្វូលិក និងថ្ងៃត្រូវទៅជួបគ្រូពេទ្យ ឬឆ្មប។',
      descEn: 'Never miss iron/folate supplements and official antenatal visits.',
    },
    {
      icon: <Calendar className="w-5 h-5 text-[#88A04D]" />,
      titleKh: 'ការនាំចេញទៅកាន់ប្រតិទិន (Calendar Export)',
      titleEn: 'Calendar Sync & Export',
      descKh: 'រក្សាទុកការណាត់ជួបទៅក្នុងប្រតិទិនទូរស័ព្ទរបស់អ្នកដោយស្វ័យប្រវត្តិ។',
      descEn: 'Export appointments and checkups to your phone calendar.',
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
              🌸
            </span>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#88A04D] uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>
                  {isDailyLimit
                    ? t('ដែនកំណត់នៃការអានប្រចាំថ្ងៃ', 'Daily Reading Limit')
                    : t('មុខងារគម្រោងពិសេស', 'My Plan Premium')}
                </span>
              </div>
              <h2
                id="upgrade-modal-title"
                className="text-base sm:text-lg font-serif font-bold text-[#233125] leading-snug"
              >
                {isDailyLimit
                  ? t('អ្នកបានអានសង្ខេបឥតគិតថ្លៃគ្រប់ ២ អត្ថបទហើយ', 'Daily Summary Limit Reached')
                  : t('គម្រោងថែទាំផ្ទាល់ខ្លួនសម្រាប់អ្នកម្តាយ', 'Personalized Pregnancy Care')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Daily Limit Specific Banner */}
          {isDailyLimit ? (
            <div className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#E0C068]/50 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#B27B00] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#5C4200] leading-snug">
                    {t(
                      `អ្នកបានអានសង្ខេបឥតគិតថ្លៃគ្រប់ ${FREE_LIMITS.dailySummaries} អត្ថបទសម្រាប់ថ្ងៃនេះហើយ`,
                      `You've reached your free daily limit of ${FREE_LIMITS.dailySummaries} summaries for today.`
                    )}
                  </p>
                  <p className="text-xs text-[#7A5B00] leading-relaxed">
                    {t(
                      `ដែនកំណត់នឹងកំណត់ឡើងវិញនៅពាក់កណ្តាលអធ្រាត្រ (ម៉ោងនៅភ្នំពេញ · នៅសល់ប្រហែល ${resetTime.formattedKh})។ សូមត្រឡប់មកវិញនៅថ្ងៃស្អែក ឬស្នើសុំការសាកល្បង My Plan ខាងក្រោម។`,
                      `Quota resets at midnight Asia/Phnom_Penh (in about ${resetTime.formattedEn}). Come back tomorrow, or ask for access below.`
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E0C068]/30 text-[11px] text-[#5C4200] flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#88A04D]" />
                <span>
                  {t(
                    'អត្ថបទសញ្ញាគ្រោះថ្នាក់បន្ទាន់ និងសារសំឡេងទាំងអស់ នៅតែឥតគិតថ្លៃជានិច្ច!',
                    'Safety-critical warning signs and voice messages are always 100% free!'
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EBF1E4] to-[#FAF9F5] border border-[#88A04D]/30 space-y-1">
              <p className="text-xs sm:text-sm font-semibold text-[#233125] leading-relaxed">
                {t(
                  'អត្ថបទចំណេះដឹង និងសារសំឡេងទាំងអស់គឺឥតគិតថ្លៃ ១០០%។ មុខងារ «គម្រោងរបស់ខ្ញុំ» (My Plan) ជួយអ្នករៀបចំការអនុវត្តជាក់ស្តែងជារៀងរាល់ថ្ងៃ។',
                  'All educational resources and monthly voice messages remain 100% free forever. My Plan helps you turn advice into stress-free daily habits.'
                )}
              </p>
            </div>
          )}

          {/* Features List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#5C7034] uppercase tracking-wider">
              {t('អ្វីដែលអ្នកនឹងទទួលបានក្នុង My Plan៖', "What's included in My Plan:")}
            </h3>

            <div className="space-y-2.5">
              {FEATURES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-[#E5EADF] shadow-2xs flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#CAD6BE] flex items-center justify-center shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#233125] leading-tight">
                      {t(item.titleKh, item.titleEn)}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#5F6E60] mt-1 leading-relaxed">
                      {t(item.descKh, item.descEn)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Box if Requested */}
          {hasRequested ? (
            <div className="p-4 rounded-2xl bg-[#EBF1E4] border border-[#88A04D] space-y-2 text-center animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-[#88A04D] text-white flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-[#233125]">
                {t('បានកត់ត្រាសំណើរួចរាល់!', 'Request Received!')}
              </h4>
              <p className="text-xs text-[#5C7034] leading-relaxed">
                {t(
                  'អរគុណច្រើនអ្នកម្តាយ! ក្រុមការងារនឹងបើកសិទ្ធិប្រើប្រាស់សាកល្បងសម្រាប់គណនីរបស់អ្នកក្នុងពេលឆាប់ៗនេះ។',
                  'Thank you! Our team will activate trial access for your test account in the dashboard shortly.'
                )}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5EADF] text-[11px] text-[#5F6E60] leading-relaxed flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#88A04D] shrink-0" />
              <span>
                {t(
                  'សម្រាប់អ្នកចូលរួមសាកល្បង៖ ក្រុមការងារនឹងបើកសិទ្ធិ (is_premium) ដោយផ្ទាល់ជូនអ្នកក្នុងប្រព័ន្ធ ដោយមិនគិតថ្លៃឡើយ។',
                  'For testers: Our team enables is_premium manually for testing accounts at no cost.'
                )}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5EADF] flex items-center justify-between gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-5 py-2.5 rounded-full border border-[#E5EADF] text-xs font-semibold text-[#5F6E60] hover:text-[#233125] hover:bg-[#FAF9F5] transition-colors"
          >
            {hasRequested
              ? t('បិទ', 'Close')
              : isDailyLimit
              ? t('ត្រឡប់មកវិញថ្ងៃស្អែក', 'Come back tomorrow')
              : t('នៅពេលក្រោយ', 'Maybe later')}
          </button>

          {!hasRequested && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAskForAccess}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{t('ស្នើសុំការសាកល្បង 🌸', 'Ask for Access 🌸')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
