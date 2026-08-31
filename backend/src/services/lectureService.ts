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

export const generateLecturePlan = async (text: string) => {
  const genAI = getGenAI();

  const prompt = `
You are StudyGenie AI Teacher.
Convert study material into a full video-style lecture.

Return ONLY valid JSON:
{
  "title": "Lecture Title",
  "segments": [
    {
      "heading": "Segment Title",
      "objective": "What the student will learn in 1 sentence",
      "script": "Natural classroom spoken teacher narration (120-200 words)",
      "recap": "1 sentence recap",
      "checkpointQuestion": "Quick check-in question"
    }
  ]
}

Rules:
- Create 5 to 8 lecture segments.
- Spoken narration style without bullet points.

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
          temperature: 0.45,
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

  throw new Error(`Failed to generate lecture with Gemini: ${lastError?.message || "Unknown error"}`);
};

export const answerLectureQuestion = async (
  lectureContext: string,
  currentSegment: string,
  question: string
) => {
  const genAI = getGenAI();

  const prompt = `
You are a live teacher in front of the student.
The student interrupted your lecture to ask a question.
Answer conversationally, using the lecture content only.

Full Lecture Context:
${lectureContext.substring(0, 22000)}

Current Segment:
${currentSegment}

Student Question:
${question}
`;

  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
        generationConfig: { temperature: 0.25 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw new Error(`Failed to answer lecture question: ${lastError?.message || "Unknown error"}`);
};
