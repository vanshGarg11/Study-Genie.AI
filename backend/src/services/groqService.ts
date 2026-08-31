import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    throw new Error("GEMINI_API_KEY is not configured in backend/.env.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Default safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Fallback candidate models supported by Google Generative AI
const CANDIDATE_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.5-pro",
  "gemini-pro-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash",
  "gemini-pro",
];

const cleanJsonString = (raw: string): string => {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
};

/**
 * Generate content with automatic multi-model fallback ladder
 */
async function generateWithFallback(
  prompt: string,
  options?: { jsonMode?: boolean; temperature?: number }
): Promise<string> {
  const genAI = getGenAI();
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const config: any = {
        temperature: options?.temperature ?? 0.4,
      };
      if (options?.jsonMode) {
        config.responseMimeType = "application/json";
      }

      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig: config,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      lastError = err;
      console.warn(`Model candidate ${modelName} returned: ${err.message}. Trying next candidate model...`);
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || "Unknown error"}`);
}

/* ─────────────────────────── NOTES ─────────────────────────── */

export const generateNotes = async (topic: string): Promise<string> => {
  const prompt = `
You are StudyGenie AI.
You create beautiful, comprehensive, and well-structured study revision notes.
Always respond in clean GitHub Markdown format.

Rules:
- Use # for the main title.
- Use ## for section headings.
- Use ### for subheadings.
- Use bullet points and bold keywords.
- Use tables when useful for comparisons.
- Keep explanations clear and student-friendly.

Generate detailed study notes on:
${topic}

Include:
# Title
## Introduction
## Key Concepts
## Detailed Explanation
## Examples & Real-world Applications
## Summary & Exam Tips
`;

  return generateWithFallback(prompt, { temperature: 0.4 });
};

/* ─────────────────────────── QUIZ ─────────────────────────── */

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const prompt = `
You are StudyGenie AI.
Generate 8 high-quality multiple choice study quiz questions based on the topic: "${topic}".

Return ONLY valid JSON matching this schema:
{
  "quiz": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B",
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}

Rules:
- Exactly 4 options per question.
- "answer" MUST match the full exact text of the correct option.
`;

  try {
    const raw = await generateWithFallback(prompt, { jsonMode: true, temperature: 0.3 });
    const text = cleanJsonString(raw);
    const parsed = JSON.parse(text);
    return (parsed.quiz as QuizQuestion[]) || [];
  } catch (err: any) {
    console.error("Quiz generation error:", err);
    throw err;
  }
};

/* ─────────────────────────── FLASHCARDS ─────────────────────────── */

export interface FlashcardItem {
  front: string;
  back: string;
}

export const generateFlashcards = async (topic: string): Promise<FlashcardItem[]> => {
  const prompt = `
You are StudyGenie AI.
Generate 10 bite-sized high-yield active-recall study flashcards for the topic: "${topic}".

Return ONLY valid JSON matching this schema:
{
  "flashcards": [
    {
      "front": "Clear concept, term, or question",
      "back": "Concise, precise explanation or definition"
    }
  ]
}
`;

  try {
    const raw = await generateWithFallback(prompt, { jsonMode: true, temperature: 0.35 });
    const text = cleanJsonString(raw);
    const parsed = JSON.parse(text);
    return (parsed.flashcards as FlashcardItem[]) || [];
  } catch (err: any) {
    console.error("Flashcards generation error:", err);
    throw err;
  }
};

/* ─────────────────────────── PDF CHAT ─────────────────────────── */

export const generateAnswerFromPDF = async (
  pdfContent: string,
  question: string
): Promise<string> => {
  const prompt = `
You are StudyGenie AI.
Answer the student's question ONLY using the uploaded PDF content provided below.

Rules:
1. If the answer is not present in the PDF, reply: "I couldn't find that information in the uploaded PDF."
2. Return clean GitHub Markdown.

---
PDF Content:
${pdfContent.substring(0, 50000)}

---
Question:
${question}
`;

  return generateWithFallback(prompt, { temperature: 0.2 });
};

/* ─────────────────────────── CHAT TITLE ─────────────────────────── */

export const generateChatTitle = async (question: string): Promise<string> => {
  try {
    const prompt = `Generate a very short chat session title (maximum 4 words) for: "${question}". Return ONLY the title text.`;
    const res = await generateWithFallback(prompt, { temperature: 0.2 });
    return res.trim() || "New Chat";
  } catch {
    return question.length > 30 ? question.substring(0, 30) + "..." : question;
  }
};

/* ─────────────────────────── SUGGESTED QUESTIONS ─────────────────────────── */

export const generateSuggestedQuestions = async (
  pdfContent: string
): Promise<string[]> => {
  try {
    const prompt = `
Generate 4 study questions that a student should ask based on this document:
Return ONLY JSON:
{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4"
  ]
}

Content:
${pdfContent.substring(0, 15000)}
`;

    const raw = await generateWithFallback(prompt, { jsonMode: true, temperature: 0.5 });
    const text = cleanJsonString(raw);
    const parsed = JSON.parse(text);
    return (parsed.questions as string[]) || [];
  } catch {
    return [
      "Can you summarize the main concepts of this document?",
      "What are the key formulas and definitions?",
      "Explain the core mechanism step-by-step.",
      "Give me 3 practice exam questions from this material."
    ];
  }
};

/* ─────────────────────────── LESSON GENERATION ─────────────────────────── */

export interface LessonSlide {
  heading: string;
  content: string[];
  speakerNotes: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answer: string;
}

export interface GeneratedLesson {
  title: string;
  slides: LessonSlide[];
  quiz: LessonQuiz[];
}

export const generateLesson = async (pdfContent: string, topic: string): Promise<GeneratedLesson> => {
  const prompt = `
You are StudyGenie AI Professor.
Create a structured lesson from the PDF content about: "${topic}".

Return ONLY valid JSON matching this schema:
{
  "title": "Lesson title here",
  "slides": [
    {
      "heading": "Slide heading",
      "content": ["bullet 1", "bullet 2", "bullet 3"],
      "speakerNotes": "Spoken narration for this slide"
    }
  ],
  "quiz": [
    {
      "question": "Comprehension question",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}

PDF Content:
${pdfContent.substring(0, 40000)}
`;

  try {
    const raw = await generateWithFallback(prompt, { jsonMode: true, temperature: 0.4 });
    const text = cleanJsonString(raw);
    return JSON.parse(text) as GeneratedLesson;
  } catch (err) {
    console.error("Lesson generation error:", err);
    return { title: topic, slides: [], quiz: [] };
  }
};

/* ─────────────────────────── LECTURE GENERATION ─────────────────────────── */

export interface LectureSegment {
  heading: string;
  objective: string;
  script: string;
  recap: string;
  checkpointQuestion: string;
}

export interface GeneratedLecture {
  title: string;
  segments: LectureSegment[];
}

export const generateLecture = async (pdfContent: string, topic: string): Promise<GeneratedLecture> => {
  const prompt = `
You are StudyGenie AI Teacher.
Create a video lecture script from the PDF content about: "${topic}".

Return ONLY valid JSON matching this schema:
{
  "title": "Lecture title",
  "segments": [
    {
      "heading": "Segment title",
      "objective": "What the student will learn in 1 sentence",
      "script": "Natural classroom narration spoken by teacher",
      "recap": "1 sentence recap",
      "checkpointQuestion": "A quick check-in question"
    }
  ]
}

PDF Content:
${pdfContent.substring(0, 40000)}
`;

  try {
    const raw = await generateWithFallback(prompt, { jsonMode: true, temperature: 0.4 });
    const text = cleanJsonString(raw);
    return JSON.parse(text) as GeneratedLecture;
  } catch (err) {
    console.error("Lecture generation error:", err);
    return { title: topic, segments: [] };
  }
};

/* ─────────────────────────── TEACHER Q&A ─────────────────────────── */

export const answerStudentQuestion = async (
  context: string,
  question: string
): Promise<string> => {
  const prompt = `
You are a friendly, expert AI tutor.
Context: ${context}
Student question: ${question}
Answer clearly in 2 to 4 sentences.
`;

  return generateWithFallback(prompt, { temperature: 0.3 });
};
