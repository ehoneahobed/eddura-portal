'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestFormPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Submitting form...');
      
      const response = await fetch('/api/application-templates/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Updated Template',
          description: 'This is a test update'
        }),
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        setResult('Success! Template updated.');
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Form Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="test-input">Test Input</Label>
              <Input id="test-input" placeholder="Enter test value" />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Test'}
            </Button>
          </form>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">Result:</h3>
              <pre className="mt-2 text-sm">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}