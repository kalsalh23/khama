import { create } from "zustand"
import type { ScarfDesignConfig, NameLanguage, NamePosition, LogoConfig } from "@/lib/types"
import { defaultDesignConfig } from "@/lib/types"

interface DesignerState {
  config: ScarfDesignConfig
  fontsLoaded: boolean
  setConfig: (config: ScarfDesignConfig) => void
  update: (patch: Partial<ScarfDesignConfig>) => void
  setColor: (color: string, colorName?: string) => void
  setName: (name: string) => void
  setLanguage: (lang: NameLanguage) => void
  setFont: (font: string) => void
  setThread: (threadColor: string, threadName?: string) => void
  setPosition: (position: NamePosition) => void
  setYear: (year: string) => void
  setCustomText: (text: string) => void
  setLogo: (logo: LogoConfig | undefined) => void
  updateLogo: (patch: Partial<LogoConfig>) => void
  reset: () => void
}

export const useDesignerStore = create<DesignerState>((set) => ({
  config: { ...defaultDesignConfig, ...{ productId: undefined } },
  fontsLoaded: false,

  setConfig: (config) => set({ config }),

  update: (patch) =>
    set((state) => ({ config: { ...state.config, ...patch } })),

  setColor: (color, colorName) =>
    set((state) => ({ config: { ...state.config, color, colorName: colorName ?? state.config.colorName } })),

  setName: (name) => set((state) => ({ config: { ...state.config, name } })),

  setLanguage: (nameLanguage) => set((state) => ({ config: { ...state.config, nameLanguage } })),

  setFont: (font) => set((state) => ({ config: { ...state.config, font } })),

  setThread: (threadColor, threadName) =>
    set((state) => ({ config: { ...state.config, threadColor, threadName: threadName ?? state.config.threadName } })),

  setPosition: (namePosition) => set((state) => ({ config: { ...state.config, namePosition } })),

  setYear: (graduationYear) => set((state) => ({ config: { ...state.config, graduationYear } })),

  setCustomText: (customText) =>
    set((state) => ({ config: { ...state.config, customText } })),

  setLogo: (logo) => set((state) => ({ config: { ...state.config, logo } })),

  updateLogo: (patch) =>
    set((state) => ({
      config: {
        ...state.config,
        logo: { ...(state.config.logo ?? { x: 50, y: 15, scale: 1, rotation: 0, opacity: 1 }), ...patch },
      },
    })),

  reset: () => set({ config: { ...defaultDesignConfig, ...{ productId: undefined } } }),
}))
