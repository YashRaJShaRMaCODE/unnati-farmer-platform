import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-emerald-700">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-emerald-900 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-emerald-950">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950">{title}</h1>
        {description && <p className="mt-1 text-emerald-700">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  href,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 px-6 py-16 text-center">
      <Inbox className="mb-4 h-12 w-12 text-emerald-400" />
      <h3 className="text-lg font-semibold text-emerald-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-emerald-700">{description}</p>
      {actionLabel && href && (
        <Link href={href} className="mt-4">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-800">{message || "Something went wrong."}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
