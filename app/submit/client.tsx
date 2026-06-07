"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  MapPin,
  FileText,
  User,
  ClipboardCheck,
  X,
  LocateFixed,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createTicketFromForm } from "@/actions/tickets";
import { useLanguage } from "@/components/language-provider";

type Category = {
  id: string;
  name: string;
  department: string;
  description: string | null;
  sla_hours: number;
};

type SubmitUser = {
  full_name: string;
  email: string;
  phone: string | null;
} | null;

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_SIZE = MAX_ATTACHMENTS * MAX_ATTACHMENT_SIZE;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function SubmitClient({
  user,
  categories,
}: {
  user: SubmitUser;
  categories: Category[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<"track" | "dashboard" | null>(null);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const formSteps = [
    { id: 1, title: t("submit.stepCategory"), icon: FileText },
    { id: 2, title: t("submit.stepDetails"), icon: ClipboardCheck },
    { id: 3, title: t("submit.stepLocation"), icon: MapPin },
    { id: 4, title: t("submit.stepContact"), icon: User },
  ];

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const location = [address, area, city].filter(Boolean).join(", ");
  const hasCoordinates = latitude && longitude;
  const mapSrc = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.01}%2C${Number(latitude) - 0.01}%2C${Number(longitude) + 0.01}%2C${Number(latitude) + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "";
  const totalAttachmentSize = files.reduce((total, file) => total + file.size, 0);

  const nextStep = () => {
    setError("");
    if (step === 1 && !selectedCategory) {
      setError(t("submit.errorCategory"));
      return;
    }
    if (step === 2 && (title.trim().length < 10 || description.trim().length < 20)) {
      setError(t("submit.errorDetails"));
      return;
    }
    if (step === 3 && location.trim().length < 5) {
      setError(t("submit.errorLocation"));
      return;
    }
    setStep(step + 1);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setError("");

    const invalidType = selected.find((file) => !ALLOWED_ATTACHMENT_TYPES.has(file.type));
    if (invalidType) {
      setError(`${invalidType.name} must be an image or PDF file.`);
      event.target.value = "";
      return;
    }

    const oversized = selected.find((file) => file.size > MAX_ATTACHMENT_SIZE);
    if (oversized) {
      setError(`${oversized.name} is larger than ${formatFileSize(MAX_ATTACHMENT_SIZE)}.`);
      event.target.value = "";
      return;
    }

    setFiles((prev) => {
      const next = [...prev, ...selected].slice(0, MAX_ATTACHMENTS);
      const totalSize = next.reduce((total, file) => total + file.size, 0);

      if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
        setError(`Attachments can be up to ${formatFileSize(MAX_TOTAL_ATTACHMENT_SIZE)} total.`);
        return prev;
      }

      if (prev.length + selected.length > MAX_ATTACHMENTS) {
        setError(`You can upload up to ${MAX_ATTACHMENTS} files.`);
      }

      return next;
    });
    event.target.value = "";
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(t("submit.errorNoGeo"));
      return;
    }

    setError("");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationLoading(false);
      },
      () => {
        setError(t("submit.errorGeo"));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    if (!selectedCategory) {
      setError(t("submit.errorValidCategory"));
      setIsSubmitting(false);
      return;
    }

    if (!name.trim()) {
      setError(t("submit.errorName") || "Please enter your full name");
      setIsSubmitting(false);
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError(t("submit.errorEmail") || "Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (files.some((file) => file.size > MAX_ATTACHMENT_SIZE)) {
      setError(`Each attachment must be ${formatFileSize(MAX_ATTACHMENT_SIZE)} or smaller.`);
      setIsSubmitting(false);
      return;
    }

    if (totalAttachmentSize > MAX_TOTAL_ATTACHMENT_SIZE) {
      setError(`Attachments can be up to ${formatFileSize(MAX_TOTAL_ATTACHMENT_SIZE)} total.`);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.set("category_id", selectedCategory.id);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("location", location);
    formData.set("phone", phone);
    formData.set("name", name);
    formData.set("email", email);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);
    files.forEach((file) => formData.append("attachments", file));

    try {
      const result = await createTicketFromForm(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success && result.ticketNumber) {
        setTicketNumber(result.ticketNumber);
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Submit complaint failed:", error);
      setError("The complaint could not be submitted. Remove large attachments and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="mx-auto w-full max-w-md border text-center">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t("submit.submitted")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("submit.submittedBody")}
              </p>
              <div className="w-full rounded-lg border bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">{t("submit.ticketId")}</p>
                <p className="mt-1 text-2xl font-bold tracking-wider text-primary">
                  {ticketNumber}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={navigatingTo !== null}
                  onClick={() => {
                    setNavigatingTo("track");
                    window.dispatchEvent(new Event("civicdesk:navigation-start"));
                    router.push(`/track?id=${ticketNumber}`);
                  }}
                >
                  {navigatingTo === "track" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {navigatingTo === "track" ? t("submit.openingTracking") : t("submit.trackComplaint")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={navigatingTo !== null}
                  onClick={() => {
                    setNavigatingTo("dashboard");
                    window.dispatchEvent(new Event("civicdesk:navigation-start"));
                    router.push("/dashboard");
                  }}
                >
                  {navigatingTo === "dashboard" && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                  {navigatingTo === "dashboard" ? t("submit.openingDashboard") : t("submit.dashboard")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
    );
  }

  return (
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{t("submit.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("submit.subtitle")}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {formSteps.map((s, i) => (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                        step > s.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : step === s.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/25 text-muted-foreground"
                      )}
                    >
                      {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <span className={cn("text-xs font-medium", step >= s.id ? "text-foreground" : "text-muted-foreground")}>
                      {s.title}
                    </span>
                  </div>
                  {i < formSteps.length - 1 && (
                    <div className={cn("mx-2 h-px flex-1", step > s.id ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg">
                {step === 1 && selectedCategory ? selectedCategory.name : formSteps[step - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">{t("submit.selectCategory")} <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <select
                        id="category"
                        value={categoryId ?? ""}
                        onChange={(event) => setCategoryId(event.target.value || null)}
                        className={cn(
                          "h-10 w-full appearance-none rounded-lg border border-input bg-transparent py-2 pr-10 pl-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                          selectedCategory ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <option value="">{t("submit.chooseCategory")}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} - {cat.department} · {cat.sla_hours}h SLA
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  {selectedCategory && (
                    <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                      <p className="font-medium">{selectedCategory.name}</p>
                      <p className="mt-0.5 text-muted-foreground">{selectedCategory.description || selectedCategory.department}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("submit.routedTo")} {selectedCategory.department} - {t("submit.targetResponse")} {selectedCategory.sla_hours} {t("submit.hours")}
                      </p>
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("submit.titleLabel")} <span className="text-destructive">*</span></Label>
                    <Input id="title" placeholder={t("submit.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t("submit.descriptionLabel")} <span className="text-destructive">*</span></Label>
                    <Textarea
                      id="description"
                      placeholder={t("submit.descriptionPlaceholder")}
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("submit.attachments")}</Label>
                    <label className="block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/40">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{t("submit.uploadHelp")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Up to {MAX_ATTACHMENTS} files, {formatFileSize(MAX_ATTACHMENT_SIZE)} each.
                      </p>
                      <span className="mt-3 inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium">
                        {t("submit.chooseFiles")}
                      </span>
                      <input type="file" multiple accept="image/*,.pdf,application/pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {files.map((file, i) => (
                          <Badge key={`${file.name}-${i}`} variant="secondary" className="gap-1.5 pr-1">
                            <span className="max-w-[14rem] truncate">{file.name} ({formatFileSize(file.size)})</span>
                            <button
                              type="button"
                              onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="ml-1 rounded-full p-0.5 hover:bg-muted"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("submit.streetAddress")} <span className="text-destructive">*</span></Label>
                    <Input id="address" placeholder={t("submit.addressPlaceholder")} value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="area">{t("submit.area")}</Label>
                      <Input id="area" placeholder={t("submit.areaPlaceholder")} value={area} onChange={(e) => setArea(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("submit.city")}</Label>
                      <Input id="city" placeholder="Dhaka" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">{t("submit.latitude")}</Label>
                      <Input id="latitude" inputMode="decimal" placeholder="23.810331" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">{t("submit.longitude")}</Label>
                      <Input id="longitude" inputMode="decimal" placeholder="90.412521" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleUseCurrentLocation} disabled={locationLoading}>
                      <LocateFixed className="h-4 w-4" />
                      {locationLoading ? t("submit.readingLocation") : t("submit.useCurrentLocation")}
                    </Button>
                    {hasCoordinates && (
                      <Button type="button" variant="ghost" size="sm" asChild className="gap-2">
                        <a href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          {t("submit.openMap")}
                        </a>
                      </Button>
                    )}
                  </div>
                  {hasCoordinates && (
                    <div className="overflow-hidden rounded-lg border">
                      <iframe title={t("submit.mapTitle")} src={mapSrc} className="h-56 w-full" loading="lazy" />
                    </div>
                  )}
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{t("submit.locationPreview")}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{location || t("submit.locationFallback")}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{t("submit.locationHelp")}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("submit.fullName")} <span className="text-destructive">*</span></Label>
                    <Input id="name" placeholder={t("submit.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("submit.email")} <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" placeholder={t("submit.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("submit.phone")}</Label>
                    <Input id="phone" type="tel" placeholder="+880 1XXX XXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  {!user && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t("submit.guestSubmitInfo") || "You can submit this complaint without an account. Your ticket ID will be provided for tracking."}
                      </p>
                      <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        {t("submit.createAccountInfo") || "Want to create an account to manage your complaints? You can do so after submitting this one."}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 space-y-2 rounded-lg border bg-muted/50 p-4">
                    <h4 className="text-sm font-medium">{t("submit.review")}</h4>
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t("submit.stepCategory")}</span>
                        <span className="text-right font-medium">{selectedCategory?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t("submit.titleLabel")}</span>
                        <span className="max-w-[260px] truncate text-right font-medium">{title || "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{t("submit.stepLocation")}</span>
                        <span className="max-w-[260px] truncate text-right font-medium">{location || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("submit.attachments")}</span>
                        <span className="font-medium">{files.length} {t("submit.files")}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) {
                  window.dispatchEvent(new Event("civicdesk:navigation-start"));
                  router.push("/");
                } else {
                  setStep(step - 1);
                }
              }}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? t("submit.cancel") : t("submit.back")}
            </Button>

            {step < 4 ? (
              <div className="flex flex-col items-end gap-2">
                {error && <p className="max-w-[18rem] text-right text-sm text-destructive">{error}</p>}
                <Button onClick={nextStep} className="gap-1.5">
                  {t("submit.next")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {error && <p className="max-w-[18rem] text-right text-sm text-destructive">{error}</p>}
                <Button onClick={handleSubmit} className="gap-1.5" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {isSubmitting ? t("submit.submitting") : t("home.submitCta")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
  );
}
