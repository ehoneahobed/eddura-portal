import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@/types/documents';
import { aiConfig, getActiveProvider } from '@/lib/ai-config';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import DocumentFeedback from '@/models/DocumentFeedback';
import Document from '@/models/Document';

// Validation schema for AI feedback refinement request
const RefineWithFeedbackRequestSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  currentContent: z.string().min(10, 'Content must be at least 10 characters').max(50000, 'Content must be less than 50000 characters'),
  documentType: z.nativeEnum(DocumentType).optional(),
  feedbackIds: z.array(z.string()).min(1, 'At least one feedback ID is required'),
  customInstructions: z.string().max(500).optional(),
  refinementMode: z.enum(['replace', 'new_version']),
});

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Function to craft feedback refinement prompt
function craftFeedbackRefinementPrompt(
  currentContent: string,
  feedback: DocumentFeedback[],
  documentType?: DocumentType,
  customInstructions?: string,
  refinementMode?: string
): string {
  const typeConfig = documentType ? DOCUMENT_TYPE_CONFIG[documentType] : null;
  
  let prompt = `You are an expert content refinement assistant. You will rewrite the following document content to incorporate specific feedback while preserving the author's voice and key information.

IMPORTANT: 
- Preserve the original voice and intent of the author
- Maintain the same structure and key information
- Incorporate the feedback suggestions appropriately
- Do NOT add any prefixes like "Here is your refined content..." - return only the refined content
- Keep the same document type and purpose
- Address the specific feedback points while maintaining the document's overall quality`;

  // Add document type context if available
  if (typeConfig) {
    prompt += `\n\nDocument Type: ${typeConfig.label}`;
    if (typeConfig.guidelines) {
      prompt += `\nGuidelines: ${typeConfig.guidelines}`;
    }
  }

  prompt += `\n\nOriginal Content:\n${currentContent}`;

  // Add feedback analysis
  prompt += `\n\nFeedback to Incorporate:`;
  
  feedback.forEach((feedbackItem, index) => {
    prompt += `\n\nFeedback ${index + 1} from ${feedbackItem.reviewerName}:`;
    
    if (feedbackItem.overallRating) {
      prompt += `\nOverall Rating: ${feedbackItem.overallRating}/5`;
    }
    
    if (feedbackItem.generalFeedback) {
      prompt += `\nGeneral Feedback: ${feedbackItem.generalFeedback}`;
    }
    
    if (feedbackItem.comments.length > 0) {
      prompt += `\nSpecific Comments:`;
      feedbackItem.comments.forEach((comment, commentIndex) => {
        prompt += `\n${commentIndex + 1}. [${comment.type.toUpperCase()}] ${comment.content}`;
        if (comment.status === 'addressed') {
          prompt += ` (This comment has been addressed - incorporate the improvement)`;
        } else if (comment.status === 'pending') {
          prompt += ` (This comment needs to be addressed - make the suggested improvement)`;
        }
      });
    }
  });

  // Add custom instructions if provided
  if (customInstructions) {
    prompt += `\n\nAdditional Instructions: ${customInstructions}`;
  }

  // Add refinement mode context
  if (refinementMode === 'new_version') {
    prompt += `\n\nNote: This will create a new version of the document, so you can make more substantial improvements while maintaining the core message.`;
  } else {
    prompt += `\n\nNote: This will replace the current content, so make targeted improvements that address the feedback while preserving the existing structure.`;
  }

  // Add final instructions
  prompt += `\n\nPlease rewrite the content to address the feedback while maintaining the author's voice, key information, and document structure. Focus on incorporating the specific suggestions and addressing the concerns raised in the feedback.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if AI service is configured
    const activeProvider = getActiveProvider();
    if (!activeProvider) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set up an AI provider API key.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = RefineWithFeedbackRequestSchema.parse(body);
    
    // Check if document type is coming soon (if provided)
    if (validatedData.documentType) {
      const typeConfig = DOCUMENT_TYPE_CONFIG[validatedData.documentType];
      if (typeConfig?.comingSoon) {
        return NextResponse.json(
          { error: 'This document type is not supported for AI refinement' },
          { status: 400 }
        );
      }
    }

    // Connect to database
    await connectDB();

    // Fetch the selected feedback from the database
    const feedback = await DocumentFeedback.find({
      _id: { $in: validatedData.feedbackIds },
      documentId: validatedData.documentId
    }).lean();

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: 'No feedback found for the selected items' },
        { status: 400 }
      );
    }

    // Verify user owns the document
    const document = await Document.findOne({
      _id: validatedData.documentId,
      userId: session.user.id
    }).lean();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Craft the feedback refinement prompt
    const prompt = craftFeedbackRefinementPrompt(
      validatedData.currentContent,
      feedback as DocumentFeedback[],
      validatedData.documentType,
      validatedData.customInstructions,
      validatedData.refinementMode
    );

    // Generate refined content using the active AI provider
    let refinedContent = '';
    
    if (aiConfig.defaultProvider === 'google') {
      const model = genAI.getGenerativeModel({ model: activeProvider.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      refinedContent = response.text();
    } else {
      // TODO: Add support for other providers (OpenAI, Anthropic)
      return NextResponse.json(
        { error: 'AI provider not yet implemented' },
        { status: 500 }
      );
    }

    if (!refinedContent) {
      return NextResponse.json(
        { error: 'Failed to refine content' },
        { status: 500 }
      );
    }

    // If creating a new version, create a new document
    if (validatedData.refinementMode === 'new_version') {
      const newDocument = new Document({
        title: `${document.title} (Refined Version)`,
        content: refinedContent,
        type: document.type,
        userId: session.user.id,
        isPublic: false,
        tags: [...(document.tags || []), 'ai-refined']
      });

      const savedDocument = await newDocument.save();
      
      return NextResponse.json({
        content: refinedContent,
        documentId: savedDocument._id.toString(),
        wordCount: refinedContent.trim().split(/\s+/).filter(word => word.length > 0).length,
        characterCount: refinedContent.length,
        originalWordCount: validatedData.currentContent.trim().split(/\s+/).filter(word => word.length > 0).length,
        originalCharacterCount: validatedData.currentContent.length,
        isNewVersion: true
      });
    }

    // If replacing content, return the refined content for the client to update
    return NextResponse.json({
      content: refinedContent,
      wordCount: refinedContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      characterCount: refinedContent.length,
      originalWordCount: validatedData.currentContent.trim().split(/\s+/).filter(word => word.length > 0).length,
      originalCharacterCount: validatedData.currentContent.length,
      isNewVersion: false
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error refining content with feedback:', error);
    return NextResponse.json(
      { error: 'Failed to refine content with feedback' },
      { status: 500 }
    );
  }
}