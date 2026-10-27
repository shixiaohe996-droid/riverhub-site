/**
 * 史晓河 个人官网 - main.js
 * 负责 Terminal 命令行模拟器交互、架构拓扑节点切换、项目筛选及全端 Mobile Drawer 响应式引擎
 */

// 1. Terminal 命令行交互引擎
const commandLogs = {
  payhub: [
    { type: 'cmd', text: 'shixiaohe@arch-consultant:~$ run pay-hub --jdk=21 --arch=double-entry-accounting' },
    { type: 'res', text: '[PLATFORM] 加载信付通 (pay-hub) 聚合支付微服务核心架构...' },
    { type: 'res-highlight', text: '[ACCOUNTING ENGINE] 复式记账子账系统校验完成: 借贷平衡 (Assets = Liabilities + Equity)' },
    { type: 'res', text: '[MONOREPO] 加载 Web Ops/Merchant/Agent 三端与 uni-app 小程序/APP 矩阵...' },
    { type: 'success', text: '[STATUS] Java 21 微服务与信付通底座运行稳健，支持千万级交易平滑扩容.' }
  ],
  payment: [
    { type: 'cmd', text: 'shixiaohe@arch-consultant:~$ run payment-engine --tps=1000000 --mq=rabbit' },
    { type: 'res', text: '[MQ ENGINE] 初始化 RabbitMQ 双通道广播队列...' },
    { type: 'res', text: '[RECON] 开启多级代理商分润计算与自动扣还机制...' },
    { type: 'success', text: '[SUCCESS] 实时交易处理完成: 1,248,930 笔 | 资损风险: 0 | 延时: < 0.4ms' }
  ],
  iot: [
    { type: 'cmd', text: 'shixiaohe@arch-consultant:~$ run iot-scale --protocol=bluetooth --vendor=hikvision' },
    { type: 'res', text: '[SERIAL PORT] 建立 RS232 / 蓝牙 BLE 智能秤数据链路...' },
    { type: 'res-highlight', text: 'HEX DATA: 0x55 0xAA 0x01 0x24 0x89 (重量: 12.50kg, 校验码: PASS)' },
    { type: 'success', text: '[CLOUD SYNC] 称重台账数据毫秒级上传至食安监管平台数据库.' }
  ],
  vibe: [
    { type: 'cmd', text: 'shixiaohe@arch-consultant:~$ run vibe-coding --agent=claude-code --sdd=true' },
    { type: 'res', text: '[AI SDD] 读取规格说明书 Specification.md...' },
    { type: 'res', text: '[TDD] 自动生成 42 组单元测试与架构存根...' },
    { type: 'success', text: '[CODEGEN] 核心逻辑极速构建完毕，测试覆盖率: 98.6% (人机协同效能 x3)' }
  ],
  packages: [
    { type: 'cmd', text: 'shixiaohe@arch-consultant:~$ cat packages.json' },
    { type: 'res-highlight', text: '{\n  "architect": "史晓河 (Shi Xiaohe)",\n  "company": "河南信言科技电子技术有限公司 (2026.06 - 至今)",\n  "current_title": "技术架构师 (Technical Architect)",\n  "core_product": "「信付通」整体架构设计与开发",\n  "phone": "18618387956",\n  "location": "三门峡 / 郑州 / 西安 / 全国远程",\n  "engagement_packages": [\n    "套餐 A: 架构顾问与高并发治理 (Advisory)",\n    "套餐 B: 0 到 1 全栈系统包干交付 (Turnkey Build - Recommended)",\n    "套餐 C: 售前标书与投标拿单支撑 (Pre-sales Support)",\n    "套餐 D: 企业级 AI 编程 (Vibe Coding) 落地指导"\n  ]\n}' }
  ]
};

function runCommand(cmdType) {
  const logsContainer = document.getElementById('terminal-logs-list');
  const terminalBody = document.getElementById('terminal-output');

  if (cmdType === 'clear') {
    if (logsContainer) {
      logsContainer.innerHTML = `
        <div class="log-line">
          <span class="log-prompt">shixiaohe@arch-consultant:~$</span> <span class="log-cmd">clear</span>
        </div>
        <div class="log-line log-res">[TERMINAL CLEARED] 输入或点击上方指令运行模拟器.</div>
      `;
    }
    return;
  }

  const logs = commandLogs[cmdType];
  if (!logs || !logsContainer) return;

  logs.forEach((item, index) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = 'log-line';

      if (item.type === 'cmd') {
        line.innerHTML = `<span class="log-prompt">shixiaohe@arch-consultant:~$</span> <span class="log-cmd">${item.text.replace('shixiaohe@arch-consultant:~$ ', '')}</span>`;
      } else if (item.type === 'res-highlight') {
        line.className += ' log-res-highlight';
        line.textContent = item.text;
      } else if (item.type === 'success') {
        line.className += ' log-success';
        line.textContent = item.text;
      } else {
        line.className += ' log-res';
        line.textContent = item.text;
      }

      logsContainer.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }, index * 220);
  });
}

// 2. 拓扑图节点数据与切换引擎
const topoData = {
  'payment-recon': {
    title: '金融级分润与对账引擎架构',
    tag: 'HIGH CONCURRENCY',
    metrics: [
      { val: '1,000,000+', lbl: '日均交易 TPS' },
      { val: '99.999%', lbl: '系统高可用率' },
      { val: '0 事故', lbl: '线上中等以上事故' }
    ],
    code: `// [核心设计模式]: RabbitMQ 实时推送 + XXL-Job 定时双补偿机制
@Service
public class ReconciliationEngine {
    @RabbitListener(queues = "payment.settlement.queue")
    public void processTrade(TradeMessage trade) {
        // 1. 幂等性校验 (Redis 分布式状态锁)
        // 2. 代理商分润多级阶梯算法实时计算
        // 3. 自动入账与对账明细生成，保障零资损
    }
}`
  },
  'iot-hub': {
    title: '智慧社区 / 食安 IoT 云端接入控制塔',
    tag: 'IOT PROTOCOL & OPENAPI',
    metrics: [
      { val: '< 50ms', lbl: '蓝牙/串口响应延迟' },
      { val: '4 Major', lbl: '海康/大华/道尔/新开普' },
      { val: '100%', lbl: '离线缓存恢复率' }
    ],
    code: `// [核心设计模式]: 蓝牙/串口 Hex 协议解析与离线缓存恢复
public class ScaleProtocolParser {
    public WeighData parseHexBuffer(byte[] buffer) {
        // 1. 解析 CRC16 校验码校验数据合法性
        // 2. 抽取毫秒级净重、皮重与状态标志位
        // 3. 触发云端 API 同步及本地 SQLite 离线归档
    }
}`
  },
  'vibe-workflow': {
    title: 'AI Vibe Coding & SDD 规格驱动流程',
    tag: 'AI NATIVE ENGINEERING',
    metrics: [
      { val: '300%', lbl: '人机协同交付效能' },
      { val: '98%+', lbl: '单元测试覆盖率' },
      { val: 'Claude Code', lbl: '工程化实践落地' }
    ],
    code: `// [核心设计模式]: SDD (Specification Driven Development) + TDD 
// 1. 定义清晰的 Markdown 规约与接口契约
// 2. 借助 Claude Code 自动推导边缘条件测试用例
// 3. 架构师审视核心范式与高并发安全性，快速闭环`
  },
  'bidding-proposals': {
    title: '商业售前标书与架构方案',
    tag: 'PRE-SALES & BIDDING',
    metrics: [
      { val: 'High-Win', lbl: '商务拿单中标率' },
      { val: '100%', lbl: '大型政企标书独立撰写' },
      { val: '端到端', lbl: '售前答辩与技术交付' }
    ],
    code: `/* [售前支撑范式]: 架构设计图 + 实施排期 + 风险规避预案
1. 协助商务团队梳理客户核心痛点与招投标技术指标
2. 绘制高清系统拓扑图与微服务部署拓扑图
3. 撰写专业标书，在技术评分环节建立显著优势 */`
  }
};

function selectTopoNode(nodeId) {
  const nodes = document.querySelectorAll('.topo-node');
  nodes.forEach(n => n.classList.remove('active'));

  const activeNode = document.querySelector(`.topo-node[data-node="${nodeId}"]`);
  if (activeNode) activeNode.classList.add('active');

  const data = topoData[nodeId];
  if (!data) return;

  const titleEl = document.getElementById('topo-title');
  const tagEl = document.getElementById('topo-tag');
  const metricsEl = document.getElementById('topo-metrics');
  const codeEl = document.getElementById('topo-code');

  if (titleEl) titleEl.textContent = data.title;
  if (tagEl) tagEl.textContent = data.tag;
  if (codeEl) codeEl.textContent = data.code;

  if (metricsEl) {
    metricsEl.innerHTML = data.metrics.map(m => `
      <div class="topo-metric-item">
        <span class="val">${m.val}</span>
        <span class="lbl">${m.lbl}</span>
      </div>
    `).join('');
  }
}

// 3. DOMContentLoaded 事件初始化
document.addEventListener('DOMContentLoaded', () => {
  // 移动端汉堡包菜单 Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      const isOpen = navMenu.classList.contains('mobile-open');
      mobileToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
  }

  // 项目 Tab 筛选
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 联系方式复制
  const copyBtns = document.querySelectorAll('.btn-copy-contact');
  const toast = document.getElementById('toast');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute('data-copy') || '18618387956';

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`[COPIED] 已成功复制史晓河联系电话: ${textToCopy}`);
      }).catch(() => {
        showToast(`[CONTACT] 史晓河电话: ${textToCopy}`);
      });
    });
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // 滚动导航高亮与移动端自动收起
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('mobile-open')) {
        navMenu.classList.remove('mobile-open');
        if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  });

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});
