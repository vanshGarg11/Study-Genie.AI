import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const generateLesson = async (text: string) => {

    const prompt = `
You are an expert professor.

Convert the following study material into a structured lesson.

Return ONLY valid JSON.

Format:

{
"title":"",
"slides":[
{
"heading":"",
"content":["","",""],
"speakerNotes":""
}
],
"quiz":[
{
"question":"",
"options":["","","",""],
"answer":""
}
]
}

Study Material:

${text.substring(0,12000)}
`;

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],

        temperature: 0.5,

        response_format: {
            type: "json_object",
        },
    });

    return JSON.parse(
        completion.choices[0].message.content as string
    );
};

export const answerLessonQuestion = async (
    lessonContext: string,
    question: string
) => {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content: `
You are StudyGenie AI Teacher.

Answer the student's question using only the lesson content provided.
Teach in a friendly, clear style.

Rules:
- If the answer is not in the lesson, say you cannot find it in this lesson.
- Keep the answer concise.
- Use simple language and examples when useful.
- Return clean Markdown.
`,
            },
            {
                role: "user",
                content: `
Lesson Content:

${lessonContext.substring(0, 20000)}

Student Question:

${question}
`,
            },
        ],
    });

    return completion.choices[0].message.content || "";
};
