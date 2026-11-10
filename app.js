"use strict";

const STORAGE = {
  watchlist: "neon.watchlist.v1",
  cache: "neon.market-cache.v1",
  autoRefresh: "neon.last-auto-refresh.v1"
};

const PERIODS = {
  "1d": { range: "1d", interval: "5m", count: 78, label: "今日" },
  "3d": { range: "5d", interval: "15m", count: 90, label: "近 3 日" },
  "1w": { range: "5d", interval: "15m", count: 110, label: "近 1 周" },
  "1m": { range: "1mo", interval: "1d", count: 22, label: "近 1 月" },
  "3m": { range: "3mo", interval: "1d", count: 64, label: "近 3 月" },
  "6m": { range: "6mo", interval: "1d", count: 126, label: "近 6 月" },
  "1y": { range: "1y", interval: "1d", count: 252, label: "近 1 年" }
};

const INDEX_CONFIG = [
  { symbol: "000300.SS", name: "沪深 300", flag: "A", market: "中国", demoPrice: 3942.76, demoChange: 0.68 },
  { symbol: "^HSI", name: "恒生指数", flag: "港", market: "中国", demoPrice: 19745.32, demoChange: -0.41 },
  { symbol: "^GSPC", name: "标普 500", flag: "美", market: "美国", demoPrice: 5987.21, demoChange: 0.53 },
  { symbol: "^NDX", name: "纳斯达克 100", flag: "纳", market: "美国", demoPrice: 21482.60, demoChange: 0.91 }
];

function makeSignal(symbol, name, market, region) {
  return {
    symbol, name, market, region,
    demoPrice: 50 + symbolSeed(symbol) % 450,
    demoChange: ((symbolSeed(symbol) % 520) - 260) / 100
  };
}

const SIGNAL_CONFIG = [
  // 中国内地与香港主要指数
  makeSignal("000001.SS", "上证指数", "中国", "A 股"),
  makeSignal("399001.SZ", "深证成指", "中国", "A 股"),
  makeSignal("399006.SZ", "创业板指", "中国", "A 股"),
  makeSignal("000300.SS", "沪深 300", "中国", "A 股"),
  makeSignal("000905.SS", "中证 500", "中国", "A 股"),
  makeSignal("000852.SS", "中证 1000", "中国", "A 股"),
  makeSignal("000688.SS", "科创 50", "中国", "A 股"),
  makeSignal("899050.BJ", "北证 50", "中国", "A 股"),
  makeSignal("^HSI", "恒生指数", "中国", "港股"),
  makeSignal("^HSTECH", "恒生科技", "中国", "港股"),
  makeSignal("^HSCE", "恒生中国企业", "中国", "港股"),
  // 美国主要指数
  makeSignal("^GSPC", "标普 500", "美国", "美股"),
  makeSignal("^IXIC", "纳斯达克综指", "美国", "美股"),
  makeSignal("^NDX", "纳斯达克 100", "美国", "美股"),
  makeSignal("^DJI", "道琼斯工业", "美国", "美股"),
  makeSignal("^RUT", "罗素 2000", "美国", "美股"),
  makeSignal("^NYA", "纽交所综合", "美国", "美股"),
  makeSignal("^VIX", "标普波动率", "美国", "VIX"),
  // 欧洲主要指数
  makeSignal("^STOXX50E", "欧元区斯托克 50", "全球", "欧洲"),
  makeSignal("^STOXX", "斯托克 600", "全球", "欧洲"),
  makeSignal("^GDAXI", "德国 DAX", "全球", "德国"),
  makeSignal("^FCHI", "法国 CAC 40", "全球", "法国"),
  makeSignal("^FTSE", "英国富时 100", "全球", "英国"),
  makeSignal("^SSMI", "瑞士 SMI", "全球", "瑞士"),
  makeSignal("^IBEX", "西班牙 IBEX", "全球", "西班牙"),
  makeSignal("FTSEMIB.MI", "意大利富时 MIB", "全球", "意大利"),
  makeSignal("^AEX", "荷兰 AEX", "全球", "荷兰"),
  makeSignal("^OMXC20", "瑞典 OMX 20", "全球", "瑞典"),
  // 亚太主要指数
  makeSignal("^N225", "日经 225", "全球", "日本"),
  makeSignal("^TOPX", "东证指数", "全球", "日本"),
  makeSignal("^KS11", "韩国 KOSPI", "全球", "韩国"),
  makeSignal("^KQ11", "韩国 KOSDAQ", "全球", "韩国"),
  makeSignal("^TWII", "台湾加权", "全球", "中国台湾"),
  makeSignal("^STI", "新加坡海峡时报", "全球", "新加坡"),
  makeSignal("^SENSEX", "印度 SENSEX", "全球", "印度"),
  makeSignal("^NSEI", "印度 NIFTY 50", "全球", "印度"),
  makeSignal("^AXJO", "澳洲 ASX 200", "全球", "澳大利亚"),
  makeSignal("^NZ50", "新西兰 NZX 50", "全球", "新西兰"),
  // 美洲其他主要指数
  makeSignal("^GSPTSE", "加拿大 TSX", "全球", "加拿大"),
  makeSignal("^BVSP", "巴西 IBOVESPA", "全球", "巴西"),
  makeSignal("^MXX", "墨西哥 IPC", "全球", "墨西哥"),
  // 中国行业指数与高流动性 ETF 代理
  makeSignal("399808.SZ", "A 股新能源", "行业", "中证新能"),
  makeSignal("399997.SZ", "中证白酒", "行业", "A 股消费"),
  makeSignal("399989.SZ", "中证医疗", "行业", "A 股医疗"),
  makeSignal("399967.SZ", "中证军工", "行业", "A 股军工"),
  makeSignal("399975.SZ", "证券公司", "行业", "A 股券商"),
  makeSignal("399986.SZ", "中证银行", "行业", "A 股银行"),
  makeSignal("399998.SZ", "中证煤炭", "行业", "A 股煤炭"),
  makeSignal("399971.SZ", "中证传媒", "行业", "A 股传媒"),
  makeSignal("512480.SS", "半导体 ETF", "行业", "A 股芯片"),
  makeSignal("515790.SS", "光伏 ETF", "行业", "A 股光伏"),
  makeSignal("515030.SS", "新能源车 ETF", "行业", "A 股汽车"),
  makeSignal("512010.SS", "医药 ETF", "行业", "A 股医药"),
  // 标普 500 十一大行业，使用 SPDR ETF 作为可交易代理
  makeSignal("XLK", "美国科技", "行业", "标普科技"),
  makeSignal("XLF", "美国金融", "行业", "标普金融"),
  makeSignal("XLE", "标普能源", "行业", "标普能源"),
  makeSignal("XLV", "美国医疗保健", "行业", "标普医疗"),
  makeSignal("XLY", "美国可选消费", "行业", "标普消费"),
  makeSignal("XLP", "美国必选消费", "行业", "标普消费"),
  makeSignal("XLI", "美国工业", "行业", "标普工业"),
  makeSignal("XLB", "美国原材料", "行业", "标普材料"),
  makeSignal("XLU", "美国公用事业", "行业", "标普公用"),
  makeSignal("XLRE", "美国房地产", "行业", "标普地产"),
  makeSignal("XLC", "美国通信服务", "行业", "标普通信"),
  // 全球热门行业与主题，使用指数或高流动性 ETF 代理
  makeSignal("^SOX", "费城半导体", "行业", "全球芯片"),
  makeSignal("IGV", "北美软件", "行业", "软件 ETF"),
  makeSignal("HACK", "网络安全", "行业", "安全 ETF"),
  makeSignal("AIQ", "人工智能", "行业", "AI ETF"),
  makeSignal("BOTZ", "机器人自动化", "行业", "机器人 ETF"),
  makeSignal("ICLN", "全球清洁能源", "行业", "清洁能源 ETF"),
  makeSignal("TAN", "太阳能", "行业", "光伏 ETF"),
  makeSignal("XBI", "美国生物科技", "行业", "生物科技 ETF"),
  makeSignal("IBB", "纳斯达克生物", "行业", "生物 ETF"),
  makeSignal("KRE", "美国地区银行", "行业", "银行 ETF"),
  makeSignal("XOP", "油气勘探生产", "行业", "油气 ETF"),
  makeSignal("GDX", "黄金矿业", "行业", "金矿 ETF"),
  makeSignal("ITA", "航空航天国防", "行业", "国防 ETF"),
  makeSignal("IYT", "交通运输", "行业", "运输 ETF"),
  makeSignal("XRT", "美国零售", "行业", "零售 ETF"),
  makeSignal("ITB", "美国住宅建筑", "行业", "建筑 ETF")
];

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "苹果", fullName: "Apple Inc.", exchange: "NASDAQ", demoPrice: 227.48, demoChange: 0.74 },
  { symbol: "NVDA", name: "英伟达", fullName: "NVIDIA Corporation", exchange: "NASDAQ", demoPrice: 139.87, demoChange: 2.18 },
  { symbol: "TSLA", name: "特斯拉", fullName: "Tesla, Inc.", exchange: "NASDAQ", demoPrice: 342.16, demoChange: -1.26 },
  { symbol: "MSFT", name: "微软", fullName: "Microsoft Corporation", exchange: "NASDAQ", demoPrice: 425.33, demoChange: 0.39 },
  { symbol: "PDD", name: "拼多多", fullName: "PDD Holdings Inc.", exchange: "NASDAQ", demoPrice: 108.42, demoChange: 1.12 },
  { symbol: "BABA", name: "阿里巴巴", fullName: "Alibaba Group Holding Limited", exchange: "NYSE", demoPrice: 86.75, demoChange: 0.83 },
  { symbol: "JD", name: "京东", fullName: "JD.com, Inc.", exchange: "NASDAQ", demoPrice: 36.28, demoChange: -0.35 },
  { symbol: "BIDU", name: "百度", fullName: "Baidu, Inc.", exchange: "NASDAQ", demoPrice: 91.16, demoChange: 0.58 },
  { symbol: "NIO", name: "蔚来", fullName: "NIO Inc.", exchange: "NYSE", demoPrice: 4.62, demoChange: -1.08 },
  { symbol: "XPEV", name: "小鹏汽车", fullName: "XPeng Inc.", exchange: "NYSE", demoPrice: 12.48, demoChange: 1.36 },
  { symbol: "LI", name: "理想汽车", fullName: "Li Auto Inc.", exchange: "NASDAQ", demoPrice: 23.72, demoChange: 0.91 },
  { symbol: "AMD", name: "超威半导体", fullName: "Advanced Micro Devices, Inc.", exchange: "NASDAQ", demoPrice: 136.24, demoChange: 1.47 },
  { symbol: "INTC", name: "英特尔", fullName: "Intel Corporation", exchange: "NASDAQ", demoPrice: 23.56, demoChange: -0.62 },
  { symbol: "AVGO", name: "博通", fullName: "Broadcom Inc.", exchange: "NASDAQ", demoPrice: 172.38, demoChange: 1.05 },
  { symbol: "GOOGL", name: "谷歌", fullName: "Alphabet Inc.", exchange: "NASDAQ", demoPrice: 175.62, demoChange: 0.66 },
  { symbol: "AMZN", name: "亚马逊", fullName: "Amazon.com, Inc.", exchange: "NASDAQ", demoPrice: 198.42, demoChange: 0.72 },
  { symbol: "META", name: "Meta", fullName: "Meta Platforms, Inc.", exchange: "NASDAQ", demoPrice: 572.18, demoChange: 0.94 },
  { symbol: "NFLX", name: "奈飞", fullName: "Netflix, Inc.", exchange: "NASDAQ", demoPrice: 762.35, demoChange: -0.28 },
  { symbol: "0700.HK", name: "腾讯控股", fullName: "Tencent Holdings Limited", exchange: "HKEX", demoPrice: 405.60, demoChange: -0.64 },
  { symbol: "9988.HK", name: "阿里巴巴-W", fullName: "Alibaba Group Holding Limited", exchange: "HKEX", demoPrice: 84.35, demoChange: 1.14 },
  { symbol: "3690.HK", name: "美团-W", fullName: "Meituan", exchange: "HKEX", demoPrice: 172.60, demoChange: 0.77 },
  { symbol: "1810.HK", name: "小米集团-W", fullName: "Xiaomi Corporation", exchange: "HKEX", demoPrice: 28.15, demoChange: 1.28 },
  { symbol: "9618.HK", name: "京东集团-SW", fullName: "JD.com, Inc.", exchange: "HKEX", demoPrice: 141.20, demoChange: -0.42 },
  { symbol: "9999.HK", name: "网易-S", fullName: "NetEase, Inc.", exchange: "HKEX", demoPrice: 138.70, demoChange: 0.35 },
  { symbol: "600519.SS", name: "贵州茅台", fullName: "Kweichow Moutai Co., Ltd.", exchange: "SSE", demoPrice: 1528.00, demoChange: 0.46 },
  { symbol: "300750.SZ", name: "宁德时代", fullName: "Contemporary Amperex Technology", exchange: "SZSE", demoPrice: 261.40, demoChange: 1.83 },
  { symbol: "000858.SZ", name: "五粮液", fullName: "Wuliangye Yibin Co., Ltd.", exchange: "SZSE", demoPrice: 142.36, demoChange: 0.52 },
  { symbol: "601318.SS", name: "中国平安", fullName: "Ping An Insurance Group", exchange: "SSE", demoPrice: 55.28, demoChange: -0.18 },
  { symbol: "600036.SS", name: "招商银行", fullName: "China Merchants Bank", exchange: "SSE", demoPrice: 38.64, demoChange: 0.31 },
  { symbol: "002594.SZ", name: "比亚迪", fullName: "BYD Company Limited", exchange: "SZSE", demoPrice: 278.50, demoChange: 1.16 },
  { symbol: "600900.SS", name: "长江电力", fullName: "China Yangtze Power Co., Ltd.", exchange: "SSE", demoPrice: 28.72, demoChange: -0.24 }
];

const DEMO_NEWS = [
  {
    id: "demo-fed", title: "美联储政策日程与最新货币政策声明", source: "Federal Reserve", category: "宏观", importance: 3,
    summary: "示例条目：核对利率声明、缩表路径与主席发布会，关注实际利率和成长股估值变化。",
    url: "https://www.federalreserve.gov/monetarypolicy/fomc.htm", impacts: ["标普 500", "纳斯达克 100", "港股科技"], minutesAgo: 38
  },
  {
    id: "demo-pmi", title: "国家统计局发布采购经理指数（PMI）数据", source: "国家统计局", category: "中国", importance: 3,
    summary: "示例条目：制造业景气度影响周期、消费与工业板块，需结合新订单和价格分项判断。",
    url: "https://www.stats.gov.cn/sj/zxfb/", impacts: ["沪深 300", "A 股新能源"], minutesAgo: 72
  },
  {
    id: "demo-ecb", title: "欧洲央行货币政策决定与官方新闻发布会", source: "European Central Bank", category: "宏观", importance: 2,
    summary: "示例条目：关注欧元流动性、全球债券收益率及风险偏好向亚洲市场的传导。",
    url: "https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html", impacts: ["标普 500", "恒生指数"], minutesAgo: 116
  },
  {
    id: "demo-energy", title: "美国能源信息署公布每周石油状况报告", source: "U.S. EIA", category: "行业", importance: 2,
    summary: "示例条目：原油库存与成品油需求变化，可能扰动油气、运输和化工产业链定价。",
    url: "https://www.eia.gov/petroleum/supply/weekly/", impacts: ["标普能源", "纳斯达克 100"], minutesAgo: 154
  },
  {
    id: "demo-sec", title: "美国上市公司重要公告与监管披露汇总", source: "U.S. SEC", category: "美国", importance: 2,
    summary: "示例条目：跟踪大型科技公司资本开支、业绩指引和监管文件，以原始披露为准。",
    url: "https://www.sec.gov/edgar/search/", impacts: ["纳指芯片", "标普 500"], minutesAgo: 203
  },
  {
    id: "demo-hkex", title: "香港交易所市场公告与上市公司披露", source: "HKEXnews", category: "中国", importance: 2,
    summary: "示例条目：聚焦大型成份股盈喜盈警、回购及重大交易，留意南向资金共振。",
    url: "https://www1.hkexnews.hk/index_c.htm", impacts: ["港股科技", "恒生指数"], minutesAgo: 247
  }
];

const DEFAULT_WATCHLIST = ["AAPL", "NVDA", "0700.HK", "600519.SS", "300750.SZ", "TSLA"];
const app = document.getElementById("app");
let toastTimer;
let searchTimer;
let refreshInProgress = false;
let searchResults = [];
let selectedSearchIndex = 0;
let state = {
  dataMode: "demo",
  lastUpdated: null,
  marketFilter: "全部",
  signalQuery: "",
  newsFilter: "全部",
  selectedPeriod: "1d",
  selectedStock: "AAPL",
  watchlist: loadWatchlist(),
  indices: [],
  signals: [],
  stocks: {},
  charts: {},
  news: DEMO_NEWS.map(item => ({ ...item, demo: true, timestamp: Date.now() - item.minutesAgo * 60000 }))
};

function icon(name, className = "") {
  return `<svg class="${className}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? escapeHTML(url.href) : "#";
  } catch { return "#"; }
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* 本地存储不可用时保持内存状态 */ }
}

function loadWatchlist() {
  try {
    const saved = JSON.parse(safeGet(STORAGE.watchlist) || "null");
    return Array.isArray(saved) && saved.length ? saved.filter(item => typeof item === "string").slice(0, 20) : [...DEFAULT_WATCHLIST];
  } catch { return [...DEFAULT_WATCHLIST]; }
}

function stockConfig(symbol) {
  return [...POPULAR_STOCKS, ...searchResults].find(item => item.symbol === symbol) || { symbol, name: symbol, fullName: symbol, exchange: "MARKET" };
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => (value = value * 16807 % 2147483647) / 2147483647;
}

function symbolSeed(symbol) {
  return [...symbol].reduce((sum, character) => sum + character.charCodeAt(0) * 17, 137);
}

function makeDemoSeries(asset, period = "1y") {
  const count = PERIODS[period]?.count || 252;
  const random = seededRandom(symbolSeed(asset.symbol) + count);
  const endPrice = asset.price || asset.demoPrice || 100;
  const drift = (asset.demoChange || asset.changePercent || 0.4) / 100;
  let value = endPrice * (1 - drift * (period === "1d" ? 1 : 4.5));
  const closes = [];
  const timestamps = [];
  const now = Date.now();
  const step = period === "1d" ? 5 * 60000 : period === "3d" || period === "1w" ? 30 * 60000 : 86400000;
  for (let index = 0; index < count; index += 1) {
    const wave = Math.sin(index / 8) * 0.0018 + Math.cos(index / 17) * 0.0011;
    value *= 1 + drift / Math.max(count * .7, 1) + wave + (random() - .5) * .007;
    closes.push(value);
    timestamps.push(now - (count - 1 - index) * step);
  }
  const scale = endPrice / closes[closes.length - 1];
  return closes.map((close, index) => ({ close: close * scale, timestamp: timestamps[index] }));
}

function hydrateDemo(config) {
  const series = makeDemoSeries(config, "3m");
  return {
    ...config,
    price: config.demoPrice,
    currency: config.symbol.endsWith(".HK") ? "HKD" : config.symbol.match(/\.(SS|SZ)$/) ? "CNY" : "USD",
    changePercent: config.demoChange,
    change: config.demoPrice * config.demoChange / (100 + config.demoChange),
    previousClose: config.demoPrice / (1 + config.demoChange / 100),
    series,
    demo: true,
    high: Math.max(...series.slice(-1).map(point => point.close)) * 1.008,
    low: Math.min(...series.slice(-1).map(point => point.close)) * .992,
    volume: 0
  };
}

function initializeData() {
  const cached = loadCache();
  if (cached) {
    const cachedIndices = cached.indices || [];
    const cachedSignals = cached.signals || [];
    state.indices = INDEX_CONFIG.map(config => cachedIndices.find(item => item.symbol === config.symbol) || hydrateDemo(config));
    state.signals = SIGNAL_CONFIG.map(config => cachedSignals.find(item => item.symbol === config.symbol) || hydrateDemo(config));
    state.stocks = cached.stocks || {};
    state.news = cached.news?.length ? cached.news : state.news;
    state.lastUpdated = cached.lastUpdated || null;
    state.dataMode = "cache";
    state.watchlist.forEach(symbol => {
      if (!state.stocks[symbol]) state.stocks[symbol] = hydrateDemo(stockConfig(symbol));
    });
  } else {
    state.indices = INDEX_CONFIG.map(hydrateDemo);
    state.signals = SIGNAL_CONFIG.map(hydrateDemo);
    state.watchlist.forEach(symbol => { state.stocks[symbol] = hydrateDemo(stockConfig(symbol)); });
  }
  if (!state.watchlist.includes(state.selectedStock)) state.selectedStock = state.watchlist[0];
}

function loadCache() {
  try {
    const cache = JSON.parse(safeGet(STORAGE.cache) || "null");
    if (!cache?.lastUpdated || Date.now() - cache.lastUpdated > 86400000 * 3) return null;
    return cache;
  } catch { return null; }
}

function saveCache() {
  if (state.dataMode === "demo") return;
  safeSet(STORAGE.cache, JSON.stringify({
    lastUpdated: state.lastUpdated,
    indices: state.indices,
    signals: state.signals,
    stocks: state.stocks,
    news: state.news
  }));
}

async function fetchWithTimeout(url, timeout = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}

function normalizeChart(symbol, payload) {
  const result = payload?.chart?.result?.[0];
  if (!result) throw new Error(payload?.chart?.error?.description || "行情格式不可用");
  const meta = result.meta || {};
  const quote = result.indicators?.quote?.[0] || {};
  const points = (result.timestamp || []).map((timestamp, index) => ({
    timestamp: timestamp * 1000,
    close: quote.close?.[index],
    high: quote.high?.[index],
    low: quote.low?.[index],
    open: quote.open?.[index],
    volume: quote.volume?.[index]
  })).filter(point => Number.isFinite(point.close));
  if (points.length < 2) throw new Error("有效行情不足");
  const last = points[points.length - 1];
  const previous = points[points.length - 2];
  const price = Number.isFinite(meta.regularMarketPrice) ? meta.regularMarketPrice : last.close;
  const previousClose = Number.isFinite(meta.previousClose) && meta.previousClose > 0 ? meta.previousClose : previous.close;
  const config = stockConfig(symbol);
  const known = [...INDEX_CONFIG, ...SIGNAL_CONFIG, ...POPULAR_STOCKS].find(item => item.symbol === symbol) || config;
  return {
    ...known,
    symbol,
    name: known.name || meta.shortName || symbol,
    price,
    currency: meta.currency || "USD",
    exchange: meta.fullExchangeName || meta.exchangeName || known.exchange || "",
    previousClose,
    change: price - previousClose,
    changePercent: (price - previousClose) / previousClose * 100,
    high: last.high || price,
    low: last.low || price,
    open: last.open || previousClose,
    volume: last.volume || meta.regularMarketVolume || 0,
    marketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : last.timestamp,
    series: points,
    demo: false
  };
}

async function fetchAsset(symbol, range = "3mo", interval = "1d") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplits`;
  return normalizeChart(symbol, await fetchWithTimeout(url));
}

async function fetchPeriodChart(symbol, period) {
  const config = PERIODS[period];
  const asset = await fetchAsset(symbol, config.range, config.interval);
  if (period === "3d") {
    const sessions = [...new Set(asset.series.map(point => new Date(point.timestamp).toDateString()))];
    const recentSessions = new Set(sessions.slice(-3));
    asset.series = asset.series.filter(point => recentSessions.has(new Date(point.timestamp).toDateString()));
  }
  return asset;
}

async function fetchMarketNews() {
  const queries = ["Federal Reserve stock market", "China stocks economy", "technology semiconductor earnings"];
  const responses = await Promise.allSettled(queries.map(query => fetchWithTimeout(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=0&newsCount=8&enableFuzzyQuery=false`)));
  const seen = new Set();
  const items = [];
  responses.forEach(response => {
    if (response.status !== "fulfilled") return;
    (response.value?.news || []).forEach(item => {
      if (!item.uuid || seen.has(item.uuid) || !item.link || !item.title) return;
      seen.add(item.uuid);
      items.push({
        id: item.uuid,
        title: item.title,
        source: item.publisher || "Yahoo Finance",
        url: item.link,
        timestamp: item.providerPublishTime ? item.providerPublishTime * 1000 : Date.now(),
        category: categorizeNews(item.title),
        importance: /Fed|CPI|rate|inflation|央行|利率|通胀/i.test(item.title) ? 3 : 2,
        summary: "来自公开新闻聚合接口，标题与发布时间保留原文；请点击查看发布方完整报道。",
        impacts: inferImpacts(item.title),
        demo: false
      });
    });
  });
  if (!items.length) throw new Error("暂无可用新闻");
  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 12);
}

function categorizeNews(title) {
  if (/China|Hong Kong|Beijing| yuan|PBOC|中国|香港|央行/i.test(title)) return "中国";
  if (/Fed|ECB|CPI|inflation|Treasury|rate|GDP|央行|通胀|利率/i.test(title)) return "宏观";
  if (/chip|oil|energy|bank|semiconductor|AI|新能源|芯片|原油/i.test(title)) return "行业";
  return "美国";
}

function inferImpacts(title) {
  const impacts = new Set();
  if (/chip|NVIDIA|semiconductor|AI|芯片|英伟达/i.test(title)) ["纳指芯片", "纳斯达克 100"].forEach(item => impacts.add(item));
  if (/oil|OPEC|crude|energy|原油|能源/i.test(title)) ["标普能源", "标普 500"].forEach(item => impacts.add(item));
  if (/China|Hong Kong|PBOC|中国|香港|央行/i.test(title)) ["沪深 300", "港股科技"].forEach(item => impacts.add(item));
  if (/Fed|rate|inflation|CPI|Treasury|利率|通胀/i.test(title)) ["标普 500", "纳斯达克 100", "港股科技"].forEach(item => impacts.add(item));
  if (!impacts.size) ["标普 500", "纳斯达克 100"].forEach(item => impacts.add(item));
  return [...impacts].slice(0, 3);
}

function signalFor(asset) {
  const points = asset.series || [];
  const last = asset.price || points[points.length - 1]?.close || 0;
  const threeDaysAgo = points[Math.max(0, points.length - 4)]?.close || last;
  const tenDaysAgo = points[Math.max(0, points.length - 11)]?.close || last;
  const threeDayReturn = threeDaysAgo ? (last / threeDaysAgo - 1) * 100 : 0;
  const momentum = tenDaysAgo ? (last / tenDaysAgo - 1) * 100 : 0;
  const score = Math.round(Math.max(8, Math.min(96, 50 + threeDayReturn * 7 + momentum * 2.2)));
  const direction = score >= 56 ? "bullish" : score <= 44 ? "bearish" : "neutral";
  return { ...asset, score, direction, threeDayReturn, momentum };
}

function formatNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-CN", { minimumFractionDigits: maximumFractionDigits, maximumFractionDigits }).format(value);
}

function formatPrice(value, currency = "USD") {
  const digits = value >= 1000 ? 2 : value < 10 ? 3 : 2;
  return `${formatNumber(value, digits)}${currency ? `<small class="currency"> ${escapeHTML(currency)}</small>` : ""}`;
}

function signed(value, suffix = "%") {
  if (!Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${formatNumber(value, 2)}${suffix}`;
}

function changeClass(value) {
  return value > .004 ? "up-text" : value < -.004 ? "down-text" : "neutral-text";
}

function formatVolume(value) {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 1e8) return `${formatNumber(value / 1e8, 2)} 亿`;
  if (value >= 1e4) return `${formatNumber(value / 1e4, 1)} 万`;
  return formatNumber(value, 0);
}

function formatUpdateTime(timestamp) {
  if (!timestamp) return "尚未同步";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(timestamp));
}

function formatNewsTime(timestamp) {
  const date = new Date(timestamp);
  return {
    time: new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date),
    date: new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(date)
  };
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 11 ? "早上好，投资者" : hour < 14 ? "中午好，投资者" : hour < 18 ? "下午好，投资者" : "晚上好，投资者";
}

function dataStatus() {
  if (state.dataMode === "live") return { label: "实时快照", className: "live" };
  if (state.dataMode === "partial") return { label: "部分实时", className: "live" };
  if (state.dataMode === "cache") return { label: "离线缓存", className: "demo" };
  return { label: "演示快照", className: "demo" };
}

function sparkline(series, positive, width = 63, height = 28) {
  const values = (series || []).slice(-24).map(point => point.close).filter(Number.isFinite);
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => `${index / (values.length - 1) * width},${height - 3 - (value - min) / range * (height - 6)}`).join(" ");
  return `<svg class="sparkline" viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${positive ? "#ff737c" : "#35d59c"}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function renderIndexCard(asset) {
  return `<article class="card index-card">
    <div class="index-top"><span class="index-name"><i class="market-flag">${asset.flag || asset.name.slice(0, 1)}</i>${escapeHTML(asset.name)}</span><small>${asset.demo ? "DEMO" : "DELAYED"}</small></div>
    <div class="index-data"><div><div class="index-price">${formatNumber(asset.price)}</div><div class="index-change ${changeClass(asset.changePercent)}">${signed(asset.changePercent)}</div></div>${sparkline(asset.series, asset.changePercent >= 0)}</div>
  </article>`;
}

function renderSignalCard(signal) {
  const verdict = signal.direction === "bullish" ? "看涨" : signal.direction === "bearish" ? "看跌" : "中性";
  const arrow = signal.direction === "bullish" ? "arrow-up" : signal.direction === "bearish" ? "arrow-down" : "arrow-right";
  return `<article class="signal-card ${signal.direction}">
    <div class="signal-top"><div><div class="signal-market">${escapeHTML(signal.region)} · 3D</div><h3 class="signal-name">${escapeHTML(signal.name)}</h3></div><span class="signal-score">${signal.score}</span></div>
    <div class="signal-middle"><span class="signal-verdict">${icon(arrow)}${verdict}</span><span class="signal-change">${signed(signal.threeDayReturn)}</span></div>
    <div class="signal-bottom"><span>3 日 · ${signal.demo ? "示例" : "推演"}</span><span class="signal-meter"><i style="width:${signal.score}%"></i></span></div>
  </article>`;
}

function renderNewsItem(item) {
  const time = formatNewsTime(item.timestamp);
  return `<article class="news-item">
    <div class="news-time"><strong>${time.time}</strong><span>${time.date}</span></div>
    <div class="news-content">
      <div class="news-meta"><span class="news-source">${escapeHTML(item.source)}</span><span class="news-category">${escapeHTML(item.category)}</span>${item.demo ? '<span class="news-category">示例</span>' : ""}<span class="news-importance">${"●".repeat(item.importance || 1)}</span></div>
      <a class="news-title" href="${safeURL(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)}</a>
      <p class="news-summary">${escapeHTML(item.summary)}</p>
      <div class="impact-tags"><span>关联市场 · 方向不确定</span>${item.impacts.map(impact => `<span class="impact-tag">${escapeHTML(impact)}</span>`).join("")}</div>
    </div>
    <svg class="news-arrow" aria-hidden="true"><use href="#i-external"/></svg>
  </article>`;
}

function visibleStocks() {
  return state.watchlist.map(symbol => state.stocks[symbol] || hydrateDemo(stockConfig(symbol)));
}

function selectedAsset() {
  return state.stocks[state.selectedStock] || visibleStocks()[0] || hydrateDemo(stockConfig("AAPL"));
}

function chartSeries(asset, period) {
  const cached = state.charts[`${asset.symbol}:${period}`];
  if (cached?.series?.length) return cached.series;
  if (asset.demo) return makeDemoSeries(asset, period);
  const points = asset.series || [];
  const dailyCounts = { "1d": 2, "3d": 3, "1w": 5, "1m": 22, "3m": 64, "6m": 126, "1y": 252 };
  return points.slice(-dailyCounts[period]);
}

function chartMetrics(asset, period) {
  const series = chartSeries(asset, period);
  const first = series[0]?.close || asset.price;
  const last = series[series.length - 1]?.close || asset.price;
  const changePercent = first ? (last / first - 1) * 100 : 0;
  const values = series.map(point => point.close);
  return { series, first, last, changePercent, high: Math.max(...values), low: Math.min(...values) };
}

function priceChart(asset, period, detail = false) {
  const metrics = chartMetrics(asset, period);
  const values = metrics.series.map(point => point.close);
  if (values.length < 2) return '<div class="chart-loading"><span class="loader"></span></div>';
  const width = 650;
  const height = detail ? 260 : 205;
  const left = 3;
  const right = 64;
  const top = 12;
  const bottom = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min || max * .02 || 1) * .16;
  const low = min - padding;
  const high = max + padding;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const x = index => left + index / (values.length - 1) * plotWidth;
  const y = value => top + (high - value) / (high - low) * plotHeight;
  const line = values.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(2)},${y(value).toFixed(2)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},${height - bottom} L${left},${height - bottom} Z`;
  const positive = metrics.changePercent >= 0;
  const color = positive ? "#ff7079" : "#35d59c";
  const gradientID = `gradient-${asset.symbol.replace(/\W/g, "")}-${detail ? "detail" : "main"}`;
  const grid = Array.from({ length: 4 }, (_, index) => {
    const yy = top + index / 3 * plotHeight;
    const label = high - index / 3 * (high - low);
    return `<line class="grid-line" x1="${left}" y1="${yy}" x2="${width - right + 6}" y2="${yy}"/><text class="axis-label" x="${width - right + 12}" y="${yy + 3}">${formatNumber(label, label > 1000 ? 0 : 1)}</text>`;
  }).join("");
  const timeLabels = Array.from({ length: 5 }, (_, index) => {
    const pointIndex = Math.round(index / 4 * (metrics.series.length - 1));
    const point = metrics.series[pointIndex];
    const date = new Date(point.timestamp);
    const labelOptions = period === "1d"
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : period === "3d" || period === "1w"
        ? { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
        : period === "1y"
          ? { year: "numeric", month: "2-digit" }
          : { month: "2-digit", day: "2-digit" };
    const label = new Intl.DateTimeFormat("zh-CN", labelOptions).format(date);
    const anchor = index === 0 ? "start" : index === 4 ? "end" : "middle";
    return `<text class="axis-label" x="${x(pointIndex)}" y="${height - 5}" text-anchor="${anchor}">${label}</text>`;
  }).join("");
  const lastX = x(values.length - 1);
  const lastY = y(values[values.length - 1]);
  return `<svg class="main-chart ${detail ? "detail-chart" : ""}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" data-chart="${escapeHTML(asset.symbol)}" role="img" aria-label="${escapeHTML(asset.name)} ${PERIODS[period].label}价格走势">
    <defs><linearGradient id="${gradientID}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".22"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#${gradientID})" stroke="none"/><path class="price-line" d="${line}" fill="none" stroke="${color}" vector-effect="non-scaling-stroke"/>
    <circle cx="${lastX}" cy="${lastY}" r="3.5" fill="${color}" stroke="${color}" stroke-opacity=".18" stroke-width="8" vector-effect="non-scaling-stroke"/>
    ${timeLabels}
    <g class="chart-hover" opacity="0"><line class="chart-cursor" y1="${top}" y2="${height - bottom}" x1="0" x2="0"/><circle class="hover-dot" r="4" fill="${color}" cx="0" cy="0"/><rect class="hover-bg" rx="5" width="76" height="22" fill="#202b26"/><text class="hover-text" fill="#f0f5f1" font-size="10" text-anchor="middle"></text></g>
    <rect class="chart-hitbox" x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" fill="transparent" data-values="${values.join(",")}" data-high="${high}" data-low="${low}" data-top="${top}" data-height="${plotHeight}" data-left="${left}" data-width="${plotWidth}"/>
  </svg>`;
}

function renderStockTile(asset) {
  return `<button class="stock-tile ${asset.changePercent >= 0 ? "positive" : "negative"} ${asset.symbol === state.selectedStock ? "active" : ""}" data-action="select-stock" data-symbol="${escapeHTML(asset.symbol)}" aria-label="查看 ${escapeHTML(asset.name)}">
    <strong>${escapeHTML(asset.symbol.replace(/\.(SS|SZ|HK)$/, ""))}</strong><small>${escapeHTML(asset.name)}</small>
    <div class="tile-data"><span class="tile-price">${formatNumber(asset.price)}</span><span class="tile-change">${signed(asset.changePercent)}</span></div>
  </button>`;
}

function renderChartPanel(asset, detail = false) {
  const metrics = chartMetrics(asset, state.selectedPeriod);
  return `<div class="${detail ? "stock-detail-chart" : ""}">
    <div class="chart-head">
      <button class="stock-identity text-button" data-action="open-stock" data-symbol="${escapeHTML(asset.symbol)}">
        <span class="stock-logo">${escapeHTML(asset.symbol.slice(0, 2))}</span><span><h3>${escapeHTML(asset.name)}</h3><p>${escapeHTML(asset.symbol)} · ${escapeHTML(asset.exchange || "GLOBAL")}</p></span>
      </button>
      <div class="chart-price"><strong>${formatPrice(asset.price, asset.currency)}</strong><span class="${changeClass(metrics.changePercent)}">${signed(metrics.changePercent)} · ${PERIODS[state.selectedPeriod].label}</span></div>
    </div>
    <div class="period-tabs" role="tablist" aria-label="行情周期">${Object.keys(PERIODS).map(period => `<button role="tab" aria-selected="${period === state.selectedPeriod}" class="${period === state.selectedPeriod ? "active" : ""}" data-action="select-period" data-period="${period}">${period.toUpperCase()}</button>`).join("")}</div>
    ${priceChart(asset, state.selectedPeriod, detail)}
    <div class="chart-stats">
      <div class="chart-stat"><span>区间最高</span><strong>${formatNumber(metrics.high)}</strong></div>
      <div class="chart-stat"><span>区间最低</span><strong>${formatNumber(metrics.low)}</strong></div>
      <div class="chart-stat"><span>前收</span><strong>${formatNumber(asset.previousClose)}</strong></div>
      <div class="chart-stat"><span>成交量</span><strong>${formatVolume(asset.volume)}</strong></div>
    </div>
  </div>`;
}

function getFilteredSignals() {
  const query = state.signalQuery.trim().toLowerCase().replace(/\s+/g, "");
  return state.signals.map(signalFor).filter(signal => {
    if (state.marketFilter !== "全部" && signal.market !== state.marketFilter) return false;
    if (!query) return true;
    const searchable = `${signal.name} ${signal.region} ${signal.symbol} ${signal.market}`.toLowerCase().replace(/\s+/g, "");
    return searchable.includes(query);
  });
}

function updateSignalResults() {
  const filtered = getFilteredSignals();
  const grid = document.getElementById("signal-grid");
  if (!grid) return;
  grid.innerHTML = filtered.map(renderSignalCard).join("") || '<div class="card empty-state">没有找到匹配市场，试试名称、地区或代码</div>';
  document.getElementById("signal-count").textContent = String(filtered.length);
  document.getElementById("signal-search-clear").hidden = !state.signalQuery;
}

function render() {
  const status = dataStatus();
  const filteredSignals = getFilteredSignals();
  const filteredNews = state.news.filter(item => state.newsFilter === "全部" || item.category === state.newsFilter);
  const selected = selectedAsset();
  const signalResults = state.signals.map(signalFor);
  const positiveSignals = signalResults.filter(signal => signal.direction === "bullish").length;
  const neutralSignals = signalResults.filter(signal => signal.direction === "neutral").length;
  const bearishSignals = signalResults.filter(signal => signal.direction === "bearish").length;
  const breadth = Math.round(positiveSignals / Math.max(signalResults.length, 1) * 100);
  const neutralBreadth = Math.round(neutralSignals / Math.max(signalResults.length, 1) * 100);
  const date = new Date();
  const dateText = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(date);
  app.innerHTML = `
    <section id="overview">
      <header class="welcome"><div><p class="eyebrow">DAILY MARKET BRIEF</p><h1>${greeting()}</h1><p class="welcome-subtitle">${dateText} · 全球市场的每一次变化，都在这里。</p></div><div class="update-meta"><span class="data-badge ${status.className}">${status.label}</span><strong>上次更新 ${formatUpdateTime(state.lastUpdated)}</strong><br>每日 08:00 自动检查 · 公开行情可能延迟</div></header>
      <div class="hero-grid">
        <article class="card brief-card"><div class="card-head"><div><h2 class="card-title">今日市场温度</h2><p class="card-kicker">GLOBAL RISK SENTIMENT</p></div><span class="live-pill">3D SIGNAL</span></div><div class="brief-main">
          <div class="sentiment-gauge"><svg viewBox="0 0 145 78"><defs><linearGradient id="gauge"><stop stop-color="#29ce94"/><stop offset=".5" stop-color="#f2bd65"/><stop offset="1" stop-color="#ff6b75"/></linearGradient></defs><path d="M12 68a60 60 0 0 1 120 0" stroke="#26312c" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M12 68a60 60 0 0 1 120 0" stroke="url(#gauge)" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${Math.max(8, breadth * 1.885)} 189"/><circle cx="${12 + breadth / 100 * 120}" cy="68" r="4" fill="#f2f5f2"/></svg><div class="gauge-value"><strong>${breadth}</strong><span>${breadth >= 55 ? "偏暖" : breadth <= 45 ? "谨慎" : "中性"}</span></div></div>
          <div class="brief-copy"><h2>${breadth >= 55 ? "风险偏好有所回升" : breadth <= 45 ? "防守信号暂时占优" : "多空力量相对均衡"}</h2><p>基于所追踪指数与行业近 3 个交易日的价格动量生成。当前 ${positiveSignals} 个看涨、${neutralSignals} 个中性、${bearishSignals} 个看跌，结论随行情同步变化。</p><div class="brief-tags"><span>三日动量</span><span>跨市场比较</span><span>规则化推演</span></div></div>
        </div></article>
        <article class="card day-stat-card"><div class="card-head"><div><h2 class="card-title">多空信号分布</h2><p class="card-kicker">每根柱子代表一个市场</p></div><div class="date-block"><strong>${String(date.getDate()).padStart(2, "0")}</strong><span>${new Intl.DateTimeFormat("en", { month: "short" }).format(date).toUpperCase()}</span></div></div>
          <div class="breadth-visual">${signalResults.map(result => { const height = 22 + result.score * .5; const colorClass = result.direction === "bullish" ? "up" : result.direction === "bearish" ? "down" : "neutral"; const verdict = result.direction === "bullish" ? "看涨" : result.direction === "bearish" ? "看跌" : "中性"; return `<i class="${colorClass}" style="height:${height}px" title="${escapeHTML(result.name)}：${verdict}"></i>`; }).join("")}</div>
          <div class="breadth-legend"><span><i style="background:var(--up)"></i>看涨 <strong>${positiveSignals}</strong></span><span><i style="background:var(--amber)"></i>中性 <strong>${neutralSignals}</strong></span><span><i style="background:var(--down)"></i>看跌 <strong>${bearishSignals}</strong></span></div><div class="breadth-bar"><span style="width:${breadth}%;background:var(--up)"></span><span style="width:${neutralBreadth}%;background:var(--amber)"></span><span style="width:${100 - breadth - neutralBreadth}%;background:var(--down)"></span></div>
        </article>
      </div>
      <div class="index-strip">${state.indices.map(renderIndexCard).join("")}</div>
    </section>

    <section id="signals" class="section"><div class="section-header"><div><div class="section-heading"><span class="section-number">01</span><h2>三日多空信号</h2></div><p>${SIGNAL_CONFIG.length} 个全球指数与行业板块 · 当前显示 <span id="signal-count">${filteredSignals.length}</span> 个 · ETF 仅作行业行情代理</p></div><div class="section-actions"><div class="signal-search">${icon("search")}<input id="signal-search" type="text" autocomplete="off" value="${escapeHTML(state.signalQuery)}" placeholder="搜索指数或板块" aria-label="搜索指数或板块"><button id="signal-search-clear" data-action="clear-signal-search" aria-label="清空搜索" ${state.signalQuery ? "" : "hidden"}>${icon("close")}</button></div><div class="filter-tabs">${["全部", "中国", "美国", "全球", "行业"].map(filter => `<button class="${state.marketFilter === filter ? "active" : ""}" data-action="filter-market" data-filter="${filter}">${filter}</button>`).join("")}</div></div></div>
      <div id="signal-grid" class="signal-grid">${filteredSignals.map(renderSignalCard).join("") || '<div class="card empty-state">没有找到匹配市场，试试名称、地区或代码</div>'}</div><p class="signal-disclaimer">${icon("clock")}信号仅由价格趋势规则计算，不代表确定性预测，也不构成买卖建议。</p>
    </section>

    <section id="news" class="section"><div class="section-header"><div><div class="section-heading"><span class="section-number">02</span><h2>关键市场资讯</h2></div><p>聚合可访问的公开信源 · 点击标题直达发布方原文</p></div><div class="section-actions"><div class="filter-tabs">${["全部", "宏观", "中国", "美国", "行业"].map(filter => `<button class="${state.newsFilter === filter ? "active" : ""}" data-action="filter-news" data-filter="${filter}">${filter}</button>`).join("")}</div></div></div>
      <div class="news-layout"><div class="card news-card">${filteredNews.map(renderNewsItem).join("") || '<div class="empty-state"><strong>该分类暂无资讯</strong>点击“更新最新信息”重新获取</div>'}</div></div>
    </section>

    <section id="watchlist" class="section"><div class="section-header"><div><div class="section-heading"><span class="section-number">03</span><h2>我的自选</h2></div><p>${state.watchlist.length} 只资产 · 红涨绿跌 · 点击色块联动走势图</p></div><div class="watchlist-toolbar"><button class="text-button" data-action="refresh">同步行情 ${icon("refresh")}</button><button class="add-stock-button" data-action="open-search">${icon("plus")}添加自选</button></div></div>
      <div class="watchlist-grid"><article class="card watchlist-panel"><div class="card-head"><div><h3 class="card-title">自选行情总览</h3><p class="card-kicker">PORTFOLIO HEATMAP</p></div><span class="live-pill">${status.label}</span></div><div class="stock-heat-grid">${visibleStocks().map(renderStockTile).join("")}</div></article><article class="card chart-panel">${renderChartPanel(selected)}</article></div>
    </section>`;
  document.getElementById("nav-news-count").textContent = String(state.news.length);
  requestAnimationFrame(setupChartHover);
}

function setupChartHover() {
  document.querySelectorAll(".chart-hitbox").forEach(hitbox => {
    const svg = hitbox.closest("svg");
    const hover = svg.querySelector(".chart-hover");
    const values = hitbox.dataset.values.split(",").map(Number);
    const high = Number(hitbox.dataset.high);
    const low = Number(hitbox.dataset.low);
    const top = Number(hitbox.dataset.top);
    const height = Number(hitbox.dataset.height);
    const left = Number(hitbox.dataset.left);
    const width = Number(hitbox.dataset.width);
    hitbox.addEventListener("pointermove", event => {
      const rect = svg.getBoundingClientRect();
      const localX = (event.clientX - rect.left) / rect.width * 650;
      const index = Math.max(0, Math.min(values.length - 1, Math.round((localX - left) / width * (values.length - 1))));
      const x = left + index / (values.length - 1) * width;
      const y = top + (high - values[index]) / (high - low) * height;
      hover.setAttribute("opacity", "1");
      hover.querySelector("line").setAttribute("x1", x);
      hover.querySelector("line").setAttribute("x2", x);
      hover.querySelector("circle").setAttribute("cx", x);
      hover.querySelector("circle").setAttribute("cy", y);
      const box = hover.querySelector("rect");
      const text = hover.querySelector("text");
      const boxX = Math.max(2, Math.min(570, x - 38));
      const boxY = Math.max(2, y - 31);
      box.setAttribute("x", boxX);
      box.setAttribute("y", boxY);
      text.setAttribute("x", boxX + 38);
      text.setAttribute("y", boxY + 15);
      text.textContent = formatNumber(values[index]);
    });
    hitbox.addEventListener("pointerleave", () => hover.setAttribute("opacity", "0"));
  });
}

async function settleWithConcurrency(items, worker, limit = 10) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = { status: "fulfilled", value: await worker(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(runners);
  return results;
}

async function refreshData(trigger = "manual") {
  if (refreshInProgress) return;
  refreshInProgress = true;
  document.querySelectorAll('[data-action="refresh"]').forEach(button => { button.disabled = true; button.classList.add("loading"); });
  if (trigger === "manual") showToast(`正在同步 ${SIGNAL_CONFIG.length} 个指数与板块、公开资讯…`);
  const indexJobs = INDEX_CONFIG.map(config => fetchAsset(config.symbol));
  const signalJobs = settleWithConcurrency(SIGNAL_CONFIG, config => fetchAsset(config.symbol), 10);
  const stockJobs = state.watchlist.map(symbol => fetchAsset(symbol, "1y", "1d"));
  const selectedJob = fetchPeriodChart(state.selectedStock, state.selectedPeriod);
  const [indices, signals, stocks, selectedChart, news] = await Promise.all([
    Promise.allSettled(indexJobs), signalJobs, Promise.allSettled(stockJobs), Promise.allSettled([selectedJob]), fetchMarketNews().catch(() => null)
  ]);
  let successes = 0;
  let attempts = indices.length + signals.length + stocks.length + 1;
  indices.forEach((result, index) => { if (result.status === "fulfilled") { state.indices[index] = result.value; successes += 1; } });
  signals.forEach((result, index) => { if (result.status === "fulfilled") { state.signals[index] = result.value; successes += 1; } });
  stocks.forEach((result, index) => { if (result.status === "fulfilled") { state.stocks[state.watchlist[index]] = result.value; successes += 1; } });
  if (selectedChart[0].status === "fulfilled") {
    state.charts[`${state.selectedStock}:${state.selectedPeriod}`] = selectedChart[0].value;
    successes += 1;
  }
  if (news) state.news = news;
  state.lastUpdated = Date.now();
  state.dataMode = successes === 0 ? "demo" : successes < attempts ? "partial" : "live";
  if (state.dataMode !== "demo") saveCache();
  if (trigger === "auto") safeSet(STORAGE.autoRefresh, new Date().toISOString().slice(0, 10));
  refreshInProgress = false;
  render();
  document.querySelectorAll('[data-action="refresh"]').forEach(button => { button.disabled = false; button.classList.remove("loading"); });
  if (trigger === "manual") {
    showToast(successes ? `已更新 ${successes}/${attempts} 项行情${news ? "，资讯已同步" : "，新闻暂用原列表"}` : "公开接口暂不可用，已保留演示快照");
  }
}

function openSearch() {
  const modal = document.getElementById("search-modal");
  renderSearchResults(POPULAR_STOCKS, "热门资产");
  if (!modal.open) modal.showModal();
  const input = document.getElementById("stock-search");
  input.value = "";
  setTimeout(() => input.focus(), 50);
}

function closeSearch() {
  document.getElementById("search-modal").close();
}

function renderSearchResults(results, label = "搜索结果") {
  searchResults = results;
  selectedSearchIndex = 0;
  const container = document.getElementById("search-results");
  container.innerHTML = `<p class="search-label">${escapeHTML(label)}</p>${results.length ? results.map((stock, index) => {
    const added = state.watchlist.includes(stock.symbol);
    return `<button class="search-result ${index === selectedSearchIndex ? "selected" : ""}" data-action="add-stock" data-symbol="${escapeHTML(stock.symbol)}" data-index="${index}"><span class="result-logo">${escapeHTML(stock.symbol.slice(0, 2))}</span><span class="result-main"><strong>${escapeHTML(stock.symbol)}</strong><span>${escapeHTML(stock.name || stock.fullName)} · ${escapeHTML(stock.fullName || "")}</span></span><span class="result-exchange">${escapeHTML(stock.exchange || "")}</span>${added ? '<span class="result-added">已添加</span>' : `<span class="result-add">${icon("plus")}</span>`}</button>`;
  }).join("") : '<div class="empty-state"><strong>没有找到匹配资产</strong>试试中文名称或代码，例如：拼多多 / PDD / 腾讯 / 0700.HK / 600519</div>'}`;
}

function mergeStockResults(...groups) {
  const seen = new Set();
  return groups.flat().filter(stock => {
    if (!stock?.symbol || seen.has(stock.symbol)) return false;
    seen.add(stock.symbol);
    return true;
  }).slice(0, 12);
}

function parseTencentHint(hint) {
  return String(hint || "").split("^").map(row => row.split("~")).filter(fields => fields.length >= 5 && fields[4].startsWith("GP")).slice(0, 12).map(fields => {
    const [market, rawCode, name] = fields;
    let symbol = rawCode.toUpperCase();
    let exchange = market.toUpperCase();
    if (market === "us") {
      symbol = symbol.replace(/\.(OQ|N|PS)$/, "");
      exchange = rawCode.endsWith(".n") ? "NYSE" : "US";
    } else if (market === "hk") {
      symbol = `${String(Number(rawCode)).padStart(4, "0")}.HK`;
      exchange = "HKEX";
    } else if (market === "sh" || market === "sz") {
      symbol = `${rawCode}.${market === "sh" ? "SS" : "SZ"}`;
      exchange = market === "sh" ? "SSE" : "SZSE";
    } else return null;
    return { symbol, name, fullName: name, exchange };
  }).filter(Boolean);
}

function searchTencentStocks(query) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const cleanup = () => {
      clearTimeout(timer);
      script.remove();
      window.v_hint = "";
    };
    const timer = setTimeout(() => { cleanup(); reject(new Error("中文搜索超时")); }, 7000);
    script.src = `https://smartbox.gtimg.cn/s3/?v=2&q=${encodeURIComponent(query)}&t=all&_=${Date.now()}`;
    script.onload = () => {
      const results = parseTencentHint(window.v_hint);
      cleanup();
      resolve(results);
    };
    script.onerror = () => { cleanup(); reject(new Error("中文搜索不可用")); };
    document.head.appendChild(script);
  });
}

async function searchYahooStocks(query) {
  const payload = await fetchWithTimeout(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`);
  return (payload.quotes || []).filter(item => item.symbol && item.quoteType !== "CRYPTOCURRENCY").slice(0, 10).map(item => ({
    symbol: item.symbol,
    name: item.shortname || item.longname || item.symbol,
    fullName: item.longname || item.shortname || item.symbol,
    exchange: item.exchDisp || item.exchange || ""
  }));
}

async function searchStocks(query) {
  const normalized = query.trim();
  if (!normalized) { renderSearchResults(POPULAR_STOCKS, "热门资产"); return; }
  const local = POPULAR_STOCKS.filter(stock => `${stock.symbol} ${stock.name} ${stock.fullName}`.toLowerCase().includes(normalized.toLowerCase()));
  renderSearchResults(local, local.length ? "本地匹配 · 正在联网搜索…" : "正在搜索中文名称与股票代码…");
  let remote = [];
  let source = "腾讯证券";
  try {
    remote = await searchTencentStocks(normalized);
    if (!remote.length) throw new Error("无匹配结果");
  } catch {
    try {
      remote = await searchYahooStocks(normalized);
      source = "Yahoo Finance";
    } catch { /* 使用本地结果 */ }
  }
  if (document.getElementById("stock-search").value.trim() !== normalized) return;
  const results = mergeStockResults(local, remote);
  renderSearchResults(results, remote.length ? `${source} · ${results.length} 个结果` : "联网搜索未找到 · 本地匹配");
}

async function addStock(symbol) {
  if (state.watchlist.includes(symbol)) { showToast("该资产已在自选中"); return; }
  if (state.watchlist.length >= 20) { showToast("最多添加 20 只自选资产"); return; }
  state.watchlist.push(symbol);
  safeSet(STORAGE.watchlist, JSON.stringify(state.watchlist));
  state.stocks[symbol] = hydrateDemo(stockConfig(symbol));
  state.selectedStock = symbol;
  closeSearch();
  render();
  showToast(`已添加 ${symbol}，正在获取行情…`);
  try {
    const [asset, chart] = await Promise.all([fetchAsset(symbol, "1y", "1d"), fetchPeriodChart(symbol, state.selectedPeriod)]);
    state.stocks[symbol] = asset;
    state.charts[`${symbol}:${state.selectedPeriod}`] = chart;
    state.lastUpdated = Date.now();
    state.dataMode = "partial";
    saveCache();
  } catch { /* 保留清晰标记的演示行情 */ }
  render();
}

function openStockDetail(symbol) {
  if (!state.watchlist.includes(symbol)) return;
  state.selectedStock = symbol;
  const asset = selectedAsset();
  document.getElementById("stock-detail").innerHTML = `<div class="stock-detail-inner"><div class="stock-detail-header"><div><p class="eyebrow">ASSET DETAIL</p><h2 style="margin:0">${escapeHTML(asset.name)} <span style="color:var(--muted);font-size:12px;font-weight:400">${escapeHTML(asset.symbol)}</span></h2></div><div class="stock-detail-actions"><button class="icon-button" data-action="remove-stock" data-symbol="${escapeHTML(symbol)}" aria-label="移除自选">${icon("trash")}</button><button class="icon-button" data-action="close-stock" aria-label="关闭">${icon("close")}</button></div></div>${renderChartPanel(asset, true)}<p class="detail-description">行情来自公开接口，可能存在延迟；接口不可用时会显示演示数据。周期涨跌幅按所选区间首个与最后一个有效价格计算。</p></div>`;
  const modal = document.getElementById("stock-modal");
  if (!modal.open) modal.showModal();
  requestAnimationFrame(setupChartHover);
}

async function selectPeriod(period) {
  if (!PERIODS[period] || period === state.selectedPeriod) return;
  state.selectedPeriod = period;
  render();
  if (document.getElementById("stock-modal").open) openStockDetail(state.selectedStock);
  const key = `${state.selectedStock}:${period}`;
  if (state.charts[key]) return;
  try {
    state.charts[key] = await fetchPeriodChart(state.selectedStock, period);
    render();
    if (document.getElementById("stock-modal").open) openStockDetail(state.selectedStock);
  } catch { /* 图表保留演示序列，数据徽标明确标识 */ }
}

function removeStock(symbol) {
  if (state.watchlist.length <= 1) { showToast("请至少保留一只自选资产"); return; }
  state.watchlist = state.watchlist.filter(item => item !== symbol);
  safeSet(STORAGE.watchlist, JSON.stringify(state.watchlist));
  if (state.selectedStock === symbol) state.selectedStock = state.watchlist[0];
  document.getElementById("stock-modal").close();
  render();
  showToast(`已移除 ${symbol}`);
}

function navigateTo(section) {
  document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelectorAll("[data-nav]").forEach(button => button.classList.toggle("active", button.dataset.nav === section));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function checkDailyRefresh() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (now.getHours() >= 8 && safeGet(STORAGE.autoRefresh) !== today && !refreshInProgress) refreshData("auto");
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action], [data-nav], [data-market-link]");
  if (!button) return;
  if (button.dataset.nav) { navigateTo(button.dataset.nav); return; }
  if (button.dataset.marketLink) {
    state.marketFilter = button.dataset.marketLink;
    render();
    navigateTo("signals");
    return;
  }
  const action = button.dataset.action;
  if (action === "refresh") refreshData("manual");
  else if (action === "open-search") openSearch();
  else if (action === "close-search") closeSearch();
  else if (action === "add-stock") addStock(button.dataset.symbol);
  else if (action === "filter-market") { state.marketFilter = button.dataset.filter; render(); }
  else if (action === "clear-signal-search") {
    state.signalQuery = "";
    document.getElementById("signal-search").value = "";
    updateSignalResults();
    document.getElementById("signal-search").focus();
  }
  else if (action === "filter-news") { state.newsFilter = button.dataset.filter; render(); }
  else if (action === "select-stock") { state.selectedStock = button.dataset.symbol; render(); }
  else if (action === "select-period") selectPeriod(button.dataset.period);
  else if (action === "open-stock") openStockDetail(button.dataset.symbol);
  else if (action === "close-stock") document.getElementById("stock-modal").close();
  else if (action === "remove-stock") removeStock(button.dataset.symbol);
});

document.addEventListener("input", event => {
  if (event.target.id !== "signal-search") return;
  state.signalQuery = event.target.value;
  updateSignalResults();
});

document.getElementById("stock-search").addEventListener("input", event => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchStocks(event.target.value), 320);
});

document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
    return;
  }
  const modal = document.getElementById("search-modal");
  if (!modal.open || !["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
  if (!searchResults.length) return;
  event.preventDefault();
  if (event.key === "ArrowDown") selectedSearchIndex = (selectedSearchIndex + 1) % searchResults.length;
  else if (event.key === "ArrowUp") selectedSearchIndex = (selectedSearchIndex - 1 + searchResults.length) % searchResults.length;
  else { addStock(searchResults[selectedSearchIndex].symbol); return; }
  document.querySelectorAll(".search-result").forEach((result, index) => result.classList.toggle("selected", index === selectedSearchIndex));
  document.querySelector(".search-result.selected")?.scrollIntoView({ block: "nearest" });
});

document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));

const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  document.querySelectorAll("[data-nav]").forEach(button => button.classList.toggle("active", button.dataset.nav === visible.target.id));
}, { rootMargin: "-15% 0px -65% 0px", threshold: [0, .2, .5] });

initializeData();
render();
["overview", "signals", "news", "watchlist"].forEach(id => observer.observe(document.getElementById(id)));
document.getElementById("footer-year").textContent = `© ${new Date().getFullYear()}`;
setInterval(checkDailyRefresh, 60000);
window.addEventListener("focus", checkDailyRefresh);
setTimeout(checkDailyRefresh, 700);
