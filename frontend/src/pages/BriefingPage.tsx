import { useNavigate } from 'react-router-dom';
import styles from './BriefingPage.module.css';

export default function BriefingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.scanline} aria-hidden />
      <div className={styles.frame}>
        <span className={styles.cornerTl} aria-hidden />
        <span className={styles.cornerTr} aria-hidden />
        <span className={styles.cornerBl} aria-hidden />
        <span className={styles.cornerBr} aria-hidden />

        <div className={styles.banner}>
          <span>◢ ◣</span>
          <span>Incoming Transmission // Encrypted // Priority Alpha</span>
          <span>◢ ◣</span>
        </div>

        <div className={styles.meta}>
          <span className={styles.recStatus}>
            <span className={styles.dot} />
            Decrypted · Live
          </span>
          <span>FREQ 04.711 MHz</span>
          <span>SOURCE: Cipher</span>
          <span>2026-05-18 11:59 UTC</span>
        </div>

        <div className={styles.content}>
          <div className={styles.missionLabel}>Operation</div>
          <h1 className={styles.missionName}><span className={styles.accent}>Quicksilver</span></h1>

          <div className={styles.dossierGrid}>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Location</div>
              <div className={styles.cardValue}>Hôtel Hermitage, Monaco</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Antagonist</div>
              <div className={styles.cardValue}>The Monaco Syndicate</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Target Asset</div>
              <div className={styles.cardValue}>Helios AI Model</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardLabel}>Time Pressure</div>
              <div className={styles.cardValue}>72-hour window</div>
            </div>
          </div>

          <div className={styles.situation}>
            <div className={styles.sectionLabel}>Situation Report</div>
            <p>The Syndicate has acquired <em>Helios</em> — an experimental model we have tracked for eighteen months. They are auctioning it in seventy-two hours at the Hôtel Hermitage to a buyer we cannot yet identify.</p>
            <p>Your team is the only one in position.</p>
          </div>

          <div className={styles.gatesOverview}>
            <div className={styles.sectionLabel}>Mission Structure</div>
            <div className={styles.gates}>
              {[
                { n: 1, name: 'Build the Legend', desc: 'Construct a deep-cover identity using prompt chaining' },
                { n: 2, name: 'The Dossier', desc: 'Research targets with role-based AI personas' },
                { n: 3, name: 'Find the Crack', desc: 'Analyze intercept data to identify the anomaly' },
                { n: 4, name: 'The Plan', desc: 'Build a mission plan and stress-test it with AI' },
              ].map((g) => (
                <div key={g.n} className={styles.gate}>
                  <div className={styles.gateNum}>0{g.n}</div>
                  <div>
                    <div className={styles.gateName}>{g.name}</div>
                    <div className={styles.gateDesc}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.acceptance}>
            <p className={styles.acceptNote}>
              Acceptance binds your team to operational secrecy under Subsection 4-A of the Charter.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.btnAccept}
                onClick={() => navigate('/opening')}
              >
                Accept Mission →
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <span><span className={styles.red}>●</span> Classified // IMF Internal</span>
          <span>Pre-Session · Awaiting Acceptance</span>
        </div>
      </div>
    </div>
  );
}
