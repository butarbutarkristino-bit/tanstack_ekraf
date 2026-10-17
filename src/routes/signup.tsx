import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServerSession } from "@/lib/server/auth";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/signup")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (session) {
			return redirect({ to: "/dashboard" }) as any;
		}
	},
	component: Signup,
});

function Signup() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const result = await authClient.signUp.email({ name, email, password });
			if (result.error) {
				setError(result.error.message || "Sign up failed");
				setLoading(false);
				return;
			}
			// better-auth signs the user in on successful sign up.
			await navigate({ to: "/dashboard" });
		} catch {
			setError("An unexpected error occurred");
			setLoading(false);
		}
	};

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">Sign up</p>
				<h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
					Create an account
				</h1>
				<p className="m-0 mb-6 text-sm leading-6 text-[var(--sea-ink-soft)]">
					Enter your information to create an account. New accounts start with the{" "}
					<span className="font-semibold text-[var(--sea-ink)]">member</span> role.
				</p>

				<form onSubmit={handleSubmit} className="grid gap-4" noValidate>
					<div className="grid gap-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							type="text"
							autoComplete="name"
							placeholder="Your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>

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
							autoComplete="new-password"
							placeholder="At least 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="confirm-password">Confirm password</Label>
						<Input
							id="confirm-password"
							type="password"
							autoComplete="new-password"
							placeholder="Repeat your password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
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
						{loading ? "Creating account..." : "Create account"}
					</Button>
				</form>

				<p className="m-0 mt-6 text-center text-sm text-[var(--sea-ink-soft)]">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-[var(--sea-ink)] underline underline-offset-4 hover:text-[var(--sea-ink)]"
					>
						Log in
					</Link>
				</p>
			</section>
		</main>
	);
}
