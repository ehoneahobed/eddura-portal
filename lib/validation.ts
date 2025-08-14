import { z } from 'zod';

// Create a function that returns localized Zod schemas
export function createLocalizedValidation(t: (key: string, values?: Record<string, string | number>) => string) {
  return {
    // String validations
    required: (field?: string) => z.string().min(1, t('validation.required', { field })),
    email: () => z.string().email(t('validation.email')),
    minLength: (min: number, field?: string) => z.string().min(min, t('validation.minLength', { min, field })),
    maxLength: (max: number, field?: string) => z.string().max(max, t('validation.maxLength', { max, field })),
    
    // Password validations
    password: () => z.string()
      .min(8, t('validation.passwordMinLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation.passwordComplexity')),
    
    confirmPassword: () => z.string().min(1, t('validation.confirmPassword')),
    
    // Number validations
    number: () => z.number({ invalid_type_error: t('validation.invalidNumber') }),
    positiveNumber: () => z.number().positive(t('validation.positiveNumber')),
    
    // Date validations
    date: () => z.date({ invalid_type_error: t('validation.invalidDate') }),
    
    // Custom validations
    phoneNumber: () => z.string().regex(/^\+?[\d\s\-\(\)]+$/, t('validation.invalidPhoneNumber')),
    url: () => z.string().url(t('validation.invalidUrl')),
    
    // Array validations
    nonEmptyArray: (field?: string) => z.array(z.any()).min(1, t('validation.selectAtLeastOne', { field })),
    
    // Object validations
    passwordMatch: (passwordField: string = 'password') => z.object({
      password: z.string(),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword']
    })
  };
}

// Common validation messages for forms
export function getValidationMessage(
  t: (key: string, values?: Record<string, string | number>) => string,
  type: string,
  options?: { min?: number; max?: number; field?: string }
): string {
  switch (type) {
    case 'required':
      return t('validation.required', { field: options?.field });
    case 'email':
      return t('validation.email');
    case 'minLength':
      return t('validation.minLength', { min: options?.min, field: options?.field });
    case 'maxLength':
      return t('validation.maxLength', { max: options?.max, field: options?.field });
    case 'minWords':
      return t('validation.minWords', { min: options?.min });
    case 'maxWords':
      return t('validation.maxWords', { max: options?.max });
    case 'passwordMismatch':
      return t('validation.passwordMismatch');
    case 'invalidFormat':
      return t('validation.invalidFormat');
    case 'invalidDate':
      return t('validation.invalidDate');
    case 'invalidNumber':
      return t('validation.invalidNumber');
    default:
      return t('validation.invalidFormat');
  }
}