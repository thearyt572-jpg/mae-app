/**
 * ម៉ែ — by FlowErs
 * My Plan Screen (គម្រោងរបស់ខ្ញុំ)
 *
 * Visual sections:
 * 1. "Today" (ថ្ងៃនេះ) — Due today in Cambodia timezone
 * 2. "This week" (សប្ដាហ៍នេះ) — Active upcoming reminders
 * 3. "Done" (បានបញ្ចប់) — Completed items
 *
 * Includes friendly empty state and feedback card.
 */

import React, { useState } from 'react';
import { CalendarCheck, Sparkles, CheckCircle2, Clock, Plus, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePlan } from '../context/PlanContext';
import { PlanItemCard } from '../components/PlanItemCard';
import { FeedbackCard } from '../components/FeedbackCard';

export const PlanScreen: React.FC = () => {
  const { setActiveTab, t } = useApp();
  const { items, getDueToday, getThisWeekItems, getDoneItems, todayDateStr } = usePlan();

  const dueToday = getDueToday();
  const thisWeek = getThisWeekItems();
  const doneItems = getDoneItems();

  const [activeSection, setActiveSection] = useState<'today' | 'week' | 'done'>('today');

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* Screen Header */}
      <div className="rounded-3xl bg-gradient-to-b from-[#EBF1E4]/90 via-[#FAF9F5] to-white border border-[#E5EADF] p-5 sm:p-7 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#88A04D]/30 text-xs font-semibold text-[#5C7034] shadow-2xs mb-2">
          <CalendarCheck className="w-3.5 h-3.5 text-[#88A04D]" />
          <span>{t('គម្រោងថែទាំខ្លួនរបស់ខ្ញុំ', 'My Gentle Plan')}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233125] tracking-tight">
          {t('គម្រោងរបស់ខ្ញុំ 🌸', 'My Plan 🌸')}
        </h1>

        <p className="text-xs sm:text-sm text-[#5F6E60] pt-1 leading-relaxed">
          {t(
            'កត់ត្រាការណែនាំថែទាំសុខភាពសាមញ្ញៗដែលអ្នកជ្រើសរើសចេញពីសារសំឡេង ឬអត្ថបទ។ គ្មានសម្ពាធ គ្មានការបង្ខិតបង្ខំ។',
            'Pre-written suggestions you chose from voice messages and articles. No pressure, no rush.'
          )}
        </p>

        {/* Date badge */}
        <div className="mt-4 pt-3 border-t border-[#E5EADF]/80 flex items-center justify-between text-xs text-[#5F6E60]">
          <span>{t(`កាលបរិច្ឆេទនៅកម្ពុជា៖ ${todayDateStr}`, `Cambodia date: ${todayDateStr}`)}</span>
          <span className="font-semibold text-[#5C7034]">
            {t(`នៅសល់ថ្ងៃនេះ៖ ${dueToday.length} ការងារ`, `Today: ${dueToday.length} due`)}
          </span>
        </div>
      </div>

      {/* Segment Tabs: Today / This Week / Done */}
      <div className="flex items-center gap-2 p-1 bg-[#F0F4E8]/60 rounded-2xl border border-[#E5EADF]">
        <button
          type="button"
          onClick={() => setActiveSection('today')}
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'today'
              ? 'bg-white text-[#233125] shadow-xs'
              : 'text-[#5F6E60] hover:text-[#233125]'
          }`}
        >
          <span>{t('ថ្ងៃនេះ', 'Today')}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#EBF1E4] text-[#5C7034] font-bold">
            {dueToday.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('week')}
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'week'
              ? 'bg-white text-[#233125] shadow-xs'
              : 'text-[#5F6E60] hover:text-[#233125]'
          }`}
        >
          <span>{t('សប្ដាហ៍នេះ', 'This Week')}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FAF9F5] border border-[#E5EADF] text-[#5F6E60]">
            {thisWeek.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('done')}
          className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSection === 'done'
              ? 'bg-white text-[#233125] shadow-xs'
              : 'text-[#5F6E60] hover:text-[#233125]'
          }`}
        >
          <span>{t('បានបញ្ចប់', 'Done')}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FAF9F5] border border-[#E5EADF] text-[#5F6E60]">
            {doneItems.length}
          </span>
        </button>
      </div>

      {/* Section Content */}
      <div className="space-y-3">
        {activeSection === 'today' && (
          <>
            {dueToday.length === 0 ? (
              <div className="py-12 px-6 rounded-3xl bg-white border border-[#E5EADF] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EBF1E4] text-[#88A04D] flex items-center justify-center mx-auto text-xl">
                  🌸
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#233125]">
                  {t('គ្មានការរំលឹកសម្រាប់ថ្ងៃនេះទេ', 'No reminders due today')}
                </h3>
                <p className="text-xs text-[#5F6E60] max-w-sm mx-auto leading-relaxed">
                  {t(
                    'អ្នកអាចបន្ថែមចំណុចថែទាំខ្លួនបានយ៉ាងងាយ តាមរយៈការចុចប៊ូតុង «បញ្ចូលក្នុងគម្រោង» នៅពេលអានអត្ថបទ ឬស្តាប់សារសំឡេង។',
                    'You can add gentle items by tapping "Add to My Plan" while listening to voice messages or reading articles.'
                  )}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    className="min-h-[40px] px-4 py-2 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('ស្វែងរកអត្ថបទសុខភាព', 'Explore Articles')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dueToday.map((item) => (
                  <PlanItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === 'week' && (
          <>
            {thisWeek.length === 0 ? (
              <div className="py-12 px-6 rounded-3xl bg-white border border-[#E5EADF] text-center space-y-2 text-xs text-[#5F6E60]">
                <p>{t('មិនទាន់មានគម្រោងសកម្មសម្រាប់សប្ដាហ៍នេះទេ។', 'No active reminders for this week.')}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {thisWeek.map((item) => (
                  <PlanItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === 'done' && (
          <>
            {doneItems.length === 0 ? (
              <div className="py-12 px-6 rounded-3xl bg-white border border-[#E5EADF] text-center space-y-2 text-xs text-[#5F6E60]">
                <p>{t('មិនទាន់មានការងារដែលបានបញ្ចប់នៅឡើយទេ។', 'No completed items yet.')}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {doneItems.map((item) => (
                  <PlanItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Feature Feedback Card for My Plan */}
      {items.length > 0 && <FeedbackCard feature="my_plan" />}
    </div>
  );
};
