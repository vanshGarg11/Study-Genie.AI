import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* -------------------- NOTES -------------------- */

export const generateNotes = async (topic: string) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `
You are StudyGenie AI.

You create beautiful, well-structured study notes.

Always respond in GitHub Markdown.

Rules:
- Use # for the main title.
- Use ## for section headings.
- Use ### for subheadings.
- Use bullet points.
- Use numbered lists where appropriate.
- Use tables when useful.
- Highlight important keywords using **bold**.
- Use code blocks only when needed.
- Do NOT use ===== or ----- under headings.
- Keep explanations easy to understand.
`,
      },
      {
        role: "user",
        content: `
Generate detailed study notes on:

${topic}

Include:

# Title

## Introduction

## Key Concepts

## Detailed Explanation

## Examples

## Advantages

## Disadvantages

## Interview Questions

## Summary
`,
      },
    ],
  });

  return completion.choices[0].message.content || "";
};

/* -------------------- QUIZ -------------------- */

export const generateQuiz = async (topic: string) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `
You are StudyGenie AI.

Generate quizzes in Markdown only.
`,
      },
      {
        role: "user",
        content: `
Generate 10 MCQs on:

${topic}

Format:

# Quiz

## Question 1

Question

- A.
- B.
- C.
- D.

**Answer:** B

**Explanation:** Explanation

Repeat for all 10 questions.
`,
      },
    ],
  });

  return completion.choices[0].message.content || "";
};

/* -------------------- FLASHCARDS -------------------- */

export const generateFlashcards = async (topic: string) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `
You create flashcards in Markdown.
`,
      },
      {
        role: "user",
        content: `
Generate 15 flashcards on:

${topic}

Format:

# Flashcards

## Flashcard 1

**Question**

...

**Answer**

...

Repeat for all flashcards.
`,
      },
    ],
  });

  return completion.choices[0].message.content || "";
};

/* -------------------- PDF CHAT -------------------- */

export const generateAnswerFromPDF = async (
  pdfContent: string,
  question: string
) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: `
You are StudyGenie AI.

You answer questions ONLY from the uploaded PDF.

STRICT RULES:

1. Never use outside knowledge.
2. If the answer isn't present in the PDF, reply exactly:

"I couldn't find that information in the uploaded PDF."

3. Return clean GitHub Markdown.

Formatting Rules:

- Use ## headings.
- Use ### subheadings.
- Use bullet points.
- Use numbered lists.
- Use tables when useful.
- Use **bold** keywords.
- Use code blocks if required.
- Never use ===== or ----.
- Never hallucinate.
- Keep answers concise but complete.
`,
      },
      {
        role: "user",
        content: `
PDF Content:

${pdfContent.substring(0, 50000)}

----------------------------

Question:

${question}

Instructions:

- Use ONLY information present in the uploaded PDF.
- If the answer is not present, reply:
"I couldn't find that information in the uploaded PDF."
- Never invent information.
- Return clean Markdown.
`,
      },
    ],
  });

  return completion.choices[0].message.content || "";
};

export const generateChatTitle = async (
  question: string
) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Generate a very short chat title.

Rules:
- Maximum 5 words
- No punctuation at the end
- No quotes
- Return ONLY the title
`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  return completion.choices[0].message.content?.trim() || "New Chat";
};

export const generateSuggestedQuestions = async (
  pdfContent: string
) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `
Generate five useful questions that a student might ask after reading the PDF.

Return ONLY a JSON array.

Example:
[
  "What is React?",
  "Explain Hooks",
  "Advantages of React"
]
`,
      },
      {
        role: "user",
        content: pdfContent.substring(0, 15000),
      },
    ],
  });

  return completion.choices[0].message.content || "[]";
};
