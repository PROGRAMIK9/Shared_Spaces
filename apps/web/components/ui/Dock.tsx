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
        // Send stream to LiveKitRoom via window event
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
    const zoneId = prompt("Enter private zone ID to lock/unlock (e.g., room_a, room_b, room_c, room_d):");
    if (zoneId) onToggleLock(zoneId);
  }, [onToggleLock]);

  return (
    <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/80 px-2 py-2 shadow-lg backdrop-blur-xl">
        {/* Mic */}
        <DockButton
          active={micOn}
          onClick={toggleMic}
          label={micOn ? "Mute" : "Unmute"}
          activeColor="bg-emerald-100 text-emerald-600 border-emerald-200"
          inactiveColor="bg-red-100 text-red-600 border-red-200"
        >
          {micOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          activeColor="bg-emerald-100 text-emerald-600 border-emerald-200"
          inactiveColor="bg-gray-100 text-gray-500 border-gray-200"
        >
          {camOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </DockButton>

        {/* Screen Share */}
        <DockButton
          active={screenShare}
          onClick={toggleScreen}
          label={screenShare ? "Stop Sharing" : "Share Screen"}
          activeColor="bg-blue-100 text-blue-600 border-blue-200"
          inactiveColor="bg-gray-100 text-gray-500 border-gray-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </DockButton>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Lock Room */}
        <DockButton
          active={false}
          onClick={handleLockRoom}
          label="Lock Room"
          activeColor=""
          inactiveColor="bg-gray-100 text-gray-500 border-gray-200"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </DockButton>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Player count */}
        <div className="flex items-center gap-1.5 px-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-gray-600">{playerCount}</span>
        </div>
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
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
        active ? activeColor : inactiveColor
      }`}
    >
      {children}
    </button>
  );
}
