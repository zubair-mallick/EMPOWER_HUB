"use client";

import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams } from "next/navigation";

function randomID(len: number) {
  let result = "";
  const chars = "1234567890qwertyuiopasdfghjklzxcvbnm";
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default function CallPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const roomIdFromParams = params.roomIdFromParams as string;
  const usernameFromParams = params.usernameFromParams as string;

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
      sharedLinks: [
        {
          name: "Personal link",
          url: window.location.href,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });

  }, [roomIdFromParams, usernameFromParams]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
      className="myCallContainer"
    ></div>
  );
}
