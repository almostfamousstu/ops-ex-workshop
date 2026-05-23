import React from 'react';
import styles from './Frame.module.css';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
}

/** Decorative corner-bracket frame around any panel or page area */
export default function Frame({ children, className = '' }: FrameProps) {
  return (
    <div className={`${styles.frame} ${className}`}>
      <span className={`${styles.corner} ${styles.tl}`} aria-hidden />
      <span className={`${styles.corner} ${styles.tr}`} aria-hidden />
      <div className={styles.content}>{children}</div>
      <span className={`${styles.corner} ${styles.bl}`} aria-hidden />
      <span className={`${styles.corner} ${styles.br}`} aria-hidden />
    </div>
  );
}
