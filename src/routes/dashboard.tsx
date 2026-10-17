import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { getServerSession } from "@/lib/server/auth";
import {
	type DashboardData,
	type DashboardProduct,
	type DashboardUser,
	getDashboardData,
} from "@/lib/server/dashboard";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async (): Promise<void> => {
		const { session } = await getServerSession();
		if (!session) {
			return redirect({ to: "/login" }) as any;
		}
	},
	component: Dashboard,
});

function Dashboard() {
	const navigate = useNavigate();
	const dashboardQuery = useQuery({
		queryKey: ["dashboard"],
		queryFn: async () => getDashboardData(),
	});

	const handleSignOut = async () => {
		await authClient.signOut();
		await navigate({ to: "/" });
	};

	if (dashboardQuery.isPending) {
		return (
			<main className="page-wrap px-4 py-12">
				<section className="island-shell rounded-2xl p-6 sm:p-8">
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">Loading dashboard...</p>
				</section>
			</main>
		);
	}

	if (dashboardQuery.isError) {
		return (
			<main className="page-wrap px-4 py-12">
				<section className="island-shell rounded-2xl p-6 sm:p-8">
					<p className="island-kicker mb-2">Dashboard</p>
					<h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
						Something went wrong
					</h1>
					<p className="m-0 text-sm text-red-600">{(dashboardQuery.error as Error).message}</p>
					<p className="m-0 mt-4 text-sm text-[var(--sea-ink-soft)]">
						Your session may have expired.{" "}
						<Link
							to="/login"
							className="underline underline-offset-4 font-medium hover:text-[var(--sea-ink)]"
						>
							Log in again
						</Link>
					</p>
				</section>
			</main>
		);
	}

	const data = dashboardQuery.data;
	const displayName = data.user.name?.trim() || data.user.email;
	const firstName = displayName.split(/\s+/)[0];
	const roleLabel = data.role === "admin" ? "Administrator" : "Member";

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="island-kicker mb-2">Dashboard</p>
						<h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
							Welcome back, {firstName}
						</h1>
						<div className="flex flex-wrap items-center gap-2">
							<span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--kicker)]">
								{roleLabel}
							</span>
							<span className="text-sm text-[var(--sea-ink-soft)]">{data.user.email}</span>
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{data.canManageUsers && (
							<Link to="/products/new" className={chipClass}>
								Add Product
							</Link>
						)}
						<Link to="/products" className={chipClass}>
							Products
						</Link>
						{data.canManageUsers && (
							<Link to="/users" className={chipClass}>
								Users
							</Link>
						)}
						<button type="button" onClick={() => void handleSignOut()} className={chipClass}>
							Sign out
						</button>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard title="Products" value={data.stats.products} hint="In the catalog" />
					<StatCard
						title="Units in stock"
						value={data.stats.totalStock}
						hint="Across all products"
					/>
					<StatCard
						title="Inventory value"
						value={`$${data.stats.inventoryValue.toFixed(2)}`}
						hint="Price × stock"
					/>
					{data.stats.users !== null && (
						<StatCard
							title="Team members"
							value={data.stats.users}
							hint={`${data.stats.admins ?? 0} administrator${(data.stats.admins ?? 0) === 1 ? "" : "s"}`}
						/>
					)}
				</div>

				<div className="mt-8 grid gap-4 lg:grid-cols-2">
					<RecentProductsCard products={data.recentProducts} canManage={data.canManageUsers} />
					<AccountCard data={data} onSignOut={handleSignOut} />
				</div>

				{data.canManageUsers && (
					<div className="mt-4">
						<TeamCard users={data.recentUsers} />
					</div>
				)}
			</section>
		</main>
	);
}

const chipClass =
	"rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]";

function StatCard({
	title,
	value,
	hint,
}: { title: string; value: number | string; hint?: string }) {
	return (
		<div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-5">
			<p className="m-0 text-sm text-[var(--sea-ink-soft)]">{title}</p>
			<p className="m-0 mt-1 text-3xl font-bold text-[var(--sea-ink)]">{value}</p>
			{hint && <p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">{hint}</p>}
		</div>
	);
}

function PanelHeader({
	title,
	subtitle,
	action,
}: {
	title: string;
	subtitle: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="mb-3 flex items-start justify-between gap-3">
			<div>
				<p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">{title}</p>
				<p className="m-0 text-xs text-[var(--sea-ink-soft)]">{subtitle}</p>
			</div>
			{action}
		</div>
	);
}

const subtleLinkClass =
	"text-xs font-medium text-[var(--sea-ink)] underline underline-offset-4 hover:text-[var(--sea-ink)]";

function RecentProductsCard({
	products,
	canManage,
}: {
	products: DashboardData["recentProducts"];
	canManage: boolean;
}) {
	return (
		<div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-5">
			<PanelHeader
				title="Recent products"
				subtitle="Newest entries in the catalog."
				action={
					<Link to="/products" className={subtleLinkClass}>
						View all
					</Link>
				}
			/>

			{products.length === 0 ? (
				<p className="m-0 rounded-lg border border-dashed border-[var(--line)] px-4 py-6 text-center text-sm text-[var(--sea-ink-soft)]">
					No products yet.
					{canManage && (
						<>
							{" "}
							<Link to="/products/new" className={subtleLinkClass}>
								Add the first one
							</Link>
							.
						</>
					)}
				</p>
			) : (
				<ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
					{products.map((product) => (
						<ProductRow key={product.id} product={product} canManage={canManage} />
					))}
				</ul>
			)}
		</div>
	);
}

function ProductRow({
	product,
	canManage,
}: {
	product: DashboardProduct;
	canManage: boolean;
}) {
	return (
		<li className="flex items-center justify-between gap-3 py-3">
			<div className="min-w-0">
				<p className="m-0 truncate text-sm font-semibold text-[var(--sea-ink)]">{product.name}</p>
				<p className="m-0 mt-0.5 text-xs text-[var(--sea-ink-soft)]">
					${product.price.toFixed(2)} · {product.stock} in stock
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				{product.isLowStock ? (
					<span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
						Low stock
					</span>
				) : null}
				{canManage && (
					<Link
						to="/products/$productId"
						params={{ productId: product.id }}
						className={subtleLinkClass}
					>
						Edit
					</Link>
				)}
			</div>
		</li>
	);
}

function AccountCard({ data, onSignOut }: { data: DashboardData; onSignOut: () => void }) {
	const joined = new Date(data.user.createdAt).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	const expires = new Date(data.sessionExpiresAt).toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-5">
			<PanelHeader title="Your account" subtitle="Session and profile details." />

			<div className="flex items-center gap-3">
				{data.user.image ? (
					<img src={data.user.image} alt="" className="h-11 w-11 rounded-full" />
				) : (
					<div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]">
						<span className="text-sm font-bold text-[var(--sea-ink)]">
							{displayName(data).charAt(0).toUpperCase()}
						</span>
					</div>
				)}
				<div className="min-w-0">
					<p className="m-0 truncate text-sm font-semibold text-[var(--sea-ink)]">
						{displayName(data)}
					</p>
					<p className="m-0 truncate text-xs text-[var(--sea-ink-soft)]">{data.user.email}</p>
				</div>
			</div>

			<dl className="m-0 mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
				<dt className="text-[var(--sea-ink-soft)]">Role</dt>
				<dd className="m-0 text-right font-semibold text-[var(--sea-ink)]">
					{data.role === "admin" ? "Administrator" : "Member"}
				</dd>
				<dt className="text-[var(--sea-ink-soft)]">Email verified</dt>
				<dd className="m-0 text-right font-semibold text-[var(--sea-ink)]">
					{data.user.emailVerified ? "Yes" : "No"}
				</dd>
				<dt className="text-[var(--sea-ink-soft)]">Joined</dt>
				<dd className="m-0 text-right font-semibold text-[var(--sea-ink)]">{joined}</dd>
				<dt className="text-[var(--sea-ink-soft)]">Session expires</dt>
				<dd className="m-0 text-right font-semibold text-[var(--sea-ink)]">{expires}</dd>
			</dl>

			<button
				type="button"
				onClick={() => void onSignOut()}
				className="mt-5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
			>
				Sign out
			</button>
		</div>
	);
}

function TeamCard({ users }: { users: DashboardData["recentUsers"] }) {
	return (
		<div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-5">
			<PanelHeader
				title="Team members"
				subtitle="Most recent accounts. Roles are managed server-side."
				action={
					<Link to="/users" className={subtleLinkClass}>
						Manage users
					</Link>
				}
			/>

			{users.length === 0 ? (
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">No users found.</p>
			) : (
				<ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
					{users.map((member) => (
						<UserRow key={member.id} member={member} />
					))}
				</ul>
			)}
		</div>
	);
}

function UserRow({ member }: { member: DashboardUser }) {
	return (
		<li className="flex items-center justify-between gap-3 py-3">
			<div className="min-w-0">
				<p className="m-0 truncate text-sm font-semibold text-[var(--sea-ink)]">
					{member.name?.trim() || member.email}
				</p>
				<p className="m-0 mt-0.5 truncate text-xs text-[var(--sea-ink-soft)]">{member.email}</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<span
					className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
						member.role === "admin"
							? "border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--kicker)]"
							: "border-[var(--line)] text-[var(--sea-ink-soft)]"
					}`}
				>
					{member.role === "admin" ? "Admin" : "Member"}
				</span>
				<Link to="/users/$userId" params={{ userId: member.id }} className={subtleLinkClass}>
					View
				</Link>
			</div>
		</li>
	);
}

function displayName(data: DashboardData) {
	return data.user.name?.trim() || data.user.email;
}
