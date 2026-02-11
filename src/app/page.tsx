'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow} />
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="8" y="28" width="64" height="40" rx="4" fill="url(#panelGrad)" stroke="#fbbf24" strokeWidth="2"/>
            <line x1="8" y1="38" x2="72" y2="38" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
            <line x1="8" y1="48" x2="72" y2="48" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
            <line x1="8" y1="58" x2="72" y2="58" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
            <line x1="24" y1="28" x2="24" y2="68" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
            <line x1="40" y1="28" x2="40" y2="68" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
            <line x1="56" y1="28" x2="56" y2="68" stroke="#fbbf24" strokeWidth="1" opacity="0.5"/>
            <circle cx="40" cy="14" r="10" fill="#fbbf24" opacity="0.8"/>
            <path d="M40 0 L42 8 L38 8Z" fill="#fbbf24" opacity="0.6"/>
            <path d="M54 8 L48 14 L46 12Z" fill="#fbbf24" opacity="0.6"/>
            <path d="M26 8 L32 14 L34 12Z" fill="#fbbf24" opacity="0.6"/>
            <defs>
              <linearGradient id="panelGrad" x1="8" y1="28" x2="72" y2="68">
                <stop stopColor="#1e3a5f"/>
                <stop offset="1" stopColor="#0f1b30"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className={styles.title}>
          Simulador de <span className={styles.highlight}>Placas Solares</span>
        </h1>
        <p className={styles.subtitle}>
          Diseña, conecta y simula sistemas fotovoltaicos completos.
          Aprende cómo la energía solar alimenta hogares, industrias y vehículos eléctricos.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>☀️</span>
            <span>Paneles Solares</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔋</span>
            <span>Baterías</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🏠</span>
            <span>Consumidores</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📊</span>
            <span>Gráficas</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/login')}>
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
