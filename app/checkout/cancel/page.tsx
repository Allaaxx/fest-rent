"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-center">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Payment Cancelled
          </CardTitle>
          <CardDescription>Your checkout session was cancelled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300">
            You can return to your rental and try again whenever you&apos;re
            ready.
          </p>
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                variant="outline"
                className="w-full border-slate-400 text-white hover:bg-slate-700 bg-transparent"
              >
                Browse Equipment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
