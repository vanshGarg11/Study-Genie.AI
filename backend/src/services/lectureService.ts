import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateLecturePlan = async (text: string) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.45,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
You are StudyGenie AI Teacher.

Convert study material into a full video-style lecture.
The output must feel like a teacher speaking directly to a student, not like notes.

Return ONLY valid JSON.

Format:
{
  "title": "",
  "segments": [
    {
      "heading": "",
      "objective": "",
      "script": "",
      "recap": "",
      "checkpointQuestion": ""
    }
  ]
}

Rules:
- Create 6 to 10 lecture segments.
- Each script should be spoken teacher narration.
- Explain step by step with examples.
- Use simple classroom language.
- Do not mention that you are an AI.
- Keep each script between 120 and 220 words.
`,
      },
      {
        role: "user",
        content: `
Study Material:

${text.substring(0, 30000)}
`,
      },
    ],
  });

  return JSON.parse(completion.choices[0].message.content as string);
};

export const answerLectureQuestion = async (
  lectureContext: string,
  currentSegment: string,
  question: string
) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.25,
    messages: [
      {
        role: "system",
        content: `
You are a live teacher in front of the student.

The student interrupted your lecture to ask a question.
Answer conversationally, using the lecture content only.
After answering, end with one short sentence that invites the student to continue.

Rules:
- Do not invent content outside the lecture.
- If the answer is not present, say it is not covered in this lecture segment.
- Keep answers clear and short.
- Return plain text, not JSON.
`,
      },
      {
        role: "user",
        content: `
Full Lecture Context:
${lectureContext.substring(0, 22000)}

Current Segment:
${currentSegment}

Student Question:
${question}
`,
      },
    ],
  });

  return completion.choices[0].message.content || "";
};
