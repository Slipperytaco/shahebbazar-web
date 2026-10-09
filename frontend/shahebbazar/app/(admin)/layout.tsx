import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/auth-client";
import { authenticatedApiGet } from "@/lib/auth-server";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

type AuthMeResponse = {
    authenticated: true;
    user: AuthUser;
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session =
        await authenticatedApiGet<AuthMeResponse>(
            "/auth/me"
        );

    if (!session) {
        redirect("/admin/login");
    }

    if (session.user.user_role === "customer") {
        redirect("/account");
    }

    if (session.user.user_role === "vendor") {
        redirect("/vendors/dashboard");
    }

    if (session.user.user_role !== "admin") {
        redirect("/login");
    }

    return children;
}