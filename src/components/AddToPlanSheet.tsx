/**
 * ម៉ែ — by FlowErs
 * Add to My Plan Bottom Sheet
 *
 * Free vs Premium Behavior:
 * - Free / Non-premium: Shows pre-written items as a clean, read-only preview,
 *   then provides a direct action to open the Upgrade screen.
 * - Premium: Full interactive checklist customization, duration selection
 *   (1 day vs 7 days), and saving to database. No reminders.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Sparkles, Clock, Lock } from 'lucide-react';
import { PlanSuggestion } from '../types';
import { useApp } from '../context/AppContext';
import { usePlan, getCambodiaTodayStr, addDaysToCambodiaDate } from '../context/PlanContext';

interface AddToPlanSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'resource' | 'voice_message';
  sourceId: string;
  sourceTitle: string;
  suggestions: PlanSuggestion[];
}

export const AddToPlanSheet: React.FC<AddToPlanSheetProps> = ({
  isOpen,
  onClose,
  sourceType,
  sourceId,
  sourceTitle,
  suggestions,
}) => {
  const {
    isPremium,
    setIsUpgradeModalOpen,
    logEvent,
    currentWeek,
    t,
  } = useApp();
  const { addItems } = usePlan();

  // List of kept suggestions (initially all pre-selected)
  const [keptSuggestions, setKeptSuggestions] = useState<PlanSuggestion[]>([]);
  // Duration: 'day' (1 day) or 'week' (7 days)
  const [duration, setDuration] = useState<'day' | 'week'>('day');
  useEffect(() => {
    if (isOpen) {
      setKeptSuggestions(suggestions);
      logEvent('plan_sheet_opened', sourceId, currentWeek, {
        source_id: sourceId,
        source_type: sourceType,
        suggestions_count: suggestions.length,
        is_premium: isPremium,
      });
    }
  }, [isOpen, sourceId, suggestions, isPremium]);

  if (!isOpen) return null;

  const handleRemoveSuggestion = (id: string) => {
    if (!isPremium) return;
    setKeptSuggestions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirm = async () => {
    if (!isPremium) {
      onClose();
      setIsUpgradeModalOpen(true, 'add_to_plan');
      return;
    }

    if (keptSuggestions.length === 0) {
      onClose();
      return;
    }

    const todayStr = getCambodiaTodayStr();
    const endDateStr = duration === 'week' ? addDaysToCambodiaDate(todayStr, 6) : todayStr;

    const itemsToSave = keptSuggestions.map((s) => ({
      text_kh: s.text_kh,
      text_en: s.text_en,
      source_type: sourceType,
      source_id: sourceId,
      start_date: todayStr,
      end_date: endDateStr,
      done: false,
    }));

    await addItems(itemsToSave, {
      items_kept: keptSuggestions.length,
      items_removed: suggestions.length - keptSuggestions.length,
      duration,
      source_id: sourceId,
    });

    onClose();
  };

  const handleNonPremiumDurationClick = () => {
    onClose();
    setIsUpgradeModalOpen(true, 'add_to_plan');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-xs transition-opacity animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-sheet-title"
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#E5EADF] shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E5EADF] pb-3.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EBF1E4] text-xs font-semibold text-[#5C7034]">
              <Sparkles className="w-3.5 h-3.5 text-[#88A04D]" />
              <span>
                {isPremium
                  ? t('បញ្ចូលក្នុងគម្រោងរបស់ខ្ញុំ', 'Add to My Plan')
                  : t('មើលគម្រោងជាមុន · Preview Mode', 'Plan Preview Mode')}
              </span>
            </div>
            <h3 id="plan-sheet-title" className="text-base sm:text-lg font-bold font-serif text-[#233125]">
              {sourceTitle}
            </h3>
            <p className="text-xs text-[#5F6E60]">
              {isPremium
                ? t(
                    'អ្នកអាចជ្រើសរើស ឬលុបចំណុចណាដែលមិនទាន់ចង់ធ្វើ។ គ្មានការបង្ខិតបង្ខំឡើយ។',
                    'Choose what feels right for you. Remove anything you don’t need right now.'
                  )
                : t(
                    'នេះជាទិដ្ឋភាពគំរូនូវការណែនាំដែលអ្នកអាចកត់ត្រាទុកក្នុង My Plan។',
                    'Preview the gentle recommendations you can save into your daily routine with My Plan.'
                  )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
            aria-label="Close sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Non-Premium Notice Banner */}
        {!isPremium && (
          <div className="p-4 rounded-2xl bg-[#F0F4E8] border border-[#88A04D]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-[#233125]">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#88A04D]" />
                <span>{t('មុខងារគម្រោងពិសេស · My Plan Feature', 'My Plan Feature')}</span>
              </p>
              <p className="text-[#5F6E60]">
                {t(
                  'ការបន្ថែម និងកត់ត្រាការងារក្នុងគម្រោង ត្រូវភ្ជាប់ជាមួយ My Plan (សាកល្បងឥតគិតថ្លៃ)។',
                  'Saving recommendations into your daily routine is part of My Plan.'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsUpgradeModalOpen(true, 'add_to_plan');
              }}
              className="min-h-[40px] px-4 py-2 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <span>{t('ស្នើសុំសាកល្បង 🌸', 'Ask for Access 🌸')}</span>
            </button>
          </div>
        )}

        {/* Pre-written suggestions (Read-only preview for free users, editable for premium) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#5C7034] uppercase tracking-wider block">
              {t('សេចក្តីណែនាំដែលបានជ្រើសរើស', 'Suggested Items')} ({keptSuggestions.length})
            </label>
            {!isPremium && (
              <span className="text-[11px] font-semibold text-[#88A04D] bg-[#EBF1E4] px-2.5 py-0.5 rounded-full">
                {t('មើលជាមុន (Preview)', 'Read-only preview')}
              </span>
            )}
          </div>

          {keptSuggestions.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#5F6E60] italic bg-[#FAF9F5] rounded-2xl border border-dashed border-[#E5EADF]">
              {t('អ្នកបានលុបការណែនាំទាំងអស់។', 'You have removed all suggestions.')}
            </div>
          ) : (
            <div className="space-y-2">
              {keptSuggestions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5EADF] shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#88A04D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <p className="text-xs sm:text-sm text-[#233125] leading-relaxed">
                      {t(item.text_kh, item.text_en)}
                    </p>
                  </div>

                  {isPremium && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSuggestion(item.id)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-red-600 rounded-full hover:bg-white transition-colors shrink-0"
                      title={t('លុបចេញ', 'Remove')}
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Choice: Just one day vs Every day for a week */}
        <div className="space-y-2 pt-2 border-t border-[#E5EADF]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#233125] block">
              {t('ជ្រើសរើសរយៈពេល', 'How long')}
            </label>
            {!isPremium && (
              <span className="text-[11px] text-[#5F6E60] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#88A04D]" />
                <span>{t('មុខងារ My Plan', 'My Plan feature')}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={isPremium ? () => setDuration('day') : handleNonPremiumDurationClick}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                duration === 'day'
                  ? 'bg-[#88A04D] text-white border-[#88A04D] shadow-xs'
                  : 'bg-white text-[#233125] border-[#E5EADF] hover:bg-[#FAF9F5]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('ត្រឹមតែមួយថ្ងៃ', 'Just one day')}</span>
            </button>

            <button
              type="button"
              onClick={isPremium ? () => setDuration('week') : handleNonPremiumDurationClick}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                duration === 'week'
                  ? 'bg-[#88A04D] text-white border-[#88A04D] shadow-xs'
                  : 'bg-white text-[#233125] border-[#E5EADF] hover:bg-[#FAF9F5]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t('រាល់ថ្ងៃក្នុងមួយសប្ដាហ៍', 'Every day for a week')}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Confirm & Cancel */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EADF]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-full text-xs font-medium text-[#5F6E60] hover:text-[#233125] hover:bg-[#FAF9F5] transition-colors"
          >
            {isPremium ? t('បោះបង់', 'Cancel') : t('បិទ', 'Close')}
          </button>

          {isPremium ? (
            <button
              type="button"
              disabled={keptSuggestions.length === 0}
              onClick={handleConfirm}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {t(
                  `យល់ព្រមបញ្ចូល (${keptSuggestions.length})`,
                  `Confirm (${keptSuggestions.length})`
                )}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsUpgradeModalOpen(true, 'add_to_plan');
              }}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('ដំឡើងគម្រោង 🌸', 'Purchase / Upgrade Plan 🌸')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
