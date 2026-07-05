"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cropsApi, marketplaceApi } from "@/lib/api";
import { formatCurrency, formatDate, getApiErrorMessage } from "@/lib/utils";
import { Listing, Transaction } from "@/types";
import {
  BadgeDisplay,
  TrustScoreBadge,
  VerifiedBadge,
} from "@/components/shared/badge-display";
import { SearchFilterBar, FilterSelect } from "@/components/shared/search-filter-bar";
import { PageHeader, EmptyState, ErrorState } from "@/components/shared/page-shell";
import { Dialog } from "@/components/shared/visual-components";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";

export default function MarketplacePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [detailListing, setDetailListing] = useState<Listing | null>(null);
  const [buyListing, setBuyListing] = useState<Listing | null>(null);
  const [buyQty, setBuyQty] = useState("");
  const [buyError, setBuyError] = useState("");

  const isFarmer = user?.role === "farmer" || user?.role === "admin";
  const isBuyer = user?.role === "buyer" || user?.role === "admin";

  const STATUS_OPTIONS = [
    { value: "active", label: t("common.active") },
    { value: "sold", label: t("pages.marketplace.sold") },
    { value: "cancelled", label: t("pages.marketplace.cancelled") },
  ];

  const SORT_OPTIONS = [
    { value: "price_asc", label: t("pages.marketplace.priceLowHigh") },
    { value: "price_desc", label: t("pages.marketplace.priceHighLow") },
  ];

  const { data: listings, isLoading, isError, refetch } = useQuery({
    queryKey: ["listings", statusFilter],
    queryFn: async () =>
      (await marketplaceApi.listings.list({ status: statusFilter || undefined })).data.results,
  });

  const { data: crops } = useQuery({
    queryKey: ["crops"],
    queryFn: async () => (await cropsApi.list()).data.results,
    enabled: isFarmer,
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => (await marketplaceApi.transactions.list()).data.results,
  });

  const filteredListings = useMemo(() => {
    let result = listings || [];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (l) =>
          l.crop_name.toLowerCase().includes(q) ||
          l.farmer_email.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      const pa = parseFloat(a.price_per_unit);
      const pb = parseFloat(b.price_per_unit);
      return sortBy === "price_desc" ? pb - pa : pa - pb;
    });
  }, [listings, search, sortBy]);

  const createListing = useMutation({
    mutationFn: marketplaceApi.listings.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing created successfully");
      setShowCreateForm(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create listing")),
  });

  const createTransaction = useMutation({
    mutationFn: marketplaceApi.transactions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Purchase initiated successfully");
      setBuyListing(null);
      setBuyQty("");
      setBuyError("");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to complete purchase")),
  });

  const completeTransaction = useMutation({
    mutationFn: ({ id }: { id: number }) =>
      marketplaceApi.transactions.update(id, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction marked as completed");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update transaction")),
  });

  const handleListingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createListing.mutate({
      crop: Number(form.get("crop")),
      quantity: form.get("quantity") as string,
      price_per_unit: form.get("price_per_unit") as string,
      description: form.get("description") as string,
    });
    e.currentTarget.reset();
  };

  const handleBuySubmit = () => {
    if (!buyListing) return;
    const qty = parseFloat(buyQty);
    const max = parseFloat(buyListing.quantity);
    if (!buyQty || isNaN(qty) || qty <= 0) {
      setBuyError("Enter a valid quantity greater than 0");
      return;
    }
    if (qty > max) {
      setBuyError(`Quantity cannot exceed ${max}`);
      return;
    }
    setBuyError("");
    createTransaction.mutate({ listing: buyListing.id, quantity: buyQty });
  };

  const openBuyDialog = (listing: Listing) => {
    setBuyListing(listing);
    setBuyQty("");
    setBuyError("");
  };

  const farmerTransactions = (transactions || []).filter(
    (t) => isFarmer && t.farmer_email === user?.email
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.marketplace.title")}
        description={t("pages.marketplace.description")}
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder={t("pages.marketplace.searchPlaceholder")}
        filters={
          <>
            <FilterSelect
              label={t("pages.marketplace.allStatuses")}
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label={t("pages.marketplace.sortByPrice")}
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
            />
          </>
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
              <CardTitle>{t("pages.marketplace.createListing")}</CardTitle>
              {showCreateForm ? (
                <ChevronUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-600" />
              )}
            </button>
          </CardHeader>
          {showCreateForm && (
            <CardContent>
              <form onSubmit={handleListingSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("common.crop")}</Label>
                  <Select name="crop" required>
                    <option value="">{t("pages.marketplace.selectCrop")}</option>
                    {(crops || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.crop_name} ({c.season})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.marketplace.quantity")}</Label>
                  <Input name="quantity" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label>{t("pages.marketplace.pricePerUnit")}</Label>
                  <Input name="price_per_unit" type="number" step="0.01" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("common.description")}</Label>
                  <Textarea name="description" />
                </div>
                <Button type="submit" className="sm:col-span-2" disabled={createListing.isPending}>
                  {createListing.isPending ? t("common.adding") : t("pages.marketplace.createButton")}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : isError ? (
        <ErrorState message={t("pages.marketplace.loadFailed")} onRetry={() => refetch()} />
      ) : filteredListings.length === 0 ? (
        <EmptyState
          title={t("pages.marketplace.emptyListings")}
          description={
            isFarmer
              ? t("pages.marketplace.emptyListingsFarmer")
              : t("pages.marketplace.emptyListingsBuyer")
          }
          actionLabel={isFarmer ? t("pages.marketplace.createListing") : undefined}
          onAction={isFarmer ? () => setShowCreateForm(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card
              key={listing.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-lime-400" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{listing.crop_name}</CardTitle>
                  <Badge variant={listing.status === "active" ? "success" : "default"}>
                    {listing.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="flex items-center gap-1 text-sm text-emerald-700">
                  <User className="h-3.5 w-3.5" />
                  {listing.farmer_email}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {listing.is_verified_farmer && <VerifiedBadge />}
                  {listing.farmer_trust_score != null && listing.farmer_trust_score > 0 && (
                    <TrustScoreBadge
                      score={listing.farmer_trust_score}
                      category={listing.farmer_trust_category}
                    />
                  )}
                  {listing.farmer_badges && listing.farmer_badges.length > 0 && (
                    <BadgeDisplay badges={listing.farmer_badges} max={3} />
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency(listing.price_per_unit)}
                    </p>
                    <p className="text-xs text-emerald-600">{t("pages.marketplace.perUnit")}</p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm font-medium text-emerald-950">
                      <Package className="h-3.5 w-3.5" />
                      {listing.quantity} units
                    </p>
                  </div>
                </div>
                {listing.description && (
                  <p className="line-clamp-2 text-sm text-emerald-700">{listing.description}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailListing(listing)}
                  >
                    <Eye className="h-3.5 w-3.5" /> {t("pages.marketplace.details")}
                  </Button>
                  {isBuyer && listing.status === "active" && (
                    <Button size="sm" className="flex-1" onClick={() => openBuyDialog(listing)}>
                      <ShoppingCart className="h-3.5 w-3.5" /> {t("pages.marketplace.buy")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(transactions || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.marketplace.transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.crop")}</TableHead>
                  <TableHead>{t("pages.marketplace.buyer")}</TableHead>
                  <TableHead>{t("common.farmer")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  {isFarmer && <TableHead>{t("common.action")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transactions || []).map((t: Transaction) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.listing_crop}</TableCell>
                    <TableCell>{t.buyer_email}</TableCell>
                    <TableCell>{t.farmer_email}</TableCell>
                    <TableCell>{formatCurrency(t.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "completed" ? "success" : "warning"}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(t.transaction_date)}</TableCell>
                    {isFarmer && (
                      <TableCell>
                        {t.farmer_email === user?.email && t.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={completeTransaction.isPending}
                            onClick={() => completeTransaction.mutate({ id: t.id })}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {isFarmer && farmerTransactions.length === 0 && (transactions || []).length === 0 && (
        <EmptyState
          title={t("pages.marketplace.emptyTransactions")}
          description={t("pages.marketplace.emptyTransactionsDesc")}
        />
      )}

      <Dialog
        open={!!detailListing}
        onClose={() => setDetailListing(null)}
        title={detailListing?.crop_name || t("pages.marketplace.listingDetails")}
      >
        {detailListing && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-emerald-600">{t("common.farmer")}</span>
              <span className="font-medium">{detailListing.farmer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Price</span>
              <span className="font-medium">{formatCurrency(detailListing.price_per_unit)}/unit</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Quantity</span>
              <span className="font-medium">{detailListing.quantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">{t("common.status")}</span>
              <Badge variant={detailListing.status === "active" ? "success" : "default"}>
                {detailListing.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-600">Listed</span>
              <span>{formatDate(detailListing.created_at)}</span>
            </div>
            {detailListing.description && (
              <div>
                <p className="text-emerald-600">{t("common.description")}</p>
                <p className="mt-1 text-emerald-900">{detailListing.description}</p>
              </div>
            )}
            {isBuyer && detailListing.status === "active" && (
              <Button className="w-full" onClick={() => { setDetailListing(null); openBuyDialog(detailListing); }}>
                <ShoppingCart className="h-4 w-4" /> {t("pages.marketplace.buyNow")}
              </Button>
            )}
          </div>
        )}
      </Dialog>

      <Dialog open={!!buyListing} onClose={() => setBuyListing(null)} title={t("pages.marketplace.purchaseListing")}>
        {buyListing && (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-50 p-3 text-sm">
              <p className="font-medium text-emerald-950">{buyListing.crop_name}</p>
              <p className="text-emerald-700">
                {formatCurrency(buyListing.price_per_unit)}/unit · Max {buyListing.quantity} units
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("pages.marketplace.quantity")}</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={buyListing.quantity}
                value={buyQty}
                onChange={(e) => {
                  setBuyQty(e.target.value);
                  setBuyError("");
                }}
                placeholder={`Max ${buyListing.quantity}`}
              />
              {buyError && <p className="text-xs text-red-600">{buyError}</p>}
              {buyQty && !buyError && (
                <p className="text-xs text-emerald-600">
                  Total:{" "}
                  {formatCurrency(
                    parseFloat(buyQty || "0") * parseFloat(buyListing.price_per_unit)
                  )}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBuyListing(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                disabled={createTransaction.isPending}
                onClick={handleBuySubmit}
              >
                {createTransaction.isPending ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
