import { Link, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { useAuthStore } from '@/store/authStore';

export function Dashboard() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/inbox" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#0A0A0A] overflow-x-hidden relative font-['Space_Grotesk',sans-serif]">
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      
      <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-[#10F9A0] opacity-20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-40 left-20 w-[500px] h-[500px] bg-[#FF6B6B] opacity-15 rounded-full blur-3xl animate-blob [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-[#C77DFF] opacity-10 rounded-full blur-3xl animate-blob [animation-delay:4s]" />
      <div className="absolute top-[60%] right-[20%] w-[350px] h-[350px] bg-[#10F9A0] opacity-10 rounded-full blur-3xl animate-blob [animation-delay:6s]" />

      <Navigation />

      <div className="relative z-10 overflow-hidden whitespace-nowrap border-y-2 border-[#0A0A0A] bg-[#10F9A0] py-3 mb-16 mt-8">
        <div className="animate-marquee inline-block">
          <span className="text-sm font-bold tracking-wider mx-8">✦ AI-POWERED EMAIL INTELLIGENCE</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ SMART AUTO-REPLIES</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ CONTEXT-AWARE SUMMARIES</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ PRIORITY INBOX WITH ML</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ AI-POWERED EMAIL INTELLIGENCE</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ SMART AUTO-REPLIES</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ CONTEXT-AWARE SUMMARIES</span>
          <span className="text-sm font-bold tracking-wider mx-8">✦ PRIORITY INBOX WITH ML</span>
        </div>
      </div>

      <section className="container mx-auto px-8 py-12 relative z-10">
        <div className="max-w-5xl mx-auto text-left">
          <div className="mb-8">
            <h1 className="font-['Instrument_Serif',serif] text-[clamp(3rem,8vw,7rem)] leading-[0.95] italic mb-6">
              Email that feels{' '}
              <span className="relative inline-block after:content-[''] after:absolute after:left-[-2%] after:bottom-[-8px] after:w-[104%] after:h-[12px] after:bg-[url('data:image/svg+xml,%3Csvg%20width=%27100%25%27%20height=%2712%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M0%208%20Q%2025%202,%2050%206%20T%20100%208%20T%20150%206%20T%20200%208%20T%20250%206%20T%20300%208%20T%20350%206%20T%20400%208%20T%20450%206%20T%20500%208%27%20stroke=%27%2310F9A0%27%20stroke-width=%273%27%20fill=%27none%27/%3E%3C/svg%3E')] after:bg-repeat-x">human</span>
              <br />
              again.
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl opacity-80 leading-relaxed">
              AI that actually helps. Not the annoying kind that writes like a robot.
              Real intelligence that understands context, tone, and urgency.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="flex gap-6 items-center flex-wrap mb-24">
              <Link
                to="/login"
                className="group relative px-10 py-5 bg-[#0A0A0A] text-[#FFF8F0] rounded-3xl font-bold text-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl inline-block overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-br before:from-[#10F9A0] before:via-[#FF6B6B] before:to-[#C77DFF] before:-z-10 before:blur-sm before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                Start Your Journey →
              </Link>
              <a
                href="#features"
                className="px-10 py-5 border-2 border-[#0A0A0A] rounded-3xl font-bold text-lg hover:bg-[#0A0A0A] hover:text-[#FFF8F0] transition-all duration-300 inline-block"
              >
                Explore Features
              </a>
            </div>
          )}

          {isAuthenticated && (
            <Link
              to="/inbox"
              className="px-10 py-5 bg-[#0A0A0A] text-[#FFF8F0] rounded-3xl font-bold text-lg hover:scale-105 transition-all duration-300 inline-block mb-24"
            >
              Go to Inbox →
            </Link>
          )}
        </div>
      </section>

      <section className="container mx-auto px-8 py-8 relative z-10">
        <div className="mb-16 max-w-3xl">
          <h2 className="font-['Instrument_Serif',serif] text-5xl md:text-6xl italic mb-4">
            AI that gets it.
          </h2>
          <p className="text-lg opacity-70">
            Not your typical "AI features" checklist. Real intelligence that makes email feel effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr mb-12">
          <div className="md:col-span-7 md:row-span-2 bg-gradient-to-br from-[#10F9A0]/20 to-[#10F9A0]/5 border-2 border-[#0A0A0A] rounded-[2rem] p-10 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)] shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 w-12 h-12 bg-[#10F9A0] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-8 left-8 w-8 h-8 bg-[#10F9A0] rounded-full animate-pulse-slow [animation-delay:1s]" />
            
            <div className="w-16 h-16 bg-[#10F9A0] rounded-2xl flex items-center justify-center mb-6 rotate-6 shadow-lg">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-4xl italic mb-4">
              Smart Email Summaries
            </h3>
            <p className="text-base opacity-80 leading-relaxed mb-6">
              AI that reads your long email threads and gives you the TL;DR you actually need. 
              Understands context, tracks decisions, and highlights what matters. No more scrolling through 47 replies.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#10F9A0] text-2xl mt-1 flex-shrink-0">✓</span>
                <span className="text-sm font-medium">Instant thread summaries with key decisions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#10F9A0] text-2xl mt-1 flex-shrink-0">✓</span>
                <span className="text-sm font-medium">Sentiment analysis (is this urgent or passive-aggressive?)</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#10F9A0] text-2xl mt-1 flex-shrink-0">✓</span>
                <span className="text-sm font-medium">Action items extracted automatically</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#10F9A0] text-2xl mt-1 flex-shrink-0">✓</span>
                <span className="text-sm font-medium">Smart follow-up detection</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-white border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)] shadow-lg">
            <div className="w-14 h-14 bg-[#FF6B6B] rounded-2xl flex items-center justify-center mb-6 -rotate-6 shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-3xl italic mb-3">
              Auto-Reply Magic
            </h3>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              AI drafts replies that sound like you, not a corporate drone. Learns your writing style, 
              tone, and common responses. Edit if you want, send as-is if you don't care.
            </p>
            <div className="bg-[#FFF8F0] border border-[#0A0A0A]/10 rounded-xl p-3 text-xs font-mono">
              <div className="text-[#10F9A0] mb-1">// AI suggested reply</div>
              <div className="opacity-70">Hey! Yeah, that works for me. Let's sync up Thursday at 2pm?</div>
            </div>
          </div>

          <div className="md:col-span-5 bg-gradient-to-br from-[#C77DFF]/20 to-[#C77DFF]/5 border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(199,125,255,0.15)] shadow-lg">
            <div className="w-14 h-14 bg-[#C77DFF] rounded-2xl flex items-center justify-center mb-6 rotate-12 shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-3xl italic mb-3">
              Priority Inbox
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              ML algorithms that learn what's actually important to you. Not what some algorithm thinks is important. 
              Your inbox, sorted by real urgency.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)] shadow-lg">
            <div className="w-12 h-12 bg-[#10F9A0] rounded-xl flex items-center justify-center mb-4 -rotate-3 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-2xl italic mb-3">
              Tone Adjuster
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Write casually, send professionally. Or vice versa. AI adjusts your tone on the fly. 
              Angry email? We'll calm it down.
            </p>
          </div>

          <div className="bg-[#FFE5D9] border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,107,107,0.15)] shadow-lg">
            <div className="w-12 h-12 bg-[#FF6B6B] rounded-xl flex items-center justify-center mb-4 rotate-6 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-2xl italic mb-3">
              Smart Labels
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              AI automatically categorizes emails by project, person, urgency. Never manually sort again.
            </p>
          </div>

          <div className="bg-white border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)] shadow-lg">
            <div className="w-12 h-12 bg-[#10F9A0] rounded-xl flex items-center justify-center mb-4 rotate-3 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-2xl italic mb-3">
              Send Later (Smart)
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              AI suggests optimal send times based on recipient behavior. Stop waking people up with 3am emails.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-8 py-16 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="font-['Instrument_Serif',serif] text-5xl md:text-6xl italic mb-4">
            Security that doesn't compromise.
          </h2>
          <p className="text-lg opacity-70 max-w-2xl mx-auto">
            AI features are great, but not at the cost of your privacy. Everything encrypted, nothing shared.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <div className="md:col-span-6 bg-[#0A0A0A] text-[#FFF8F0] border-2 border-[#0A0A0A] rounded-[2rem] p-10 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.3)] shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#10F9A0]/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#FF6B6B]/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="w-16 h-16 bg-[#10F9A0] rounded-2xl flex items-center justify-center mb-6 -rotate-6 shadow-lg">
                <svg className="w-8 h-8 text-[#0A0A0A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-['Instrument_Serif',serif] text-3xl italic mb-4">
                End-to-End Encryption
              </h3>
              <p className="text-base opacity-90 leading-relaxed mb-6">
                Your emails are encrypted before they leave your device. We literally can't read them. 
                AI processing happens on encrypted data. Zero-knowledge architecture means zero compromises.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-[#10F9A0] rounded-full" />
                  <span className="opacity-90">AES-256 encryption at rest</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-[#10F9A0] rounded-full" />
                  <span className="opacity-90">TLS 1.3 for data in transit</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-[#10F9A0] rounded-full" />
                  <span className="opacity-90">GDPR & SOC 2 compliant</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 bg-white border-2 border-[#0A0A0A] rounded-[2rem] p-10 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)] shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#C77DFF] rounded-2xl flex items-center justify-center mb-6 rotate-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-['Instrument_Serif',serif] text-3xl italic mb-4">
              OAuth 2.0 & Multi-Factor
            </h3>
            <p className="text-base opacity-80 leading-relaxed mb-6">
              One-click Google Sign-In, automatic token refresh, secure session management. 
              Add 2FA if you're paranoid (we respect that).
            </p>
            <div className="bg-[#FFF8F0] border border-[#0A0A0A]/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#10F9A0] rounded-lg flex items-center justify-center text-xs font-bold">G</div>
                <span className="text-sm font-medium">Google OAuth</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center text-xs font-bold">2FA</div>
                <span className="text-sm font-medium">Two-Factor Auth</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C77DFF] rounded-lg flex items-center justify-center text-xs font-bold">JWT</div>
                <span className="text-sm font-medium">Secure Tokens</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-8 py-16 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="font-['Instrument_Serif',serif] text-5xl md:text-6xl italic mb-4">
            UX that feels intentional.
          </h2>
          <p className="text-lg opacity-70 max-w-2xl mx-auto">
            Every interaction designed to reduce friction, not add it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-[#10F9A0]/20 to-white border-2 border-[#0A0A0A] rounded-[2rem] p-6 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)]">
            <div className="text-3xl mb-3 animate-float">⚡</div>
            <h3 className="font-['Instrument_Serif',serif] text-xl italic mb-2">
              Instant Search
            </h3>
            <p className="text-sm opacity-80">
              ⌘K to search anything. Milliseconds fast.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#FF6B6B]/20 to-white border-2 border-[#0A0A0A] rounded-[2rem] p-6 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,107,107,0.15)]">
            <div className="text-3xl mb-3 animate-float [animation-delay:0.5s]">🌙</div>
            <h3 className="font-['Instrument_Serif',serif] text-xl italic mb-2">
              Dark Mode
            </h3>
            <p className="text-sm opacity-80">
              Easy on the eyes, not an afterthought.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#C77DFF]/20 to-white border-2 border-[#0A0A0A] rounded-[2rem] p-6 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(199,125,255,0.15)]">
            <div className="text-3xl mb-3 animate-float [animation-delay:1s]">⌨️</div>
            <h3 className="font-['Instrument_Serif',serif] text-xl italic mb-2">
              Keyboard First
            </h3>
            <p className="text-sm opacity-80">
              Shortcuts for everything. Touchpad optional.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#10F9A0]/20 to-white border-2 border-[#0A0A0A] rounded-[2rem] p-6 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)]">
            <div className="text-3xl mb-3 animate-float [animation-delay:1.5s]">📱</div>
            <h3 className="font-['Instrument_Serif',serif] text-xl italic mb-2">
              Responsive AF
            </h3>
            <p className="text-sm opacity-80">
              Perfect on phone, tablet, desktop. Everywhere.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-8 py-16 relative z-10">
        <div className="mb-12">
          <h2 className="font-['Instrument_Serif',serif] text-5xl md:text-6xl italic mb-4">
            Real people love it.
          </h2>
          <p className="text-lg opacity-70">
            Not fake testimonials. Real users who switched and never looked back.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,249,160,0.15)]">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#10F9A0] text-xl">★</span>
              ))}
            </div>
            <p className="text-base mb-6 leading-relaxed italic opacity-90">
              "The AI summaries alone save me 2 hours a day. I can finally keep up with my inbox without wanting to throw my laptop."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#10F9A0] rounded-full flex items-center justify-center font-bold">
                SK
              </div>
              <div>
                <div className="font-medium text-sm">Thanh Vo</div>
                <div className="text-xs opacity-60">SWE</div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFE5D9] border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:-rotate-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(255,107,107,0.15)]">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#FF6B6B] text-xl">★</span>
              ))}
            </div>
            <p className="text-base mb-6 leading-relaxed italic opacity-90">
              "Finally, email that doesn't feel like a chore. The auto-replies are scary good—they sound exactly like me."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B6B] rounded-full flex items-center justify-center font-bold text-white">
                MR
              </div>
              <div>
                <div className="font-medium text-sm">Thang Nguyen</div>
                <div className="text-xs opacity-60">SWE</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#C77DFF]/20 to-white border-2 border-[#0A0A0A] rounded-[2rem] p-8 transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-3 hover:rotate-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(199,125,255,0.15)]">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#C77DFF] text-xl">★</span>
              ))}
            </div>
            <p className="text-base mb-6 leading-relaxed italic opacity-90">
              "Switched from Gmail last month. The priority inbox actually works. No more missing important emails buried in noise."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C77DFF] rounded-full flex items-center justify-center font-bold text-white">
                JL
              </div>
              <div>
                <div className="font-medium text-sm">Thao Luong</div>
                <div className="text-xs opacity-60">SWE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="container mx-auto px-8 py-24 relative z-10">
          <div className="max-w-4xl mx-auto bg-[#0A0A0A] text-[#FFF8F0] rounded-[3rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:rounded-[3rem] before:p-[3px] before:bg-gradient-to-br before:from-[#10F9A0] before:via-[#FF6B6B] before:to-[#C77DFF] before:-z-10 before:blur-lg">
            <div className="absolute top-8 right-8 w-24 h-24 bg-[#10F9A0]/20 rounded-full blur-2xl animate-pulse-slow" />
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-[#FF6B6B]/20 rounded-full blur-2xl animate-pulse-slow [animation-delay:1s]" />
            
            <h2 className="font-['Instrument_Serif',serif] text-5xl md:text-6xl italic mb-6 leading-tight relative">
              Ready to feel something?
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed relative">
              Join 10,000+ people who believe email doesn't have to be soul-crushing. 
              AI that helps, security that protects, design that delights.
            </p>
            <Link
              to="/login"
              className="inline-block px-12 py-6 bg-[#10F9A0] text-[#0A0A0A] rounded-3xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl relative"
            >
              Create Your Account →
            </Link>
            <p className="text-sm opacity-60 mt-6 relative">No credit card required. Free forever.</p>
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t-2 border-[#0A0A0A] mt-24 py-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="font-['Instrument_Serif',serif] text-2xl italic mb-2">TL;DR</div>
              <p className="text-sm opacity-60">
                Crafted with intention, not templates.
              </p>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#features" className="opacity-70 hover:opacity-100 transition-opacity">Features</a>
              <a href="#security" className="opacity-70 hover:opacity-100 transition-opacity">Security</a>
              <a href="#pricing" className="opacity-70 hover:opacity-100 transition-opacity">Pricing</a>
              <Link to="/login" className="opacity-70 hover:opacity-100 transition-opacity">Login</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-xs opacity-40">
            © 2026 TL;DR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
