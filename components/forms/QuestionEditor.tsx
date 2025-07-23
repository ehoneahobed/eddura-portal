import React from 'react';
import { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { Question, QuestionType, ApplicationTemplate } from '@/types';

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  sectionIndex: number;
  control: Control<ApplicationTemplate>;
  errors: FieldErrors<ApplicationTemplate>;
  register: UseFormRegister<ApplicationTemplate>;
  onDuplicateQuestion: (sectionIndex: number, questionIndex: number) => void;
  onRemoveQuestion: (sectionIndex: number, questionIndex: number) => void;
  onUpdateQuestionType: (sectionIndex: number, questionIndex: number, newType: QuestionType) => void;
  onToggleRequired: (sectionIndex: number, questionIndex: number, checked: boolean) => void;
  onAddOption: (sectionIndex: number, questionIndex: number) => void;
  onRemoveOption: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Single Choice Dropdown' },
  { value: 'multiselect', label: 'Multiple Choice Dropdown' },
  { value: 'radio', label: 'Single Choice (Radio)' },
  { value: 'checkbox', label: 'Multiple Choice (Checkbox)' },
  { value: 'file', label: 'File Upload' },
  { value: 'url', label: 'URL' },
  { value: 'address', label: 'Address' },
  { value: 'education', label: 'Education History' },
  { value: 'experience', label: 'Work Experience' },
  { value: 'reference', label: 'Reference Contact' },
  { value: 'essay', label: 'Essay' },
  { value: 'statement', label: 'Personal Statement' },
  { value: 'gpa', label: 'GPA' },
  { value: 'test_score', label: 'Test Score' }
];

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  sectionIndex,
  control,
  errors,
  register,
  onDuplicateQuestion,
  onRemoveQuestion,
  onUpdateQuestionType,
  onToggleRequired,
  onAddOption,
  onRemoveOption,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Select
            value={question.type}
            onValueChange={(value: QuestionType) => onUpdateQuestionType(sectionIndex, questionIndex, value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => onDuplicateQuestion(sectionIndex, questionIndex)} variant="outline" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={() => onRemoveQuestion(sectionIndex, questionIndex)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <Input
          {...register(`sections.${sectionIndex}.questions.${questionIndex}.title` as const)}
          placeholder="Question title"
          className="h-9"
        />
        <Textarea
          {...register(`sections.${sectionIndex}.questions.${questionIndex}.description` as const)}
          placeholder="Question description (optional)"
          rows={2}
          className="resize-none"
        />
        <Input
          {...register(`sections.${sectionIndex}.questions.${questionIndex}.placeholder` as const)}
          placeholder="Placeholder text"
          className="h-9"
        />
        <div className="flex items-center space-x-2">
          <Switch
            checked={question.required ?? false}
            onCheckedChange={(checked) => onToggleRequired(sectionIndex, questionIndex, checked)}
          />
          <span>Required</span>
        </div>
        {/* Options for choice-based questions */}
        {(question.type === 'select' || question.type === 'multiselect' || question.type === 'radio' || question.type === 'checkbox') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Options</span>
              <Button type="button" onClick={() => onAddOption(sectionIndex, questionIndex)} variant="outline" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Input
                    {...register(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.value` as const)}
                    placeholder="Value"
                    className="h-8"
                  />
                  <Input
                    {...register(`sections.${sectionIndex}.questions.${questionIndex}.options.${optionIndex}.label` as const)}
                    placeholder="Label"
                    className="h-8"
                  />
                  <Button type="button" onClick={() => onRemoveOption(sectionIndex, questionIndex, optionIndex)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* File Upload Configuration */}
        {question.type === 'file' && (
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <span>File Upload Settings</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-sm">Max Size (MB)</span>
                <Input
                  type="number"
                  min={1}
                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.fileConfig.maxSize` as const, {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1 MB' },
                    required: 'Max file size is required'
                  })}
                  className="h-8"
                />
                {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.fileConfig?.maxSize && (
                  <span className="text-xs text-red-600">
                    {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.fileConfig?.maxSize?.message}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm">Max Files</span>
                <Input
                  type="number"
                  min={1}
                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.fileConfig.maxFiles` as const, {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must be at least 1 file' },
                    required: 'Max files is required'
                  })}
                  className="h-8"
                />
                {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.fileConfig?.maxFiles && (
                  <span className="text-xs text-red-600">
                    {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.fileConfig?.maxFiles?.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Length and Word Limits for text-based questions */}
        {(question.type === 'text' || question.type === 'textarea' || question.type === 'essay' || question.type === 'statement') && (
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <span>Length Limits</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-sm">Min Characters</span>
                <Input
                  type="number"
                  min={0}
                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.minLength` as const, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  placeholder="Optional"
                  className="h-8"
                />
                {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.minLength && (
                  <span className="text-xs text-red-600">
                    {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.minLength?.message}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm">Max Characters</span>
                <Input
                  type="number"
                  min={0}
                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.maxLength` as const, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                    validate: (value) => {
                      const min = Number(
                        (errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.minLength?.ref?.value) || 0
                      );
                      if (value !== undefined && min !== undefined && value < min) {
                        return 'Max must be greater than or equal to min';
                      }
                      return true;
                    }
                  })}
                  placeholder="Optional"
                  className="h-8"
                />
                {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.maxLength && (
                  <span className="text-xs text-red-600">
                    {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.maxLength?.message}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm">Min Words</span>
                <Input
                  type="number"
                  min={0}
                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.minWords` as const, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' }
                  })}
                  placeholder="Optional"
                  className="h-8"
                />
                {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.minWords && (
                  <span className="text-xs text-red-600">
                    {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.minWords?.message}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm">Max Words</span>
                <Input
                  type="number"
                  min={0}
                  {...register(`sections.${sectionIndex}.questions.${questionIndex}.maxWords` as const, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                    validate: (value) => {
                      const min = Number(
                        (errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.minWords?.ref?.value) || 0
                      );
                      if (value !== undefined && min !== undefined && value < min) {
                        return 'Max must be greater than or equal to min';
                      }
                      return true;
                    }
                  })}
                  placeholder="Optional"
                  className="h-8"
                />
                {errors?.sections?.[sectionIndex]?.questions?.[questionIndex]?.maxWords && (
                  <span className="text-xs text-red-600">
                    {errors.sections?.[sectionIndex]?.questions?.[questionIndex]?.maxWords?.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionEditor; 