'use client';

import React, { useState, useEffect } from 'react';
import styles from './properties.module.css';

interface NodeData {
  label?: string;
  [key: string]: any;
}

interface PropertiesProps {
  selectedNode: {
    id: string;
    type?: string;
    data: NodeData;
  } | null;
  onChange: (id: string, data: NodeData) => void;
  onDelete: (id: string) => void;
}

export default function PropertiesPanel({ selectedNode, onChange, onDelete }: PropertiesProps) {
  const [formData, setFormData] = useState<NodeData>({});

  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data);
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <aside className={styles.panel}>
        <div className={styles.emptyState}>
          Calcula tu instalación
          <p className={styles.hint}>Selecciona un componente para editar sus propiedades</p>
        </div>
      </aside>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;

    if (type === 'number') {
      newValue = parseFloat(value);
    }

    const newData = { ...formData, [name]: newValue };
    setFormData(newData);
    onChange(selectedNode.id, newData);
  };

  const renderFields = () => {
    switch (selectedNode.type) {
      case 'solarPanel':
        return (
          <>
            <div className="input-group">
              <label>Área (m²)</label>
              <input
                className="input"
                type="number"
                name="area"
                value={formData.area || 10}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="input-group">
              <label>Eficiencia (0-1)</label>
              <input
                className="input"
                type="number"
                name="efficiency"
                value={formData.efficiency || 0.2}
                onChange={handleChange}
                step="0.01"
                min="0.1"
                max="1"
              />
            </div>
             <div className="input-group">
              <label>Potencia estimada (W)</label>
              <div className={styles.readOnlyValue}>
                {Math.round((formData.area || 10) * (formData.efficiency || 0.2) * 1000)} W
              </div>
            </div>
          </>
        );
      case 'battery':
        return (
          <>
            <div className="input-group">
              <label>Capacidad (kWh)</label>
              <input
                className="input"
                type="number"
                name="capacity"
                value={formData.capacity || 10}
                onChange={handleChange}
                min="1"
              />
            </div>
             <div className="input-group">
              <label>Carga Inicial (%)</label>
              <input
                className="input"
                type="number"
                name="initialCharge"
                value={formData.initialCharge || 50}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
            <div className="input-group">
              <label>Tasa Carga (kW)</label>
              <input
                className="input"
                type="number"
                name="chargeRate"
                value={formData.chargeRate || 3}
                onChange={handleChange}
                min="0.1"
              />
            </div>
            <div className="input-group">
              <label>Tasa Descarga (kW)</label>
              <input
                className="input"
                type="number"
                name="dischargeRate"
                value={formData.dischargeRate || 3}
                onChange={handleChange}
                min="0.1"
              />
            </div>
          </>
        );
      case 'house':
      case 'industry':
      case 'evStation':
        return (
          <div className="input-group">
            <label>Consumo Base (kW)</label>
             <p className={styles.hintInfo}>Este valor se ajusta según la hora del día</p>
            <input
              className="input"
              type="number"
              name="baseConsumption"
              value={formData.baseConsumption || 2}
              onChange={handleChange}
              min="0.1"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h3>Propiedades</h3>
        <span className={styles.typeBadge}>{selectedNode.type}</span>
      </div>

      <div className={styles.content}>
        <div className="input-group">
          <label>Etiqueta</label>
          <input
            className="input"
            type="text"
            name="label"
            value={formData.label || ''}
            onChange={handleChange}
          />
        </div>

        {renderFields()}
      </div>

      <div className={styles.footer}>
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(selectedNode.id)}
        >
          Eliminar Componente
        </button>
      </div>
    </aside>
  );
}
