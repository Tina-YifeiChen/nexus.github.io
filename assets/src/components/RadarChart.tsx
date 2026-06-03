import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  scores: {
    academic: number;
    language: number;
    intern: number;
    rhythm: number;
    budget: number;
    essay: number;
  };
}

const RadarChartComponent: React.FC<RadarChartProps> = ({ scores }) => {
  const data = [
    { subject: '学术基础', score: scores.academic, fullMark: 100 },
    { subject: '语言', score: scores.language, fullMark: 100 },
    { subject: '实习科研', score: scores.intern, fullMark: 100 },
    { subject: '申请节奏', score: scores.rhythm, fullMark: 100 },
    { subject: '预算适配', score: scores.budget, fullMark: 100 },
    { subject: '文书潜力', score: scores.essay, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#d8efea" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#5b6865', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="申请状态"
            dataKey="score"
            stroke="#22d3a6"
            strokeWidth={3}
            fill="#22d3a6"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;