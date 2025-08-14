# Internationalization Design Document

## Overview

This design implements internationalization (i18n) for the Eddura platform using Next.js App Router with support for English (default) and French languages. The solution uses `next-intl` library for robust i18n support while maintaining existing URL structures and ensuring optimal performance.

## Architecture

### Core Components

1. **Translation System**: `next-intl` library for translation management
2. **Language Detection**: Browser language detection with manual override
3. **Translation Files**: JSON-based translation files organized by feature
4. **Language Provider**: React context for language state management
5. **Language Selector**: UI component for manual language switching
6. **Middleware**: Next.js middleware for language handling without URL changes

### Technology Stack

- **next-intl**: Primary i18n library for Next.js App Router
- **React Context**: Language preference state management
- **Local Storage**: Persistent language preference storage
- **JSON Files**: Translation file format
- **TypeScript**: Type-safe translation keys

## Components and Interfaces

### 1. Translation Provider

```typescript
interface I18nProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, values?: Record<string, any>) => string;
}
```

### 2. Language Selector Component

```typescript
interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'toggle';
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}
```

### 3. Translation Hook

```typescript
interface UseTranslationReturn {
  t: (key: string, values?: Record<string, any>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  isLoading: boolean;
}
```

### 4. Middleware Configuration

```typescript
interface I18nConfig {
  locales: string[];
  defaultLocale: string;
  localeDetection: boolean;
}
```

## Data Models

### Translation File Structure

```json
{
  "common": {
    "navigation": {
      "home": "Home",
      "dashboard": "Dashboard",
      "library": "Library",
      "documents": "Documents",
      "recommendations": "Recommendations"
    },
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create"
    },
    "status": {
      "loading": "Loading...",
      "error": "An error occurred",
      "success": "Success"
    }
  },
  "pages": {
    "dashboard": {
      "title": "Dashboard",
      "welcome": "Welcome back, {name}",
      "stats": {
        "documents": "Documents",
        "applications": "Applications",
        "recommendations": "Recommendations"
      }
    }
  },
  "forms": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email",
      "minLength": "Minimum {min} characters required"
    }
  }
}
```

### Language Configuration

```typescript
export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  }
];

export const defaultLocale = 'en';
export const locales = ['en', 'fr'];
```

## Implementation Strategy

### Phase 1: Core Infrastructure

1. **Install and Configure next-intl**
   - Add next-intl dependency
   - Configure Next.js middleware
   - Set up translation file structure

2. **Create Translation Provider**
   - Implement React context for language state
   - Add browser language detection
   - Implement local storage persistence

3. **Set up Translation Files**
   - Create base English translations
   - Organize by feature/page structure
   - Implement type-safe translation keys

### Phase 2: UI Components

1. **Language Selector Component**
   - Dropdown variant for desktop
   - Toggle variant for mobile
   - Accessibility compliance
   - Smooth transitions

2. **Translation Hook**
   - Custom hook for component translations
   - Loading states
   - Error handling

### Phase 3: Content Migration

1. **Systematic Text Replacement**
   - Replace hardcoded strings with translation keys
   - Start with navigation and common elements
   - Progress through pages systematically

2. **French Translations**
   - Professional translation of all content
   - Cultural adaptation for francophone users
   - Review and validation process

### Phase 4: Localization Features

1. **Date and Number Formatting**
   - Implement locale-aware formatting
   - Currency display
   - Time zone handling

2. **Performance Optimization**
   - Translation file splitting
   - Lazy loading of translations
   - Caching strategies

## File Structure

```
├── i18n/
│   ├── config.ts                 # i18n configuration
│   ├── middleware.ts             # Next.js middleware
│   └── locales/
│       ├── en/
│       │   ├── common.json       # Common translations
│       │   ├── navigation.json   # Navigation items
│       │   ├── forms.json        # Form labels and validation
│       │   ├── dashboard.json    # Dashboard specific
│       │   ├── documents.json    # Documents page
│       │   ├── library.json      # Library page
│       │   └── recommendations.json
│       └── fr/
│           ├── common.json
│           ├── navigation.json
│           ├── forms.json
│           ├── dashboard.json
│           ├── documents.json
│           ├── library.json
│           └── recommendations.json
├── components/
│   ├── i18n/
│   │   ├── LanguageSelector.tsx
│   │   ├── I18nProvider.tsx
│   │   └── TranslationProvider.tsx
│   └── providers/
│       └── I18nProvider.tsx
├── hooks/
│   └── useTranslation.ts
└── lib/
    ├── i18n.ts
    └── translations.ts
```

## Error Handling

### Translation Missing

```typescript
const fallbackTranslation = (key: string, locale: string) => {
  console.warn(`Translation missing: ${key} for locale: ${locale}`);
  return key; // Return key as fallback
};
```

### Language Loading Errors

```typescript
const handleLanguageError = (error: Error, locale: string) => {
  console.error(`Failed to load language: ${locale}`, error);
  // Fallback to default locale
  return loadDefaultLocale();
};
```

### Browser Compatibility

- Graceful degradation for older browsers
- Polyfills for Intl API if needed
- Fallback to English for unsupported scenarios

## Testing Strategy

### Unit Tests

1. **Translation Hook Tests**
   - Test translation key resolution
   - Test fallback behavior
   - Test locale switching

2. **Component Tests**
   - Language selector functionality
   - Translation provider behavior
   - Context state management

### Integration Tests

1. **Page Translation Tests**
   - Verify all text is translated
   - Test language switching across pages
   - Validate translation key coverage

2. **User Flow Tests**
   - Language preference persistence
   - Browser language detection
   - Cross-page navigation with language

### E2E Tests

1. **Language Switching Scenarios**
   - Manual language selection
   - Preference persistence
   - URL structure preservation

2. **Accessibility Tests**
   - Screen reader compatibility
   - Keyboard navigation
   - Language announcement

## Performance Considerations

### Bundle Optimization

- Split translation files by route
- Lazy load non-critical translations
- Tree-shake unused translations

### Caching Strategy

- Browser cache for translation files
- Service worker for offline support
- CDN distribution for translation assets

### Loading Performance

- Preload critical translations
- Progressive enhancement approach
- Minimize layout shift during language changes

## Security Considerations

### XSS Prevention

- Sanitize dynamic translation values
- Escape HTML in translations
- Validate translation file integrity

### Content Security Policy

- Update CSP for translation assets
- Secure translation file delivery
- Prevent injection through translations

## Accessibility Compliance

### WCAG Guidelines

- Proper language attributes on HTML elements
- Screen reader announcements for language changes
- Keyboard navigation for language selector
- High contrast support for language indicators

### Semantic HTML

- Use appropriate lang attributes
- Maintain heading hierarchy across languages
- Preserve semantic structure in translations

## Browser Support

### Modern Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallback Support

- Graceful degradation for older browsers
- Polyfills for Intl API
- Basic functionality without JavaScript

## Deployment Considerations

### Build Process

- Translation validation during build
- Missing translation detection
- Automated translation file generation

### Environment Configuration

- Locale-specific environment variables
- Translation file versioning
- CDN configuration for assets

### Monitoring

- Translation usage analytics
- Error tracking for missing translations
- Performance monitoring for language switching