"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from "next/navigation";

// Function to generate a random ID
function randomID(len: number) {
  let result = "";
  const chars = "1234567890qwertyuiopasdfghjklzxcvbnm";
  const maxPos = chars.length;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default function CallPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const roomIdFromParams = params.roomIdFromParams as string;
  const usernameFromParams = params.usernameFromParams as string;

  // Create a reference for the SpeechRecognition API
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!containerRef.current || !roomIdFromParams || !usernameFromParams) return;

    const appID = 312890751;
    const serverSecret = "7492ec88310fa4e724fc83f3b5519d4d";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomIdFromParams,
      randomID(5),
      usernameFromParams
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showPreJoinView: false,
      turnOnCameraWhenJoining: true,
      showRoomTimer: false,
      showScreenSharingButton: false,
      showTextChat: false,
      layout: "Auto",

      onLeaveRoom: () => {
        console.log()
        // Stop recording and fetch the transcript when the call ends
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false); // Prevent future recording until the next call
        }
      },
    });

    // Set up Speech Recognition API (Google Web Speech API)

    const recognition = new (window.SpeechRecognition|| window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false; // Disable interim results (no partial results)
    recognition.continuous = true; // Keep listening until stop

    // Handle result event to capture transcript
    recognition.onresult = (event: any) => {
      const transcriptText = event.results[event.resultIndex][0].transcript;

      // Check if the result is not a duplicate
      if (transcriptText && transcriptText !== transcript) {
        setTranscript((prev) => (prev ? prev + " " + transcriptText : transcriptText));
      }
    };

    recognitionRef.current = recognition;

    // Request audio permission and start recognition
    navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
      recognition.start();
      setIsRecording(true);
    }).catch((error) => {
      console.error("Error accessing microphone: ", error);
    });

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [roomIdFromParams, usernameFromParams, isRecording, transcript]);

  return (
    <div className="mt-20 p-4 shadow-lg rounded-lg place-content-center">
      {transcript && (
        <div className="p-4 shadow-lg rounded-lg place-content-center text-white">
          <h2 className="text-xl font-bold mb-2">Call Transcript</h2>
          <p>{transcript}</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="myCallContainer place-content-center"
        style={{ backgroundColor: "transparent" }}
      ></div>
    </div>
  );
}
