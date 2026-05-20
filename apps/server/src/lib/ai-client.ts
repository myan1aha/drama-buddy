import OpenAI from 'openai';

// ============================================================
// AI Client — Multi-provider support
// OpenAI / DeepSeek / MiniMax / Kimi / Doubao / Ollama / Custom
// ============================================================

export type AIProvider =
  | 'openai'
  | 'deepseek'
  | 'minimax'
  | 'kimi'
  | 'doubao'
  | 'ollama'
  | 'custom';

export type ASRProvider = 'openai' | 'doubao' | 'none';

interface AIClientConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL: string;
  model: string;
  visionModel: string;
  maxRetries: number;
  timeout: number;
  supportsVision: boolean;
  // ASR
  asrProvider: ASRProvider;
  asrApiKey: string;
  asrAppId: string;
}

const PROVIDER_PRESETS: Record<AIProvider, Partial<AIClientConfig>> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    supportsVision: true,
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    visionModel: 'deepseek-chat',
    supportsVision: true,
  },
  minimax: {
    baseURL: 'https://api.minimax.chat/v1',
    model: 'MiniMax-Text-01',
    visionModel: 'MiniMax-Text-01',
    supportsVision: true,
  },
  kimi: {
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    visionModel: 'moonshot-v1-8k-vision-preview',
    supportsVision: true,
  },
  doubao: {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-1.5-pro-32k',
    visionModel: 'doubao-1.5-vision-pro-32k',
    supportsVision: true,
  },
  ollama: {
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    model: 'llama3.1',
    visionModel: 'llava',
    supportsVision: true,
  },
  custom: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    supportsVision: true,
  },
};

function resolveConfig(): AIClientConfig {
  const provider = (process.env.AI_PROVIDER || 'openai') as AIProvider;
  const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.openai;

  // ASR provider: default to openai if available, doubao if AI_PROVIDER=doubao
  let asrProvider: ASRProvider = 'none';
  if (process.env.ASR_PROVIDER) {
    asrProvider = process.env.ASR_PROVIDER as ASRProvider;
  } else if (provider === 'openai') {
    asrProvider = 'openai';
  } else if (provider === 'doubao') {
    asrProvider = 'doubao';
  }

  return {
    provider,
    apiKey: process.env.OPENAI_API_KEY || preset.apiKey || '',
    baseURL: process.env.OPENAI_BASE_URL || preset.baseURL!,
    model: process.env.AI_MODEL || preset.model!,
    visionModel: process.env.VISION_MODEL || preset.visionModel!,
    maxRetries: Number(process.env.AI_MAX_RETRIES) || 3,
    timeout: Number(process.env.AI_TIMEOUT_MS) || 30000,
    supportsVision: preset.supportsVision ?? true,
    asrProvider,
    asrApiKey: process.env.ASR_API_KEY || process.env.OPENAI_API_KEY || '',
    asrAppId: process.env.DOUBAO_ASR_APP_ID || '',
  };
}

const config = resolveConfig();

const client = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
  maxRetries: config.maxRetries,
  timeout: config.timeout,
});

// ============================================================
// Chat Streaming
// ============================================================

export interface StreamChatOptions {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function* streamChat(
  options: StreamChatOptions
): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: options.model || config.model,
    stream: true,
    messages: [
      { role: 'system', content: options.systemPrompt },
      ...options.messages,
    ],
    temperature: options.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? 512,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

// ============================================================
// Non-streaming Chat
// ============================================================

export interface ChatOptions {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chat(options: ChatOptions): Promise<string> {
  const response = await client.chat.completions.create({
    model: options.model || config.model,
    messages: [
      { role: 'system', content: options.systemPrompt },
      ...options.messages,
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 128,
  });

  return response.choices[0]?.message?.content || '';
}

// ============================================================
// Vision (OCR / Scene Analysis)
// ============================================================

export interface VisionOptions {
  imageBase64: string;
  mimeType?: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
}

export async function analyzeImage(options: VisionOptions): Promise<string> {
  if (!config.supportsVision) {
    throw new Error(
      `Provider "${config.provider}" does not support vision.`
    );
  }

  const dataUrl = `data:${options.mimeType || 'image/jpeg'};base64,${options.imageBase64}`;

  const response = await client.chat.completions.create({
    model: config.visionModel,
    messages: [
      ...(options.systemPrompt
        ? [{ role: 'system' as const, content: options.systemPrompt }]
        : []),
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: dataUrl, detail: 'low' as const },
          },
          { type: 'text', text: options.prompt },
        ],
      },
    ],
    max_tokens: options.maxTokens ?? 300,
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || '';
}

// ============================================================
// Speech-to-Text (ASR)
// Supports: OpenAI Whisper / 豆包 SeedASR
// ============================================================

export async function transcribeAudio(
  file: File,
  lang: string = 'zh'
): Promise<string> {
  if (config.asrProvider === 'openai') {
    return transcribeWithWhisper(file, lang);
  } else if (config.asrProvider === 'doubao') {
    return transcribeWithDoubao(file, lang);
  }
  throw new Error(
    'No ASR provider configured. Set ASR_PROVIDER=openai or ASR_PROVIDER=doubao in env.'
  );
}

/** OpenAI Whisper */
async function transcribeWithWhisper(file: File, lang: string): Promise<string> {
  // Use a dedicated OpenAI client for Whisper if ASR key differs
  const whisperClient =
    config.asrApiKey !== config.apiKey
      ? new OpenAI({ apiKey: config.asrApiKey, baseURL: 'https://api.openai.com/v1' })
      : client;

  const transcription = await whisperClient.audio.transcriptions.create({
    file,
    model: process.env.WHISPER_MODEL || 'whisper-1',
    language: lang.split('-')[0],
    response_format: 'json',
  });

  return transcription.text;
}

/** 豆包 SeedASR (火山引擎大模型语音识别) */
async function transcribeWithDoubao(file: File, lang: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Audio = buffer.toString('base64');

  // Determine format from file type
  const formatMap: Record<string, string> = {
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/webm': 'ogg',
  };
  const format = formatMap[file.type] || 'wav';

  const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Submit recognition task
  const submitHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Api-Key': config.asrApiKey,
    'X-Api-Resource-Id': 'volc.seedasr.auc',
    'X-Api-Request-Id': taskId,
    'X-Api-Sequence': '-1',
  };

  if (config.asrAppId) {
    submitHeaders['X-Api-App-Key'] = config.asrAppId;
  }

  const payload = {
    audio: {
      format,
      data: base64Audio,
    },
    additions: {
      language: lang === 'zh' ? 'zh-CN' : lang,
      enable_punc: true,
    },
  };

  const response = await fetch(
    'https://openspeech.bytedance.com/api/v3/sauc/bigmodel',
    {
      method: 'POST',
      headers: submitHeaders,
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Doubao ASR failed (${response.status}): ${errText}`);
  }

  const result = await response.json();

  // SeedASR returns result in `result.text` or `payload_msg.result.text`
  const text =
    result?.result?.text ||
    result?.payload_msg?.result?.text ||
    result?.text ||
    '';

  if (!text) {
    throw new Error('Doubao ASR returned empty result');
  }

  return text;
}

// ============================================================
// Health Check
// ============================================================

export async function checkHealth(): Promise<{
  ok: boolean;
  provider: AIProvider;
  model: string;
  asrProvider: ASRProvider;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
      temperature: 0,
    });
    return {
      ok: true,
      provider: config.provider,
      model: config.model,
      asrProvider: config.asrProvider,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      ok: false,
      provider: config.provider,
      model: config.model,
      asrProvider: config.asrProvider,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// Exports
// ============================================================

export { config as aiConfig, client as openaiClient };
