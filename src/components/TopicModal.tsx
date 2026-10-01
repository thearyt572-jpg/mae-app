/**
 * ម៉ែ — by FlowErs
 * Topic Detail Modal
 * Displays small focus details and connects them directly to verified
 * trusted resources (NMCHC, WHO, UNICEF, RHAC).
 */

import React from 'react';
import { X, ExternalLink, ArrowRight, BookOpen, HelpCircle, Heart } from 'lucide-react';
import { FocusTopic } from '../types';
import { useApp } from '../context/AppContext';

interface TopicModalProps {
  topic: FocusTopic;
  onClose: () => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({ topic, onClose }) => {
  const { getResourceById, setSelectedResource, logEvent, currentWeek, t } = useApp();

  const linkedResources = topic.resourceIds
    .map((id) => getResourceById(id))
    .filter(Boolean);

  const handleResourceClick = (res: any) => {
    setSelectedResource(res);
    logEvent('resource_opened', res.id, currentWeek, {
      from: 'topic_modal',
      topic: topic.titleKh,
    });
  };

  const title = t(topic.titleKh, topic.titleEn);
  const summary = t(topic.summaryKh, topic.summaryEn);
  const suggestedQuestions =
    t(topic.suggestedQuestionsKh?.join('||') || '', topic.suggestedQuestionsEn?.join('||') || '')
      .split('||')
      .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF9F5] border border-[#E5EADF] shadow-xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-[#E5EADF] flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#88A04D] uppercase tracking-wider block mb-1">
              🌸 {t('ចំណុចផ្តោតសំខាន់', 'Key Focus')} · {topic.category}
            </span>
            <h2
              id="topic-modal-title"
              className="text-lg sm:text-xl font-bold text-[#233125] font-serif leading-snug"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#5F6E60] hover:text-[#233125] rounded-full hover:bg-[#FAF9F5] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="rounded-2xl bg-white border border-[#E5EADF] p-4 text-sm sm:text-base text-[#233125] leading-relaxed">
            <p>{summary}</p>
          </div>

          {/* Suggested Questions to Ask Midwife / Doctor */}
          {suggestedQuestions.length > 0 && (
            <div className="rounded-2xl bg-[#EBF1E4]/60 border border-[#88A04D]/30 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7034]">
                <HelpCircle className="w-4 h-4 text-[#88A04D]" />
                <span>{t('សំណួរដែលសួរគ្រូពេទ្យ ឬឆ្មប', 'Questions to Ask Your Doctor or Midwife')}</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[#233125]">
                {suggestedQuestions.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-[#E5EADF]/60">
                    <span className="text-[#88A04D] font-bold shrink-0">?</span>
                    <span className="italic">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Connected Verified Resources */}
          {linkedResources.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6E60] uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#88A04D]" />
                <span>{t('ឯកសារយោងដែលអាចទុកចិត្តបាន (ក្រសួងសុខាភិបាល / WHO / UNICEF)', 'Trusted References')}</span>
              </div>

              <div className="space-y-2">
                {linkedResources.map((res: any) => (
                  <div
                    key={res.id}
                    onClick={() => handleResourceClick(res)}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5EADF] hover:border-[#88A04D]/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#233125] group-hover:text-[#5C7034] transition-colors leading-snug">
                        {t(res.titleKh || res.title, res.titleEn || res.title)}
                      </h4>
                      <p className="text-[11px] text-[#5F6E60] mt-0.5">
                        {t('ប្រភព៖', 'Source:')} {res.sourceName}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#88A04D] shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5EADF] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#FAF9F5] border border-[#E5EADF] text-xs font-medium text-[#233125] hover:bg-[#EBF1E4] transition-colors"
          >
            {t('បិទ', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
