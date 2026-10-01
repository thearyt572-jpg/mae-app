/**
 * ម៉ែ — by FlowErs
 * Resource Detail Modal
 * Displays full details of a verified pregnancy resource with attribution,
 * simplified summary, and outbound source link.
 */

import React from 'react';
import { X, ExternalLink, Edit3, Check } from 'lucide-react';
import { PregnancyResource } from '../types';
import { useApp } from '../context/AppContext';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF9F5] border border-[#E5EADF] shadow-xl overflow-hidden my-6">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E5EADF] flex items-start justify-between gap-4">
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
              className="text-lg sm:text-xl font-bold text-[#233125] font-serif leading-snug"
            >
              {title}
            </h2>
            <p className="text-xs text-[#5F6E60] mt-1">
              {t('ប្រភពដែលអាចទុកចិត្តបាន៖', 'Trusted Source:')}{' '}
              <span className="font-semibold text-[#233125]">{resource.sourceName}</span>
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleRead}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                isRead
                  ? 'bg-[#EBF1E4] text-[#5C7034] border-[#88A04D]/40'
                  : 'bg-[#FAF9F5] text-[#5F6E60] hover:text-[#233125] border-[#E5EADF]'
              }`}
              title={isRead ? t('សម្គាល់ថាមិនទាន់អាន', 'Mark unread') : t('សម្គាល់ថាបានអាន', 'Mark as read')}
            >
              <Check className={`w-4 h-4 ${isRead ? 'stroke-[2.5]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
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
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5EADF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleRead}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full border transition-all ${
                isRead
                  ? 'bg-[#EBF1E4] text-[#5C7034] border-[#88A04D]/40 font-semibold'
                  : 'bg-white text-[#5F6E60] hover:text-[#233125] border-[#E5EADF] hover:bg-[#FAF9F5]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isRead ? t('បានអានរួច', 'Marked Read') : t('សម្គាល់ថាបានអាន', 'Mark as Read')}</span>
            </button>

            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5F6E60] hover:text-[#233125] px-3 py-2 rounded-lg hover:bg-[#FAF9F5] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('កែប្រែ (ក្រុមការងារ)', 'Edit (Team)')}</span>
            </button>
          </div>

          <a
            href={resource.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenSource}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white text-xs sm:text-sm font-medium shadow-xs transition-all active:scale-95"
          >
            <span>{t('អានឯកសារដើម', 'Read Original Source')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
