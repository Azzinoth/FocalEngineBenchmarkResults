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
                        "memory_mb": 812.4, "memory_start_mb": 301.2, "memory_peak_mb": 954.0, "message": "..." } ],
           ("ms" of a project is its load time when it loaded, its run time when it did not,
            memory is of the process: with the project loaded, before loading, and the largest since start,
            newer results also have "gpu_load_before_pct" and "cpu_load_before_pct", load of the machine before the runs, the highest of them)
           "screenshots": [ { "scene": "Terrain", "file": "runs/<sha>/lab-win-01/01.jpg",
                              "thumb": "runs/<sha>/lab-win-01/thumbs/01.jpg",
                              "status": "passed", "diff_pct": 0.3, "reference": "references/<project ID>.png",
                              "difference": "runs/<sha>/lab-win-01/differences/01.jpg" } ]
           ("reference_created": true instead of diff_pct when screenshot became the reference,
            "size": "1920x1061", "reference_size": "1920x1080" instead of diff_pct when sizes differ and nothing was compared,
            older results have "diff_against": "<sha>" instead of "reference")
         }
       }
     }
   }
   Editor view reads editor/index.json in the same format, its commits are editor commits
   and each run has "engine_commit", the engine commit that editor commit was built with.
   Results of a commit on a machine are kept by suite, "runs" has a list of them: [ { "suite": "<name>", "kind": "projects" | "scripted" | "gtest", ... } ].
   A suite is a repo with projects, which are opened and measured, a repo with scripted tests, or console tests of the commit itself. A scripted test has
   "checks": [ { "name", "status", "actual", "expected", "message" } ] and "metrics": { name: number } instead of measured values,
   images that tests captured are in "screenshots" with "test" and "image" names. Console tests are shown as tests too:
   every group of tests is a test, its tests are checks with only "name", "status" and "message". The page shows the suites as one run.
   A result from before suites were kept apart is one object without "suite", it is shown the same way.
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
};

// Page address ?view=editor opens editor view, any other address opens engine view.
const REQUESTED_VIEW = new URLSearchParams(window.location.search).get('view');
const VIEW_ID = Object.hasOwn(CONFIG.views, REQUESTED_VIEW ?? '') ? REQUESTED_VIEW : 'engine';
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
// There are 8 colors, --series-1 to --series-8 of style.css, and 8 shapes, so the first 8 machines differ in both.
// From the 9th machine on colors repeat, with the shape shifted by one, so a machine still has its own pair.
const SERIES_COUNT = 8;
const seriesColor = (i) => `var(--series-${(i % SERIES_COUNT) + 1})`;

function shapePath(i, cx, cy, s) {
  const k = (i + Math.floor(i / SERIES_COUNT)) % SERIES_COUNT;
  const points = (list) => `<polygon points="${list.map(([px, py]) => `${(cx + px * s).toFixed(2)},${(cy + py * s).toFixed(2)}`).join(' ')}"/>`;
  // Half of arm length and half of arm width of plus and cross.
  const a = 0.6, w = 0.23;
  const plus = [[-w, -a], [w, -a], [w, -w], [a, -w], [a, w], [w, w], [w, a], [-w, a], [-w, w], [-a, w], [-a, -w], [-w, -w]];
  switch (k) {
    case 0: return `<circle cx="${cx}" cy="${cy}" r="${s / 2}"/>`;
    case 1: return `<rect x="${cx - s * 0.43}" y="${cy - s * 0.43}" width="${s * 0.86}" height="${s * 0.86}" rx="1"/>`;
    case 2: return points([[0, -0.6], [0.6, 0], [0, 0.6], [-0.6, 0]]);
    case 3: return points([[0, -0.58], [0.6, 0.46], [-0.6, 0.46]]);
    case 4: return points([[0, 0.58], [0.6, -0.46], [-0.6, -0.46]]);
    case 5: return points(plus);
    case 6: return `<g transform="rotate(45 ${cx} ${cy})">${points(plus)}</g>`;
    default: return points([0, 1, 2, 3, 4].map((n) => [0.58 * Math.sin((n * 2 * Math.PI) / 5), -0.58 * Math.cos((n * 2 * Math.PI) / 5)]));
  }
}
function machineMark(i, size = 10) {
  return `<svg class="mk" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" style="fill:${seriesColor(i)}">${shapePath(i, size / 2, size / 2, size - 1)}</svg>`;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function ago(iso) {
  const s = (new Date(iso) - refNow()) / 1000;
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
// Megabytes, from 1024 on shown as gigabytes.
function fmtMemory(megabytes) {
  return megabytes < 1024 ? `${Math.round(megabytes)} MB` : `${(megabytes / 1024).toFixed(2)} GB`;
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

// Value of a project result and the name of the same value in each of its runs.
const PASS_VALUE_KEYS = [['fps_avg', 'fps_avg'], ['frame_ms_median', 'frame_ms_median'], ['frame_ms_p95', 'frame_ms_p95'], ['ms', 'load_ms'],
  ['memory_mb', 'memory_mb'], ['memory_start_mb', 'memory_start_mb'], ['memory_peak_mb', 'memory_peak_mb']];

// Publish job names the build tests "Build (...)", every other test is a project or a scripted test.
const isBuildTest = (t) => t.name.startsWith('Build (');
// A scripted test has checks, a project has measured values.
const isScripted = (t) => t.kind === 'scripted' || t.checks !== undefined;

// Results of a commit on a machine are kept by suite, the page works with them as with one run.
function mergeSuites(results) {
  // A result from before suites were kept apart already has everything in it.
  if (results.length === 1 && !results[0].suite) return results[0];

  const byStart = [...results].sort((a, b) => new Date(a.started) - new Date(b.started));
  const latest = byStart[byStart.length - 1];
  // Suites that were run by one job have its times, so each job is counted once.
  const jobs = [...new Map(results.map((r) => [r.run_url, r])).values()];
  const tests = [];
  for (const r of results) {
    for (const t of r.tests || []) {
      // Project suites of one job share a build.
      if (isBuildTest(t) && tests.some((x) => x.name === t.name && x.ms === t.ms && x.status === t.status)) continue;

      tests.push(isBuildTest(t) ? t : { ...t, kind: r.kind });
    }
  }

  return {
    ...latest,
    status: results.some((r) => r.status === 'failed') ? 'failed' : latest.status,
    started: byStart[0].started,
    duration_sec: jobs.reduce((sum, r) => sum + (r.duration_sec || 0), 0),
    project_sources: results.flatMap((r) => (r.project_sources || []).map((source) => ({ ...source, kind: r.kind }))),
    // Builds first, as they are listed above projects and tests.
    tests: [...tests.filter(isBuildTest), ...tests.filter((t) => !isBuildTest(t))],
    screenshots: results.flatMap((r) => r.screenshots || []),
  };
}

function prepare(raw) {
  const base = CONFIG.source === 'sample' ? '' : CONFIG.resultsBase;
  const abs = (p) => (!p || /^https?:\/\//.test(p) || !base ? p : new URL(p, base).href);
  const machines = raw.machines.map((m, index) => ({ ...m, index }));
  const commits = raw.commits.map((c) => {
    // An index from before suites were kept apart has one result for a machine, not a list.
    const runs = Object.fromEntries(Object.entries(raw.runs[c.sha] || {}).map(([machine, results]) => [machine, mergeSuites([results].flat())]));
    for (const r of Object.values(runs)) {
      r.screenshots = (r.screenshots || []).map((s) => ({
        ...s, file: abs(s.file), thumb: abs(s.thumb || s.file), difference: abs(s.difference),
        reference: s.reference ? new URL(s.reference, CONFIG.pngBase).href : null,
      }));
      r.tests = r.tests || [];
      // Values of a project are averages of its runs, computed here from the runs, so results published with medians compare the same way.
      for (const t of r.tests) {
        if (!t.passes || t.passes.length < 2) continue;

        for (const [testKey, passKey] of PASS_VALUE_KEYS) {
          const values = t.passes.map((p) => p[passKey]).filter((v) => v != null);
          if (!values.length) continue;

          const average = values.reduce((sum, v) => sum + v, 0) / values.length;
          t[testKey] = testKey === 'ms' ? Math.round(average) : average;
        }
      }
      // Screenshots follow the order of project repos, as they are grouped on the page and in the screenshot viewer.
      const sourceOrder = (r.project_sources || []).map((s) => s.repository);
      if (sourceOrder.length > 1) {
        const sourceIndex = (s) => sourceOrder.indexOf(r.tests.find((t) => t.name === s.scene)?.source);
        r.screenshots.sort((a, b) => sourceIndex(a) - sourceIndex(b));
      }
    }
    return { ...c, runs };
  });
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
  // What the chart can be of: every project and every scripted test that has a result.
  const allTests = commits.flatMap((c) => Object.values(c.runs).flatMap((r) => r.tests.filter((t) => !isBuildTest(t))));
  const projects = [...new Set(allTests.map((t) => t.name))].sort();
  const scriptedNames = new Set(allTests.filter(isScripted).map((t) => t.name));
  // Repo of each project, from its newest result, for grouping the project picker of the chart.
  const projectSources = {};
  for (const c of commits) {
    for (const r of Object.values(c.runs)) {
      for (const t of r.tests) {
        if (t.source && !(t.name in projectSources)) projectSources[t.name] = t.source;
      }
    }
  }
  return { ...raw, machines, commits, projects, projectSources, scriptedNames };
}

// Of shown machines only, so a commit that failed only on a hidden machine is not counted as failed.
function commitState(c) {
  const s = visibleRuns(c).map((r) => r.status);
  if (!s.length) return 'none';
  if (s.includes('failed')) return 'failed';
  if (s.includes('running') || s.includes('queued')) return 'running';
  return 'passed';
}
const isFinished = (r) => r && (r.status === 'passed' || r.status === 'failed');

/* ============================================================================
   State
============================================================================ */
// Machines hidden from the chart and the commits table with the machine buttons of the legend, by id.
// Saved in the browser, so they stay hidden on the next visit. Engine and editor views share the list.
const HIDDEN_MACHINES_KEY = 'ci-hidden-machines';

function loadHiddenMachines() {
  try {
    return new Set(JSON.parse(localStorage.getItem(HIDDEN_MACHINES_KEY)) || []);
  } catch (err) {
    return new Set();
  }
}

const state = {
  filter: 'all',
  query: '',
  open: new Set(),
  tab: {},
  compare: {},
  // SHA of the commit that an open commit is compared with, by SHA of the open commit.
  against: {},
  // What Compare machines shows, kept for all commits: 'screenshots' or 'metrics'.
  compareMode: 'screenshots',
  metric: 'fps_avg',
  // Tests that were opened or closed by hand, by commit SHA, machine and test name.
  testOpen: {},
  project: null,
  hidden: loadHiddenMachines(),
};

// A view whose machines were all hidden from the other view shows them all.
function visibleMachines() {
  const shown = DATA.machines.filter((m) => !state.hidden.has(m.id));
  return shown.length ? shown : DATA.machines;
}
const visibleRuns = (c) => visibleMachines().map((m) => c.runs[m.id]).filter(Boolean);

function toggleMachine(id) {
  // When every machine of this view is shown, those that the other view hid are cleared first, so only this one gets hidden.
  if (visibleMachines().length === DATA.machines.length) for (const m of DATA.machines) state.hidden.delete(m.id);
  if (state.hidden.has(id)) state.hidden.delete(id);
  else state.hidden.add(id);
  try { localStorage.setItem(HIDDEN_MACHINES_KEY, JSON.stringify([...state.hidden])); } catch (err) { /* storage can be blocked; machines stay hidden until the page is closed */ }
}

const projectTest = (r, project) => r?.tests?.find((t) => t.name === project);

// kind says what a measure is of: 'projects', 'scripted', or both when it has none.
const METRICS = {
  test_s: {
    button: 'Test time', perProject: true, kind: 'scripted',
    note: 'Time the test took, without start of the editor, in seconds. Lower is better.',
    get: (r, p) => { const t = projectTest(r, p); return t?.ms != null ? t.ms / 1000 : undefined; },
    fmt: (v) => `${v.toFixed(2)} s`, tick: (v) => `${v}`,
  },
  fps_avg: {
    button: 'Average FPS', perProject: true, kind: 'projects',
    note: 'Average frames per second of the project, measured after frame time settles. Higher is better.',
    get: (r, p) => projectTest(r, p)?.fps_avg, fmt: (v) => `${v.toFixed(1)} fps`, tick: (v) => `${v}`,
  },
  frame_ms_p95: {
    button: 'Frame time', perProject: true, kind: 'projects',
    note: '95th percentile frame time of the project in milliseconds, 95% of frames were faster. Lower is better.',
    get: (r, p) => projectTest(r, p)?.frame_ms_p95, fmt: (v) => `${v.toFixed(2)} ms`, tick: (v) => `${v}`,
  },
  load_s: {
    button: 'Load time', perProject: true, kind: 'projects',
    note: 'Time to load the project, in seconds. Lower is better.',
    get: (r, p) => { const t = projectTest(r, p); return t?.status === 'passed' && t.ms != null ? t.ms / 1000 : undefined; },
    fmt: (v) => `${v.toFixed(2)} s`, tick: (v) => `${v}`,
  },
  memory_mb: {
    button: 'Memory', perProject: true,
    note: 'Memory of the process with the project loaded, or after the test, in megabytes. It includes memory of the graphics driver, so compare a machine only with itself. Lower is better.',
    get: (r, p) => { const t = projectTest(r, p); return t?.memory_mb ?? t?.metrics?.memory_mb; }, fmt: fmtMemory, tick: (v) => `${v}`,
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
  const machines = visibleMachines();
  const by = {};
  for (const m of machines) {
    const st = c.runs[m.id]?.status;
    if (st) (by[st] ||= []).push(m.id);
  }
  const total = machines.length;
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

// Drawn before results are loaded, so another view can be opened when results of this one can not be loaded.
function renderViewSwitch() {
  $('#view-switch').innerHTML = Object.entries(CONFIG.views)
    .map(([id, view]) => `<a href="${id === 'engine' ? './' : `?view=${id}`}"${id === VIEW_ID ? ' aria-current="page"' : ''}>${esc(view.title)}</a>`)
    .join('');
}

function renderHeader() {
  const [owner, name] = DATA.repo.split('/');
  $('#repo-name').innerHTML = `<span class="owner">${esc(owner)}/</span>${esc(name)}`;
  document.title = `${name} test results`;
  $('#branch-name').textContent = DATA.branch;
  $('#source-pill').hidden = CONFIG.source !== 'sample';
  const latest = DATA.commits[0];
  const finished = DATA.commits.find((c) => visibleRuns(c).some(isFinished));
  let s = '';
  if (latest) {
    const latestState = commitState(latest);
    s = visibleRuns(latest).length
      ? `Latest commit ${shaLink(latest.sha)} ${describe(latest)}.`
      : `Latest commit ${shaLink(latest.sha)} has no runs.`;
    if (finished && finished !== latest && latestState !== 'passed' && latestState !== 'failed') {
      s += ` The last finished commit, ${shaLink(finished.sha)}, ${describe(finished)}.`;
    }
  }
  $('#summary').innerHTML = s || 'No commits found.';

  const weekAgo = refNow() - 7 * 86400000;
  let runs = 0, failed = 0;
  for (const c of DATA.commits) for (const r of visibleRuns(c)) {
    if (isFinished(r) && new Date(r.started) >= weekAgo) { runs++; if (r.status === 'failed') failed++; }
  }
  $('#summary-sub').textContent =
    `Last 7 days: ${runs} ${runs === 1 ? 'run' : 'runs'}, ${failed} failed. Updated ${fmtDate(DATA.generated_at)}.`;

  $('#foot').innerHTML = CONFIG.source === 'sample'
    ? 'This page shows sample data from <code>sample-data.js</code>. To show real results, set <code>source</code> to <code>\'live\'</code> in <code>app.js</code> and point <code>resultsBase</code> at the folder that holds <code>index.json</code>.'
    : `Commits from GitHub, results from <code>${esc(CONFIG.resultsBase)}${esc(VIEW.index)}</code>.`;
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
  // A project and a scripted test have different measures, only those of the selected one are offered.
  const kind = DATA.scriptedNames.has(state.project) ? 'scripted' : 'projects';
  const offered = Object.entries(METRICS).filter(([, m]) => !m.kind || m.kind === kind);
  if (!offered.some(([k]) => k === state.metric)) state.metric = offered[0][0];

  const metric = METRICS[state.metric];
  $('#metric-switch').innerHTML = offered
    .map(([k, m]) => `<button type="button" data-metric="${k}" aria-pressed="${k === state.metric}">${m.button}</button>`)
    .join('');
  $('#project-select').innerHTML = projectOptionsHTML();
  $('#project-pick span').textContent = DATA.scriptedNames.size ? 'Project or test' : 'Project';
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

// Machines are buttons that hide or show them. The last shown machine can not be hidden.
function renderLegend() {
  const shown = visibleMachines();
  $('#legend').innerHTML = DATA.machines
    .map((m) => {
      const isShown = shown.includes(m);
      const isLast = isShown && shown.length === 1;
      const title = isLast ? 'At least one machine stays shown' : `${isShown ? 'Hide' : 'Show'} ${m.id} in the chart and the commits table`;
      return `<li><button class="legend-machine" type="button" data-machine="${esc(m.id)}" aria-pressed="${isShown}" title="${esc(title)}"${isLast ? ' disabled' : ''}>
        ${machineMark(m.index, 11)}<span class="legend-id">${esc(m.id)}</span><span class="gpu">${esc(m.gpu)}</span></button></li>`;
    })
    .join('')
    + '<li class="legend-gap"><svg width="22" height="10" aria-hidden="true"><line x1="1" y1="5" x2="21" y2="5"/></svg>Dotted: commits in between were not run</li>';
}

let chartCtx = null;
function renderChart() {
  const box = $('#chart');
  const metric = METRICS[state.metric];
  const machines = visibleMachines();
  const val = (c, m) => (isFinished(c.runs[m.id]) ? metric.get(c.runs[m.id], state.project) : undefined);
  const list = DATA.commits.slice().reverse().filter((c) => machines.some((m) => val(c, m) != null));
  renderChartTable(list, val, metric, machines);
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
  list.forEach((c) => machines.forEach((m) => { const v = val(c, m); if (v != null) vals.push(v); }));
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
  for (const m of machines) {
    const color = seriesColor(m.index);
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
      svg += `<g style="fill:${seriesColor(e.m.index)}">${shapePath(e.m.index, M.l + pw + 16, e.y, 8)}</g>`;
      svg += `<text class="end-label" x="${M.l + pw + 26}" y="${e.y}" dy="0.33em">${esc(e.m.id)}</text>`;
    }
  }
  svg += `<line class="crosshair" id="xh" x1="0" x2="0" y1="${M.t}" y2="${M.t + ph}" visibility="hidden"/>`;
  svg += `<g id="hover-dots"></g>`;
  svg += `<rect class="hit" x="${M.l - 12}" y="0" width="${pw + 24}" height="${H}"/>`;

  box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" tabindex="0" role="img"
      aria-label="${esc(chartTitle(metric))} per commit for each machine. Use left and right arrow keys to read values, Enter to open the commit.">${svg}</svg>
    <div class="chart-tip" id="chart-tip" hidden></div>`;
  chartCtx = { list, machines, x, y, val, metric, M, pw, dx, W, hovered: null };
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
    for (const m of ctx.machines) {
      const v = ctx.val(c, m);
      const r = c.runs[m.id];
      if (v != null) dots += `<g class="mk-svg" style="fill:${seriesColor(m.index)}">${shapePath(m.index, ctx.x(i), ctx.y(v), 12)}</g>`;
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

function renderChartTable(list, val, metric, machines) {
  const head = `<tr><th>Commit</th>${machines.map((m) => `<th>${esc(m.id)}</th>`).join('')}</tr>`;
  const body = list.slice().reverse()
    .map((c) => `<tr><td><span class="sha">${short(c.sha)}</span> ${esc(c.message)}</td>${machines
      .map((m) => { const v = val(c, m); return `<td>${v != null ? metric.fmt(v) : '–'}</td>`; }).join('')}</tr>`)
    .join('');
  $('#chart-table').innerHTML = `<table><caption class="sr-only">${esc(chartTitle(metric))} per commit</caption><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

/* ============================================================================
   Commit matrix
============================================================================ */
// Column widths in pixels, style.css has the same numbers in max-width of .page.
const MATRIX = { commitMin: 280, machine: 140, film: 392, filmMin: 212 };

// Commit column takes what is left, but never less than commitMin: screenshots column gets narrower first, then the matrix scrolls sideways.
function fitMatrix() {
  const wrap = $('.matrix-wrap');
  const fixed = MATRIX.commitMin + visibleMachines().length * MATRIX.machine;
  const film = clamp(wrap.clientWidth - fixed, MATRIX.filmMin, MATRIX.film);
  $('#matrix-cols').lastElementChild.style.width = `${film}px`;
  wrap.style.setProperty('--matrix-min', `${fixed + film}px`);
  // Only when it is needed, because a scrolling box stops the header from sticking to the top of the page.
  wrap.classList.toggle('is-scroll', wrap.clientWidth < fixed + film);
}

function renderMatrixHead() {
  const machines = visibleMachines();
  const n = machines.length;
  // Page gets wider with it, see .page in style.css.
  document.documentElement.style.setProperty('--m', n);
  $('#matrix-cols').innerHTML = `<col>${`<col style="width:${MATRIX.machine}px">`.repeat(n)}<col>`;
  fitMatrix();
  $('#matrix-head').innerHTML = `<tr>
    <th scope="col"><span class="th-title">Commit</span></th>
    ${machines.map((m) => `<th scope="col" title="${esc(`${m.os}, ${m.cpu}, ${m.gpu}, ${m.ram_gb} GB RAM`)}">
      <span class="th-machine">${machineMark(m.index, 11)}${esc(m.id)}</span>
      <span class="th-spec">${esc(m.gpu)}</span></th>`).join('')}
    <th scope="col"><span class="th-title">Screenshots</span></th></tr>`;
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  return DATA.commits.filter((c) => {
    if (state.filter === 'runs' && !visibleRuns(c).length) return false;
    if (state.filter === 'failed' && commitState(c) !== 'failed') return false;
    if (!q) return true;
    return c.message.toLowerCase().includes(q) || c.sha.startsWith(q) || c.author.toLowerCase().includes(q);
  });
}

function renderFilters() {
  const counts = {
    all: DATA.commits.length,
    runs: DATA.commits.filter((c) => visibleRuns(c).length).length,
    failed: DATA.commits.filter((c) => commitState(c) === 'failed').length,
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
  const withShots = visibleMachines().filter((m) => c.runs[m.id]?.screenshots?.length);
  return withShots.find((m) => c.runs[m.id].screenshots.some((s) => s.status === 'failed')) || withShots[0];
}

function filmstrip(c) {
  const m = filmMachine(c);
  if (!m) return `<span class="film-empty">${visibleRuns(c).length ? 'Not captured yet' : '–'}</span>`;
  const shots = c.runs[m.id].screenshots;
  return `<div class="film">${shots.map((s, i) => `<button class="thumb${s.status === 'failed' ? ' is-failed' : ''}" type="button"
      data-shots="${c.sha}|${m.id}" data-i="${i}" aria-label="Open ${esc(s.scene)} screenshot from ${esc(m.id)}${s.status === 'failed' ? ', failed' : ''}"
      title="${esc(s.scene)}${s.status === 'failed' ? ' (failed)' : ''}"><img src="${esc(s.thumb)}" alt="" loading="lazy" width="56" height="32"></button>`).join('')}</div>
    <div class="film-src">${machineMark(m.index)}From ${esc(m.id)}</div>`;
}

const chevron = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5L8 6l-3.5 3.5"/></svg>';

function rowHTML(c) {
  const machines = visibleMachines();
  const open = state.open.has(c.sha);
  const id = `detail-${short(c.sha)}`;
  let html = `<tr class="commit-row${open ? ' is-open' : ''}" data-sha="${c.sha}">
    <td class="c-commit">
      <button class="row-toggle" type="button" aria-expanded="${open}" aria-controls="${id}" data-toggle="${c.sha}">
        ${chevron}<span class="msg" title="${esc(c.message)}"><span class="sha">${short(c.sha)}</span>${esc(c.message)}</span>
      </button>
      <div class="meta">${esc(c.author)}, <time datetime="${c.date}" title="${esc(fmtDate(c.date))}">${ago(c.date)}</time></div>
    </td>
    ${machines.map((m) => statusCell(c, m)).join('')}
    <td class="c-film">${filmstrip(c)}</td>
  </tr>`;
  if (open) html += `<tr class="detail-row" id="${id}"><td colspan="${machines.length + 2}">${detailHTML(c)}</td></tr>`;
  return html;
}

function renderRows(focusSel) {
  const rows = filtered();
  const tbody = $('#rows');
  if (!rows.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${visibleMachines().length + 2}">
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
  const ms = visibleMachines();
  return (ms.find((m) => c.runs[m.id]?.status === 'failed')
    || ms.find((m) => isFinished(c.runs[m.id]))
    || ms.find((m) => c.runs[m.id])
    || ms[0]).id;
}

// A tab selected before its machine was hidden falls back to the default one.
const activeTab = (c) => (visibleMachines().some((m) => m.id === state.tab[c.sha]) ? state.tab[c.sha] : defaultTab(c));

function detailHTML(c) {
  // Row of the commit shows only three lines of its message.
  const message = `<p class="detail-msg">${esc(c.message)}</p>`;
  if (!visibleRuns(c).length) {
    const ranOn = Object.keys(c.runs);
    const notice = ranOn.length
      ? `This commit was run only on hidden machines, ${esc(joinList(ranOn))}.
        <span class="sub">Click a machine above the chart to show it again.</span>`
      : `No runs for this commit.
        <span class="sub">To get results for it, start the workflow by hand from the Actions tab of the private repo and enter this SHA.</span>`;
    return `<div class="detail detail-empty">${message}<p class="notice">${notice}</p></div>`;
  }
  const machines = visibleMachines();
  const compare = !!state.compare[c.sha];
  const other = DATA.commits.find((x) => x.sha === state.against[c.sha]);
  const active = activeTab(c);
  const canCompare = machines.filter((m) => c.runs[m.id]?.screenshots?.length || hasProjectResults(c.runs[m.id])).length >= 2;
  const tabs = machines.map((m) => {
    const st = c.runs[m.id]?.status || 'none';
    const sel = !compare && m.id === active;
    return `<button class="tab${sel ? ' is-active' : ''}" type="button" role="tab" aria-selected="${sel}" data-tab="${c.sha}|${m.id}">
      ${machineMark(m.index)}<span>${esc(m.id)}</span>${statusIcon(st)}<span class="sr-only">${STATUS_LABEL[st]}</span></button>`;
  }).join('');
  const btn = `<button class="compare-btn" type="button" aria-pressed="${compare}" data-compare="${c.sha}"
    ${canCompare ? '' : 'disabled title="Needs results from at least two machines"'}>Compare machines</button>`;
  const machine = machines.find((m) => m.id === active);
  const body = compare ? compareHTML(c) : other ? againstHTML(c, other, machine) : machineHTML(c, machine);
  return `<div class="detail">${message}<div class="detail-bar"><div class="tabs" role="tablist" aria-label="Machines">${tabs}</div>
    <div class="detail-actions">${againstPickHTML(c, other)}${btn}</div></div>${body}</div>`;
}

// List of commits that a commit can be compared with, every other commit that has project results.
function againstPickHTML(c, other) {
  const commits = DATA.commits.filter((x) => x.sha !== c.sha && visibleRuns(x).some(hasProjectResults));
  const text = (x) => `${short(x.sha)} ${x.message.length > 70 ? `${x.message.slice(0, 69)}…` : x.message}`;
  return `<select class="against-pick${other ? ' is-on' : ''}" data-against="${c.sha}" aria-label="Compare with another commit"
    ${commits.length ? '' : 'disabled title="No other commit has results"'}>
    <option value="">${other ? 'Stop comparing commits' : 'Compare with commit…'}</option>
    ${commits.map((x) => `<option value="${x.sha}"${x.sha === other?.sha ? ' selected' : ''}>${esc(text(x))}</option>`).join('')}</select>`;
}

const hasProjectResults = (run) => !!run?.tests?.some((t) => !isBuildTest(t));
// For a project that did not load, ms is its run time, not load time. A project that failed only on its screenshot has values of its runs.
// For a scripted test ms is time of the test, it has no load time.
const loadMsOf = (t) => (!isScripted(t) && (t.status === 'passed' || t.passes) ? t.ms ?? null : null);

function buildHTML(run) {
  return run.tests.filter(isBuildTest).map((t) => `<p class="build-line">${statusIcon(t.status)}<span>${esc(t.name)}</span>
    <span class="build-time">${t.ms != null ? fmtMs(t.ms) : STATUS_LABEL[t.status]}</span></p>
    ${t.message ? `<p class="build-msg">${esc(t.message)}</p>` : ''}`).join('');
}

// Changes under these are left gray, they are within run to run noise of 3 runs, measured on Simple_Scene.
// Memory of the same build of Simple_Scene varied over 5 runs by 2.6% in the engine benchmark and by 11% in the editor one.
// A test takes about a second, its time was not measured for noise yet, so its limit is a guess.
const GRAY_BELOW_PCT = { fps: 4, frameP95: 6, load: 4, memory: VIEW_ID === 'engine' ? 4 : 12, testTime: 15 };

// Difference between the slowest and the fastest run of a project result, in % of their average.
function runSpreadPct(t, passKey) {
  const values = (t?.passes || []).map((p) => p[passKey]).filter((v) => v != null);
  if (values.length < 2) return 0;

  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  return ((Math.max(...values) - Math.min(...values)) / average) * 100;
}

// Change from the previous result of the project on this machine. A change smaller than the spread of the runs
// of either result is left gray too, light scenes vary much more between runs than the fixed threshold.
function changeHTML(value, previousValue, previousSha, higherIsBetter, grayBelowPct, noisePct, fmt) {
  if (value == null || previousValue == null) return '';

  const pct = Math.round(((value - previousValue) / previousValue) * 1000) / 10;
  const better = higherIsBetter ? pct > 0 : pct < 0;
  const withinNoise = Math.abs(pct) >= grayBelowPct && Math.abs(pct) < noisePct;
  const tone = Math.abs(pct) < Math.max(grayBelowPct, noisePct) ? '' : better ? ' better' : ' worse';
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : '±';
  const title = `${fmt(previousValue)} in ${short(previousSha)}`
    + (withinNoise ? `. Not colored: runs of this project spread by ${noisePct.toFixed(1)}%, more than this change.` : '');
  return `<span class="change${tone}${withinNoise ? ' is-noisy' : ''}" title="${esc(title)}">${sign}${Math.abs(pct).toFixed(1)}%</span>`;
}

// Values of a project are averages of its runs, this text shows the range of the runs.
function rangeText(t, key, fmt) {
  const values = (t.passes || []).map((p) => p[key]).filter((v) => v != null);
  if (values.length < 2) return '';

  return `${fmt(Math.min(...values))} to ${fmt(Math.max(...values))} over ${values.length} runs`;
}

// Load of the machine is measured before every run of a project, results from before it was measured have none.
// A busy machine gives lower values, so tooltips of the values show it.
function machineLoadText(t) {
  const runs = t.passes || [];
  const range = (key) => {
    const values = runs.map((p) => p[key]).filter((v) => v != null);
    if (!values.length && t[key] != null) values.push(t[key]);
    if (!values.length) return '';

    const lowest = Math.round(Math.min(...values));
    const highest = Math.round(Math.max(...values));
    return lowest === highest ? `${highest}%` : `${lowest}% to ${highest}%`;
  };
  const gpu = range('gpu_load_before_pct');
  const cpu = range('cpu_load_before_pct');
  const parts = [gpu ? `GPU ${gpu}` : '', cpu ? `CPU ${cpu}` : ''].filter(Boolean);
  return parts.length ? `Load of the machine before the ${runs.length > 1 ? 'runs' : 'run'}: ${parts.join(', ')}` : '';
}

function rangeTitle(t, key, fmt) {
  const text = [rangeText(t, key, fmt), machineLoadText(t)].filter(Boolean).join('. ');
  return text ? ` title="${esc(text)}"` : '';
}

// Tooltip of memory also has memory before loading and the largest value since start.
function memoryTitle(t) {
  const parts = [rangeText(t, 'memory_mb', fmtMemory)];
  if (t.memory_start_mb != null) parts.push(`${fmtMemory(t.memory_start_mb)} before loading`);
  if (t.memory_peak_mb != null) parts.push(`${fmtMemory(t.memory_peak_mb)} at its largest`);
  const text = [parts.filter(Boolean).join(', '), machineLoadText(t)].filter(Boolean).join('. ');
  return text ? ` title="${esc(text)}"` : '';
}

// With several project repos, projects and screenshots are grouped by repo, in the order of project_sources.
function sourceGroups(run, items, sourceOf) {
  const sources = run.project_sources || [];
  if (sources.length < 2) return [{ source: null, items }];

  return sources.map((s) => ({ source: s, items: items.filter((it) => sourceOf(it) === s.repository) })).filter((g) => g.items.length);
}

function projectsHTML(run) {
  const projects = run.tests.filter((t) => !isBuildTest(t) && !isScripted(t));
  if (!projects.length) return '';

  const passed = projects.filter((t) => t.status === 'passed').length;
  const failed = projects.filter((t) => t.status === 'failed').length;
  const pending = projects.filter((t) => t.status === 'pending').length;
  let count = `${passed} of ${projects.length} passed`;
  if (failed) count += `, ${failed} failed`;
  if (pending) count += `, ${pending} pending`;

  const projectRow = (t) => {
    const loadMs = loadMsOf(t);
    const load = loadMs != null ? fmtMs(loadMs) : '–';
    const previous = run.previous?.[t.name];
    // Files of the project differ from its previous result, so a change in numbers may come from the project, not from the engine.
    const changed = previous?.tree && t.tree && previous.tree !== t.tree
      ? ` <span class="p-changed" title="Files of this project changed since ${short(previous.sha)}">changed</span>` : '';
    const fmtFps = (v) => `${v.toFixed(1)} fps`;
    const fmtFrameMs = (v) => `${v.toFixed(2)} ms`;
    const noisePct = (passKey) => Math.max(runSpreadPct(t, passKey), runSpreadPct(previous, passKey));
    const fpsChange = changeHTML(t.fps_avg, previous?.fps_avg, previous?.sha, true, GRAY_BELOW_PCT.fps, noisePct('fps_avg'), fmtFps);
    const p95Change = changeHTML(t.frame_ms_p95, previous?.frame_ms_p95, previous?.sha, false, GRAY_BELOW_PCT.frameP95, noisePct('frame_ms_p95'), fmtFrameMs);
    const loadChange = changeHTML(loadMs, previous?.ms, previous?.sha, false, GRAY_BELOW_PCT.load, noisePct('load_ms'), fmtMs);
    const memoryChange = changeHTML(t.memory_mb, previous?.memory_mb, previous?.sha, false, GRAY_BELOW_PCT.memory, noisePct('memory_mb'), fmtMemory);
    // Message of a passed project is a note, for example that frame time did not settle.
    const message = t.message
      ? `<tr class="p-message-row"><td></td><td colspan="5" class="p-message${t.status === 'passed' ? ' is-note' : ''}">${esc(t.message)}</td></tr>`
      : '';
    return `<tr class="p-${t.status}${t.message ? ' has-message' : ''}">
      <td class="p-icon">${statusIcon(t.status)}<span class="sr-only">${STATUS_LABEL[t.status]}</span></td>
      <th scope="row">${esc(t.name).replace(/_/g, '_<wbr>')}${changed}</th>
      <td class="p-fps"${rangeTitle(t, 'fps_avg', fmtFps)}>${t.fps_avg != null ? t.fps_avg.toFixed(1) : '–'}${fpsChange}</td>
      <td${rangeTitle(t, 'frame_ms_p95', fmtFrameMs)}>${t.frame_ms_p95 != null ? fmtFrameMs(t.frame_ms_p95) : '–'}${p95Change}</td>
      <td${rangeTitle(t, 'load_ms', fmtMs)}>${load}${loadChange}</td>
      <td${memoryTitle(t)}>${t.memory_mb != null ? fmtMemory(t.memory_mb) : '–'}${memoryChange}</td></tr>${message}`;
  };
  const body = sourceGroups(run, projects, (t) => t.source).map((g) => {
    const header = g.source
      ? `<tr class="p-group"><th colspan="6" scope="rowgroup">${esc(repoName(g.source.repository))}<span class="sha">${short(g.source.commit)}</span>`
        + `<span class="count">${g.items.length} ${g.items.length === 1 ? 'project' : 'projects'}</span></th></tr>`
      : '';
    return `<tbody>${header}${g.items.map(projectRow).join('')}</tbody>`;
  }).join('');

  const passCount = Math.max(0, ...projects.map((t) => t.passes?.length || 0));
  const averages = passCount > 1
    ? ` Values are averages of ${passCount} runs, hover a value to see the range.`
      + (run.previousSha ? ' A change smaller than the spread of the runs is <span class="is-noisy">not colored</span>.' : '')
    : '';
  const note = (run.previousSha
    ? `Changes are compared with the previous run on this machine, <span class="sha">${short(run.previousSha)}</span>.`
    : 'First run on this machine, there is nothing to compare with yet.') + averages;
  return `<h3>Projects <span class="count">${count}</span></h3>
    <p class="projects-note">${note}</p>
    <div class="projects-wrap"><table class="projects">
      <thead><tr><th><span class="sr-only">Status</span></th><th scope="col">Project</th><th scope="col">Average FPS</th>
        <th scope="col" title="95th percentile frame time, 95% of frames were faster">p95 frame time</th><th scope="col">Load time</th>
        <th scope="col" title="Memory of the process with the project loaded, with memory of the graphics driver">Memory</th></tr></thead>
      ${body}
    </table></div>`;
}

// label is shown in place of the project name when showScene is false.
function shotFigure(s, key, i, m, showScene = true, label = '') {
  const failed = s.status === 'failed';
  const diffTitle = s.diff_against ? ` title="Compared with ${short(s.diff_against)}"` : s.reference ? ' title="Compared with the reference image"' : '';
  const diffText = s.reference_created ? 'New reference' : s.diff_pct != null ? `${s.diff_pct.toFixed(2)}% different`
    : s.size ? `${esc(s.size)}, reference is ${esc(s.reference_size)}` : '';
  return `<figure class="shot${failed ? ' is-failed' : ''}">
    <button type="button" class="shot-btn" data-shots="${key}" data-i="${i}" aria-label="Open ${esc(s.scene)} screenshot from ${esc(m.id)}">
      <img src="${esc(s.file)}" alt="${esc(s.scene)} on ${esc(m.id)}" loading="lazy" width="960" height="540"></button>
    <figcaption>${showScene ? `<span>${esc(s.scene)}</span>` : label}
      <span class="diff${failed ? ' is-failed' : ''}"${diffTitle}>${failed ? statusIcon('failed') : ''}${diffText}</span></figcaption>
  </figure>`;
}

// Screenshots of projects, images of scripted tests follow them, grouped by test.
function galleryHTML(run, key, m) {
  const sourceOfShot = (s) => run.tests.find((t) => t.name === s.scene)?.source;
  const indexed = run.screenshots.map((s, i) => ({ s, i })).filter(({ s }) => !s.test);
  return sourceGroups(run, indexed, ({ s }) => sourceOfShot(s)).map((g) =>
    (g.source ? `<h4 class="gallery-group">${esc(repoName(g.source.repository))}</h4>` : '')
    + g.items.map(({ s, i }) => shotFigure(s, key, i, m)).join('')).join('');
}

// Images that tests captured, grouped by test.
function testGalleryHTML(run, key, m) {
  const testNames = [...new Set(run.screenshots.filter((s) => s.test).map((s) => s.test))];
  return testNames.map((name) => `<h4 class="gallery-group">${esc(name)}</h4>`
    + run.screenshots.map((s, i) => (s.test === name ? shotFigure(s, key, i, m, false, `<span>${esc(s.image)}</span>`) : '')).join('')).join('');
}

// Memory and load of the machine, which every test has, are shown as sentences, other metrics as name and value.
function testMetricsHTML(t) {
  const metrics = t.metrics || {};
  const memory = metrics.memory_mb != null
    ? `Memory: ${metrics.memory_start_mb != null ? `${fmtMemory(metrics.memory_start_mb)} before the test, ` : ''}${fmtMemory(metrics.memory_mb)} after it`
      + `${metrics.memory_peak_mb != null ? `, ${fmtMemory(metrics.memory_peak_mb)} at its largest` : ''}.`
    : '';
  const loadMetrics = [['GPU', 'gpu_load_before_pct'], ['CPU', 'cpu_load_before_pct']];
  const loadParts = loadMetrics.filter(([, name]) => metrics[name] != null).map(([title, name]) => `${title} ${Math.round(metrics[name])}%`);
  const load = loadParts.length ? `Load of the machine before the test: ${loadParts.join(', ')}.` : '';
  const other = Object.entries(metrics).filter(([name]) => !name.startsWith('memory_') && !loadMetrics.some(([, loadName]) => loadName === name))
    .map(([name, value]) => `${esc(name)}: ${Number.isInteger(value) ? value : Number(value).toFixed(3)}`);
  const text = [memory, load, ...other].filter(Boolean).join(' ');
  return text ? `<p class="test-metrics">${text}</p>` : '';
}

function testHTML(t, key, onlyTest) {
  const checks = t.checks || [];
  const passedChecks = checks.filter((check) => check.status === 'passed').length;
  const testKey = `${key}|${t.name}`;
  // A failed test is opened, a passed one only when it is the only test, until it is opened or closed by hand.
  const open = state.testOpen[testKey] ?? (t.status !== 'passed' || onlyTest);
  const rows = checks.map((check) => {
    const failed = check.status !== 'passed';
    // Value of a passed check is shown when it says more than "true".
    // A failed console test has only the message of its assertions.
    const values = check.expected !== undefined ? `Expected ${esc(check.expected)}, got ${esc(check.actual)}.` : '';
    const detail = failed
      ? `<span class="check-detail">${[values, check.message ? esc(check.message) : ''].filter(Boolean).join(' ')}</span>`
      : check.actual && check.actual !== 'true' ? `<span class="check-value">${esc(check.actual)}</span>` : '';
    return `<li class="check${failed ? ' is-failed' : ''}">${statusIcon(failed ? 'failed' : 'passed')}<span class="sr-only">${failed ? 'Failed' : 'Passed'}</span>
      <span class="check-name">${esc(check.name)}</span>${detail}</li>`;
  }).join('');
  const info = [checks.length ? `${passedChecks} of ${checks.length} checks` : '', t.ms != null ? fmtMs(t.ms) : ''].filter(Boolean).join(', ');
  // Message of the run says why a test without a failed check failed, for example that it crashed or did not finish in time.
  const message = t.message && passedChecks === checks.length ? `<p class="test-message">${esc(t.message)}</p>` : '';
  return `<details class="test${t.status === 'passed' ? '' : ' is-failed'}" data-test="${esc(testKey)}"${open ? ' open' : ''}>
    <summary><span class="test-head">${statusIcon(t.status)}<span class="sr-only">${STATUS_LABEL[t.status]}</span><span class="test-name">${esc(t.name)}</span><span class="test-info">${info}</span></span></summary>
    ${message}${testMetricsHTML(t)}
    ${rows ? `<ul class="checks">${rows}</ul>` : ''}
  </details>`;
}

function testsHTML(run, key) {
  const tests = run.tests.filter((t) => !isBuildTest(t) && isScripted(t));
  if (!tests.length) return '';

  const passed = tests.filter((t) => t.status === 'passed').length;
  return `<h3 class="tests-title">Tests <span class="count">${passed} of ${tests.length} passed</span></h3>
    ${tests.map((t) => testHTML(t, key, tests.length === 1)).join('')}`;
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
    ? ` Suites: ${sources.map((s) => `${esc(repoName(s.repository))} at <span class="sha">${short(s.commit)}</span>`).join(', ')}.`
    : '';
  const engine = run.engine_commit ? ` Engine at <span class="sha">${short(run.engine_commit)}</span>.` : '';
  const key = `${c.sha}|${m.id}`;
  const pendingShots = run.tests.filter((t) => t.status === 'pending' && t.name.startsWith('Screenshot')).length;
  const gallery = galleryHTML(run, key, m) + testGalleryHTML(run, key, m)
    + Array.from({ length: pendingShots }, () => '<div class="shot"><div class="shot-pending">Not captured yet</div></div>').join('');
  return `<div class="machine-view">
    <div>
      ${spec}
      <p class="run-line">${when}${projects}${engine}${link}</p>
      ${buildHTML(run)}
      ${projectsHTML(run)}
      ${testsHTML(run, key)}
    </div>
    <div>
      <h3>Screenshots <span class="count">${run.screenshots.length}${pendingShots ? ` of ${run.screenshots.length + pendingShots}` : ''}</span></h3>
      <div class="gallery">${gallery || '<p class="notice">No screenshots in this run.</p>'}</div>
    </div>
  </div>`;
}

function compareItems(c) {
  const ms = visibleMachines().filter((m) => c.runs[m.id]?.screenshots?.length);
  const scenes = [];
  for (const m of ms) for (const s of c.runs[m.id].screenshots) if (!scenes.includes(s.scene)) scenes.push(s.scene);
  const grid = scenes.map((scene) => ms.map((m) => {
    const s = c.runs[m.id].screenshots.find((x) => x.scene === scene);
    return s ? { ...s, machine: m.id, sha: c.sha } : null;
  }));
  return { ms, scenes, grid, flat: grid.flat().filter(Boolean) };
}

const COMPARE_MODES = [['screenshots', 'Screenshots'], ['metrics', 'Metrics']];

function compareHTML(c) {
  const modes = COMPARE_MODES.map(([id, title]) => `<button type="button" aria-pressed="${state.compareMode === id}" data-compare-mode="${c.sha}|${id}">${title}</button>`).join('');
  return `<div class="segmented compare-modes" role="group" aria-label="What to compare">${modes}</div>`
    + (state.compareMode === 'metrics' ? compareMetricsHTML(c) : compareShotsHTML(c));
}

function compareShotsHTML(c) {
  const { ms, scenes, grid, flat } = compareItems(c);
  if (!ms.length) return '<p class="notice">No screenshots for this commit yet.</p>';

  const key = `${c.sha}|compare`;
  let html = '<div></div>' + ms.map((m) => `<div class="c-head">${machineMark(m.index)}${esc(m.id)} <small>${esc(m.gpu)}</small></div>`).join('');
  scenes.forEach((scene, r) => {
    html += `<div class="c-scene">${esc(scene).replace(/_/g, '_<wbr>')}</div>`;
    grid[r].forEach((s, k) => {
      html += s ? shotFigure(s, key, flat.indexOf(s), ms[k], false) : '<div class="c-missing">Not captured</div>';
    });
  });
  return `<div class="compare-wrap"><div class="compare" style="--cols:${ms.length}">${html}</div></div>`;
}

// Values that Metrics mode of Compare machines shows, passKey is the name of the value in each run of a project.
// kind says what a value is of: 'projects', 'scripted', or both when it has none.
const COMPARE_METRICS = [
  // Rows of this one are builds, not projects. Time of a failed build is shown too, with its message.
  { title: 'Build time', hint: 'lower is better', higherIsBetter: false, ofBuild: true, get: (t) => t.ms, fmt: fmtMs, fmtFull: fmtMs },
  { title: 'Average FPS', hint: 'higher is better', higherIsBetter: true, kind: 'projects', passKey: 'fps_avg', grayBelowPct: GRAY_BELOW_PCT.fps,
    get: (t) => t.fps_avg, fmt: (v) => v.toFixed(1), fmtFull: (v) => `${v.toFixed(1)} fps` },
  { title: 'p95 frame time', hint: 'lower is better', higherIsBetter: false, kind: 'projects', passKey: 'frame_ms_p95', grayBelowPct: GRAY_BELOW_PCT.frameP95,
    get: (t) => t.frame_ms_p95, fmt: (v) => `${v.toFixed(2)} ms`, fmtFull: (v) => `${v.toFixed(2)} ms` },
  { title: 'Load time', hint: 'lower is better', higherIsBetter: false, kind: 'projects', passKey: 'load_ms', grayBelowPct: GRAY_BELOW_PCT.load,
    get: loadMsOf, fmt: fmtMs, fmtFull: fmtMs },
  { title: 'Test time', hint: 'lower is better', higherIsBetter: false, kind: 'scripted', grayBelowPct: GRAY_BELOW_PCT.testTime,
    get: (t) => (isScripted(t) ? t.ms : undefined), fmt: fmtMs, fmtFull: fmtMs },
  { title: 'Memory', hint: 'lower is better', higherIsBetter: false, passKey: 'memory_mb', grayBelowPct: GRAY_BELOW_PCT.memory,
    get: (t) => t.memory_mb ?? t.metrics?.memory_mb, fmt: fmtMemory, fmtFull: fmtMemory },
];

// One row for every project in each metric, one column for every machine, so a row compares the machines.
function compareMetricsHTML(c) {
  const ms = visibleMachines().filter((m) => hasProjectResults(c.runs[m.id]));
  if (!ms.length) return '<p class="notice">No results of projects or tests for this commit yet.</p>';

  // Projects follow the order of project repos, as in the projects table of a machine.
  const sourceOrder = [...new Set(ms.flatMap((m) => (c.runs[m.id].project_sources || []).map((s) => s.repository)))];
  const sourceOfProject = new Map();
  for (const m of ms) {
    for (const t of c.runs[m.id].tests) {
      if (!isBuildTest(t) && !sourceOfProject.has(t.name)) sourceOfProject.set(t.name, t.source);
    }
  }
  const names = [...sourceOfProject.keys()].sort((a, b) => sourceOrder.indexOf(sourceOfProject.get(a)) - sourceOrder.indexOf(sourceOfProject.get(b)));
  const buildNames = [...new Set(ms.flatMap((m) => c.runs[m.id].tests.filter(isBuildTest).map((t) => t.name)))];

  const rowHTMLOf = (metric, name) => {
    const tests = ms.map((m) => projectTest(c.runs[m.id], name));
    const values = tests.map((t) => (t ? metric.get(t) ?? null : null));
    const present = values.filter((v) => v != null);
    const best = present.length > 1 ? (metric.higherIsBetter ? Math.max(...present) : Math.min(...present)) : null;
    const cells = tests.map((t, k) => {
      const v = values[k];
      const failed = t?.status === 'failed'
        ? `<span class="cm-failed" title="${esc(t.message || 'Failed')}">${statusIcon('failed')}<span class="sr-only">Failed</span></span>` : '';
      if (v == null) return `<td>${failed}–<span class="cm-rel"></span></td>`;

      const isBest = best != null && v === best;
      let relative = isBest ? 'best' : '';
      if (best != null && !isBest && best > 0) {
        const pct = ((v - best) / best) * 100;
        relative = `${pct > 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%`;
      }
      return `<td${isBest ? ' class="is-best"' : ''}${rangeTitle(t, metric.passKey, metric.fmtFull)}>${failed}${metric.fmt(v)}<span class="cm-rel">${relative}</span></td>`;
    }).join('');
    return `<tr><th scope="row">${esc(name).replace(/_/g, '_<wbr>')}</th>${cells}</tr>`;
  };

  const head = ms.map((m) => `<th scope="col">${machineMark(m.index)}${esc(m.id)}<small>${esc(m.gpu)}</small></th>`).join('');
  const body = COMPARE_METRICS.map((metric) => {
    // A value that only projects or only scripted tests have gets rows only for them.
    const rowNames = (metric.ofBuild ? buildNames : names).filter((name) => ms.some((m) => { const t = projectTest(c.runs[m.id], name); return t && metric.get(t) != null; }));
    if (!rowNames.length) return '';

    return `<tbody>
    <tr class="cm-group"><th colspan="${ms.length + 1}" scope="rowgroup">${metric.title}<span class="count">${metric.hint}</span></th></tr>
    ${rowNames.map((name) => rowHTMLOf(metric, name)).join('')}</tbody>`;
  }).join('');
  const note = ms.length > 1
    ? 'The best value of each row is green, the other machines show how far they are from it.'
    : 'Only one machine has results for this commit.';
  return `<p class="projects-note">${note}</p>
    <div class="compare-wrap"><table class="cmp-metrics">
      <thead><tr><th scope="col">Project or test</th>${head}</tr></thead>
      ${body}
    </table></div>`;
}

/* ============================================================================
   Comparison of two commits

   Opened commit c is compared with commit other, on the machine of the selected tab.
   Changes go from other to c, whichever of them is newer.
============================================================================ */
// Screenshots of both commits on a machine, by project. In flat the two screenshots of a project follow each other,
// so arrow keys of the screenshot viewer switch between the commits.
function againstItems(c, other, m) {
  const shots = (commit) => (commit.runs[m.id]?.screenshots || []).map((s) => ({ ...s, machine: m.id, sha: commit.sha }));
  const otherShots = shots(other), ownShots = shots(c);
  const scenes = [...new Set([...ownShots, ...otherShots].map((s) => s.scene))];
  const pairs = scenes.map((scene) => ({
    scene,
    other: otherShots.find((s) => s.scene === scene),
    own: ownShots.find((s) => s.scene === scene),
  }));
  return { pairs, flat: pairs.flatMap((p) => [p.other, p.own]).filter(Boolean) };
}

// Projects and scripted tests have different values, so each kind has its own table.
function againstMetricsHTML(c, other, m) {
  return againstKindHTML(c, other, m, 'projects') + againstKindHTML(c, other, m, 'scripted');
}

function againstKindHTML(c, other, m, kind) {
  const run = c.runs[m.id], otherRun = other.runs[m.id];
  const itemName = kind === 'scripted' ? 'Test' : 'Project';
  const metrics = COMPARE_METRICS.filter((metric) => !metric.ofBuild && (!metric.kind || metric.kind === kind));
  // Those of the opened commit first, then those that only the other commit has.
  const names = [...new Set([...run.tests, ...otherRun.tests].filter((t) => !isBuildTest(t) && isScripted(t) === (kind === 'scripted')).map((t) => t.name))];
  if (!names.length) return '';

  const items = names.map((name) => ({ name, own: projectTest(run, name), other: projectTest(otherRun, name) }));

  const valueCell = (t, metric, classes) => {
    const v = t ? metric.get(t) ?? null : null;
    const failed = t?.status === 'failed'
      ? `<span class="cm-failed" title="${esc(t.message || 'Failed')}">${statusIcon('failed')}<span class="sr-only">Failed</span></span>` : '';
    return `<td class="${classes}"${v != null ? rangeTitle(t, metric.passKey, metric.fmtFull) : ''}>${failed}${v != null ? metric.fmt(v) : '–'}</td>`;
  };
  const projectRow = (it) => {
    // Files of the project differ between the two results, so a change in numbers may come from the project, not from the engine.
    const changed = it.own?.tree && it.other?.tree && it.own.tree !== it.other.tree
      ? ' <span class="p-changed" title="Files of this project differ between the two commits">changed</span>' : '';
    const cells = metrics.map((metric) => {
      const ownValue = it.own ? metric.get(it.own) ?? null : null;
      const otherValue = it.other ? metric.get(it.other) ?? null : null;
      const noisePct = Math.max(runSpreadPct(it.own, metric.passKey), runSpreadPct(it.other, metric.passKey));
      const change = changeHTML(ownValue, otherValue, other.sha, metric.higherIsBetter, metric.grayBelowPct, noisePct, metric.fmtFull);
      return `${valueCell(it.other, metric, 'cc-first')}${valueCell(it.own, metric, 'cc-own')}<td class="cc-change">${change || '–'}</td>`;
    }).join('');
    return `<tr><th scope="row" class="cc-name">${esc(it.name).replace(/_/g, '_<wbr>')}${changed}</th>${cells}</tr>`;
  };

  // Project repos of both runs, a repo that both used shows its two commits when they differ.
  const sources = [...(run.project_sources || [])];
  for (const s of otherRun.project_sources || []) if (!sources.some((x) => x.repository === s.repository)) sources.push(s);
  const columnCount = 1 + metrics.length * 3;
  const body = sourceGroups({ project_sources: sources }, items, (it) => (it.own || it.other).source).map((g) => {
    let header = '';
    if (g.source) {
      const ownCommit = (run.project_sources || []).find((s) => s.repository === g.source.repository)?.commit;
      const otherCommit = (otherRun.project_sources || []).find((s) => s.repository === g.source.repository)?.commit;
      const commits = ownCommit && otherCommit && ownCommit !== otherCommit
        ? `${short(otherCommit)} → ${short(ownCommit)}` : short(ownCommit || otherCommit);
      header = `<tr class="p-group"><th colspan="${columnCount}" scope="rowgroup">${esc(repoName(g.source.repository))}<span class="sha">${commits}</span>`
        + `<span class="count">${g.items.length} ${g.items.length === 1 ? 'project' : 'projects'}</span></th></tr>`;
    }
    return `<tbody>${header}${g.items.map(projectRow).join('')}</tbody>`;
  }).join('');

  const passCount = Math.max(0, ...items.flatMap((it) => [it.own, it.other]).map((t) => t?.passes?.length || 0));
  const note = `Change is from <span class="sha">${short(other.sha)}</span> to <span class="sha">${short(c.sha)}</span> on ${esc(m.id)}.`
    + (passCount > 1 ? ` Values are averages of ${passCount} runs, hover a value to see the range.`
      + ' A change smaller than the spread of the runs is <span class="is-noisy">not colored</span>.' : '');
  const groupHead = metrics.map((metric) => `<th colspan="3" scope="colgroup" class="cc-first">${metric.title}<span class="count">${metric.hint}</span></th>`).join('');
  const columnHead = metrics.map(() => `<th scope="col" class="cc-first"><span class="sha">${short(other.sha)}</span></th>`
    + `<th scope="col" class="cc-own"><span class="sha">${short(c.sha)}</span></th><th scope="col">Change</th>`).join('');
  return `<h3 class="against-kind">${itemName}s <span class="count">${items.length}</span></h3>
    <p class="projects-note">${note}</p>
    <div class="projects-wrap"><table class="cmp-commits">
      <thead><tr><th rowspan="2" scope="col" class="cc-name">${itemName}</th>${groupHead}</tr><tr>${columnHead}</tr></thead>
      ${body}
    </table></div>`;
}

function againstShotsHTML(c, other, m) {
  const { pairs, flat } = againstItems(c, other, m);
  if (!flat.length) return '';

  const key = `${c.sha}|${m.id}|${other.sha}`;
  const side = (s, sha) => {
    const label = `<span class="sha">${short(sha)}</span>`;
    return s ? shotFigure(s, key, flat.indexOf(s), m, false, label)
      : `<figure class="shot"><div class="shot-pending">Not captured</div><figcaption>${label}</figcaption></figure>`;
  };
  return `<h3 class="against-shots">Screenshots <span class="count">${pairs.length}</span></h3>
    <p class="projects-note">Open a screenshot and use the arrow keys to switch between the two commits.</p>
    <div class="pairs">${pairs.map((p) => `<div class="pair"><h4>${esc(p.scene)}</h4>
      <div class="pair-shots">${side(p.other, other.sha)}${side(p.own, c.sha)}</div></div>`).join('')}</div>`;
}

function againstHTML(c, other, m) {
  const run = c.runs[m.id], otherRun = other.runs[m.id];
  const engines = run?.engine_commit && otherRun?.engine_commit
    ? ` Engine is at <span class="sha">${short(otherRun.engine_commit)}</span> in <span class="sha">${short(other.sha)}</span>`
      + ` and at <span class="sha">${short(run.engine_commit)}</span> in <span class="sha">${short(c.sha)}</span>.`
    : '';
  const intro = `<p class="against-line">Compared with ${shaLink(other.sha)} ${esc(other.message)}
    <span class="against-when">${esc(other.author)}, ${ago(other.date)}.</span>${engines}</p>`;
  if (!hasProjectResults(run) || !hasProjectResults(otherRun)) {
    const missing = hasProjectResults(run) ? other : c;
    const both = visibleMachines().filter((x) => hasProjectResults(c.runs[x.id]) && hasProjectResults(other.runs[x.id])).map((x) => x.id);
    return `${intro}<p class="notice"><span class="sha">${short(missing.sha)}</span> has no results of projects or tests on ${esc(m.id)}.
      <span class="sub">${both.length ? `Both commits have results on ${esc(joinList(both))}.` : 'No machine has results for both commits.'}</span></p>`;
  }
  return intro + againstMetricsHTML(c, other, m) + againstShotsHTML(c, other, m);
}

/* ============================================================================
   Lightbox
============================================================================ */
const lb = { items: [], i: 0 };
function itemsFor(key) {
  const [sha, mid, otherSha] = key.split('|');
  const c = DATA.commits.find((x) => x.sha === sha);
  if (otherSha) return againstItems(c, DATA.commits.find((x) => x.sha === otherSha), DATA.machines.find((m) => m.id === mid)).flat;
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
    + (it.size ? `<span class="bad">Screenshot is ${esc(it.size)}, the reference image is ${esc(it.reference_size)}, they were not compared, failed.</span>` : '')
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
  // Rows are rendered again after most clicks, so what was opened by hand is kept. A toggle event does not bubble, it is caught on its way down.
  $('#rows').addEventListener('toggle', (e) => {
    if (e.target.dataset?.test) state.testOpen[e.target.dataset.test] = e.target.open;
  }, true);

  $('#rows').addEventListener('click', (e) => {
    const shot = e.target.closest('[data-shots]');
    if (shot) { openLightbox(shot.dataset.shots, +shot.dataset.i); return; }
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      const [sha, mid] = tab.dataset.tab.split('|');
      state.tab[sha] = mid; state.compare[sha] = false;
      renderRows(`[data-tab="${sha}|${mid}"]`); return;
    }
    const mode = e.target.closest('[data-compare-mode]');
    if (mode) {
      state.compareMode = mode.dataset.compareMode.split('|')[1];
      renderRows(`[data-compare-mode="${mode.dataset.compareMode}"]`); return;
    }
    const cmp = e.target.closest('[data-compare]');
    if (cmp) {
      const sha = cmp.dataset.compare;
      state.compare[sha] = !state.compare[sha];
      // Details of a commit show one comparison at a time.
      if (state.compare[sha]) delete state.against[sha];
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

  $('#rows').addEventListener('change', (e) => {
    const pick = e.target.closest('[data-against]');
    if (!pick) return;

    const sha = pick.dataset.against;
    if (pick.value) {
      state.against[sha] = pick.value;
      state.compare[sha] = false;
      // Selected machine may have no results for one of the commits, then the first machine that has both is selected.
      const c = DATA.commits.find((x) => x.sha === sha);
      const other = DATA.commits.find((x) => x.sha === pick.value);
      const hasBoth = (m) => hasProjectResults(c.runs[m.id]) && hasProjectResults(other.runs[m.id]);
      const active = DATA.machines.find((m) => m.id === activeTab(c));
      if (!hasBoth(active)) state.tab[sha] = (visibleMachines().find(hasBoth) || active).id;
    } else {
      delete state.against[sha];
    }
    renderRows(`[data-against="${sha}"]`);
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
  $('#project-select').addEventListener('change', (e) => { state.project = e.target.value; renderMetricSwitch(); renderChart(); });
  $('#legend').addEventListener('click', (e) => {
    const b = e.target.closest('[data-machine]');
    if (!b || b.disabled) return;

    const id = b.dataset.machine;
    toggleMachine(id);
    renderHeader(); renderLegend(); renderMatrixHead(); renderFilters(); renderRows(); renderChart();
    $(`[data-machine="${CSS.escape(id)}"]`)?.focus();
  });
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

  new ResizeObserver(fitMatrix).observe($('.matrix-wrap'));
}

/* ============================================================================
   Start
============================================================================ */
(async function start() {
  renderViewSwitch();
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
  const firstFinished = DATA.commits.find((c) => visibleRuns(c).some(isFinished));
  if (firstFinished) state.open.add(firstFinished.sha);

  renderHeader();
  renderMetricSwitch();
  renderLegend();
  renderMatrixHead();
  renderFilters();
  renderRows();
  renderChart();
  bindEvents();
})();
