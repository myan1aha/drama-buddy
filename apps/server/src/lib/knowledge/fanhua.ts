import type { DramaKnowledge } from '@drama-buddy/shared/knowledge';

/**
 * 《繁花》知识库
 */
export const fanhua: DramaKnowledge = {
  id: 'fanhua',
  title: '繁花',
  aliases: ['繁花', 'Blossoms Shanghai'],
  totalEpisodes: 30,
  genre: ['年代剧', '商战', '情感'],
  year: 2023,
  synopsis: '90年代上海，阿宝从底层青年成长为商界传奇的故事。',
  characters: [
    {
      name: '阿宝',
      aliases: ['宝总', '宝先生'],
      actor: '胡歌',
      description: '本剧主角，从黄河路底层小人物一步步成为叱咤风云的商界大亨。',
      personality: '聪明、隐忍、重情义、有野心',
      firstAppearance: 1,
    },
    {
      name: '玲子',
      aliases: ['玲子小姐'],
      actor: '马伊琍',
      description: '夜东京老板娘，阿宝的红颜知己和商业伙伴。',
      personality: '精明、泼辣、重感情、有魄力',
      firstAppearance: 1,
    },
    {
      name: '汪小姐',
      aliases: ['汪明珠'],
      actor: '唐嫣',
      description: '外贸公司职员，阿宝的另一位重要女性角色。',
      personality: '聪明、独立、有事业心',
      firstAppearance: 1,
    },
    {
      name: '李李',
      actor: '辛芷蕾',
      description: '至真园老板娘，神秘的女性角色，与阿宝有复杂关系。',
      personality: '冷艳、神秘、有城府',
      firstAppearance: 3,
    },
    {
      name: '爷叔',
      actor: '游本昌',
      description: '阿宝的人生导师，教会他商业规则和做人道理。',
      personality: '睿智、沉稳、经验丰富',
      firstAppearance: 1,
    },
    {
      name: '魏总',
      actor: '董勇',
      description: '强盛集团老板，商业对手。',
      personality: '霸道、精明、不择手段',
      firstAppearance: 5,
    },
  ],
  relationships: [
    { from: '阿宝', to: '玲子', type: 'couple', description: '红颜知己、商业搭档，感情复杂', revealedAt: 1 },
    { from: '阿宝', to: '汪小姐', type: 'couple', description: '情感纠葛', revealedAt: 2 },
    { from: '阿宝', to: '李李', type: 'secret', description: '复杂关系，逐步揭开', revealedAt: 5 },
    { from: '阿宝', to: '爷叔', type: 'mentor', description: '爷叔是阿宝的人生导师', revealedAt: 1 },
    { from: '阿宝', to: '魏总', type: 'rival', description: '商业对手', revealedAt: 5 },
    { from: '玲子', to: '汪小姐', type: 'rival', description: '情感上的竞争关系', revealedAt: 3 },
  ],
  plotPoints: [
    { episode: 1, summary: '90年代初的上海，阿宝在爷叔指导下开始踏入商界。', keyMoments: ['阿宝初入黄河路', '夜东京开业'] },
    { episode: 5, summary: '阿宝在股票市场初露锋芒，与魏总产生正面冲突。' },
    { episode: 10, summary: '阿宝商业版图扩大，三位女性的感情线逐渐交织。' },
    { episode: 15, summary: '商战白热化，阿宝面临重大抉择。' },
    { episode: 20, summary: '李李的身世之谜逐步揭开，阿宝陷入困境。' },
    { episode: 25, summary: '高潮来临，多方势力角逐。' },
    { episode: 30, summary: '大结局，各条线收束。' },
  ],
  notes: '王家卫导演，视觉风格极致，大量上海方言。配乐以90年代港台流行曲为主。',
};
