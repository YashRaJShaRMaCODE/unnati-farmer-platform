"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { Notification } from "@/types";
import { FilterSelect } from "@/components/shared/search-filter-bar";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";

const READ_OPTIONS = [
  { value: "unread", labelKey: "pages.notifications.unread" },
  { value: "read", labelKey: "pages.notifications.read" },
];

const TYPE_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "transaction", label: "Transaction" },
  { value: "scheme", label: "Scheme" },
  { value: "complaint", label: "Complaint" },
  { value: "trust_score", label: "Trust Score" },
  { value: "loan", label: "Loan" },
];

function notificationTypeVariant(type: string) {
  switch (type) {
    case "success":
      return "success" as const;
    case "warning":
      return "warning" as const;
    case "complaint":
      return "danger" as const;
    default:
      return "info" as const;
  }
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [readFilter, setReadFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: notifications, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", readFilter, typeFilter],
    queryFn: async () =>
      (
        await notificationsApi.list({
          is_read: readFilter === "read" ? "true" : readFilter === "unread" ? "false" : undefined,
          notification_type: typeFilter || undefined,
        })
      ).data.results,
  });

  const filteredNotifications = useMemo(() => notifications || [], [notifications]);

  const unread = filteredNotifications.filter((n) => !n.is_read).length;

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to mark all as read")),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to mark as read")),
  });

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) {
      markRead.mutate(n.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.notifications.title")}
        description={
          unread === 1
            ? t("pages.notifications.descriptionOne", { count: unread })
            : t("pages.notifications.descriptionMany", { count: unread })
        }
        action={
          unread > 0 ? (
            <Button variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              {markAll.isPending ? t("pages.notifications.marking") : t("pages.notifications.markAllRead")}
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title={t("pages.notifications.total")} value={filteredNotifications.length} icon={Bell} />
        <StatCard title={t("pages.notifications.unread")} value={unread} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterSelect
          label={t("common.all")}
          value={readFilter}
          onChange={setReadFilter}
          options={READ_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
        />
        <FilterSelect
          label={t("pages.notifications.allTypes")}
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_OPTIONS}
        />
      </div>

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <ErrorState message={t("pages.notifications.loadFailed")} onRetry={() => refetch()} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title={t("pages.notifications.emptyTitle")}
          description={t("pages.notifications.emptyDescription")}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const content = (
              <Card
                className={cn(
                  "transition-all",
                  n.is_read
                    ? "opacity-70"
                    : "border-emerald-300 bg-emerald-50/50 shadow-sm",
                  n.link && "cursor-pointer hover:shadow-md hover:border-emerald-400"
                )}
                onClick={() => handleNotificationClick(n)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{n.title}</CardTitle>
                    <Badge variant={notificationTypeVariant(n.notification_type)}>
                      {n.notification_type.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-emerald-800">{n.message}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-emerald-600">{formatDate(n.created_at)}</span>
                    <div className="flex items-center gap-2">
                      {n.link && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <ExternalLink className="h-3 w-3" /> {t("pages.notifications.view")}
                        </span>
                      )}
                      {!n.is_read && (
                        <Badge variant="success" className="text-[10px]">
                          {t("pages.notifications.new")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            if (n.link) {
              return (
                <Link key={n.id} href={n.link} onClick={() => handleNotificationClick(n)}>
                  {content}
                </Link>
              );
            }

            return <div key={n.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
