import "server-only";

import { cookies } from "next/headers";

const API_BASE =
    process.env.API_BASE_URL ||
    "http://127.0.0.1:4000";

export class AuthApiError extends Error {
    constructor(
        readonly status: number,
        readonly path: string
    ) {
        super(`Authenticated API ${path} responded ${status}`);
    }
}

export async function authenticatedApiGet<T>(
    path: string
): Promise<T | null> {
    const cookieStore = await cookies();
    const sessionCookie =
        cookieStore.get("shaheb_session");

    if (!sessionCookie) {
        return null;
    }

    const response = await fetch(
        `${API_BASE}/api${path}`,
        {
            cache: "no-store",
            headers: {
                Accept: "application/json",
                Cookie:
                    `${sessionCookie.name}=` +
                    `${encodeURIComponent(sessionCookie.value)}`,
            },
        }
    );

    if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
    ) {
        return null;
    }

    if (!response.ok) {
        throw new AuthApiError(
            response.status,
            path
        );
    }

    return response.json() as Promise<T>;
}

export type AuthenticatedSendResult<T = unknown> =
    | {
        ok: true;
        data: T;
    }
    | {
        ok: false;
        error: string;
        errors?: Record<string, string>;
    };

export async function authenticatedApiSend<T = unknown>(
    method: "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown
): Promise<AuthenticatedSendResult<T>> {
    const cookieStore = await cookies();
    const sessionCookie =
        cookieStore.get("shaheb_session");

    if (!sessionCookie) {
        return {
            ok: false,
            error: "Authentication required",
        };
    }

    try {
        const response = await fetch(
            `${API_BASE}/api${path}`,
            {
                method,
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Cookie:
                        `${sessionCookie.name}=` +
                        `${encodeURIComponent(
                            sessionCookie.value
                        )}`,
                },
                body:
                    body === undefined
                        ? undefined
                        : JSON.stringify(body),
            }
        );

        const data = await response
            .json()
            .catch(() => null);

        if (!response.ok) {
            const fieldErrors =
                data?.errors &&
                    typeof data.errors === "object" &&
                    !Array.isArray(data.errors)
                    ? (data.errors as Record<string, string>)
                    : undefined;

            return {
                ok: false,
                error:
                    typeof data?.error === "string"
                        ? data.error
                        : `Request failed (${response.status})`,
                errors: fieldErrors,
            };
        }

        return {
            ok: true,
            data: data as T,
        };
    } catch (error) {
        console.error(
            `${method} ${path} failed:`,
            error
        );

        return {
            ok: false,
            error:
                "Could not reach the server. Try again.",
        };
    }
}