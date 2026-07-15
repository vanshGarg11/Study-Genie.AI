import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY as string
)

const model  =  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
})

export const generateNotes = async(
    topic:string
)=>{
    const result = await model.generateContent(
    `Generate detailed study notes on ${topic}.
     Use headings, bullet points and examples.`
  );

  return result.response.text();
}
export const generateQuiz = async (
  topic: string
) => {
  const result = await model.generateContent(
    `
Generate 10 multiple choice questions on ${topic}.

Return in this format:

Q1. Question
A. Option
B. Option
C. Option
D. Option
Answer: A

Q2. Question
...
`
  );

  return result.response.text();
};
export const generateFlashcards = async (
  topic: string
) => {
  const result = await model.generateContent(`
Generate 15 study flashcards on ${topic}.

Format:

Q: Question
A: Answer

Q: Question
A: Answer
`);

  return result.response.text();
};