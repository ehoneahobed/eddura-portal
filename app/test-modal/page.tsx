'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Modal Test Page</h1>
        
        <Button 
          onClick={() => {
            console.log('Opening modal...');
            setIsOpen(true);
          }}
          className="w-full"
        >
          Open Test Modal
        </Button>
        
        <p className="mt-4 text-sm text-gray-600">
          Modal state: {isOpen ? 'Open' : 'Closed'}
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Modal</DialogTitle>
              <DialogDescription>
                This is a test modal to check if the Dialog component is working correctly.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <p className="text-gray-600 mb-4">
                If you can see this content, the modal is working correctly.
              </p>
              
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Close Modal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}