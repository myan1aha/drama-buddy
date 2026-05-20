/**
 * 屏幕截图 + OCR Hook
 * 截取当前画面 → 发送到服务端 Vision API → 识别字幕/场景
 * 支持: Tauri native / Screen Capture API / Video frame / Canvas / File
 */
import { useState, useCallback } from 'react';

interface UseScreenOCROptions {
  serverUrl: string;
}

interface OCRResult {
  subtitles: string;
  sceneDescription: string;
  timestamp: number;
}

interface UseScreenOCRReturn {
  isProcessing: boolean;
  lastResult: OCRResult | null;
  captureAndRecognize: (imageSource?: ImageSource) => Promise<OCRResult | null>;
  error: string | null;
}

type ImageSource =
  | { type: 'file'; file: File }
  | { type: 'canvas'; canvas: HTMLCanvasElement }
  | { type: 'video'; videoElement: HTMLVideoElement }
  | { type: 'screen' };

/** Detect Tauri environment */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export function useScreenOCR({ serverUrl }: UseScreenOCROptions): UseScreenOCRReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureAndRecognize = useCallback(
    async (imageSource?: ImageSource): Promise<OCRResult | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        let imageBlob: Blob;

        if (!imageSource || imageSource.type === 'screen') {
          if (isTauri()) {
            // Tauri native screenshot via Rust command
            imageBlob = await captureTauriScreen();
          } else {
            // Browser Screen Capture API
            imageBlob = await captureScreenBrowser();
          }
        } else if (imageSource.type === 'video') {
          imageBlob = await captureVideoFrame(imageSource.videoElement);
        } else if (imageSource.type === 'canvas') {
          imageBlob = await canvasToBlob(imageSource.canvas);
        } else {
          imageBlob = imageSource.file;
        }

        // Send to server OCR endpoint
        const formData = new FormData();
        formData.append('image', imageBlob, 'screenshot.png');

        const res = await fetch(`${serverUrl}/api/ocr`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`OCR 请求失败: ${res.status}`);
        }

        const data = await res.json();
        const result: OCRResult = {
          subtitles: data.subtitles || '',
          sceneDescription: data.sceneDescription || '',
          timestamp: Date.now(),
        };

        setLastResult(result);
        return result;
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [serverUrl]
  );

  return { isProcessing, lastResult, captureAndRecognize, error };
}

// ============================================================
// Capture Methods
// ============================================================

/** Tauri native: call Rust capture_screen command */
async function captureTauriScreen(): Promise<Blob> {
  // Resolve the Tauri API only at runtime so shared code stays buildable
  // without taking a hard type-time dependency on desktop-only modules.
  const loadTauriCore = new Function(
    'return import("@tauri-apps/api/core")'
  ) as () => Promise<{ invoke: (cmd: string) => Promise<{ base64: string; width: number; height: number }> }>;
  const { invoke } = await loadTauriCore();

  const result = await invoke('capture_screen');

  // Convert base64 to Blob
  const binaryStr = atob(result.base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'image/png' });
}

/** Browser Screen Capture API */
async function captureScreenBrowser(): Promise<Blob> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { width: 1920, height: 1080 },
  });

  const track = stream.getVideoTracks()[0];
  const imageCapture = new (window as any).ImageCapture(track);
  const bitmap = await imageCapture.grabFrame();

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);

  // Stop screen share
  track.stop();

  return canvasToBlob(canvas);
}

/** Capture a frame from a video element */
async function captureVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1920;
  canvas.height = video.videoHeight || 1080;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0);
  return canvasToBlob(canvas);
}

/** Convert canvas to Blob */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.85
    );
  });
}
