"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import /*Alert, AlertDescription*/ "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

const CATEGORIES = [
  "Audio",
  "Video",
  "Lighting",
  "Tent",
  "Table",
  "Chair",
  "Decoration",
  "Other",
];

export default function AddEquipmentPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast, dismiss } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dismiss();

    if (!name || !category || !pricePerDay) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let uploadedImageUrl: string | null = null;
      if (file) {
        // Upload via server endpoint which uses the service role key
        const formData = new FormData();
        formData.append("file", file);

        console.log(
          "Uploading file to /api/upload (server-side upload)",
          file.name
        );
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => null);
          throw new Error(errBody?.error || "Server upload failed");
        }

        const uploadJson = await uploadRes.json();
        console.log("uploadJson:", uploadJson);
        // Prefer publicUrl, fall back to signedUrl when bucket is private
        uploadedImageUrl = uploadJson.publicUrl ?? uploadJson.signedUrl ?? null;
      }
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          price_per_day: Number.parseFloat(pricePerDay),
          image_url: uploadedImageUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add equipment");
      }

      toast({
        title: "Equipment added",
        description: "Equipment added successfully!",
        variant: "default",
      });
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to add equipment";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    };
  }, [file]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            Fest
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Back to Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Add Equipment</CardTitle>
            <CardDescription>List a new equipment for rent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notifications are shown via toasts (Toaster mounted in layout) */}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Equipment Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Professional Microphone"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your equipment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-200">
                    Category *
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="text-white"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-200">
                    Price Per Day ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="150.00"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Image</Label>

                <div
                  role="button"
                  tabIndex={0}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dropped = e.dataTransfer?.files?.[0] ?? null;
                    if (!dropped) return;
                    // validate
                    if (!dropped.type.startsWith("image/")) {
                      toast({
                        title: "Invalid file",
                        description: "Please upload an image file",
                        variant: "destructive",
                      });
                      return;
                    }
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    if (dropped.size > maxSize) {
                      toast({
                        title: "File too large",
                        description: "File is too large (max 5MB)",
                        variant: "destructive",
                      });
                      return;
                    }
                    dismiss();
                    setFile(dropped);
                  }}
                  className="relative flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-slate-600 bg-slate-700/40 px-4 py-8 text-center text-slate-300 hover:border-slate-500 focus:outline-none"
                >
                  <div className="text-sm">
                    Arraste e solte uma imagem aqui, ou clique para selecionar
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (!f) return;
                      if (!f.type.startsWith("image/")) {
                        toast({
                          title: "Arquivo inválido",
                          description: "Por favor envie um arquivo de imagem",
                          variant: "destructive",
                        });
                        return;
                      }
                      const maxSize = 5 * 1024 * 1024;
                      if (f.size > maxSize) {
                        toast({
                          title: "Arquivo muito grande",
                          description: "Arquivo muito grande (máx. 5MB)",
                          variant: "destructive",
                        });
                        return;
                      }
                      dismiss();
                      setFile(f);
                    }}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                </div>

                {file && (
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 overflow-hidden rounded-md bg-slate-800">
                      {/* Preview using object URL (local preview) */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl ?? undefined}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-200">{file.name}</div>
                      <div className="text-slate-400 text-sm">
                        {(file.size / 1024).toFixed(0)} KB
                      </div>
                      <div className="mt-2 bg-slate-100 w-10 rounded-lg">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setFile(null);
                            dismiss();
                          }}
                        >
                          <Trash></Trash>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-6"
              >
                {isLoading ? "Adding equipment..." : "Add Equipment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
