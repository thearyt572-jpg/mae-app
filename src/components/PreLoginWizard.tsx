/**
 * ម៉ែ — by FlowErs
 * Start Wizard
 *
 * Collects (no due date is asked):
 * - Screen 1: First pregnancy? (Yes / No / Prefer not to say; if No, children count)
 * - Screen 2: Occupation / daily life (Optional with Skip)
 *
 * Privacy & Safety:
 * - All answers are kept in browser memory / localStorage only.
 * - When the app starts, answers are attached to her new profile row.
 * - Logs onboarding_question_answered with question ID only (never personal answers).
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
export const WIZARD_ANSWERS_STORAGE_KEY = 'mea_pre_login_answers_v1';

export interface PreLoginAnswers {
  isFirstPregnancy?: boolean;
  childrenCount?: number;
  preferNotToSayFirstPregnancy?: boolean;
  occupation?: string;
}

export function getSavedPreLoginAnswers(): PreLoginAnswers | null {
  try {
    const raw = localStorage.getItem(WIZARD_ANSWERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePreLoginAnswers(answers: PreLoginAnswers) {
  try {
    localStorage.setItem(WIZARD_ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  } catch {}
}

export function clearPreLoginAnswers() {
  try {
    localStorage.removeItem(WIZARD_ANSWERS_STORAGE_KEY);
  } catch {}
}

interface PreLoginWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: PreLoginAnswers) => void;
}

export const PreLoginWizard: React.FC<PreLoginWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t, logEvent } = useApp();

  const [screen, setScreen] = useState<1 | 2>(1);

  // Screen 1: First pregnancy
  const [firstPregnancyChoice, setFirstPregnancyChoice] = useState<'yes' | 'no' | 'prefer_not'>('yes');
  const [childrenCount, setChildrenCount] = useState<number>(1);

  // Screen 2: Occupation
  const [occupation, setOccupation] = useState<string>('');

  if (!isOpen) return null;

  const handleNextFromScreen1 = () => {
    logEvent('onboarding_question_answered', undefined, undefined, { question_id: 'first_pregnancy' });
    setScreen(2);
  };

  const handleFinish = (skippedOccupation = false) => {
    logEvent('onboarding_question_answered', undefined, undefined, {
      question_id: 'daily_life_occupation',
      skipped: skippedOccupation,
    });

    const finalAnswers: PreLoginAnswers = {
      isFirstPregnancy: firstPregnancyChoice === 'prefer_not' ? undefined : firstPregnancyChoice === 'yes',
      preferNotToSayFirstPregnancy: firstPregnancyChoice === 'prefer_not',
      childrenCount: firstPregnancyChoice === 'no' ? childrenCount : 0,
      occupation: skippedOccupation ? undefined : (occupation || undefined),
    };

    savePreLoginAnswers(finalAnswers);
    onComplete(finalAnswers);
  };

  const OCCUPATIONS = [
    { id: 'homemaker', kh: 'មេផ្ទះ / ថែទាំគ្រួសារពេញម៉ោង', en: 'Full-time homemaker' },
    { id: 'office', kh: 'បុគ្គលិកការិយាល័យ ឬមន្ត្រីរាជការ', en: 'Office or government worker' },
    { id: 'garment', kh: 'កម្មការិនីរោងចក្រ ឬកាត់ដេរ', en: 'Factory or garment worker' },
    { id: 'seller', kh: 'អាជីវករ / អ្នកលក់ដូរតាមផ្សារ', en: 'Business or market seller' },
    { id: 'farmer', kh: 'កសិករ / ធ្វើស្រែចម្ការ', en: 'Farmer' },
    { id: 'student', kh: 'សិស្ស / និស្សិត', en: 'Student' },
    { id: 'other', kh: 'ផ្សេងៗ', en: 'Other' },
    { id: 'prefer_not', kh: 'មិនបញ្ជាក់', en: 'Prefer not to say' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF9F5] border-t sm:border border-[#E5EADF] shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-slide-up">
        {/* Header with Step Indicator */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E5EADF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#EBF1E4] border border-[#88A04D]/30 flex items-center justify-center text-sm shadow-2xs">
              🌸
            </span>
            <div>
              <span className="text-[11px] font-semibold text-[#88A04D] uppercase tracking-wider block">
                {t('ជំហានទី', 'Step')} {screen} / 2
              </span>
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#233125]">
                {screen === 1 && t('បទពិសោធន៍មានផ្ទៃពោះ', 'Pregnancy Experience')}
                {screen === 2 && t('ជីវិតប្រចាំថ្ងៃរបស់អ្នក', 'Your Daily Life')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E5EADF] h-1.5 shrink-0">
          <div
            className="bg-[#88A04D] h-1.5 transition-all duration-300"
            style={{ width: `${(screen / 2) * 100}%` }}
          />
        </div>

        {/* Body Container */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* ================================================================= */}
          {/* SCREEN 1: First Pregnancy */}
          {/* ================================================================= */}
          {screen === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#233125] font-serif leading-snug">
                  {t('តើនេះជាការមានផ្ទៃពោះលើកដំបូងរបស់អ្នកមែនទេ?', 'Is this your first pregnancy?')}
                </h3>
                <p className="text-xs text-[#5F6E60] mt-1">
                  {t(
                    'ព័ត៌មាននេះជួយឱ្យ «ម៉ែ» ផ្តល់ការណែនាំដែលត្រូវនឹងបទពិសោធន៍របស់អ្នក។',
                    'This helps ម៉ែ tailor guidance to your experience level.'
                  )}
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setFirstPregnancyChoice('yes')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    firstPregnancyChoice === 'yes'
                      ? 'bg-white border-[#88A04D] ring-2 ring-[#88A04D]/20 shadow-xs'
                      : 'bg-[#FAF9F5] border-[#E5EADF] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌸</span>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#233125] block">
                        {t('បាទ/ចាស នេះជាលើកដំបូងរបស់ខ្ញុំ', 'Yes, this is my first pregnancy')}
                      </span>
                      <span className="text-[11px] text-[#5F6E60]">
                        {t('យើងនឹងកំដរអ្នកមួយជំហានម្តងៗ', 'We will walk with you step by step')}
                      </span>
                    </div>
                  </div>
                  {firstPregnancyChoice === 'yes' && <Check className="w-5 h-5 text-[#88A04D]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFirstPregnancyChoice('no')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    firstPregnancyChoice === 'no'
                      ? 'bg-white border-[#88A04D] ring-2 ring-[#88A04D]/20 shadow-xs'
                      : 'bg-[#FAF9F5] border-[#E5EADF] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👶</span>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#233125] block">
                        {t('ទេ ខ្ញុំធ្លាប់មានកូនពីមុនរួចហើយ', 'No, I have been pregnant before')}
                      </span>
                      <span className="text-[11px] text-[#5F6E60]">
                        {t('សូមប្រាប់ចំនួនកូនរបស់អ្នកខាងក្រោម', 'Please tell us how many children you have')}
                      </span>
                    </div>
                  </div>
                  {firstPregnancyChoice === 'no' && <Check className="w-5 h-5 text-[#88A04D]" />}
                </button>

                {/* Sub-question if No: How many children? */}
                {firstPregnancyChoice === 'no' && (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#CAD6BE] space-y-2 animate-fade-in">
                    <label className="block text-xs font-semibold text-[#233125]">
                      {t('តើអ្នកមានកូនប៉ុន្មាននាក់ហើយ?', 'How many children do you have?')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setChildrenCount(num)}
                          className={`min-h-[44px] py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                            childrenCount === num
                              ? 'bg-[#88A04D] text-white border-[#88A04D] shadow-2xs'
                              : 'bg-[#FAF9F5] text-[#233125] border-[#E5EADF] hover:bg-white'
                          }`}
                        >
                          {num === 3 ? t('៣ នាក់ ឬច្រើនជាង', '3 or more') : t(`${num} នាក់`, `${num}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setFirstPregnancyChoice('prefer_not')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    firstPregnancyChoice === 'prefer_not'
                      ? 'bg-white border-[#88A04D] ring-2 ring-[#88A04D]/20 shadow-xs'
                      : 'bg-[#FAF9F5] border-[#E5EADF] hover:bg-white'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium text-[#5F6E60]">
                    {t('មិនបញ្ជាក់ (Prefer not to say)', 'Prefer not to say')}
                  </span>
                  {firstPregnancyChoice === 'prefer_not' && <Check className="w-4 h-4 text-[#88A04D]" />}
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SCREEN 2: Daily Life / Occupation (Optional) */}
          {/* ================================================================= */}
          {screen === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-[#233125] font-serif leading-snug">
                    {t('តើអ្វីដែលពិពណ៌នាអំពីជីវិតប្រចាំថ្ងៃរបស់អ្នកបានល្អបំផុត?', 'What best describes your daily life?')}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#88A04D] bg-[#EBF1E4] px-2 py-0.5 rounded-full shrink-0">
                    {t('ស្រេចចិត្ត', 'Optional')}
                  </span>
                </div>
                <p className="text-xs text-[#5F6E60] mt-1">
                  {t(
                    'ជួយឱ្យយើងណែនាំពីការសម្រាក និងសុវត្ថិភាពការងារដែលសមស្រប។',
                    'Helps us suggest suitable rest and workplace safety tips.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OCCUPATIONS.map((occ) => {
                  const isSelected = occupation === occ.kh || occupation === occ.en;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccupation(t(occ.kh, occ.en))}
                      className={`min-h-[46px] p-3 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#88A04D] ring-2 ring-[#88A04D]/20 font-bold text-[#233125] shadow-xs'
                          : 'bg-[#FAF9F5] border-[#E5EADF] text-[#5F6E60] hover:text-[#233125] hover:bg-white'
                      }`}
                    >
                      <span className="truncate">{t(occ.kh, occ.en)}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#88A04D] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5EADF] flex items-center justify-between shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {screen > 1 ? (
            <button
              type="button"
              onClick={() => setScreen(1)}
              className="min-h-[44px] px-4 py-2 rounded-full border border-[#E5EADF] text-xs font-semibold text-[#233125] hover:bg-[#FAF9F5] transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('ត្រឡប់ក្រោយ', 'Back')}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {/* Skip option for optional screens */}
            {screen === 2 && (
              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold text-[#5F6E60] hover:text-[#233125] transition-colors"
              >
                {t('រំលង', 'Skip')}
              </button>
            )}

            {screen === 1 && (
              <button
                type="button"
                onClick={handleNextFromScreen1}
                className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>{t('បន្ទាប់', 'Next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {screen === 2 && (
              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>{t('បញ្ចប់ 🌸', 'Finish 🌸')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
