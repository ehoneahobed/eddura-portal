import { TranslationKeys } from '@/i18n/types';

/**
 * Validates that all translation keys exist in both languages
 */
export function validateTranslations(
  englishTranslations: TranslationKeys,
  frenchTranslations: TranslationKeys
): {
  isValid: boolean;
  missingInFrench: string[];
  missingInEnglish: string[];
  extraInFrench: string[];
  extraInEnglish: string[];
} {
  const missingInFrench: string[] = [];
  const missingInEnglish: string[] = [];
  const extraInFrench: string[] = [];
  const extraInEnglish: string[] = [];

  // Helper function to get all nested keys from an object
  function getNestedKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...getNestedKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
    }
    
    return keys;
  }

  // Helper function to check if a nested key exists
  function hasNestedKey(obj: any, keyPath: string): boolean {
    const keys = keyPath.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return true;
  }

  const englishKeys = getNestedKeys(englishTranslations);
  const frenchKeys = getNestedKeys(frenchTranslations);

  // Check for missing keys in French
  for (const key of englishKeys) {
    if (!hasNestedKey(frenchTranslations, key)) {
      missingInFrench.push(key);
    }
  }

  // Check for missing keys in English
  for (const key of frenchKeys) {
    if (!hasNestedKey(englishTranslations, key)) {
      missingInEnglish.push(key);
    }
  }

  // Check for extra keys
  for (const key of frenchKeys) {
    if (!englishKeys.includes(key)) {
      extraInFrench.push(key);
    }
  }

  for (const key of englishKeys) {
    if (!frenchKeys.includes(key)) {
      extraInEnglish.push(key);
    }
  }

  const isValid = 
    missingInFrench.length === 0 && 
    missingInEnglish.length === 0 && 
    extraInFrench.length === 0 && 
    extraInEnglish.length === 0;

  return {
    isValid,
    missingInFrench,
    missingInEnglish,
    extraInFrench,
    extraInEnglish
  };
}

/**
 * Logs translation validation results to console
 */
export function logTranslationValidation(
  englishTranslations: TranslationKeys,
  frenchTranslations: TranslationKeys
): void {
  const validation = validateTranslations(englishTranslations, frenchTranslations);
  
  if (validation.isValid) {
    console.log('✅ All translations are complete and synchronized!');
    return;
  }

  console.log('❌ Translation validation failed:');
  
  if (validation.missingInFrench.length > 0) {
    console.log('\n🇫🇷 Missing in French:');
    validation.missingInFrench.forEach(key => console.log(`  - ${key}`));
  }
  
  if (validation.missingInEnglish.length > 0) {
    console.log('\n🇺🇸 Missing in English:');
    validation.missingInEnglish.forEach(key => console.log(`  - ${key}`));
  }
  
  if (validation.extraInFrench.length > 0) {
    console.log('\n🇫🇷 Extra in French:');
    validation.extraInFrench.forEach(key => console.log(`  - ${key}`));
  }
  
  if (validation.extraInEnglish.length > 0) {
    console.log('\n🇺🇸 Extra in English:');
    validation.extraInEnglish.forEach(key => console.log(`  - ${key}`));
  }
}

/**
 * Gets translation coverage statistics
 */
export function getTranslationStats(
  englishTranslations: TranslationKeys,
  frenchTranslations: TranslationKeys
): {
  totalKeys: number;
  frenchCoverage: number;
  englishCoverage: number;
  completionPercentage: number;
} {
  function countKeys(obj: any): number {
    let count = 0;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          count += countKeys(obj[key]);
        } else {
          count++;
        }
      }
    }
    
    return count;
  }

  const englishKeyCount = countKeys(englishTranslations);
  const frenchKeyCount = countKeys(frenchTranslations);
  const totalKeys = Math.max(englishKeyCount, frenchKeyCount);
  
  const frenchCoverage = (frenchKeyCount / totalKeys) * 100;
  const englishCoverage = (englishKeyCount / totalKeys) * 100;
  const completionPercentage = Math.min(frenchCoverage, englishCoverage);

  return {
    totalKeys,
    frenchCoverage,
    englishCoverage,
    completionPercentage
  };
}

/**
 * Validates translation quality by checking for common issues
 */
export function validateTranslationQuality(
  englishTranslations: TranslationKeys,
  frenchTranslations: TranslationKeys
): {
  issues: Array<{
    key: string;
    type: 'empty' | 'same_as_english' | 'missing_interpolation' | 'extra_interpolation';
    message: string;
  }>;
} {
  const issues: Array<{
    key: string;
    type: 'empty' | 'same_as_english' | 'missing_interpolation' | 'extra_interpolation';
    message: string;
  }> = [];

  function checkTranslationQuality(
    englishObj: any,
    frenchObj: any,
    keyPath = ''
  ): void {
    for (const key in englishObj) {
      if (englishObj.hasOwnProperty(key)) {
        const currentPath = keyPath ? `${keyPath}.${key}` : key;
        const englishValue = englishObj[key];
        const frenchValue = frenchObj?.[key];

        if (typeof englishValue === 'object' && englishValue !== null) {
          if (typeof frenchValue === 'object' && frenchValue !== null) {
            checkTranslationQuality(englishValue, frenchValue, currentPath);
          }
        } else if (typeof englishValue === 'string') {
          // Check if French translation exists and is not empty
          if (!frenchValue || frenchValue.trim() === '') {
            issues.push({
              key: currentPath,
              type: 'empty',
              message: 'French translation is empty or missing'
            });
          } else if (frenchValue === englishValue) {
            // Check if French translation is the same as English (might be intentional for some keys)
            issues.push({
              key: currentPath,
              type: 'same_as_english',
              message: 'French translation is identical to English'
            });
          }

          // Check for interpolation consistency
          const englishInterpolations: string[] = ((englishValue.match(/\{[^}]+\}/g) || []) as string[]).sort();
          const frenchInterpolations: string[] = ((typeof frenchValue === 'string' ? (frenchValue.match(/\{[^}]+\}/g) || []) : []) as string[]).sort();

          if (englishInterpolations.length !== frenchInterpolations.length) {
            if (englishInterpolations.length > frenchInterpolations.length) {
              issues.push({
                key: currentPath,
                type: 'missing_interpolation',
                message: `Missing interpolations in French: ${englishInterpolations.filter((i: string) => !frenchInterpolations.includes(i)).join(', ')}`
              });
            } else {
              issues.push({
                key: currentPath,
                type: 'extra_interpolation',
                message: `Extra interpolations in French: ${frenchInterpolations.filter((i: string) => !englishInterpolations.includes(i)).join(', ')}`
              });
            }
          }
        }
      }
    }
  }

  checkTranslationQuality(englishTranslations, frenchTranslations);
  return { issues };
}