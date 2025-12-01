// This file will aggregate lessons from all learn pages
// For now, we'll import and export them here
// Note: In a real implementation, you might want to extract lessons to separate data files

export type QuestionBlock = {
    question: string;
    answer: string;
    snippet?: string;
    note?: string;
    attributes?: { name: string; description: string; badge?: string }[];
    callouts?: { title: string; body: string; tone?: 'info' | 'warning' }[];
    bullets?: string[];
    references: { label: string; url: string }[];
};

export type LessonCategory = {
    category: string;
    path: string;
    lessons: QuestionBlock[];
};

// This will be populated by importing from each page
// For now, we'll create a function that can be called to get all lessons
export async function getAllLessons(): Promise<LessonCategory[]> {
    // We'll need to dynamically import lessons from each page
    // Since lessons are defined in component files, we'll need to extract them
    // For now, return empty array - will be populated
    return [];
}




