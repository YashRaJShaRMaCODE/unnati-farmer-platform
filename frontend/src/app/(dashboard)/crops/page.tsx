"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, ChevronDown, ChevronUp, Pencil, Sprout, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cropsApi } from "@/lib/api";
import { formatDate, getApiErrorMessage } from "@/lib/utils";
import { CropRecord } from "@/types";
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

const SEASON_OPTIONS = [
  { value: "kharif", label: "Kharif" },
  { value: "rabi", label: "Rabi" },
  { value: "zaid", label: "Zaid" },
];

function CropForm({
  defaultValues,
  onSubmit,
  submitLabel,
  pending,
}: {
  defaultValues?: Partial<CropRecord>;
  onSubmit: (data: Record<string, string>) => void;
  submitLabel: string;
  pending?: boolean;
}) {
  const [cropName, setCropName] = useState(defaultValues?.crop_name || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSubmit({
      crop_name: form.get("crop_name") as string,
      season: form.get("season") as string,
      area_used: form.get("area_used") as string,
      yield_amount: form.get("yield_amount") as string,
      harvest_date: form.get("harvest_date") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Crop Name</Label>
        <div className="flex gap-2">
          <Input
            name="crop_name"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            required
          />
          <VoiceInputButton onTranscript={setCropName} className="shrink-0" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Season</Label>
        <Select name="season" defaultValue={defaultValues?.season || "kharif"} required>
          {SEASON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Area Used (acres)</Label>
        <Input
          name="area_used"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.area_used}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Yield (quintals)</Label>
        <Input
          name="yield_amount"
          type="number"
          step="0.01"
          defaultValue={defaultValues?.yield_amount}
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Harvest Date</Label>
        <Input
          name="harvest_date"
          type="date"
          defaultValue={defaultValues?.harvest_date?.slice(0, 10)}
          required
        />
      </div>
      <Button type="submit" className="sm:col-span-2" disabled={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

export default function CropsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [seasonFilter, setSeasonFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editCrop, setEditCrop] = useState<CropRecord | null>(null);
  const [deleteCrop, setDeleteCrop] = useState<CropRecord | null>(null);

  const isFarmer = user?.role === "farmer" || user?.role === "admin";

  const { data: crops, isLoading, isError, refetch } = useQuery({
    queryKey: ["crops", search, seasonFilter],
    queryFn: async () =>
      (
        await cropsApi.list({
          search: search || undefined,
          season: seasonFilter || undefined,
        })
      ).data.results,
  });

  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    const q = search.trim().toLowerCase();
    if (!q) return crops;
    return crops.filter((c) => c.crop_name.toLowerCase().includes(q));
  }, [crops, search]);

  const chartData = useMemo(
    () =>
      filteredCrops.map((c) => ({
        name: c.crop_name.length > 12 ? c.crop_name.slice(0, 12) + "…" : c.crop_name,
        yield: parseFloat(c.yield_amount || "0"),
        fullName: c.crop_name,
      })),
    [filteredCrops]
  );

  const totalYield = useMemo(
    () => filteredCrops.reduce((sum, c) => sum + parseFloat(c.yield_amount || "0"), 0),
    [filteredCrops]
  );

  const createMutation = useMutation({
    mutationFn: (data: Record<string, string>) => cropsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      toast.success("Crop record added");
      setShowAddForm(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to add crop")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, string> }) =>
      cropsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      toast.success("Crop record updated");
      setEditCrop(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update crop")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cropsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      toast.success("Crop record deleted");
      setDeleteCrop(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete crop")),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crop Records"
        description="Track yields, seasons, and harvest data across your farm"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Crops" value={filteredCrops.length} icon={Sprout} />
        <StatCard title="Total Yield" value={`${totalYield.toFixed(1)} q`} />
        <StatCard
          title="Seasons"
          value={new Set(filteredCrops.map((c) => c.season)).size}
        />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yield Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#059669" />
                <YAxis tick={{ fontSize: 11 }} stroke="#059669" unit=" q" />
                <Tooltip
                  formatter={(value) => [`${value ?? 0} q`, "Yield"]}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as { fullName?: string })?.fullName || ""
                  }
                />
                <Bar dataKey="yield" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search crops..."
        filters={
          <FilterSelect
            label="All Seasons"
            value={seasonFilter}
            onChange={setSeasonFilter}
            options={SEASON_OPTIONS}
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
              <CardTitle>Add Crop Record</CardTitle>
              {showAddForm ? (
                <ChevronUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-600" />
              )}
            </button>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <CropForm
                onSubmit={(data) => createMutation.mutate(data)}
                submitLabel={createMutation.isPending ? "Adding..." : "Add Crop"}
                pending={createMutation.isPending}
              />
            </CardContent>
          )}
        </Card>
      )}

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState message="Failed to load crop records" onRetry={() => refetch()} />
      ) : filteredCrops.length === 0 ? (
        <EmptyState
          title="No crop records found"
          description="Add crop records to track yields and harvest dates."
          actionLabel={isFarmer ? "Add Crop" : undefined}
          onAction={isFarmer ? () => setShowAddForm(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCrops.map((crop) => (
            <Card key={crop.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{crop.crop_name}</CardTitle>
                  <Badge className="capitalize">{crop.season}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-emerald-600">Yield</p>
                    <p className="text-lg font-bold text-emerald-700">{crop.yield_amount} q</p>
                  </div>
                  <div>
                    <p className="text-emerald-600">Area</p>
                    <p className="font-semibold text-emerald-950">{crop.area_used} ac</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-sm text-emerald-700">
                  <Calendar className="h-3.5 w-3.5" />
                  Harvest: {formatDate(crop.harvest_date)}
                </p>
                {isFarmer && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditCrop(crop)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteCrop(crop)}
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

      <Dialog open={!!editCrop} onClose={() => setEditCrop(null)} title="Edit Crop Record">
        {editCrop && (
          <CropForm
            defaultValues={editCrop}
            onSubmit={(data) => updateMutation.mutate({ id: editCrop.id, data })}
            submitLabel={updateMutation.isPending ? "Saving..." : "Save Changes"}
            pending={updateMutation.isPending}
          />
        )}
      </Dialog>

      <Dialog open={!!deleteCrop} onClose={() => setDeleteCrop(null)} title="Delete Crop Record">
        {deleteCrop && (
          <div className="space-y-4">
            <p className="text-sm text-emerald-800">
              Delete <strong>{deleteCrop.crop_name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteCrop(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteCrop.id)}
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
