"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { signupAction } from "@/app/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Boxes, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      organizationName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signupAction(values);
      if (!res.success) {
        setErrorMessage(res.message || "Failed to create account. Please check your inputs.");
        toast.error(res.message || "Signup failed");
      } else {
        toast.success("Organization created successfully! Redirecting...");
      }
    } catch {
      // In Next.js, redirect() throws an internal redirect error which is normal behavior
    } finally {
      setIsLoading(false);
    }
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
            Launch your multi-tenant inventory control center today.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create an isolated environment for your store, warehouse, or retail operations
            with automated stock tracking, margin insights, and audit trails.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Dedicated organization workspace with isolated data",
              "Customizable low-stock thresholds & multi-currency support",
              "Instant valuation metrics on cost vs potential retail revenue",
              "Strict server-side validation & cryptographic session management",
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
            <span>Strict Tenant Boundary Enforcement</span>
          </div>
        </div>
      </div>

      {/* Right Column: Sign Up Form */}
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
              Create your organization
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Set up your account and isolated business workspace in seconds
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Organization / Business Name"
              type="text"
              placeholder="e.g. Apex Retailers, Metro Supplies"
              required
              {...register("organizationName")}
              error={errors.organizationName?.message}
            />

            <Input
              label="Your Full Name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              required
              {...register("name")}
              error={errors.name?.message}
            />

            <Input
              label="Work Email Address"
              type="email"
              placeholder="alex@company.com"
              autoComplete="email"
              required
              {...register("email")}
              error={errors.email?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 chars"
                autoComplete="new-password"
                required
                {...register("password")}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 h-10 mt-2"
              isLoading={isLoading}
            >
              Get Started with StockFlow
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
