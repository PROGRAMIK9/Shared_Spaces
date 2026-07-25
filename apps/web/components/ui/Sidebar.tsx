"use client";

import { useState, useRef, useEffect } from "react";
import LiveKitRoom from "../rtc/LiveKitRoom";

interface PlayerInfo {
  name: string;
  x: number;
  y: number;
  direction: string;
  animation: string;
  currentZone: string;
  isTabShifted: boolean;
}

interface ChatMessage {
  id: string;
  name: string;
  message: string;
  channel: string;
  timestamp: number;
}

interface SidebarProps {
  players: Map<string, PlayerInfo>;
  sessionId: string | null;
  onSendChat: (message: string, channel: string) => void;
  localPlayerName: string;
}

const CHANNELS = ["general", "engineering", "watercooler"];

export default function Sidebar({
  players,
  sessionId,
  onSendChat,
  localPlayerName,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "schedule">("chat");
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannel, activeTab]);

  useEffect(() => {
    const handleChat = (event: CustomEvent<ChatMessage>) => {
      setMessages((prev) => [...prev.slice(-200), event.detail]);
    };

    window.addEventListener(
      "colyseus-chat" as string,
      handleChat as EventListener
    );
    return () => {
      window.removeEventListener(
        "colyseus-chat" as string,
        handleChat as EventListener
      );
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendChat(input.trim(), activeChannel);
    setInput("");
  };

  const channelMessages = messages.filter((m) => m.channel === activeChannel);

  return (
    <div className="flex h-full w-full flex-col bg-white border-l border-gray-200">
      {/* Header with Tabs */}
      <div className="flex flex-col border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">Workspace</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            <span className="text-xs font-medium text-gray-600">
              {players.size + 1} Online
            </span>
          </div>
        </div>
        <div className="flex px-2 border-t border-gray-200">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider ${
              activeTab === "chat" ? "border-b-2 border-violet-600 text-violet-700" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Chat & Video
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider ${
              activeTab === "schedule" ? "border-b-2 border-violet-600 text-violet-700" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Schedule
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <>
            {/* Channel List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
              <div className="p-3">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Channels
                </h3>
                <div className="space-y-1">
                  {CHANNELS.map((channel) => (
                    <button
                      key={channel}
                      onClick={() => setActiveChannel(channel)}
                      className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors ${
                        activeChannel === channel
                          ? "bg-violet-100 text-violet-700"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-gray-400">#</span>
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Video
                </h3>
                <div className="flex flex-col gap-2">
                   <LiveKitRoom players={players} sessionId={sessionId} localPlayerName={localPlayerName} />
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex w-2/3 flex-col bg-white">
              {/* Chat Header */}
              <div className="border-b border-gray-100 px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  <span className="text-gray-400">#</span>
                  {activeChannel}
                </h3>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {channelMessages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
                      👋
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      Welcome to #{activeChannel}!
                    </p>
                  </div>
                )}
                
                {channelMessages.map((msg, i) => {
                  const isMe = msg.name === localPlayerName;
                  const prevMsg = channelMessages[i - 1];
                  const isGroup = prevMsg && prevMsg.name === msg.name && msg.timestamp - prevMsg.timestamp < 60000;
                  
                  return (
                    <div key={msg.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isGroup ? 'mt-1' : 'mt-4'}`}>
                      <div className={`group flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isGroup ? (
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${isMe ? 'bg-gradient-to-br from-violet-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                            {msg.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isGroup && (
                            <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="text-xs font-semibold text-gray-900">
                                {isMe ? 'You' : msg.name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                          <div className={`px-3 py-2 rounded-2xl text-sm ${
                            isMe 
                              ? 'bg-violet-600 text-white rounded-tr-sm' 
                              : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message #${activeChannel}`}
                    className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-200"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:bg-gray-300"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          /* Schedule Tab */
          <div className="flex w-full flex-col bg-gray-50 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Today's Schedule</h2>
            
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
              {/* Event 1 */}
              <div className="relative pl-6">
                <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                <div className="text-xs font-bold text-emerald-600 mb-1">09:00 AM</div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-semibold text-gray-800">Daily Standup</h3>
                  <p className="mt-1 text-xs text-gray-500">Meeting Room A • 15m</p>
                  <div className="mt-3 flex -space-x-2">
                    {["T", "S", "M"].map((initial, idx) => (
                      <div key={idx} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold text-gray-600">
                        {initial}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative pl-6">
                <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-violet-500 shadow-sm" />
                <div className="text-xs font-bold text-violet-600 mb-1">11:30 AM</div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-semibold text-gray-800">Product Sync</h3>
                  <p className="mt-1 text-xs text-gray-500">Meeting Room B • 45m</p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative pl-6">
                <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                <div className="text-xs font-bold text-blue-600 mb-1">02:00 PM</div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-semibold text-gray-800">Design Review</h3>
                  <p className="mt-1 text-xs text-gray-500">Focus Room C • 1h</p>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50">
              + Schedule New Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
