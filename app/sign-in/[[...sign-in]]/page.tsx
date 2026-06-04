import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-base text-copy-primary">
      {/* Left panel: Info/Tagline (visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-surface border-r border-default select-none">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-sans font-extrabold tracking-wider text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              GHOST AI
            </span>
          </div>
          
          {/* Tagline & Features */}
          <div className="mt-20 space-y-6 max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-copy-primary leading-tight">
              Real-time collaborative system design workspace.
            </h1>
            <p className="text-copy-muted text-sm leading-relaxed">
              Describe your system in plain English, map it onto a shared canvas, collaborate in real-time, and generate technical specifications automatically.
            </p>
            
            <ul className="space-y-4 pt-4 text-sm font-mono text-copy-muted">
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Describe architecture in plain English
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Collaborate in real-time on a shared canvas
              </li>
              <li className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Generate markdown specifications from your graph
              </li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-copy-muted font-mono">
          &copy; {new Date().getFullYear()} Ghost AI. All rights reserved.
        </div>
      </div>

      {/* Right panel: SignIn Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-base">
        <SignIn />
      </div>
    </div>
  );
}
