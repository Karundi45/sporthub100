import React, { useState } from "react";
import { Target, Lock, Mail, ArrowRight, Fingerprint, Chrome, CheckSquare, Square, User } from "lucide-react";

interface AuthViewProps {
  onLogin: (user: any) => void;
}

export function AuthView({ onLogin }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLogin && !acceptedTerms) {
      setError("Please accept the Terms and Conditions to create an account.");
      return;
    }
    if ((isLogin && email && password) || (!isLogin && email && username && password)) {
      setLoading(true);
      try {
        const body = isLogin 
          ? { identifier: email, password }
          : { username, email, password };
          
        const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        
        if (data.success) {
          onLogin(data.user);
        } else {
          if (Array.isArray(data.error)) {
            setError(data.error[0]?.message || "Invalid input provided");
          } else {
            setError(data.error || "Authentication failed");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen text-brand-text-primary px-4 relative bg-brand-bg"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(26, 28, 35, 0.75), rgba(26, 28, 35, 0.95)), url('https://images.unsplash.com/photo-1508344928928-7137b29de218?q=80&w=2000&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md bg-brand-surface p-8 rounded-[24px] border border-brand-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
        
        <div className="flex flex-col items-center mb-8 text-center relative z-10">
          <div className="w-16 h-16 bg-brand-accent-dim rounded-[20px] border border-brand-accent/20 flex flex-col items-center justify-center mb-6">
            <Target className="w-8 h-8 text-brand-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text-primary flex items-center gap-1 mb-2">
            SPORT<span className="text-brand-accent">HUB</span>
          </h1>
          <p className="text-brand-text-secondary text-sm">
            {isLogin ? "Welcome back. Continue your journey." : "Join the elite tracking community."}
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-4 relative z-10">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
              <input 
                type={isLogin ? "text" : "email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "Username or Email" : "Email Address"}
                className="w-full bg-brand-surface-light border border-brand-border rounded-[16px] py-4 pl-12 pr-4 text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm placeholder:text-brand-text-secondary"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username" 
                  className="w-full bg-brand-surface-light border border-brand-border rounded-[16px] py-4 pl-12 pr-4 text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm placeholder:text-brand-text-secondary"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full bg-brand-surface-light border border-brand-border rounded-[16px] py-4 pl-12 pr-4 text-brand-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent/50 transition-all text-sm placeholder:text-brand-text-secondary"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div 
              className="flex items-center gap-3 mt-4 cursor-pointer"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
            >
              <div className="text-brand-accent shrink-0">
                {acceptedTerms ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-brand-text-secondary" />}
              </div>
              <p className="text-xs text-brand-text-secondary">
                I agree to the <span className="text-brand-accent underline">Terms & Conditions</span> and <span className="text-brand-accent underline">Privacy Policy</span>.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-[#b0d800] text-black font-bold py-4 rounded-[16px] flex items-center justify-center gap-2 transition-colors mt-6 shadow-[0_0_20px_rgba(212,255,0,0.15)] disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-sm border-none bg-transparent text-brand-text-secondary hover:text-brand-text-primary transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
