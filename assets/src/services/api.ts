const API_BASE = "https://dwe2psccef7z.meoo.cloud/sb-api";
const FUNCTIONS_BASE = "https://dwe2psccef7z.meoo.cloud";
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5OTczODE4LCJleHAiOjEzMjkwNjEzODE4fQ.caALNpecwtLlBY752O8D67Xfp8Ou9T_jj0jv2ZXxAHA';

// 阿里云百炼 API 配置
const BAILIAN_API_KEY = 'sk-48960136c09a478da22ad3088482a6ed';
const BAILIAN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// 获取当前环境的 API 基础 URL
function getApiBase(): string {
  if (typeof window !== 'undefined' && (window as any).MEOO_CONFIG?.meoo_app_access_url) {
    return `${(window as any).MEOO_CONFIG.meoo_app_access_url}/sb-api`;
  }
  return API_BASE;
}

// 获取当前环境的函数基础 URL
function getFunctionsBase(): string {
  if (typeof window !== 'undefined' && (window as any).MEOO_CONFIG?.meoo_app_access_url) {
    return (window as any).MEOO_CONFIG.meoo_app_access_url;
  }
  return FUNCTIONS_BASE;
}

// Mock data for development when API is unreachable
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

let _token = localStorage.getItem("nx_token") || "";

async function _request(path: string, opts: RequestInit = {}) {
  const url = getApiBase() + "/rest/v1" + path;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    ...(opts.headers as Record<string, string> || {})
  };
  if (_token) headers["Authorization"] = "Bearer " + _token;

  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

async function _authRequest(endpoint: string, body: object) {
  const url = getApiBase() + "/auth/v1/" + endpoint;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error);
  return data;
}

export const api = {
  isLoggedIn: () => !!_token,
  getToken: () => _token,

  async login(email: string, password: string) {
    const data = await _authRequest("token?grant_type=password", { email, password });
    _token = data.access_token;
    localStorage.setItem("nx_token", _token);
    localStorage.setItem("nx_user", JSON.stringify(data.user));
    return data;
  },

  async register(email: string, password: string, fullName: string) {
    const data = await _authRequest("signup", { email, password, data: { full_name: fullName } });
    if (data.session) {
      _token = data.session.access_token;
      localStorage.setItem("nx_token", _token);
      localStorage.setItem("nx_user", JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    _token = "";
    localStorage.removeItem("nx_token");
    localStorage.removeItem("nx_user");
  },

  async analyzeCaseFull(backgroundData: Record<string, string>) {
    const backgroundText = Object.entries(backgroundData).map(([k, v]) => `${k}：${v}`).join("；");

    if (MOCK_MODE || !backgroundText.trim()) {
      console.log('Using mock analysis data');
      return generateMockAnalysis(backgroundText);
    }

    try {
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

      return parsedData;
    } catch (error) {
      console.error('Failed to call API, using mock data:', error);
      return generateMockAnalysis(backgroundText);
    }
  },

  async getTimeline(backgroundData: Record<string, string>) {
    const backgroundText = Object.entries(backgroundData).map(([k, v]) => `${k}：${v}`).join("；");

    if (MOCK_MODE) {
      console.log('Using mock timeline data');
      const mock = generateMockAnalysis(backgroundText);
      return mock.timeline;
    }

    try {
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
                content: `你是一个专业的香港留学申请顾问。请根据学生的背景信息，生成个性化的申请时间线。

请返回以下格式的 JSON 数据（只返回 timeline 数组）：
[
  { "month": "2024-09", "name": "探索定位期", "round": "起点", "desc": "确定目标方向", "title": "探索定位期", "time": "2024-09｜确定方向与初步定位", "progress": ["语言 20%", "材料 10%", "选校 20%", "节奏 30%"], "tasks": ["确定目标方向", "粗筛港校层级", "判断语言考试需求"], "warning": "还没看清自己就被外部建议带着走" },
  { "month": "2024-10", "name": "背景补强期", "round": "黄金补强", "desc": "冲刺语言成绩", "title": "背景补强期", "time": "2024-10｜申请前关键窗口", "progress": ["语言 60%", "材料 25%", "选校 45%", "节奏 68%"], "tasks": ["冲刺语言成绩", "补充实习/科研", "维护GPA"], "warning": "把钱花在不能改变核心变量的地方" },
  { "month": "2024-11", "name": "材料准备期", "round": "R1准备", "desc": "完成CV初稿", "title": "材料准备期", "time": "2024-11｜R1提交前的材料窗口", "progress": ["语言 70%", "材料 55%", "选校 62%", "节奏 72%"], "tasks": ["完成CV初稿", "整理PS主题", "联系推荐人"], "warning": "一边换方向一边写文书" },
  { "month": "2024-12", "name": "开放冲刺期", "round": "第一轮 R1", "desc": "检查项目开放", "title": "港校开放冲刺期", "time": "2024-12｜项目开放与第一轮准备", "progress": ["语言 78%", "材料 72%", "选校 80%", "节奏 76%"], "tasks": ["检查项目开放", "优先提交主申", "准备面试"], "warning": "无限拖延" }
]

请确保返回的是有效的 JSON 格式，不要包含 markdown 代码块标记。`
              },
              {
                role: 'user',
                content: `请为以下学生生成香港留学申请时间线：\n\n${backgroundText}`
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
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                          content.match(/```\n?([\s\S]*?)\n?```/) ||
                          [null, content];
        const jsonStr = jsonMatch[1] || content;
        parsedData = JSON.parse(jsonStr.trim());
      } catch (parseError) {
        console.error('JSON 解析失败:', content);
        throw new Error('AI 返回格式错误');
      }

      return parsedData;
    } catch (error) {
      console.error('Failed to call timeline API, using mock data:', error);
      const mock = generateMockAnalysis(backgroundText);
      return mock.timeline;
    }
  },

  async listAdvisors() {
    if (MOCK_MODE) {
      console.log('MOCK_MODE: Returning mock advisors data');
      return [
        { id: '1', name: '张顾问', avatar: '', school: '香港大学', major: '金融学', year: '2023', rating: 4.9, review_count: 28, price_per_hour: 800, specialties: ['商科申请', '面试辅导'], bio: '港大金融硕士，帮助20+学弟学妹拿到港前三offer', available: true },
        { id: '2', name: '李顾问', avatar: '', school: '香港中文大学', major: '计算机科学', year: '2022', rating: 4.8, review_count: 35, price_per_hour: 750, specialties: ['CS申请', '文书修改'], bio: 'CUHK CS硕士，专注转专业申请指导', available: true },
        { id: '3', name: '王顾问', avatar: '', school: '香港科技大学', major: '商业分析', year: '2023', rating: 4.7, review_count: 22, price_per_hour: 600, specialties: ['BA申请', '选校策略'], bio: 'HKUST BA硕士，擅长低GPA逆袭策略', available: true },
      ];
    }

    try {
      const data = await _request("/advisors?select=*");
      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        school: item.school || '香港大学',
        major: item.specialty ? item.specialty.split('/')[0] : '留学顾问',
        year: '2023',
        rating: Number(item.rating) || 4.5,
        review_count: 0,
        price_per_hour: item.price_per_hour || 500,
        specialties: item.specialty ? item.specialty.split('/') : ['留学申请'],
        bio: item.bio || `${item.name}，专注${item.specialty || '留学'}申请指导`,
        available: item.available !== false
      }));
    } catch (error) {
      console.error('Failed to fetch advisors:', error);
      return [
        { id: '1', name: '张顾问', avatar: '', school: '香港大学', major: '金融学', year: '2023', rating: 4.9, review_count: 28, price_per_hour: 800, specialties: ['商科申请', '面试辅导'], bio: '港大金融硕士，帮助20+学弟学妹拿到港前三offer', available: true },
        { id: '2', name: '李顾问', avatar: '', school: '香港中文大学', major: '计算机科学', year: '2022', rating: 4.8, review_count: 35, price_per_hour: 750, specialties: ['CS申请', '文书修改'], bio: 'CUHK CS硕士，专注转专业申请指导', available: true },
        { id: '3', name: '王顾问', avatar: '', school: '香港科技大学', major: '商业分析', year: '2023', rating: 4.7, review_count: 22, price_per_hour: 600, specialties: ['BA申请', '选校策略'], bio: 'HKUST BA硕士，擅长低GPA逆袭策略', available: true },
      ];
    }
  },

  async listCases() {
    return _request("/cases?select=*&order=created_at.desc");
  },

  async createCase(payload: object) {
    return _request("/cases", { method: "POST", body: JSON.stringify(payload) });
  },

  async updateCaseAnalysis(caseId: number, analysisData: object) {
    return _request(`/cases?id=eq.${caseId}`, {
      method: "PATCH",
      body: JSON.stringify({
        analysis: JSON.stringify(analysisData),
        status: 'analyzed'
      })
    });
  },

  async createCaseWithAnalysis(backgroundData: Record<string, string>, userId: string, userEmail?: string) {
    const analysisResult = await this.analyzeCaseFull(backgroundData);

    // 如果用户未登录（userId 为空），不创建案例，只返回分析结果
    if (!userId) {
      console.log('User not logged in, skipping case creation');
      return { case: null, analysis: analysisResult };
    }

    try {
      // 先确保 profiles 表中有该用户的记录（外键约束要求）
      try {
        const existingProfile = await _request(`/profiles?id=eq.${userId}`);
        // 如果 profiles 记录不存在（返回空数组），创建一个
        if ((!existingProfile || existingProfile.length === 0) && userEmail) {
          await _request('/profiles', {
            method: 'POST',
            body: JSON.stringify({ id: userId, email: userEmail })
          });
        }
      } catch (profileError) {
        // 查询失败也尝试创建
        if (userEmail) {
          try {
            await _request('/profiles', {
              method: 'POST',
              body: JSON.stringify({ id: userId, email: userEmail })
            });
          } catch {
            // 创建失败可能是已存在，忽略错误
          }
        }
      }

      const casePayload = {
        title: `${backgroundData.school || '未知学校'} 申请 ${backgroundData.direction || '未知方向'}`,
        student_id: userId,
        gpa: backgroundData.gpa ? parseFloat(backgroundData.gpa) : null,
        background: backgroundData.school,
        description: JSON.stringify(backgroundData),
        status: 'analyzed'
      };

      const newCase = await this.createCase(casePayload);

      if (newCase && newCase.id) {
        await this.updateCaseAnalysis(newCase.id, analysisResult);
      }

      return { case: newCase, analysis: analysisResult };
    } catch (error) {
      console.error('Failed to create case:', error);
      // 创建案例失败不影响分析结果返回
      return { case: null, analysis: analysisResult };
    }
  }
};
