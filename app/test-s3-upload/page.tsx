'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TestS3UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      addLog(`File selected: ${file.name} (${file.size} bytes, ${file.type})`);
    }
  };

  const testUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    addLog('Starting upload test...');

    try {
      // Step 1: Get presigned URL
      addLog('Step 1: Getting presigned URL...');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/test-s3-upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        addLog(`❌ Failed to get presigned URL: ${error}`);
        toast.error('Failed to get upload URL');
        return;
      }

      const uploadData = await uploadResponse.json();
      addLog(`✅ Presigned URL received: ${uploadData.presignedUrl.substring(0, 100)}...`);

      // Step 2: Test different upload approaches
      addLog('Step 2: Testing upload approaches...');

      const approaches = [
        {
          name: 'Direct File',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type }
        },
        {
          name: 'File as Blob',
          body: new Blob([selectedFile], { type: selectedFile.type }),
          headers: { 'Content-Type': selectedFile.type }
        },
        {
          name: 'ArrayBuffer',
          body: await selectedFile.arrayBuffer(),
          headers: { 'Content-Type': selectedFile.type }
        },
        {
          name: 'No Headers',
          body: await selectedFile.arrayBuffer(),
          headers: undefined
        }
      ];

      for (const approach of approaches) {
        try {
          addLog(`Testing approach: ${approach.name}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(uploadData.presignedUrl, {
            method: 'PUT',
            body: approach.body,
            headers: approach.headers,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            addLog(`✅ ${approach.name} successful: ${response.status}`);
            toast.success(`${approach.name} upload successful!`);
            return; // Stop after first successful approach
          } else {
            const errorText = await response.text();
            addLog(`❌ ${approach.name} failed: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addLog(`❌ ${approach.name} error: ${errorMessage}`);
          
          if (error instanceof Error && error.name === 'AbortError') {
            addLog('Request timed out');
          }
        }
      }

      toast.error('All upload approaches failed');
      addLog('❌ All upload approaches failed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Upload test failed: ${errorMessage}`);
      toast.error(`Upload test failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const testNetworkConnectivity = async () => {
    addLog('Testing network connectivity...');
    
    const testUrls = [
      'https://www.google.com',
      'https://eddura-documents.s3.eu-west-2.amazonaws.com',
      'https://s3.eu-west-2.amazonaws.com'
    ];
    
    for (const url of testUrls) {
      try {
        const start = Date.now();
        const response = await fetch(url, { method: 'HEAD' });
        const duration = Date.now() - start;
        
        addLog(`✅ ${url}: ${response.status} (${duration}ms)`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ ${url}: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">S3 Upload Debug Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Test 1: File Upload</h3>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={testUpload}
              disabled={!selectedFile || uploading}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Testing...' : 'Test Upload'}
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Test 2: Network Connectivity</h3>
            <button
              onClick={testNetworkConnectivity}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Network
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Debug Log</h3>
          <div className="bg-gray-100 p-3 rounded h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 