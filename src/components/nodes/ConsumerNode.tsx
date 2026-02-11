import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './NodeStyles.module.css';

const ConsumerNode = ({ data, type }: { data: { label: string; baseConsumption?: number }, type: string }) => {
  const getIcon = () => {
    switch (type) {
      case 'house': return '🏠';
      case 'industry': return '🏭';
      case 'evStation': return '⚡';
      default: return '🔌';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'house': return 'Casa';
      case 'industry': return 'Industria';
      case 'evStation': return 'Carga EV';
      default: return 'Consumidor';
    }
  };

  return (
    <div className={`${styles.node} ${styles.consumer}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{getIcon()}</span>
        <div className={styles.title}>{data.label || getLabel()}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.stat}>
          <span>Consumo Base:</span>
          <strong>{data.baseConsumption || 2} kW</strong>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
      />
    </div>
  );
};

export default ConsumerNode;
