'use client';

import { useState } from 'react';
import { 
  getFilteredSections, 
  getFilteredQuestions, 
  getNextSection, 
  getPreviousSection,
  getAdaptiveProgressPercentage,
  getAdaptiveTotalQuestions,
  QUIZ_SECTIONS 
} from '@/lib/quiz-config';

export default function TestAdaptiveQuiz() {
  const [responses, setResponses] = useState<Record<string, string[] | string>>({});
  const [currentSection, setCurrentSection] = useState('education-aspirations');

  const filteredSections = getFilteredSections(responses);
  const currentSectionData = filteredSections.find(s => s.id === currentSection);
  const filteredQuestions = currentSectionData ? getFilteredQuestions(currentSectionData, responses) : [];
  const nextSection = getNextSection(currentSection, responses);
  const prevSection = getPreviousSection(currentSection, responses);
  const progress = getAdaptiveProgressPercentage([], responses);
  const totalQuestions = getAdaptiveTotalQuestions(responses);

  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelectChange = (questionId: string, value: string, checked: boolean) => {
    const currentResponses = (responses[questionId] as string[]) || [];
    let newResponses: string[];
    
    if (checked) {
      newResponses = [...currentResponses, value];
    } else {
      newResponses = currentResponses.filter(v => v !== value);
    }
    
    handleResponseChange(questionId, newResponses);
  };

  const navigateToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Adaptive Quiz Test</h1>
      
      {/* Progress Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Quiz Progress</h2>
        <p>Filtered Sections: {filteredSections.length} of {QUIZ_SECTIONS.length}</p>
        <p>Total Questions: {totalQuestions}</p>
        <p>Progress: {Math.round(progress)}%</p>
        <p>Current Section: {currentSection}</p>
        <p>Questions in Current Section: {filteredQuestions.length}</p>
      </div>

      {/* Section Navigation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Available Sections:</h3>
        <div className="flex flex-wrap gap-2">
          {filteredSections.map(section => (
            <button
              key={section.id}
              onClick={() => navigateToSection(section.id)}
              className={`px-3 py-1 rounded ${
                section.id === currentSection 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      {currentSectionData && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            {currentSectionData.icon} {currentSectionData.title}
          </h2>
          <p className="text-gray-600 mb-6">{currentSectionData.description}</p>

          {/* Questions */}
          <div className="space-y-6">
            {filteredQuestions.map(question => (
              <div key={question.id} className="border rounded p-4">
                <h3 className="font-semibold mb-2">{question.title}</h3>
                {question.description && (
                  <p className="text-gray-600 mb-3">{question.description}</p>
                )}
                
                {question.type === 'multiselect' && question.options && (
                  <div className="space-y-2">
                    {question.options.map(option => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(responses[question.id] as string[])?.includes(option.value) || false}
                          onChange={(e) => handleMultiSelectChange(question.id, option.value, e.target.checked)}
                        />
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-gray-500 text-sm">({option.description})</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <button
              onClick={() => prevSection && navigateToSection(prevSection.id)}
              disabled={!prevSection}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous Section
            </button>
            <button
              onClick={() => nextSection && navigateToSection(nextSection.id)}
              disabled={!nextSection}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next Section
            </button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(responses, null, 2)}
        </pre>
      </div>
    </div>
  );
} 