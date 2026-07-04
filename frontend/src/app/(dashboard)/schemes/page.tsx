"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Eye, Leaf } from "lucide-react";
import { toast } from "sonner";
import { schemesApi } from "@/lib/api";
import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import { GovernmentScheme, SchemeApplication } from "@/types";
import { SearchFilterBar, FilterSelect } from "@/components/shared/search-filter-bar";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { Dialog } from "@/components/shared/visual-components";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active Only" },
  { value: "false", label: "Inactive Only" },
];

function applicationBadgeVariant(status: string) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "rejected":
      return "danger" as const;
    case "under_review":
      return "info" as const;
    default:
      return "warning" as const;
  }
}

export default function SchemesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [activeFilter, setActiveFilter] = useState("");
  const [detailScheme, setDetailScheme] = useState<GovernmentScheme | null>(null);
  const [reviewApp, setReviewApp] = useState<SchemeApplication | null>(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");

  const isGov = user?.role === "government" || user?.role === "admin";
  const isFarmer = user?.role === "farmer" || user?.role === "admin";

  const { data: schemes, isLoading, isError, refetch } = useQuery({
    queryKey: ["schemes"],
    queryFn: async () => (await schemesApi.list()).data.results,
  });

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => (await schemesApi.applications.list()).data.results,
  });

  const filteredSchemes = useMemo(() => {
    let result = schemes || [];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    if (activeFilter === "true") result = result.filter((s) => s.is_active);
    if (activeFilter === "false") result = result.filter((s) => !s.is_active);
    return result;
  }, [schemes, search, activeFilter]);

  const applyMutation = useMutation({
    mutationFn: (schemeId: number) => schemesApi.applications.create(schemeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application submitted successfully");
      setDetailScheme(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to submit application")),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: number; status: string; remarks: string }) =>
      schemesApi.applications.update(id, { status, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application reviewed");
      setReviewApp(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update application")),
  });

  const openReview = (app: SchemeApplication) => {
    setReviewApp(app);
    setReviewStatus(app.status);
    setReviewRemarks(app.remarks || "");
  };

  const hasApplied = (schemeId: number) =>
    (applications || []).some((a) => a.scheme === schemeId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Government Schemes"
        description="Browse agricultural schemes and track your applications"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Available Schemes" value={filteredSchemes.length} icon={Leaf} />
        <StatCard
          title="Active Schemes"
          value={filteredSchemes.filter((s) => s.is_active).length}
        />
        <StatCard title="My Applications" value={(applications || []).length} />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search schemes..."
        filters={
          <FilterSelect
            label="All Schemes"
            value={activeFilter}
            onChange={setActiveFilter}
            options={ACTIVE_OPTIONS}
          />
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <ErrorState message="Failed to load schemes" onRetry={() => refetch()} />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          title="No schemes found"
          description="No government schemes match your search criteria."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{scheme.name}</CardTitle>
                  <Badge variant={scheme.is_active ? "success" : "default"}>
                    {scheme.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-emerald-800">{scheme.description}</p>
                <p className="text-sm font-semibold text-emerald-700">
                  Benefit: {formatCurrency(scheme.benefit_amount)}
                </p>
                <p className="text-xs text-emerald-600">
                  {formatDate(scheme.start_date)} – {formatDate(scheme.end_date)}
                </p>
                <Button size="sm" variant="outline" onClick={() => setDetailScheme(scheme)}>
                  <Eye className="h-3.5 w-3.5" /> View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {(applications || []).length === 0 ? (
            <EmptyState
              title="No applications yet"
              description={
                isFarmer
                  ? "Apply to a scheme to track your application status here."
                  : "No scheme applications to review."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  {isGov && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(applications || []).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.farmer_email}</TableCell>
                    <TableCell>{app.scheme_name}</TableCell>
                    <TableCell>
                      <Badge variant={applicationBadgeVariant(app.status)}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(app.applied_at)}</TableCell>
                    {isGov && (
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openReview(app)}>
                          Review
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!detailScheme}
        onClose={() => setDetailScheme(null)}
        title={detailScheme?.name || "Scheme Details"}
      >
        {detailScheme && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-emerald-600">Description</p>
              <p className="mt-1 text-emerald-900">{detailScheme.description}</p>
            </div>
            <div>
              <p className="font-medium text-emerald-600">Eligibility Criteria</p>
              <p className="mt-1 text-emerald-900">{detailScheme.eligibility_criteria}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-emerald-600">Benefit Amount</p>
                <p className="font-semibold">{formatCurrency(detailScheme.benefit_amount)}</p>
              </div>
              <div>
                <p className="text-emerald-600">Period</p>
                <p>
                  {formatDate(detailScheme.start_date)} – {formatDate(detailScheme.end_date)}
                </p>
              </div>
            </div>
            {isFarmer && detailScheme.is_active && (
              <Button
                className="w-full"
                disabled={applyMutation.isPending || hasApplied(detailScheme.id)}
                onClick={() => applyMutation.mutate(detailScheme.id)}
              >
                {hasApplied(detailScheme.id)
                  ? "Already Applied"
                  : applyMutation.isPending
                    ? "Applying..."
                    : "Apply Now"}
              </Button>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        open={!!reviewApp}
        onClose={() => setReviewApp(null)}
        title="Review Application"
      >
        {reviewApp && (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-sm">
              <p className="font-medium">{reviewApp.farmer_email}</p>
              <p className="text-emerald-700">{reviewApp.scheme_name}</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Add review remarks for the farmer..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewApp(null)}>
                Cancel
              </Button>
              <Button
                disabled={reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    id: reviewApp.id,
                    status: reviewStatus,
                    remarks: reviewRemarks,
                  })
                }
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
