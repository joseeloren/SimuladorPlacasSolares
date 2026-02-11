'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Simulation } from '@prisma/client';
import styles from './page.module.css';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSimulations();
    }
  }, [status, router]);

  const fetchSimulations = async () => {
    try {
      const res = await fetch('/api/simulations');
      if (res.ok) {
        const data = await res.json();
        setSimulations(data);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSimName }),
      });
      if (res.ok) {
        const newSim = await res.json();
        router.push(`/simulation/${newSim.id}`);
      }
    } catch (error) {
      console.error('Error creating simulation:', error);
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de querer eliminar esta simulación?')) return;

    try {
      const res = await fetch(`/api/simulations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSimulations(simulations.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting simulation:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>☀️ Simulador Solar</div>
        <div className={styles.userMenu}>
          <span>Hola, {session?.user?.name}</span>
          <button onClick={() => signOut()} className="btn btn-secondary btn-sm">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Mis Simulaciones</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Nueva Simulación
          </button>
        </div>

        {simulations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔋</div>
            <h3>No tienes simulaciones creadas</h3>
            <p>Empieza creando tu primer proyecto fotovoltaico.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              Crear Simulación
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {simulations.map((sim) => (
              <div
                key={sim.id}
                className={styles.card}
                onClick={() => router.push(`/simulation/${sim.id}`)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>⚡</div>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, sim.id)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
                <h3 className={styles.cardTitle}>{sim.name}</h3>
                <div className={styles.cardMeta}>
                  <span>📍 {sim.latitude}° Lat</span>
                  <span>🗓️ {sim.season}</span>
                </div>
                <div className={styles.cardDate}>
                  Editado: {new Date(sim.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Nueva Simulación</h2>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Nombre del proyecto</label>
                <input
                  className="input"
                  type="text"
                  value={newSimName}
                  onChange={(e) => setNewSimName(e.target.value)}
                  placeholder="Ej: Casa de campo"
                  autoFocus
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating || !newSimName.trim()}
                >
                  {creating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
