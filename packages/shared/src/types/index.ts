/** AI 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'system';

/** 单条对话消息 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

/** 看剧上下文 */
export interface DramaContext {
  /** 剧名 */
  title: string;
  /** 当前集数 */
  episode?: number;
  /** 当前时间戳（秒） */
  currentTime?: number;
  /** 用户手动输入的剧情描述 */
  sceneDescription?: string;
}

/** SSE 事件类型 */
export type SSEEventType = 'token' | 'done' | 'error' | 'pet_update';

export interface SSEEvent {
  type: SSEEventType;
  data: string | Record<string, any>;
  meta?: Record<string, any>;
}

/** 发送给后端的请求体 */
export interface ChatRequest {
  messages: ChatMessage[];
  context: DramaContext;
}

/** Pet update pushed via SSE during chat */
export interface PetUpdateEvent {
  level: number;
  stage: string;
  mood: string;
  exp: number;
  expToNext: number;
  leveledUp: boolean;
  evolved: boolean;
  newStage?: string;
}
