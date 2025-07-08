'use client';

import { useState, useRef, useEffect } from 'react';
import { getNames as getCountryNames } from 'country-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, ChevronDown } from 'lucide-react';

interface CountrySelectProps {
  value?: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  description?: string;
  allowSearch?: boolean;
  maxSelection?: number;
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder = 'Select country',
  multiple = false,
  disabled = false,
  required = false,
  className,
  label,
  description,
  allowSearch = true,
  maxSelection
}: CountrySelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all country names
  const allCountries = getCountryNames();
  
  // Filter countries based on search term
  const filteredCountries = allCountries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle single selection
  const handleSingleSelect = (country: string) => {
    onValueChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle multiple selection
  const handleMultipleSelect = (country: string) => {
    const currentValue = Array.isArray(value) ? value : [];
    
    if (currentValue.includes(country)) {
      // Remove if already selected
      onValueChange(currentValue.filter(c => c !== country));
    } else {
      // Add if not selected and under max limit
      if (!maxSelection || currentValue.length < maxSelection) {
        onValueChange([...currentValue, country]);
      }
    }
  };

  // Remove country from multiple selection
  const removeCountry = (country: string) => {
    if (Array.isArray(value)) {
      onValueChange(value.filter(c => c !== country));
    }
  };

  // Clear all selections
  const clearAll = () => {
    onValueChange(multiple ? [] : '');
  };

  // Get display value
  const getDisplayValue = () => {
    if (multiple) {
      const selectedCountries = Array.isArray(value) ? value : [];
      if (selectedCountries.length === 0) return placeholder;
      if (selectedCountries.length === 1) return selectedCountries[0];
      return `${selectedCountries.length} countries selected`;
    }
    return value || placeholder;
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && allowSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, allowSearch]);

  if (!allowSearch && !multiple) {
    // Simple single select without search
    return (
      <div className={className}>
        {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
        {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
        <Select
          value={value as string}
          onValueChange={onValueChange as (value: string) => void}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {allCountries.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Advanced searchable dropdown
  return (
    <div className={className}>
      {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      
      <div className="relative">
        <div 
          className={`
            min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
            ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 
            focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {multiple && Array.isArray(value) && value.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {value.map(country => (
                    <Badge
                      key={country}
                      variant="secondary"
                      className="text-xs"
                    >
                      {country}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCountry(country);
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className={!value || (Array.isArray(value) && value.length === 0) ? 'text-muted-foreground' : ''}>
                  {getDisplayValue()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(value && ((Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value))) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-hidden">
            {allowSearch && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No countries found
                </div>
              ) : (
                filteredCountries.map(country => {
                  const isSelected = multiple 
                    ? Array.isArray(value) && value.includes(country)
                    : value === country;
                  
                  return (
                    <div
                      key={country}
                      className={`
                        px-3 py-2 cursor-pointer hover:bg-accent transition-colors
                        ${isSelected ? 'bg-accent' : ''}
                      `}
                      onClick={() => {
                        if (multiple) {
                          handleMultipleSelect(country);
                        } else {
                          handleSingleSelect(country);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{country}</span>
                        {multiple && isSelected && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}