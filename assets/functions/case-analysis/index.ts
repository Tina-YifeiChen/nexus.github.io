// Nexus AI 案例分析 Edge Function
// 调用 Meoo AI 服务进行智能分析

// CORS headers
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEOO_AI_BASE_URL = 'https://api.meoo.host';
const MEOO_PROJECT_SERVICE_AK = Deno.env.get('MEOO_PROJECT_API_KEY') || '';

// 调用 Meoo AI 服务
async function callMeooAI(background: string) {
  if (!MEOO_PROJECT_SERVICE_AK) {
    console.log('MEOO_PROJECT_API_KEY not set, using mock data');
    return null;
  }

  try {
    const response = await fetch(
      `${MEOO_AI_BASE_URL}/meoo-ai/compatible-mode/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MEOO_PROJECT_SERVICE_AK}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3.6-plus',
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
    "ielts": {
      "current": "当前语言分数",
      "after": "提升后分数",
      "description": "语言提升的影响描述"
    },
    "intern": {
      "current": "当前实习分数",
      "after": "提升后分数",
      "description": "实习提升的影响描述"
    },
    "cv": {
      "current": "当前文书分数",
      "after": "提升后分数",
      "description": "提前完成CV的影响描述"
    },
    "budget": {
      "current": "当前预算分数",
      "after": "提升后分数",
      "description": "预算规划的影响描述"
    }
  },
  "timeline": [
    { "month": "2024-09", "title": "阶段名称", "tasks": ["任务1", "任务2", "任务3"] },
    { "month": "2024-10", "title": "阶段名称", "tasks": ["任务1", "任务2", "任务3"] },
    { "month": "2024-11", "title": "阶段名称", "tasks": ["任务1", "任务2", "任务3"] },
    { "month": "2024-12", "title": "阶段名称", "tasks": ["任务1", "任务2", "任务3"] }
  ]
}

请确保返回的是有效的 JSON 格式，不要包含 markdown 代码块标记。`
            },
            {
              role: 'user',
              content: `请分析以下学生的香港留学申请背景：\n\n${background}`
            }
          ],
          stream: false
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meoo AI error:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in Meoo AI response');
      return null;
    }

    // 尝试解析 JSON
    try {
      // 提取 JSON 部分（如果返回的是 markdown 格式）
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonStr.trim());
      console.log('Successfully parsed Meoo AI response');
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Meoo AI response as JSON:', content);
      return null;
    }
  } catch (error) {
    console.error('Error calling Meoo AI:', error);
    return null;
  }
}

// Generate mock AI analysis based on background
function generateMockAnalysis(background: string) {
  // Parse background to extract key info
  const hasHighGPA = background.includes('3.5') || background.includes('3.6') || background.includes('3.7') || background.includes('3.8') || background.includes('3.9') || background.includes('85') || background.includes('86') || background.includes('87') || background.includes('88') || background.includes('89') || background.includes('90');
  const hasLowGPA = background.includes('3.0') || background.includes('3.1') || background.includes('3.2') || background.includes('3.3') || background.includes('75') || background.includes('76') || background.includes('77') || background.includes('78') || background.includes('79') || background.includes('80');
  const hasGoodIELTS = background.includes('7') || background.includes('7.5') || background.includes('8') || background.includes('100') || background.includes('105') || background.includes('110');
  const hasLowIELTS = background.includes('6') || background.includes('6.5') || background.includes('80') || background.includes('85') || background.includes('90');
  const isBusiness = background.includes('商科') || background.includes('金融') || background.includes('经济') || background.includes('管理');
  const isCS = background.includes('CS') || background.includes('计算机') || background.includes('AI') || background.includes('人工智能') || background.includes('数据');
  const is211 = background.includes('211') || background.includes('985') || background.includes('双一流') || background.includes('四川') || background.includes('中山') || background.includes('武汉') || background.includes('浙江');
  const isDoubleNon = background.includes('双非') || background.includes('普通');

  // Determine profile type based on background
  let profileType = '稳中带冲型';
  let profileSummary = '你的背景整体较为均衡，既有冲刺港前三的潜力，也需要稳妥路径作为托底。建议采取分层申请策略。';

  if (hasLowGPA && !is211) {
    profileType = '低绩点突围型';
    profileSummary = '你的绩点偏低且非名校背景，需要重点补强语言成绩和实习经历，用其他维度弥补学术短板。';
  } else if (hasHighGPA && is211 && hasGoodIELTS) {
    profileType = '冲刺港三型';
    profileSummary = '你的背景条件优秀，具备冲刺港大、港中文、港科的竞争力。建议主申港前三，同时保留稳妥选项。';
  } else if (isBusiness && hasLowIELTS) {
    profileType = '商科语言待补型';
    profileSummary = '商科竞争激烈，你的语言成绩还有提升空间。建议优先冲刺雅思7.0，同时积累相关实习经历。';
  } else if (isCS) {
    profileType = '技术背景稳健型';
    profileSummary = 'CS方向申请相对理性，你的技术背景是优势。建议关注项目匹配度，同时准备技术面试。';
  }

  // Calculate scores based on background
  const academicScore = hasHighGPA ? (is211 ? 88 : 82) : (hasLowGPA ? 68 : 75);
  const languageScore = hasGoodIELTS ? 85 : (hasLowIELTS ? 65 : 70);
  const internScore = isBusiness ? 72 : (isCS ? 78 : 70);
  const rhythmScore = 70;
  const budgetScore = 75;
  const essayScore = 72;

  // Determine advantage and weakness with full display text
  let advantage = '学术基础不错';
  let weakness = '语言和节奏要稳住';

  if (academicScore >= languageScore && academicScore >= internScore) {
    advantage = '学术基础不错';
  } else if (languageScore >= academicScore && languageScore >= internScore) {
    advantage = '语言成绩达标';
  } else {
    advantage = '实习经历丰富';
  }

  if (languageScore <= academicScore && languageScore <= internScore) {
    weakness = '语言和节奏要稳住';
  } else if (academicScore <= languageScore && academicScore <= internScore) {
    weakness = '学术背景需提升';
  } else {
    weakness = '实习经历要补强';
  }

  // Generate personalized strategy and next step
  let strategy = '分层申请，冲刺与稳妥并行';
  let nextStep = '先补语言，再定选校清单';
  let priorityAdvice = '你现在更适合先把语言和申请节奏稳住，再决定港前三冲刺数量和主申学校组合。';

  if (profileType === '低绩点突围型') {
    strategy = '用语言和实习弥补绩点短板';
    nextStep = '优先冲刺雅思7.0，同时补充实习';
    priorityAdvice = '你的核心问题是绩点竞争力不足，建议用高语言成绩和相关实习经历来建立差异化优势。';
  } else if (profileType === '冲刺港三型') {
    strategy = '主申港前三，保留稳妥选项';
    nextStep = '完善文书，准备面试';
    priorityAdvice = '你的背景条件优秀，建议重点打磨文书质量，同时准备港前三的面试环节。';
  } else if (profileType === '商科语言待补型') {
    strategy = '先提语言，再冲商科';
    nextStep = '雅思冲刺7.0，补充金融实习';
    priorityAdvice = '商科竞争激烈，语言是硬门槛。建议优先提升雅思成绩，同时积累2-3段相关实习。';
  }

  return {
    profileType,
    profileSummary,
    scores: {
      academic: academicScore,
      language: languageScore,
      intern: internScore,
      rhythm: rhythmScore,
      budget: budgetScore,
      essay: essayScore
    },
    advantage,
    weakness,
    strategy,
    nextStep,
    priorityAdvice,
    effortSimulation: {
      ielts: {
        current: String(languageScore),
        after: String(Math.min(languageScore + 12, 95)),
        description: `如果雅思提升到7.0+，语言风险会明显下降，${isBusiness ? '商科申请竞争力' : '整体申请竞争力'}将大幅提升。`
      },
      intern: {
        current: String(internScore),
        after: String(Math.min(internScore + 10, 90)),
        description: `如果新增一段${isBusiness ? '金融/咨询' : isCS ? '技术/研发' : '相关'}实习，经历匹配度会上升，文书也更容易讲清职业动机。`
      },
      cv: {
        current: String(essayScore),
        after: String(Math.min(essayScore + 8, 88)),
        description: '如果提前完成CV和主文书框架，申请节奏风险会下降，更适合赶第一轮。'
      },
      budget: {
        current: String(budgetScore),
        after: String(Math.min(budgetScore + 6, 85)),
        description: '如果预算规划清晰，可以加入港中深、港科广等替代路径，选择会更现实。'
      }
    },
    timeline: [
      { month: '2024-09', title: '探索定位期', tasks: ['确定目标方向', '粗筛港校层级', '判断语言考试需求'] },
      { month: '2024-10', title: '背景补强期', tasks: ['冲刺语言成绩', '补充实习/科研', '维护GPA'] },
      { month: '2024-11', title: '材料准备期', tasks: ['完成CV初稿', '整理PS主题', '联系推荐人'] },
      { month: '2024-12', title: '开放冲刺期', tasks: ['检查项目开放', '优先提交主申', '准备面试'] }
    ]
  };
}

// 调用 AI 分析
async function callAIAnalysis(background: string) {
  // 首先尝试调用 Meoo AI
  const meooResult = await callMeooAI(background);
  if (meooResult) {
    console.log('Using Meoo AI result');
    return meooResult;
  }
  
  // 如果 API 调用失败，使用模拟数据
  console.log('Using mock analysis data for:', background);
  return generateMockAnalysis(background);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    const { background, action } = body;

    if (!background) {
      return new Response(
        JSON.stringify({ error: 'Missing background parameter' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call AI for analysis
    const aiResult = await callAIAnalysis(background);

    // Build response based on action type
    let result: any = {};

    switch (action) {
      case 'full':
        // Return complete analysis
        result = {
          profileType: aiResult.profileType,
          profileSummary: aiResult.profileSummary,
          scores: aiResult.scores,
          advantage: aiResult.advantage,
          weakness: aiResult.weakness,
          strategy: aiResult.strategy,
          nextStep: aiResult.nextStep,
          priorityAdvice: aiResult.priorityAdvice,
          effortSimulation: aiResult.effortSimulation,
        };
        break;

      case 'timeline':
        // Return timeline only, map to stages format
        result = (aiResult.timeline || []).map((t: any, i: number) => ({
          slug: t.month?.replace(/[^a-zA-Z0-9]/g, '') || `stage${i}`,
          month: t.month?.includes('-') ? t.month.split('-').slice(1).join('-') : t.month,
          name: t.title || '申请阶段',
          round: i === 0 ? '起点' : i === 1 ? '黄金补强' : i === 2 ? 'R1准备' : i === 3 ? '第一轮 R1' : i === 4 ? 'R1 黄金期' : i === 5 ? '第二轮 R2' : '收尾 / 行前',
          title: t.title || '申请阶段',
          time: `${t.month || ''}｜${t.tasks?.[0] || '关键任务'}`,
          summary: t.tasks?.join('；') || '完成本阶段关键任务',
          progress: ['语言 ' + (60 + i * 5) + '%', '材料 ' + (30 + i * 10) + '%', '选校 ' + (40 + i * 8) + '%', '节奏 ' + (50 + i * 6) + '%'],
          tasks: t.tasks || ['确定目标方向', '准备申请材料', '提交申请'],
          materials: ['成绩单', '语言成绩', '推荐信'],
          risk: '按时完成本阶段任务，避免拖延',
          advisor: '根据进度决定是否需要顾问',
          money: '合理规划申请费用'
        }));
        break;

      case 'effort':
        // Return effort simulation only
        result = {
          effortSimulation: aiResult.effortSimulation,
        };
        break;

      default:
        // Default to full analysis
        result = {
          profileType: aiResult.profileType,
          profileSummary: aiResult.profileSummary,
          scores: aiResult.scores,
          advantage: aiResult.advantage,
          weakness: aiResult.weakness,
          strategy: aiResult.strategy,
          nextStep: aiResult.nextStep,
          priorityAdvice: aiResult.priorityAdvice,
          effortSimulation: aiResult.effortSimulation,
        };
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: corsHeaders,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: message,
        // Return fallback data for development
        data: {
          profileType: '分析中...',
          profileSummary: '正在生成个性化分析，请稍后再试。',
          scores: { academic: 70, language: 60, intern: 65, rhythm: 60, budget: 70, essay: 65 },
          strategy: '根据你的背景制定个性化策略',
          nextStep: '先查看你的申请画像详情',
        }
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
