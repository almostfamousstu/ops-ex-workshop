import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OpeningBriefingPage.module.css';

const BRIEFING_TEXT = [
  'Agent. The Syndicate has acquired Helios — an experimental model we have tracked for eighteen months. They are auctioning it in seventy-two hours at the Hôtel Hermitage, Monaco, to a buyer we cannot yet identify.',
  'Your team is the only one in position.',
  'You will build a cover. You will gather intelligence. You will find the weakness. You will tell me how this ends.',
  'As always, should you or any of your team be caught or killed, the Secretary will disavow all knowledge of your actions.',
];

export default function OpeningBriefingPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <div className={styles.page}>
      <div className={styles.scanline} aria-hidden />
      <div className={styles.frame}>
        <span className={styles.cornerTl} aria-hidden />
        <span className={styles.cornerTr} aria-hidden />
        <span className={styles.cornerBl} aria-hidden />
        <span className={styles.cornerBr} aria-hidden />

        <div className={styles.classHeader}>
          <span>Eyes Only</span>
          <span>·</span>
          <span>Cosmic Clearance</span>
          <span>·</span>
          <span>Athena-7</span>
        </div>

        <div className={styles.recStrip}>
          <div className={styles.recStatus}>
            <span className={styles.dot} />
            Decrypted · Playback Active
          </div>
          <div className={styles.recMeta}>
            <span><span className={styles.k}>FREQ</span> <span className={styles.v}>04.711 MHz</span></span>
            <span><span className={styles.k}>BURST</span> <span className={styles.v}>14.2s</span></span>
            <span><span className={styles.k}>SOURCE</span> <span className={styles.v}>Cipher</span></span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.preamble}>
            <div className={styles.frequency}>Encrypted Voice Burst · 2026-05-18 11:59 UTC</div>
            <div className={styles.missionId}>Operation</div>
            <div className={styles.missionName}><span className={styles.codename}>Quicksilver</span></div>
          </div>

          <div className={styles.waveform} aria-hidden>
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className={styles.bar} style={{ animationDelay: `${-((i * 0.15) % 0.7)}s` }} />
            ))}
          </div>

          <div className={styles.transcriptLabel}>Transcript</div>

          <div className={styles.transcript}>
            {BRIEFING_TEXT.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className={styles.destruct}>
            <div className={styles.destructWarning}>◇ This message will self-destruct ◇</div>
            <div className={styles.countdown}>
              {mins}<span className={styles.blink}>:</span>{secs}
            </div>
            <div className={styles.countdownLabel}>Seconds Remaining</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={() => navigate('/briefing')}>
            ← Review Dossier
          </button>
          <button className={styles.btnPrimary} onClick={() => navigate('/hub')}>
            Accept Mission →
          </button>
        </div>

        <div className={styles.footer}>
          <span><span className={styles.red}>●</span> Classified // IMF Internal</span>
          <span>One-Time Transmission</span>
        </div>
      </div>
    </div>
  );
}
