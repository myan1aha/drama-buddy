import type { DramaKnowledge } from '@drama-buddy/shared/knowledge';

/**
 * 《漫长的季节》知识库
 */
export const manchangdejijie: DramaKnowledge = {
  id: 'manchangdejijie',
  title: '漫长的季节',
  aliases: ['漫长的季节', 'The Long Season'],
  totalEpisodes: 12,
  genre: ['悬疑', '犯罪', '文艺'],
  year: 2023,
  synopsis: '东北小城，三个时空交织，围绕一桩碎尸案展开的群像故事。',
  characters: [
    {
      name: '王响',
      actor: '范伟',
      description: '桦林钢铁厂火车司机，热心肠但命运坎坷的中年男人。',
      personality: '乐观、倔强、重情义、固执',
      firstAppearance: 1,
    },
    {
      name: '龚彪',
      actor: '秦昊',
      description: '王响的徒弟/好友，出租车司机，有点不靠谱但讲义气。',
      personality: '油嘴滑舌、重感情、有点怂',
      firstAppearance: 1,
    },
    {
      name: '马德胜',
      actor: '陈明昊',
      description: '刑警队长，退休后仍放不下当年的案子。',
      personality: '正义、执着、暴脾气',
      firstAppearance: 1,
    },
    {
      name: '王阳',
      actor: '刘奕铁',
      description: '王响的儿子，大学生，与案件有关。',
      personality: '敏感、善良、纠结',
      firstAppearance: 2,
    },
    {
      name: '沈墨',
      actor: '李庚希',
      description: '神秘女大学生，案件核心人物。',
      personality: '聪明、隐忍、有创伤',
      firstAppearance: 2,
    },
    {
      name: '殷红',
      actor: '林晓杰',
      description: '龚彪的前妻。',
      personality: '现实、泼辣',
      firstAppearance: 3,
    },
  ],
  relationships: [
    { from: '王响', to: '龚彪', type: 'friend', description: '师徒兼好友，一辈子的交情', revealedAt: 1 },
    { from: '王响', to: '马德胜', type: 'friend', description: '因案件结缘的老友', revealedAt: 1 },
    { from: '王响', to: '王阳', type: 'family', description: '父子', revealedAt: 1 },
    { from: '王阳', to: '沈墨', type: 'couple', description: '大学恋人，命运纠葛', revealedAt: 3 },
    { from: '龚彪', to: '殷红', type: 'ex', description: '前夫妻', revealedAt: 3 },
  ],
  plotPoints: [
    { episode: 1, summary: '2016年，退休的王响、龚彪、马德胜三人重新聚首，一段往事被揭开。', keyMoments: ['三人视频通话', '往事闪回'] },
    { episode: 3, summary: '1997年时间线：王阳认识沈墨，桦钢面临改制。' },
    { episode: 6, summary: '碎尸案浮出水面，三条时间线逐渐交汇。' },
    { episode: 9, summary: '真相逐渐清晰，王响发现儿子与案件的关联。' },
    { episode: 12, summary: '大结局，"往前看，别回头"。', keyMoments: ['玉米地', '火车'] },
  ],
  notes: '三个时空（1997/1998/2016）交叉叙事。导演辛爽。片尾曲"恰似你的温柔"。核心主题是"放下"。',
};
