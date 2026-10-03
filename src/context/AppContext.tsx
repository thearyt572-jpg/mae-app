/**
 * ម៉ែ — by FlowErs
 * Application State Management
 *
 * Khmer-first, Cambodia-first pregnancy companion for first-time mothers.
 * Manages user session, monthly voice messages, weekly stage focus
 * ("អ្វីដែលអ្នកអាចយកចិត្តទុកដាក់"), curated resources library,
 * reading progress tracker, and telemetry (only after the user consents).
 *
 * Voice: "ម៉ែ" (Mom) is the app's NAME only. The app is a companion, not the
 * user's mother. Address the user as "you" (អ្នក), never as "កូន" (child).
 *
 * LIVE-DATA NOTES:
 * - There is no demo account. Every user signs up for real.
 * - signup() / login() / logout() use Supabase Auth (email + password). Testers may
 *   use a made-up email: nothing is ever sent to it. The profile (name, week, etc.)
 *   is saved to the Supabase `users` table, one row per person.
 * - Analytics events are only recorded when analyticsConsent === 'granted'.
 * - Resources are loaded from the Supabase `resources` table (Published rows).
 *   The local list is kept as a fallback for weak or missing internet.
 * - Analytics events are saved to localStorage AND the Supabase
 *   `analytics_events` table (only after consent).
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  UserLanguage,
  NotificationPreference,
  PregnancyResource,
  FocusTopic,
  MonthlyMessage,
  AnalyticsEvent,
  AnalyticsEventType,
} from '../types';
import { INITIAL_PREGNANCY_RESOURCES } from '../data/resources';
import {
  getMonthlyMessageForWeek,
  getFocusTopicsForMonth,
  MONTHLY_MOM_MESSAGES,
} from '../data/monthlyMessages';
import { supabase } from '../lib/supabase';

const STORAGE_KEY_USER = 'mae_user_session';
const STORAGE_KEY_RESOURCES = 'mae_resources_catalog_v3';
const STORAGE_KEY_READ_RESOURCES = 'mae_read_resources';
const STORAGE_KEY_ANALYTICS = 'mae_analytics_events';
const STORAGE_KEY_LANG = 'mae_user_lang';
const STORAGE_KEY_CONSENT = 'mae_analytics_consent';

export type TabKey = 'home' | 'journey' | 'explore' | 'profile' | 'resources';

/** 'unset' = the user has not answered the cookie/data banner yet (nothing is tracked). */
export type ConsentStatus = 'unset' | 'granted' | 'denied';

interface AppContextType {
  // Language & Localization (Khmer first)
  language: UserLanguage;
  setLanguage: (lang: UserLanguage) => void;
  toggleLanguage: () => void;
  t: (km?: string, en?: string) => string;

  // User Session
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserPreferences: (updates: Partial<User>) => void;

  // Onboarding
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (data: {
    name: string;
    pregnancy_week: number;
    due_date?: string;
    language: UserLanguage;
    notification_preference: NotificationPreference;
  }) => void;

  // Week, Month & Guidance
  currentWeek: number;
  currentMonth: number;
  setCurrentWeek: (week: number) => void;
  monthlyMessage: MonthlyMessage;
  focusTopics: FocusTopic[];
  monthlyMessagesList: MonthlyMessage[];

  // Resources (Curated Library & Team Content Entry)
  resources: PregnancyResource[];
  addResource: (res: Omit<PregnancyResource, 'id' | 'createdAt' | 'updatedAt'>) => PregnancyResource;
  updateResource: (id: string, updates: Partial<PregnancyResource>) => void;
  deleteResource: (id: string) => void;
  resetDefaultResources: () => void;
  getResourceById: (id: string) => PregnancyResource | undefined;

  // Reading Progress Tracker
  readResourceIds: string[];
  markResourceAsRead: (id: string) => void;
  toggleResourceRead: (id: string) => void;
  isResourceRead: (id: string) => boolean;
  resetReadProgress: () => void;

  // Modals & Navigation
  activeTab: 'home' | 'journey' | 'explore' | 'profile';
  setActiveTab: (tab: 'home' | 'journey' | 'explore' | 'profile' | 'resources') => void;
  selectedResource: PregnancyResource | null;
  setSelectedResource: (res: PregnancyResource | null) => void;
  selectedTopic: FocusTopic | null;
  setSelectedTopic: (topic: FocusTopic | null) => void;
  isContentEntryOpen: boolean;
  setIsContentEntryOpen: (open: boolean) => void;
  editingResource: PregnancyResource | null;
  setEditingResource: (res: PregnancyResource | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;

  // Data & cookie consent
  analyticsConsent: ConsentStatus;
  setAnalyticsConsent: (status: 'granted' | 'denied') => void;

  // Analytics (recorded only when consent is granted)
  analyticsEvents: AnalyticsEvent[];
  logEvent: (
    eventName: AnalyticsEventType,
    contentId?: string,
    pregnancyWeek?: number,
    metadata?: Record<string, unknown>
  ) => void;
  isAnalyticsOpen: boolean;
  setIsAnalyticsOpen: (open: boolean) => void;
  clearAnalytics: () => void;
  deleteMyData: () => Promise<{ success: boolean; error?: string }>;

  // Toast Notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Converts a Supabase row (title_kh) into the shape the app uses (titleKh). */
const rowToResource = (row: any): PregnancyResource =>
  ({
    id: row.id,
    titleKh: row.title_kh,
    titleEn: row.title_en,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    category: row.category,
    pregnancyStage: row.pregnancy_stage,
    pregnancyWeeks: row.pregnancy_weeks ?? [],
    summaryKh: row.summary_kh,
    summaryEn: row.summary_en,
    summaryPurpose: row.summary_purpose,
    weeklyFocus: row.weekly_focus,
    status: row.status,
    title: row.title_kh,
    summary: row.summary_kh,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  }) as PregnancyResource;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language State - Default to 'km' (Khmer first)
  const [language, setLanguageState] = useState<UserLanguage>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LANG);
      if (stored === 'en' || stored === 'km') return stored;
    } catch {}
    return 'km'; // Khmer by default
  });

  const setLanguage = (lang: UserLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {}
    if (user) {
      updateUserPreferences({ language: lang });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'km' ? 'en' : 'km');
  };

  const t = (km?: string, en?: string) => (language === 'km' ? (km ?? en ?? '') : (en ?? km ?? ''));

  // 2. User State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 3. Resources State (allows team to add/edit/delete resources)
  const [resources, setResources] = useState<PregnancyResource[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RESOURCES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PREGNANCY_RESOURCES;
  });

  // 4. Data & cookie consent (nothing is tracked until this is 'granted')
  const [analyticsConsent, setAnalyticsConsentState] = useState<ConsentStatus>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONSENT);
      if (stored === 'granted' || stored === 'denied') return stored;
    } catch {}
    return 'unset';
  });

  // 5. Analytics Events State
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ANALYTICS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 6. Read Resources State (for visual progress tracker)
  const [readResourceIds, setReadResourceIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_READ_RESOURCES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // UI States
  const [currentWeek, setCurrentWeek] = useState<number>(() => user?.pregnancy_week || 9);
  const [activeTab, setActiveTabState] = useState<'home' | 'journey' | 'explore' | 'profile'>('home');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [selectedResource, setSelectedResource] = useState<PregnancyResource | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<FocusTopic | null>(null);
  const [isContentEntryOpen, setIsContentEntryOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<PregnancyResource | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const setActiveTab = (tab: 'home' | 'journey' | 'explore' | 'profile' | 'resources') => {
    const target = tab === 'resources' ? 'explore' : tab;
    setActiveTabState(target);
    if (target === 'journey') {
      logEvent('journey_opened', undefined, currentWeek);
    } else if (target === 'explore') {
      logEvent('explore_opened', undefined, currentWeek);
    }
  };

  // Derive month (1 to 9) from currentWeek
  const currentMonth = useMemo(() => {
    if (currentWeek <= 4) return 1;
    if (currentWeek <= 8) return 2;
    if (currentWeek <= 12) return 3;
    if (currentWeek <= 16) return 4;
    if (currentWeek <= 20) return 5;
    if (currentWeek <= 24) return 6;
    if (currentWeek <= 28) return 7;
    if (currentWeek <= 34) return 8;
    return 9;
  }, [currentWeek]);

  // Derive the monthly voice message for the current week
  const monthlyMessage = useMemo(() => {
    return getMonthlyMessageForWeek(currentWeek);
  }, [currentWeek]);

  // Derive small focus topics for current month/stage
  const focusTopics = useMemo(() => {
    return getFocusTopicsForMonth(currentMonth);
  }, [currentMonth]);

  // Sync user changes to localStorage & update week
  // TODO(database): replace with a call to your database client (e.g. Supabase / Firebase).
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        if (user.pregnancy_week) {
          setCurrentWeek(user.pregnancy_week);
        }
        if (user.language) {
          setLanguageState(user.language);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [user]);

  // Load published resources from Supabase. If it fails (weak signal), the
  // cached or built-in list already in state stays in place.
  useEffect(() => {
    supabase
      .from('resources')
      .select('*')
      .eq('status', 'Published')
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          if (error) console.warn('Could not load resources', error.message);
          return;
        }
        const order = INITIAL_PREGNANCY_RESOURCES.map((r) => r.id);
        const rank = (id: string) => {
          const i = order.indexOf(id);
          return i === -1 ? 999 : i;
        };
        const mapped = data.map(rowToResource).sort((a, b) => rank(a.id) - rank(b.id));
        setResources(mapped);
      });
  }, []);

  // If the saved local user has no real Supabase session (for example an old
  // placeholder account), sign them out locally so they log in properly.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setUser((prev) => (prev ? null : prev));
      }
    });
  }, []);

  // Sync resources to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.warn('Resources storage sync error', e);
    }
  }, [resources]);

  // Sync analytics to localStorage (a local copy for the in-app research panel)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(analyticsEvents));
    } catch (e) {
      console.warn('Analytics storage sync error', e);
    }
  }, [analyticsEvents]);

  // Sync read resources to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_READ_RESOURCES, JSON.stringify(readResourceIds));
    } catch (e) {
      console.warn('Read resources storage sync error', e);
    }
  }, [readResourceIds]);

  // Load user's reading progress from Supabase user_read_resources table on login/mount
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_read_resources')
      .select('resource_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && Array.isArray(data)) {
          const ids = data.map((r: any) => r.resource_id).filter(Boolean);
          if (ids.length > 0) {
            setReadResourceIds((prev) => Array.from(new Set([...prev, ...ids])));
          }
        }
      });
  }, [user?.id]);

  // Toast notification helper with auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Data & cookie consent. Declining also wipes anything already recorded locally.
  const setAnalyticsConsent = (status: 'granted' | 'denied') => {
    setAnalyticsConsentState(status);
    try {
      localStorage.setItem(STORAGE_KEY_CONSENT, status);
    } catch {}
    if (status === 'denied') {
      setAnalyticsEvents([]);
      try {
        localStorage.removeItem(STORAGE_KEY_ANALYTICS);
      } catch {}
    }
  };

  // Analytics event logger. Records nothing unless the user has agreed.
  const logEvent = (
    eventName: AnalyticsEventType,
    contentId?: string,
    pregnancyWeek?: number,
    metadata?: Record<string, unknown>
  ) => {
    if (analyticsConsent !== 'granted') return;
    const newEvent: AnalyticsEvent = {
      id: 'evt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      userId: user?.id || 'guest_user',
      eventName,
      contentId,
      pregnancyWeek: pregnancyWeek ?? currentWeek,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setAnalyticsEvents((prev) => [newEvent, ...prev.slice(0, 199)]);

    // Also save to the Supabase analytics_events table
    supabase
      .from('analytics_events')
      .insert({
        user_id: newEvent.userId,
        event_name: eventName,
        content_id: contentId ?? null,
        pregnancy_week: newEvent.pregnancyWeek,
        metadata: metadata ?? null,
      })
      .then(({ error }) => {
        if (error) console.warn('Analytics save failed', error.message);
      });
  };

  const clearAnalytics = () => {
    setAnalyticsEvents([]);
    try {
      localStorage.removeItem(STORAGE_KEY_ANALYTICS);
    } catch {}
    showToast(t('បានសម្អាតទិន្នន័យស្រាវជ្រាវ', 'Research data cleared.'));
  };

  // Saves the profile fields to the Supabase users table (the person's own row only).
  const saveProfile = async (u: User) => {
    const { error } = await supabase.from('users').upsert({
      id: u.id,
      name: u.name,
      language: u.language,
      pregnancy_week: u.pregnancy_week,
      due_date: u.due_date || null,
      notification_preference: u.notification_preference,
    });
    if (error) console.warn('Profile save failed', error.message);
  };

  // Authentication Flows (Supabase Auth, email + password)
  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: t('សូមបញ្ចូលឈ្មោះរបស់អ្នក។', 'Please enter your name.') };
    if (!email.includes('@')) return { success: false, error: t('សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ។', 'Please enter a valid email address.') };
    if (pass.length < 6) return { success: false, error: t('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ។', 'Password must be at least 6 characters.') };

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password: pass });
    if (error || !data.user) {
      return { success: false, error: error?.message || t('មិនអាចបង្កើតគណនីបានទេ។', 'Could not create the account.') };
    }
    if (!data.session) {
      return {
        success: false,
        error: 'Account created, but Supabase still wants email confirmation. Turn off "Confirm email" in Authentication.',
      };
    }

    const newUser: User = {
      id: data.user.id,
      name: name.trim(),
      email: cleanEmail,
      language: language || 'km',
      pregnancy_week: 9,
      notification_preference: 'weekly',
      created_at: new Date().toISOString(),
    };

    setUser(newUser);
    saveProfile(newUser);
    logEvent('account_created', newUser.id, 9);
    logEvent('signup_completed', newUser.id, 9);
    setIsAuthModalOpen(false);
    setIsOnboardingOpen(true);
    showToast(t(`សូមស្វាគមន៍មកកាន់ «ម៉ែ», ${newUser.name} 🌸`, `Welcome to ម៉ែ, ${newUser.name} 🌸`));
    return { success: true };
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email.includes('@')) return { success: false, error: t('សូមបញ្ចូលអ៊ីមែលឱ្យបានត្រឹមត្រូវ។', 'Please enter a valid email address.') };
    if (!pass) return { success: false, error: t('សូមបញ្ចូលពាក្យសម្ងាត់របស់អ្នក។', 'Please enter your password.') };

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: pass });
    if (error || !data.user) {
      return { success: false, error: t('អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។', 'Wrong email or password.') };
    }

    const { data: row } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();

    const returningUser: User = {
      id: data.user.id,
      name: row?.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      language: row?.language || language || 'km',
      pregnancy_week: row?.pregnancy_week || 9,
      due_date: row?.due_date || undefined,
      notification_preference: row?.notification_preference || 'weekly',
      created_at: row?.created_at || new Date().toISOString(),
    };

    setUser(returningUser);
    logEvent('login_completed', returningUser.id, returningUser.pregnancy_week);
    setIsAuthModalOpen(false);
    showToast(t(`សូមស្វាគមន៍ការត្រឡប់មកវិញ 🌸`, `Welcome back, Mama 🌸`));
    return { success: true };
  };

  const logout = () => {
    logEvent('logout_completed', user?.id);
    supabase.auth.signOut();
    setUser(null);
    setCurrentWeek(9);
    setActiveTabState('home');
    showToast(t('អ្នកបានចាកចេញដោយសុវត្ថិភាព។ ថែរក្សាសុខភាពណា 🌸', 'You have logged out peacefully. Take care 🌸'));
  };

  const updateUserPreferences = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    saveProfile(updated);
    if (updates.pregnancy_week) {
      setCurrentWeek(updates.pregnancy_week);
      logEvent('pregnancy_week_selected', undefined, updates.pregnancy_week);
    }
    if (updates.language) {
      setLanguageState(updates.language);
    }
    if (updates.notification_preference) {
      logEvent('notification_preference_selected', undefined, undefined, {
        preference: updates.notification_preference,
      });
    }
    logEvent('profile_updated', user.id);
    showToast(t('បានកែប្រែព័ត៌មានដោយជោគជ័យ។', 'Preferences updated gently.'));
  };

  const completeOnboarding = (data: {
    name: string;
    pregnancy_week: number;
    due_date?: string;
    language: UserLanguage;
    notification_preference: NotificationPreference;
  }) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      name: data.name || user.name,
      pregnancy_week: data.pregnancy_week,
      due_date: data.due_date,
      language: data.language,
      notification_preference: data.notification_preference,
    };
    setUser(updatedUser);
    saveProfile(updatedUser);
    setLanguageState(data.language);
    setCurrentWeek(data.pregnancy_week);
    setIsOnboardingOpen(false);
    logEvent('onboarding_completed', user.id, data.pregnancy_week, {
      language: data.language,
      reminders: data.notification_preference,
    });
    showToast(t(`សូមស្វាគមន៍ដំណើរក្លាយជាម្តាយដ៏កក់ក្តៅ 🌸`, `Welcome to your pregnancy journey, Mama 🌸`));
  };

  // Resources CRUD for Content Management
  // NOTE: these only change the browser copy for now. Add or edit real
  // articles in the Supabase Table Editor.
  const addResource = (resData: Omit<PregnancyResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newResource: PregnancyResource = {
      ...resData,
      id: 'res_' + Date.now().toString(36),
      title: resData.titleKh || resData.titleEn,
      summary: resData.summaryKh || resData.summaryEn,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResources((prev) => [newResource, ...prev]);
    showToast(t('បានបញ្ចូលឯកសារចំណេះដឹងថ្មីដោយជោគជ័យ 🌿', 'New pregnancy resource added successfully 🌿'));
    return newResource;
  };

  const updateResource = (id: string, updates: Partial<PregnancyResource>) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...updates,
              title: updates.titleKh || updates.title || r.titleKh,
              summary: updates.summaryKh || updates.summary || r.summaryKh,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    showToast(t('បានកែសម្រួលឯកសាររួចរាល់ 🌿', 'Resource updated successfully 🌿'));
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    showToast(t('បានលុបឯកសារ។', 'Resource removed.'));
  };

  const resetDefaultResources = () => {
    setResources(INITIAL_PREGNANCY_RESOURCES);
    showToast(t('បានត្រឡប់ទៅបញ្ជីឯកសារដើមដែលផ្ទៀងផ្ទាត់ដោយ FlowErs។', 'Resources reset to verified catalog.'));
  };

  const getResourceById = (id: string) => {
    return resources.find((r) => r.id === id);
  };

  const markResourceAsRead = (id: string) => {
    if (!readResourceIds.includes(id)) {
      setReadResourceIds((prev) => [...prev, id]);
      logEvent('resource_marked_read', id, currentWeek);
      if (user?.id) {
        supabase
          .from('user_read_resources')
          .insert({ user_id: user.id, resource_id: id })
          .then(({ error }) => {
            if (error) console.warn('Could not save read status to database', error.message);
          });
      }
      showToast(t('អ្នកបានអានអត្ថបទនេះរួចរាល់ហើយ 🌸', 'Article marked as read! Gentle progress, Mama 🌸'));
    }
  };

  const toggleResourceRead = (id: string) => {
    if (readResourceIds.includes(id)) {
      setReadResourceIds((prev) => prev.filter((rId) => rId !== id));
      logEvent('resource_marked_unread', id, currentWeek);
      if (user?.id) {
        supabase
          .from('user_read_resources')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', id)
          .then(({ error }) => {
            if (error) console.warn('Could not delete read status from database', error.message);
          });
      }
      showToast(t('បានដកចេញពីបញ្ជីអានរួច។', 'Article unmarked.'));
    } else {
      setReadResourceIds((prev) => [...prev, id]);
      logEvent('resource_marked_read', id, currentWeek);
      if (user?.id) {
        supabase
          .from('user_read_resources')
          .insert({ user_id: user.id, resource_id: id })
          .then(({ error }) => {
            if (error) console.warn('Could not save read status to database', error.message);
          });
      }
      showToast(t('អ្នកបានអានអត្ថបទនេះរួចរាល់ហើយ 🌸', 'Article marked as read! Gentle progress, Mama 🌸'));
    }
  };

  const resetReadProgress = () => {
    setReadResourceIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY_READ_RESOURCES);
    } catch {}
    if (user?.id) {
      supabase
        .from('user_read_resources')
        .delete()
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.warn('Could not reset read status from database', error.message);
        });
    }
    showToast(t('បានកំណត់ប្រវត្តិការអានឡើងវិញ។', 'Reading progress reset.'));
  };

  const isResourceRead = (id: string) => readResourceIds.includes(id);

  // Permanently deletes all personal data from database & local device
  const deleteMyData = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: t('មិនមានគណនីកំពុងចូលប្រើទេ។', 'No user logged in.') };
    }

    try {
      // 1. Delete rows in analytics_events for this user
      await supabase.from('analytics_events').delete().eq('user_id', user.id);

      // 2. Delete rows in user_read_resources
      await supabase.from('user_read_resources').delete().eq('user_id', user.id);

      // 3. Delete user row in users table
      const { error: userError } = await supabase.from('users').delete().eq('id', user.id);
      if (userError) {
        console.warn('Could not delete profile from users table', userError.message);
      }

      // 4. Clear local storage
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_READ_RESOURCES);
        localStorage.removeItem(STORAGE_KEY_ANALYTICS);
      } catch {}

      // 5. Reset local state
      setUser(null);
      setReadResourceIds([]);
      setAnalyticsEvents([]);
      setCurrentWeek(9);
      setActiveTabState('home');

      // 6. Sign out of Supabase auth
      await supabase.auth.signOut();

      showToast(t('ទិន្នន័យទាំងអស់របស់អ្នកត្រូវបានលុបចេញដោយសុវត្ថិភាព 🌸', 'All your data has been safely deleted 🌸'));
      return { success: true };
    } catch (err: any) {
      console.error('Delete data failed:', err);
      return { success: false, error: err?.message || 'Delete data failed' };
    }
  };

  const value: AppContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUserPreferences,
    isOnboardingOpen,
    setIsOnboardingOpen,
    completeOnboarding,
    currentWeek,
    currentMonth,
    setCurrentWeek,
    monthlyMessage,
    focusTopics,
    monthlyMessagesList: MONTHLY_MOM_MESSAGES,
    resources,
    addResource,
    updateResource,
    deleteResource,
    resetDefaultResources,
    getResourceById,
    readResourceIds,
    markResourceAsRead,
    toggleResourceRead,
    isResourceRead,
    resetReadProgress,
    activeTab,
    setActiveTab,
    selectedResource,
    setSelectedResource,
    selectedTopic,
    setSelectedTopic,
    isContentEntryOpen,
    setIsContentEntryOpen,
    editingResource,
    setEditingResource,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    analyticsConsent,
    setAnalyticsConsent,
    analyticsEvents,
    logEvent,
    isAnalyticsOpen,
    setIsAnalyticsOpen,
    clearAnalytics,
    deleteMyData,
    toastMessage,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};