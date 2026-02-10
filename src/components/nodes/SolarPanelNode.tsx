import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './NodeStyles.module.css';

const SolarPanelNode = ({ data }: { data: { label: string; area?: number; efficiency?: number } }) => {
  const power = Math.round((data.area || 10) * (data.efficiency || 0.2) * 1000);
  
  return (
    <div className={`${styles.node} ${styles.solarPanel}`}>
      <div className={styles.header}>
        <span className={styles.icon}>☀️</span>
        <div className={styles.title}>{data.label || 'Panel Solar'}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.stat}>
          <span>Potencia:</span>
          <strong>{power} W</strong>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
    </div>
  );
};

export default SolarPanelNode;
