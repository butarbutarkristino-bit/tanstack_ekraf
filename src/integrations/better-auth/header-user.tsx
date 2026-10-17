import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div className="h-9 w-24 animate-pulse rounded-xl bg-[var(--chip-bg)]" />;
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-2">
				{session.user.image ? (
					<img src={session.user.image} alt="" className="h-9 w-9 rounded-full" />
				) : (
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]">
						<span className="text-sm font-bold text-[var(--sea-ink)]">
							{session.user.name?.charAt(0).toUpperCase() || "U"}
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={() => {
						void authClient.signOut().then(() => navigate({ to: "/" }));
					}}
					className="inline-flex h-9 items-center rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
				>
					Sign out
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Link
				to="/login"
				className="inline-flex h-9 items-center rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
			>
				Log in
			</Link>
			<Link
				to="/signup"
				className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground no-underline transition hover:bg-primary/90"
			>
				Sign up
			</Link>
		</div>
	);
}
