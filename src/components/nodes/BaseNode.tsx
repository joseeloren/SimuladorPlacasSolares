import { Handle, Position } from 'reactflow';
import styles from '../nodes.module.css';

interface BaseNodeProps {
  data: { label?: string };
  selected?: boolean;
  type: 'solarPanel' | 'battery' | 'consumer';
  icon: string;
  className?: string;
  children?: React.ReactNode;
}

export default function BaseNode({ data, selected, type, icon, className, children }: BaseNodeProps) {
  return (
    <div className={`${styles.node} ${styles[type]} ${selected ? styles.selected : ''} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{data.label || 'Node'}</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
      
      {/* Handles logic: 
          Solar Panel: Only source (bottom)
          Consumer: Only target (top)
          Battery: Both (top = input, bottom = output)
      */}
      
      {(type === 'battery' || type === 'consumer') && (
        <Handle
          type="target"
          position={Position.Top}
          className={styles.handleInput}
          isConnectable={true}
        />
      )}
      
      {(type === 'solarPanel' || type === 'battery') && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={styles.handleOutput}
          isConnectable={true}
        />
      )}
    </div>
  );
}
