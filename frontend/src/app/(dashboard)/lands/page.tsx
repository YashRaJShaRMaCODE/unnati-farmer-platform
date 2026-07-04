"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { landsApi } from "@/lib/api";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { LandRecord } from "@/types";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { SearchFilterBar, FilterSelect } from "@/components/shared/search-filter-bar";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { Dialog } from "@/components/shared/visual-components";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

const SOIL_OPTIONS = [
  { value: "alluvial", label: "Alluvial" },
  { value: "black", label: "Black" },
  { value: "red", label: "Red" },
  { value: "laterite", label: "Laterite" },
  { value: "sandy", label: "Sandy" },
  { value: "clay", label: "Clay" },
];

const IRRIGATION_OPTIONS = [
  { value: "canal", label: "Canal" },
  { value: "well", label: "Well" },
  { value: "drip", label: "Drip" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "rainfed", label: "Rainfed" },
];

function LandForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending,
}: {
  defaultValues?: Partial<LandRecord>;
  onSubmit: (data: FormData) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const [location, setLocation] = useState(defaultValues?.location || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="space-y-2">
        <Label>Survey Number</Label>
        <Input name="survey_number" defaultValue={defaultValues?.survey_number} required />
      </div>
      <div className="space-y-2">
        <Label>Total Area (acres)</Label>
        <Input
          name="total_area"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.total_area}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Soil Type</Label>
        <Select name="soil_type" defaultValue={defaultValues?.soil_type || "alluvial"} required>
          {SOIL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Irrigation</Label>
        <Select
          name="irrigation_type"
          defaultValue={defaultValues?.irrigation_type || "canal"}
          required
        >
          {IRRIGATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Location</Label>
        <div className="flex gap-2">
          <Input
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <VoiceInputButton onTranscript={setLocation} className="shrink-0" />
        </div>
      </div>
      <Button type="submit" className="sm:col-span-2" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

export default function LandsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [soilFilter, setSoilFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editLand, setEditLand] = useState<LandRecord | null>(null);
  const [deleteLand, setDeleteLand] = useState<LandRecord | null>(null);

  const isFarmer = user?.role === "farmer" || user?.role === "admin";

  const { data: lands, isLoading, isError, refetch } = useQuery({
    queryKey: ["lands", search, soilFilter],
    queryFn: async () =>
      (
        await landsApi.list({
          search: search || undefined,
          soil_type: soilFilter || undefined,
        })
      ).data.results,
  });

  const filteredLands = useMemo(() => {
    if (!lands) return [];
    const q = search.trim().toLowerCase();
    if (!q) return lands;
    return lands.filter(
      (l) =>
        l.survey_number.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.soil_type.toLowerCase().includes(q)
    );
  }, [lands, search]);

  const stats = useMemo(() => {
    const totalArea = filteredLands.reduce((sum, l) => sum + parseFloat(l.total_area || "0"), 0);
    const verifiedCount = filteredLands.filter((l) => l.is_verified).length;
    return {
      totalRecords: filteredLands.length,
      totalArea: totalArea.toFixed(2),
      verifiedCount,
    };
  }, [filteredLands]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => landsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lands"] });
      toast.success("Land record added successfully");
      setShowAddForm(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to add land record")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, string> }) =>
      landsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lands"] });
      toast.success("Land record updated");
      setEditLand(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update land record")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => landsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lands"] });
      toast.success("Land record deleted");
      setDeleteLand(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete land record")),
  });

  const handleCreate = (formData: FormData) => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (formData: FormData) => {
    if (!editLand) return;
    updateMutation.mutate({
      id: editLand.id,
      data: {
        survey_number: formData.get("survey_number") as string,
        total_area: formData.get("total_area") as string,
        soil_type: formData.get("soil_type") as string,
        irrigation_type: formData.get("irrigation_type") as string,
        location: formData.get("location") as string,
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Land Records"
        description="Manage your land parcels, soil data, and verification status"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Records" value={stats.totalRecords} />
        <StatCard title="Total Area" value={`${stats.totalArea} ac`} />
        <StatCard title="Verified" value={stats.verifiedCount} />
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by survey number, location..."
        filters={
          <FilterSelect
            label="All Soil Types"
            value={soilFilter}
            onChange={setSoilFilter}
            options={SOIL_OPTIONS}
          />
        }
      />

      {isFarmer && (
        <Card>
          <CardHeader className="pb-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <CardTitle>Add Land Record</CardTitle>
              {showAddForm ? (
                <ChevronUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-600" />
              )}
            </button>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <LandForm
                onSubmit={handleCreate}
                submitLabel={createMutation.isPending ? "Adding..." : "Add Land"}
                pending={createMutation.isPending}
              />
            </CardContent>
          )}
        </Card>
      )}

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState message="Failed to load land records" onRetry={() => refetch()} />
      ) : filteredLands.length === 0 ? (
        <EmptyState
          title="No land records found"
          description={
            isFarmer
              ? "Add your first land record to start building your farm profile."
              : "No land records match your search criteria."
          }
          actionLabel={isFarmer ? "Add Land" : undefined}
          onAction={isFarmer ? () => setShowAddForm(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLands.map((land) => (
            <Card key={land.id} className="group transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{land.survey_number}</CardTitle>
                  <Badge variant={land.is_verified ? "success" : "warning"}>
                    {land.is_verified ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      "Pending"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-emerald-600">Area</p>
                    <p className="font-semibold text-emerald-950">{land.total_area} ac</p>
                  </div>
                  <div>
                    <p className="text-emerald-600">Soil</p>
                    <p className="font-semibold capitalize text-emerald-950">{land.soil_type}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-emerald-600">
                      <Droplets className="h-3.5 w-3.5" /> Irrigation
                    </p>
                    <p className="font-semibold capitalize text-emerald-950">
                      {land.irrigation_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-600">Added</p>
                    <p className="font-semibold text-emerald-950">{formatDate(land.created_at)}</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-sm text-emerald-700">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {land.location}
                </p>
                {isFarmer && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditLand(land)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteLand(land)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editLand} onClose={() => setEditLand(null)} title="Edit Land Record">
        {editLand && (
          <LandForm
            defaultValues={editLand}
            onSubmit={handleUpdate}
            submitLabel={updateMutation.isPending ? "Saving..." : "Save Changes"}
            pending={updateMutation.isPending}
          />
        )}
      </Dialog>

      <Dialog open={!!deleteLand} onClose={() => setDeleteLand(null)} title="Delete Land Record">
        {deleteLand && (
          <div className="space-y-4">
            <p className="text-sm text-emerald-800">
              Are you sure you want to delete land record{" "}
              <strong>{deleteLand.survey_number}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteLand(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteLand.id)}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
