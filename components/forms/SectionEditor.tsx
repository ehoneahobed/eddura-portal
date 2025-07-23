import React from 'react';
import { useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { FormSection, ApplicationTemplate, Question, QuestionType } from '@/types';
import QuestionEditor from './QuestionEditor';

interface SectionEditorProps {
  section: FormSection;
  sectionIndex: number;
  control: Control<ApplicationTemplate>;
  errors: FieldErrors<ApplicationTemplate>;
  register: UseFormRegister<ApplicationTemplate>;
  onDuplicateSection: (index: number) => void;
  onRemoveSection: (index: number) => void;
  onAddQuestion: (sectionIndex: number) => void;
  onDuplicateQuestion: (sectionIndex: number, questionIndex: number) => void;
  onRemoveQuestion: (sectionIndex: number, questionIndex: number) => void;
  onUpdateQuestionType: (sectionIndex: number, questionIndex: number, newType: QuestionType) => void;
  onToggleRequired: (sectionIndex: number, questionIndex: number, checked: boolean) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onRemoveOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionIndex,
  control,
  errors,
  register,
  onDuplicateSection,
  onRemoveSection,
  onAddQuestion,
  onDuplicateQuestion,
  onRemoveQuestion,
  onUpdateQuestionType,
  onToggleRequired,
  onAddOption,
  onRemoveOption,
}) => {
  // Set up useFieldArray for questions in this section
  const { fields: questions } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions`,
  });

  return (
    <div className="border rounded-lg p-6 bg-gray-50 mb-6">
      <div className="flex items-center justify-between mb-4">
        <Input
          {...register(`sections.${sectionIndex}.title` as const)}
          placeholder="Section Title"
          className="w-64 h-9"
        />
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => onDuplicateSection(sectionIndex)} variant="outline" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={() => onRemoveSection(sectionIndex)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Textarea
        {...register(`sections.${sectionIndex}.description` as const)}
        placeholder="Section description (optional)"
        rows={2}
        className="mb-4 resize-none"
      />
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Questions</h4>
        <Button type="button" onClick={() => onAddQuestion(sectionIndex)} variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>
      {/* Render questions using QuestionEditor */}
      {questions.map((question, questionIndex) => (
        <QuestionEditor
          key={question.id}
          question={question as Question}
          questionIndex={questionIndex}
          sectionIndex={sectionIndex}
          control={control}
          errors={errors}
          register={register}
          onDuplicateQuestion={onDuplicateQuestion}
          onRemoveQuestion={onRemoveQuestion}
          onUpdateQuestionType={onUpdateQuestionType}
          onToggleRequired={onToggleRequired}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      ))}
      {/* Add Another Question Button at Bottom */}
      <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={() => onAddQuestion(sectionIndex)}
          variant="outline"
          size="default"
          className="flex items-center gap-2 border-dashed border-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Another Question
        </Button>
      </div>
    </div>
  );
};

export default SectionEditor; 