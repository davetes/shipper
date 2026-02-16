import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Lock, Mail, ArrowRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { GoogleLogin } from "@react-oauth/google";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await apiFetch<{ token: string }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(res.token);
        navigate("/chat");
      } else {
        const res = await apiFetch<{ token: string }>("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, name }),
        });
        setToken(res.token);
        navigate("/chat");
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;

  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative z-10 text-primary-foreground px-12 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ChatApp</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Connect with anyone, anywhere, anytime.
          </h1>
          <p className="text-lg opacity-80 leading-relaxed">
            Experience seamless messaging with real-time chat, group conversations, and AI-powered assistance. Join thousands of users already connected.
          </p>
          <div className="mt-10 flex gap-8 text-sm opacity-70">
            <div>
              <div className="text-2xl font-bold text-primary-foreground">10K+</div>
              <div>Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-foreground">99.9%</div>
              <div>Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-foreground">50M+</div>
              <div>Messages Sent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ChatApp</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isLogin ? "Sign in to continue to ChatApp" : "Get started with ChatApp for free"}
          </p>

          {error ? (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setError(null);
                setLoading(true);
                try {
                  const credential = credentialResponse.credential;
                  if (!credential) throw new Error("Missing Google credential");
                  const res = await apiFetch<{ token: string }>("/api/auth/google", {
                    method: "POST",
                    body: JSON.stringify({ credential }),
                  });
                  setToken(res.token);
                  navigate("/chat");
                } catch (err) {
                  if (err instanceof ApiError) setError(err.message);
                  else setError("Google login failed. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => setError("Google login failed. Please try again.")}
              useOneTap
            />
          </div>

          {!googleClientId ? (
            <div className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Set <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span> in your frontend env to enable Google login.
            </div>
          ) : null}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5 h-11"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base gap-2" disabled={loading}>
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-primary hover:underline font-medium"
              type="button"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
