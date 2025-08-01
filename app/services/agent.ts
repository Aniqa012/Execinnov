import OpenAI from "openai";
import { getSystemPrompt } from "../prompts/system";
import { createToolSysPrompt } from "../prompts/create-tool";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateResponse = async (
  systemInstructions: string,
  questions: { question: string; answer: string }[],
  userName: string
) => {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL as string,
    messages: [
      { role: "system", content: getSystemPrompt(systemInstructions) },
      {
        role: "user",
        content: "Hi " + userName + "! " + questions
          .map(
            (q, i) => `Question ${i + 1}: ${q.question} \n Answer: ${q.answer}`
          )
          .join("\n"),
      },
    ],
  });
  return response.choices[0].message.content;
};

const createToolResponseSchema = z.object({
  systemInstructions: z.string(),
  questions: z.array(z.string()),
  numberOfQuestions: z.number(),
});

export const generateTool = async (
  title: string,
  description: string,
  expectations: string,
) => {
  const response = await openai.responses.parse({
    model: process.env.OPENAI_MODEL as string,
    input: [
      { role: "system", content: createToolSysPrompt() },
      {
        role: "user",
        content: `
        Title: ${title}
        Description: ${description}
        Expectations: ${expectations}
        `,
      },
    ],
    text:{
      format: zodTextFormat(createToolResponseSchema, "createToolResponse")
    },
  });
  return response.output_parsed;
};
