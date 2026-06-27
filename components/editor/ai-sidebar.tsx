"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Bot, Sparkles, Send, FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("architect");
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState<boolean>(false);
  const [specGenerated, setSpecGenerated] = useState<boolean>(true); // default to true to show demo card

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "architect") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  // Handle textarea height auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 72),
        160
      )}px`;
    }
  };

  const handleSendMessage = useCallback((textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Clear input and reset textarea height if sending from textarea
    if (!textToSend) {
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "72px";
      }
    }

    const userMessageId = crypto.randomUUID();
    const newUserMessage: Message = {
      id: userMessageId,
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let replyText = "";
      const query = text.toLowerCase();

      if (query.includes("e-commerce")) {
        replyText =
          "I've designed an e-commerce backend architecture for you. I recommend incorporating:\n\n1. **API Gateway**: Unified ingress point for client services.\n2. **Auth Service**: Session & entitlement mapping using Clerk.\n3. **Product Catalog**: Read-optimized index for search.\n4. **Order Processor**: Orchestrates carts and payment capture via Stripe.\n\nLet me know if you would like me to map these nodes onto the canvas.";
      } else if (query.includes("chat app")) {
        replyText =
          "Here is a scalable architecture for a collaborative chat system:\n\n1. **WS Gateway**: Manages stateful WebSocket sessions.\n2. **PubSub Broker**: Redis/KeyDB instance to broadcast events across nodes.\n3. **Presence Manager**: Tracks active users in rooms.\n4. **Message Store**: PostgreSQL with partition schemes for chat histories.\n\nShould I render this topology in your active workspace?";
      } else if (query.includes("ci/cd")) {
        replyText =
          "I suggest the following workflow architecture for your CI/CD pipeline:\n\n1. **Webhook Event Ingress**: Validates repository commits.\n2. **Orchestrator Node**: Enqueues pipeline steps into an execution queue.\n3. **Runner Pool**: Autoscaling nodes that build and test containers.\n4. **Secure Registry**: Stores validated image artifacts.\n\nWould you like me to draft this pipeline on the canvas?";
      } else {
        replyText = `I've analyzed your prompt: "${text}". I can assist you in generating custom system nodes, databases, or connection lines to reflect this system design. \n\nWhat component should we build out first?`;
      }

      const newAssistantMessage: Message = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      setIsTyping(false);
    }, 1000);
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateSpec = () => {
    setIsGeneratingSpec(true);
    setTimeout(() => {
      setIsGeneratingSpec(false);
      setSpecGenerated(true);
    }, 1500);
  };

  const starterChips = [
    "Design an e-commerce backend",
    "Create a chat app architecture",
    "Build a CI/CD pipeline",
  ];

  return (
    <aside
      className={cn(
        "fixed right-0 top-14 bottom-0 z-30 w-80 border-l border-default bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-2xl shadow-black/50 select-none",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      aria-label="AI Assistant sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-default shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent-ai-text" />
          <div>
            <h2 className="text-sm font-semibold text-copy-primary uppercase tracking-wider font-mono">
              AI Workspace
            </h2>
            <p className="text-[10px] text-copy-muted font-mono mt-0.5">
              Collaborate with Ghost AI
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="hover:bg-subtle text-copy-muted hover:text-copy-primary transition-colors rounded-lg"
          aria-label="Close AI sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 pt-3 shrink-0">
          <TabsList className="grid grid-cols-2 bg-base border border-default/60 p-1 rounded-full w-full h-9">
            <TabsTrigger
              value="architect"
              className={cn(
                "group/trigger h-full text-xs rounded-full gap-2 transition-all duration-300 cursor-pointer select-none border border-transparent",
                "text-copy-muted hover:text-copy-primary hover:bg-subtle/20",
                "data-active:bg-subtle data-active:text-copy-primary data-active:border-subtle-border/40 data-active:shadow-[0_2px_8px_rgba(0,0,0,0.35)]",
                "dark:data-active:bg-subtle dark:data-active:text-copy-primary dark:data-active:border-subtle-border/40"
              )}
            >
              <Sparkles className="size-3.5 transition-colors duration-300 text-copy-muted group-hover/trigger:text-copy-primary group-data-active/trigger:text-accent-ai-text" />
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className={cn(
                "group/trigger h-full text-xs rounded-full gap-2 transition-all duration-300 cursor-pointer select-none border border-transparent",
                "text-copy-muted hover:text-copy-primary hover:bg-subtle/20",
                "data-active:bg-subtle data-active:text-copy-primary data-active:border-subtle-border/40 data-active:shadow-[0_2px_8px_rgba(0,0,0,0.35)]",
                "dark:data-active:bg-subtle dark:data-active:text-copy-primary dark:data-active:border-subtle-border/40"
              )}
            >
              <FileText className="size-3.5 transition-colors duration-300 text-copy-muted group-hover/trigger:text-copy-primary group-data-active/trigger:text-accent-ai-text" />
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content: AI Architect */}
        <TabsContent
          value="architect"
          className="flex-1 flex flex-col overflow-hidden outline-none p-0"
        >
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              // Empty State
              <div className="h-full flex flex-col justify-center items-center text-center px-2 py-4 space-y-4 animate-fade-in">
                <div className="p-4 rounded-full bg-accent-ai/10 border border-accent-ai/20 text-accent-ai-text animate-pulse shadow-[0_0_20px_rgba(100,87,249,0.08)]">
                  <Bot className="h-8 w-8" />
                </div>
                <div className="space-y-1 max-w-[220px]">
                  <h3 className="text-sm font-semibold text-copy-primary">
                    Design with Ghost AI
                  </h3>
                  <p className="text-xs text-copy-muted leading-relaxed">
                    Describe your system architecture to generate diagrams in real-time.
                  </p>
                </div>
                <div className="w-full pt-4 space-y-2 max-w-[240px]">
                  {starterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="w-full text-left px-3 py-2 text-xs rounded-xl bg-subtle hover:bg-subtle/80 text-accent-ai-text border border-default hover:border-accent-ai/30 transition-all cursor-pointer font-medium truncate"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Message List
              <div className="space-y-3">
                {messages.map((message) => {
                  const isUser = message.sender === "user";
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-full",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "px-3 py-2 text-xs rounded-2xl leading-relaxed whitespace-pre-line max-w-[85%] font-medium",
                          isUser
                            ? "bg-accent-primary-dim border border-accent-primary/20 text-copy-primary rounded-tr-none text-left"
                            : "bg-subtle border border-default text-copy-primary rounded-tl-none text-left"
                        )}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-subtle border border-default text-copy-muted px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-ai animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-ai animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-ai animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input Container */}
          <div className="p-3 border-t border-default bg-surface/80 backdrop-blur-sm shrink-0 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Prompt AI Architect..."
              className="flex-1 min-h-[72px] max-h-[160px] resize-none bg-base border border-default focus:border-brand/40 focus:ring-1 focus:ring-brand/40 rounded-xl px-3 py-2 text-xs text-copy-primary placeholder-copy-muted outline-none transition-all scrollbar-none"
              style={{ height: "72px" }}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              size="icon"
              className="bg-accent-ai hover:bg-accent-ai/90 text-white rounded-xl h-10 w-10 shrink-0 shadow-lg shadow-accent-ai/10 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Tab Content: Specs */}
        <TabsContent
          value="specs"
          className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 outline-none"
        >
          <Button
            onClick={handleGenerateSpec}
            disabled={isGeneratingSpec}
            className="w-full bg-accent-ai hover:bg-accent-ai/90 text-white py-2.5 h-11 rounded-xl shadow-lg shadow-accent-ai/10 transition-all font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isGeneratingSpec ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Canvas...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Spec
              </>
            )}
          </Button>

          {specGenerated && (
            <div className="bg-subtle border border-default rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-accent-ai/10 border border-accent-ai/20 text-accent-ai-text">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-copy-primary truncate">
                    system-spec-active.md
                  </h4>
                  <p className="text-[10px] text-copy-muted mt-0.5">
                    Generated from current canvas graph
                  </p>
                </div>
              </div>

              {/* Code Snippet Preview */}
              <div className="bg-base border border-default/50 rounded-lg p-2 font-mono text-[9px] text-copy-muted overflow-hidden h-24 select-text">
                <div className="text-accent-ai-text font-semibold"># System Architecture Specification</div>
                <div className="text-copy-primary mt-1">## 1. Executive Summary</div>
                <div>This document outlines the distributed system architecture defined on the canvas.</div>
                <div className="text-copy-primary mt-2">## 2. Components</div>
                <div>- API Gateway (auth-gateway)</div>
                <div>- Order Service (order-runner)</div>
              </div>

              {/* Download Action */}
              <Button
                disabled
                variant="outline"
                size="sm"
                className="w-full text-xs gap-2 rounded-lg border-default text-copy-muted font-medium mt-1 hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" />
                Download Spec
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
