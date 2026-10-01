/**
 * ម៉ែ — by FlowErs
 * Journey Page: "ដំណើររបស់អ្នក"
 *
 * Focused on the pregnancy journey:
 * - Current pregnancy week / stage
 * - Monthly voice message
 * - Small relevant focus topics ("អ្វីដែលអ្នកអាចយកចិត្តទុកដាក់")
 * - Related trusted resources
 *
 * Voice: "ម៉ែ" (Mom) is the app's NAME only. The app speaks as a friendly
 * companion, never as the user's mother. Address the user as "you" (អ្នក),
 * never as "child" (កូន).
 */

import React, { useState } from 'react';
import { Calendar, Heart, BookOpen, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FlowerVisual } from '../components/FlowerVisual';
import { AudioPlayer } from '../components/AudioPlayer';
import { TopicCard } from '../components/TopicCard';
import { ResourceCard } from '../components/ResourceCard';
import { getMonthlyMessageForWeek, getFocusTopicsForMonth, MONTHLY_MOM_MESSAGES } from '../data/monthlyMessages';

export const JourneyScreen: React.FC = () => {
  const { currentWeek, setCurrentWeek, resources, logEvent, t } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (currentWeek <= 4) return 1;
    if (currentWeek <= 8) return 2;
    if (currentWeek <= 12) return 3;
    if (currentWeek <= 16) return 4;
    if (currentWeek <= 20) return 5;
    if (currentWeek <= 24) return 6;
    if (currentWeek <= 28) return 7;
    if (currentWeek <= 34) return 8;
    return 9;
  });

  const activeMessage = MONTHLY_MOM_MESSAGES[selectedMonth - 1] || MONTHLY_MOM_MESSAGES[2];
  const activeFocusTopics = getFocusTopicsForMonth(selectedMonth);

  // Month-appropriate week range mapping
  const monthWeeks: Record<number, number> = {
    1: 4,
    2: 8,
    3: 9, // MVP focus
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 38,
  };

  const handleSelectMonth = (m: number) => {
    setSelectedMonth(m);
    const targetWeek = monthWeeks[m] || 9;
    setCurrentWeek(targetWeek);
    logEvent('pregnancy_week_selected', undefined, targetWeek, { month: m });
  };

  // Curated resources related to this stage
  const relatedResources = resources.filter((r) =>
    r.pregnancyWeeks.some((w) => {
      const startW = (selectedMonth - 1) * 4 + 1;
      const endW = selectedMonth * 4 + 4;
      return w >= startW && w <= endW;
    })
  ).slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#88A04D] uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-[#88A04D]" />
          <span>{t('ដំណើររបស់អ្នក', 'Your Pregnancy Journey')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233125]">
          {t('ដំណើរ ៩ ខែ នៃមាតុភាព', 'Nine Months of Becoming a Mother')}
        </h1>
        <p className="text-xs sm:text-sm text-[#5F6E60]">
          {t(
            'ជ្រើសរើសខែនីមួយៗដើម្បីស្តាប់សារសំឡេង និងស្វែងយល់ពីចំណុចសំខាន់ៗ។',
            'Explore each month to listen to its voice message and discover gentle focus topics.'
          )}
        </p>
      </div>

      {/* Month Stage Selector Bar (9 Months) */}
      <div className="rounded-3xl bg-white border border-[#E5EADF] p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MONTHLY_MOM_MESSAGES.map((msg) => {
            const isSelected = selectedMonth === msg.month;
            return (
              <button
                key={msg.month}
                type="button"
                onClick={() => handleSelectMonth(msg.month)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm transition-all ${
                  isSelected
                    ? 'bg-[#88A04D] text-white border-[#88A04D] font-bold shadow-xs'
                    : 'bg-[#FAF9F5] text-[#5F6E60] border-[#E5EADF] hover:text-[#233125] hover:bg-white'
                }`}
              >
                <span>🌸</span>
                <span>{t(`ខែទី ${msg.month}`, `Month ${msg.month}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Month Overview Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#EBF1E4]/80 to-white border border-[#E5EADF] p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1.5 max-w-md">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#88A04D]/30 text-xs font-semibold text-[#5C7034]">
              {t(`ខែទី ${selectedMonth} · ${activeMessage.stageWeeks}`, `Month ${selectedMonth} · ${activeMessage.stageWeeks}`)}
            </span>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#233125]">
              {t(activeMessage.flowerStage.phaseNameKh, activeMessage.flowerStage.phaseNameEn)}
            </h2>

            <p className="text-xs sm:text-sm text-[#233125]/85 italic leading-relaxed pt-1">
              “{t(activeMessage.flowerStage.descriptionKh, activeMessage.flowerStage.descriptionEn)}”
            </p>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <FlowerVisual stage={activeMessage.flowerStage} size="lg" />
            <span className="text-[11px] font-medium text-[#5F6E60] mt-1.5">
              {activeMessage.flowerStage.percent}% {t('នៃការលូតលាស់', 'Growth')}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly voice message */}
      <section>
        <AudioPlayer
          title={t(`សារសំឡេងខែទី ${selectedMonth} 🌸`, `Voice Message, Month ${selectedMonth} 🌸`)}
          subtitle={t('«មានសារតូចមួយសម្រាប់អ្នកក្នុងខែនេះ»', '"A short message for you this month"')}
          transcript={t(activeMessage.audioScriptKh, activeMessage.audioScriptEn)}
          durationStr={activeMessage.audioDuration}
          monthOrWeek={selectedMonth}
        />
      </section>

      {/* Small Relevant Focus Topics */}
      <section className="space-y-3.5">
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#233125]">
            {t('អ្វីដែលអ្នកអាចយកចិត្តទុកដាក់ក្នុងខែនេះ', 'Focus for This Month')}
          </h3>
          <p className="text-xs text-[#5F6E60] mt-0.5">
            {t('ចំណុចផ្តោតសំខាន់ៗដែលត្រូវបានរៀបចំឡើងយ៉ាងស្ងប់ចិត្ត។', 'Calm, relevant topics to focus on during this pregnancy stage.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeFocusTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>

      {/* Related Trusted Resources */}
      {relatedResources.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#233125]">
                {t('ឯកសារយោងដែលពាក់ព័ន្ធ', 'Related Trusted Resources')}
              </h3>
              <p className="text-xs text-[#5F6E60] mt-0.5">
                {t('ព័ត៌មានពីក្រសួងសុខាភិបាលកម្ពុជា WHO និង UNICEF សម្រាប់ដំណាក់កាលនេះ។', 'Health authority resources for this stage.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedResources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};