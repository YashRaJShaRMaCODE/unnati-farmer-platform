"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/utils";
import { VoiceInputButton } from "@/components/shared/voice-input-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    phone_number: "",
    village: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.quickRegister(form);
      toast.success(data.message, {
        description: data.login_hint,
        duration: 10000,
      });
      router.push(`/login?email=${encodeURIComponent(data.user.email)}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-100 p-4">
      <Card className="w-full max-w-md animate-slide-up shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Sprout className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Quick Start for Farmers</CardTitle>
          <CardDescription>
            Register in seconds — just name, phone, village & password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-base">Your Name</Label>
              <Input
                className="h-12 text-lg"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Phone Number</Label>
              <Input
                className="h-12 text-lg"
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Village</Label>
              <div className="flex gap-2">
                <Input
                  className="h-12 flex-1 text-lg"
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  placeholder="Your village name"
                  required
                />
                <VoiceInputButton
                  onTranscript={(text) =>
                    setForm((prev) => ({ ...prev, village: text }))
                  }
                  className="self-end"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Password</Label>
              <Input
                className="h-12 text-lg"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="h-12 w-full text-lg" disabled={loading}>
              {loading ? "Creating Account..." : "Start My UNNATI Journey"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-emerald-700">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-emerald-600 hover:underline">
              Login
            </Link>
            {" · "}
            <Link href="/register" className="font-medium text-emerald-600 hover:underline">
              Full Registration
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
