import { useState } from "react";
import "./App.css";

// LOCAL:
// Leave VITE_API_URL empty.
// Vite will proxy /download to localhost:3000.
//
// PRODUCTION:
// VITE_API_URL=https://api.yourdomain.com
const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function App() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const videoUrl = url.trim();

    if (!videoUrl || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setStatus("Converting your MP3...");

    try {
      const response = await fetch(`${apiBaseUrl}/download`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          url: videoUrl,
        }),
      });

      // API ERROR

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.error || "API Backend - Oops! MP3 conversion failed. Please try again ",
        );
      }

      // GET MP3 FILE

      const blob = await response.blob();

      // Get real filename from Express res.download().
      const contentDisposition = response.headers.get("content-disposition");

      let fileName = "audio.mp3";

      if (contentDisposition) {
        // UTF-8 filename
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/);

        // Normal filename
        const normalMatch = contentDisposition.match(/filename="?([^";]+)"?/);

        try {
          if (utf8Match?.[1]) {
            fileName = decodeURIComponent(utf8Match[1]);
          } else if (normalMatch?.[1]) {
            fileName = normalMatch[1];
          }
        } catch {
          fileName = "audio.mp3";
        }
      }

      // TRIGGER BROWSER DOWNLOAD

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      // Give browser time before removing blob URL.
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);

      setStatus("Your MP3 download has started.");

      setUrl("");
    } catch (error) {
      console.error(error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="converter" aria-labelledby="page-title">
        <p className="eyebrow">AUDIO DOWNLOADER</p>

        <h1 id="page-title">
          YouTube <span>→</span> MP3.
        </h1>

        <p className="description">
          Paste your YouTube URL below and convert it to MP3.
        </p>

        <form className="download-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="video-url">
            YouTube video URL
          </label>

          <input
            id="video-url"
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setStatus("");
            }}
            placeholder="https://youtube.com/watch?v=..."
            autoComplete="off"
            disabled={isDownloading}
            required
          />

          <button type="submit" disabled={isDownloading || !url.trim()}>
            {isDownloading ? "CONVERTING…" : "DOWNLOAD MP3 ↗"}
          </button>
        </form>

        <p className="status" role="status" aria-live="polite">
          {status}
        </p>
      </section>

      <footer>
        <p>
          Developed by <strong>SEM Bunly</strong>
        </p>

        <nav aria-label="Social links">
          <a
            href="https://www.facebook.com/sem.bunlisem.14jan"
            target="_blank"
            rel="noreferrer"
          >
            FACEBOOK ↗
          </a>

          <span aria-hidden="true"> / </span>

          <a href="https://t.me/bunly_sem" target="_blank" rel="noreferrer">
            TELEGRAM ↗
          </a>
        </nav>
      </footer>
    </main>
  );
}

export default App;
