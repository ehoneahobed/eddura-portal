'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import AddRecipientModal from './AddRecipientModal';

interface Recipient {
  _id: string;
  name: string;
  emails: string[];
  primaryEmail: string;
  title: string;
  institution: string;
  department?: string;
  prefersDrafts: boolean;
}

interface SearchableRecipientSelectProps {
  recipients: Recipient[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  onRecipientAdded?: (recipient: Recipient) => void;
}

export default function SearchableRecipientSelect({
  recipients,
  value,
  onValueChange,
  placeholder = "Select a recipient...",
  onRecipientAdded
}: SearchableRecipientSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRecipient = recipients.find(r => r._id === value);

  const filteredRecipients = useMemo(() => {
    if (!searchQuery) return recipients;
    
    const query = searchQuery.toLowerCase();
    return recipients.filter(recipient => 
      recipient.name.toLowerCase().includes(query) ||
      recipient.emails.some(email => email.toLowerCase().includes(query)) ||
      recipient.institution.toLowerCase().includes(query) ||
      recipient.title.toLowerCase().includes(query) ||
      (recipient.department && recipient.department.toLowerCase().includes(query))
    );
  }, [recipients, searchQuery]);

  const handleRecipientAdded = (recipient: Recipient) => {
    if (onRecipientAdded) {
      onRecipientAdded(recipient);
    }
    // Auto-select the newly added recipient
    onValueChange(recipient._id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedRecipient ? (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">{selectedRecipient.name}</span>
              <span className="text-sm text-gray-500">
                {selectedRecipient.title} • {selectedRecipient.institution}
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search recipients..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">No recipients found</p>
                {onRecipientAdded && (
                  <AddRecipientModal
                    onRecipientAdded={handleRecipientAdded}
                    trigger={
                      <Button size="sm" variant="outline">
                        Add New Recipient
                      </Button>
                    }
                  />
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredRecipients.map((recipient) => (
                <CommandItem
                  key={recipient._id}
                  value={recipient._id}
                  onSelect={() => {
                    onValueChange(recipient._id);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{recipient.name}</span>
                      {recipient.prefersDrafts && (
                        <Badge variant="secondary" className="text-xs">
                          Drafts
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {recipient.title} • {recipient.institution}
                    </span>
                    <span className="text-xs text-gray-400">
                      {recipient.primaryEmail}
                    </span>
                    {recipient.department && (
                      <span className="text-xs text-gray-400">
                        {recipient.department}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === recipient._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {onRecipientAdded && recipients.length > 0 && (
              <div className="border-t p-2">
                <AddRecipientModal
                  onRecipientAdded={handleRecipientAdded}
                  trigger={
                    <Button size="sm" variant="outline" className="w-full">
                      Add New Recipient
                    </Button>
                  }
                />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 