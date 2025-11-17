"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  price_per_day: number;
  image_url: string | null;
  available: boolean;
  owner_id: string;
}

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

export default function BrowsePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        let query = supabase
          .from("equipment")
          .select("*")
          .eq("available", true);

        if (selectedCategory && selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        const { data, error } = await query;

        if (error) throw error;

        let filtered = (data as Equipment[]) || [];
        if (searchTerm) {
          filtered = filtered.filter((item: Equipment) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setEquipment(filtered);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [selectedCategory, searchTerm, supabase]);

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
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-col md:flex-row">
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          <Select
            value={selectedCategory || "all"}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white">
                All Categories
              </SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-white">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <Spinner className="text-blue-500" />
          </div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-300 text-lg">No equipment found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {equipment.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="block w-full"
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-blue-600 cursor-pointer transition-all h-full mx-auto w-full max-w-[720px]">
                  <div className="w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-slate-700 overflow-hidden rounded-t-lg">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-200 ease-out hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        No image
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-400">{item.category}</p>
                    <p className="text-blue-400 font-bold mt-2">
                      ${item.price_per_day}/day
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
