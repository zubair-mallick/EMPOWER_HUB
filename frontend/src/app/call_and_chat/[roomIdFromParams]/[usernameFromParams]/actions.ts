// app/actions.ts
"use server"

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"

const apiKey = process.env.key2
if (!apiKey) {
  throw new Error("API_KEY is not defined in the environment variables.")
}

const genAI = new GoogleGenerativeAI(apiKey)

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
]

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "string" as any,
      description: "The generated response from the AI model in normal text.",
    },
  },
})

import fetch from "node-fetch";

const AAI_KEY       = process.env.ASSEMBLYAI_API_KEY!;
const UPLOAD_URL    = "https://api.assemblyai.com/v2/upload";
const TRANSCRIPT_URL= "https://api.assemblyai.com/v2/transcript";

/** Upload raw bytes to AssemblyAI, return the upload_url */
async function uploadToAssemblyAI(buffer: ArrayBuffer): Promise<string> {
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: AAI_KEY },
    body: Buffer.from(buffer),
  });
  const payload:any = await res.json();
  if (!payload.upload_url) throw new Error("Upload failed");
  return payload.upload_url;
}

/** Kick off and poll a transcription job, return the transcript text */
async function requestTranscript(audio_url: string): Promise<string> {
  const create:any = await fetch(TRANSCRIPT_URL, {
    method: "POST",
    headers: {
      Authorization: AAI_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audio_url, speech_model: "universal" }),
  }).then((r) => r.json());

  // poll until done
  while (true) {
    const poll:any = await fetch(`${TRANSCRIPT_URL}/${create.id}`, {
      headers: { Authorization: AAI_KEY },
    }).then((r) => r.json());

    if (poll.status === "completed") return poll.text;
    if (poll.status === "failed") throw new Error("Transcription failed");
    await new Promise((r) => setTimeout(r, 1000));
  }
}

/**
 * Server action: takes a FormData with `audio: File`,
 * returns { transcript: string }.
 */
export async function transcribeAudio(formData: FormData) {
  const file = formData.get("audio") as File;
  if (!file) throw new Error("No audio provided");

  // 1️⃣ Read raw bytes
  const buffer    = await file.arrayBuffer();
  // 2️⃣ Upload to AAI
  const uploadUrl = await uploadToAssemblyAI(buffer);
  // 3️⃣ Transcribe
  const text      = await requestTranscript(uploadUrl);

  return { transcript: text };
}



export const summarizeTranscriptionToPoints = async (transcript: string) => {
  try {
    if (!transcript) throw new Error("Transcript is required")

    const prompt = `
      You are an AI summarizer.

      Given the following transcript from a conversation, generate a clear and concise summary in **bullet points**. Keep each point informative and brief.

      Transcript:
      "${transcript}"

      Instructions:
      - Focus only on the meaningful parts (e.g., advice, questions, answers, discussion points).
      - Use bullet points.
      - Avoid special characters or JSON formatting.
      - Each bullet should be 1–2 lines max.
    `

    const result = await model.generateContent(prompt.trim())
    const summary = result.response.text()
      .replace(/\\\d+\\:\s+/g, '')
      .replace(/\\/g, '')
      .replace(/[*•\-]+/g, '•')  // Normalize bullets
      .replace(/, /g, '\n• ')
      .replace(/{/g, '')
      .replace(/}/g, '')

    return { summary }
  } catch (error) {
    console.error("Error summarizing transcription:", error)
    throw new Error("Failed to summarize transcription.")
  }
}