const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

async function testAIDraftGeneration() {
  console.log('🧪 Testing AI Draft Generation...\n');

  // Check if API key is available
  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('❌ GOOGLE_AI_API_KEY environment variable is not set');
    console.log('Please set the environment variable and try again');
    return;
  }

  console.log('✅ API Key found');

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Test data
    const studentInfo = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      achievements: 'Graduated with honors, completed research project on machine learning',
      relationship: 'student',
      purpose: 'Applying for Master\'s in Computer Science at Stanford University',
    };

    const recipient = {
      name: 'Dr. Jane Smith',
      title: 'Professor',
      institution: 'University of California',
      department: 'Computer Science',
    };

    const templateType = 'academic';
    const customInstructions = 'Focus on academic achievements and research potential';

    // Create test prompt
    const prompt = `You are a professional writing a recommendation letter. Write a formal, professional recommendation letter with the following details:

Student Information:
- Name: ${studentInfo.name}
- Email: ${studentInfo.email}
- Relationship: ${studentInfo.relationship}
- Purpose: ${studentInfo.purpose}
- Key Achievements: ${studentInfo.achievements}

Recipient Information:
- Name: ${recipient.name}
- Title: ${recipient.title}
- Institution: ${recipient.institution}
- Department: ${recipient.department}

Template Type: ${templateType}

Write an academic recommendation letter for a student applying to an academic program. Focus on:
- Academic performance and intellectual capabilities
- Research experience and analytical skills
- Class participation and engagement
- Potential for success in advanced studies
- Specific examples of academic achievements

Requirements:
1. Use formal, professional language
2. Keep the letter concise but comprehensive (300-500 words)
3. Focus on the student's strengths and achievements
4. Explain the relationship and context
5. End with a strong recommendation
6. Use the recipient's name and title appropriately
7. Format as a proper business letter
8. Include specific examples and anecdotes when possible

Additional Instructions: ${customInstructions}

Please write the recommendation letter:`;

    console.log('📝 Generating test draft...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const draft = response.text();

    console.log('✅ Draft generated successfully!');
    console.log('\n📄 Generated Draft:');
    console.log('='.repeat(50));
    console.log(draft);
    console.log('='.repeat(50));

    // Test refinement
    console.log('\n🔄 Testing draft refinement...');
    
    const refinementPrompt = `You are refining a recommendation letter draft. Here is the current draft:

${draft}

Feedback for improvement:
Make the letter more specific about research achievements and add more concrete examples.

Instructions:
1. Keep the professional tone and formal language
2. Address the specific feedback provided
3. Maintain the same length (300-500 words)
4. Preserve any strong points from the original draft
5. Incorporate the additional context if provided
6. Ensure the letter flows naturally and is well-structured
7. End with a strong recommendation

Please provide the refined recommendation letter:`;

    const refinementResult = await model.generateContent(refinementPrompt);
    const refinementResponse = await refinementResult.response;
    const refinedDraft = refinementResponse.text();

    console.log('✅ Draft refinement successful!');
    console.log('\n📄 Refined Draft:');
    console.log('='.repeat(50));
    console.log(refinedDraft);
    console.log('='.repeat(50));

    console.log('\n🎉 All tests passed! AI draft generation is working correctly.');

  } catch (error) {
    console.error('❌ Error testing AI draft generation:', error);
    console.log('\nPossible issues:');
    console.log('- Check if GOOGLE_AI_API_KEY is valid');
    console.log('- Verify internet connection');
    console.log('- Check if Google AI API is accessible');
  }
}

// Run the test
testAIDraftGeneration();