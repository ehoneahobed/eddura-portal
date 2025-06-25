import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, X } from 'lucide-react';

interface CustomMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ options, value, onChange, placeholder, allowCustom }) => {
  const [input, setInput] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const filteredOptions = options.filter(
    (opt) => !value.includes(opt) && (!input || opt.toLowerCase().includes(input.toLowerCase()))
  );

  const addValue = (val: string) => {
    if (val && !value.includes(val)) {
      onChange([...value, val]);
      setInput('');
      setShowOptions(false);
    }
  };

  const removeValue = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input) {
      if (allowCustom || options.includes(input)) {
        addValue(input);
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      setShowOptions(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((val) => (
          <Badge key={val} variant="secondary" className="flex items-center gap-1 px-3 py-1">
            {val}
            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeValue(val)} />
          </Badge>
        ))}
      </div>
      <div className="relative flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowOptions(true);
          }}
          onFocus={() => setShowOptions(true)}
          onBlur={() => setTimeout(() => setShowOptions(false), 100)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder || 'Type or select...'}
          className="h-10"
        />
        <Button
          type="button"
          size="sm"
          className="h-10 px-4"
          onClick={() => {
            if (input && (allowCustom || options.includes(input))) {
              addValue(input);
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        {showOptions && filteredOptions.length > 0 && (
          <div className="absolute left-0 top-12 z-10 w-full bg-white border border-gray-200 rounded shadow-md max-h-40 overflow-auto">
            {filteredOptions.map((opt) => (
              <div
                key={opt}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => addValue(opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMultiSelect; 