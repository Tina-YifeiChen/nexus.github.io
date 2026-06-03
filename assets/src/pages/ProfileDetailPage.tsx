import React from 'react';
import { motion } from 'framer-motion';
import { useAnalysis } from '../contexts/AnalysisContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Share2, Download } from 'lucide-react';

export default function ProfileDetailPage() {
  const { analysis } = useAnalysis();

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
              画像详情
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{analysis.profileType}</h1>
            <p className="text-gray-600 mt-2">{analysis.profileSummary}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              分享
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
              <Download className="w-4 h-4" />
              下载
            </button>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-emerald-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">申请状态雷达图</h2>
        <div className="h-80">
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
      </motion.div>

      {/* Scores Detail */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4">
        {Object.entries(analysis.scores).map(([key, score], i) => {
          const labels: Record<string, string> = {
            academic: '学术基础',
            language: '语言',
            intern: '实习科研',
            rhythm: '申请节奏',
            budget: '预算适配',
            essay: '文书潜力'
          };
          return (
            <div key={key} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
              <div className="text-sm text-gray-500 mb-1">{labels[key]}</div>
              <div className="text-3xl font-bold text-emerald-600">{score}</div>
              <div className="w-full h-2 bg-gray-100 rounded-full mt-3">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
