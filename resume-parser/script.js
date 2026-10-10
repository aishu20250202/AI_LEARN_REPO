/* 0 → shipped resume parser — runs entirely in the browser.
   Flow: pick a PDF → pdf.js extracts text → keyword scan → render score. */

/* ---------- skills reference list ---------- */
/* Each entry is checked against the resume text via any of its aliases.
   Matching uses word boundaries, so "javascript" won't match "java". */
const SKILLS = [
  { name: 'JavaScript',    aliases: ['javascript', 'js'] },
  { name: 'TypeScript',    aliases: ['typescript'] },
  { name: 'React',         aliases: ['react', 'reactjs', 'react.js'] },
  { name: 'Next.js',       aliases: ['next.js', 'nextjs'] },
  { name: 'Redux',         aliases: ['redux'] },
  { name: 'Node.js',       aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Express',       aliases: ['express', 'expressjs', 'express.js'] },
  { name: 'MongoDB',       aliases: ['mongodb', 'mongo'] },
  { name: 'PostgreSQL',    aliases: ['postgresql', 'postgres'] },
  { name: 'SQL',           aliases: ['sql'] },
  { name: 'GraphQL',       aliases: ['graphql'] },
  { name: 'Python',        aliases: ['python'] },
  { name: 'Java',          aliases: ['java'] },
  { name: 'HTML',          aliases: ['html', 'html5'] },
  { name: 'CSS',           aliases: ['css', 'css3'] },
  { name: 'Tailwind CSS',  aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { name: 'REST APIs',     aliases: ['rest api', 'rest apis', 'restful', 'rest'] },
  { name: 'Git',           aliases: ['git', 'github', 'gitlab'] },
  { name: 'Docker',        aliases: ['docker'] },
  { name: 'Kubernetes',    aliases: ['kubernetes', 'k8s'] },
  { name: 'AWS',           aliases: ['aws', 'amazon web services'] },
  { name: 'CI/CD',         aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous delivery'] },
  { name: 'Testing',       aliases: ['jest', 'vitest', 'unit test', 'unit tests'] },
  { name: 'Linux / Bash',  aliases: ['linux', 'bash'] },
  { name: 'Redis',         aliases: ['redis'] }
];

const RING_CIRCUMFERENCE = 339.3; // 2π × r=54, matches styles.css

const els = {
  dropzone:   document.getElementById('dropzone'),
  fileInput:  document.getElementById('fileInput'),
  fileMeta:   document.getElementById('fileMeta'),
  fileName:   document.getElementById('fileName'),
  fileSize:   document.getElementById('fileSize'),
  clearBtn:   document.getElementById('clearBtn'),
  status:     document.getElementById('status'),
  results:    document.getElementById('results'),
  ringBar:    document.getElementById('ringBar'),
  scoreNum:   document.getElementById('scoreNum'),
  scoreOf:    document.getElementById('scoreOf'),
  scoreLabel: document.getElementById('scoreLabel'),
  presentChips:   document.getElementById('presentChips'),
  missingChips:   document.getElementById('missingChips'),
  presentCount:   document.getElementById('presentCount'),
  missingCount:   document.getElementById('missingCount'),
  skillTotal:     document.getElementById('skillTotal'),
  sampleBtn:      document.getElementById('sampleBtn')
};

els.skillTotal.textContent = SKILLS.length;

/* ---------- pdf.js worker setup ---------- */
/* Workers must be same-origin, but the CDN isn't — so fetch the worker
   script and load it from a blob URL instead. If that fails (e.g. offline),
   fall back to the direct URL and let pdf.js use its main-thread fallback. */
const PDFJS_VERSION = '3.11.174';
const WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

async function setupPdfWorker() {
  try {
    const blob = await fetch(WORKER_URL).then((r) => r.blob());
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
  }
}

/* ---------- text extraction ---------- */
async function extractTextFromPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const maxPages = Math.min(pdf.numPages, 20);
  let text = '';
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text;
}

/* ---------- keyword scan ---------- */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findSkills(text) {
  const lowered = text.toLowerCase();
  const found = new Set();

  for (const skill of SKILLS) {
    for (const alias of skill.aliases) {
      // boundary-safe: the alias must not sit inside a longer word
      const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`);
      if (re.test(lowered)) {
        found.add(skill.name);
        break;
      }
    }
  }
  return found;
}

function scoreResume(text) {
  const found = findSkills(text);
  const present = SKILLS.filter((s) => found.has(s.name)).map((s) => s.name);
  const missing = SKILLS.filter((s) => !found.has(s.name)).map((s) => s.name);
  const score = Math.round((present.length / SKILLS.length) * 100);
  return { score, present, missing };
}

/* ---------- rendering ---------- */
function setStatus(message, isError = false) {
  els.status.hidden = !message;
  els.status.textContent = message || '';
  els.status.classList.toggle('error', isError);
}

function scoreLabel(score) {
  if (score >= 75) return 'Ship-ready — nice breadth';
  if (score >= 50) return 'Getting there — close the gaps';
  return 'Needs work — start with the missing skills';
}

function renderResults({ score, present, missing }) {
  els.results.hidden = false;

  // animate the ring from whatever it showed before
  els.ringBar.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - score / 100);
  els.scoreNum.textContent = score;
  els.scoreOf.textContent = '/ 100';
  els.scoreLabel.textContent = scoreLabel(score);

  els.presentCount.textContent = `(${present.length})`;
  els.missingCount.textContent = `(${missing.length})`;

  els.presentChips.innerHTML = present.map((s) => `<li class="ok">${s}</li>`).join('');
  els.missingChips.innerHTML = missing.map((s) => `<li class="gap">${s}</li>`).join('');

  els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- file handling ---------- */
function isPDF(file) {
  return file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
}

async function analyzeFile(file) {
  if (!isPDF(file)) {
    setStatus("That doesn't look like a PDF — please upload a .pdf file.", true);
    return;
  }

  els.fileMeta.hidden = false;
  els.fileName.textContent = file.name;
  els.fileSize.textContent = `${(file.size / 1024).toFixed(0)} KB`;

  if (typeof pdfjsLib === 'undefined') {
    setStatus("Couldn't load the PDF engine — this page needs an internet connection for the pdf.js CDN.", true);
    return;
  }

  setStatus('Reading your resume…');
  try {
    await setupPdfWorker();
    const text = await extractTextFromPDF(file);
    if (!text.trim()) {
      setStatus('No text found — this PDF may be a scan or an image. Try a text-based PDF.', true);
      return;
    }
    setStatus('');
    renderResults(scoreResume(text));
  } catch (err) {
    if (err && err.name === 'PasswordException') {
      setStatus('This PDF is password-protected — remove the password and try again.', true);
    } else {
      setStatus("Couldn't read that PDF. It may be corrupted or image-only.", true);
    }
  }
}

function clearFile() {
  els.fileInput.value = '';
  els.fileMeta.hidden = true;
  els.results.hidden = true;
  els.ringBar.style.strokeDashoffset = RING_CIRCUMFERENCE;
  setStatus('');
}

/* ---------- events ---------- */
els.fileInput.addEventListener('change', () => {
  if (els.fileInput.files[0]) analyzeFile(els.fileInput.files[0]);
});

els.dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  els.dropzone.classList.add('dragover');
});
els.dropzone.addEventListener('dragleave', () => els.dropzone.classList.remove('dragover'));
els.dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  els.dropzone.classList.remove('dragover');
  if (e.dataTransfer.files[0]) analyzeFile(e.dataTransfer.files[0]);
});

els.clearBtn.addEventListener('click', clearFile);

/* sample lets you demo the UI without a real PDF on hand */
const SAMPLE_TEXT = `
Aarav Sharma — Full-stack developer
EDUCATION: B.Tech Computer Science, 2026
SKILLS: JavaScript, React, Node.js, Express, MongoDB, HTML, CSS,
Python, SQL, Git, GitHub, REST APIs, Jest
PROJECTS: Task manager with authentication and REST API endpoints;
quiz app with unit tests in Jest
`;

els.sampleBtn.addEventListener('click', () => {
  els.fileMeta.hidden = true;
  setStatus('Analyzing the sample resume…');
  setTimeout(() => {
    setStatus('');
    renderResults(scoreResume(SAMPLE_TEXT));
  }, 400);
});
