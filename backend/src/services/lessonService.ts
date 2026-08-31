import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    throw new Error("GEMINI_API_KEY is not configured in backend/.env");
  }
  return new GoogleGenerativeAI(apiKey);
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

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

export const generateLesson = async (text: string) => {
  const genAI = getGenAI();

  const prompt = `
You are an expert professor.
Convert the study material into a structured multi-slide curriculum lesson.

Return ONLY valid JSON:
{
  "title": "Lesson title",
  "slides": [
    {
      "heading": "Slide Title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Teacher narration for this slide"
    }
  ],
  "quiz": [
    {
      "question": "Comprehension Question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Rules:
- Create 6 to 10 slides.
- 3 to 5 content bullet points per slide.
- 4 to 6 comprehension quiz questions.
- "answer" must match one of the option strings exactly.

Study Material:
${text.substring(0, 30000)}
`;

  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });
      const result = await model.generateContent(prompt);
      const jsonStr = cleanJsonString(result.response.text());
      return JSON.parse(jsonStr);
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw new Error(`Failed to generate lesson with Gemini: ${lastError?.message || "Unknown error"}`);
};

export const answerLessonQuestion = async (
  lessonContext: string,
  question: string
) => {
  const genAI = getGenAI();

  const prompt = `
You are StudyGenie AI Teacher.
Answer the student's question using only the lesson content provided.
Teach in a friendly, clear, concise style.

Lesson Content:
${lessonContext.substring(0, 20000)}

Student Question:
${question}
`;

  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig: { temperature: 0.2 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw new Error(`Failed to answer lesson question: ${lastError?.message || "Unknown error"}`);
};
