/**
 * Motor de simulación solar
 * Calcula la producción de energía solar y el balance energético hora a hora
 */

// ============== CONSTANTES FÍSICAS ==============

const CONSTANTES = {
  PR_SISTEMA: 0.86,          // Performance Ratio (pérdidas por cableado, inversor, suciedad, etc.)
  TEMP_BASE: 20,             // Temperatura ambiente base (°C)
  NOCT: 45,                  // Temperatura nominal de operación de célula (°C)
  COEF_TEMP: -0.004,         // Coeficiente de temperatura (-0.4%/°C)
  IRRAD_STC: 1000,           // Irradiancia en condiciones estándar de prueba (W/m²)
};

// ============== IRRADIACIÓN Y CLIMA ==============

/**
 * Calcula la temperatura ambiente estimada para una hora del día
 * Modelo simple: mínima al amanecer (6h), máxima a las 15h
 */
function calcularTemperaturaAmbiente(hora: number, estacion: string): number {
  let tempBase = CONSTANTES.TEMP_BASE;
  let variacion = 5; // ±5°C

  // Ajuste estacional
  switch (estacion) {
    case 'invierno': tempBase -= 10; variacion = 3; break;
    case 'primavera': tempBase -= 2; variacion = 5; break;
    case 'otoño': tempBase -= 5; variacion = 4; break;
    case 'verano': tempBase += 5; variacion = 7; break;
  }

  // Curva sinusoidal desplazada (pico a las 15:00)
  // (hora - 15) / 12 * PI -> -PI a 0 a PI (aprox)
  const offset = (hora - 15) * (Math.PI / 12);
  return tempBase + Math.cos(offset) * variacion;
}

/**
 * Genera un perfil de nubosidad aleatoria para el día
 * Devuelve un array de 24 factores (0-1), donde 1 es cielo despejado
 */
function generarPerfilNubes(): number[] {
  const perfil: number[] = [];
  let nubesActual = 1.0;

  for (let i = 0; i < 24; i++) {
    // Probabilidad de cambio de nubosidad
    if (Math.random() > 0.7) {
      // Cambio aleatorio entre 0.6 y 1.0
      nubesActual = 0.6 + Math.random() * 0.4;
    }
    // Suavizado temporal: tendencia a mantener el estado anterior
    perfil.push(nubesActual);
  }
  return perfil;
}

/**
 * Calcula la irradiación solar (W/m²) teórica sin nubes
 */
export function calcularIrradiacionTeorica(
  hora: number,
  estacion: string,
  latitud: number
): number {
  // Horas de salida y puesta del sol por estación (aprox para latitud ~28-40°N)
  const perfilesEstacion: Record<string, { salidaSol: number; puestaSol: number; picoIrradiacion: number }> = {
    verano: { salidaSol: 6, puestaSol: 21, picoIrradiacion: 1000 },
    primavera: { salidaSol: 7, puestaSol: 20, picoIrradiacion: 850 },
    otoño: { salidaSol: 7.5, puestaSol: 19, picoIrradiacion: 700 },
    invierno: { salidaSol: 8, puestaSol: 18, picoIrradiacion: 500 },
  };

  const perfil = perfilesEstacion[estacion] || perfilesEstacion.verano;

  // Ajuste por latitud (las latitudes más bajas reciben más sol)
  const factorLatitud = Math.max(0.5, 1 - Math.abs(latitud - 25) * 0.008);

  if (hora < perfil.salidaSol || hora > perfil.puestaSol) {
    return 0;
  }

  // Curva sinusoidal entre salida y puesta del sol
  const duracionDia = perfil.puestaSol - perfil.salidaSol;
  const progreso = (hora - perfil.salidaSol) / duracionDia;
  const irradiacion = perfil.picoIrradiacion * Math.sin(progreso * Math.PI) * factorLatitud;

  return Math.max(0, irradiacion);
}

// ============== PERFILES DE CONSUMO ==============

/**
 * Devuelve el factor de consumo (0-1) para un tipo de consumidor en una hora dada
 */
export function obtenerFactorConsumo(tipo: string, hora: number): number {
  const perfiles: Record<string, number[]> = {
    house: [
      0.3, 0.25, 0.2, 0.2, 0.2, 0.25, // 0-5: noche, consumo bajo
      0.6, 0.7, 0.65, 0.4, 0.35, 0.3,   // 6-11: mañana
      0.35, 0.5, 0.5, 0.45, 0.5, 0.6,   // 12-17: tarde
      0.8, 0.9, 1.0, 0.9, 0.7, 0.5      // 18-23: noche, pico
    ],
    industry: [
      0.1, 0.1, 0.1, 0.1, 0.1, 0.15,   // 0-5: noche, casi parada
      0.7, 0.9, 1.0, 1.0, 1.0, 0.95,    // 6-11: producción plena
      0.9, 1.0, 1.0, 0.95, 0.85, 0.7,   // 12-17: tarde
      0.4, 0.3, 0.2, 0.15, 0.1, 0.1     // 18-23: cierre
    ],
    evStation: [
      0.15, 0.1, 0.1, 0.1, 0.1, 0.15,  // 0-5: noche
      0.3, 0.5, 0.6, 0.5, 0.4, 0.45,    // 6-11: mañana
      0.5, 0.55, 0.6, 0.7, 0.85, 1.0,   // 12-17: tarde, pico
      0.9, 0.8, 0.6, 0.4, 0.3, 0.2      // 18-23: noche
    ],
  };

  const perfil = perfiles[tipo];
  if (!perfil) return 0.5;

  const horaIndex = Math.floor(hora) % 24;
  return perfil[horaIndex];
}

// ============== TIPOS ==============

export interface NodoSimulacion {
  id: string;
  type: string;
  data: {
    area?: number;           // m²
    efficiency?: number;     // 0-1
    capacity?: number;       // kWh
    chargeRate?: number;     // kW
    dischargeRate?: number;  // kW
    initialCharge?: number;  // %
    baseConsumption?: number;// kW
    label?: string;
  };
}

export interface ConexionSimulacion {
  source: string;
  target: string;
}

export interface ResultadoHora {
  hora: number;
  irradiacion: number;        // W/m² (real, con nubes)
  factorNube: number;         // 0-1
  tempAmbiente: number;       // °C
  tempCelda: number;          // °C
  eficienciaReal: number;     // % (tras pérdidas térmicas)
  produccionSolar: number;    // kW
  consumoTotal: number;       // kW
  cargaBaterias: number;      // kW
  nivelBaterias: number;      // kWh
  nivelBateriasPct: number;   // %
  deficitRed: number;         // kW
  excedenteRed: number;       // kW
  descargaBaterias: number;   // kW
}

export interface ResultadoSimulacion {
  horas: ResultadoHora[];
  resumen: {
    produccionTotal: number;
    consumoTotal: number;
    energiaAlmacenada: number;
    deficitTotal: number;
    excedenteTotal: number;
    autosuficiencia: number;
    perdidasSistema: number; // kWh estimados perdidos por PR y Temp
  };
}

// ============== MOTOR DE SIMULACIÓN ==============

export function ejecutarSimulacion(
  nodos: NodoSimulacion[],
  conexiones: ConexionSimulacion[],
  estacion: string,
  latitud: number
): ResultadoSimulacion {
  const paneles = nodos.filter(n => n.type === 'solarPanel');
  const baterias = nodos.filter(n => n.type === 'battery');
  const consumidores = nodos.filter(n =>
    n.type === 'house' || n.type === 'industry' || n.type === 'evStation'
  );

  // Verificar conexiones
  const nodosConectados = new Set<string>();
  conexiones.forEach(c => {
    nodosConectados.add(c.source);
    nodosConectados.add(c.target);
  });

  const panelesActivos = paneles.filter(p => nodosConectados.has(p.id));
  const bateriasActivas = baterias.filter(b => nodosConectados.has(b.id));
  const consumidoresActivos = consumidores.filter(c => nodosConectados.has(c.id));

  // Estado de baterías
  const estadoBaterias = bateriasActivas.map(b => ({
    id: b.id,
    capacidad: b.data.capacity || 10,
    tasaCarga: b.data.chargeRate || 3,
    tasaDescarga: b.data.dischargeRate || 3,
    nivelActual: ((b.data.initialCharge || 50) / 100) * (b.data.capacity || 10),
  }));

  const capacidadTotal = estadoBaterias.reduce((sum, b) => sum + b.capacidad, 0);

  // Generar perfil de nubes para el día
  const perfilNubes = generarPerfilNubes();

  const horas: ResultadoHora[] = [];
  let produccionAcumulada = 0;
  let consumoAcumulado = 0;
  let deficitAcumulado = 0;
  let excedenteAcumulado = 0;
  let produccionTeoricaSinPerdidas = 0;

  for (let hora = 0; hora < 24; hora++) {
    // 1. Clima
    const irradTeorica = calcularIrradiacionTeorica(hora, estacion, latitud);
    const factorNube = perfilNubes[hora];
    const irradiacionReal = irradTeorica * factorNube;
    const tempAmbiente = calcularTemperaturaAmbiente(hora, estacion);

    // 2. Temperatura de célula
    // T_cell = T_amb + (NOCT - 20) * (G / 800)
    const tempCelda = tempAmbiente + (CONSTANTES.NOCT - 20) * (irradiacionReal / 800);

    // 3. Producción solar total (kW) con pérdidas
    let sumEficiencia = 0;
    
    const produccionSolar = panelesActivos.reduce((sum, panel) => {
      const area = panel.data.area || 10;
      const eficienciaNominal = panel.data.efficiency || 0.2;

      // Factor de pérdida por temperatura
      // Si T_cell > 25, la eficiencia baja
      const deltaTemp = tempCelda - 25;
      const factorTemp = 1 + (CONSTANTES.COEF_TEMP * deltaTemp); 
      // factorTemp puede ser > 1 si hace mucho frío, o < 1 si hace calor

      // Rendimiento real del panel
      const rendimientoReal = Math.max(0, eficienciaNominal * factorTemp * CONSTANTES.PR_SISTEMA);

      sumEficiencia += rendimientoReal; // Solo para promedio estadístico

      // Potencia = Irradiancia * Area * Rendimiento
      // (W/m² * m² * %) / 1000 -> kW
      return sum + (irradiacionReal * area * rendimientoReal) / 1000;
    }, 0);

    // Promedio de eficiencia real para mostrar en gráfica si se quisiera
    const eficienciaPromedio = panelesActivos.length > 0 ? sumEficiencia / panelesActivos.length : 0;

    // Cálculo teórico para estimar pérdidas en resumen
    const produccionTeoricaHora = panelesActivos.reduce((sum, panel) => {
        return sum + (irradTeorica * (panel.data.area || 10) * (panel.data.efficiency || 0.2)) / 1000;
    }, 0);
    produccionTeoricaSinPerdidas += produccionTeoricaHora;

    // 4. Consumo total (kW)
    const consumoTotal = consumidoresActivos.reduce((sum, cons) => {
      const consumoBase = cons.data.baseConsumption || 2;
      const factor = obtenerFactorConsumo(cons.type, hora);
      return sum + consumoBase * factor;
    }, 0);

    // 5. Balance
    let balance = produccionSolar - consumoTotal;
    let cargaBaterias = 0;
    let descargaBaterias = 0;
    let deficitRed = 0;
    let excedenteRed = 0;

    if (balance > 0) {
      let excedente = balance;
      for (const bat of estadoBaterias) {
        const espacio = bat.capacidad - bat.nivelActual;
        const carga = Math.min(excedente, bat.tasaCarga, espacio);
        bat.nivelActual += carga;
        cargaBaterias += carga;
        excedente -= carga;
      }
      excedenteRed = excedente;
    } else if (balance < 0) {
      let deficit = Math.abs(balance);
      for (const bat of estadoBaterias) {
        const descarga = Math.min(deficit, bat.tasaDescarga, bat.nivelActual);
        bat.nivelActual -= descarga;
        descargaBaterias += descarga;
        deficit -= descarga;
      }
      deficitRed = deficit;
      cargaBaterias = -descargaBaterias;
    }

    const nivelTotal = estadoBaterias.reduce((sum, b) => sum + b.nivelActual, 0);

    horas.push({
      hora,
      irradiacion: Math.round(irradiacionReal * 100) / 100,
      factorNube: Math.round(factorNube * 100) / 100,
      tempAmbiente: Math.round(tempAmbiente * 10) / 10,
      tempCelda: Math.round(tempCelda * 10) / 10,
      eficienciaReal: Math.round(eficienciaPromedio * 10000) / 100, // % con 2 decimales
      produccionSolar: Math.round(produccionSolar * 100) / 100,
      consumoTotal: Math.round(consumoTotal * 100) / 100,
      cargaBaterias: Math.round(cargaBaterias * 100) / 100,
      nivelBaterias: Math.round(nivelTotal * 100) / 100,
      nivelBateriasPct: capacidadTotal > 0 ? Math.round((nivelTotal / capacidadTotal) * 10000) / 100 : 0,
      deficitRed: Math.round(deficitRed * 100) / 100,
      excedenteRed: Math.round(excedenteRed * 100) / 100,
      descargaBaterias: Math.round(descargaBaterias * 100) / 100,
    });

    produccionAcumulada += produccionSolar;
    consumoAcumulado += consumoTotal;
    deficitAcumulado += deficitRed;
    excedenteAcumulado += excedenteRed;
  }

  const energiaFinal = estadoBaterias.reduce((sum, b) => sum + b.nivelActual, 0);

  return {
    horas,
    resumen: {
      produccionTotal: Math.round(produccionAcumulada * 100) / 100,
      consumoTotal: Math.round(consumoAcumulado * 100) / 100,
      energiaAlmacenada: Math.round(energiaFinal * 100) / 100,
      deficitTotal: Math.round(deficitAcumulado * 100) / 100,
      excedenteTotal: Math.round(excedenteAcumulado * 100) / 100,
      autosuficiencia: consumoAcumulado > 0 ? Math.round(((consumoAcumulado - deficitAcumulado) / consumoAcumulado) * 10000) / 100 : 100,
      perdidasSistema: Math.round((produccionTeoricaSinPerdidas - produccionAcumulada) * 100) / 100,
    },
  };
}
