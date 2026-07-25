"use client";

import { useState, useCallback } from "react";

interface DockProps {
  playerCount: number;
  onToggleLock: (zoneId: string) => void;
}

export default function Dock({ playerCount, onToggleLock }: DockProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);

  const toggleMic = useCallback(() => setMicOn((v) => !v), []);
  
  const toggleCam = useCallback(async () => {
    try {
      if (!camOn) {
        // Request camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCamOn(true);
        window.dispatchEvent(new CustomEvent("local-camera-toggled", { detail: stream }));
      } else {
        // Turn off camera
        setCamOn(false);
        window.dispatchEvent(new CustomEvent("local-camera-toggled", { detail: null }));
      }
    } catch (err) {
      console.error("Failed to access camera", err);
      alert("Could not access camera. Please check permissions.");
    }
  }, [camOn]);

  const toggleScreen = useCallback(() => setScreenShare((v) => !v), []);

  const handleLockRoom = useCallback(() => {
    const zoneId = prompt("Enter private zone ID to lock/unlock:");
    if (zoneId) onToggleLock(zoneId);
  }, [onToggleLock]);

  return (
    <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 shadow-2xl backdrop-blur-xl">
        
        {/* Name Bubble */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-700 font-bold text-sm relative border-2 border-[#1a1a1a]">
          A
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#1a1a1a]" />
        </div>

        <div className="mx-1 h-6 w-px bg-[#333333]" />

        {/* Mic */}
        <DockButton
          active={micOn}
          onClick={toggleMic}
          label={micOn ? "Mute" : "Unmute"}
          activeColor="bg-[#1b2b22] text-[#34d399] border border-[#234533]"
          inactiveColor="bg-[#2d1b1b] text-[#ef4444] border border-[#452323]"
        >
          {micOn ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.36 2.18" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </DockButton>

        {/* Camera */}
        <DockButton
          active={camOn}
          onClick={toggleCam}
          label={camOn ? "Camera Off" : "Camera On"}
          activeColor="bg-[#1b2b22] text-[#34d399] border border-[#234533]"
          inactiveColor="bg-[#2d1b1b] text-[#ef4444] border border-[#452323]"
        >
          {camOn ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </DockButton>

        {/* Emotes */}
        <DockButton
          active={false}
          onClick={() => {}}
          label="Emote"
          activeColor=""
          inactiveColor="bg-[#242424] text-gray-400 border border-transparent hover:bg-[#2a2a2a] hover:text-gray-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        </DockButton>

        {/* Screen Share */}
        <DockButton
          active={screenShare}
          onClick={toggleScreen}
          label={screenShare ? "Stop Sharing" : "Share Screen"}
          activeColor="bg-[#1b2b3a] text-[#38bdf8] border border-[#233545]"
          inactiveColor="bg-[#242424] text-gray-400 border border-transparent hover:bg-[#2a2a2a] hover:text-gray-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </DockButton>

        {/* Hand Raise */}
        <DockButton
          active={false}
          onClick={() => {}}
          label="Raise Hand"
          activeColor=""
          inactiveColor="bg-[#242424] text-gray-400 border border-transparent hover:bg-[#2a2a2a] hover:text-gray-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 11V6a2 2 0 0 0-4 0v4a2 2 0 0 0-4 0V4a2 2 0 0 0-4 0v6a2 2 0 0 0-4 0v7a8 8 0 0 0 16 0v-6a2 2 0 0 0-2-2z"></path></svg>
        </DockButton>

        <div className="mx-1 h-6 w-px bg-[#333333]" />

        {/* Lock Room */}
        <DockButton
          active={false}
          onClick={handleLockRoom}
          label="Lock Room"
          activeColor=""
          inactiveColor="bg-[#2d1b1b] text-[#ef4444] border border-[#452323]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </DockButton>

      </div>
    </div>
  );
}

interface DockButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  activeColor: string;
  inactiveColor: string;
  children: React.ReactNode;
}

function DockButton({
  active,
  onClick,
  label,
  activeColor,
  inactiveColor,
  children,
}: DockButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
        active ? activeColor : inactiveColor
      }`}
    >
      {children}
    </button>
  );
}
