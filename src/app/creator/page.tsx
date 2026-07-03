"use client";

import { useState } from "react";
import { CreatorDashboard } from "@/components/CreatorDashboard";

export default function CreatorPage() {
  return (
    <div className="relative min-h-screen bg-bg text-white">
      <CreatorDashboard />
    </div>
  );
}
