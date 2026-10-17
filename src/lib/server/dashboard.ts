import { createServerFn } from "@tanstack/react-start";

import { db, getUserRole } from "@/lib/db";
import { requireAuth } from "@/lib/session";

/** Stock at or below this is flagged as "low" in the dashboard. */
const LOW_STOCK_THRESHOLD = 5;

/**
 * Single round trip for the dashboard: current user + role, catalog stats,
 * recent products and (admin only) recent users.
 *
 * The user list is never returned to non-admin callers, so role gating stays
 * server-side instead of hiding data on the client.
 */
export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
	const { user, session } = await requireAuth();
	const role = getUserRole(user.id);
	const canManageUsers = role === "admin";

	const products = [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
	const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
	const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

	const users = canManageUsers
		? db.user
				.map((u) => ({
					id: u.id,
					name: u.name,
					email: u.email,
					role: getUserRole(u.id),
					createdAt: u.createdAt.toISOString(),
				}))
				.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
		: [];
	const adminCount = users.filter((u) => u.role === "admin").length;

	const expiresAt = session.expiresAt;

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image ?? null,
			emailVerified: !!user.emailVerified,
			createdAt: user.createdAt.toISOString(),
		},
		role,
		canManageUsers,
		sessionExpiresAt: (expiresAt instanceof Date
			? expiresAt
			: new Date(String(expiresAt))
		).toISOString(),
		stats: {
			products: products.length,
			totalStock,
			inventoryValue,
			lowStock,
			users: canManageUsers ? users.length : null,
			admins: canManageUsers ? adminCount : null,
		},
		recentProducts: products.slice(0, 5).map((p) => ({
			id: p.id,
			name: p.name,
			price: p.price,
			stock: p.stock,
			createdAt: p.createdAt,
			isLowStock: p.stock <= LOW_STOCK_THRESHOLD,
		})),
		recentUsers: users.slice(0, 5),
	};
});

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
export type DashboardProduct = DashboardData["recentProducts"][number];
export type DashboardUser = DashboardData["recentUsers"][number];
