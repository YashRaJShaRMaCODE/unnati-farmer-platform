"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { useTranslation } from "@/providers/language-provider";
import { UserRole } from "@/types";

const ROLE_KEYS: Record<UserRole, string> = {
  farmer: "roles.farmer",
  buyer: "roles.buyer",
  government: "roles.government",
  bank: "roles.bank",
  admin: "roles.admin",
};

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "farmer" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.register(form);
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (msg) {
        const first = Object.values(msg)[0]?.[0];
        setError(first || t("pages.register.failed"));
      } else {
        setError(t("pages.register.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-100 p-4">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Sprout className="h-6 w-6" />
          </div>
          <CardTitle>{t("pages.register.title")}</CardTitle>
          <CardDescription>{t("pages.register.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-sm">
            <span className="text-emerald-700">{t("pages.register.farmerCallout")} </span>
            <Link href="/onboarding" className="font-semibold text-emerald-600 hover:underline">
              {t("pages.register.simpleRegistration")}
            </Link>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            {error && (
              <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("pages.register.role")}</Label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                {(Object.keys(ROLE_KEYS) as UserRole[]).map((role) => (
                  <option key={role} value={role}>
                    {t(ROLE_KEYS[role])}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("pages.register.firstName")}</Label>
              <Input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pages.register.lastName")}</Label>
              <Input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pages.register.username")}</Label>
              <Input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pages.register.email")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("pages.register.phone")}</Label>
              <Input
                type="text"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pages.register.password")}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("pages.register.confirmPassword")}</Label>
              <Input
                type="password"
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="sm:col-span-2 w-full" disabled={loading}>
              {loading ? t("pages.register.creating") : t("pages.register.register")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-emerald-700">
            {t("pages.register.hasAccount")}{" "}
            <Link href="/login" className="font-medium text-emerald-600 hover:underline">
              {t("pages.register.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
