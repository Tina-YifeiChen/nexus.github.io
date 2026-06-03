import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAnalysis } from '../contexts/AnalysisContext';

interface Stage {
  slug: string;
  month: string;
  name: string;
  round: string;
  title: string;
  time: string;
  summary: string;
  progress: string[];
  tasks: string[];
  materials: string[];
  risk: string;
  advisor: string;
  money: string;
}

export default function TimelinePage() {
  const { stageId } = useParams();
  const navigate = useNavigate();
  const { analysis, backgroundData } = useAnalysis();
  const [stages, setStages] = useState<Stage[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [analysis, backgroundData]);

  useEffect(() => {
    if (stageId) {
      const idx = parseInt(stageId);
      if (!isNaN(idx) && idx >= 0 && idx < stages.length) {
        setCurrentStage(idx);
      }
    }
  }, [stageId, stages]);

  function loadTimeline() {
    // 优先使用 AI 分析结果中的个性化时间线
    if (analysis?.timeline && Array.isArray(analysis.timeline) && analysis.timeline.length > 0) {
      console.log('Using AI-generated personalized timeline');
      // 将 AI 返回的时间线数据转换为 Stage 格式
      const aiStages = analysis.timeline.map((item, index) => ({
        slug: `stage-${index}`,
        month: item.month || getMonthFromIndex(index),
        name: item.name || item.title || `阶段 ${index + 1}`,
        round: item.round || '申请阶段',
        title: item.title || item.name || `阶段 ${index + 1}`,
        time: item.time || `${item.month || getMonthFromIndex(index)}｜${item.desc || ''}`,
        summary: item.desc || '根据你的背景定制的申请阶段任务',
        progress: item.progress || ['语言 20%', '材料 10%', '选校 20%', '节奏 30%'],
        tasks: item.tasks || ['完成本阶段核心任务'],
        materials: ['根据进度准备相应材料'],
        risk: item.warning || '注意申请节奏',
        advisor: '根据阶段需求选择顾问',
        money: '合理规划预算'
      }));
      setStages(aiStages);
      setLoading(false);
      return;
    }

    // 如果没有 AI 数据，使用默认数据
    console.log('No AI timeline data, using default stages');
    setStages(getDefaultStages());
    setLoading(false);
  }

  function getMonthFromIndex(index: number): string {
    const months = ['1-3月', '4-6月', '7-8月', '9-10月', '11-12月', '1-3月', '4-6月'];
    return months[index] || `${index + 1}月`;
  }

  function getDefaultStages(): Stage[] {
    return [
      { slug: 'positioning', month: '1-3月', name: '探索定位期', round: '起点', title: '探索定位期', time: '1-3月｜确定方向与初步定位', summary: '建立申请坐标图：我在哪个层级、目标是否合理、硬伤是什么、预算能承受什么。', progress: ['语言 20%', '材料 10%', '选校 20%', '节奏 30%'], tasks: ['确定目标方向', '把学校粗分为四层', '判断语言成绩门槛', '估算预算', '建立申请文件夹'], materials: ['成绩单', '语言考试计划', '预算范围表'], risk: '还没看清自己就被外部建议带着走', advisor: '通常不需要深度顾问', money: '值得花：语言诊断' },
      { slug: 'upgrade', month: '4-6月', name: '背景补强期', round: '黄金补强', title: '背景补强期', time: '4-6月｜申请前关键窗口', summary: '把能改变的硬变量尽量补上', progress: ['语言 60%', '材料 25%', '选校 45%', '节奏 68%'], tasks: ['锁定语言考试时间', '补相关实习', '维护 GPA', '确认推荐人', '调整项目分层'], materials: ['语言成绩', '实习证明', '推荐人名单'], risk: '把钱花在不能改变核心变量的地方', advisor: '找目标院校学长学姐', money: '值得花：语言提分' },
      { slug: 'documents', month: '7-8月', name: '材料准备期', round: 'R1准备', title: '材料准备期', time: '7-8月｜R1提交前的材料窗口', summary: '把申请从想法变成可提交材料', progress: ['语言 70%', '材料 55%', '选校 62%', '节奏 72%'], tasks: ['完成 CV 初稿', '整理 PS 主题', '联系推荐人', '建立项目表', '准备文书素材库'], materials: ['CV 初稿', 'PS 大纲', '推荐信材料'], risk: '一边换方向一边写文书', advisor: '找顾问复核文书主线', money: '值得花：CV/PS 复核' },
      { slug: 'opening', month: '9-10月', name: '开放冲刺期', round: '第一轮 R1', title: '港校开放冲刺期', time: '9-10月｜项目开放与第一轮准备', summary: '用时间优势换确定性', progress: ['语言 78%', '材料 72%', '选校 80%', '节奏 76%'], tasks: ['检查项目开放', '优先提交主申', '确认推荐信', '准备面试', '微调文书'], materials: ['最终 CV', '分项目 PS', '面试题库'], risk: '无限拖延', advisor: '提交前复核', money: '值得花：材料复核' },
      { slug: 'r1', month: '11-12月', name: '第一轮提交期', round: 'R1 黄金期', title: '第一轮黄金提交期', time: '11-12月｜主申与冲刺并行', summary: '让冲刺、主申、稳妥同时存在', progress: ['语言 85%', '材料 86%', '选校 88%', '节奏 82%'], tasks: ['完成主申提交', '配置项目组合', '查看系统状态', '准备面试', '记录项目状态'], materials: ['已提交列表', '面试文档', '追踪表'], risk: '只冲不保', advisor: '项目组合复核', money: '值得花：面试模拟' },
      { slug: 'interview', month: '1-3月', name: '等待与面试期', round: '第二轮 R2', title: '等待面试与补申期', time: '1-3月｜R2审理与补申窗口', summary: '根据 R1 反馈判断是否补申', progress: ['语言 88%', '材料 90%', '选校 92%', '节奏 70%'], tasks: ['准备面试', '决定是否补申', '跟进系统状态', '复盘项目', '准备选择标准'], materials: ['面试答案库', '补申清单', '邮件模板'], risk: '等待焦虑转化成冲动消费', advisor: '面试模拟', money: '值得花：补申策略' },
      { slug: 'offer', month: '4-6月', name: 'Offer选择与行前准备', round: '收尾 / 行前', title: 'Offer选择与行前准备', time: '4-6月｜结果选择与落地准备', summary: '从申请决策进入真实就读决策', progress: ['语言 95%', '材料 94%', '选校 92%', '节奏 88%'], tasks: ['比较 offer', '确认留位费签证', '准备行前事项', '加入校友群', '建立评分表'], materials: ['Offer对比表', '签证时间表', '租房清单'], risk: '只看排名不看成本', advisor: '了解真实就读体验', money: '值得花：Offer选择咨询' }
    ];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const stage = stages[currentStage] || stages[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-emerald-100">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
          <Clock className="w-4 h-4" />
          申请时间地图
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">每个时间点，具体应该做什么</h1>
        <p className="text-gray-600 max-w-2xl">从准备到拿到 Offer，把每个阶段该做的事放到一张地图里。点击阶段查看具体任务。</p>
      </motion.div>

      {/* Stage Tabs */}
      <div className="grid grid-cols-7 gap-3 mb-8">
        {stages.map((s, i) => (
          <button
            key={s.slug}
            onClick={() => navigate(`/timeline/${i}`)}
            className={`p-4 rounded-2xl text-left transition-all ${
              i === currentStage
                ? 'bg-emerald-50 border-2 border-emerald-400 shadow-lg'
                : 'bg-white/60 border border-gray-200 hover:bg-white'
            }`}
          >
            <div className="text-xs text-emerald-600 font-medium mb-1">{s.month}</div>
            <div className="text-sm font-semibold text-gray-900">{s.name}</div>
            <div className="text-xs text-gray-500 mt-1">{s.round}</div>
          </button>
        ))}
      </div>

      {/* Stage Detail */}
      {stage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
                {stage.round}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{stage.title}</h2>
              <div className="text-gray-500 mb-4">{stage.time}</div>
              <p className="text-gray-700 text-lg leading-relaxed">{stage.summary}</p>

              {/* Progress */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                {stage.progress.map((p, i) => {
                  const [label, value] = p.split(' ');
                  return (
                    <div key={i} className="bg-emerald-50/50 rounded-xl p-4">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className="text-xl font-bold text-emerald-700">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">这个阶段具体要做什么</h3>
              <div className="space-y-4">
                {stage.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Materials */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">要准备的材料</h3>
              <div className="space-y-2">
                {stage.materials.map((m, i) => (
                  <div key={i} className="px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-medium text-sm">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk */}
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold">风险提醒</h3>
              </div>
              <p className="text-amber-800 text-sm">{stage.risk}</p>
            </div>

            {/* Advisor */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">什么时候需要真人顾问</h3>
              <p className="text-gray-600 text-sm mb-4">{stage.advisor}</p>
              <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                查看顾问匹配
              </button>
            </div>

            {/* Money */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">钱应该花在哪里</h3>
              <p className="text-gray-600 text-sm">{stage.money}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
