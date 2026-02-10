'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Error al registrarse');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow} />
      <div className={styles.formCard}>
        <div className={styles.header}>
          <div className={styles.logo}>☀️</div>
          <h1 className={styles.title}>
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className={styles.subtitle}>
            {isRegistering
              ? 'Crea tu cuenta para guardar simulaciones'
              : 'Accede a tus simulaciones'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isRegistering && (
            <div className="input-group animate-fade-in">
              <label>Nombre</label>
              <input
                className="input"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            className={styles.toggleBtn}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
