import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      <div className="w-full max-w-[1400px] h-full max-h-[900px] flex gap-6 relative z-10">

        {/* Left Card: Sidebar */}
        <div className="hidden md:block w-[280px] h-full glass-panel rounded-[2rem] overflow-hidden">
          <Sidebar />
        </div>

        {/* Right Card: Chat Interface */}
        <main className="flex-1 h-full glass-panel rounded-[2rem] overflow-hidden backdrop-blur-sm">
          <ChatInterface />
        </main>
      </div>
    </div>
  );
}
