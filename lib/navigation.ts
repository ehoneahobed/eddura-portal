import { useCommonTranslation } from '@/hooks/useTranslation';

export interface NavItem {
  labelKey: string;
  href: string;
  children?: NavItem[];
}

export interface TranslatedNavItem {
  label: string;
  href: string;
  children?: TranslatedNavItem[];
}

// Base navigation configuration using translation keys
export const navigationConfig: NavItem[] = [
  { labelKey: 'navigation.home', href: '/' },
  { labelKey: 'navigation.dashboard', href: '/dashboard' },
  { labelKey: 'navigation.library', href: '/library' },
  { labelKey: 'navigation.documents', href: '/documents' },
  { labelKey: 'navigation.recommendations', href: '/recommendations' },
  { labelKey: 'navigation.applications', href: '/applications' }
];

// Demo navigation configuration
export const demoNavigationConfig: NavItem[] = [
  { labelKey: 'navigation.home', href: '/' },
  { labelKey: 'navigation.features', href: '/features' },
  { 
    labelKey: 'navigation.products', 
    href: '/products',
    children: [
      { labelKey: 'navigation.platform', href: '/products/platform' },
      { labelKey: 'navigation.api', href: '/products/api' },
      { labelKey: 'navigation.analytics', href: '/products/analytics' }
    ]
  },
  { labelKey: 'navigation.pricing', href: '/pricing' },
  { labelKey: 'navigation.contact', href: '/contact' }
];

// User portal navigation configuration
export const userPortalNavigationConfig: NavItem[] = [
  { labelKey: 'navigation.dashboard', href: '/dashboard' },
  { labelKey: 'navigation.library', href: '/library' },
  { labelKey: 'navigation.documents', href: '/documents' },
  { labelKey: 'navigation.recommendations', href: '/recommendations' },
  { labelKey: 'navigation.applications', href: '/applications' }
];

// Hook to translate navigation items
export function useTranslatedNavigation(config: NavItem[]): TranslatedNavItem[] {
  const { t } = useCommonTranslation();

  const translateNavItem = (item: NavItem): TranslatedNavItem => ({
    label: t(item.labelKey),
    href: item.href,
    children: item.children?.map(translateNavItem)
  });

  return config.map(translateNavItem);
}

// Hook for common navigation patterns
export function useMainNavigation() {
  return useTranslatedNavigation(navigationConfig);
}

export function useDemoNavigation() {
  return useTranslatedNavigation(demoNavigationConfig);
}

export function useUserPortalNavigation() {
  return useTranslatedNavigation(userPortalNavigationConfig);
}