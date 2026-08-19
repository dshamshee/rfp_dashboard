"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileSpreadsheet,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "AccessDenied" || errorParam === "Callback") {
        setErrorMessage("Access denied. Your Google account is not registered as an Admin.");
      } else {
        setErrorMessage("Authentication failed. Please try again.");
      }
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("Invalid email or password. Please try again.");
        toast.error("Authentication failed. Invalid email or password.");
      } else if (res?.ok) {
        toast.success("Successfully signed in!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("Sign in error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      toast.error("Google Sign-In failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Top Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <FileSpreadsheet className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            RFP Dashboard
          </h1>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Admin & Superadmin Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="border shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs text-center">
              Enter your admin credentials or continue with Google
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full font-medium flex items-center justify-center gap-2 h-10 border-input hover:bg-accent"
            >
              {isGoogleLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign in with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t w-full border-border" />
              <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase font-semibold relative shrink-0">
                Or with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="pl-9 text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || isGoogleLoading}
                    className="pl-9 pr-10 text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full font-semibold mt-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 pb-6 flex justify-center">
            <p className="text-center text-[11px] text-muted-foreground">
              Protected System • Authorized Personnel Only
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
