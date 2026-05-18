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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { mockCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const formSteps = [
  { id: 1, title: "Category", icon: FileText },
  { id: 2, title: "Details", icon: ClipboardCheck },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Contact", icon: User },
];

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  // Form state
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleFileAdd = () => {
    setFiles((prev) => [...prev, `photo_${prev.length + 1}.jpg`]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="mx-auto w-full max-w-md border text-center">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Complaint Submitted!</h2>
              <p className="text-sm text-muted-foreground">
                Your complaint has been registered successfully. Use the ticket
                ID below to track its progress.
              </p>
              <div className="w-full rounded-lg border bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Your Ticket ID</p>
                <p className="mt-1 text-2xl font-bold tracking-wider text-primary">
                  CVD-2026-0009
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                A confirmation email has been sent to {email || "your email"}.
              </p>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => router.push("/track?id=CVD-2026-0009")}
                >
                  Track Complaint
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              Submit a Complaint
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe your civic issue and we&apos;ll route it to the right
              department.
            </p>
          </div>

          {/* Step indicator */}
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
                      {step > s.id ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <s.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        step >= s.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                  {i < formSteps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-px flex-1",
                        step > s.id ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-lg">
                {formSteps[step - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Category */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Select Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name} — {cat.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {category && (
                    <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                      <p className="font-medium">{category}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Department:{" "}
                        {
                          mockCategories.find((c) => c.name === category)
                            ?.department
                        }{" "}
                        · SLA:{" "}
                        {
                          mockCategories.find((c) => c.name === category)
                            ?.sla_hours
                        }{" "}
                        hours
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of your complaint"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of the issue. Include when it started, how it affects you, and any other relevant information."
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments (Optional)</Label>
                    <div className="rounded-lg border-2 border-dashed p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Drag and drop files or click to browse
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleFileAdd}
                      >
                        Choose Files
                      </Button>
                    </div>
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {files.map((file, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="gap-1.5 pr-1"
                          >
                            {file}
                            <button
                              onClick={() =>
                                setFiles((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                )
                              }
                              className="ml-1 rounded-full p-0.5 hover:bg-muted"
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

              {/* Step 3: Location */}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="House/Building number, Road name"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area / Neighborhood</Label>
                      <Input
                        id="area"
                        placeholder="e.g. Dhanmondi, Uttara Sector 7"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Dhaka"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          Location preview
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[address, area, city].filter(Boolean).join(", ") ||
                            "House 12, Road 7, Uttara Sector 7, Dhaka"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          The assigned department will use this address to route
                          the complaint to the correct field office.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Contact */}
              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+880-1XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {/* Review summary */}
                  <div className="mt-4 space-y-2 rounded-lg border bg-muted/50 p-4">
                    <h4 className="text-sm font-medium">Review Your Complaint</h4>
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{category || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title</span>
                        <span className="font-medium truncate ml-4 max-w-[200px]">
                          {title || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">
                          {area || city || address || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attachments</span>
                        <span className="font-medium">{files.length} files</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => (step === 1 ? router.push("/") : setStep(step - 1))}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} className="gap-1.5">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Submit Complaint
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
