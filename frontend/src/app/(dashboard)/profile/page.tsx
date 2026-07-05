"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { buyersApi, farmersApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-shell";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";

const farmerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z.string().optional(),
  aadhaar_number: z
    .string()
    .length(12, "Aadhaar must be exactly 12 digits")
    .regex(/^\d+$/, "Aadhaar must contain only digits"),
  address: z.string().min(1, "Address is required"),
  experience_years: z.coerce.number().min(0, "Experience cannot be negative"),
});

const buyerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  company_name: z.string().optional(),
  phone_number: z.string().optional(),
});

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: farmers, isLoading: farmersLoading } = useQuery({
    queryKey: ["farmers"],
    queryFn: async () => (await farmersApi.list()).data.results,
    enabled: user?.role === "farmer",
  });

  const { data: buyers, isLoading: buyersLoading } = useQuery({
    queryKey: ["buyers"],
    queryFn: async () => (await buyersApi.list()).data.results,
    enabled: user?.role === "buyer",
  });

  const farmer = farmers?.[0];
  const buyer = buyers?.find((b) => b.email === user?.email) || buyers?.[0];

  const updateFarmer = useMutation({
    mutationFn: (data: Record<string, unknown>) => farmersApi.update(farmer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      refreshUser();
      toast.success("Profile updated successfully");
      setErrors({});
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update profile")),
  });

  const createFarmer = useMutation({
    mutationFn: (data: Record<string, unknown>) => farmersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      refreshUser();
      toast.success("Profile created successfully");
      setErrors({});
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create profile")),
  });

  const updateBuyer = useMutation({
    mutationFn: (data: Record<string, unknown>) => buyersApi.update(buyer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      refreshUser();
      toast.success("Profile updated successfully");
      setErrors({});
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update profile")),
  });

  const handleFarmerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = {
      first_name: form.get("first_name") as string,
      last_name: form.get("last_name") as string,
      phone_number: (form.get("phone_number") as string) || undefined,
      aadhaar_number: form.get("aadhaar_number") as string,
      address: form.get("address") as string,
      experience_years: form.get("experience_years") as string,
    };

    const result = farmerSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(t("pages.profile.fixErrors"));
      return;
    }

    const payload = result.data;
    if (farmer) updateFarmer.mutate(payload);
    else createFarmer.mutate(payload);
  };

  const handleBuyerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!buyer) {
      toast.error(t("pages.profile.buyerNotFound"));
      return;
    }

    const form = new FormData(e.currentTarget);
    const raw = {
      first_name: form.get("first_name") as string,
      last_name: form.get("last_name") as string,
      company_name: (form.get("company_name") as string) || undefined,
      phone_number: (form.get("phone_number") as string) || undefined,
    };

    const result = buyerSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(t("pages.profile.fixErrors"));
      return;
    }

    updateBuyer.mutate(result.data);
  };

  if (user?.role === "farmer") {
    if (farmersLoading) return <PageSkeleton />;

    const pending = updateFarmer.isPending || createFarmer.isPending;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title={t("pages.profile.farmerTitle")}
          description={t("pages.profile.farmerDescription")}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              {farmer ? t("pages.profile.updateProfile") : t("pages.profile.completeProfile")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFarmerSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("pages.profile.firstName")}</Label>
                  <Input
                    name="first_name"
                    defaultValue={farmer?.first_name || user?.first_name}
                    required
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-600">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.profile.lastName")}</Label>
                  <Input
                    name="last_name"
                    defaultValue={farmer?.last_name || user?.last_name}
                    required
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("pages.profile.phone")}</Label>
                <Input
                  name="phone_number"
                  defaultValue={farmer?.phone_number || user?.phone_number || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("pages.profile.aadhaar")}</Label>
                <Input
                  name="aadhaar_number"
                  defaultValue={farmer?.aadhaar_number || ""}
                  maxLength={12}
                  required
                />
                {errors.aadhaar_number && (
                  <p className="text-xs text-red-600">{errors.aadhaar_number}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("pages.profile.address")}</Label>
                <Textarea name="address" defaultValue={farmer?.address || ""} required />
                {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("pages.profile.experience")}</Label>
                <Input
                  name="experience_years"
                  type="number"
                  min={0}
                  defaultValue={farmer?.experience_years || 0}
                />
                {errors.experience_years && (
                  <p className="text-xs text-red-600">{errors.experience_years}</p>
                )}
              </div>
              {farmer?.verification_status && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("pages.profile.verifiedFarmer")}
                </Badge>
              )}
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}
                  </>
                ) : farmer ? (
                  t("pages.profile.updateProfile")
                ) : (
                  t("pages.profile.createProfile")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role === "buyer") {
    if (buyersLoading) return <PageSkeleton />;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title={t("pages.profile.buyerTitle")}
          description={t("pages.profile.buyerDescription")}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              {t("pages.profile.editProfile")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {buyer ? (
              <form onSubmit={handleBuyerSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("pages.profile.firstName")}</Label>
                    <Input
                      name="first_name"
                      defaultValue={buyer.first_name || user?.first_name}
                      required
                    />
                    {errors.first_name && (
                      <p className="text-xs text-red-600">{errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("pages.profile.lastName")}</Label>
                    <Input
                      name="last_name"
                      defaultValue={buyer.last_name || user?.last_name}
                      required
                    />
                    {errors.last_name && (
                      <p className="text-xs text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.profile.email")}</Label>
                  <Input value={buyer.email} disabled className="bg-emerald-50" />
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.profile.companyName")}</Label>
                  <Input
                    name="company_name"
                    defaultValue={buyer.company_name || ""}
                    placeholder={t("common.optional")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.profile.phone")}</Label>
                  <Input
                    name="phone_number"
                    defaultValue={buyer.phone_number || user?.phone_number || ""}
                  />
                </div>
                <Button type="submit" disabled={updateBuyer.isPending}>
                  {updateBuyer.isPending ? (
                    <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}
                  </>
                ) : (
                  t("pages.profile.updateProfile")
                )}
                </Button>
              </form>
            ) : (
              <p className="text-emerald-700">
                {t("pages.profile.buyerNotFound")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("pages.profile.genericTitle")} description={t("pages.profile.genericDescription")} />
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <User className="h-7 w-7" />
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-950">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-emerald-700">{user?.email}</p>
              <Badge className="mt-2 capitalize">{user?.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
