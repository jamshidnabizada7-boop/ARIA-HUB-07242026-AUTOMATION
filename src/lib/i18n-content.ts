/**
 * Localized Content Utility
 * 
 * Provides functions to retrieve the correct language variant from multilingual content fields.
 */

/**
 * Get localized content from a multilingual field
 * 
 * @param baseValue - The original single-language value (for backward compatibility)
 * @param i18nValue - The i18n JSON object containing translations { en: "...", fa: "...", ps: "..." }
 * @param lang - Target language code ('en', 'fa', 'ps')
 * @returns Localized content string with the following fallback priority:
 *          1. i18n[lang] - Content in requested language
 *          2. i18n.en - English fallback
 *          3. baseValue - Original field value
 *          4. '' - Empty string if nothing available
 * 
 * @example
 * // With full i18n data
 * const title = getLocalizedContent(
 *   'Service Title',
 *   { en: 'Service Title', fa: 'عنوان خدمت', ps: 'د خدمت سرلیک' },
 *   'fa'
 * ); // Returns: 'عنوان خدمت'
 * 
 * @example
 * // With missing language, falls back to English
 * const title = getLocalizedContent(
 *   'Service Title',
 *   { en: 'Service Title' },
 *   'fa'
 * ); // Returns: 'Service Title'
 * 
 * @example
 * // With no i18n data, uses base value
 * const title = getLocalizedContent(
 *   'Service Title',
 *   null,
 *   'fa'
 * ); // Returns: 'Service Title'
 * 
 * @example
 * // Usage in a component
 * import { getLocalizedContent } from '@/lib/i18n-content';
 * import { useLangStore } from '@/store/lang-store';
 * 
 * function ServiceCard({ service }) {
 *   const lang = useLangStore((s) => s.code);
 *   const title = getLocalizedContent(service.title, service.titleI18n, lang);
 *   const description = getLocalizedContent(service.description, service.descriptionI18n, lang);
 *   
 *   return (
 *     <div>
 *       <h3>{title}</h3>
 *       <p>{description}</p>
 *     </div>
 *   );
 * }
 */
export function getLocalizedContent(
  baseValue: string | null | undefined,
  i18nValue: Record<string, string> | null | undefined,
  lang: string
): string {
  // Priority 1: Check if i18n value exists and has the requested language
  if (i18nValue && typeof i18nValue === 'object') {
    // Try requested language
    if (i18nValue[lang]) {
      return i18nValue[lang];
    }
    
    // Fallback to English
    if (i18nValue['en']) {
      return i18nValue['en'];
    }
  }
  
  // Priority 2: Fall back to base value
  if (baseValue) {
    return baseValue;
  }
  
  // Priority 3: Return empty string
  return '';
}

/**
 * Get localized content from a JSON array field with i18n support
 * 
 * Some fields like 'features', 'requirements', 'documents' are stored as JSON arrays
 * with i18n variants. This function handles retrieving the correct language variant.
 * 
 * @param baseValue - The original JSON array as a string or parsed array
 * @param i18nValue - The i18n JSON object containing language-specific arrays
 * @param lang - Target language code
 * @returns Parsed array in the requested language, or empty array if nothing available
 * 
 * @example
 * // With i18n array data
 * const features = getLocalizedArray(
 *   '["Feature 1", "Feature 2"]',
 *   { en: ['Feature 1', 'Feature 2'], fa: ['ویژگی ۱', 'ویژگی ۲'] },
 *   'fa'
 * ); // Returns: ['ویژگی ۱', 'ویژگی ۲']
 */
export function getLocalizedArray(
  baseValue: string | any[] | null | undefined,
  i18nValue: Record<string, any[]> | null | undefined,
  lang: string
): any[] {
  // Priority 1: Check if i18n value exists and has the requested language
  if (i18nValue && typeof i18nValue === 'object') {
    // Try requested language
    if (Array.isArray(i18nValue[lang])) {
      return i18nValue[lang];
    }
    
    // Fallback to English
    if (Array.isArray(i18nValue['en'])) {
      return i18nValue['en'];
    }
  }
  
  // Priority 2: Fall back to base value
  if (baseValue) {
    try {
      // If it's a string, try to parse it as JSON
      if (typeof baseValue === 'string') {
        return JSON.parse(baseValue);
      }
      // If it's already an array, return it
      if (Array.isArray(baseValue)) {
        return baseValue;
      }
    } catch (e) {
      // If parsing fails, return empty array
      return [];
    }
  }
  
  // Priority 3: Return empty array
  return [];
}
