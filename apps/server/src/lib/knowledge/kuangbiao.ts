import type { DramaKnowledge } from '@drama-buddy/shared/knowledge';

/**
 * 《狂飙》知识库
 */
export const kuangbiao: DramaKnowledge = {
  id: 'kuangbiao',
  title: '狂飙',
  aliases: ['狂飙', 'The Knockout'],
  totalEpisodes: 39,
  genre: ['扫黑', '犯罪', '悬疑'],
  year: 2023,
  synopsis: '刑警安欣与黑道高启强二十年的正邪对抗史。',
  characters: [
    {
      name: '安欣',
      actor: '张译',
      description: '京海市刑警，正义感极强，坚持扫黑除恶二十年。',
      personality: '正直、执着、孤独、不妥协',
      firstAppearance: 1,
    },
    {
      name: '高启强',
      aliases: ['强哥'],
      actor: '张颂文',
      description: '从卖鱼小贩一步步成为京海最大黑恶势力头目。',
      personality: '聪明、隐忍、狠辣、重亲情',
      firstAppearance: 1,
    },
    {
      name: '高启盛',
      actor: '苏小玎',
      description: '高启强的弟弟，大学生出身，为哥哥出谋划策。',
      personality: '阴险、嫉妒、偏激',
      firstAppearance: 1,
    },
    {
      name: '高启兰',
      actor: '李一桐',
      description: '高启强的妹妹，与安欣有感情线。',
      personality: '善良、温柔、夹在两方之间',
      firstAppearance: 2,
    },
    {
      name: '徐江',
      actor: '贾冰',
      description: '京海早期黑道人物，高启强的"引路人"。',
      personality: '嚣张、残暴',
      firstAppearance: 3,
    },
    {
      name: '赵立冬',
      actor: '冯兵',
      description: '京海市政法委书记，黑恶势力保护伞。',
      personality: '深藏不露、权力欲强',
      firstAppearance: 5,
    },
    {
      name: '陈书婷',
      aliases: ['大嫂'],
      actor: '高叶',
      description: '泰叔的前妻，后成为高启强的妻子。',
      personality: '聪慧、有魅力、有手段',
      firstAppearance: 8,
    },
  ],
  relationships: [
    { from: '安欣', to: '高启强', type: 'enemy', description: '二十年正邪对抗，从认识到对立', revealedAt: 1 },
    { from: '安欣', to: '高启兰', type: 'couple', description: '有情感但无法在一起', revealedAt: 3 },
    { from: '高启强', to: '高启盛', type: 'family', description: '兄弟，启盛是军师', revealedAt: 1 },
    { from: '高启强', to: '高启兰', type: 'family', description: '兄妹', revealedAt: 1 },
    { from: '高启强', to: '徐江', type: 'rival', description: '从依附到反杀', revealedAt: 5 },
    { from: '高启强', to: '赵立冬', type: 'other', description: '保护伞关系', revealedAt: 10 },
    { from: '高启强', to: '陈书婷', type: 'couple', description: '通过婚姻获取势力', revealedAt: 10 },
  ],
  plotPoints: [
    { episode: 1, summary: '2000年，安欣初遇卖鱼的高启强，一碗猪脚面开启纠葛。', keyMoments: ['猪脚面', '旧厂街卖鱼'] },
    { episode: 5, summary: '高启强被迫卷入黑道，弟弟启盛出主意。' },
    { episode: 10, summary: '高启强势力壮大，迎娶陈书婷，正式成为一方霸主。' },
    { episode: 15, summary: '时间跳转，高启强已是京海最大的企业家/黑道头目。' },
    { episode: 20, summary: '安欣多年追查线索，发现保护伞存在。' },
    { episode: 30, summary: '扫黑风暴来临，高启强的帝国开始崩塌。' },
    { episode: 39, summary: '大结局，正义到来。' },
  ],
  notes: '《孙子兵法》是重要道具。高启强从底层逆袭的人物弧光是最大看点。',
};
