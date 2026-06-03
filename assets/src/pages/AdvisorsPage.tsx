import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar, Filter } from 'lucide-react';
import { api } from '../services/api';

interface Advisor {
  id: string;
  name: string;
  avatar?: string;
  school: string;
  major: string;
  year: string;
  rating: number;
  review_count: number;
  price_per_hour: number;
  specialties: string[];
  bio: string;
}

export default function AdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadAdvisors();
  }, []);

  async function loadAdvisors() {
    try {
      const data = await api.listAdvisors();
      // 转换数据库格式到前端格式
      const formattedAdvisors = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        school: item.school || '香港大学',
        major: item.specialty || '留学顾问',
        year: '2023',
        rating: Number(item.rating) || 4.5,
        review_count: 0,
        price_per_hour: item.price_per_hour || 500,
        specialties: item.specialty ? item.specialty.split('/') : ['留学申请'],
        bio: item.bio || `${item.name}，专注${item.specialty || '留学'}申请指导`
      }));
      setAdvisors(formattedAdvisors.length > 0 ? formattedAdvisors : getDefaultAdvisors());
    } catch (e) {
      console.error('Failed to load advisors:', e);
      setAdvisors(getDefaultAdvisors());
    } finally {
      setLoading(false);
    }
  }

  function getDefaultAdvisors(): Advisor[] {
    return [
      { id: '1', name: '张顾问', school: '香港大学', major: '金融学', year: '2023', rating: 4.9, review_count: 28, price_per_hour: 800, specialties: ['商科申请', '面试辅导'], bio: '港大金融硕士，帮助20+学弟学妹拿到港前三offer' },
      { id: '2', name: '李顾问', school: '香港中文大学', major: '计算机科学', year: '2022', rating: 4.8, review_count: 35, price_per_hour: 750, specialties: ['CS申请', '文书修改'], bio: 'CUHK CS硕士，专注转专业申请指导' },
      { id: '3', name: '王顾问', school: '香港科技大学', major: '商业分析', year: '2023', rating: 4.7, review_count: 22, price_per_hour: 600, specialties: ['BA申请', '选校策略'], bio: 'HKUST BA硕士，擅长低GPA逆袭策略' },
    ];
  }

  const filteredAdvisors = advisors.filter(a => 
    filter === '' || a.specialties.some(s => s.includes(filter))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-emerald-100">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
          真人顾问匹配
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">有些问题，适合问已经走过这条路的人</h1>
        <p className="text-gray-600 max-w-2xl">AI 先帮你看清自己的申请状态；如果你遇到低绩点、跨专业、港前三冲刺、面试准备或文书主线不清楚，可以再找目标院校学长学姐或顶级申请顾问做复核。</p>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-gray-500" />
        <button 
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === '' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          全部
        </button>
        <button 
          onClick={() => setFilter('商科')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === '商科' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          商科
        </button>
        <button 
          onClick={() => setFilter('CS')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'CS' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          CS
        </button>
        <button 
          onClick={() => setFilter('面试')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === '面试' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          面试辅导
        </button>
      </div>

      {/* Advisors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvisors.map((advisor, i) => (
          <motion.div
            key={advisor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-emerald-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
                {advisor.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{advisor.name}</h3>
                <p className="text-sm text-gray-500">{advisor.school} · {advisor.major}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">{advisor.rating}</span>
                  <span className="text-sm text-gray-400">({advisor.review_count}条评价)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{advisor.bio}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {advisor.specialties.map((s, j) => (
                <span key={j} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg font-medium">
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-emerald-600 font-bold">¥{advisor.price_per_hour}/小时</div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                <MessageCircle className="w-4 h-4" />
                咨询
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
