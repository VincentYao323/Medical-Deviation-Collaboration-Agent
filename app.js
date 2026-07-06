const evidenceFilters = [
  "All",
  "Customer Email",
  "QA Note",
  "Excel",
  "Study Report",
  "Method Transfer Report"
];

const structuredCloneFallback = (value) => JSON.parse(JSON.stringify(value));

const buildTimestamp = (offsetMinutes) => {
  const base = new Date("2026-06-04T09:00:00+08:00");
  base.setMinutes(base.getMinutes() + offsetMinutes);
  return base.toISOString();
};

const buildLog = (id, actor, action, project, details, offsetMinutes) => ({
  id,
  timestamp: buildTimestamp(offsetMinutes),
  actor,
  action,
  project,
  details
});

const responseTemplates = {
  oncology: {
    answerSummary: [
      {
        text: "现有 mock 证据更支持晚班维护后压差短时失稳叠加换装交接执行波动，而非单一清洁频次不足。",
        citationId: "ONC-HV-004"
      },
      {
        text: "既往 CAPA 覆盖清洁频次，但未把维护干预后的再放行检查纳入控制点，是本次偏差重复发生的关键缺口。",
        citationId: "ONC-SR-019"
      }
    ],
    confidenceLevel: "Medium",
    insufficientEvidence: false,
    evidenceCitations: ["ONC-EM-001", "ONC-HV-004", "ONC-BR-010", "ONC-SR-019"],
    suggestedResponseToClient:
      "Draft only：当前内部评估指向晚班维护后环境恢复与人员换装执行一致性两个方向，建议在 QA/PM 完成人工审核后再对外沟通。",
    risks: [
      {
        text: "若仅追加清洁频次而不补晚班维护后的再放行检查，偏差可能在相同时间窗再次出现。",
        citationId: "ONC-SR-019"
      },
      {
        text: "夜班换装交接记录缺少二次确认，可能影响调查结论的可追溯性。",
        citationId: "ONC-BR-010"
      }
    ],
    actionItems: [
      {
        text: "对晚班维护后的 30 分钟环境恢复窗口增加加密 EM 采样和压差复核。",
        citationId: "ONC-HV-004"
      },
      {
        text: "补齐换装交接双人确认并复训夜班操作员。",
        citationId: "ONC-BR-010"
      }
    ],
    humanReviewRequired: true,
    guardrailNotes: [
      "Evidence is limited to mock sources.",
      "AI output does not replace accountable functional owners."
    ]
  },
  adc: {
    answerSummary: [
      {
        text: "当前信号更偏向设备 C-204 清场残留与维护窗口重叠，尚不足以下 definitive 监管结论。",
        citationId: "ADC-QA-101"
      },
      {
        text: "客户邮件提出的批间波动疑问与 CoA 趋势一致，但冲洗液采样点证据仍不充分。",
        citationId: "ADC-CE-103"
      }
    ],
    confidenceLevel: "Low",
    insufficientEvidence: true,
    evidenceCitations: ["ADC-QA-101", "ADC-CE-103", "ADC-COA-106", "ADC-SR-109"],
    suggestedResponseToClient:
      "Draft only：目前仅能说明内部正在补充设备残留与转运时差的调查证据，未经 QA/Medical Affairs 审核前不建议发送定性结论。",
    risks: [
      {
        text: "残留来源未锁定前，继续沿用相同清场策略可能放大后续批次波动风险。",
        citationId: "ADC-SR-109"
      },
      {
        text: "若直接对客户输出根因判断，可能超出当前证据支持范围。",
        citationId: "ADC-CE-103"
      }
    ],
    actionItems: [
      {
        text: "扩大 C-204 冲洗液采样点位并补做维护窗口前后的残留比对。",
        citationId: "ADC-SR-109"
      },
      {
        text: "将客户沟通草稿提交 PM、QA 与 Medical Affairs 联合审核。",
        citationId: "ADC-CE-103"
      }
    ],
    humanReviewRequired: true,
    guardrailNotes: [
      "Evidence is limited to mock sources.",
      "AI output does not replace accountable functional owners."
    ]
  },
  cmc: {
    answerSummary: [
      {
        text: "方法转移异常与夜班样品制备培训记录滞后及流动相批次切换同时相关，需要双线核查。",
        citationId: "CMC-QA-212"
      },
      {
        text: "系统适用性数据提示峰尾偏移与流动相批次一致，但仍需复测闭环验证。",
        citationId: "CMC-XL-207"
      }
    ],
    confidenceLevel: "Medium",
    insufficientEvidence: false,
    evidenceCitations: ["CMC-MT-201", "CMC-XL-207", "CMC-QA-212", "CMC-CE-214"],
    suggestedResponseToClient:
      "Draft only：可先说明我们已识别到样品制备与流动相切换两个调查方向，正式说明需待 QA 完成复核后确认。",
    risks: [
      {
        text: "若不补做全量复测，现有峰形异常可能影响方法转移结论的稳健性。",
        citationId: "CMC-XL-207"
      },
      {
        text: "培训记录晚于异常发生日期，会削弱调查报告的审计防御力。",
        citationId: "CMC-QA-212"
      }
    ],
    actionItems: [
      {
        text: "补做流动相新旧批次平行复测，并对夜班样品制备执行现场回顾。",
        citationId: "CMC-MT-201"
      },
      {
        text: "将对客户的书面说明标记为 draft，仅在审核通过后外发。",
        citationId: "CMC-CE-214"
      }
    ],
    humanReviewRequired: true,
    guardrailNotes: [
      "Evidence is limited to mock sources.",
      "AI output does not replace accountable functional owners."
    ]
  }
};

const baseProjects = [
  {
    id: "oncology",
    name: "Oncology IND Enabling Program",
    shortName: "Oncology IND",
    overview: "聚焦晚班环境监测异常，快速汇总 EM、HVAC、换装与 CAPA mock 证据。",
    stage: "调查中",
    owner: "QA + PM 联合看板",
    suggestedQuestions: [
      "造成这次晚班微生物偏差真正的问题是什么？",
      "当前最合理的偏差纠正与预防动作应该是什么？"
    ],
    evidence: [
      {
        citationId: "ONC-EM-001",
        sourceType: "QA Note",
        title: "B级背景微生物趋势复盘",
        snippet: "晚班 22:00-01:00 连续三周出现相同采样点菌落升高，白班未见同趋势。",
        relevanceScore: 0.96,
        date: "2026-05-13",
        project: "Oncology IND Enabling Program"
      },
      {
        citationId: "ONC-HV-004",
        sourceType: "Excel",
        title: "HVAC 压差与换气频次导出",
        snippet: "B级走廊压差在晚班维护后短时下探至报警阈值附近，恢复时间约 18 分钟。",
        relevanceScore: 0.92,
        date: "2026-05-14",
        project: "Oncology IND Enabling Program"
      },
      {
        citationId: "ONC-BR-010",
        sourceType: "Batch Record",
        title: "清洁与换装交接记录",
        snippet: "夜班换装站点周转时间缩短，个别交接记录存在二次确认缺失。",
        relevanceScore: 0.88,
        date: "2026-05-12",
        project: "Oncology IND Enabling Program"
      },
      {
        citationId: "ONC-SR-019",
        sourceType: "Study Report",
        title: "环境监测 CAPA 有效性跟踪",
        snippet: "既往 CAPA 对清洁频次有效，但未覆盖维护干预后的再放行检查。",
        relevanceScore: 0.83,
        date: "2026-05-18",
        project: "Oncology IND Enabling Program"
      }
    ],
    agentResponse: responseTemplates.oncology,
    reviewItems: [
      {
        id: "ONC-R1",
        claim: "晚班维护后环境恢复窗口需要追加再放行检查。",
        citationId: "ONC-HV-004",
        reviewerRole: "QA人员",
        status: "Pending Review",
        reviewerComments: "待确认维护 SOP 是否需同步修订。",
        allowedForClientCommunication: false
      },
      {
        id: "ONC-R2",
        claim: "夜班换装交接应增加双人确认。",
        citationId: "ONC-BR-010",
        reviewerRole: "PM",
        status: "Approved",
        reviewerComments: "可纳入 CAPA 草案。",
        allowedForClientCommunication: false
      }
    ],
    knowledgeRetention: {
      deviationVersions: ["EM-2026-05-A", "HVAC-Shift-02", "Gowning-Check-05"],
      proposedSolution: "维护后再放行检查 + 夜班换装双人确认 + 加密环境采样",
      margin: "预计可将重复偏差风险降低 30%-40%",
      turnaroundDays: 7,
      outcome: "待 QA 审核后纳入 CAPA 草案",
      successFactors: ["维护窗口清晰标记", "夜班培训闭环", "加密趋势监测"],
      failureFactors: ["只改清洁频次", "未追踪压差恢复", "交接记录持续缺失"],
      nextWatchouts: ["维护后首小时趋势", "夜班 PPE 合规性", "再放行签核完整度"]
    },
    auditLogs: [
      buildLog(
        "ONC-L1",
        "System",
        "project context changed",
        "Oncology IND Enabling Program",
        "初始化项目上下文：Oncology IND Enabling Program",
        0
      ),
      buildLog(
        "ONC-L2",
        "Agent",
        "agent response generated",
        "Oncology IND Enabling Program",
        "载入默认 mock 调查摘要与 guardrail notes",
        2
      )
    ]
  },
  {
    id: "adc",
    name: "ADC Process Development Program",
    shortName: "ADC PD",
    overview: "围绕偶联后清场残留与客户沟通草稿，评估证据充分性和外沟风险。",
    stage: "证据补充中",
    owner: "PM + Medical Affairs",
    suggestedQuestions: [
      "设备 C-204 的残留是否是造成批间波动的真实根因？",
      "在证据不足时，应该如何组织对客户的阶段性回应？"
    ],
    evidence: [
      {
        citationId: "ADC-QA-101",
        sourceType: "QA Note",
        title: "偶发偏差初判记录",
        snippet: "ADC 中试线在偶联后清场阶段检测到可疑残留，集中于设备 C-204。",
        relevanceScore: 0.94,
        date: "2026-04-28",
        project: "ADC Process Development Program"
      },
      {
        citationId: "ADC-CE-103",
        sourceType: "Customer Email",
        title: "客户对批间波动的关注邮件",
        snippet: "客户询问最近两批偶联效率波动是否与设备清洁验证或转运时差有关。",
        relevanceScore: 0.87,
        date: "2026-04-30",
        project: "ADC Process Development Program"
      },
      {
        citationId: "ADC-COA-106",
        sourceType: "CoA",
        title: "中间体放行结果摘要",
        snippet: "关键杂质未超限，但偶联效率呈批间轻微下滑，趋势与设备维护窗口重叠。",
        relevanceScore: 0.82,
        date: "2026-05-01",
        project: "ADC Process Development Program"
      },
      {
        citationId: "ADC-SR-109",
        sourceType: "Study Report",
        title: "工艺开发偏差分析备忘",
        snippet: "设备冲洗液采样点位不足，导致对残留来源定位仍存在证据缺口。",
        relevanceScore: 0.79,
        date: "2026-05-03",
        project: "ADC Process Development Program"
      }
    ],
    agentResponse: responseTemplates.adc,
    reviewItems: [
      {
        id: "ADC-R1",
        claim: "设备 C-204 残留比对需要扩展采样点位。",
        citationId: "ADC-SR-109",
        reviewerRole: "QA人员",
        status: "Need More Evidence",
        reviewerComments: "先补原始冲洗液采样位置图。",
        allowedForClientCommunication: false
      },
      {
        id: "ADC-R2",
        claim: "客户沟通须先经 PM/Medical Affairs 联合审核。",
        citationId: "ADC-CE-103",
        reviewerRole: "Medical Affairs",
        status: "Pending Review",
        reviewerComments: "沟通口径暂不对外。",
        allowedForClientCommunication: false
      }
    ],
    knowledgeRetention: {
      deviationVersions: ["ADC-Residue-14", "Transfer-Gap-06", "Client-Comms-02"],
      proposedSolution: "扩展残留采样 + 限制对外表述为阶段性更新",
      margin: "避免在证据不足阶段过度承诺",
      turnaroundDays: 10,
      outcome: "需要补充残留来源证据后再升级结论",
      successFactors: ["采样点位覆盖关键死角", "客户沟通经联合审核", "批间趋势持续监控"],
      failureFactors: ["提前对外下结论", "忽略维护窗口", "未补设备原始记录"],
      nextWatchouts: ["冲洗液趋势", "设备维护与批次重叠", "客户升级问询节奏"]
    },
    auditLogs: [
      buildLog(
        "ADC-L1",
        "System",
        "project context changed",
        "ADC Process Development Program",
        "初始化项目上下文：ADC Process Development Program",
        5
      ),
      buildLog(
        "ADC-L2",
        "Agent",
        "agent response generated",
        "ADC Process Development Program",
        "默认标记为证据不足并要求人工审核",
        7
      )
    ]
  },
  {
    id: "cmc",
    name: "CMC Analytical Method Transfer",
    shortName: "CMC Transfer",
    overview: "用于方法转移偏差的证据整合、审核排队和知识沉淀追踪。",
    stage: "复测准备",
    owner: "QA 主导",
    suggestedQuestions: [
      "这次方法转移异常最可能的偏差触发点是什么？",
      "在不做最终监管结论的前提下，下一步最优先的修正动作是什么？"
    ],
    evidence: [
      {
        citationId: "CMC-MT-201",
        sourceType: "Method Transfer Report",
        title: "分析方法转移失败批次复核",
        snippet: "受体实验室在系统适用性测试中两次出现峰形异常，集中于夜班准备样。",
        relevanceScore: 0.95,
        date: "2026-05-22",
        project: "CMC Analytical Method Transfer"
      },
      {
        citationId: "CMC-XL-207",
        sourceType: "Excel",
        title: "系统适用性原始导出",
        snippet: "峰尾因子偏移与流动相更换批次一致，但未完成全量复测。",
        relevanceScore: 0.9,
        date: "2026-05-23",
        project: "CMC Analytical Method Transfer"
      },
      {
        citationId: "CMC-QA-212",
        sourceType: "QA Note",
        title: "转移偏差调查记录",
        snippet: "夜班样品制备 SOP 有补充说明，但培训完成记录晚于异常发生日期。",
        relevanceScore: 0.86,
        date: "2026-05-24",
        project: "CMC Analytical Method Transfer"
      },
      {
        citationId: "CMC-CE-214",
        sourceType: "Customer Email",
        title: "客户追问初步根因假设",
        snippet: "客户希望了解是否需重新执行方法学桥接试验，并要求一份书面说明草稿。",
        relevanceScore: 0.8,
        date: "2026-05-24",
        project: "CMC Analytical Method Transfer"
      }
    ],
    agentResponse: responseTemplates.cmc,
    reviewItems: [
      {
        id: "CMC-R1",
        claim: "需补做流动相批次平行复测以支持转移结论。",
        citationId: "CMC-XL-207",
        reviewerRole: "QA人员",
        status: "Approved",
        reviewerComments: "复测方案可执行。",
        allowedForClientCommunication: true
      },
      {
        id: "CMC-R2",
        claim: "夜班样品制备培训记录需要补充偏差追溯说明。",
        citationId: "CMC-QA-212",
        reviewerRole: "BD",
        status: "Pending Review",
        reviewerComments: "待确认客户是否需要单独说明。",
        allowedForClientCommunication: false
      }
    ],
    knowledgeRetention: {
      deviationVersions: ["MT-Bridge-08", "Night-Prep-03", "MobilePhase-11"],
      proposedSolution: "平行复测 + 培训追溯 + 书面说明先走审核",
      margin: "缩短方法转移恢复周期并提升审计解释力",
      turnaroundDays: 6,
      outcome: "待复测结果回填后更新方法转移报告",
      successFactors: ["复测窗口及时", "培训追溯完整", "客户说明口径一致"],
      failureFactors: ["忽略流动相批次影响", "缺少培训时间线", "复测延后"],
      nextWatchouts: ["系统适用性趋势", "夜班样品制备偏差", "方法桥接需求变化"]
    },
    auditLogs: [
      buildLog(
        "CMC-L1",
        "System",
        "project context changed",
        "CMC Analytical Method Transfer",
        "初始化项目上下文：CMC Analytical Method Transfer",
        10
      ),
      buildLog(
        "CMC-L2",
        "Agent",
        "agent response generated",
        "CMC Analytical Method Transfer",
        "默认加载方法转移 mock 调查建议",
        12
      )
    ]
  }
];

const reviewStatusOptions = [
  "Pending Review",
  "Approved",
  "Rejected",
  "Need More Evidence"
];

const state = {
  projects: Object.fromEntries(
    baseProjects.map((project) => [project.id, structuredCloneFallback(project)])
  ),
  activeProjectId: "oncology",
  queryDraft: "",
  isRetrieving: false,
  activeFilter: "All",
  requestTimer: null
};

const getProject = (projectId = state.activeProjectId) => state.projects[projectId];

const appendAuditLog = (projectId, log) => {
  const project = getProject(projectId);
  project.auditLogs.push({
    id: `${projectId}-${project.auditLogs.length + 1}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...log
  });
};

const renderCitationList = (items) =>
  items
    .map(
      (item) => `
        <li>
          <span>${item.text}</span>
          <code>${item.citationId}</code>
        </li>
      `
    )
    .join("");

const render = () => {
  const project = getProject();
  const evidence =
    state.activeFilter === "All"
      ? project.evidence
      : project.evidence.filter((item) => item.sourceType === state.activeFilter);

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="app-shell">
      <header class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">Internal demo only · Mock data · Not final decision system</p>
          <h1>Deviation Collaboration Agent</h1>
          <p class="hero-text">
            面向 PM、BD、QA 与 Medical Affairs 的单页调查协同 Demo。仅使用 mock data，不接真实后端、真实 API、真实客户数据或真实鉴权。
          </p>
        </div>
        <div class="hero-metrics">
          <div class="metric-card">
            <span>Active Project</span>
            <strong>${project.shortName}</strong>
          </div>
          <div class="metric-card">
            <span>Evidence Count</span>
            <strong>${project.evidence.length}</strong>
          </div>
          <div class="metric-card">
            <span>Review Queue</span>
            <strong>${project.reviewItems.length}</strong>
          </div>
        </div>
      </header>

      <main class="content-grid">
        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Project Context</p>
              <h2>业务上下文与建议问题</h2>
            </div>
            <span class="status-pill">${project.stage}</span>
          </div>
          <div class="project-grid">
            ${Object.values(state.projects)
              .map(
                (item) => `
                  <button class="project-card ${item.id === project.id ? "active" : ""}" data-project="${item.id}" type="button">
                    <div class="project-card-top">
                      <strong>${item.shortName}</strong>
                      <span>${item.owner}</span>
                    </div>
                    <h3>${item.name}</h3>
                    <p>${item.overview}</p>
                  </button>
                `
              )
              .join("")}
          </div>

          <div class="context-block">
            <label class="field-label" for="query-draft">当前问题输入</label>
            <textarea id="query-draft" class="query-box" readonly placeholder="点击下方建议问题后，将自动填入并触发检索。">${state.queryDraft}</textarea>
            ${state.isRetrieving ? '<div class="retrieving-banner">Retrieving evidence...</div>' : ""}
          </div>

          <div class="question-list">
            ${project.suggestedQuestions
              .map(
                (question) => `
                  <button class="question-chip" data-question="${question}" type="button">${question}</button>
                `
              )
              .join("")}
          </div>
        </section>

        <div class="two-column-grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Agent Response</p>
                <h2>结构化调查建议</h2>
              </div>
              <div class="header-badges">
                <span class="badge">${project.agentResponse.confidenceLevel} Confidence</span>
                <span class="badge ${project.agentResponse.humanReviewRequired ? "" : "success"}">${project.agentResponse.humanReviewRequired ? "需人工审核" : "可继续内部流转"}</span>
              </div>
            </div>
            ${project.agentResponse.insufficientEvidence ? '<div class="warning-banner">Insufficient evidence. 当前结论仅可作为内部 mock 调查提示。</div>' : ""}
            <div class="agent-grid">
              <div class="stack-card">
                <h3>调查摘要</h3>
                <ul class="citation-list">${renderCitationList(project.agentResponse.answerSummary)}</ul>
              </div>
              <div class="stack-card">
                <h3>主要风险</h3>
                <ul class="citation-list">${renderCitationList(project.agentResponse.risks)}</ul>
              </div>
              <div class="stack-card">
                <h3>建议动作</h3>
                <ul class="citation-list">${renderCitationList(project.agentResponse.actionItems)}</ul>
              </div>
              <div class="stack-card">
                <h3>对外沟通草稿</h3>
                <p>${project.agentResponse.suggestedResponseToClient}</p>
                <div class="supporting-citations">
                  ${project.agentResponse.evidenceCitations
                    .map((citation) => `<span class="badge light">${citation}</span>`)
                    .join("")}
                </div>
              </div>
              <div class="stack-card guardrail-card">
                <h3>Guardrails</h3>
                <ul class="guardrail-list">
                  ${project.agentResponse.guardrailNotes.map((note) => `<li>${note}</li>`).join("")}
                </ul>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Evidence Sources</p>
                <h2>证据来源</h2>
              </div>
              <div class="filter-row">
                ${evidenceFilters
                  .map(
                    (filter) => `
                      <button class="filter-chip ${state.activeFilter === filter ? "active" : ""}" data-filter="${filter}" type="button">${filter}</button>
                    `
                  )
                  .join("")}
              </div>
            </div>
            <div class="evidence-list">
              ${evidence
                .map(
                  (item) => `
                    <article class="evidence-card">
                      <div class="evidence-meta">
                        <span class="badge">${item.sourceType}</span>
                        <span class="badge light">${item.citationId}</span>
                      </div>
                      <h3>${item.title}</h3>
                      <p>${item.snippet}</p>
                      <div class="evidence-footer">
                        <span>相关度 ${Math.round(item.relevanceScore * 100)}%</span>
                        <span>${item.date}</span>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        </div>

        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Review + Retention + Audit</p>
              <h2>人工审核、知识沉淀与审计日志</h2>
            </div>
            <span class="badge light">Audit logs are shown for traceability.</span>
          </div>
          <div class="review-layout">
            <div class="review-card">
              <h3>人工审核队列</h3>
              <div class="review-list">
                ${project.reviewItems
                  .map(
                    (item) => `
                      <article class="review-item">
                        <div class="review-item-top">
                          <div>
                            <strong>${item.reviewerRole}</strong>
                            <p>${item.claim}</p>
                          </div>
                          <code>${item.citationId}</code>
                        </div>
                        <label class="field-label" for="status-${item.id}">审核状态</label>
                        <select class="input" id="status-${item.id}" data-status-id="${item.id}">
                          ${reviewStatusOptions
                            .map(
                              (status) =>
                                `<option value="${status}" ${status === item.status ? "selected" : ""}>${status}</option>`
                            )
                            .join("")}
                        </select>
                        <label class="field-label" for="comment-${item.id}">审核备注</label>
                        <textarea class="input textarea" id="comment-${item.id}" data-comment-id="${item.id}">${item.reviewerComments}</textarea>
                        <label class="checkbox-row" for="flag-${item.id}">
                          <input id="flag-${item.id}" data-flag-id="${item.id}" type="checkbox" ${item.allowedForClientCommunication ? "checked" : ""} />
                          <span>允许用于客户沟通</span>
                        </label>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>

            <div class="retention-card">
              <h3>知识沉淀卡</h3>
              <div class="retention-grid">
                <div><span class="mini-label">Deviation Versions</span><p>${project.knowledgeRetention.deviationVersions.join(" / ")}</p></div>
                <div><span class="mini-label">Proposed Solution</span><p>${project.knowledgeRetention.proposedSolution}</p></div>
                <div><span class="mini-label">Margin</span><p>${project.knowledgeRetention.margin}</p></div>
                <div><span class="mini-label">Turnaround</span><p>${project.knowledgeRetention.turnaroundDays} 天</p></div>
                <div><span class="mini-label">Outcome</span><p>${project.knowledgeRetention.outcome}</p></div>
                <div><span class="mini-label">Success Factors</span><p>${project.knowledgeRetention.successFactors.join(" · ")}</p></div>
                <div><span class="mini-label">Failure Factors</span><p>${project.knowledgeRetention.failureFactors.join(" · ")}</p></div>
                <div><span class="mini-label">Next Watchouts</span><p>${project.knowledgeRetention.nextWatchouts.join(" · ")}</p></div>
              </div>
            </div>

            <div class="audit-card">
              <h3>审计日志</h3>
              <div class="audit-list">
                ${project.auditLogs
                  .slice()
                  .reverse()
                  .map(
                    (log) => `
                      <article class="audit-item">
                        <div class="audit-item-top">
                          <strong>${log.action}</strong>
                          <span>${new Date(log.timestamp).toLocaleString("zh-CN", { hour12: false })}</span>
                        </div>
                        <p>${log.details}</p>
                        <div class="audit-footer">
                          <span>${log.actor}</span>
                          <span>${log.project}</span>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="footer-note">
        <span>No patient data, no subject data, no real customer confidential data.</span>
        <span>Audit logs are shown for traceability.</span>
      </footer>
    </div>
  `;

  bindEvents();
};

const bindEvents = () => {
  document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeProjectId = button.getAttribute("data-project");
      state.activeFilter = "All";
      state.queryDraft = "";
      state.isRetrieving = false;
      if (state.requestTimer) {
        window.clearTimeout(state.requestTimer);
        state.requestTimer = null;
      }
      appendAuditLog(state.activeProjectId, {
        actor: "User",
        action: "project context changed",
        project: getProject().name,
        details: `切换到项目上下文：${getProject().name}`
      });
      render();
    });
  });

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.getAttribute("data-question");
      const projectId = state.activeProjectId;
      state.queryDraft = question;
      state.isRetrieving = true;

      appendAuditLog(projectId, {
        actor: "User",
        action: "suggested question submitted",
        project: getProject(projectId).name,
        details: `提交建议问题：${question}`
      });

      if (state.requestTimer) {
        window.clearTimeout(state.requestTimer);
      }

      const delay = 500 + Math.floor(Math.random() * 301);
      state.requestTimer = window.setTimeout(() => {
        state.isRetrieving = false;
        appendAuditLog(projectId, {
          actor: "Retriever",
          action: "evidence retrieved",
          project: getProject(projectId).name,
          details: `已回填 ${getProject(projectId).evidence.length} 条 mock evidence`
        });
        getProject(projectId).agentResponse = structuredCloneFallback(responseTemplates[projectId]);
        appendAuditLog(projectId, {
          actor: "Agent",
          action: "agent response generated",
          project: getProject(projectId).name,
          details: "已基于当前 mock evidence 生成结构化建议与对外沟通草稿"
        });
        render();
      }, delay);

      render();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.getAttribute("data-filter");
      render();
    });
  });

  document.querySelectorAll("[data-status-id]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const itemId = select.getAttribute("data-status-id");
      const item = getProject().reviewItems.find((entry) => entry.id === itemId);
      item.status = event.target.value;
      appendAuditLog(state.activeProjectId, {
        actor: "Reviewer",
        action: "review status changed",
        project: getProject().name,
        details: `${item.claim} 的审核状态更新为 ${item.status}`
      });
      render();
    });
  });

  document.querySelectorAll("[data-comment-id]").forEach((textarea) => {
    textarea.addEventListener("change", (event) => {
      const itemId = textarea.getAttribute("data-comment-id");
      const item = getProject().reviewItems.find((entry) => entry.id === itemId);
      item.reviewerComments = event.target.value;
      appendAuditLog(state.activeProjectId, {
        actor: "Reviewer",
        action: "reviewer comment updated",
        project: getProject().name,
        details: `更新备注：${item.claim} -> ${item.reviewerComments || "空备注"}`
      });
      render();
    });
  });

  document.querySelectorAll("[data-flag-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const itemId = checkbox.getAttribute("data-flag-id");
      const item = getProject().reviewItems.find((entry) => entry.id === itemId);
      item.allowedForClientCommunication = event.target.checked;
      appendAuditLog(state.activeProjectId, {
        actor: "Reviewer",
        action: "client communication flag changed",
        project: getProject().name,
        details: `${item.claim} 的客户沟通标记更新为 ${item.allowedForClientCommunication ? "允许" : "不允许"}`
      });
      render();
    });
  });
};

render();
