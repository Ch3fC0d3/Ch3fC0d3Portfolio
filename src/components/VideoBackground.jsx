import React, { useEffect } from 'react';

/**
 * Background video with canvas fallback.
 * Expects assets to be available from public/ as:
 *  - /butter.mp4
 *  - /butter.png (poster)
 */
export default function VideoBackground({ videoRef, canvasRef, useCanvasBackground, onVideoError }) {
  // Use absolute URLs so it works behind preview proxies (e.g., Windsurf Browser)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const videoSrc = origin ? `${origin}/butter.mp4` : '/butter.mp4';
  const videoSrcWebm = origin ? `${origin}/butter.webm` : '/butter.webm';
  const posterSrc = origin ? `${origin}/butter.png` : '/butter.png';

  // In some preview proxy environments, direct media playback fails due to Range or codec handling.
  // Proactively fetch as Blob and use an object URL when running via 127.0.0.1 proxy.
  useEffect(() => {
    const el = videoRef?.current;
    if (!el) return;
    let objectUrl = '';

    const shouldForceBlob = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1';
    if (!shouldForceBlob) return;

    (async () => {
      try {
        const res = await fetch(videoSrc, { cache: 'no-store' });
        if (res.ok) {
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          // Prefer setting source child when present
          const srcEl = el.querySelector('source');
          if (srcEl) srcEl.src = objectUrl; else el.src = objectUrl;
          el.load();
          await el.play().catch(() => {});
          console.warn('[VideoBackground] Forced blob URL for proxy playback');
        }
      } catch (err) {
        console.warn('[VideoBackground] Forced blob fetch failed:', err);
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoRef, videoSrc]);
  return (
    <div 
      className="video-container" 
      aria-hidden="true"
      data-use-canvas={useCanvasBackground ? 'true' : 'false'}
    >
      <video
        ref={videoRef}
        className="video-background"
        poster={posterSrc}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => console.log('[VideoBackground] Video loaded and ready to play')}
        onError={async (e) => {
          const el = e.currentTarget;
          const err = el && el.error; // MediaError
          let detail = '';
          if (err) {
            const codes = { 1: 'MEDIA_ERR_ABORTED', 2: 'MEDIA_ERR_NETWORK', 3: 'MEDIA_ERR_DECODE', 4: 'MEDIA_ERR_SRC_NOT_SUPPORTED' };
            detail = ` code=${err.code} (${codes[err.code] || 'UNKNOWN'})`;
          }
          console.error('[VideoBackground] Video error', detail, { readyState: el?.readyState, networkState: el?.networkState, src: el?.currentSrc });

          // Fallback: fetch the video as a Blob and use an object URL.
          // This avoids proxy issues with Range requests or direct media fetch in some preview environments.
          if (el && !el.dataset.loadedFromBlob) {
            try {
              el.dataset.loadedFromBlob = '1';
              const res = await fetch(videoSrc, { cache: 'no-store' });
              if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const srcEl = el.querySelector('source');
                if (srcEl) srcEl.src = url;
                else el.src = url;
                el.load();
                await el.play().catch(() => {});
                console.warn('[VideoBackground] Using blob URL fallback for video.');
                return;
              }
            } catch (blobErr) {
              console.warn('[VideoBackground] Blob fallback failed:', blobErr);
            }
          }
          if (typeof onVideoError === 'function') onVideoError(e);
        }}
      >
        {/* Prefer WebM first for environments without H.264/MP4 codecs (e.g., some Electron builds) */}
        <source src={videoSrcWebm} type="video/webm" />
        <source src={videoSrc} type="video/mp4" />
        {/* Additional sources can be added here if needed */}
      </video>

      {/* Canvas fallback overlay; visibility controlled via opacity from App */}
      <canvas
        ref={canvasRef}
        className="canvas-background"
        aria-hidden
      />
    </div>
  );
}
