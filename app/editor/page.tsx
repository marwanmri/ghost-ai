"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Terminal, 
  Layers, 
  Settings, 
  Play, 
  CheckCircle,
  FolderKanban
} from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [textareaText, setTextareaText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Editor chrome states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  return (
    <div className="relative min-h-screen flex flex-col bg-base text-copy-primary overflow-hidden font-sans">
      {/* Editor Chrome Top Navbar */}
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Editor Chrome Left Sidebar */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onClickNewProject={() => setNewProjectDialogOpen(true)}
      />

      {/* Reusable Dialog Pattern Verification */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="bg-elevated border border-surface-border rounded-3xl max-w-md p-6 backdrop-blur-md">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-copy-primary tracking-wide">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-copy-muted">
              Initialize a new system architecture design space. Choose a name to get started.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <label className="text-xs text-copy-muted uppercase tracking-wider font-mono">
              Project Name
            </label>
            <Input
              placeholder="e.g. E-Commerce Microservices"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-base border-surface-border text-copy-primary placeholder-copy-muted focus:border-brand/40 focus:ring-1 focus:ring-brand/40"
            />
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              onClick={() => setNewProjectDialogOpen(false)} 
              className="hover:bg-subtle text-copy-muted hover:text-copy-primary"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                alert(`Mock Project "${projectName || "Untitled Project"}" created!`);
                setProjectName("");
                setNewProjectDialogOpen(false);
              }} 
              className="bg-brand text-base hover:bg-brand/90 font-medium"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workspace Area */}
      <main className="flex-1 relative overflow-y-auto p-6 md:p-10 select-none">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-ai/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in relative z-10">
          {/* Dashboard Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-copy-primary">
                Workspace Dashboard
              </h1>
              <p className="text-sm text-copy-muted font-mono">
                Editor Chrome & Design System Showcase
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-dim text-brand border border-brand/20">
                <CheckCircle className="h-3 w-3" /> Chrome Active
              </span>
            </div>
          </header>

          {/* Interactive Toggle Showcase Callout */}
          <div className="p-4 rounded-2xl bg-surface border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-copy-primary flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-brand animate-pulse" /> Try the Projects Sidebar
              </h3>
              <p className="text-xs text-copy-muted">
                Click the top-left icon in the navbar to open/close the projects list overlay.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="border-surface-border hover:bg-subtle text-copy-primary self-start md:self-auto text-xs"
            >
              {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            </Button>
          </div>

          {/* Core Showcase via Tabs */}
          <Tabs defaultValue="components" className="w-full space-y-6">
            <TabsList className="bg-surface border border-surface-border p-1 rounded-xl w-full md:w-auto flex">
              <TabsTrigger value="components" className="flex-1 md:flex-initial gap-2 px-4 py-2 text-sm font-medium">
                <Layers className="h-4 w-4" /> Primitives
              </TabsTrigger>
              <TabsTrigger value="canvas" className="flex-1 md:flex-initial gap-2 px-4 py-2 text-sm font-medium">
                <Terminal className="h-4 w-4" /> Console & Logs
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 md:flex-initial gap-2 px-4 py-2 text-sm font-medium">
                <Settings className="h-4 w-4" /> System Info
              </TabsTrigger>
            </TabsList>

            {/* Primitives Tab */}
            <TabsContent value="components" className="space-y-8 outline-none">
              {/* Grid layout for buttons & inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card 1: Buttons showcase */}
                <Card className="bg-surface border-surface-border rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-copy-primary">Buttons</CardTitle>
                    <CardDescription className="text-copy-muted">
                      Composition of standard shadcn button variants mapped to design tokens.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="default" className="gap-2">
                      <Play className="h-4 w-4" /> Default Primary
                    </Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline" className="border-surface-border hover:bg-subtle text-copy-primary">
                      Outline Subdued
                    </Button>
                    <Button variant="destructive" className="bg-state-error text-white hover:bg-state-error/80">
                      Destructive Action
                    </Button>
                    <Button variant="ghost" className="hover:bg-subtle text-copy-muted hover:text-copy-primary">
                      Ghost Link
                    </Button>
                  </CardContent>
                  <CardFooter className="border-t border-surface-border pt-4 text-xs text-copy-muted font-mono">
                    Theme mappings: bg-brand, state-error, bg-subtle
                  </CardFooter>
                </Card>

                {/* Card 2: Interactive Dialog & Inputs */}
                <Card className="bg-surface border-surface-border rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-copy-primary">Inputs & Modals</CardTitle>
                    <CardDescription className="text-copy-muted">
                      Test text inputs, reactive bindings, and custom styled dialog overlays.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-copy-muted uppercase tracking-wider font-mono">
                        Visual Text Input
                      </label>
                      <Input
                        placeholder="Type something..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="bg-base border-surface-border text-copy-primary placeholder-copy-muted focus:border-brand/40 focus:ring-1 focus:ring-brand/40"
                      />
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger render={
                        <Button variant="outline" className="w-full border-surface-border hover:bg-subtle text-copy-primary">
                          Open Dialog Pattern
                        </Button>
                      } />
                      <DialogContent className="bg-elevated border border-surface-border rounded-3xl max-w-md p-6 backdrop-blur-md">
                        <DialogHeader className="space-y-2">
                          <DialogTitle className="text-xl text-copy-primary tracking-wide">
                            Workspace Confirmation
                          </DialogTitle>
                          <DialogDescription className="text-copy-muted">
                            This is a demo dialog verifying overlay styling, dark elevated background, and the 3xl border-radius system boundaries.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 font-mono text-sm text-brand bg-base p-4 rounded-xl border border-surface-border/50">
                          Input state: &quot;{inputText || "Empty input"}&quot;
                        </div>
                        <DialogFooter className="flex gap-2 justify-end">
                          <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-subtle text-copy-muted">
                            Cancel
                          </Button>
                          <Button onClick={() => setDialogOpen(false)} className="bg-brand text-base hover:bg-brand/90 font-medium">
                            Accept Spec
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                  <CardFooter className="border-t border-surface-border pt-4 text-xs text-copy-muted font-mono">
                    Dialog mapping: bg-elevated, rounded-3xl
                  </CardFooter>
                </Card>
              </div>

              {/* Full-width block: Textarea */}
              <Card className="bg-surface border-surface-border rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-copy-primary">System Description (Textarea)</CardTitle>
                  <CardDescription className="text-copy-muted">
                    Used for specifying prompt templates. Verifies focus rings and text flow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe your microservices architecture..."
                    value={textareaText}
                    onChange={(e) => setTextareaText(e.target.value)}
                    rows={4}
                    className="bg-base border-surface-border text-copy-primary placeholder-copy-muted focus:border-brand/40 focus:ring-1 focus:ring-brand/40"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Console & Logs */}
            <TabsContent value="canvas" className="space-y-6 outline-none">
              <Card className="bg-surface border-surface-border rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-copy-primary flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-brand" /> Scroll Area Console Logs
                  </CardTitle>
                  <CardDescription className="text-copy-muted">
                    Scrolling through continuous task status output with customized system scrollbars.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72 w-full rounded-xl border border-surface-border bg-base p-4 font-mono text-xs text-copy-muted">
                    <div className="space-y-2">
                      <p className="text-brand">[SYSTEM] Initializing design workspace container...</p>
                      <p className="text-state-success">[SUCCESS] Tailwind configurations injected successfully</p>
                      <p className="text-copy-primary">[INFO] Loaded project &apos;Ghost Canvas 01&apos;</p>
                      <p className="text-copy-muted">[VERBOSE] Connected to Liveblocks room &apos;project-room-1&apos;</p>
                      <p className="text-accent-ai-text">[AI] Initializing architecture generation worker...</p>
                      <p className="text-copy-muted">[VERBOSE] Querying remote schema versions</p>
                      <p className="text-state-warning">[WARNING] Clerk authentication token expiring in 15m</p>
                      <p className="text-copy-muted">[VERBOSE] Performing background garbage collection</p>
                      <p className="text-copy-muted">[VERBOSE] Rendered 12 system nodes and 8 connectors</p>
                      <p className="text-copy-muted">[VERBOSE] Serializing snapshot to database blob storage...</p>
                      <p className="text-state-success">[SUCCESS] Stored snapshot canvas_123.json in Vercel Blob</p>
                      <p className="text-brand">[SYSTEM] Server status verification complete</p>
                      <p className="text-copy-muted">[VERBOSE] Awaiting prompt requests from clients</p>
                      <p className="text-copy-muted">[VERBOSE] Keepalive heartbeat ping sent (RTT: 4ms)</p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 outline-none">
              <Card className="bg-surface border-surface-border rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-copy-primary">System Information</CardTitle>
                  <CardDescription className="text-copy-muted">
                    Checking active CSS variable references and build constraints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-base border border-surface-border rounded-xl">
                      <p className="text-copy-muted mb-1">Base BG</p>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-base border border-surface-border" />
                        <span className="text-copy-primary">#080809</span>
                      </div>
                    </div>
                    <div className="p-3 bg-base border border-surface-border rounded-xl">
                      <p className="text-copy-muted mb-1">Surface BG</p>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-surface border border-surface-border" />
                        <span className="text-copy-primary">#111114</span>
                      </div>
                    </div>
                    <div className="p-3 bg-base border border-surface-border rounded-xl">
                      <p className="text-copy-muted mb-1">Brand Accent</p>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-brand" />
                        <span className="text-copy-primary">#00c8d4</span>
                      </div>
                    </div>
                    <div className="p-3 bg-base border border-surface-border rounded-xl">
                      <p className="text-copy-muted mb-1">AI Purple</p>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-accent-ai" />
                        <span className="text-copy-primary">#6457f9</span>
                      </div>
                    </div>
                    <div className="p-3 bg-base border border-surface-border rounded-xl">
                      <p className="text-copy-muted mb-1">State Error</p>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-state-error" />
                        <span className="text-copy-primary">#ff4d4f</span>
                      </div>
                    </div>
                    <div className="p-3 bg-base border border-surface-border rounded-xl">
                      <p className="text-copy-muted mb-1">State Success</p>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-state-success" />
                        <span className="text-copy-primary">#34d399</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
