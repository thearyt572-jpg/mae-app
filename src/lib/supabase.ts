import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create mock Supabase client for environments without configured backend
const createMockClient = () => {
  const MOCK_PROFILES_KEY = 'mae_mock_user_profiles';
  const authListeners: Set<(event: string, session: any) => void> = new Set();

  const getStoredProfiles = (): Record<string, any> => {
    try {
      return JSON.parse(localStorage.getItem(MOCK_PROFILES_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const notifyAuthChange = (event: string, session: any) => {
    authListeners.forEach((listener) => {
      try {
        listener(event, session);
      } catch (e) {
        console.warn('Auth listener error:', e);
      }
    });
  };

  return {
    auth: {
      getSession: async () => {
        try {
          const userStr = localStorage.getItem('mae_user_session');
          if (userStr) {
            const user = JSON.parse(userStr);
            return { data: { session: { user, access_token: 'mock-token' } }, error: null };
          }
        } catch {}
        return { data: { session: null }, error: null };
      },
      getUser: async () => {
        try {
          const userStr = localStorage.getItem('mae_user_session');
          if (userStr) {
            const user = JSON.parse(userStr);
            return { data: { user }, error: null };
          }
        } catch {}
        return { data: { user: null }, error: null };
      },
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        authListeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      signInAnonymously: async () => {
        const id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        const user = { id, email: '', is_anonymous: true };
        const session = { user, access_token: 'mock-token' };
        notifyAuthChange('SIGNED_IN', session);
        return { data: { user, session }, error: null };
      },
      signOut: async () => {
        notifyAuthChange('SIGNED_OUT', null);
        return { error: null };
      },
    },
    from: (table: string) => {
      let filterCol: string | null = null;
      let filterVal: any = null;
      let lastInsertedRows: any[] = [];

      const chain: any = {
        select: (_cols?: string) => chain,
        eq: (col: string, val: any) => {
          filterCol = col;
          filterVal = val;
          return chain;
        },
        neq: () => chain,
        order: () => chain,
        limit: () => chain,
        range: () => chain,
        match: () => chain,
        filter: () => chain,
        maybeSingle: async () => {
          if (table === 'users' && filterCol === 'id') {
            const profiles = getStoredProfiles();
            return { data: profiles[filterVal] || null, error: null };
          }
          if (table === 'entitlements' && filterCol === 'user_id') {
            const profiles = getStoredProfiles();
            const prof = profiles[filterVal];
            return { data: prof ? { is_premium: !!prof.is_premium } : null, error: null };
          }
          return { data: null, error: null };
        },
        single: async () => {
          if (table === 'users' && filterCol === 'id') {
            const profiles = getStoredProfiles();
            return { data: profiles[filterVal] || null, error: null };
          }
          return { data: null, error: null };
        },
        insert: (row: any) => {
          const rows = Array.isArray(row) ? row : [row];
          lastInsertedRows = rows.map((r) => ({
            ...r,
            id: r.id || 'mock_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
            created_at: r.created_at || new Date().toISOString(),
          }));
          return chain;
        },
        update: (_updates: any) => chain,
        delete: () => chain,
        upsert: async (row: any) => {
          if (table === 'users' && row?.id) {
            const profiles = getStoredProfiles();
            profiles[row.id] = { ...profiles[row.id], ...row };
            try {
              localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));
            } catch {}
          }
          return { error: null, data: null };
        },
        then: (onfulfilled?: (value: { data: any[] | null; error: null }) => any) => {
          const result = lastInsertedRows.length > 0 ? lastInsertedRows : null;
          return Promise.resolve({ data: result, error: null }).then(onfulfilled);
        },
      };

      return chain;
    },
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `${(supabaseUrl || 'https://supabase.co').replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${path}`,
          },
        }),
      }),
    },
  };
};

let client: any;
if (supabaseUrl && supabaseAnonKey && typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http')) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[AI Studio] Could not initialize Supabase client, using in-memory mock:', err);
    client = createMockClient();
  }
} else {
  client = createMockClient();
}

export const supabase: SupabaseClient = client as unknown as SupabaseClient;

/**
 * Resolves an audio file path or URL to a valid Supabase Storage public URL.
 * Handles paths like "Psi_audio/1.mp3" or already-formed HTTP URLs.
 */
export function getStorageAudioUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('blob:')) {
    return pathOrUrl;
  }

  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl.slice(1) : pathOrUrl;

  // Extract bucket and object key
  let bucket = 'Psi_audio';
  let objectKey = cleanPath;

  if (cleanPath.startsWith('Psi_audio/')) {
    bucket = 'Psi_audio';
    objectKey = cleanPath.replace(/^Psi_audio\//, '');
  }

  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectKey);
    if (data?.publicUrl) return data.publicUrl;
  } catch {}

  const base = (supabaseUrl || 'https://supabase.co').replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${objectKey}`;
}
