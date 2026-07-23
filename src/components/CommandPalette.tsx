"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Bot, Code, Home, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">
        <Command
          className="w-full flex flex-col"
          loop
        >
          <Command.Input 
            autoFocus
            className="w-full bg-transparent p-4 text-white outline-none placeholder:text-gray-500 border-b border-white/10" 
            placeholder="Type a command or search..." 
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 py-3 text-xs font-medium text-gray-500">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/"))}
                className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-gray-300 hover:bg-white/10 data-[selected=true]:bg-white/10 data-[selected=true]:text-white transition-colors mt-1"
              >
                <Home className="h-4 w-4" /> Home
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("#projects"))}
                className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-gray-300 hover:bg-white/10 data-[selected=true]:bg-white/10 data-[selected=true]:text-white transition-colors mt-1"
              >
                <Code className="h-4 w-4" /> Projects
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/admin/index.html"))}
                className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-gray-300 hover:bg-white/10 data-[selected=true]:bg-white/10 data-[selected=true]:text-white transition-colors mt-1"
              >
                <User className="h-4 w-4" /> Admin Dashboard (CMS)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="AI Integration" className="px-2 py-3 text-xs font-medium text-gray-500">
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  // Focus the chat input
                  const chatInput = document.querySelector('input[placeholder="Ask about my experience..."]') as HTMLInputElement;
                  if (chatInput) {
                    setTimeout(() => chatInput.focus(), 100);
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm text-gray-300 hover:bg-white/10 data-[selected=true]:bg-white/10 data-[selected=true]:text-white transition-colors mt-1"
              >
                <Bot className="h-4 w-4" /> Ask my AI Assistant
              </Command.Item>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
      
      {/* Background click to close */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={() => setOpen(false)} 
      />
    </div>
  );
}
