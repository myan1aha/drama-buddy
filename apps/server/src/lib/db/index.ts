/**
 * SQLite 持久化层
 * 使用 better-sqlite3 同步 API (适合 Next.js server-side)
 * 存储: 用户宠物状态 + 对话历史 + 看剧记录
 */

import Database from 'better-sqlite3';
import path from 'path';
import type { PetState } from '@drama-buddy/shared/pet';

// DB 文件路径: 项目根目录下 data/drama-buddy.db
const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), 'data', 'drama-buddy.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    // 确保目录存在
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('synchronous = NORMAL');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      room_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      drama_title TEXT,
      episode INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_chat_user_room
      ON chat_history(user_id, room_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS drama_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      drama_title TEXT NOT NULL,
      episode INTEGER,
      started_at INTEGER NOT NULL DEFAULT (unixepoch()),
      ended_at INTEGER,
      total_messages INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user
      ON drama_sessions(user_id, started_at DESC);
  `);
}

// ============================================================
// Pet CRUD
// ============================================================

export function getPet(userId: string): PetState | null {
  const db = getDb();
  const row = db.prepare('SELECT data FROM pets WHERE user_id = ?').get(userId) as
    | { data: string }
    | undefined;
  if (!row) return null;
  return JSON.parse(row.data) as PetState;
}

export function savePet(userId: string, pet: PetState): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO pets (user_id, data, updated_at)
     VALUES (?, ?, unixepoch())
     ON CONFLICT(user_id)
     DO UPDATE SET data = excluded.data, updated_at = unixepoch()`
  ).run(userId, JSON.stringify(pet));
}

export function deletePet(userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM pets WHERE user_id = ?').run(userId);
}

// ============================================================
// Chat History
// ============================================================

export interface ChatHistoryRow {
  id: number;
  user_id: string;
  room_id: string | null;
  role: string;
  content: string;
  drama_title: string | null;
  episode: number | null;
  created_at: number;
}

export function appendChatMessage(params: {
  userId: string;
  roomId?: string;
  role: 'user' | 'assistant';
  content: string;
  dramaTitle?: string;
  episode?: number;
}): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO chat_history (user_id, room_id, role, content, drama_title, episode)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    params.userId,
    params.roomId || null,
    params.role,
    params.content,
    params.dramaTitle || null,
    params.episode || null
  );
}

export function getChatHistory(
  userId: string,
  options?: { roomId?: string; limit?: number; before?: number }
): ChatHistoryRow[] {
  const db = getDb();
  const limit = options?.limit || 50;

  if (options?.roomId) {
    if (options?.before) {
      return db
        .prepare(
          `SELECT * FROM chat_history
           WHERE user_id = ? AND room_id = ? AND created_at < ?
           ORDER BY created_at DESC LIMIT ?`
        )
        .all(userId, options.roomId, options.before, limit) as ChatHistoryRow[];
    }
    return db
      .prepare(
        `SELECT * FROM chat_history
         WHERE user_id = ? AND room_id = ?
         ORDER BY created_at DESC LIMIT ?`
      )
      .all(userId, options.roomId, limit) as ChatHistoryRow[];
  }

  return db
    .prepare(
      `SELECT * FROM chat_history
       WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit) as ChatHistoryRow[];
}

// ============================================================
// Drama Sessions
// ============================================================

export function startSession(userId: string, dramaTitle: string, episode?: number): number {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO drama_sessions (user_id, drama_title, episode)
       VALUES (?, ?, ?)`
    )
    .run(userId, dramaTitle, episode || null);
  return Number(result.lastInsertRowid);
}

export function endSession(sessionId: number, totalMessages: number): void {
  const db = getDb();
  db.prepare(
    `UPDATE drama_sessions SET ended_at = unixepoch(), total_messages = ? WHERE id = ?`
  ).run(totalMessages, sessionId);
}

export function getRecentSessions(userId: string, limit = 10) {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM drama_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

// ============================================================
// Export DB reference for advanced queries
// ============================================================

export { getDb };
