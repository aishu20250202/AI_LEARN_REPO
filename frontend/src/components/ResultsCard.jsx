import { useEffect, useRef, useState } from 'react';

const RING_CIRCUMFERENCE = 339.3; // 2π × r=54 — matches .ring-bar in index.css

function scoreLabel(score) {
  if (score >= 75) return 'Strong match — ship it';
  if (score >= 50) return 'Getting there — close the gaps';
  return 'Needs work — start with the missing skills';
}

export default function ResultsCard({ results }) {
  const sectionRef = useRef(null);

  // Mount at "empty" so the ring animates to the score a frame later.
  const [offset, setOffset] = useState(RING_CIRCUMFERENCE);

  useEffect(() => {
    setOffset(RING_CIRCUMFERENCE * (1 - results.score / 100));
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [results.score]);

  const jdMode = results.jdMatched;

  return (
    <section id="results" className="card results" ref={sectionRef}>
      <h2>Analysis</h2>
      <div className="results-grid">
        <div className="score-box">
          <div className="ring-wrap">
            <svg viewBox="0 0 120 120" className="ring" aria-hidden="true">
              <circle className="ring-track" cx="60" cy="60" r="54" />
              <circle
                className="ring-bar"
                cx="60"
                cy="60"
                r="54"
                style={{ strokeDashoffset: offset }}
              />
            </svg>
            <div className="ring-center">
              <span className="score-num">{results.score}</span>
              <span className="score-of">/ 100</span>
            </div>
          </div>
          <p className="score-label">{scoreLabel(results.score)}</p>
        </div>

        <div className="skills-box">
          <div className="skill-group">
            <h3>
              {jdMode ? 'Required skills you have' : 'Skills present'}
              <span className="count">({results.matchedSkills.length})</span>
            </h3>
            <ul className="chips">
              {results.matchedSkills.map((s) => <li key={s} className="ok">{s}</li>)}
            </ul>
          </div>

          <div className="skill-group">
            <h3>
              {jdMode ? 'Required skills missing' : 'Skills missing'}
              <span className="count">({results.missingSkills.length})</span>
            </h3>
            <ul className="chips">
              {results.missingSkills.map((s) => <li key={s} className="gap">{s}</li>)}
            </ul>
          </div>

          {results.extraSkills.length > 0 && (
            <div className="skill-group">
              <h3>
                Other skills on your resume
                <span className="count">({results.extraSkills.length})</span>
              </h3>
              <ul className="chips">
                {results.extraSkills.map((s) => <li key={s} className="neutral">{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="method-note">
        Score = share of the {results.requiredSkills.length} tracked skills{' '}
        {jdMode ? 'the job description asks for' : 'in the baseline list'} that your
        resume shows. It's a keyword match, not a human review — projects and
        context matter too.
      </p>
      {!jdMode && (
        <p className="jd-note">
          The job description didn't mention any of the tracked skills, so you were
          scored against the full baseline list instead.
        </p>
      )}
    </section>
  );
}
