import React, { useState } from "react";
import { generateEmoji } from "@/lib/ai-service";

export function EmojiGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      const response = await generateEmoji(prompt);
      if (response.success) {
        setResult(response.imageUrl);
      } else {
        setError(
          response.error || "Failed to generate emoji. Please try again."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emoji-${prompt
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download the image. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700"
          >
            Describe your emoji
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., happy cat with rainbow"
            required
            disabled={isGenerating}
          />
        </div>
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Emoji"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="relative aspect-square w-full max-w-md mx-auto border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={result}
              alt={`Generated emoji for ${prompt}`}
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Download Emoji
          </button>
        </div>
      )}
    </div>
  );
}
