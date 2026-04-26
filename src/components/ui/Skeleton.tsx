import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius, className }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={`skeleton ${styles.cardImage}`} />
      <div className={styles.cardInfo}>
        <div className={`skeleton ${styles.cardTitle}`} />
        <div className={`skeleton ${styles.cardMeta}`} />
      </div>
    </div>
  );
}

export function MovieRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.rowSkeleton}>
      <div className={`skeleton ${styles.rowTitle}`} />
      <div className={styles.rowCards} style={{ '--cols': count } as React.CSSProperties}>
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
