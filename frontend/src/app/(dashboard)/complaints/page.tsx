"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";
import { complaintsApi } from "@/lib/api";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { Complaint } from "@/types";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { SearchFilterBar, FilterSelect } from "@/components/shared/search-filter-bar";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { ComplaintTimeline, Dialog } from "@/components/shared/visual-components";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";

function complaintBadgeVariant(status: string) {
  switch (status) {
    case "resolved":
      return "success" as const;
    case "rejected":
      return "danger" as const;
    case "investigation":
      return "info" as const;
    case "under_review":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export default function ComplaintsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const STATUS_OPTIONS = [
    { value: "submitted", label: t("common.statusSubmitted") },
    { value: "under_review", label: t("common.statusUnderReview") },
    { value: "investigation", label: t("common.statusInvestigation") },
    { value: "resolved", label: t("common.statusResolved") },
    { value: "rejected", label: t("common.statusRejected") },
  ];
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reviewComplaint, setReviewComplaint] = useState<Complaint | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [complaintTitle, setComplaintTitle] = useState("");

  const isFarmer = user?.role === "farmer" || user?.role === "admin";
  const isGov = user?.role === "government" || user?.role === "admin";

  const { data: complaints, isLoading, isError, refetch } = useQuery({
    queryKey: ["complaints", statusFilter],
    queryFn: async () =>
      (await complaintsApi.list({ status: statusFilter || undefined })).data.results,
  });

  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    const q = search.trim().toLowerCase();
    if (!q) return complaints;
    return complaints.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.farmer_email.toLowerCase().includes(q)
    );
  }, [complaints, search]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => complaintsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(t("pages.complaints.submitSuccess"));
      setShowCreateForm(false);
      setComplaintTitle("");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t("pages.complaints.submitFailed"))),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: string;
      notes: string;
    }) => complaintsApi.update(id, { status, resolution_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(t("pages.complaints.updateSuccess"));
      setReviewComplaint(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, t("pages.complaints.updateFailed"))),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate(new FormData(e.currentTarget));
    e.currentTarget.reset();
  };

  const openReview = (complaint: Complaint) => {
    setReviewComplaint(complaint);
    setReviewStatus(complaint.status);
    setResolutionNotes(complaint.resolution_notes || "");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.complaints.title")}
        description={t("pages.complaints.description")}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder={t("pages.complaints.searchPlaceholder")}
        filters={
          <FilterSelect
            label={t("common.allStatuses")}
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        }
      />

      {isFarmer && (
        <Card>
          <CardHeader className="pb-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <CardTitle>{t("pages.complaints.submitComplaint")}</CardTitle>
              {showCreateForm ? (
                <ChevronUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-600" />
              )}
            </button>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("pages.complaints.titleLabel")}</Label>
                  <div className="flex gap-2">
                    <Input
                      name="title"
                      value={complaintTitle}
                      onChange={(e) => setComplaintTitle(e.target.value)}
                      required
                      placeholder={t("pages.complaints.titlePlaceholder")}
                    />
                    <VoiceInputButton
                      onTranscript={setComplaintTitle}
                      className="shrink-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.complaints.descriptionLabel")}</Label>
                  <Textarea name="description" required placeholder={t("pages.complaints.descriptionPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.complaints.evidence")}</Label>
                  <Input name="evidence" type="file" accept="image/*,.pdf" />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("common.submitting") : t("pages.complaints.submitComplaint")}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <ErrorState message={t("pages.complaints.loadFailed")} onRetry={() => refetch()} />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title={t("pages.complaints.emptyTitle")}
          description={
            isFarmer
              ? t("pages.complaints.emptyDescription")
              : t("pages.complaints.emptyFiltered")
          }
          actionLabel={isFarmer ? t("pages.complaints.submitComplaint") : undefined}
          onAction={isFarmer ? () => setShowCreateForm(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-base">{complaint.title}</CardTitle>
                    <p className="mt-1 text-xs text-emerald-600">
                      {complaint.farmer_email} · {formatDate(complaint.created_at)}
                    </p>
                  </div>
                  <Badge variant={complaintBadgeVariant(complaint.status)}>
                    {complaint.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-emerald-800">{complaint.description}</p>
                {complaint.evidence && (
                  <a
                    href={complaint.evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" /> {t("pages.complaints.viewEvidence")}
                  </a>
                )}
                <ComplaintTimeline status={complaint.status} />
                {complaint.resolution_notes && (
                  <div className="rounded-lg bg-emerald-50 p-3 text-sm">
                    <p className="font-medium text-emerald-700">{t("pages.complaints.resolutionNotes")}</p>
                    <p className="mt-1 text-emerald-900">{complaint.resolution_notes}</p>
                  </div>
                )}
                {isGov && (
                  <Button size="sm" variant="outline" onClick={() => openReview(complaint)}>
                    {t("pages.complaints.reviewComplaint")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!reviewComplaint}
        onClose={() => setReviewComplaint(null)}
        title={t("pages.complaints.reviewComplaint")}
      >
        {reviewComplaint && (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-sm">
              <p className="font-medium">{reviewComplaint.title}</p>
              <p className="mt-1 text-emerald-700">{reviewComplaint.description}</p>
            </div>
            <ComplaintTimeline status={reviewComplaint.status} />
            <div className="space-y-2">
              <Label>{t("common.status")}</Label>
              <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
                <option value="submitted">{t("common.statusSubmitted")}</option>
                <option value="under_review">{t("common.statusUnderReview")}</option>
                <option value="investigation">{t("common.statusInvestigation")}</option>
                <option value="resolved">{t("common.statusResolved")}</option>
                <option value="rejected">{t("common.statusRejected")}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("pages.complaints.resolutionNotes")}</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder={t("pages.complaints.resolutionPlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewComplaint(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                disabled={reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    id: reviewComplaint.id,
                    status: reviewStatus,
                    notes: resolutionNotes,
                  })
                }
              >
                {reviewMutation.isPending ? t("common.submitting") : t("common.submit")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
