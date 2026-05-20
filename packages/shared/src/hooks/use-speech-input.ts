/**
 * 语音输入 Hook
 * 方案1：浏览器原生 Web Speech API（零成本，实时性好）
 * 方案2：录音 → 上传到服务端 Whisper API（准确度高，支持方言）
 */
import { useState, useCallback, useRef } from 'react';

export type SpeechMode = 'browser' | 'whisper';

interface UseSpeechInputOptions {
  serverUrl: string;
  mode?: SpeechMode;
  lang?: string;
  onResult?: (text: string) => void;
  onInterim?: (text: string) => void;
}

interface UseSpeechInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  supported: boolean;
}

export function useSpeechInput({
  serverUrl,
  mode = 'browser',
  lang = 'zh-CN',
  onResult,
  onInterim,
}: UseSpeechInputOptions): UseSpeechInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 检测浏览器 Speech API 支持
  const supported =
    mode === 'browser'
      ? typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
      : typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  // 方案1：浏览器原生 Web Speech API
  const startBrowserSpeech = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('浏览器不支持语音识别');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
        onInterim?.(interim);
      }

      if (final) {
        setTranscript(final);
        setInterimTranscript('');
        onResult?.(final);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`语音识别错误: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setError(null);
  }, [lang, onResult, onInterim]);

  // 方案2：录音 → Whisper API
  const startWhisperRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // 停止所有音轨
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // 上传到服务端 Whisper
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          formData.append('lang', lang);

          const res = await fetch(`${serverUrl}/api/speech`, {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (data.text) {
            setTranscript(data.text);
            onResult?.(data.text);
          } else if (data.error) {
            setError(data.error);
          }
        } catch (err) {
          setError(`上传失败: ${(err as Error).message}`);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // 每秒一个 chunk
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError(`麦克风访问失败: ${(err as Error).message}`);
    }
  }, [serverUrl, lang, onResult]);

  const startListening = useCallback(() => {
    if (mode === 'browser') {
      startBrowserSpeech();
    } else {
      startWhisperRecording();
    }
  }, [mode, startBrowserSpeech, startWhisperRecording]);

  const stopListening = useCallback(() => {
    if (mode === 'browser' && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    } else if (mode === 'whisper' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsListening(false);
  }, [mode]);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    error,
    supported,
  };
}
