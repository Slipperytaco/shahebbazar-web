import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { AlertList } from "@/lib/types";
import { markOwnerAlertsRead } from "@/app/(provider)/vendors/dashboard/owner-actions";
import { Panel } from "./DashboardCards";
import { providerHref } from "./ProviderShell";

export function AlertsPanel({ vendorId, alerts }: { vendorId: number; alerts: AlertList }) {
    const recent = alerts.alerts.slice(0, 5);

    return (
        <Panel
            title={alerts.unread > 0 ? `Alerts (${alerts.unread} new)` : "Alerts"}
            action={
                alerts.unread > 0 ? (
                    <form action={markOwnerAlertsRead.bind(null, vendorId)}>
                        <button type="submit" className="text-[0.8125rem] font-medium text-brand-600 hover:underline">
                            Mark all as read
                        </button>
                    </form>
                ) : undefined
            }
        >
            {recent.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-muted">
                    <Bell className="size-4" /> No alerts yet. New customer messages will show here.
                </p>
            ) : (
                <ul className="divide-y divide-line">
                    {recent.map((alert) => (
                        <li key={alert.id} className="py-2.5">
                            <Link
                                href={providerHref(`/vendors/dashboard/messages/${alert.payload.conversation_id}`, vendorId)}
                                className={`block text-sm hover:text-brand-600 ${alert.read_at ? "text-muted" : "font-semibold"}`}
                            >
                                New message from {alert.payload.from}: “{alert.payload.preview}”
                            </Link>
                            <span className="text-xs text-soft">{formatDateTime(alert.created_at)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}
