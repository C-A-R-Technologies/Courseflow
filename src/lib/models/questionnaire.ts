export type QuestionType = 'rating' | 'multiple_choice' | 'text' | 'boolean';

// Modelling for each individual question
// Every question needs an id, text prompt, assigned type, and requirement
export interface QuestionBase {
    id: string;
    prompt: string;
    required: boolean;

}

// Implementing discriminated unions
// 'type' is the discriminator

export type Question =
    | (QuestionBase & {
        type: 'rating';
        min: number;
        max: number;
        labels?: { min?: string; max?: string };
    })
    | (QuestionBase & {
        type: 'multiple_choice';
        options: string[];      // required for multiple_choice
    })
    | (QuestionBase & {
        type: 'boolean';
        trueLabel?: string;
        falseLabel?: string;
    })
    | (QuestionBase & {
        type: 'text';
        placeholder?: string;
        multiline?: boolean;
        maxLength?: number;
    })

// Modelling for the questionnaire
export interface Questionnaire {
    id: string;             // Unique Questionnaire ID
    slug?: string;          // helps mapping
    title: string;          // Course name
    courseId: string;       // Course ID
    instructor: string;     // Professor's name
    semester: string;       // Semester of course "Fall XXXX" or "Spring XXXX"
    isActive: boolean;      // The current availability of a Course Eval
    questions: Question[];  // Question list
    createdAt: string;      // Creation date of the questionnaire
    updatedAt: string;
}