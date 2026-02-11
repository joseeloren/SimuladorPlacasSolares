'use client';

import React from 'react';
import styles from './sidebar.module.css';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sectionTitle}>Componentes</h3>
      <div className={styles.nodeList}>
        <div
          className={`${styles.dndNode} ${styles.nodeSolar}`}
          onDragStart={(event) => onDragStart(event, 'solarPanel')}
          draggable
        >
          <span className={styles.nodeIcon}>☀️</span>
          Panel Solar
        </div>
        <div
          className={`${styles.dndNode} ${styles.nodeBattery}`}
          onDragStart={(event) => onDragStart(event, 'battery')}
          draggable
        >
          <span className={styles.nodeIcon}>🔋</span>
          Batería
        </div>
        <div className={styles.divider}></div>
        <h4 className={styles.subTitle}>Consumidores</h4>
        <div
          className={`${styles.dndNode} ${styles.nodeConsumer}`}
          onDragStart={(event) => onDragStart(event, 'house')}
          draggable
        >
          <span className={styles.nodeIcon}>🏠</span>
          Casa
        </div>
        <div
          className={`${styles.dndNode} ${styles.nodeConsumer}`}
          onDragStart={(event) => onDragStart(event, 'industry')}
          draggable
        >
          <span className={styles.nodeIcon}>🏭</span>
          Industria
        </div>
        <div
          className={`${styles.dndNode} ${styles.nodeConsumer}`}
          onDragStart={(event) => onDragStart(event, 'evStation')}
          draggable
        >
          <span className={styles.nodeIcon}>⚡</span>
          Carga EV
        </div>
      </div>
      
      <div className={styles.infoBox}>
        <p>Arrastra los componentes al canvas para diseñar tu sistema.</p>
      </div>
    </aside>
  );
}
