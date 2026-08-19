import { useState } from 'react'
import './App.css'


const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('320')
  const [status, setStatus] = useState('')
  const [statusType, setStatusType] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()

      setUrl(text.slice(0, 200))
      setStatus('')
      setStatusType('')
    } catch {
      document.getElementById('video-url')?.focus()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const videoUrl = url.trim()

    if (!videoUrl) {
      setStatus('Paste a YouTube URL first.')
      setStatusType('error')
      document.getElementById('video-url')?.focus()
      return
    }

    if (isDownloading) return

    setIsDownloading(true)
    setStatus('Processing your MP3…')
    setStatusType('')

    try {
      const response = await fetch(
        `${API_URL}/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: videoUrl,
            quality,
          }),
        }
      )

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}))

        throw new Error(
          data.error ||
            ' Download failed. Please try again.'
        )
      }

      const blob = await response.blob()

      const contentDisposition =
        response.headers.get(
          'content-disposition'
        )

      let fileName = 'audio.mp3'

      if (contentDisposition) {
        const utf8Match =
          contentDisposition.match(
            /filename\*=UTF-8''([^;]+)/
          )

        const normalMatch =
          contentDisposition.match(
            /filename="?([^";]+)"?/
          )

        try {
          if (utf8Match?.[1]) {
            fileName = decodeURIComponent(
              utf8Match[1]
            )
          } else if (normalMatch?.[1]) {
            fileName = normalMatch[1]
          }
        } catch {
          fileName = 'audio.mp3'
        }
      }

      const downloadUrl =
        URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = downloadUrl
      link.download = fileName

      document.body.appendChild(link)

      link.click()
      link.remove()

      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl)
      }, 1000)

      setStatus('✓ Ready — your MP3 download has started.')
      setStatusType('success')
      setUrl('')
    } catch (error) {
      console.error(error)

      setStatus(
        error instanceof Error
          ? `API Backend ${error.message}`
          : 'API Backend Something went wrong.'
      )

      setStatusType('error')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <main className="page">
      <div className="eyebrow">
        <span className="dot" />
        AUDIO DOWNLOADER
      </div>

      <h1>
        YouTube
        <span className="arrow">→</span>
        <span className="to">MP3</span>
      </h1>

      <p className="sub">
        Paste a YouTube link, pick a quality,
        get the audio file. No sign-up, no queue.
      </p>

      <form
        className="card"
        onSubmit={handleSubmit}
      >
        <div className="field-label">
          <span>Source URL</span>
          <span>{url.length} / 200</span>
        </div>

        <div className="input-row">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>

          <input
            id="video-url"
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(
                event.target.value.slice(0, 200)
              )
              setStatus('')
              setStatusType('')
            }}
            placeholder="https://youtube.com/watch?v=..."
            maxLength={200}
            autoComplete="off"
            disabled={isDownloading}
          />

          <button
            className="paste-btn"
            type="button"
            onClick={handlePaste}
            disabled={isDownloading}
          >
            PASTE
          </button>
        </div>

        <div className="options">
          {['320', '192', '128'].map(
            (item) => (
              <button
                key={item}
                type="button"
                className={`chip ${
                  quality === item
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setQuality(item)
                }
                disabled={isDownloading}
              >
                {item} kbps
              </button>
            )
          )}
        </div>

        <button
          className="convert-btn"
          type="submit"
          disabled={isDownloading}
        >
          <span className="bars">
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>

          {isDownloading
            ? 'Converting…'
            : 'Download MP3'}
        </button>

        <div
          className={`status ${statusType}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </div>
      </form>

      <footer>
        <div>
          Developed by{' '}
          <span className="name">
            SEM Bunly
          </span>
        </div>

        <div className="links">
          <a
            href="https://www.facebook.com/sem.bunlisem.14jan"
            target="_blank"
            rel="noreferrer"
          >
            Facebook ↗
          </a>

          <a
            href="https://t.me/bunly_sem"
            target="_blank"
            rel="noreferrer"
          >
            Telegram ↗
          </a>
        </div>
      </footer>
    </main>
  )
}

export default App
