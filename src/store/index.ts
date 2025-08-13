import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, DocType, Document } from '../types/frappe';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

interface MetadataState {
  doctypes: Map<string, DocType>;
  loadDocType: (doctype: string) => Promise<DocType>;
  getDocType: (doctype: string) => DocType | undefined;
}

interface DocumentState {
  documents: Map<string, Document>;
  currentDoc: Document | null;
  isLoading: boolean;
  loadDocument: (doctype: string, name: string) => Promise<Document>;
  saveDocument: (doc: Partial<Document>) => Promise<Document>;
  deleteDocument: (doctype: string, name: string) => Promise<void>;
  setCurrentDoc: (doc: Document | null) => void;
  clearCache: () => void;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  currentModule: string;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setCurrentModule: (module: string) => void;
}

interface ListState {
  lists: Map<string, Document[]>;
  filters: Map<string, Record<string, any>>;
  pagination: Map<string, { page: number; totalPages: number; pageSize: number }>;
  loadList: (doctype: string, options?: any) => Promise<Document[]>;
  setFilters: (doctype: string, filters: Record<string, any>) => void;
  clearList: (doctype: string) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        
        login: async (username: string, password: string) => {
          set({ isLoading: true });
          try {
            const { frappeAPI } = await import('../lib/api');
            const user = await frappeAPI.login(username, password);
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          try {
            const { frappeAPI } = await import('../lib/api');
            await frappeAPI.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({ user: null, isAuthenticated: false });
          }
        },

        setUser: (user) => set({ user, isAuthenticated: !!user }),
      }),
      {
        name: 'frappe-auth',
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
);

// Metadata Store
export const useMetadataStore = create<MetadataState>()(
  devtools(
    (set, get) => ({
      doctypes: new Map(),

      loadDocType: async (doctype: string) => {
        const existing = get().doctypes.get(doctype);
        if (existing) return existing;

        const { frappeAPI } = await import('../lib/api');
        const doctypeData = await frappeAPI.getDocType(doctype);
        
        set(state => ({
          doctypes: new Map(state.doctypes.set(doctype, doctypeData))
        }));
        
        return doctypeData;
      },

      getDocType: (doctype: string) => get().doctypes.get(doctype),
    })
  )
);

// Document Store
export const useDocumentStore = create<DocumentState>()(
  devtools(
    (set, get) => ({
      documents: new Map(),
      currentDoc: null,
      isLoading: false,

      loadDocument: async (doctype: string, name: string) => {
        const key = `${doctype}:${name}`;
        const existing = get().documents.get(key);
        if (existing) {
          set({ currentDoc: existing });
          return existing;
        }

        set({ isLoading: true });
        try {
          const { frappeAPI } = await import('../lib/api');
          const doc = await frappeAPI.getDoc(doctype, name);
          
          set(state => ({
            documents: new Map(state.documents.set(key, doc)),
            currentDoc: doc,
            isLoading: false,
          }));
          
          return doc;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      saveDocument: async (doc: Partial<Document>) => {
        const { frappeAPI } = await import('../lib/api');
        const savedDoc = await frappeAPI.saveDoc(doc);
        
        const key = `${savedDoc.doctype}:${savedDoc.name}`;
        set(state => ({
          documents: new Map(state.documents.set(key, savedDoc)),
          currentDoc: savedDoc,
        }));
        
        return savedDoc;
      },

      deleteDocument: async (doctype: string, name: string) => {
        const { frappeAPI } = await import('../lib/api');
        await frappeAPI.deleteDoc(doctype, name);
        
        const key = `${doctype}:${name}`;
        set(state => {
          const newDocuments = new Map(state.documents);
          newDocuments.delete(key);
          return { 
            documents: newDocuments,
            currentDoc: state.currentDoc?.name === name ? null : state.currentDoc
          };
        });
      },

      setCurrentDoc: (doc) => set({ currentDoc: doc }),
      clearCache: () => set({ documents: new Map() }),
    })
  )
);

// UI Store
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        sidebarCollapsed: false,
        currentModule: 'Setup',

        toggleTheme: () => set(state => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        
        toggleSidebar: () => set(state => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        })),
        
        setCurrentModule: (module) => set({ currentModule: module }),
      }),
      {
        name: 'frappe-ui',
      }
    )
  )
);

// List Store
export const useListStore = create<ListState>()(
  devtools(
    (set, get) => ({
      lists: new Map(),
      filters: new Map(),
      pagination: new Map(),

      loadList: async (doctype: string, options = {}) => {
        const { frappeAPI } = await import('../lib/api');
        const documents = await frappeAPI.getList(doctype, options);
        
        set(state => ({
          lists: new Map(state.lists.set(doctype, documents))
        }));
        
        return documents;
      },

      setFilters: (doctype: string, filters: Record<string, any>) => {
        set(state => ({
          filters: new Map(state.filters.set(doctype, filters))
        }));
      },

      clearList: (doctype: string) => {
        set(state => {
          const newLists = new Map(state.lists);
          const newFilters = new Map(state.filters);
          const newPagination = new Map(state.pagination);
          
          newLists.delete(doctype);
          newFilters.delete(doctype);
          newPagination.delete(doctype);
          
          return {
            lists: newLists,
            filters: newFilters, 
            pagination: newPagination
          };
        });
      },
    })
  )
);