import styles from './CipherMessage.module.css';

interface CipherMessageProps {
  text: string;
  label?: string;
}

/** Displays a Cipher (handler) voice message in Cormorant Garamond italic */
export default function CipherMessage({ text, label = 'CIPHER' }: CipherMessageProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
