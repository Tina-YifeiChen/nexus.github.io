import React, { createContext, useContext, useState, useCallback } from 'react';

interface AnalysisData {
  profileType: string;
  profileSummary: string;
  scores: {
    academic: number;
    language: number;
    intern: number;
    rhythm: number;
    budget: number;
    essay: number;
  };
  advantage: string;
  weakness: string;
  strategy: string;
  nextStep: string;
  priorityAdvice: string;
  effortSimulation: {
    ielts: { current: string; after: string; description: string };
    intern: { current: string; after: string; description: string };
    cv: { current: string; after: string; description: string };
    budget: { current: string; after: string; description: string };
  };
  timeline: Array<{
    month: string;
    name: string;
    round: string;
    desc: string;
    title: string;
    time: string;
    progress: string[];
    tasks: string[];
    warning: string;
  }>;
}

interface AnalysisContextType {
  analysis: AnalysisData | null;
  loading: boolean;
  error: string | null;
  analyzeCase: (backgroundData: Record<string, string>) => Promise<void>;
  clearAnalysis: () => void;
  setAnalysisData: (data: AnalysisData | null) => void;
  setLoading: (loading: boolean) => void;
  backgroundData: Record<string, string>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// 阿里云百炼 API 配置
const BAILIAN_API_KEY = 'sk-48960136c09a478da22ad3088482a6ed';
const BAILIAN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// Mock data for development
const MOCK_MODE = false;

function generateMockAnalysis(background: string) {
  const hasHighGPA = background.includes('3.5') || background.includes('3.6') || background.includes('85');
  const hasGoodIELTS = background.includes('7') || background.includes('100');
  const isBusiness = background.includes('商科') || background.includes('金融');
  const isCS = background.includes('CS') || background.includes('计算机');

  const profileType = hasHighGPA ? '冲刺港三型' : hasGoodIELTS ? '稳中带冲型' : '语言待补型';
  const scores = {
    academic: hasHighGPA ? 88 : 75,
    language: hasGoodIELTS ? 85 : 65,
    intern: isBusiness ? 72 : isCS ? 78 : 70,
    rhythm: 70,
    budget: 75,
    essay: 72
  };

  return {
    profileType,
    profileSummary: `你的背景${hasHighGPA ? '优秀' : '整体均衡'}，${isBusiness ? '商科' : isCS ? 'CS' : '申请'}方向${hasGoodIELTS ? '具备竞争力' : '需要补强语言'}。`,
    scores,
    advantage: hasHighGPA ? '学术基础不错' : hasGoodIELTS ? '语言成绩达标' : '背景均衡',
    weakness: hasGoodIELTS ? '实习经历待补强' : '语言成绩需提升',
    strategy: hasHighGPA ? '冲刺港三，保留稳妥' : '分层申请，稳中求进',
    nextStep: hasGoodIELTS ? '完善文书，准备面试' : '优先冲刺语言成绩',
    priorityAdvice: '建议根据当前优势制定申请策略，合理分配时间和精力。',
    effortSimulation: {
      ielts: { current: String(scores.language), after: String(Math.min(scores.language + 12, 95)), description: '如果雅思提升到7.0+，语言风险会明显下降，整体申请竞争力将大幅提升。' },
      intern: { current: String(scores.intern), after: String(Math.min(scores.intern + 10, 90)), description: `如果新增一段${isBusiness ? '金融/咨询' : isCS ? '技术/研发' : '相关'}实习，经历匹配度会上升。` },
      cv: { current: String(scores.essay), after: String(Math.min(scores.essay + 8, 88)), description: '如果提前完成CV和主文书框架，申请节奏风险会下降。' },
      budget: { current: String(scores.budget), after: String(Math.min(scores.budget + 6, 85)), description: '如果预算规划清晰，可以加入港中深、港科广等替代路径。' }
    },
    timeline: [
      { month: '2024-09', name: '探索定位期', round: '起点', desc: '确定目标方向', title: '探索定位期', time: '2024-09｜确定方向与初步定位', progress: ['语言 20%', '材料 10%', '选校 20%', '节奏 30%'], tasks: ['确定目标方向', '粗筛港校层级', '判断语言考试需求'], warning: '还没看清自己就被外部建议带着走' },
      { month: '2024-10', name: '背景补强期', round: '黄金补强', desc: '冲刺语言成绩', title: '背景补强期', time: '2024-10｜申请前关键窗口', progress: ['语言 60%', '材料 25%', '选校 45%', '节奏 68%'], tasks: ['冲刺语言成绩', '补充实习/科研', '维护GPA'], warning: '把钱花在不能改变核心变量的地方' },
      { month: '2024-11', name: '材料准备期', round: 'R1准备', desc: '完成CV初稿', title: '材料准备期', time: '2024-11｜R1提交前的材料窗口', progress: ['语言 70%', '材料 55%', '选校 62%', '节奏 72%'], tasks: ['完成CV初稿', '整理PS主题', '联系推荐人'], warning: '一边换方向一边写文书' },
      { month: '2024-12', name: '开放冲刺期', round: '第一轮 R1', desc: '检查项目开放', title: '港校开放冲刺期', time: '2024-12｜项目开放与第一轮准备', progress: ['语言 78%', '材料 72%', '选校 80%', '节奏 76%'], tasks: ['检查项目开放', '优先提交主申', '准备面试'], warning: '无限拖延' }
    ]
  };
}

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysis, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backgroundData, setBackgroundData] = useState<Record<string, string>>({});

  const analyzeCase = useCallback(async (data: Record<string, string>) => {
    setLoading(true);
    setError(null);
    setBackgroundData(data);

    try {
      const backgroundText = `
学校：${data.school || '未填写'}；
GPA：${data.gpa || '未填写'}；
语言成绩：${data.language || '未填写'}；
目标方向：${data.direction || '未填写'}；
`.trim();

      // 如果 MOCK_MODE 为 true，使用模拟数据
      if (MOCK_MODE) {
        console.log('MOCK_MODE: Using mock analysis data');
        const mockData = generateMockAnalysis(backgroundText);
        setAnalysisData(mockData as AnalysisData);
        localStorage.setItem('nexusAnalysis', JSON.stringify(mockData));
        setLoading(false);
        return;
      }

      // 直接调用阿里云百炼 API
      const res = await fetch(BAILIAN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BAILIAN_API_KEY}`
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          input: {
            messages: [
              {
                role: 'system',
                content: `你是一个专业的香港留学申请顾问。请根据学生的背景信息，生成个性化的申请分析和建议。

请返回以下格式的 JSON 数据：
{
  "profileType": "申请类型名称（如：冲刺港三型、稳中带冲型、低绩点突围型等）",
  "profileSummary": "整体背景评价摘要",
  "scores": {
    "academic": 学术基础分数（0-100）,
    "language": 语言成绩分数（0-100）,
    "intern": 实习科研分数（0-100）,
    "rhythm": 申请节奏分数（0-100）,
    "budget": 预算适配分数（0-100）,
    "essay": 文书潜力分数（0-100）
  },
  "advantage": "当前优势（简短描述）",
  "weakness": "当前短板（简短描述）",
  "strategy": "更适合的策略（简短描述）",
  "nextStep": "下一步先看（简短描述）",
  "priorityAdvice": "优先建议（详细描述）",
  "effortSimulation": {
    "ielts": { "current": "当前语言分数", "after": "提升后分数", "description": "语言提升的影响描述" },
    "intern": { "current": "当前实习分数", "after": "提升后分数", "description": "实习提升的影响描述" },
    "cv": { "current": "当前文书分数", "after": "提升后分数", "description": "提前完成CV的影响描述" },
    "budget": { "current": "当前预算分数", "after": "提升后分数", "description": "预算规划的影响描述" }
  },
  "timeline": [
    { "month": "2024-09", "name": "探索定位期", "round": "起点", "desc": "确定目标方向", "title": "探索定位期", "time": "2024-09｜确定方向与初步定位", "progress": ["语言 20%", "材料 10%", "选校 20%", "节奏 30%"], "tasks": ["确定目标方向", "粗筛港校层级", "判断语言考试需求"], "warning": "还没看清自己就被外部建议带着走" },
    { "month": "2024-10", "name": "背景补强期", "round": "黄金补强", "desc": "冲刺语言成绩", "title": "背景补强期", "time": "2024-10｜申请前关键窗口", "progress": ["语言 60%", "材料 25%", "选校 45%", "节奏 68%"], "tasks": ["冲刺语言成绩", "补充实习/科研", "维护GPA"], "warning": "把钱花在不能改变核心变量的地方" },
    { "month": "2024-11", "name": "材料准备期", "round": "R1准备", "desc": "完成CV初稿", "title": "材料准备期", "time": "2024-11｜R1提交前的材料窗口", "progress": ["语言 70%", "材料 55%", "选校 62%", "节奏 72%"], "tasks": ["完成CV初稿", "整理PS主题", "联系推荐人"], "warning": "一边换方向一边写文书" },
    { "month": "2024-12", "name": "开放冲刺期", "round": "第一轮 R1", "desc": "检查项目开放", "title": "港校开放冲刺期", "time": "2024-12｜项目开放与第一轮准备", "progress": ["语言 78%", "材料 72%", "选校 80%", "节奏 76%"], "tasks": ["检查项目开放", "优先提交主申", "准备面试"], "warning": "无限拖延" }
  ]
}

请确保返回的是有效的 JSON 格式，不要包含 markdown 代码块标记。`
              },
              {
                role: 'user',
                content: `请分析以下学生的香港留学申请背景：\n\n${backgroundText}`
              }
            ]
          },
          parameters: {
            result_format: 'message',
            max_tokens: 2000,
            temperature: 0.7
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('百炼 API 错误:', res.status, errorText);
        throw new Error(`API 错误: ${res.status}`);
      }

      const result = await res.json();
      const content = result.output?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('API 返回内容为空');
      }

      // 解析 JSON
      let parsedData;
      try {
        // 尝试提取 JSON（如果返回的是 markdown 格式）
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                          content.match(/```\n?([\s\S]*?)\n?```/) ||
                          [null, content];
        const jsonStr = jsonMatch[1] || content;
        parsedData = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        console.error('JSON 解析失败:', content);
        throw new Error('AI 返回格式错误');
      }

      setAnalysisData(parsedData as AnalysisData);
      localStorage.setItem('nexusAnalysis', JSON.stringify(parsedData));
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisData(null);
    localStorage.removeItem('nexusAnalysis');
  }, []);

  return (
    <AnalysisContext.Provider value={{ analysis, loading, error, analyzeCase, clearAnalysis, setAnalysisData, setLoading, backgroundData }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used within AnalysisProvider');
  return context;
}