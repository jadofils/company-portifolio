// Input validation utilities
export const validateHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

export const sanitizeColor = (color: string): string => {
  if (!validateHexColor(color)) {
    return '#000000' // Default fallback
  }
  return color
}

export const sanitizeFontFamily = (fontFamily: string): string => {
  // Only allow alphanumeric, spaces, commas, and hyphens
  return fontFamily.replace(/[^a-zA-Z0-9\s,\-]/g, '')
}

export const validateThemeSettings = (settings: any) => {
  return {
    ...settings,
    primary_color: sanitizeColor(settings.primary_color || '#2563eb'),
    secondary_color: sanitizeColor(settings.secondary_color || '#64748b'),
    accent_color: sanitizeColor(settings.accent_color || '#059669'),
    background_color: sanitizeColor(settings.background_color || '#ffffff'),
    text_color: sanitizeColor(settings.text_color || '#1f2937'),
    font_family: sanitizeFontFamily(settings.font_family || 'Inter, sans-serif')
  }
}