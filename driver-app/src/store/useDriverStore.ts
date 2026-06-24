import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n from '../i18n';
import { mockJobs } from '../data/mockData';
import { fetchDriverJobs, syncDriverJobStatus } from '../services/api';
import type { AppLanguage, DriverJob, DriverJobStatus } from '../types/models';

const LANGUAGE_STORAGE_KEY = 'cabuk-driver-language';

type DriverState = {
  isAuthenticated: boolean;
  driverName: string;
  driverPhone: string;
  driverCode: string;
  profileImageUrl: string;
  language: AppLanguage;
  isJobsLoading: boolean;
  currentJobId?: string;
  jobs: DriverJob[];
  signIn: (payload: { driverName: string; driverPhone?: string; driverCode?: string; profileImageUrl?: string }) => void;
  signUp: (payload: { driverName: string; driverPhone: string; driverCode: string; profileImageUrl: string }) => void;
  signOut: () => void;
  updateProfile: (payload: { driverName?: string; driverPhone?: string; profileImageUrl?: string }) => void;
  setLanguage: (language: AppLanguage) => Promise<void>;
  hydrateLanguage: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  prependJob: (job: DriverJob) => void;
  setCurrentJob: (jobId: string) => void;
  updateJobStatus: (jobId: string, status: DriverJobStatus) => Promise<void>;
};

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      driverName: 'Cabuk Driver',
      driverPhone: '',
      driverCode: '',
      profileImageUrl:
        'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20courier%20driver%20profile%20portrait%2C%20clean%20background%2C%20mobile%20app%20avatar%2C%20realistic&image_size=square',
      language: 'sq',
      isJobsLoading: false,
      currentJobId: mockJobs[0]?.id,
      jobs: mockJobs,
      signIn: ({ driverName, driverPhone = '', driverCode = '', profileImageUrl }) =>
        set({
          isAuthenticated: true,
          driverName: driverName.trim() || 'Cabuk Driver',
          driverPhone,
          driverCode,
          profileImageUrl:
            profileImageUrl && profileImageUrl.trim().length > 0
              ? profileImageUrl.trim()
              : get().profileImageUrl
        }),
      signUp: ({ driverName, driverPhone, driverCode, profileImageUrl }) =>
        set({
          isAuthenticated: true,
          driverName: driverName.trim() || 'Cabuk Driver',
          driverPhone: driverPhone.trim(),
          driverCode: driverCode.trim(),
          profileImageUrl: profileImageUrl.trim()
        }),
      signOut: () =>
        set({
          isAuthenticated: false,
          driverName: 'Cabuk Driver',
          driverPhone: '',
          driverCode: ''
        }),
      updateProfile: ({ driverName, driverPhone, profileImageUrl }) =>
        set((state) => ({
          driverName: driverName?.trim() || state.driverName,
          driverPhone: driverPhone?.trim() || state.driverPhone,
          profileImageUrl: profileImageUrl?.trim() || state.profileImageUrl
        })),
      setLanguage: async (language) => {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        await i18n.changeLanguage(language);
        set({ language });
      },
      hydrateLanguage: async () => {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        const language =
          storedLanguage === 'en' || storedLanguage === 'sq' || storedLanguage === 'sr'
            ? storedLanguage
            : 'sq';
        await i18n.changeLanguage(language);
        set({ language });
      },
      refreshJobs: async () => {
        set({ isJobsLoading: true });

        try {
          const jobs = await fetchDriverJobs();
          const currentJobId = get().currentJobId;
          const nextCurrentJobId = jobs.some((job) => job.id === currentJobId)
            ? currentJobId
            : jobs[0]?.id;

          set({
            jobs,
            currentJobId: nextCurrentJobId,
            isJobsLoading: false
          });
        } catch {
          set({ isJobsLoading: false });
        }
      },
      prependJob: (job) =>
        set((state) => {
          const existing = state.jobs.find((entry) => entry.id === job.id);
          if (existing) {
            return {
              jobs: state.jobs.map((entry) => (entry.id === job.id ? job : entry)),
              currentJobId: state.currentJobId ?? job.id
            };
          }

          return {
            jobs: [job, ...state.jobs],
            currentJobId: state.currentJobId ?? job.id
          };
        }),
      setCurrentJob: (jobId) => set({ currentJobId: jobId }),
      updateJobStatus: async (jobId, status) => {
        const previousJobs = get().jobs;

        set((state) => ({
          jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, status } : job))
        }));

        try {
          await syncDriverJobStatus(jobId, status);
        } catch {
          set({ jobs: previousJobs });
        }
      }
    }),
    {
      name: 'cabuk-driver-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        driverName: state.driverName,
        driverPhone: state.driverPhone,
        driverCode: state.driverCode,
        profileImageUrl: state.profileImageUrl
      })
    }
  )
);
