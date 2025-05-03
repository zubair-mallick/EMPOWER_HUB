"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from "next/navigation";
import { transcribeAudio, summarizeTranscriptionToPoints } from "./actions";  // import the summarize action

export default function CallPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [summarizedTranscript, setSummarizedTranscript] = useState<string | null>(null); // state for summarized transcript
  const [busy, setBusy] = useState(false);
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const roomId = params.roomIdFromParams as string;
  const username = params.usernameFromParams as string;

  useEffect(() => {
    if (!containerRef.current || !roomId || !username) return;

    // 1️⃣ Initialize Zego
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      312890751,
      "7492ec88310fa4e724fc83f3b5519d4d",
      roomId,
      username + "_" + Math.random().toString(36).slice(2, 7),
      username
    );
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // 2️⃣ Start MediaRecorder
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        chunksRef.current = [];
        mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
        mr.start();
      })
      .catch((e) => {
        console.error(e);
        setError("Microphone access denied.");
      });

    // 3️⃣ Join room and handle onLeaveRoom
    zp.joinRoom({
      container: containerRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
      showPreJoinView: false,
      turnOnCameraWhenJoining: true,
      showRoomTimer: false,
      showScreenSharingButton: false,
      showTextChat: false,
      layout: "Auto",
      onLeaveRoom: async () => {
        setError(null);
        setBusy(true);

        // stop recorder
        const mr = mediaRecorderRef.current;
        if (mr && mr.state !== "inactive") mr.stop();

        // small delay for final chunk
        await new Promise((r) => setTimeout(r, 500));

        // build blob & URL
        const blob = new Blob(chunksRef.current, { type: "audio/webm; codecs=opus" });
        setAudioUrl(URL.createObjectURL(blob));

        try {
          // send to server action
          const fd = new FormData();
          fd.append("audio", new File([blob], "call.webm", { type: blob.type }));

          const { transcript } = await transcribeAudio(fd);
          setTranscript(transcript);
        } catch (e: any) {
          console.error(e);
          setError(e.message || "Transcription failed.");
        } finally {
          setBusy(false);
        }
      },
    });

    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, [roomId, username]);

  // Function to summarize the transcript
  const handleSummarize = async () => {
    try {
      setBusy(true);
      if (transcript) {
        const { summary } = await summarizeTranscriptionToPoints(transcript);
        setSummarizedTranscript(summary);
      }
    } catch (error) {
      setError("Failed to summarize transcript.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-20 p-4 shadow-lg rounded-lg">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {!transcript && busy && <p className="text-blue-600 mb-2">Transcribing… please wait</p>}
      {transcript && busy && <p className="text-blue-600 mb-2">Summarizing… please wait</p>}

      {transcript && (
        <section className="p-4 rounded">
          <h2 className="font-semibold mb-2">Transcript</h2>
          <p className="whitespace-pre-line">{transcript}</p>
          {/* Summarize button */}
          <button
            className="mt-4 p-2 bg-blue-500 text-white rounded"
            onClick={handleSummarize}
          >
            Summarize
          </button>
        </section>
      )}

      {summarizedTranscript && (
        <section className="p-4 mt-6 rounded">
          <h2 className="font-semibold mb-2">Summarized Points</h2>
          <ul className="list-disc pl-6 whitespace-pre-line">
            {summarizedTranscript.split("\n").map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      <div ref={containerRef} className="myCallContainer mt-6" />
    </div>
  );
}
