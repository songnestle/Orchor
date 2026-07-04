"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function CreatePage() {
  const [step, setStep] = useState<"upload" | "configure" | "preview" | "deploy">("upload");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-bg/80 border-b border-white/5 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold gradient-text font-display">
            Create Skill Card
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Upload your .or package to mint a new skill card
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {["upload", "configure", "preview", "deploy"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-3 ${step === s ? "opacity-100" : "opacity-40"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s ? "bg-violet-600 text-white" : "glass text-gray-400"
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm font-semibold capitalize">{s}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px bg-white/10 mx-4" />}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-8"
          >
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl glass flex items-center justify-center">
                <svg className="w-12 h-12 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Upload .or Package</h2>
              <p className="text-gray-400 mb-6">
                Drop your skill package here or click to browse
              </p>
              <input
                type="file"
                accept=".or,application/json"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    setStep("configure");
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                Choose File
              </label>
            </div>
          </motion.div>
        )}

        {/* Configure Step */}
        {step === "configure" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Configure Card</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Card Name</label>
                <input type="text" placeholder="My Awesome Skill" className="w-full px-4 py-3 rounded-xl glass text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea placeholder="What does this skill do?" rows={4} className="w-full px-4 py-3 rounded-xl glass text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Price (ETH)</label>
                  <input type="number" placeholder="0.01" step="0.001" className="w-full px-4 py-3 rounded-xl glass text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Rarity</label>
                  <select className="w-full px-4 py-3 rounded-xl glass text-white">
                    <option>Common</option>
                    <option>Rare</option>
                    <option>Epic</option>
                    <option>Legendary</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep("upload")} className="px-6 py-3 rounded-xl glass text-white font-bold hover:bg-white/10 transition-all">
                  Back
                </button>
                <button onClick={() => setStep("preview")} className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all">
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview & Deploy steps placeholder */}
        {step === "preview" && (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Preview coming soon</h2>
            <button onClick={() => setStep("deploy")} className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold">
              Deploy
            </button>
          </div>
        )}

        {step === "deploy" && (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-white mb-2">Deploying...</h2>
            <p className="text-gray-400">Your skill card is being minted onchain</p>
          </div>
        )}
      </div>
    </div>
  );
}
