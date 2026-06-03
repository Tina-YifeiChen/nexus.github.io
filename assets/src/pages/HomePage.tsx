import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAnalysis } from '../contexts/AnalysisContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAnalysisData, setLoading } = useAnalysis();
  
  const [formData, setFormData] = useState({
    school: '',
    gpa: '',
    language: '',
    direction: '商科 / 金融',
    internship: '1-2段相关经历',
    research: '有课程项目或校级经历',
    budget: '优先香港本地',
    region: '香港本地 + 大湾区都可以',
    branch: '可以接受'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    setAnalyzing(true);
    setLoading(true);

    try {
      const backgroundData = {
        school: formData.school,
        gpa: formData.gpa,
        language: formData.language,
        direction: formData.direction,
        internship: formData.internship,
        research: formData.research,
        budget: formData.budget,
        region: formData.region,
        branch: formData.branch
      };

      // 使用 createCaseWithAnalysis 保存案例和分析结果到数据库
      const { analysis } = await api.createCaseWithAnalysis(backgroundData, user.id, user.email);
      setAnalysisData(analysis);
      toast.success('分析完成并已保存！');
      navigate('/status');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('分析失败，请重试');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-[#081614]/8"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ecfff8] text-[#087b64] text-sm font-bold">
          3分钟看清你的港校申请位置
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-[#081614] mt-4 mb-4 tracking-tight">
          帮你看清港校申请的位置、风险与下一步
        </h1>
      </motion.section>

      {/* Form */}
      <div className="grid md:grid-cols-[420px,1fr] gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-[#081614]/8"
        >
          <h2 className="text-2xl font-black mb-6">生成我的申请画像</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-[#081614]/70">学校</label>
              <input 
                className="w-full mt-1 px-4 py-3 rounded-xl border border-[#081614]/10 focus:border-[#22d3a6] focus:ring-2 focus:ring-[#22d3a6]/20 outline-none"
                placeholder="例如：四川大学 / 某211"
                value={formData.school}
                onChange={e => setFormData({...formData, school: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-[#081614]/70">GPA</label>
              <input 
                className="w-full mt-1 px-4 py-3 rounded-xl border border-[#081614]/10 focus:border-[#22d3a6] focus:ring-2 focus:ring-[#22d3a6]/20 outline-none"
                placeholder="例如：3.55 / 4.0"
                value={formData.gpa}
                onChange={e => setFormData({...formData, gpa: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-[#081614]/70">语言成绩</label>
              <input 
                className="w-full mt-1 px-4 py-3 rounded-xl border border-[#081614]/10 focus:border-[#22d3a6] focus:ring-2 focus:ring-[#22d3a6]/20 outline-none"
                placeholder="例如：雅思 6.5 / 托福 95"
                value={formData.language}
                onChange={e => setFormData({...formData, language: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-[#081614]/70">目标方向</label>
              <select 
                className="w-full mt-1 px-4 py-3 rounded-xl border border-[#081614]/10 focus:border-[#22d3a6] focus:ring-2 focus:ring-[#22d3a6]/20 outline-none bg-white"
                value={formData.direction}
                onChange={e => setFormData({...formData, direction: e.target.value})}
              >
                <option>商科 / 金融</option>
                <option>AI / CS</option>
                <option>传媒 / 社科</option>
                <option>教育 / TESOL</option>
              </select>
            </div>

            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-3 text-[#087b64] font-bold bg-[#f0fbf8] rounded-xl hover:bg-[#e7faf6] transition-colors"
            >
              {showAdvanced ? '收起' : '继续补充更多信息'} →
            </button>

            {showAdvanced && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#081614]/70">实习经历</label>
                  <select 
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-[#081614]/10 bg-white"
                    value={formData.internship}
                    onChange={e => setFormData({...formData, internship: e.target.value})}
                  >
                    <option>暂时没有</option>
                    <option>1-2段相关经历</option>
                    <option>3段及以上</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#081614]/70">科研/项目</label>
                  <select 
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-[#081614]/10 bg-white"
                    value={formData.research}
                    onChange={e => setFormData({...formData, research: e.target.value})}
                  >
                    <option>暂时没有</option>
                    <option>有课程项目</option>
                    <option>有较完整科研</option>
                  </select>
                </div>
              </motion.div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={analyzing}
              className="w-full py-4 bg-[#081614] text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {analyzing ? '分析中...' : '生成我的申请状态'}
            </button>
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-[#081614]/8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ecfff8] text-[#087b64] text-sm font-bold">
            全流程进度地图
          </span>
          <h2 className="text-2xl font-black mt-4 mb-2">港校申请导航地图</h2>
          <p className="text-[#081614]/60 mb-6">
            从准备到拿到 Offer，把每个阶段该做的事放到一张地图里
          </p>
          
          <div className="grid grid-cols-7 gap-2">
            {['1-3月','4-6月','7-8月','9-10月','11-12月','1-3月','4-6月'].map((m, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-[#f6fffc] border border-[#22d3a6]/15">
                <div className="text-xs text-[#087b64] font-bold">{m}</div>
                <div className="text-xs text-[#081614]/60 mt-1">阶段{i+1}</div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/timeline')}
            className="mt-6 px-6 py-3 bg-[#081614] text-white font-bold rounded-xl"
          >
            查看全部阶段详情
          </button>
        </motion.div>
      </div>
    </div>
  );
}
