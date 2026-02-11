'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './toolbar.module.css';

interface ToolbarProps {
  simulationName: string;
  season: string;
  latitude: number;
  onSeasonChange: (season: string) => void;
  onLatitudeChange: (lat: number) => void;
  onSave: () => void;
  onSimulate: () => void;
  isSaving: boolean;
  isSimulating: boolean;
}

export default function Toolbar({
  simulationName,
  season,
  latitude,
  onSeasonChange,
  onLatitudeChange,
  onSave,
  onSimulate,
  isSaving,
  isSimulating,
}: ToolbarProps) {
  const router = useRouter();

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard')}>
          ← Volver
        </button>
        <span className={styles.divider}></span>
        <h1 className={styles.title}>{simulationName}</h1>
      </div>

      <div className={styles.center}>
        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <label style={{ marginRight: '8px', marginBottom: 0 }}>Estación:</label>
          <select
            className="input"
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
            style={{ width: '120px' }}
          >
            <option value="verano">Verano</option>
            <option value="primavera">Primavera</option>
            <option value="otoño">Otoño</option>
            <option value="invierno">Invierno</option>
          </select>
        </div>

        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', marginLeft: '16px' }}>
          <label style={{ marginRight: '8px', marginBottom: 0 }}>Latitud:</label>
          <input
            className="input"
            type="number"
            value={latitude}
            onChange={(e) => onLatitudeChange(parseFloat(e.target.value))}
            style={{ width: '80px' }}
            min="-90"
            max="90"
          />
        </div>
      </div>

      <div className={styles.right}>
        <button 
          className="btn btn-secondary" 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onSimulate}
          disabled={isSimulating}
        >
          {isSimulating ? 'Simulando...' : '▶ Simular'}
        </button>
      </div>
    </div>
  );
}
