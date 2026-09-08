export const SETTINGS_SCHEMA_VERSION = 2

export type TextSize = 'normal' | 'gross' | 'sehr-gross'

export interface AppSettings {
  schemaVersion: number
  textSize: TextSize
  highContrast: boolean
  reducedMotion: boolean
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  soundEnabled: true
}
