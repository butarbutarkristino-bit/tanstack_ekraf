import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServerSession } from "@/lib/server/auth";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/login")({
	beforeLoad: async (): Promise<void> => {
		const { session } = await getServerSession();
		if (session) {
			return redirect({ to: "/dashboard" }) as any;
		}
	},
	component: Login,
});

function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				setError(result.error.message || "Sign in failed");
				setLoading(false);
				return;
			}
			await navigate({ to: "/dashboard" });
		} catch {
			setError("An unexpected error occurred");
			setLoading(false);
		}
	};

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">Log in</p>
				<h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
					Welcome back
				</h1>
				<p className="m-0 mb-6 text-sm leading-6 text-[var(--sea-ink-soft)]">
					Enter your email below to sign in to your account.
				</p>

				<form onSubmit={handleSubmit} className="grid gap-4" noValidate>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
						/>
					</div>

					{error && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					)}

					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</form>

				<p className="m-0 mt-6 text-center text-sm text-[var(--sea-ink-soft)]">
					Don't have an account?{" "}
					<Link
						to="/signup"
						className="font-medium text-[var(--sea-ink)] underline underline-offset-4 hover:text-[var(--sea-ink)]"
					>
						Sign up
					</Link>
				</p>

				<p className="m-0 mt-4 text-center text-xs text-[var(--sea-ink-soft)]">
					Need an administrator?{" "}
					<Link to="/setup" className="underline underline-offset-4 hover:text-[var(--sea-ink)]">
						Seed the admin account
					</Link>{" "}
					first.
				</p>
			</section>
		</main>
	);
}
