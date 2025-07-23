'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DemoMarkdownEditorPage() {
  const [content1, setContent1] = useState('# Welcome to the Markdown Editor Demo\n\nThis is a **bold** text and this is *italic* text.\n\n## Features\n- Live preview\n- Word count\n- Character count\n- Fullscreen mode\n- Markdown formatting\n\n```javascript\nconsole.log(&quot;Hello, World!&quot;);\n```');
  
  const [content2, setContent2] = useState('Write your essay here...\n\nYou can use:\n- **Bold text**\n- *Italic text*\n- `Code snippets`\n- [Links](https://example.com)\n- And much more!');
  
  const [content3, setContent3] = useState('');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Markdown Editor Demo</h1>
        <p className="text-lg text-gray-600 mb-8">
          Experience the new markdown editor with live preview, word count, and rich formatting capabilities.
        </p>
      </div>

      {/* Demo 1: Full-featured editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📝</span>
            Full-Featured Editor
            <Badge variant="secondary">Demo</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete markdown editor with all features enabled: word count, character count, fullscreen mode, and live preview.
          </p>
        </CardHeader>
        <CardContent>
          <MarkdownEditor
            value={content1}
            onChange={(value) => setContent1(value || '')}
            placeholder="Start writing your content here..."
            height={400}
            wordCount={true}
            maxLength={5000}
            minLength={10}
          />
        </CardContent>
      </Card>

      {/* Demo 2: Essay-style editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>✍️</span>
            Essay Editor
            <Badge variant="secondary">Word Limits</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configured for essay writing with word count limits and validation.
          </p>
        </CardHeader>
        <CardContent>
          <MarkdownEditor
            value={content2}
            onChange={(value) => setContent2(value || '')}
            placeholder="Write your essay here... You can use markdown formatting for **bold**, *italic*, `code`, and more."
            height={300}
            wordCount={true}
            maxWords={500}
            minWords={100}
            maxLength={3000}
          />
        </CardContent>
      </Card>

      {/* Demo 3: Simple editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📄</span>
            Simple Editor
            <Badge variant="secondary">Basic</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Basic markdown editor without word count or validation limits.
          </p>
        </CardHeader>
        <CardContent>
          <MarkdownEditor
            value={content3}
            onChange={(value) => setContent3(value || '')}
            placeholder="Write anything you want..."
            height={250}
          />
        </CardContent>
      </Card>

      {/* Features showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🚀</span>
            Features Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📝 Rich Text Formatting</h4>
              <p className="text-sm text-gray-600">Support for bold, italic, headers, lists, code blocks, and more.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">👁️ Live Preview</h4>
              <p className="text-sm text-gray-600">See your formatted content as you type with real-time rendering.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📊 Word & Character Count</h4>
              <p className="text-sm text-gray-600">Track your content length with real-time counting and validation.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔍 Fullscreen Mode</h4>
              <p className="text-sm text-gray-600">Focus on your writing with distraction-free fullscreen editing.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">⚡ Performance</h4>
              <p className="text-sm text-gray-600">Lightweight and fast, optimized for smooth editing experience.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">📱 Mobile Friendly</h4>
              <p className="text-sm text-gray-600">Responsive design that works great on all devices.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💡</span>
            Markdown Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Basic Formatting</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono space-y-2">
                <div>**Bold text** → <strong>Bold text</strong></div>
                <div>*Italic text* → <em>Italic text</em></div>
                <div>`Code` → <code>Code</code></div>
                <div># Header 1</div>
                <div>## Header 2</div>
                <div>- List item</div>
                <div>1. Numbered list</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Advanced Features</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono space-y-2">
                <div>```javascript</div>
                <div>console.log(&quot;Code block&quot;);</div>
                <div>```</div>
                <div>[Link text](url)</div>
                <div>![Image alt](image.jpg)</div>
                <div>&gt; Blockquote</div>
                <div>| Table | Header |</div>
                <div>|-------|--------|</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 