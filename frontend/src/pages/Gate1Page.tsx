import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGateSpec, submitGate, GateSpec } from '../api/client';
import styles from './GatePage.module.css';

interface ChainStep {
  id: number;
  label: string;
  metaPromptPlaceholder: string;
  promptPlaceholder: string;
  outputPlaceholder: string;
}

const CHAIN_STEPS: ChainStep[] = [
  {
    id: 1,
    label: 'Seed Context',
    metaPromptPlaceholder: 'Instruct the AI about the role/task context for step 1…',
    promptPlaceholder: 'Write your first prompt here…',
    outputPlaceholder: 'Paste the AI output here…',
  },
  {
    id: 2,
    label: 'Deepen Profile',
    metaPromptPlaceholder: 'Build on step 1 output. What should the AI refine or expand?',
    promptPlaceholder: 'Prompt using output from step 1 as context…',
    outputPlaceholder: 'Paste the AI output here…',
  },
  {
    id: 3,
    label: 'Stress Test',
    metaPromptPlaceholder: 'Challenge the cover — probe for inconsistencies or gaps.',
    promptPlaceholder: 'Stress-test prompt…',
    outputPlaceholder: 'Paste the AI output here…',
  },
];

interface StepData {
  meta_prompt: string;
  generated_prompt: string;
  output: string;
}

export default function Gate1Page() {
  const navigate = useNavigate();
  const [spec, setSpec] = useState<GateSpec | null>(null);
  const [steps, setSteps] = useState<StepData[]>(
    CHAIN_STEPS.map(() => ({ meta_prompt: '', generated_prompt: '', output: '' }))
  );
  const [coverDossier, setCoverDossier] = useState({
    cover_name: '',
    employer: '',
    pretext: '',
    nationality: '',
    background_summary: '',
    vulnerability: '',
    prepared_response: '',
  });
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getGateSpec(1).then(setSpec).catch(console.error);
  }, []);

  function updateStep(index: number, field: keyof StepData, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await submitGate(1, {
        chain: steps.map((s, i) => ({ step: i + 1, ...s })),
        cover_dossier: coverDossier,
      });
      navigate('/feedback/1');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!spec) {
    return <div className={styles.loading}>Loading gate briefing…</div>;
  }

  const canSubmit = steps.every((s) => s.generated_prompt && s.output) && coverDossier.cover_name;

  return (
    <div className={styles.page}>
      <div className={styles.scanline} aria-hidden />
      <div className={styles.frame}>
        <span className={styles.cornerTl} aria-hidden />
        <span className={styles.cornerTr} aria-hidden />
        <span className={styles.cornerBl} aria-hidden />
        <span className={styles.cornerBr} aria-hidden />

        <div className={styles.topBar}>
          <div className={styles.gateLabel}>Gate 01 — {spec.name}</div>
          <button className={styles.backBtn} onClick={() => navigate('/hub')}>← Hub</button>
        </div>

        <div className={styles.cipherBlock}>
          <div className={styles.cipherLabel}>Cipher</div>
          <p className={styles.cipherText}>{spec.briefing}</p>
        </div>

        <div className={styles.content}>
          <div className={styles.sectionLabel}>Mission Instructions</div>
          <ul className={styles.instructions}>
            {spec.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>

          <div className={styles.sectionLabel}>Prompt Chain</div>
          <div className={styles.chainStack}>
            {CHAIN_STEPS.map((chainStep, idx) => {
              const data = steps[idx];
              const isActive = idx === activeStep;
              const isComplete = idx < activeStep;
              return (
                <div
                  key={chainStep.id}
                  className={`${styles.chainStep} ${isComplete ? styles.completed : ''} ${isActive ? styles.active : ''} ${idx > activeStep ? styles.sealed : ''}`}
                >
                  <div className={styles.stepHeader} onClick={() => isComplete && setActiveStep(idx)}>
                    <div className={styles.stepLeft}>
                      <span className={styles.stepNum}>Step {chainStep.id}</span>
                      <span className={styles.stepLabel}>{chainStep.label}</span>
                    </div>
                    <span className={styles.stepStatus}>
                      {isComplete ? '● Complete' : isActive ? '◐ Active' : '○ Sealed'}
                    </span>
                  </div>

                  {(isActive || isComplete) && (
                    <div className={styles.stepBody}>
                      <div className={styles.triplet}>
                        <div className={styles.tripletSection}>
                          <div className={styles.tsLabel}>Meta-Prompt</div>
                          <textarea
                            className={styles.textarea}
                            rows={2}
                            placeholder={chainStep.metaPromptPlaceholder}
                            value={data.meta_prompt}
                            onChange={(e) => updateStep(idx, 'meta_prompt', e.target.value)}
                            readOnly={isComplete}
                          />
                        </div>
                        <div className={styles.tripletSection}>
                          <div className={styles.tsLabel}>Your Prompt</div>
                          <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder={chainStep.promptPlaceholder}
                            value={data.generated_prompt}
                            onChange={(e) => updateStep(idx, 'generated_prompt', e.target.value)}
                            readOnly={isComplete}
                          />
                        </div>
                        <div className={styles.tripletSection}>
                          <div className={styles.tsLabel}>AI Output</div>
                          <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder={chainStep.outputPlaceholder}
                            value={data.output}
                            onChange={(e) => updateStep(idx, 'output', e.target.value)}
                            readOnly={isComplete}
                          />
                        </div>
                      </div>
                      {isActive && idx < CHAIN_STEPS.length - 1 && (
                        <button
                          className={styles.nextBtn}
                          disabled={!data.generated_prompt || !data.output}
                          onClick={() => setActiveStep(idx + 1)}
                        >
                          Lock Step & Continue →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.sectionLabel} style={{ marginTop: 28 }}>Cover Dossier</div>
          <div className={styles.dossierGrid}>
            {(Object.keys(coverDossier) as Array<keyof typeof coverDossier>).map((key) => (
              <div key={key} className={styles.dossierField}>
                <label className={styles.fieldLabel}>{key.replace(/_/g, ' ')}</label>
                {key === 'background_summary' || key === 'prepared_response' ? (
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={coverDossier[key]}
                    onChange={(e) => setCoverDossier((d) => ({ ...d, [key]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={styles.input}
                    type="text"
                    value={coverDossier[key]}
                    onChange={(e) => setCoverDossier((d) => ({ ...d, [key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.submitRow}>
            <button
              className={styles.submitBtn}
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Transmitting…' : 'Submit Gate 01 →'}
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <span><span className={styles.red}>●</span> Gate 01 // Build the Legend</span>
          <span>Skill: Prompt Chaining</span>
        </div>
      </div>
    </div>
  );
}
