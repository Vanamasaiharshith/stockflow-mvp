"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Boxes, ArrowRight, ShieldCheck, BarChart2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAction(values);
      if (!res.success) {
        setErrorMessage(res.message || "Failed to sign in. Please verify your credentials.");
        toast.error(res.message || "Login failed");
      } else {
        toast.success("Welcome back! Redirecting to dashboard...");
      }
    } catch {
      // In Next.js, redirect() throws an internal redirect error which is normal behavior
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setValue("email", "demo@stockflow.com");
    setValue("password", "password123");
    toast.info("Demo credentials populated. Click 'Sign In' to proceed.");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Column: SaaS Value Proposition */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-950 -z-10" />

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Boxes className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              StockFlow
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Know Your Stock. Control Your Business.
          </p>
        </div>

        <div className="space-y-6 my-auto max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Intelligent inventory valuation & multi-tenant control.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Eliminate stockouts, optimize profit margins, and maintain real-time
            operational visibility across your entire business catalog.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Multi-tenant data isolation at database query layer",
              "Real-time low stock notifications and dynamic thresholds",
              "Inventory valuation with cost vs potential selling margin",
              "Audit-ready stock adjustments with reason tracking",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
          <span>Enterprise SaaS Grade Security</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>HTTP-Only Encrypted Sessions</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand */}
          <div className="flex md:hidden items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">StockFlow</span>
              <p className="text-xs text-slate-500">Know Your Stock. Control Your Business.</p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your credentials to access your organization dashboard
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-xs text-blue-900 uppercase tracking-wider">
                  Technical Examination Demo Account
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Email: <span className="font-mono font-medium">demo@stockflow.com</span>
                  <br />
                  Password: <span className="font-mono font-medium">password123</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFillDemo}
                className="text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-100 shrink-0"
              >
                Auto Fill
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              required
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              {...register("password")}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 h-10"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 pt-2">
            Don&apos;t have an organization yet?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              Create an organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
