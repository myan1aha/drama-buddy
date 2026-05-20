/**
 * 角色知识库类型定义
 */

/** 单个角色 */
export interface Character {
  name: string;
  aliases?: string[];        // 别名/昵称
  actor?: string;            // 演员
  description: string;       // 角色简介
  personality?: string;      // 性格特点
  /** 角色首次出场集数（用于防剧透） */
  firstAppearance?: number;
}

/** 角色关系 */
export interface Relationship {
  from: string;              // 角色名
  to: string;                // 角色名
  type: RelationshipType;
  description?: string;      // 关系补充说明
  /** 该关系从第几集开始揭示 */
  revealedAt?: number;
}

export type RelationshipType =
  | 'couple'       // 情侣/夫妻
  | 'ex'           // 前任
  | 'family'       // 家人
  | 'friend'       // 朋友
  | 'rival'        // 对手/竞争
  | 'colleague'    // 同事
  | 'mentor'       // 师徒
  | 'enemy'        // 敌对
  | 'secret'       // 隐秘关系
  | 'other';

/** 剧集关键事件（按集数索引） */
export interface PlotPoint {
  episode: number;
  summary: string;           // 本集核心事件
  keyMoments?: string[];     // 关键时刻
}

/** 一部剧的完整知识库 */
export interface DramaKnowledge {
  id: string;                // 唯一标识 slug
  title: string;             // 剧名
  aliases?: string[];        // 别名（用于模糊匹配）
  totalEpisodes: number;
  genre: string[];
  year: number;
  synopsis: string;          // 一句话简介
  characters: Character[];
  relationships: Relationship[];
  plotPoints?: PlotPoint[];
  /** 自定义补充信息（风格、彩蛋等） */
  notes?: string;
}

/** 根据当前进度过滤后的知识 */
export interface FilteredKnowledge {
  title: string;
  currentEpisode: number;
  characters: Character[];
  relationships: Relationship[];
  plotSoFar: PlotPoint[];
}
