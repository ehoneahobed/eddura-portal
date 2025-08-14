const fs = require('fs');
const path = require('path');

// Read translation files
const englishPath = path.join(__dirname, '../i18n/locales/en.json');
const frenchPath = path.join(__dirname, '../i18n/locales/fr.json');

try {
  const englishTranslations = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
  const frenchTranslations = JSON.parse(fs.readFileSync(frenchPath, 'utf8'));

  // Helper function to get all nested keys from an object
  function getNestedKeys(obj, prefix = '') {
    const keys = [];
    
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
  function hasNestedKey(obj, keyPath) {
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

  const missingInFrench = [];
  const missingInEnglish = [];

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

  // Count total keys
  function countKeys(obj) {
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

  console.log('🌍 Translation Validation Report');
  console.log('================================');
  console.log(`📊 Total translation keys: ${totalKeys}`);
  console.log(`🇺🇸 English keys: ${englishKeyCount}`);
  console.log(`🇫🇷 French keys: ${frenchKeyCount}`);
  console.log(`📈 French coverage: ${((frenchKeyCount / totalKeys) * 100).toFixed(1)}%`);
  console.log(`📈 English coverage: ${((englishKeyCount / totalKeys) * 100).toFixed(1)}%`);

  if (missingInFrench.length === 0 && missingInEnglish.length === 0) {
    console.log('\n✅ All translations are complete and synchronized!');
    console.log('🎉 Ready for production deployment!');
  } else {
    console.log('\n❌ Translation validation failed:');
    
    if (missingInFrench.length > 0) {
      console.log('\n🇫🇷 Missing in French:');
      missingInFrench.forEach(key => console.log(`  - ${key}`));
    }
    
    if (missingInEnglish.length > 0) {
      console.log('\n🇺🇸 Missing in English:');
      missingInEnglish.forEach(key => console.log(`  - ${key}`));
    }
  }

  // Quality checks
  console.log('\n🔍 Quality Checks');
  console.log('==================');

  const qualityIssues = [];

  function checkQuality(englishObj, frenchObj, keyPath = '') {
    for (const key in englishObj) {
      if (englishObj.hasOwnProperty(key)) {
        const currentPath = keyPath ? `${keyPath}.${key}` : key;
        const englishValue = englishObj[key];
        const frenchValue = frenchObj?.[key];

        if (typeof englishValue === 'object' && englishValue !== null) {
          if (typeof frenchValue === 'object' && frenchValue !== null) {
            checkQuality(englishValue, frenchValue, currentPath);
          }
        } else if (typeof englishValue === 'string') {
          // Check for interpolation consistency
          const englishInterpolations = (englishValue.match(/\{[^}]+\}/g) || []).sort();
          const frenchInterpolations = (frenchValue?.match(/\{[^}]+\}/g) || []).sort();

          if (englishInterpolations.length !== frenchInterpolations.length) {
            qualityIssues.push({
              key: currentPath,
              issue: 'Interpolation mismatch',
              english: englishInterpolations,
              french: frenchInterpolations
            });
          }

          // Check if French is identical to English (might be intentional)
          if (frenchValue === englishValue && englishValue.length > 3) {
            qualityIssues.push({
              key: currentPath,
              issue: 'Identical to English',
              value: englishValue
            });
          }
        }
      }
    }
  }

  checkQuality(englishTranslations, frenchTranslations);

  if (qualityIssues.length === 0) {
    console.log('✅ No quality issues found!');
  } else {
    console.log(`⚠️  Found ${qualityIssues.length} potential quality issues:`);
    qualityIssues.forEach(issue => {
      console.log(`  - ${issue.key}: ${issue.issue}`);
      if (issue.english && issue.french) {
        console.log(`    English: [${issue.english.join(', ')}]`);
        console.log(`    French: [${issue.french.join(', ')}]`);
      } else if (issue.value) {
        console.log(`    Value: "${issue.value}"`);
      }
    });
  }

  console.log('\n🎯 Summary');
  console.log('===========');
  if (missingInFrench.length === 0 && missingInEnglish.length === 0 && qualityIssues.length === 0) {
    console.log('🟢 Translations are complete and high quality!');
    process.exit(0);
  } else {
    console.log('🟡 Translations need attention before production deployment.');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error validating translations:', error.message);
  process.exit(1);
}