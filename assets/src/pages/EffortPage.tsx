import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalysis } from '../contexts/AnalysisContext';
import { CheckCircle, Clock, DollarSign, Users } from 'lucide-react';

// 根据用户背景生成个性化建议
function generatePersonalizedConfig(backgroundData: Record<string, string>, analysis: any) {
  const language = backgroundData?.language || '';
  const internship = backgroundData?.internship || '';
  const direction = backgroundData?.direction || '';
  const gpa = backgroundData?.gpa || '';

  // 解析语言成绩
  const ieltsMatch = language.match(/雅思\s*(\d+(?:\.\d+)?)/i);
  const toeflMatch = language.match(/托福\s*(\d+)/i);
  const currentIelts = ieltsMatch ? parseFloat(ieltsMatch[1]) : 0;
  const currentToefl = toeflMatch ? parseInt(toeflMatch[1]) : 0;

  // 解析 GPA
  const gpaMatch = gpa.match(/(\d+(?:\.\d+)?)/);
  const currentGPA = gpaMatch ? parseFloat(gpaMatch[1]) : 0;

  // 判断方向
  const isBusiness = direction.includes('商科') || direction.includes('金融');
  const isCS = direction.includes('CS') || direction.includes('计算机') || direction.includes('AI');

  return {
    ielts: {
      label: '语言提分',
      title: currentIelts >= 7.0 || currentToefl >= 100
        ? '语言成绩已达标，如何保持优势？'
        : currentIelts >= 6.5
          ? '雅思冲刺 7.0，突破港三门槛'
          : '语言成绩提升策略',
      sub: currentIelts >= 7.0 || currentToefl >= 100
        ? `你的${currentIelts >= 7.0 ? `雅思 ${currentIelts}` : `托福 ${currentToefl}`}已经达到大多数港校项目的要求。现在要做的是保持成绩有效性，并关注单项是否满足特定项目要求。`
        : `你目前的${currentIelts > 0 ? `雅思 ${currentIelts}` : currentToefl > 0 ? `托福 ${currentToefl}` : '语言成绩'}尚未达到港前三的安全线。语言是硬门槛，建议优先解决。`,
      impact: '影响：降低硬门槛风险',
      fit: currentIelts >= 7.0 || currentToefl >= 100
        ? '适合语言已达标，但想冲击更高分或确保单项满足特定项目要求的申请者。'
        : currentIelts >= 6.0 || currentToefl >= 80
          ? '适合语言成绩接近达标线，通过短期冲刺可以达到要求的申请者。'
          : '适合语言基础较弱，需要系统提升的申请者。',
      standard: isBusiness
        ? '商科方向建议雅思 7.0+，单项不低于 6.5；部分热门项目要求更高。'
        : isCS
          ? 'CS 方向雅思 6.5+ 即可，但热门项目仍建议 7.0。'
          : '建议冲到雅思 7.0 或同等水平，确保不成为申请短板。',
      avoid: '不要一边语言没过线，一边先买高价文书套餐。语言是硬门槛时，文书再好也会被递交资格限制。',
      actions: currentIelts >= 7.0 || currentToefl >= 100
        ? ['确认成绩有效期，确保覆盖申请季。','检查目标项目是否有单项要求，尤其是写作和口语。','考虑是否需要刷分以提高竞争力。','把精力转向其他短板提升。']
        : currentIelts >= 6.0 || currentToefl >= 80
          ? ['制定 4-6 周冲刺计划，重点突破最低分项。','每周至少完成 2 套完整模考，形成考试节奏。','报名 2-3 个月内的考试，给自己留足刷分时间。','在 9 月项目开放前拿到达标成绩。']
          : ['先做一次完整模考，确定真实水平和短板。','制定 2-3 个月的系统提升计划。','优先解决输入项（听力、阅读），再突破输出项（写作、口语）。','考虑报名语言班或找专项老师。'],
      times: [['1-2周','确认目标项目语言门槛，做一次完整模考。'],['3-6周','集中突破最低分项，形成固定刷题和复盘节奏。'],['7-10周','报名正式考试，把成绩用于第一轮申请。']],
      money: [['值得花','语言班、口语/写作专项、一对一批改。'],['先别急','在语言没过线前购买全套申请包装。'],['判断标准','花钱后能不能直接提高硬门槛通过率。']],
      advisors: ['如果多次卡同一小分，可以找语言专项老师，而不是申请顾问。','如果语言达标但不知道是否够冲港前三，可以找目标院校学长学姐了解项目安全线。']
    },
    intern: {
      label: '相关实习',
      title: internship.includes('3段及以上')
        ? '实习经历充足，如何讲好故事？'
        : internship.includes('1-2段')
          ? '再补充一段核心实习，提升竞争力'
          : '从 0 到 1，建立第一段相关经历',
      sub: internship.includes('3段及以上')
        ? '你已经有丰富的实习经历，现在的关键是如何把这些经历组织成清晰的申请主线，而不是简单堆砌。'
        : internship.includes('1-2段')
          ? '你已有一定基础，再补充一段高质量的实习可以显著提升申请竞争力。'
          : '没有相关实习经历是申请的明显短板，需要尽快建立至少一段能写进文书的相关经历。',
      impact: '影响：提高专业匹配度',
      fit: isBusiness
        ? '商科申请特别看重实习经历，建议至少有 2-3 段相关经历。'
        : isCS
          ? 'CS 方向看重项目经验和技术能力，实习或科研都可以。'
          : '根据目标方向，建立能证明专业匹配度的经历。',
      standard: '至少形成一段能写进 CV 和 PS 的相关经历，能说清任务、方法、结果和与目标项目的关系。',
      avoid: '不要为了凑数量随便找不相关实习。无关经历太多，反而会让申请主线更散。',
      actions: isBusiness
        ? ['优先选择金融、咨询、互联网商业相关实习。','关注能产出量化成果的岗位。','建立从分析到执行到结果的完整故事线。','每段经历都要能回答"为什么这段经历支持我申请这个项目"。']
        : isCS
          ? ['优先选择技术岗、研发岗或算法岗。','积累能展示的项目代码或技术文档。','关注 AI、数据、系统等热门方向。','把技术项目写成 STAR 结构。']
          : ['先反推目标项目喜欢什么能力。','选择能产出具体成果的实习、课题、竞赛或项目。','把经历写成 STAR 结构：任务、行动、方法、结果。'],
      times: [['2周','确定目标方向和能力关键词。'],['1-2个月','完成一段相关实习、项目或竞赛产出。'],['7-8月','把经历整理进 CV 和 PS 主线。']],
      money: [['值得花','高质量项目训练、行业导师反馈、简历经历复盘。'],['先别急','花钱买含金量不清楚的"背景提升证书"。'],['判断标准','这段经历能不能产生真实任务、真实产出、可写入文书的细节。']],
      advisors: ['如果不知道某段实习是否匹配项目，可以找目标院校学长学姐看同背景案例。','如果跨专业主线很难讲通，可以找顶级申请顾问做一次经历重组。']
    },
    cv: {
      label: '材料提前',
      title: 'CV、PS、推荐信怎么提前准备？',
      sub: '材料不是最后一周包装出来的，而是把你的背景、目标和证据提前组织成一条线。',
      impact: '影响：提高表达清晰度',
      fit: currentGPA >= 3.5
        ? '你的 GPA 不错，材料要突出学术优势。'
        : currentGPA >= 3.0
          ? 'GPA 中等，材料要强调其他方面的亮点。'
          : 'GPA 是短板，材料要巧妙处理并突出其他优势。',
      standard: '7-8 月完成 CV 和 PS 初稿，9 月能根据不同项目快速微调，而不是从零开始。',
      avoid: '不要等项目开放后才开始写第一版材料。那时你会同时被选校、网申、推荐信和语言成绩压住。',
      actions: ['先做一版一页 CV，把教育、实习、科研、项目、技能全部结构化。','写一个 200 字申请主线：我是谁、为什么这个方向、我凭什么适合。','提前联系推荐人，确认推荐信意愿、邮箱和提交方式。','为不同方向准备可替换素材，避免所有项目用一份 PS。'],
      times: [['1周','整理经历库和基础 CV。'],['2-4周','完成 PS 主线和第一版材料。'],['7-8月','让顾问或有经验的人做一次结构复核。']],
      money: [['值得花','材料结构诊断、CV 复核、PS 主线复核。'],['先别急','在没有确定目标方向前购买整套文书润色。'],['判断标准','服务能不能帮你把经历讲清楚，而不是只改语法。']],
      advisors: ['如果只是语法问题，不需要申请顾问。','如果经历很多但主线很散，适合找顾问做一次材料结构复核。','如果目标项目很具体，可以找学长学姐看项目偏好。']
    },
    budget: {
      label: '预算路径',
      title: '预算有限时，怎么选才不是被迫降级？',
      sub: '预算限制不等于申请失败。真正要做的是把香港本地、港校内地分校、大湾区和澳门路径组合起来。',
      impact: '影响：提高路径安全感',
      fit: '适合家庭预算有限、不确定是否能承担香港本地高学费生活费、但仍希望保留升学质量的用户。',
      standard: '形成冲刺、主申、稳妥、预算友好四层组合，同时明确学费、生活费、留位费和地区接受度。',
      avoid: '不要只因为预算压力就盲目放弃好项目，也不要只看排名忽略总成本。',
      actions: ['先算总成本：学费、住宿、生活费、留位费、签证、机票和机会成本。','把学校分成香港本地、港校内地分校、大湾区合作办学、澳门院校四类。','为每类路径设置上限预算和可接受专业。','优先保留性价比高、就业地点匹配、项目资源清晰的选择。'],
      times: [['1周','做预算上限和家庭承受范围确认。'],['2-3周','建立预算友好学校清单。'],['Offer后','比较留位费、奖学金、城市成本和长期回报。']],
      money: [['值得花','预算规划、Offer 对比、奖学金和住宿信息确认。'],['先别急','因为焦虑购买超预算服务或盲目交多个留位费。'],['判断标准','这笔钱是否降低决策失误，而不是只降低焦虑。']],
      advisors: ['如果不清楚项目真实体验和就业回报，适合问目标院校学长学姐。','如果手里有多个 Offer 且成本差异很大，适合做一次 Offer 选择咨询。']
    }
  };
}

export default function EffortPage() {
  const { type } = useParams<{ type: 'ielts' | 'intern' | 'cv' | 'budget' }>();
  const { analysis, backgroundData } = useAnalysis();
  const [activeType, setActiveType] = useState<'ielts' | 'intern' | 'cv' | 'budget'>('ielts');

  // 根据用户背景动态生成配置
  const effortTypeConfig = useMemo(() => {
    return generatePersonalizedConfig(backgroundData, analysis);
  }, [backgroundData, analysis]);

  useEffect(() => {
    if (type && effortTypeConfig[type as keyof typeof effortTypeConfig]) {
      setActiveType(type as keyof typeof effortTypeConfig);
    }
  }, [type, effortTypeConfig]);

  const data = effortTypeConfig[activeType];
  const effortData = analysis?.effortSimulation?.[activeType];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-emerald-100">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
          努力模拟器详情
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">如果我再努力一点，具体应该努力在哪里？</h1>
        <p className="text-gray-600 max-w-3xl">首页的努力模拟器负责告诉你"某个动作会让申请状态怎么变化"。这一页继续往下拆：语言、实习、材料、预算四个方向分别怎么做。</p>
      </motion.div>

      {/* Type Selector */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {(Object.keys(effortTypeConfig) as Array<keyof typeof effortTypeConfig>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            className={`p-4 rounded-2xl text-left transition-all ${
              activeType === key
                ? 'bg-emerald-50 border-2 border-emerald-400 shadow-lg'
                : 'bg-white/60 border border-gray-200 hover:bg-white'
            }`}
          >
            <div className="font-bold text-gray-900">{effortTypeConfig[key].label}</div>
            <div className="text-xs text-gray-500 mt-1">{effortTypeConfig[key].impact}</div>
          </button>
        ))}
      </div>

      {/* Detail Card */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
              {data.label}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
            <p className="text-gray-600 mt-2">{data.sub}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-emerald-600">
              {effortData ? `${effortData.current} → ${effortData.after}` : '72 → 81'}
            </div>
            <div className="text-sm text-gray-500 mt-1">{data.impact}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50/50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">适合谁</h3>
            <p className="text-sm text-gray-600">{data.fit}</p>
          </div>
          <div className="bg-emerald-50/50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">做到什么程度</h3>
            <p className="text-sm text-gray-600">{data.standard}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">不建议怎么做</h3>
            <p className="text-sm text-gray-600">{data.avoid}</p>
          </div>
        </div>

        {/* Action List */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              行动清单
            </h3>
            <div className="space-y-3">
              {data.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              推荐节奏
            </h3>
            <div className="space-y-3">
              {data.times.map((time, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="px-3 py-1 bg-emerald-100 rounded-lg text-emerald-700 text-sm font-medium">
                    {time[0]}
                  </div>
                  <span className="text-gray-700 text-sm">{time[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Money & Advisors */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              投入建议
            </h3>
            <div className="space-y-2">
              {data.money.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <span className="px-2 py-1 bg-emerald-100 rounded text-emerald-700 text-xs font-medium">
                    {item[0]}
                  </span>
                  <span className="text-gray-600 text-sm">{item[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              学长学姐 / 顾问介入点
            </h3>
            <div className="space-y-3">
              {data.advisors.map((advisor, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{advisor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
