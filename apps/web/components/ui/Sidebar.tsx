"use client";

import { useState, useRef, useEffect } from "react";

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

export default function Sidebar({
  players,
  sessionId,
  onSendChat,
  localPlayerName,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"people" | "chat" | "schedule">("people");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === "chat") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

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
    onSendChat(input.trim(), "general");
    setInput("");
  };

  return (
    <div className="flex h-full w-[340px] bg-[#f7f7f9] shadow-sm">
      {/* Left Icon Rail */}
      <div className="w-[60px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-3 z-10">
        <div className="mb-4 h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
          GC
        </div>
        
        <NavButton active={activeTab === "people"} onClick={() => setActiveTab("people")} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        } />
        
        <NavButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        } />
        
        <NavButton active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        } />

        <div className="flex-1" />
        
        <NavButton active={false} onClick={() => {}} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        } />
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfb] border-r border-gray-200 z-0">
        
        {/* PEOPLE PANEL */}
        {activeTab === "people" && (
          <div className="flex flex-col h-full">
            <div className="px-5 py-5 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-lg mb-4 tracking-tight">GatherCraft</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search people" 
                  className="w-full bg-gray-100 rounded-md py-2.5 pl-3 pr-10 text-sm text-gray-700 outline-none focus:ring-1 focus:ring-gray-300 transition"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-[10px] font-bold tracking-wider">CTRL F</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Meetings Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1 cursor-pointer hover:text-gray-700">
                  Meetings
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm transition hover:shadow-md cursor-pointer">
                  <h4 className="font-semibold text-sm text-gray-800 truncate">Daily Standup</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Tea Huddle</p>
                  <div className="mt-3 flex -space-x-1">
                     <div className="h-6 w-6 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[10px] font-bold text-blue-700">Y</div>
                     <div className="h-6 w-6 rounded-full bg-pink-100 border border-white flex items-center justify-center text-[10px] font-bold text-pink-700">A</div>
                  </div>
                </div>
              </div>

              {/* Online Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1 cursor-pointer hover:text-gray-700">
                  Online ({players.size + 1})
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </h3>
                <div className="space-y-4">
                  {/* Local Player */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {localPlayerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 leading-tight">{localPlayerName} (You)</h4>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Available
                      </p>
                    </div>
                  </div>

                  {/* Remote Players */}
                  {Array.from(players.values()).map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 leading-tight">{p.name}</h4>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          In a meeting
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAT PANEL */}
        {activeTab === "chat" && (
          <div className="flex h-full flex-col">
            <div className="px-5 py-5 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-lg tracking-tight">Nearby Chat</h2>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
                  <p className="text-sm font-medium text-gray-500">No messages yet.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.name === localPlayerName;
                const prevMsg = messages[i - 1];
                const isGroup = prevMsg && prevMsg.name === msg.name && msg.timestamp - prevMsg.timestamp < 60000;
                
                return (
                  <div key={msg.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isGroup ? 'mt-1' : 'mt-5'}`}>
                    <div className={`group flex gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isGroup ? (
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${isMe ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-7 shrink-0" />
                      )}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isGroup && (
                          <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-xs font-bold text-gray-900">
                              {isMe ? 'You' : msg.name}
                            </span>
                            <span className="text-[9px] font-medium text-gray-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                        <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          isMe ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message nearby..."
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-3 pr-10 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SCHEDULE PANEL */}
        {activeTab === "schedule" && (
           <div className="flex h-full flex-col p-6 items-center justify-center text-center">
             <h3 className="text-lg font-bold text-gray-800 mb-2">Schedule</h3>
             <p className="text-sm text-gray-500 mb-6 max-w-[200px]">Connect your Google Calendar to see upcoming meetings here.</p>
             <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Connect Google Calendar</button>
           </div>
        )}

      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`relative h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
        active ? "bg-[#eaf1ff] text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-indigo-600 rounded-r-full" />}
      {icon}
    </button>
  );
}
