'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import styles from './results.module.css';

interface SimulationResult {
  horas: any[];
  resumen: {
    produccionTotal: number;
    consumoTotal: number;
    energiaAlmacenada: number;
    deficitTotal: number;
    excedenteTotal: number;
    autosuficiencia: number;
  };
}

interface ResultsModalProps {
  results: SimulationResult | null;
  onClose: () => void;
}

export default function ResultsModal({ results, onClose }: ResultsModalProps) {
  if (!results) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Resultados de Simulación (24h)</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Producción Solar</span>
              <span className={styles.value}>{results.resumen.produccionTotal} kWh</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Consumo Total</span>
              <span className={styles.value}>{results.resumen.consumoTotal} kWh</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Autosuficiencia</span>
              <span className={`${styles.value} ${results.resumen.autosuficiencia >= 100 ? styles.success : ''}`}>
                {results.resumen.autosuficiencia}%
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Déficit de Red</span>
              <span className={styles.valueRed}>{results.resumen.deficitTotal} kWh</span>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <h3>Balance Energético</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={results.horas}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBateria" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hora" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2235', borderColor: '#334155' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Area type="monotone" dataKey="produccionSolar" stackId="1" stroke="#f59e0b" fill="url(#colorSolar)" name="Producción Solar" />
                <Area type="monotone" dataKey="descargaBaterias" stackId="1" stroke="#6366f1" fill="url(#colorBateria)" name="Descarga Batería" />
                <Area type="monotone" dataKey="consumoTotal" stackId="2" stroke="#ef4444" fill="url(#colorConsumo)" name="Consumo" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartContainer}>
            <h3>Estado de Baterías</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={results.horas}>
                <defs>
                  <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hora" />
                <YAxis unit="%" domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a2235', borderColor: '#334155' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="nivelBateriasPct" stroke="#10b981" fill="url(#colorNivel)" name="Nivel de Carga (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
