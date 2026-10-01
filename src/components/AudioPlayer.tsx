/**
 * ម៉ែ — by FlowErs
 * "ម៉ែចង់ប្រាប់កូន" (A Message from Mom)
 *
 * Warm, emotional monthly voice player from a Cambodian mother to her daughter.

 * Built so placeholder voice/audio can be replaced seamlessly with studio recordings.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FileText, Sparkles, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AudioPlayerProps {
  title?: string;
  subtitle?: string;
  transcript: string;
  durationStr?: string;
  monthOrWeek: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title,
  subtitle,
  transcript,
  durationStr = '2:15',
  monthOrWeek,
}) => {
  const { logEvent, t, language } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTimeStr, setCurrentTimeStr] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const displayTitle = title || t('ម៉ែមានរឿងចង់ប្រាប់អ្នក 🌸', 'A Message for Mom 🌸');
  const displaySubtitle = subtitle || t('«ម៉ែមានរឿងមួយប្រាប់អ្នក…»', '"There’s something Mea wants to tell you…"');

  // Convert "2:15" to seconds
  const totalSeconds = (() => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 135;
  })();

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Speech / Audio simulation
  const speakVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcript);
      utterance.rate = 0.88; // gentle, unhurried maternal pace
      utterance.pitch = 1.05;

      // Select gentle voice if present
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find((v) =>
        language === 'km' ? v.lang.startsWith('km') : v.lang.startsWith('en')
      );
      if (matchVoice) utterance.voice = matchVoice;

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        setCurrentTimeStr(durationStr);
        logEvent('monthly_message_completed', `mom_voice_m${monthOrWeek}`, monthOrWeek);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  };

  const stopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      logEvent('monthly_message_played', `mom_voice_m${monthOrWeek}`, monthOrWeek);
      speakVoice();
    } else {
      setIsPlaying(false);
      stopVoice();
    }
  };

  const handleReplay = () => {
    stopVoice();
    setProgress(0);
    setCurrentTimeStr('0:00');
    setIsPlaying(true);
    speakVoice();
    logEvent('monthly_message_played', `mom_voice_m${monthOrWeek}`, monthOrWeek, { action: 'replay' });
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (100 / totalSeconds) * 0.5;
          if (next >= 100) {
            clearInterval(intervalRef.current!);
            setIsPlaying(false);
            setCurrentTimeStr(durationStr);
            logEvent('monthly_message_completed', `mom_voice_m${monthOrWeek}`, monthOrWeek);
            return 100;
          }
          const curSec = (next / 100) * totalSeconds;
          setCurrentTimeStr(formatSeconds(curSec));
          return next;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSeconds, durationStr, monthOrWeek]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    const curSec = (val / 100) * totalSeconds;
    setCurrentTimeStr(formatSeconds(curSec));
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#F0F4E8]/80 via-white to-[#FAF9F5] border border-[#E5EADF] p-5 sm:p-7 shadow-xs">
      {/* Header: ម៉ែមានរឿងចង់ប្រាប់អ្នក */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#88A04D]/30 text-xs font-semibold text-[#5C7034] mb-2 shadow-2xs">
            <Heart className="w-3.5 h-3.5 fill-[#88A04D] text-[#88A04D]" />
            <span>{t('សារសំឡេងប្រចាំខែពីម៉ែ', 'Monthly Voice Message from Mom')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#233125] leading-snug">
            {displayTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#5C7034] font-medium italic mt-1">
            {displaySubtitle}
          </p>
        </div>

        {/* Transcript Toggle Button */}
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          className={`self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            showTranscript
              ? 'bg-[#EBF1E4] border-[#88A04D] text-[#5C7034] font-semibold'
              : 'bg-white border-[#E5EADF] text-[#5F6E60] hover:text-[#233125]'
          }`}
          title={t('អានអត្ថបទពេញ', 'Read Full Transcript')}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showTranscript ? t('លាក់អត្ថបទ', 'Hide Transcript') : t('អានសារជាអក្សរ', 'Read Transcript')}</span>
        </button>
      </div>

      {/* Audio Controls Box */}
      <div className="rounded-2xl bg-white border border-[#E5EADF] p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Progress Bar & Timestamps */}
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-[#E5EADF] rounded-lg appearance-none cursor-pointer accent-[#88A04D] focus:outline-none"
              aria-label="Audio progress slider"
            />
          </div>
          <div className="flex justify-between text-xs font-mono tabular-nums text-[#5F6E60]">
            <span>{currentTimeStr}</span>
            <span className="text-[#88A04D] font-medium">{durationStr}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReplay}
              className="p-2 text-[#5F6E60] hover:text-[#233125] hover:bg-[#F0F4E8] rounded-full transition-colors"
              title={t('ស្តាប់ឡើងវិញ', 'Replay from start')}
              aria-label="Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) stopVoice();
                else if (isPlaying) speakVoice();
              }}
              className="p-2 text-[#5F6E60] hover:text-[#233125] hover:bg-[#F0F4E8] rounded-full transition-colors"
              title={isMuted ? t('បើកសំឡេង', 'Unmute') : t('បិទសំឡេង', 'Mute')}
              aria-label="Mute toggle"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Primary Play / Pause CTA Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#88A04D] hover:bg-[#5C7034] text-white font-medium text-sm shadow-sm transition-all active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play voice message'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span className="font-semibold">{t('ផ្អាកសំឡេង', 'Pause Voice')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span className="font-semibold">{t('ស្តាប់សំឡេង', "Listen to Voice")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Drawer with warm Cambodian motherly tone */}
      {showTranscript && (
        <div className="mt-4 pt-4 border-t border-[#E5EADF] bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl space-y-2 border border-[#E5EADF]/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C7034] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#88A04D]" />
            <span>{t('សាររំលឹក', "Reminder Message")}</span>
          </div>

          <p className="text-sm sm:text-base text-[#233125] leading-relaxed italic bg-white p-4 rounded-xl border border-[#E5EADF]">
            “{transcript}”
          </p>

          <p className="text-[11px] text-[#5F6E60]">
            {t(
              'សំឡេងពិតប្រាកដជាភាសាខ្មែរ និយាយដោយភាពទន់ភ្លន់ នឹងត្រូវបានជំនួសនៅជំហានបន្ទាប់។',
              'Placeholder audio interface ready for studio Khmer maternal recordings.'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
