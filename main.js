/**
 * 史晓河 个人官网 - main.js
 * Terminal 命令行模拟器、架构拓扑节点切换、项目筛选、主题切换与移动端导航
 * 纯原生 JS，无依赖，无构建步骤。
 */
(function () {
  'use strict';

  var PROMPT = 'shixiaohe@riverhub:~$';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
   * 1. Terminal 命令行交互引擎
   * ------------------------------------------------------------------ */
  var commandLogs = {
    payhub: [
      { type: 'cmd', text: 'run pay-hub --jdk=21 --arch=double-entry-accounting' },
      { type: 'res', text: '[PLATFORM] 加载信付通 (pay-hub) 聚合支付微服务核心架构...' },
      { type: 'res-highlight', text: '[ACCOUNTING ENGINE] 复式记账子账系统校验完成: 借贷平衡 (Assets = Liabilities + Equity)' },
      { type: 'res', text: '[MONOREPO] 加载 Web Ops/Merchant/Agent 三端与 uni-app 小程序/APP 矩阵...' },
      { type: 'success', text: '[STATUS] Java 21 微服务与信付通底座运行稳健，支持百万级日均交易平滑扩容.' }
    ],
    payment: [
      { type: 'cmd', text: 'run payment-engine --scale=million-daily --mq=rabbit' },
      { type: 'res', text: '[MQ ENGINE] 初始化 RabbitMQ 双通道广播队列...' },
      { type: 'res', text: '[RECON] 开启多级代理商分润计算与自动扣还机制...' },
      { type: 'success', text: '[SUCCESS] 实时交易处理完成: 1,248,930 笔 | 资损风险: 0 | 延时: < 0.4ms' }
    ],
    iot: [
      { type: 'cmd', text: 'run iot-scale --protocol=bluetooth --vendor=hikvision' },
      { type: 'res', text: '[SERIAL PORT] 建立 RS232 / 蓝牙 BLE 智能秤数据链路...' },
      { type: 'res-highlight', text: 'HEX DATA: 0x55 0xAA 0x01 0x24 0x89 (重量: 12.50kg, 校验码: PASS)' },
      { type: 'success', text: '[CLOUD SYNC] 称重台账数据毫秒级上传至食安监管平台数据库.' }
    ],
    vibe: [
      { type: 'cmd', text: 'run vibe-coding --agent=claude-code --sdd=true' },
      { type: 'res', text: '[AI SDD] 读取规格说明书 Specification.md...' },
      { type: 'res', text: '[TDD] 自动生成 42 组单元测试与架构存根...' },
      { type: 'success', text: '[CODEGEN] 核心逻辑极速构建完毕，测试覆盖率: 98%+ (人机协同交付效能 3 倍)' }
    ],
    packages: [
      { type: 'cmd', text: 'cat profile.json' },
      { type: 'res-highlight', text: '{\n  "architect": "史晓河 (Shi Xiaohe)",\n  "company": "河南信言电子科技有限公司 (2026.06 - 至今)",\n  "current_title": "技术架构师 (Technical Architect)",\n  "core_product": "「信付通」整体架构设计与开发",\n  "phone": "18618387956",\n  "email": "shixiaohe996@gmail.com",\n  "telegram": "@river_data",\n  "wechat": "18618387956",\n  "location": "三门峡 / 郑州 / 西安 / 全国远程",\n  "open_to": [\n    "远程全职 / 兼职技术岗位 (架构 / 技术负责人 / Java·全栈)",\n    "项目外包与交付",\n    "技术顾问 / 代码审查",\n    "方案与标书支持"\n  ]\n}' }
    ],
    contact: [
      { type: 'cmd', text: 'contact' },
      { type: 'res', text: '[CONTACT] 远程工作 / 项目合作: 18618387956' },
      { type: 'res', text: '[EMAIL] shixiaohe996@gmail.com  |  [TELEGRAM] @river_data (https://t.me/river_data)' },
      { type: 'res', text: '[WECHAT] 18618387956 (同手机号)' },
      { type: 'res', text: '[LOC] 三门峡 / 郑州 / 西安 / 全国远程' },
      { type: 'success', text: '[TIP] 页面底部可直接拨打电话、复制微信号、发邮件或打开 Telegram.' }
    ],
    help: [
      { type: 'cmd', text: 'help' },
      { type: 'res', text: '可用指令 (Available commands):' },
      { type: 'dim', text: '  run pay-hub         信付通 (pay-hub) 聚合支付底座\n  run payment-engine  金融级分润与对账引擎\n  run iot-scale       智慧食安 IoT 智能秤协议解析\n  run vibe-coding     AI Vibe Coding & SDD 敏捷交付\n  cat profile.json    个人信息与合作方式\n  contact             电话 / 微信 / 邮箱 / Telegram\n  clear               清空终端\n  ↑ / ↓               浏览历史指令' }
    ]
  };

  // 输入文本 → 指令 key 的映射（兼容多种写法）
  var aliases = {
    'run pay-hub': 'payhub', 'pay-hub': 'payhub', 'payhub': 'payhub',
    'run payment-engine': 'payment', 'payment-engine': 'payment', 'payment': 'payment',
    'run iot-scale': 'iot', 'iot-scale': 'iot', 'iot': 'iot',
    'run vibe-coding': 'vibe', 'vibe-coding': 'vibe', 'vibe': 'vibe',
    'cat profile.json': 'packages', 'profile.json': 'packages', 'profile': 'packages', 'cat packages.json': 'packages', 'packages.json': 'packages', 'packages': 'packages', 'ls': 'help',
    'contact': 'contact', 'phone': 'contact', 'help': 'help', '?': 'help', 'clear': 'clear', 'cls': 'clear'
  };

  var logsEl, bodyEl, inputEl;
  var queue = Promise.resolve();
  var history = [];
  var historyIdx = -1;

  function scrollToEnd() {
    if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, reduceMotion ? 0 : ms); });
  }

  function makeLine(className) {
    var line = document.createElement('div');
    line.className = 'log-line' + (className ? ' ' + className : '');
    return line;
  }

  function appendCommandLine(text, gap) {
    var line = makeLine(gap ? 'log-gap' : '');
    var p = document.createElement('span');
    p.className = 'log-prompt';
    p.textContent = PROMPT;
    var c = document.createElement('span');
    c.className = 'log-cmd';
    line.appendChild(p);
    line.appendChild(document.createTextNode(' '));
    line.appendChild(c);
    logsEl.appendChild(line);
    return { line: line, cmdEl: c, text: text };
  }

  function typeInto(el, text) {
    if (reduceMotion) { el.textContent = text; return Promise.resolve(); }
    var caret = document.createElement('span');
    caret.className = 'log-caret';
    el.parentNode.appendChild(caret);
    var i = 0;
    return new Promise(function (resolve) {
      (function step() {
        i += Math.max(1, Math.round(text.length / 28));
        el.textContent = text.slice(0, i);
        scrollToEnd();
        if (i < text.length) { setTimeout(step, 18); }
        else { caret.remove(); resolve(); }
      })();
    });
  }

  var typeClass = { 'res': 'log-res', 'res-highlight': 'log-res-highlight', 'success': 'log-success', 'dim': 'log-dim', 'error': 'log-error' };

  function playLogs(logs, opts) {
    opts = opts || {};
    return logs.reduce(function (p, item, index) {
      return p.then(function () {
        if (item.type === 'cmd') {
          if (opts.typed) {
            // 用户已在输入框中输入，直接回显
            var echoed = appendCommandLine(item.text, true);
            echoed.cmdEl.textContent = opts.typed;
            scrollToEnd();
            return wait(120);
          }
          var c = appendCommandLine(item.text, true);
          return typeInto(c.cmdEl, item.text).then(function () { return wait(160); });
        }
        var line = makeLine(typeClass[item.type] || 'log-res');
        line.textContent = item.text;
        logsEl.appendChild(line);
        scrollToEnd();
        return wait(index === logs.length - 1 ? 0 : 220);
      });
    }, Promise.resolve());
  }

  function clearTerminal() {
    logsEl.innerHTML = '';
    var c = appendCommandLine('clear');
    c.cmdEl.textContent = 'clear';
    var line = makeLine('log-res');
    line.textContent = '[TERMINAL CLEARED] 输入 help 或点击下方指令运行模拟器.';
    logsEl.appendChild(line);
  }

  function setRunning(key, on) {
    var chip = document.querySelector('.cmd-chip[data-cmd="' + key + '"]');
    if (chip) chip.classList.toggle('is-running', on);
  }

  function runCommand(key, typedText) {
    if (!logsEl) return;
    queue = queue.then(function () {
      if (key === 'clear') { clearTerminal(); return; }
      var logs = commandLogs[key];
      if (!logs) {
        var echo = appendCommandLine(typedText || key, true);
        echo.cmdEl.textContent = typedText || key;
        var err = makeLine('log-error');
        err.textContent = 'zsh: command not found: ' + (typedText || key) + '  —  输入 help 查看可用指令';
        logsEl.appendChild(err);
        scrollToEnd();
        return;
      }
      setRunning(key, true);
      return playLogs(logs, { typed: typedText }).then(function () { setRunning(key, false); });
    });
    return queue;
  }

  // 兼容旧版 inline onclick 调用
  window.runCommand = function (key) { return runCommand(key); };

  function initTerminal() {
    logsEl = document.getElementById('terminal-logs-list');
    bodyEl = document.getElementById('terminal-output');
    inputEl = document.getElementById('terminal-input');
    var form = document.getElementById('terminal-form');
    if (!logsEl || !bodyEl) return;

    document.querySelectorAll('.cmd-chip[data-cmd]').forEach(function (btn) {
      btn.addEventListener('click', function () { runCommand(btn.getAttribute('data-cmd')); });
    });

    // 点击终端空白处聚焦输入框（不在选择文本时）
    bodyEl.addEventListener('click', function () {
      var sel = window.getSelection && window.getSelection();
      if (inputEl && (!sel || sel.isCollapsed)) inputEl.focus({ preventScroll: true });
    });

    if (form && inputEl) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var raw = inputEl.value.trim();
        inputEl.value = '';
        if (!raw) return;
        history.push(raw);
        historyIdx = history.length;
        var key = aliases[raw.toLowerCase().replace(/\s+/g, ' ')];
        runCommand(key || raw, raw);
      });

      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' && history.length) {
          e.preventDefault();
          historyIdx = Math.max(0, historyIdx - 1);
          inputEl.value = history[historyIdx];
        } else if (e.key === 'ArrowDown' && history.length) {
          e.preventDefault();
          historyIdx = Math.min(history.length, historyIdx + 1);
          inputEl.value = history[historyIdx] || '';
        } else if (e.key === 'l' && e.ctrlKey) {
          e.preventDefault();
          runCommand('clear');
        }
      });
    }
  }

  /* ------------------------------------------------------------------
   * 2. 拓扑图节点数据与切换引擎
   * ------------------------------------------------------------------ */
  var topoData = {
    'payment-recon': {
      title: '金融级分润与对账引擎架构',
      tag: 'HIGH CONCURRENCY',
      metrics: [
        { val: '百万级', lbl: '日均交易量' },
        { val: '99.999%', lbl: '系统高可用率' },
        { val: '0 事故', lbl: '线上中等以上事故' }
      ],
      code: '// [核心设计模式]: RabbitMQ 实时推送 + XXL-Job 定时双补偿机制\n@Service\npublic class ReconciliationEngine {\n    @RabbitListener(queues = "payment.settlement.queue")\n    public void processTrade(TradeMessage trade) {\n        // 1. 幂等性校验 (Redis 分布式状态锁)\n        // 2. 代理商分润多级阶梯算法实时计算\n        // 3. 自动入账与对账明细生成，保障零资损\n    }\n}'
    },
    'iot-hub': {
      title: '智慧社区 / 食安 IoT 云端接入控制塔',
      tag: 'IOT PROTOCOL & OPENAPI',
      metrics: [
        { val: '< 50ms', lbl: '蓝牙/串口响应延迟' },
        { val: '4 Major', lbl: '海康/大华/道尔/新开普' },
        { val: '100%', lbl: '离线缓存恢复率' }
      ],
      code: '// [核心设计模式]: 蓝牙/串口 Hex 协议解析与离线缓存恢复\npublic class ScaleProtocolParser {\n    public WeighData parseHexBuffer(byte[] buffer) {\n        // 1. 解析 CRC16 校验码校验数据合法性\n        // 2. 抽取毫秒级净重、皮重与状态标志位\n        // 3. 触发云端 API 同步及本地 SQLite 离线归档\n    }\n}'
    },
    'vibe-workflow': {
      title: 'AI Vibe Coding & SDD 规格驱动流程',
      tag: 'AI NATIVE ENGINEERING',
      metrics: [
        { val: '3 倍', lbl: '人机协同交付效能' },
        { val: '98%+', lbl: '单元测试覆盖率' },
        { val: 'Claude Code', lbl: '工程化实践落地' }
      ],
      code: '// [核心设计模式]: SDD (Specification Driven Development) + TDD\n// 1. 定义清晰的 Markdown 规约与接口契约\n// 2. 借助 Claude Code 自动推导边缘条件测试用例\n// 3. 架构师审视核心范式与高并发安全性，快速闭环'
    },
    'bidding-proposals': {
      title: '商业售前标书与架构方案',
      tag: 'PRE-SALES & BIDDING',
      metrics: [
        { val: 'High-Win', lbl: '商务拿单中标率' },
        { val: '100%', lbl: '大型政企标书独立撰写' },
        { val: '端到端', lbl: '售前答辩与技术交付' }
      ],
      code: '/* [售前支撑范式]: 架构设计图 + 实施排期 + 风险规避预案\n1. 协助商务团队梳理客户核心痛点与招投标技术指标\n2. 绘制高清系统拓扑图与微服务部署拓扑图\n3. 撰写专业标书，在技术评分环节建立显著优势 */'
    }
  };

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 极简 Java 语法高亮（仅用于展示）
  function highlight(code) {
    var inBlock = false;
    return code.split('\n').map(function (line) {
      var esc = escapeHtml(line);
      var trimmed = line.trim();
      if (inBlock || trimmed.indexOf('/*') === 0) {
        inBlock = trimmed.indexOf('*/') === -1;
        return '<span class="tk-c">' + esc + '</span>';
      }
      var ci = esc.indexOf('//');
      var codePart = ci >= 0 ? esc.slice(0, ci) : esc;
      var comment = ci >= 0 ? '<span class="tk-c">' + esc.slice(ci) + '</span>' : '';
      codePart = codePart
        .replace(/("[^"]*")/g, '<span class="tk-s">$1</span>')
        .replace(/(@\w+)/g, '<span class="tk-a">$1</span>')
        .replace(/\b(public|class|void|byte|private|static|return|new)\b/g, '<span class="tk-k">$1</span>');
      return codePart + comment;
    }).join('\n');
  }

  function renderTopo(nodeId) {
    var data = topoData[nodeId];
    if (!data) return;
    var titleEl = document.getElementById('topo-title');
    var tagEl = document.getElementById('topo-tag');
    var metricsEl = document.getElementById('topo-metrics');
    var codeEl = document.getElementById('topo-code');

    if (titleEl) titleEl.textContent = data.title;
    if (tagEl) tagEl.textContent = data.tag;
    if (codeEl) codeEl.innerHTML = '<code>' + highlight(data.code) + '</code>';
    if (metricsEl) {
      metricsEl.innerHTML = data.metrics.map(function (m) {
        return '<div class="topo-metric"><span class="val">' + escapeHtml(m.val) + '</span><span class="lbl">' + escapeHtml(m.lbl) + '</span></div>';
      }).join('');
    }
  }

  function selectTopoNode(nodeId) {
    if (!topoData[nodeId]) return;
    document.querySelectorAll('.topo-node').forEach(function (n) {
      var on = n.getAttribute('data-node') === nodeId;
      n.classList.toggle('active', on);
      n.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var panel = document.getElementById('topo-detail-panel');
    if (!panel || reduceMotion) { renderTopo(nodeId); return; }
    panel.classList.add('is-switching');
    setTimeout(function () {
      renderTopo(nodeId);
      panel.classList.remove('is-switching');
    }, 180);
  }
  window.selectTopoNode = selectTopoNode;

  function initTopology() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.topo-node'));
    nodes.forEach(function (node, i) {
      node.addEventListener('click', function () { selectTopoNode(node.getAttribute('data-node')); });
      node.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = nodes[(i + 1) % nodes.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = nodes[(i - 1 + nodes.length) % nodes.length];
        if (next) { e.preventDefault(); next.focus(); selectTopoNode(next.getAttribute('data-node')); }
      });
    });
    var active = document.querySelector('.topo-node.active');
    if (active) renderTopo(active.getAttribute('data-node'));
  }

  /* ------------------------------------------------------------------
   * 3. 项目筛选
   * ------------------------------------------------------------------ */
  function initFilters() {
    var btns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project[data-category]');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-filter');
        btns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          var show = value === 'all' || card.getAttribute('data-category') === value;
          card.hidden = !show;
          card.classList.remove('is-entering');
          if (show) {
            card.classList.add('is-visible');
            void card.offsetWidth; // restart animation
            card.classList.add('is-entering');
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 4. 联系方式复制 & Toast
   * ------------------------------------------------------------------ */
  var toastTimer;
  function showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) { reject(e); }
    });
  }

  function initCopy() {
    var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    document.querySelectorAll('.btn-copy-contact').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        // 触屏设备上的 tel: 链接直接拨号
        if (isTouch && btn.tagName === 'A' && /^tel:/.test(btn.getAttribute('href') || '')) return;
        e.preventDefault();
        var text = btn.getAttribute('data-copy') || '18618387956';
        copyText(text).then(function () {
          showToast('已复制' + (btn.getAttribute('data-label') || '电话') + ': ' + text);
        }).catch(function () {
          showToast((btn.getAttribute('data-label') || '电话') + ': ' + text);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 5. 主题切换
   * ------------------------------------------------------------------ */
  function currentTheme() {
    var explicit = document.documentElement.getAttribute('data-theme');
    if (explicit) return explicit;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ------------------------------------------------------------------
   * 6. 导航：移动端菜单、滚动高亮、顶栏阴影
   * ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var menu = document.getElementById('nav-menu');
    var header = document.getElementById('site-header');

    function setMenu(open) {
      if (!menu || !toggle) return;
      menu.classList.toggle('mobile-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (toggle && menu) {
      toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('mobile-open')); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
      document.addEventListener('click', function (e) {
        if (menu.classList.contains('mobile-open') && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
      });
    }

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    links.forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });

    var sections = links.map(function (l) {
      var id = (l.getAttribute('href') || '').slice(1);
      return id ? document.getElementById(id) : null;
    }).filter(Boolean);

    var ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      var current = '';
      sections.forEach(function (sec) {
        if (y >= sec.offsetTop - 140) current = sec.id;
      });
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = 'contact';
      links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
   * 7. 滚动入场动画
   * ------------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    // 同一容器内的卡片错峰入场
    els.forEach(function (el) {
      var parent = el.parentElement;
      var siblings = parent ? Array.prototype.filter.call(parent.children, function (c) { return c.classList.contains('reveal'); }) : [];
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx, 6) * 60 + 'ms';
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------ */
  function init() {
    initTheme();
    initNav();
    initTerminal();
    initTopology();
    initFilters();
    initCopy();
    initReveal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
