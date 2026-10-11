import { useRef, useState } from 'react';
import ResultsCard from './components/ResultsCard.jsx';
import './jd.css';

function isPDF(file) {
  return file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
}

export default function App() {
  const [status, setStatus] = useState(null);     // { message, error }
  const [fileMeta, setFileMeta] = useState(null); // { name, kb }
  const [jd, setJd] = useState('');
  const [results, setResults] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  function showStatus(message, error = false) {
    setStatus(message ? { message, error } : null);
  }

  async function analyze(e) {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) {
      showStatus('Choose a resume PDF first.', true);
      return;
    }
    if (!isPDF(file)) {
      showStatus("That doesn't look like a PDF — please upload a .pdf file.", true);
      return;
    }
    if (!jd.trim()) {
      showStatus('Paste the job description to compare against.', true);
      return;
    }

    // Backend does the parsing/scoring now — send the PDF and JD as multipart.
    const form = new FormData();
    form.append('resume', file);
    form.append('jd', jd);

    setLoading(true);
    setResults(null);
    showStatus('Scoring your resume against the job description…');
    try {
      const res = await fetch('/api/analyze/score', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setStatus(null);
      setResults(data);
    } catch (err) {
      showStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  function onFileChosen(e) {
    const f = e.target.files[0];
    if (f) {
      setFileMeta({ name: f.name, kb: Math.round(f.size / 1024) });
      setResults(null);
      setStatus(null);
    }
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFileMeta(null);
    setResults(null);
    setStatus(null);
  }

  return (
    <>
      <nav className="nav">
        <span className="brand">0 → <em>shipped</em></span>
        <a className="nav-link" href="#how">How it works</a>
      </nav>

      <header className="hero">
        <p className="eyebrow">Resume vs. job description — scored in seconds</p>
        <h1>Take your resume from <span className="grad">0 to shipped</span></h1>
        <p className="sub">
          Upload your resume PDF, paste the job description, and see how well you
          match — which required skills you already show, and which you're missing.
        </p>
      </header>

      <form id="upload" className="card uploader" onSubmit={analyze}>
        <label
          className={`dropzone${dragging ? ' dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f && isPDF(f)) {
              setFileMeta({ name: f.name, kb: Math.round(f.size / 1024) });
              setResults(null);
              setStatus(null);
              // keep the dropzone's hidden input in sync so submit finds the file
              const dt = new DataTransfer();
              dt.items.add(f);
              fileInputRef.current.files = dt.files;
            } else if (f) {
              showStatus("That doesn't look like a PDF — please upload a .pdf file.", true);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={onFileChosen}
          />
          <div className="dz-icon" aria-hidden="true">📄</div>
          <p className="dz-title">Drag &amp; drop your resume PDF</p>
          <p className="dz-sub">or click to browse — PDF only</p>
        </label>

        {fileMeta && (
          <div className="file-meta">
            <span>{fileMeta.name}</span>
            <span className="file-size">{fileMeta.kb} KB</span>
            <button className="linklike" type="button" onClick={clearFile}>Clear</button>
          </div>
        )}

        <div className="jd-box">
          <label className="field-label" htmlFor="jd">Job description</label>
          <textarea
            id="jd"
            rows={8}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here — responsibilities, requirements, the lot."
          />
        </div>

        <button className="btn primary analyze-btn" type="submit" disabled={loading}>
          {loading ? 'Scoring…' : 'Score my resume'}
        </button>

        {status && <p className={`status${status.error ? ' error' : ''}`}>{status.message}</p>}
      </form>

      {results && <ResultsCard results={results} />}

      <section id="how" className="how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step"><span className="step-num">1</span><h3>Upload PDF + JD</h3><p>Your resume and the job description you're targeting.</p></div>
          <div className="step"><span className="step-num">2</span><h3>Backend parses &amp; matches</h3><p>The server extracts the PDF text and matches skills on both sides.</p></div>
          <div className="step"><span className="step-num">3</span><h3>Score + gaps</h3><p>See which required skills you show, and which to learn next.</p></div>
        </div>
      </section>

      <footer className="footer">
        <p>Built as the <strong>0 → shipped</strong> resume parser. Every analysis is stored so you can track progress over time.</p>
      </footer>
    </>
  );
}
