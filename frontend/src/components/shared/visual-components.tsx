"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function CircularScore({
  score,
  max = 100,
  size = 180,
  label,
}: {
  score: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / max, 1);
  const offset = circumference * (1 - progress);

  const color =
    score >= 85
      ? "#059669"
      : score >= 70
        ? "#10b981"
        : score >= 50
          ? "#f59e0b"
          : "#ef4444";

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#d1fae5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-4xl font-bold text-emerald-950">{score}</span>
        <span className="text-xs text-emerald-600">/ {max}</span>
        {label && (
          <span className="mt-1 text-sm font-medium capitalize text-emerald-800">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function ComplaintTimeline({ status }: { status: string }) {
  const steps = ["submitted", "under_review", "investigation", "resolved"];
  const rejected = status === "rejected";
  const currentIndex = rejected ? -1 : steps.indexOf(status);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((step, i) => {
        const done = !rejected && i <= currentIndex;
        const active = !rejected && i === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done
                    ? "bg-emerald-600 text-white"
                    : "border-2 border-emerald-200 bg-white text-emerald-400",
                  active && "ring-4 ring-emerald-100"
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  "mt-1 hidden text-center text-[10px] capitalize sm:block",
                  done ? "text-emerald-800 font-medium" : "text-emerald-500"
                )}
              >
                {step.replace("_", " ")}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-1 hidden h-0.5 flex-1 sm:block",
                  i < currentIndex ? "bg-emerald-600" : "bg-emerald-100"
                )}
              />
            )}
          </div>
        );
      })}
      {rejected && (
        <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
          Rejected
        </span>
      )}
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 rounded-xl border border-emerald-100 bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-emerald-950">{title}</h2>
        {children}
      </div>
    </div>
  );
}
