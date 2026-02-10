import React from 'react';
import { Handle, Position } from 'reactflow';
import styles from './NodeStyles.module.css';

const BatteryNode = ({ data }: { data: { label: string; capacity?: number; initialCharge?: number } }) => {
  return (
    <div className={`${styles.node} ${styles.battery}`}>
      <div className={styles.header}>
        <span className={styles.icon}>🔋</span>
        <div className={styles.title}>{data.label || 'Batería'}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.stat}>
          <span>Capacidad:</span>
          <strong>{data.capacity || 10} kWh</strong>
        </div>
        <div className={styles.chargeBar}>
          <div 
            className={styles.chargeFill} 
            style={{ width: `${data.initialCharge || 50}%` }}
          ></div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
      />
    </div>
  );
};

export default BatteryNode;
