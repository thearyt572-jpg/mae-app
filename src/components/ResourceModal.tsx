/**
 * ម៉ែ — by FlowErs
 * Resource Detail Modal
 * Displays full details of a verified pregnancy resource with attribution,
 * simplified summary, and outbound source link.
 */

import React, { useState } from 'react';
import { X, ExternalLink, Edit3, Check, CalendarCheck } from 'lucide-react';
import { PregnancyResource } from '../types';
import { useApp } from '../context/AppContext';
import { FeedbackCard } from './FeedbackCard';
import { AddToPlanSheet } from './AddToPlanSheet';

interface ResourceModalProps {
  resource: PregnancyResource;
  onClose: () => void;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
  const {
    setEditingResource,
    setIsContentEntryOpen,
    logEvent,
    currentWeek,
    isResourceRead,
    toggleResourceRead,
    markResourceAsRead,
    t,
  } = useApp();

  const isRead = isResourceRead(resource.id);
  const [isPlanSheetOpen, setIsPlanSheetOpen] = useState(false);

  const planSuggestions = resource.planSuggestions && resource.planSuggestions.length > 0
    ? resource.planSuggestions
    : [
        {
          id: `sug_${resource.id}_1`,
          text_kh: `អ្នកអាចពិចារណាអនុវត្តតាមការណែនាំពីអត្ថបទ៖ ${resource.titleKh}`,
          text_en: `You may want to consider applying the guidance from: ${resource.titleEn || resource.titleKh}`,
        },
      ];

  const handleOpenSource = () => {
    markResourceAsRead(resource.id);
    logEvent('original_source_clicked', resource.id, currentWeek, {
      source: resource.sourceName,
      url: resource.sourceUrl,
      from: 'resource_modal',
    });
  };

  const handleToggleRead = () => {
    toggleResourceRead(resource.id);
  };

  const handleEdit = () => {
    setEditingResource(resource);
    setIsContentEntryOpen(true);
    onClose();
  };

  const title = t(resource.titleKh || resource.title || '', resource.titleEn || resource.title || '');
  const summary = t(resource.summaryKh || resource.summary || '', resource.summaryEn || resource.summary || '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF9F5] border-t sm:border border-[#E5EADF] shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header Bar - Sticky */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#E5EADF] flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#5C7034] font-medium mb-1">
              <span>{resource.category}</span>
              <span aria-hidden="true">·</span>
              <span>{resource.pregnancyStage}</span>
              {isRead && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#88A04D] font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{t('បានអានរួច', 'Read')}</span>
                  </span>
                </>
              )}
            </div>
            <h2
              id="resource-modal-title"
              className="text-base sm:text-xl font-bold text-[#233125] font-serif leading-snug"
            >
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#5F6E60] mt-1">
              {t('ប្រភពដែលអាចទុកចិត្តបាន៖', 'Trusted Source:')}{' '}
              <span className="font-semibold text-[#233125]">{resource.sourceName}</span>
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleRead}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border text-xs font-medium transition-colors ${
                isRead
                  ? 'bg-[#EBF1E4] text-[#5C7034] border-[#88A04D]/40'
                  : 'bg-[#FAF9F5] text-[#5F6E60] hover:text-[#233125] border-[#E5EADF]'
              }`}
              title={isRead ? t('សម្គាល់ថាមិនទាន់អាន', 'Mark unread') : t('សម្គាល់ថាបានអាន', 'Mark as read')}
              aria-label="Toggle read status"
            >
              <Check className={`w-4 h-4 ${isRead ? 'stroke-[2.5]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* FlowErs Friendly Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C7034]">
              🌸 {t('សេចក្តីសង្ខេប', 'Friendly Summary')}
            </h3>
            <div className="rounded-2xl bg-white border border-[#E5EADF] p-4 text-sm sm:text-base text-[#233125] leading-relaxed">
              {summary}
            </div>
          </div>

          {/* What This Summary Helps With */}
          {resource.summaryPurpose && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5F6E60]">
                🌱 {t('ជំនួយដល់ការយល់ដឹងរបស់អ្នក', 'What this helps you understand')}
              </h3>
              <p className="text-xs sm:text-sm text-[#233125]/85 bg-[#F0F4E8]/60 p-3.5 rounded-xl border border-[#88A04D]/20 leading-relaxed">
                {resource.summaryPurpose}
              </p>
            </div>
          )}

          {/* Weekly / Stage Focus */}
          {resource.weeklyFocus && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#88A04D]">
                📝 {t('ចំណុចផ្តោតសំខាន់', 'Stage Focus')}
              </h3>
              <div className="rounded-xl bg-[#DDE8F1]/40 border border-[#DDE8F1] p-3.5 text-xs sm:text-sm text-[#233125] leading-relaxed">
                {resource.weeklyFocus}
              </div>
            </div>
          )}

          {/* Feedback Card after reading */}
          {isRead && <FeedbackCard feature="reading" />}
        </div>

        {/* Footer Actions - Safe area padded */}
        <div className="p-3 sm:p-5 bg-white border-t border-[#E5EADF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
            <button
              type="button"
              onClick={handleToggleRead}
              className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full border transition-all ${
                isRead
                  ? 'bg-[#EBF1E4] text-[#5C7034] border-[#88A04D]/40'
                  : 'bg-white text-[#5F6E60] hover:text-[#233125] border-[#E5EADF] hover:bg-[#FAF9F5]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isRead ? t('បានអានរួច', 'Marked Read') : t('សម្គាល់ថាបានអាន', 'Mark as Read')}</span>
            </button>

            {/* Add to My Plan Button */}
            <button
              type="button"
              onClick={() => setIsPlanSheetOpen(true)}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full border border-[#88A04D]/40 bg-[#F0F4E8] text-[#5C7034] hover:bg-[#EBF1E4] transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-[#88A04D]" />
              <span>{t('បញ្ចូលក្នុងគម្រោង', 'Add to My Plan')}</span>
            </button>

            <button
              type="button"
              onClick={handleEdit}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[#5F6E60] hover:text-[#233125] px-3 py-2 rounded-lg hover:bg-[#FAF9F5] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('កែប្រែ', 'Edit')}</span>
            </button>
          </div>

          <a
            href={resource.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenSource}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
          >
            <span>{t('អានឯកសារដើម', 'Read Original Source')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Add To Plan Bottom Sheet */}
      <AddToPlanSheet
        isOpen={isPlanSheetOpen}
        onClose={() => setIsPlanSheetOpen(false)}
        sourceType="resource"
        sourceId={resource.id}
        sourceTitle={t(resource.titleKh, resource.titleEn)}
        suggestions={planSuggestions}
      />
    </div>
  );
};
