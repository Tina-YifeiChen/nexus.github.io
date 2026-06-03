import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAnalysis } from '../contexts/AnalysisContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Share2, ChevronRight } from 'lucide-react';

export default function StatusPage() {
  const { analysis, loading, backgroundData } = useAnalysis();
  const [effortType, setEffortType] = useState<'ielts' | 'intern' | 'cv' | 'budget'>('ielts');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">请先完成申请画像生成</p>
        <a href="#/" className="text-emerald-600 hover:underline mt-4 inline-block">去生成画像</a>
      </div>
    );
  }

  const radarData = [
    { subject: '学术基础', score: analysis.scores.academic, fullMark: 100 },
    { subject: '语言', score: analysis.scores.language, fullMark: 100 },
    { subject: '实习科研', score: analysis.scores.intern, fullMark: 100 },
    { subject: '申请节奏', score: analysis.scores.rhythm, fullMark: 100 },
    { subject: '预算适配', score: analysis.scores.budget, fullMark: 100 },
    { subject: '文书潜力', score: analysis.scores.essay, fullMark: 100 },
  ];

  // 根据用户背景数据动态生成努力选项
  const effortOptions = useMemo(() => {
    const options: Array<{ key: 'ielts' | 'intern' | 'cv' | 'budget'; label: string; disabled?: boolean }> = [];
    const language = backgroundData?.language || '';
    const internship = backgroundData?.internship || '';

    // 语言选项：根据当前成绩动态生成
    const ieltsMatch = language.match(/雅思\s*(\d+(?:\.\d+)?)/i);
    const toeflMatch = language.match(/托福\s*(\d+)/i);
    const currentIelts = ieltsMatch ? parseFloat(ieltsMatch[1]) : 0;
    const currentToefl = toeflMatch ? parseInt(toeflMatch[1]) : 0;

    if (currentIelts >= 7.0 || currentToefl >= 100) {
      options.push({ key: 'ielts', label: '语言成绩已达标', disabled: true });
    } else if (currentIelts >= 6.5) {
      options.push({ key: 'ielts', label: '雅思冲刺到 7.0' });
    } else if (currentIelts >= 6.0) {
      options.push({ key: 'ielts', label: '雅思提升到 6.5+' });
    } else if (currentToefl >= 90) {
      options.push({ key: 'ielts', label: '托福冲刺到 100+' });
    } else {
      options.push({ key: 'ielts', label: '语言成绩提升到达标线' });
    }

    // 实习选项：根据当前经历动态生成
    if (internship.includes('3段及以上')) {
      options.push({ key: 'intern', label: '实习经历已充足', disabled: true });
    } else if (internship.includes('1-2段')) {
      options.push({ key: 'intern', label: '再补充一段核心实习' });
    } else {
      options.push({ key: 'intern', label: '新增第一段相关实习' });
    }

    // CV 和预算选项固定
    options.push({ key: 'cv', label: '提前完成 CV' });
    options.push({ key: 'budget', label: '预算有限怎么选' });

    return options;
  }, [backgroundData]);

  const currentEffort = analysis.effortSimulation[effortType];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur rounded-3xl p-8 mb-6 border border-emerald-100"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
          这是你的申请状态
        </span>
        <h1 className="text-4xl font-bold mt-4 mb-2">我现在的申请状态：{analysis.profileType}</h1>
        <p className="text-gray-600 text-lg max-w-2xl">{analysis.profileSummary}</p>
      </motion.section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-emerald-100"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
            我现在的申请状态
          </span>
          <h2 className="text-3xl font-bold mt-4">{analysis.profileType}</h2>
          <p className="text-gray-600 mt-2">{analysis.profileSummary}</p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-emerald-50/50 rounded-xl p-4">
              <span className="text-xs text-gray-500">当前优势</span>
              <p className="font-semibold text-emerald-700">{analysis.advantage}</p>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4">
              <span className="text-xs text-gray-500">当前短板</span>
              <p className="font-semibold text-orange-600">{analysis.weakness}</p>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4">
              <span className="text-xs text-gray-500">更适合的策略</span>
              <p className="font-semibold text-blue-600">{analysis.strategy}</p>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4">
              <span className="text-xs text-gray-500">下一步先看</span>
              <p className="font-semibold text-purple-600">{analysis.nextStep}</p>
            </div>
          </div>
        </motion.section>

        {/* Radar Chart */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-emerald-100"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
            申请状态雷达图
          </span>
          <h2 className="text-xl font-bold mt-4">一眼看清你的优势和短板</h2>
          
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#d8efea" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#5b6865', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="申请状态"
                  dataKey="score"
                  stroke="#22d3a6"
                  fill="#22d3a6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* Effort Simulator */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-emerald-100 mt-6"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
          如果我再努力一点，会怎样？
        </span>
        <h2 className="text-2xl font-bold mt-4">先试一个最可能改变结果的变量</h2>
        
        <div className="flex flex-wrap gap-3 mt-6">
          {effortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { if (!opt.disabled) setEffortType(opt.key); }}
              disabled={opt.disabled}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                opt.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : effortType === opt.key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl">
          <div className="text-5xl font-bold text-emerald-700">
            {currentEffort.current} → {currentEffort.after}
          </div>
          <p className="text-gray-700 mt-3">{currentEffort.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {effortOptions.map((opt) => (
            <a
              key={opt.key}
              href={`#/effort/${opt.key}`}
              className="block p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <span className="font-semibold text-sm">{opt.label}</span>
              <ChevronRight className="w-4 h-4 mt-2 text-emerald-500" />
            </a>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
