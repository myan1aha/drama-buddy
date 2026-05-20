import type { DramaKnowledge } from '@drama-buddy/shared/knowledge';

/**
 * 《绝命毒师》(Breaking Bad) 知识库
 */
export const breakingbad: DramaKnowledge = {
  id: 'breakingbad',
  title: 'Breaking Bad',
  aliases: ['绝命毒师', 'BB', '老白的堕落之路'],
  totalEpisodes: 62,
  genre: ['犯罪', '剧情', '惊悚'],
  year: 2008,
  synopsis: '高中化学老师 Walter White 被诊断出肺癌晚期后，与前学生 Jesse Pinkman 合作制造冰毒，逐步堕入犯罪深渊的故事。',
  characters: [
    {
      name: 'Walter White',
      aliases: ['Heisenberg', '老白', 'Mr. White'],
      actor: 'Bryan Cranston',
      description: '高中化学老师，被诊断出肺癌后开始制毒，逐渐从普通人蜕变为冷酷毒枭。',
      personality: '聪明绝顶、自尊心极强、控制欲强、表面温和实则冷酷',
      firstAppearance: 1,
    },
    {
      name: 'Jesse Pinkman',
      aliases: ['Jesse', '小粉', 'Cap\'n Cook'],
      actor: 'Aaron Paul',
      description: 'Walter 的前学生，小混混出身，与 Walter 搭档制毒。内心善良但命运坎坷。',
      personality: '重感情、冲动、善良但软弱、有良知',
      firstAppearance: 1,
    },
    {
      name: 'Skyler White',
      aliases: ['Skyler', '天妇'],
      actor: 'Anna Gunn',
      description: 'Walter 的妻子，逐渐发现丈夫的秘密后被卷入犯罪。',
      personality: '聪明、坚强、保护家庭、矛盾挣扎',
      firstAppearance: 1,
    },
    {
      name: 'Hank Schrader',
      aliases: ['Hank', '汉克'],
      actor: 'Dean Norris',
      description: 'DEA 缉毒探员，Walter 的连襟。一直在追捕 Heisenberg 却不知就在身边。',
      personality: '正直、勇敢、固执、有正义感',
      firstAppearance: 1,
    },
    {
      name: 'Saul Goodman',
      aliases: ['Saul', '索尔', 'Jimmy McGill'],
      actor: 'Bob Odenkirk',
      description: '不走寻常路的律师，为 Walter 和 Jesse 提供法律服务和犯罪建议。',
      personality: '油嘴滑舌、精明、幽默、灰色地带',
      firstAppearance: 8, // S2E08
    },
    {
      name: 'Gustavo Fring',
      aliases: ['Gus', '炸鸡叔', 'Gus Fring'],
      actor: 'Giancarlo Esposito',
      description: '炸鸡连锁店 Los Pollos Hermanos 老板，实为冷血毒枭。表面彬彬有礼，内心极度危险。',
      personality: '冷静、极度谨慎、心狠手辣、有商业头脑',
      firstAppearance: 11, // S2E11
    },
    {
      name: 'Mike Ehrmantraut',
      aliases: ['Mike', '老麦'],
      actor: 'Jonathan Banks',
      description: 'Gus 手下的清道夫和安全顾问，前警察。做事干净利落。',
      personality: '沉默寡言、专业、冷静、重视家人',
      firstAppearance: 9, // S2E09
    },
    {
      name: 'Hector Salamanca',
      aliases: ['Tio', '老萨'],
      actor: 'Mark Margolis',
      description: '墨西哥贩毒家族 Salamanca 的老教父，中风后只能靠铃铛沟通。与 Gus 有世仇。',
      personality: '凶残、固执、仇恨深重',
      firstAppearance: 4, // S1 后期
    },
    {
      name: 'Tuco Salamanca',
      aliases: ['Tuco', '图科'],
      actor: 'Raymond Cruz',
      description: '暴躁的毒贩，Salamanca 家族成员。不可预测且极度暴力。',
      personality: '疯狂、暴躁、不可理喻',
      firstAppearance: 6, // S1E06
    },
    {
      name: 'Walter White Jr.',
      aliases: ['Flynn', 'Junior', '小白'],
      actor: 'RJ Mitte',
      description: 'Walter 的儿子，患有脑瘫但性格阳光。崇拜父亲。',
      personality: '善良、单纯、崇拜父亲',
      firstAppearance: 1,
    },
    {
      name: 'Todd Alquist',
      aliases: ['Todd'],
      actor: 'Jesse Plemons',
      description: '看似温和有礼的年轻人，实为冷血杀手。后期成为 Jesse 的噩梦。',
      personality: '表面礼貌、内心冷血、服从命令、毫无同理心',
      firstAppearance: 46, // S5E05
    },
    {
      name: 'Lydia Rodarte-Quayle',
      aliases: ['Lydia', '莉迪亚'],
      actor: 'Laura Fraser',
      description: 'Madrigal 公司高管，负责冰毒的国际分销渠道。神经质且冷酷。',
      personality: '神经质、贪婪、心狠、极度注重自保',
      firstAppearance: 40, // S5 初期
    },
  ],
  relationships: [
    { from: 'Walter White', to: 'Jesse Pinkman', type: 'other', description: '师徒/搭档，从合作到操控再到决裂', revealedAt: 1 },
    { from: 'Walter White', to: 'Skyler White', type: 'couple', description: '夫妻，关系随 Walter 堕落而瓦解', revealedAt: 1 },
    { from: 'Walter White', to: 'Hank Schrader', type: 'family', description: '连襟关系，猫鼠游戏', revealedAt: 1 },
    { from: 'Walter White', to: 'Gustavo Fring', type: 'rival', description: '从雇佣关系到殊死博弈', revealedAt: 11 },
    { from: 'Walter White', to: 'Saul Goodman', type: 'colleague', description: 'Walter 的犯罪律师', revealedAt: 8 },
    { from: 'Jesse Pinkman', to: 'Walter White', type: 'other', description: '被操控和利用，最终觉醒', revealedAt: 1 },
    { from: 'Jesse Pinkman', to: 'Mike Ehrmantraut', type: 'friend', description: '从对立到互相尊重', revealedAt: 20 },
    { from: 'Gustavo Fring', to: 'Hector Salamanca', type: 'enemy', description: '深仇大恨，Gus 的搭档被 Hector 所杀', revealedAt: 20 },
    { from: 'Gustavo Fring', to: 'Mike Ehrmantraut', type: 'colleague', description: 'Mike 是 Gus 最信任的手下', revealedAt: 11 },
    { from: 'Hank Schrader', to: 'Walter White', type: 'enemy', description: '发现 Heisenberg 真身后誓要将其绳之以法', revealedAt: 54 },
    { from: 'Todd Alquist', to: 'Jesse Pinkman', type: 'enemy', description: 'Todd 囚禁 Jesse 强迫制毒', revealedAt: 54 },
    { from: 'Tuco Salamanca', to: 'Walter White', type: 'other', description: '早期买家，极度危险的合作关系', revealedAt: 6 },
  ],
  plotPoints: [
    { episode: 1, summary: 'Walter White 50岁生日，被诊断出肺癌。在缉毒行动中偶遇前学生 Jesse，萌生制毒念头。', keyMoments: ['肺癌确诊', '偶遇Jesse', '第一次制毒'] },
    { episode: 3, summary: 'Walter 和 Jesse 的第一批冰毒出炉，纯度极高。为处理毒贩 Krazy-8 陷入道德困境。', keyMoments: ['第一次杀人', '处理Krazy-8'] },
    { episode: 6, summary: 'Tuco Salamanca 登场，Walter 用雷酸汞炸毁 Tuco 的办公室立威，Heisenberg 身份开始成型。', keyMoments: ['雷酸汞爆炸', 'Heisenberg诞生'] },
    { episode: 8, summary: 'Walter 的冰毒引起 DEA 注意。与 Tuco 的合作越来越危险。', keyMoments: ['DEA追踪蓝色冰毒'] },
    { episode: 11, summary: 'Gustavo Fring 首次登场——快餐店老板的完美伪装。Walter 获得新的"雇主"。', keyMoments: ['Gus登场', 'Los Pollos Hermanos'] },
    { episode: 20, summary: 'Walter 完全受雇于 Gus 的超级实验室，产量飙升。但 Gus 想用 Gale 取代他。Jesse 心态崩溃。', keyMoments: ['超级实验室', 'Jesse精神崩溃'] },
    { episode: 26, summary: 'Walter 命令 Jesse 杀死 Gale 以保命。S3结局留下巨大悬念。', keyMoments: ['Jesse被迫杀Gale', '保命之战'] },
    { episode: 33, summary: 'Walter 和 Jesse 联手对抗 Gus。Walter 用毒铃兰毒害 Brock 来操控 Jesse。', keyMoments: ['毒害Brock', '操控Jesse'] },
    { episode: 36, summary: 'Walter 利用 Hector 的仇恨，用炸弹炸死 Gus。"I won." 经典台词。', keyMoments: ['炸鸡叔之死', '半边脸', 'I won'] },
    { episode: 46, summary: 'Walter 建立新的制毒帝国，Todd 加入团队。火车抢劫甲胺成功但 Todd 杀害目击男孩。', keyMoments: ['火车抢劫', 'Todd杀男孩', '帝国崛起'] },
    { episode: 54, summary: 'Hank 在厕所发现 Gale 题词的《草叶集》，终于意识到 Walter 就是 Heisenberg。', keyMoments: ['Hank发现真相', '草叶集', '天台对质'] },
    { episode: 58, summary: 'Hank 和 Gomez 在沙漠中被 Jack 一伙杀害。Walter 崩溃。Jesse 被囚禁。', keyMoments: ['Hank之死', 'Walter崩溃', 'Jesse被囚'] },
    { episode: 62, summary: '大结局。Walter 用自制机关枪消灭纳粹团伙，释放 Jesse，中弹身亡于冰毒实验室中。', keyMoments: ['机关枪屠杀', 'Jesse获自由', 'Walter死于实验室', 'Baby Blue'] },
  ],
  notes: 'Vince Gilligan 创作，被誉为电视史上最伟大的剧集之一。从 S1 到 S5 完整展现一个好人堕落为恶魔的过程。蓝色冰毒纯度 99.1% 是标志符号。节奏前期偏慢但极度紧凑。',
};
