'use strict';

/* ============================================================================
   Settings

   source: 'sample'  reads window.SAMPLE_DATA from sample-data.js. This works when
                     you open index.html straight from your disk.
           'live'    reads the commit list from the GitHub API and run results from
                     index.json at resultsBase. Browsers block fetch() on file://
                     pages, so serve the folder over http(s) (GitHub Pages, or
                     `python -m http.server` for a local test).

   index.json format (written by your workflows):
   {
     "generated_at": "2026-11-03T18:20:00Z",
     "machines": [ { "id": "lab-win-01", "os": "...", "cpu": "...", "gpu": "...",
                     "driver": "...", "ram_gb": 32 } ],
     "commits": { "<full commit sha>": { "message": "...", "author": "...", "date": ISO time } },
     "runs": {
       "<full commit sha>": {
         "lab-win-01": {
           "status": "passed" | "failed" | "running" | "queued",
           "started": ISO time, "finished": ISO time, "duration_sec": 412,
           "run_url": "https://github.com/.../actions/runs/...",
           "tests": [ { "name": "Build (Release)", "status": "passed", "ms": 412345 },
                      { "name": "Terrain", "status": "passed", "ms": 2900, "fps_avg": 164.2, "frame_ms_p95": 7.6,
                        "message": "..." } ],
           ("ms" of a project is its load time when it loaded, its run time when it did not)
           "screenshots": [ { "scene": "Terrain", "file": "runs/<sha>/lab-win-01/01.jpg",
                              "thumb": "runs/<sha>/lab-win-01/thumbs/01.jpg",
                              "status": "passed", "diff_pct": 0.3, "reference": "references/<project ID>.png",
                              "difference": "runs/<sha>/lab-win-01/differences/01.jpg" } ]
           ("reference_created": true instead of diff_pct when screenshot became the reference,
            older results have "diff_against": "<sha>" instead of "reference")
         }
       }
     }
   }
   Editor view reads editor/index.json in the same format, its commits are editor commits
   and each run has "engine_commit", the engine commit that editor commit was built with.
   Relative screenshot paths are read from resultsBase, reference PNGs from pngBase.
   Commits listed in "commits" are shown even when they are not among the newest
   maxCommits commits of branch, so results never drop off the page.
============================================================================ */
const CONFIG = {
  source: 'live',
  // Editor results are kept by editor commit, the engine they were built with is in their run details.
  views: {
    engine: { title: 'Engine', repo: 'Azzinoth/FocalEngine', index: 'index.json' },
    editor: { title: 'Editor', repo: 'Azzinoth/FocalEngineEditor', index: 'editor/index.json' },
  },
  branch: 'master',
  resultsBase: 'https://azzinoth.github.io/FocalEngineBenchmarkResults/',
  // references folder is left out of the site (see _config.yml), so reference PNGs are read straight from the repo.
  pngBase: 'https://raw.githubusercontent.com/Azzinoth/FocalEngineBenchmarkResults/master/',
  maxCommits: 100,
  // Written by .github/workflows/runner-status.yml. Empty string hides the "Test machines" row.
  runnersUrl: 'https://raw.githubusercontent.com/Azzinoth/FocalEngineBenchmarkResults/status/runners.json',
};

// Page address ?view=editor opens editor view, any other address opens engine view.
const VIEW_ID = new URLSearchParams(window.location.search).get('view') === 'editor' ? 'editor' : 'engine';
const VIEW = CONFIG.views[VIEW_ID];

/* ============================================================================
   Helpers
============================================================================ */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const short = (sha) => sha.slice(0, 7);
const repoName = (repository) => repository.split('/').pop();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let DATA = null;
let refNow = () => new Date();

const STATUS_LABEL = { passed: 'Passed', failed: 'Failed', running: 'Running', queued: 'Queued', pending: 'Pending', none: 'Not run' };

function statusIcon(status) {
  switch (status) {
    case 'passed':
      return '<svg class="si si-passed" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5"/><path d="M4.8 8.3l2.1 2.1 4.3-4.6"/></svg>';
    case 'failed':
      return '<svg class="si si-failed" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8"/></svg>';
    case 'running':
      return '<svg class="si si-running" viewBox="0 0 16 16" aria-hidden="true"><circle class="track" cx="8" cy="8" r="6"/><path class="arc" d="M8 2a6 6 0 0 1 6 6"/></svg>';
    case 'queued':
    case 'pending':
      return '<svg class="si si-queued" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 5v3.3l2 1.3"/></svg>';
    default:
      return '<svg class="si si-none" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 8h6"/></svg>';
  }
}

// Each machine gets a color and a marker shape, so it is never told apart by color alone.
function shapePath(i, cx, cy, s) {
  const k = i % 3;
  if (k === 0) return `<circle cx="${cx}" cy="${cy}" r="${s / 2}"/>`;
  if (k === 1) return `<rect x="${cx - s * 0.43}" y="${cy - s * 0.43}" width="${s * 0.86}" height="${s * 0.86}" rx="1"/>`;
  const r = s * 0.6;
  return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}"/>`;
}
function machineMark(i, size = 10) {
  return `<svg class="mk" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" style="fill:var(--series-${(i % 3) + 1})">${shapePath(i, size / 2, size / 2, size - 1)}</svg>`;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function ago(iso, now = refNow()) {
  const s = (new Date(iso) - now) / 1000;
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [u, n] of units) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return 'just now';
}
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const fmtDate = (iso) => dateFmt.format(new Date(iso));
function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return `${sec} s`;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h} h ${m} min`;
  return s ? `${m} min ${s} s` : `${m} min`;
}
function fmtMs(ms) {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
  return fmtDur(ms / 1000);
}
function joinList(items) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

/* ============================================================================
   Data
============================================================================ */
async function loadData() {
  if (CONFIG.source === 'sample') {
    if (!window.SAMPLE_DATA) throw new Error('sample-data.js did not load. Keep it in the same folder as index.html.');
    return window.SAMPLE_DATA;
  }
  const [commitsRes, indexRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${VIEW.repo}/commits?sha=${encodeURIComponent(CONFIG.branch)}&per_page=${CONFIG.maxCommits}`),
    fetch(new URL(VIEW.index, CONFIG.resultsBase), { cache: 'no-cache' }),
  ]);
  if (!commitsRes.ok) throw new Error(`GitHub returned ${commitsRes.status} for the commit list. If it is 403, the hourly limit for anonymous requests was reached; try again later.`);
  if (!indexRes.ok) throw new Error(`${VIEW.index} could not be loaded (HTTP ${indexRes.status}). Check resultsBase in app.js.`);
  const gh = await commitsRes.json();
  const index = await indexRes.json();
  const branchCommits = gh.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0],
    author: c.author?.login || c.commit.author.name,
    date: c.commit.author.date,
    url: c.html_url,
  }));
  return {
    repo: VIEW.repo,
    branch: CONFIG.branch,
    generated_at: index.generated_at,
    machines: index.machines,
    runs: index.runs || {},
    commits: mergeCommits(branchCommits, index.commits || {}),
  };
}

// Keeps GitHub's order of branch commits and slots in, by date, commits that have results but are not in that list.
function mergeCommits(branchCommits, resultCommits) {
  const listed = new Set(branchCommits.map((c) => c.sha));
  const extra = Object.entries(resultCommits)
    .filter(([sha]) => !listed.has(sha))
    .map(([sha, c]) => ({ sha, ...c }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const merged = [];
  let k = 0;
  for (const c of branchCommits) {
    while (k < extra.length && new Date(extra[k].date) > new Date(c.date)) merged.push(extra[k++]);
    merged.push(c);
  }
  return merged.concat(extra.slice(k));
}

function prepare(raw) {
  const base = CONFIG.source === 'sample' ? '' : CONFIG.resultsBase;
  const abs = (p) => (!p || /^https?:\/\//.test(p) || !base ? p : new URL(p, base).href);
  const machines = raw.machines.map((m, index) => ({ ...m, index }));
  const commits = raw.commits.map((c) => {
    const runs = raw.runs[c.sha] || {};
    for (const r of Object.values(runs)) {
      r.screenshots = (r.screenshots || []).map((s) => ({
        ...s, file: abs(s.file), thumb: abs(s.thumb || s.file), difference: abs(s.difference),
        reference: s.reference ? new URL(s.reference, CONFIG.pngBase).href : null,
      }));
      r.tests = r.tests || [];
      // Screenshots follow the order of project repos, as they are grouped on the page and in the screenshot viewer.
      const sourceOrder = (r.project_sources || []).map((s) => s.repository);
      if (sourceOrder.length > 1) {
        const sourceIndex = (s) => sourceOrder.indexOf(r.tests.find((t) => t.name === s.scene)?.source);
        r.screenshots.sort((a, b) => sourceIndex(a) - sourceIndex(b));
      }
    }
    return { ...c, runs };
  });
  for (const c of commits) c.state = commitState(c);
  // Commits go from newest to oldest. Each finished run gets the previous finished run on its machine,
  // and for every project the newest older passed result on that machine, for the change shown in projects table.
  for (const m of machines) {
    let previousSha = null;
    const lastPassed = {};
    for (let i = commits.length - 1; i >= 0; i--) {
      const r = commits[i].runs[m.id];
      if (!isFinished(r)) continue;

      r.previousSha = previousSha;
      r.previous = { ...lastPassed };
      for (const t of r.tests) {
        if (t.status === 'passed') lastPassed[t.name] = { ...t, sha: commits[i].sha };
      }
      previousSha = commits[i].sha;
    }
  }
  // Every project has a screenshot when it ran, test names also include the build.
  const projects = [...new Set(commits.flatMap((c) => Object.values(c.runs).flatMap((r) => r.screenshots.map((s) => s.scene))))].sort();
  // Repo of each project, from its newest result, for grouping the project picker of the chart.
  const projectSources = {};
  for (const c of commits) {
    for (const r of Object.values(c.runs)) {
      for (const t of r.tests) {
        if (t.source && !(t.name in projectSources)) projectSources[t.name] = t.source;
      }
    }
  }
  return { ...raw, machines, commits, projects, projectSources };
}

function commitState(c) {
  const s = Object.values(c.runs).map((r) => r.status);
  if (!s.length) return 'none';
  if (s.includes('failed')) return 'failed';
  if (s.includes('running') || s.includes('queued')) return 'running';
  return 'passed';
}
const isFinished = (r) => r && (r.status === 'passed' || r.status === 'failed');

/* ============================================================================
   State
============================================================================ */
const state = {
  filter: 'all',
  query: '',
  open: new Set(),
  tab: {},
  compare: {},
  metric: 'fps_avg',
  project: null,
};

const projectTest = (r, project) => r?.tests?.find((t) => t.name === project);

const METRICS = {
  fps_avg: {
    button: 'Average FPS', perProject: true,
    note: 'Average frames per second of the project, measured after frame time settles. Higher is better.',
    get: (r, p) => projectTest(r, p)?.fps_avg, fmt: (v) => `${v.toFixed(1)} fps`, tick: (v) => `${v}`,
  },
  frame_ms_p95: {
    button: 'Frame time', perProject: true,
    note: '95th percentile frame time of the project in milliseconds, 95% of frames were faster. Lower is better.',
    get: (r, p) => projectTest(r, p)?.frame_ms_p95, fmt: (v) => `${v.toFixed(2)} ms`, tick: (v) => `${v}`,
  },
  load_s: {
    button: 'Load time', perProject: true,
    note: 'Time to load the project, in seconds. Lower is better.',
    get: (r, p) => { const t = projectTest(r, p); return t?.status === 'passed' && t.ms != null ? t.ms / 1000 : undefined; },
    fmt: (v) => `${v.toFixed(2)} s`, tick: (v) => `${v}`,
  },
  duration_min: {
    button: 'Run time', note: 'Total job time, from checkout to upload, in minutes. Lower is better.',
    get: (r) => (r?.duration_sec != null ? r.duration_sec / 60 : undefined), fmt: (v) => `${v.toFixed(1)} min`, tick: (v) => `${v}`,
  },
};

/* ============================================================================
   Header and footer
============================================================================ */
function describe(c) {
  const by = {};
  for (const m of DATA.machines) {
    const st = c.runs[m.id]?.status;
    if (st) (by[st] ||= []).push(m.id);
  }
  const total = DATA.machines.length;
  if ((by.passed || []).length === total) return total === 1 ? `passed on ${by.passed[0]}` : `passed on all ${total} machines`;
  const parts = [];
  if (by.running) parts.push(`running on ${joinList(by.running)}`);
  if (by.queued) parts.push(`queued on ${joinList(by.queued)}`);
  if (by.failed) parts.push(`failed on ${joinList(by.failed)}`);
  if (by.passed) parts.push(`passed on ${joinList(by.passed)}`);
  let text = parts.length > 1 && (by.running || by.queued) ? joinList(parts) : parts.join(', ');
  if (by.running || by.queued) text = 'is ' + text;
  return text;
}
const shaLink = (sha) => `<button class="sha-link sha" type="button" data-open="${sha}">${short(sha)}</button>`;

function renderHeader() {
  const [owner, name] = DATA.repo.split('/');
  $('#repo-name').innerHTML = `<span class="owner">${esc(owner)}/</span>${esc(name)}`;
  document.title = `${name} test results`;
  $('#branch-name').textContent = DATA.branch;
  $('#source-pill').hidden = CONFIG.source !== 'sample';
  $('#view-switch').innerHTML = Object.entries(CONFIG.views)
    .map(([id, view]) => `<a href="${id === 'engine' ? './' : `?view=${id}`}"${id === VIEW_ID ? ' aria-current="page"' : ''}>${esc(view.title)}</a>`)
    .join('');

  const latest = DATA.commits[0];
  const finished = DATA.commits.find((c) => Object.values(c.runs).some(isFinished));
  let s = '';
  if (latest) {
    s = Object.keys(latest.runs).length
      ? `Latest commit ${shaLink(latest.sha)} ${describe(latest)}.`
      : `Latest commit ${shaLink(latest.sha)} has no runs.`;
    if (finished && finished !== latest && latest.state !== 'passed' && latest.state !== 'failed') {
      s += ` The last finished commit, ${shaLink(finished.sha)}, ${describe(finished)}.`;
    }
  }
  $('#summary').innerHTML = s || 'No commits found.';

  const weekAgo = refNow() - 7 * 86400000;
  let runs = 0, failed = 0;
  for (const c of DATA.commits) for (const r of Object.values(c.runs)) {
    if (isFinished(r) && new Date(r.started) >= weekAgo) { runs++; if (r.status === 'failed') failed++; }
  }
  $('#summary-sub').textContent =
    `Last 7 days: ${runs} ${runs === 1 ? 'run' : 'runs'}, ${failed} failed. Updated ${fmtDate(DATA.generated_at)}.`;

  $('#foot').innerHTML = CONFIG.source === 'sample'
    ? 'This page shows sample data from <code>sample-data.js</code>. To show real results, set <code>source</code> to <code>\'live\'</code> in <code>app.js</code> and point <code>resultsBase</code> at the folder that holds <code>index.json</code>.'
    : `Commits from GitHub, results from <code>${esc(CONFIG.resultsBase)}${esc(VIEW.index)}</code>.`;
}

/* ============================================================================
   Test machines
============================================================================ */
const RUNNER_LABEL = { idle: 'Idle', busy: 'Running a job', offline: 'Offline' };
const RUNNER_STALE_MIN = 40;
const RUNNER_REFRESH_MS = 2 * 60 * 1000;
let runnerStatus = null;
let runnersTried = false;

const runnerState = (r) => (r.status !== 'online' ? 'offline' : r.busy ? 'busy' : 'idle');

async function loadRunners() {
  try {
    const res = await fetch(CONFIG.runnersUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    runnerStatus = await res.json();
  } catch (err) {
    // A failed refresh keeps the last good status; its age shows how old it is.
  }
  runnersTried = true;
  renderRunners();
}

function renderRunners() {
  if (!runnersTried) return;
  const list = $('#runner-list');
  const note = $('#runners-checked');
  $('#runners').hidden = false;
  if (!runnerStatus) {
    list.innerHTML = '';
    note.textContent = 'Machine status could not be loaded.';
    note.classList.add('is-stale');
    return;
  }
  list.innerHTML = runnerStatus.runners.length
    ? runnerStatus.runners.map((r) => {
      const st = runnerState(r);
      return `<li class="runner r-${st}" title="${esc(`Labels: ${r.labels.join(', ')}`)}">
        <span class="runner-dot" aria-hidden="true"></span>
        <span class="runner-name">${esc(r.name)}</span><span class="runner-state">${RUNNER_LABEL[st]}</span></li>`;
    }).join('')
    : '<li class="runner-none">No runners registered</li>';
  // Runner status is real time even when the results are sample data, so it never uses refNow.
  const now = new Date();
  const stale = (now - new Date(runnerStatus.checked_at)) / 60000 > RUNNER_STALE_MIN;
  note.textContent = `Checked ${ago(runnerStatus.checked_at, now)}.`
    + (stale ? ' The Runner status workflow may have stopped, or its token expired.' : '');
  note.classList.toggle('is-stale', stale);
}

/* ============================================================================
   Chart
============================================================================ */
function niceTicks(lo, hi, n) {
  const raw = (hi - lo) / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out = [];
  for (let v = Math.floor(lo / step) * step; v <= Math.ceil(hi / step) * step + step / 2; v += step) out.push(+v.toFixed(10));
  return out;
}

function renderMetricSwitch() {
  const metric = METRICS[state.metric];
  $('#metric-switch').innerHTML = Object.entries(METRICS)
    .map(([k, m]) => `<button type="button" data-metric="${k}" aria-pressed="${k === state.metric}">${m.button}</button>`)
    .join('');
  $('#project-select').innerHTML = projectOptionsHTML();
  $('#project-pick').hidden = !metric.perProject || !DATA.projects.length;
  $('#trend-note').textContent = metric.note;
}

function projectOptionsHTML() {
  const option = (p) => `<option${p === state.project ? ' selected' : ''}>${esc(p)}</option>`;
  const repos = [...new Set(Object.values(DATA.projectSources))];
  if (repos.length < 2) return DATA.projects.map(option).join('');

  return repos.map((r) => `<optgroup label="${esc(repoName(r))}">${DATA.projects.filter((p) => DATA.projectSources[p] === r).map(option).join('')}</optgroup>`).join('');
}

const chartTitle = (metric) => (metric.perProject ? `${metric.button} of ${state.project}` : metric.button);

function renderLegend() {
  $('#legend').innerHTML = DATA.machines
    .map((m) => `<li>${machineMark(m.index, 11)}<span>${esc(m.id)}</span><span class="gpu">${esc(m.gpu)}</span></li>`)
    .join('')
    + '<li class="legend-gap"><svg width="22" height="10" aria-hidden="true"><line x1="1" y1="5" x2="21" y2="5"/></svg>Dotted: commits in between were not run</li>';
}

let chartCtx = null;
function renderChart() {
  const box = $('#chart');
  const metric = METRICS[state.metric];
  const val = (c, m) => (isFinished(c.runs[m.id]) ? metric.get(c.runs[m.id], state.project) : undefined);
  const list = DATA.commits.slice().reverse().filter((c) => DATA.machines.some((m) => val(c, m) != null));
  renderChartTable(list, val, metric);
  if (!list.length) {
    box.innerHTML = `<p class="chart-empty">${metric.perProject && state.project
      ? `No finished run has ${esc(metric.button.toLowerCase())} of ${esc(state.project)} yet.`
      : 'The chart fills in once a run finishes.'}</p>`;
    return;
  }
  const W = Math.max(280, box.clientWidth);
  const narrow = W < 640;
  const H = narrow ? 200 : 240;
  const M = { l: 44, r: narrow ? 12 : 104, t: 14, b: 30 };
  const pw = W - M.l - M.r, ph = H - M.t - M.b;

  const vals = [];
  list.forEach((c) => DATA.machines.forEach((m) => { const v = val(c, m); if (v != null) vals.push(v); }));
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = (hi - lo) * 0.08 || Math.abs(hi) * 0.1 || 1;
  const ticks = niceTicks(Math.max(0, lo - pad), hi + pad, 4);
  lo = ticks[0]; hi = ticks[ticks.length - 1];
  const dx = list.length > 1 ? pw / (list.length - 1) : 0;
  const x = (i) => (list.length === 1 ? M.l + pw / 2 : M.l + i * dx);
  const y = (v) => M.t + ph - ((v - lo) / (hi - lo)) * ph;

  let svg = '';
  for (const t of ticks) {
    svg += `<line class="grid" x1="${M.l}" x2="${M.l + pw}" y1="${y(t)}" y2="${y(t)}"/>`;
    svg += `<text class="tick" x="${M.l - 8}" y="${y(t)}" dy="0.32em" text-anchor="end">${metric.tick(t)}</text>`;
  }
  svg += `<line class="axis" x1="${M.l}" x2="${M.l + pw}" y1="${M.t + ph}" y2="${M.t + ph}"/>`;
  const step = dx ? Math.max(1, Math.ceil(60 / dx)) : 1;
  list.forEach((c, i) => {
    if ((list.length - 1 - i) % step === 0) svg += `<text class="xtick" x="${x(i)}" y="${H - 8}" text-anchor="middle">${short(c.sha)}</text>`;
  });

  const ends = [];
  for (const m of DATA.machines) {
    const color = `var(--series-${(m.index % 3) + 1})`;
    const pts = list.map((c, i) => ({ i, v: val(c, m) })).filter((p) => p.v != null);
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k];
      svg += `<line class="series-line${b.i - a.i > 1 ? ' gap' : ''}" style="stroke:${color}" x1="${x(a.i)}" y1="${y(a.v)}" x2="${x(b.i)}" y2="${y(b.v)}"/>`;
    }
    svg += `<g class="mk-svg" style="fill:${color}">${pts.map((p) => shapePath(m.index, x(p.i), y(p.v), 9)).join('')}</g>`;
    if (pts.length) ends.push({ m, y: y(pts[pts.length - 1].v) });
  }
  if (!narrow) {
    ends.sort((a, b) => a.y - b.y);
    for (let k = 1; k < ends.length; k++) ends[k].y = Math.max(ends[k].y, ends[k - 1].y + 16);
    for (const e of ends) {
      svg += `<g style="fill:var(--series-${(e.m.index % 3) + 1})">${shapePath(e.m.index, M.l + pw + 16, e.y, 8)}</g>`;
      svg += `<text class="end-label" x="${M.l + pw + 26}" y="${e.y}" dy="0.33em">${esc(e.m.id)}</text>`;
    }
  }
  svg += `<line class="crosshair" id="xh" x1="0" x2="0" y1="${M.t}" y2="${M.t + ph}" visibility="hidden"/>`;
  svg += `<g id="hover-dots"></g>`;
  svg += `<rect class="hit" x="${M.l - 12}" y="0" width="${pw + 24}" height="${H}"/>`;

  box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" tabindex="0" role="img"
      aria-label="${esc(chartTitle(metric))} per commit for each machine. Use left and right arrow keys to read values, Enter to open the commit.">${svg}</svg>
    <div class="chart-tip" id="chart-tip" hidden></div>`;
  chartCtx = { list, x, y, val, metric, M, pw, dx, W, hovered: null };
  bindChart();
}

function bindChart() {
  const svg = $('#chart svg');
  const tip = $('#chart-tip');
  const ctx = chartCtx;
  const show = (i) => {
    ctx.hovered = i;
    const c = ctx.list[i];
    const xh = $('#xh');
    xh.setAttribute('x1', ctx.x(i)); xh.setAttribute('x2', ctx.x(i)); xh.setAttribute('visibility', 'visible');
    let dots = '', rows = '';
    for (const m of DATA.machines) {
      const v = ctx.val(c, m);
      const r = c.runs[m.id];
      if (v != null) dots += `<g class="mk-svg" style="fill:var(--series-${(m.index % 3) + 1})">${shapePath(m.index, ctx.x(i), ctx.y(v), 12)}</g>`;
      const valText = v != null ? ctx.metric.fmt(v) : r ? STATUS_LABEL[r.status] : 'Not run';
      rows += `<div class="tip-row">${machineMark(m.index)}<span>${esc(m.id)}</span>${r?.status === 'failed' ? '<span class="tip-fail">failed</span>' : ''}<b>${valText}</b></div>`;
    }
    $('#hover-dots').innerHTML = dots;
    tip.innerHTML = `<div><span class="sha">${short(c.sha)}</span> <span class="tip-date">${esc(fmtDate(c.date))}</span></div>
      <div class="tip-msg">${esc(c.message)}</div>${rows}<div class="tip-hint">Click to open this commit</div>`;
    tip.hidden = false;
    const tw = tip.offsetWidth;
    let left = ctx.x(i) + 14;
    if (left + tw > ctx.W) left = ctx.x(i) - tw - 14;
    tip.style.left = `${Math.max(0, left)}px`;
  };
  const hide = () => {
    ctx.hovered = null;
    tip.hidden = true;
    $('#xh').setAttribute('visibility', 'hidden');
    $('#hover-dots').innerHTML = '';
  };
  const indexAt = (clientX) => {
    const r = svg.getBoundingClientRect();
    if (!ctx.dx) return 0;
    return clamp(Math.round((clientX - r.left - ctx.M.l) / ctx.dx), 0, ctx.list.length - 1);
  };
  svg.addEventListener('pointermove', (e) => show(indexAt(e.clientX)));
  svg.addEventListener('pointerleave', hide);
  svg.addEventListener('click', (e) => openCommit(ctx.list[indexAt(e.clientX)].sha));
  svg.addEventListener('focus', () => show(ctx.list.length - 1));
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    const i = ctx.hovered ?? ctx.list.length - 1;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(clamp(i - 1, 0, ctx.list.length - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(clamp(i + 1, 0, ctx.list.length - 1)); }
    if (e.key === 'Enter') { e.preventDefault(); openCommit(ctx.list[i].sha); }
  });
}

function renderChartTable(list, val, metric) {
  const head = `<tr><th>Commit</th>${DATA.machines.map((m) => `<th>${esc(m.id)}</th>`).join('')}</tr>`;
  const body = list.slice().reverse()
    .map((c) => `<tr><td><span class="sha">${short(c.sha)}</span> ${esc(c.message)}</td>${DATA.machines
      .map((m) => { const v = val(c, m); return `<td>${v != null ? metric.fmt(v) : '–'}</td>`; }).join('')}</tr>`)
    .join('');
  $('#chart-table').innerHTML = `<table><caption class="sr-only">${esc(chartTitle(metric))} per commit</caption><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

/* ============================================================================
   Commit matrix
============================================================================ */
function renderMatrixHead() {
  const n = DATA.machines.length;
  $('#matrix').style.setProperty('--m', n);
  $('#matrix-cols').innerHTML = `<col>${'<col style="width:140px">'.repeat(n)}<col style="width:392px">`;
  $('#matrix-head').innerHTML = `<tr>
    <th scope="col"><span class="th-title">Commit</span></th>
    ${DATA.machines.map((m) => `<th scope="col" title="${esc(`${m.os}, ${m.cpu}, ${m.gpu}, ${m.ram_gb} GB RAM`)}">
      <span class="th-machine">${machineMark(m.index, 11)}${esc(m.id)}</span>
      <span class="th-spec">${esc(m.gpu)}</span></th>`).join('')}
    <th scope="col"><span class="th-title">Screenshots</span></th></tr>`;
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  return DATA.commits.filter((c) => {
    if (state.filter === 'runs' && !Object.keys(c.runs).length) return false;
    if (state.filter === 'failed' && c.state !== 'failed') return false;
    if (!q) return true;
    return c.message.toLowerCase().includes(q) || c.sha.startsWith(q) || c.author.toLowerCase().includes(q);
  });
}

function renderFilters() {
  const counts = {
    all: DATA.commits.length,
    runs: DATA.commits.filter((c) => Object.keys(c.runs).length).length,
    failed: DATA.commits.filter((c) => c.state === 'failed').length,
  };
  const label = { all: 'All commits', runs: 'With runs', failed: 'Failed' };
  $('#filters').innerHTML = Object.keys(label)
    .map((k) => `<button type="button" data-filter="${k}" aria-pressed="${state.filter === k}">${label[k]}<span class="count">${counts[k]}</span></button>`)
    .join('');
}

function statusCell(c, m) {
  const r = c.runs[m.id];
  const st = r ? r.status : 'none';
  let sub = '';
  if (isFinished(r) && r.duration_sec != null) sub = fmtDur(r.duration_sec);
  else if (st === 'running' && r.started) sub = `for ${fmtDur((refNow() - new Date(r.started)) / 1000)}`;
  return `<td class="c-status s-${st}">
    <span class="cell-machine">${machineMark(m.index)}${esc(m.id)}</span>
    <span class="status">${statusIcon(st)}<span class="status-label">${STATUS_LABEL[st]}</span></span>
    ${sub ? `<span class="status-sub">${sub}</span>` : ''}</td>`;
}

function filmMachine(c) {
  const withShots = DATA.machines.filter((m) => c.runs[m.id]?.screenshots?.length);
  return withShots.find((m) => c.runs[m.id].screenshots.some((s) => s.status === 'failed')) || withShots[0];
}

function filmstrip(c) {
  const m = filmMachine(c);
  if (!m) return `<span class="film-empty">${Object.keys(c.runs).length ? 'Not captured yet' : '–'}</span>`;
  const shots = c.runs[m.id].screenshots;
  return `<div class="film">${shots.map((s, i) => `<button class="thumb${s.status === 'failed' ? ' is-failed' : ''}" type="button"
      data-shots="${c.sha}|${m.id}" data-i="${i}" aria-label="Open ${esc(s.scene)} screenshot from ${esc(m.id)}${s.status === 'failed' ? ', failed' : ''}"
      title="${esc(s.scene)}${s.status === 'failed' ? ' (failed)' : ''}"><img src="${esc(s.thumb)}" alt="" loading="lazy" width="56" height="32"></button>`).join('')}</div>
    <div class="film-src">${machineMark(m.index)}From ${esc(m.id)}</div>`;
}

const chevron = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5L8 6l-3.5 3.5"/></svg>';

function rowHTML(c) {
  const open = state.open.has(c.sha);
  const id = `detail-${short(c.sha)}`;
  let html = `<tr class="commit-row${open ? ' is-open' : ''}" data-sha="${c.sha}">
    <td class="c-commit">
      <button class="row-toggle" type="button" aria-expanded="${open}" aria-controls="${id}" data-toggle="${c.sha}">
        ${chevron}<span class="sha">${short(c.sha)}</span><span class="msg" title="${esc(c.message)}">${esc(c.message)}</span>
      </button>
      <div class="meta">${esc(c.author)}, <time datetime="${c.date}" title="${esc(fmtDate(c.date))}">${ago(c.date)}</time></div>
    </td>
    ${DATA.machines.map((m) => statusCell(c, m)).join('')}
    <td class="c-film">${filmstrip(c)}</td>
  </tr>`;
  if (open) html += `<tr class="detail-row" id="${id}"><td colspan="${DATA.machines.length + 2}">${detailHTML(c)}</td></tr>`;
  return html;
}

function renderRows(focusSel) {
  const rows = filtered();
  const tbody = $('#rows');
  if (!rows.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${DATA.machines.length + 2}">
      ${state.query ? `No commits match “${esc(state.query)}”.` : 'No commits match this filter.'}
      <button class="theme-btn" type="button" data-clear>Show all commits</button></td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(rowHTML).join('');
  if (focusSel) $(focusSel)?.focus({ preventScroll: true });
}

/* ============================================================================
   Detail panel
============================================================================ */
function defaultTab(c) {
  const ms = DATA.machines;
  return (ms.find((m) => c.runs[m.id]?.status === 'failed')
    || ms.find((m) => isFinished(c.runs[m.id]))
    || ms.find((m) => c.runs[m.id])
    || ms[0]).id;
}

function detailHTML(c) {
  if (!Object.keys(c.runs).length) {
    return `<div class="detail detail-empty"><p class="notice">No runs for this commit.
      <span class="sub">To get results for it, start the workflow by hand from the Actions tab of the private repo and enter this SHA.</span></p></div>`;
  }
  const compare = !!state.compare[c.sha];
  const active = state.tab[c.sha] || defaultTab(c);
  const canCompare = DATA.machines.filter((m) => c.runs[m.id]?.screenshots?.length).length >= 2;
  const tabs = DATA.machines.map((m) => {
    const st = c.runs[m.id]?.status || 'none';
    const sel = !compare && m.id === active;
    return `<button class="tab${sel ? ' is-active' : ''}" type="button" role="tab" aria-selected="${sel}" data-tab="${c.sha}|${m.id}">
      ${machineMark(m.index)}<span>${esc(m.id)}</span>${statusIcon(st)}<span class="sr-only">${STATUS_LABEL[st]}</span></button>`;
  }).join('');
  const btn = `<button class="compare-btn" type="button" aria-pressed="${compare}" data-compare="${c.sha}"
    ${canCompare ? '' : 'disabled title="Needs screenshots from at least two machines"'}>Compare machines</button>`;
  const body = compare ? compareHTML(c) : machineHTML(c, DATA.machines.find((m) => m.id === active));
  return `<div class="detail"><div class="detail-bar"><div class="tabs" role="tablist" aria-label="Machines">${tabs}</div>${btn}</div>${body}</div>`;
}

// Publish job names the build test "Build (Release)", every other test is a project.
const isBuildTest = (t) => t.name.startsWith('Build (');

function buildHTML(run) {
  return run.tests.filter(isBuildTest).map((t) => `<p class="build-line">${statusIcon(t.status)}<span>${esc(t.name)}</span>
    <span class="build-time">${t.ms != null ? fmtMs(t.ms) : STATUS_LABEL[t.status]}</span></p>
    ${t.message ? `<p class="build-msg">${esc(t.message)}</p>` : ''}`).join('');
}

// Changes under these are left gray, they are within run to run noise of a median of 3 runs, measured on Simple_Scene.
const GRAY_BELOW_PCT = { fps: 4, frameP95: 6, load: 4 };

// Change from the previous result of the project on this machine.
function changeHTML(value, previousValue, previousSha, higherIsBetter, grayBelowPct, fmt) {
  if (value == null || previousValue == null) return '';

  const pct = Math.round(((value - previousValue) / previousValue) * 1000) / 10;
  const better = higherIsBetter ? pct > 0 : pct < 0;
  const tone = Math.abs(pct) < grayBelowPct ? '' : better ? ' better' : ' worse';
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : '±';
  return `<span class="change${tone}" title="${esc(fmt(previousValue))} in ${short(previousSha)}">${sign}${Math.abs(pct).toFixed(1)}%</span>`;
}

// Values of a project are medians of its runs, this tooltip shows the range of the runs.
function rangeTitle(t, key, fmt) {
  const values = (t.passes || []).map((p) => p[key]).filter((v) => v != null);
  if (values.length < 2) return '';

  return ` title="${esc(`${fmt(Math.min(...values))} to ${fmt(Math.max(...values))} over ${values.length} runs`)}"`;
}

// With several project repos, projects and screenshots are grouped by repo, in the order of project_sources.
function sourceGroups(run, items, sourceOf) {
  const sources = run.project_sources || [];
  if (sources.length < 2) return [{ source: null, items }];

  return sources.map((s) => ({ source: s, items: items.filter((it) => sourceOf(it) === s.repository) })).filter((g) => g.items.length);
}

function projectsHTML(run) {
  const projects = run.tests.filter((t) => !isBuildTest(t));
  if (!projects.length) return '';

  const passed = projects.filter((t) => t.status === 'passed').length;
  const failed = projects.filter((t) => t.status === 'failed').length;
  const pending = projects.filter((t) => t.status === 'pending').length;
  let count = `${passed} of ${projects.length} passed`;
  if (failed) count += `, ${failed} failed`;
  if (pending) count += `, ${pending} pending`;

  const projectRow = (t) => {
    // For a project that did not load, ms is its run time, not load time.
    const loadMs = t.status === 'passed' ? t.ms : null;
    const load = loadMs != null ? fmtMs(loadMs) : '–';
    const previous = run.previous?.[t.name];
    // Files of the project differ from its previous result, so a change in numbers may come from the project, not from the engine.
    const changed = previous?.tree && t.tree && previous.tree !== t.tree
      ? ` <span class="p-changed" title="Files of this project changed since ${short(previous.sha)}">changed</span>` : '';
    const fmtFps = (v) => `${v.toFixed(1)} fps`;
    const fmtFrameMs = (v) => `${v.toFixed(2)} ms`;
    const fpsChange = changeHTML(t.fps_avg, previous?.fps_avg, previous?.sha, true, GRAY_BELOW_PCT.fps, fmtFps);
    const p95Change = changeHTML(t.frame_ms_p95, previous?.frame_ms_p95, previous?.sha, false, GRAY_BELOW_PCT.frameP95, fmtFrameMs);
    const loadChange = changeHTML(loadMs, previous?.ms, previous?.sha, false, GRAY_BELOW_PCT.load, fmtMs);
    // Message of a passed project is a note, for example that frame time did not settle.
    const message = t.message
      ? `<tr class="p-message-row"><td></td><td colspan="4" class="p-message${t.status === 'passed' ? ' is-note' : ''}">${esc(t.message)}</td></tr>`
      : '';
    return `<tr class="p-${t.status}${t.message ? ' has-message' : ''}">
      <td class="p-icon">${statusIcon(t.status)}<span class="sr-only">${STATUS_LABEL[t.status]}</span></td>
      <th scope="row">${esc(t.name).replace(/_/g, '_<wbr>')}${changed}</th>
      <td class="p-fps"${rangeTitle(t, 'fps_avg', fmtFps)}>${t.fps_avg != null ? t.fps_avg.toFixed(1) : '–'}${fpsChange}</td>
      <td${rangeTitle(t, 'frame_ms_p95', fmtFrameMs)}>${t.frame_ms_p95 != null ? fmtFrameMs(t.frame_ms_p95) : '–'}${p95Change}</td>
      <td${rangeTitle(t, 'load_ms', fmtMs)}>${load}${loadChange}</td></tr>${message}`;
  };
  const body = sourceGroups(run, projects, (t) => t.source).map((g) => {
    const header = g.source
      ? `<tr class="p-group"><th colspan="5" scope="rowgroup">${esc(repoName(g.source.repository))}<span class="sha">${short(g.source.commit)}</span>`
        + `<span class="count">${g.items.length} ${g.items.length === 1 ? 'project' : 'projects'}</span></th></tr>`
      : '';
    return `<tbody>${header}${g.items.map(projectRow).join('')}</tbody>`;
  }).join('');

  const passCount = Math.max(0, ...projects.map((t) => t.passes?.length || 0));
  const medians = passCount > 1 ? ` Values are medians of ${passCount} runs, hover a value to see the range.` : '';
  const note = (run.previousSha
    ? `Changes are compared with the previous run on this machine, <span class="sha">${short(run.previousSha)}</span>.`
    : 'First run on this machine, there is nothing to compare with yet.') + medians;
  return `<h3>Projects <span class="count">${count}</span></h3>
    <p class="projects-note">${note}</p>
    <div class="projects-wrap"><table class="projects">
      <thead><tr><th><span class="sr-only">Status</span></th><th scope="col">Project</th><th scope="col">Average FPS</th>
        <th scope="col" title="95th percentile frame time, 95% of frames were faster">p95 frame time</th><th scope="col">Load time</th></tr></thead>
      ${body}
    </table></div>`;
}

function shotFigure(s, key, i, m, showScene = true) {
  const failed = s.status === 'failed';
  const diffTitle = s.diff_against ? ` title="Compared with ${short(s.diff_against)}"` : s.reference ? ' title="Compared with the reference image"' : '';
  const diffText = s.reference_created ? 'New reference' : s.diff_pct != null ? `${s.diff_pct.toFixed(2)}% different` : '';
  return `<figure class="shot${failed ? ' is-failed' : ''}">
    <button type="button" class="shot-btn" data-shots="${key}" data-i="${i}" aria-label="Open ${esc(s.scene)} screenshot from ${esc(m.id)}">
      <img src="${esc(s.file)}" alt="${esc(s.scene)} on ${esc(m.id)}" loading="lazy" width="960" height="540"></button>
    <figcaption>${showScene ? `<span>${esc(s.scene)}</span>` : ''}
      <span class="diff${failed ? ' is-failed' : ''}"${diffTitle}>${failed ? statusIcon('failed') : ''}${diffText}</span></figcaption>
  </figure>`;
}

function galleryHTML(run, key, m) {
  const sourceOfShot = (s) => run.tests.find((t) => t.name === s.scene)?.source;
  const indexed = run.screenshots.map((s, i) => ({ s, i }));
  return sourceGroups(run, indexed, ({ s }) => sourceOfShot(s)).map((g) =>
    (g.source ? `<h4 class="gallery-group">${esc(repoName(g.source.repository))}</h4>` : '')
    + g.items.map(({ s, i }) => shotFigure(s, key, i, m)).join('')).join('');
}

function machineHTML(c, m) {
  const run = c.runs[m.id];
  const spec = `<p class="spec">${esc(m.os)}, ${esc(m.cpu)}, ${esc(m.gpu)}, ${m.ram_gb} GB RAM, driver ${esc(m.driver)}</p>`;
  if (!run) return `${spec}<p class="notice">This commit was not run on ${esc(m.id)}.</p>`;
  if (run.status === 'queued') {
    return `${spec}<p class="notice">Waiting for ${esc(m.id)} to pick up this job.
      <span class="sub">If it stays queued, check that the runner service is running on that machine.</span></p>`;
  }
  const link = run.run_url ? ` <a href="${esc(run.run_url)}" target="_blank" rel="noopener">Open run on GitHub</a>` : '';
  const when = run.status === 'running'
    ? `Started ${fmtDate(run.started)}, running for ${fmtDur((refNow() - new Date(run.started)) / 1000)}.`
    : `Started ${fmtDate(run.started)}, took ${fmtDur(run.duration_sec)}.`;
  const sources = run.project_sources || [];
  const projects = sources.length
    ? ` Projects: ${sources.map((s) => `${esc(repoName(s.repository))} at <span class="sha">${short(s.commit)}</span>`).join(', ')}.`
    : '';
  const engine = run.engine_commit ? ` Engine at <span class="sha">${short(run.engine_commit)}</span>.` : '';
  const key = `${c.sha}|${m.id}`;
  const pendingShots = run.tests.filter((t) => t.status === 'pending' && t.name.startsWith('Screenshot')).length;
  const gallery = galleryHTML(run, key, m)
    + Array.from({ length: pendingShots }, () => '<div class="shot"><div class="shot-pending">Not captured yet</div></div>').join('');
  return `<div class="machine-view">
    <div>
      ${spec}
      <p class="run-line">${when}${projects}${engine}${link}</p>
      ${buildHTML(run)}
      ${projectsHTML(run)}
    </div>
    <div>
      <h3>Screenshots <span class="count">${run.screenshots.length}${pendingShots ? ` of ${run.screenshots.length + pendingShots}` : ''}</span></h3>
      <div class="gallery">${gallery || '<p class="notice">No screenshots in this run.</p>'}</div>
    </div>
  </div>`;
}

function compareItems(c) {
  const ms = DATA.machines.filter((m) => c.runs[m.id]?.screenshots?.length);
  const scenes = [];
  for (const m of ms) for (const s of c.runs[m.id].screenshots) if (!scenes.includes(s.scene)) scenes.push(s.scene);
  const grid = scenes.map((scene) => ms.map((m) => {
    const s = c.runs[m.id].screenshots.find((x) => x.scene === scene);
    return s ? { ...s, machine: m.id, sha: c.sha } : null;
  }));
  return { ms, scenes, grid, flat: grid.flat().filter(Boolean) };
}

function compareHTML(c) {
  const { ms, scenes, grid, flat } = compareItems(c);
  const key = `${c.sha}|compare`;
  let html = '<div></div>' + ms.map((m) => `<div class="c-head">${machineMark(m.index)}${esc(m.id)} <small>${esc(m.gpu)}</small></div>`).join('');
  scenes.forEach((scene, r) => {
    html += `<div class="c-scene">${esc(scene)}</div>`;
    grid[r].forEach((s, k) => {
      html += s ? shotFigure(s, key, flat.indexOf(s), ms[k], false) : '<div class="c-missing">Not captured</div>';
    });
  });
  return `<div class="compare-wrap"><div class="compare" style="--cols:${ms.length}">${html}</div></div>`;
}

/* ============================================================================
   Lightbox
============================================================================ */
const lb = { items: [], i: 0 };
function itemsFor(key) {
  const [sha, mid] = key.split('|');
  const c = DATA.commits.find((x) => x.sha === sha);
  if (mid === 'compare') return compareItems(c).flat;
  return c.runs[mid].screenshots.map((s) => ({ ...s, machine: mid, sha }));
}
function showLightboxItem() {
  const it = lb.items[lb.i];
  const img = $('#lb-img');
  img.src = it.file;
  img.alt = `${it.scene} on ${it.machine}`;
  $('#lb-caption').textContent = `${it.scene}, ${it.machine}`;
  $('#lb-count').textContent = `${lb.i + 1} of ${lb.items.length}`;
  const failed = it.status === 'failed';
  const reference = it.diff_against ? `commit <span class="sha">${short(it.diff_against)}</span>` : 'the reference image';
  $('#lb-detail').innerHTML = `Commit <span class="sha">${short(it.sha)}</span>. `
    + (it.diff_pct != null ? `<span class="${failed ? 'bad' : ''}">${it.diff_pct.toFixed(2)}% of pixels different from ${reference}${failed ? ', failed' : ''}.</span>` : '')
    + (it.reference_created ? 'This screenshot became the reference image of the project.' : '')
    + (it.difference ? ` <a href="${esc(it.difference)}" target="_blank" rel="noopener">Show changed pixels</a>.` : '')
    + (it.reference ? ` <a href="${esc(it.reference)}" target="_blank" rel="noopener">Open reference</a>.` : '')
    + ' Use the arrow keys to move between screenshots.';
  const multi = lb.items.length > 1;
  document.querySelectorAll('.lb-nav').forEach((b) => { b.disabled = !multi; });
}
function openLightbox(key, i) {
  lb.items = itemsFor(key);
  lb.i = i;
  showLightboxItem();
  const d = $('#lightbox');
  if (!d.open) d.showModal();
}
function stepLightbox(d) {
  if (lb.items.length < 2) return;
  lb.i = (lb.i + d + lb.items.length) % lb.items.length;
  showLightboxItem();
}

/* ============================================================================
   Actions
============================================================================ */
function openCommit(sha) {
  if (!filtered().some((c) => c.sha === sha)) {
    state.filter = 'all'; state.query = ''; $('#search').value = '';
    renderFilters();
  }
  state.open.add(sha);
  const sel = `[data-toggle="${sha}"]`;
  renderRows(sel);
  $(`tr[data-sha="${sha}"]`)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function bindEvents() {
  $('#rows').addEventListener('click', (e) => {
    const shot = e.target.closest('[data-shots]');
    if (shot) { openLightbox(shot.dataset.shots, +shot.dataset.i); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      const [sha, mid] = tab.dataset.tab.split('|');
      state.tab[sha] = mid; state.compare[sha] = false;
      renderRows(`[data-tab="${sha}|${mid}"]`); return;
    }
    const cmp = e.target.closest('[data-compare]');
    if (cmp) {
      const sha = cmp.dataset.compare;
      state.compare[sha] = !state.compare[sha];
      renderRows(`[data-compare="${sha}"]`); return;
    }
    if (e.target.closest('[data-clear]')) {
      state.filter = 'all'; state.query = ''; $('#search').value = '';
      renderFilters(); renderRows(); return;
    }
    if (e.target.closest('a, .detail-row')) return;
    const row = e.target.closest('tr.commit-row');
    if (row) {
      const sha = row.dataset.sha;
      state.open.has(sha) ? state.open.delete(sha) : state.open.add(sha);
      renderRows(`[data-toggle="${sha}"]`);
    }
  });

  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    state.filter = b.dataset.filter;
    renderFilters(); renderRows();
  });
  $('#search').addEventListener('input', (e) => { state.query = e.target.value; renderRows(); });
  $('#metric-switch').addEventListener('click', (e) => {
    const b = e.target.closest('[data-metric]');
    if (!b) return;
    state.metric = b.dataset.metric;
    renderMetricSwitch(); renderChart();
  });
  $('#project-select').addEventListener('change', (e) => { state.project = e.target.value; renderChart(); });
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (o) openCommit(o.dataset.open);
  });

  const d = $('#lightbox');
  d.addEventListener('click', (e) => {
    if (e.target === d) { d.close(); return; }
    const b = e.target.closest('[data-lb]');
    if (!b) return;
    if (b.dataset.lb === 'close') d.close();
    if (b.dataset.lb === 'prev') stepLightbox(-1);
    if (b.dataset.lb === 'next') stepLightbox(1);
  });
  d.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); }
  });

  // Theme: Auto (follows Windows setting), Light, Dark.
  const themes = ['auto', 'light', 'dark'];
  const themeBtn = $('#theme-btn');
  let theme = document.documentElement.getAttribute('data-theme') || 'auto';
  const paintThemeBtn = () => { themeBtn.textContent = `Theme: ${theme[0].toUpperCase()}${theme.slice(1)}`; };
  paintThemeBtn();
  themeBtn.addEventListener('click', () => {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length];
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ci-theme', theme); } catch (err) { /* storage can be blocked; theme still applies */ }
    paintThemeBtn();
  });

  let raf = 0, lastW = $('#chart').clientWidth;
  new ResizeObserver(() => {
    const w = $('#chart').clientWidth;
    if (w === lastW) return;
    lastW = w;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderChart);
  }).observe($('#chart'));
}

/* ============================================================================
   Start
============================================================================ */
(async function start() {
  if (CONFIG.runnersUrl) {
    loadRunners();
    setInterval(loadRunners, RUNNER_REFRESH_MS);
  }
  try {
    DATA = prepare(await loadData());
  } catch (err) {
    $('#summary').textContent = `Results could not be loaded. ${err.message}`;
    return;
  }
  if (CONFIG.source === 'sample' && DATA.generated_at) {
    const t = new Date(DATA.generated_at);
    refNow = () => t; // keep the sample's "2 hours ago" text stable whenever you open it
  }
  state.project = DATA.projects[0] ?? null;
  const firstFinished = DATA.commits.find((c) => Object.values(c.runs).some(isFinished));
  if (firstFinished) state.open.add(firstFinished.sha);

  renderHeader();
  renderRunners();
  renderMetricSwitch();
  renderLegend();
  renderMatrixHead();
  renderFilters();
  renderRows();
  renderChart();
  bindEvents();
})();
