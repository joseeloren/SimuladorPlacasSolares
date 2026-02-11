
import { ejecutarSimulacion, NodoSimulacion, ConexionSimulacion } from '../src/lib/solarEngine';

/**
 * Script de Verificación de Realismo
 * Ejecuta escenarios de prueba para validar las mejoras físicas en el motor solar.
 */

function runVerification() {
  console.log('🌞 Iniciando Verificación de Realismo Solar...\n');

  // Configuración base de prueba
  const paneles: NodoSimulacion = {
    id: 'panel-1',
    type: 'solarPanel',
    data: { area: 10, efficiency: 0.2, label: 'Panel Test' } // 10m2 * 20% = 2kWp
  };
  
  const casa: NodoSimulacion = {
    id: 'house-1',
    type: 'house',
    data: { baseConsumption: 0, label: 'Sin Consumo' }
  };

  const conexion: ConexionSimulacion = { source: 'panel-1', target: 'house-1' };

  // Escenario 1: Verano (Calor -> Pérdidas por temperatura)
  console.log('--- Escenario 1: Impacto de Temperatura (Verano 40° Lat) ---');
  const simVerano = ejecutarSimulacion([paneles, casa], [conexion], 'verano', 40);
  
  const horaPico = 14;
  const datosPico = simVerano.horas.find(h => h.hora === horaPico);
  
  if (datosPico) {
    console.log(`Hora ${horaPico}:00`);
    console.log(`- Irradiancia: ${datosPico.irradiacion} W/m² (Nubes: ${datosPico.factorNube})`);
    console.log(`- Temp Ambiente: ${datosPico.tempAmbiente}°C`);
    console.log(`- Temp Célula: ${datosPico.tempCelda}°C`);
    console.log(`- Eficiencia Real: ${datosPico.eficienciaReal}% (Nominal 20%)`);
    
    // Validación de física
    const perdidaTemp = 20 - datosPico.eficienciaReal;
    if (perdidaTemp > 0) {
      console.log(`✅ [PASS] Pérdida de eficiencia detectada: -${perdidaTemp.toFixed(2)}% puntos`);
    } else {
      console.log(`❌ [FAIL] La eficiencia no bajó con el calor.`);
    }

    const prEsperado = 0.86;
    console.log(`- PR del Sistema aplicado (base): ${prEsperado}`);
  }

  // Escenario 2: Variabilidad de Nubes
  console.log('\n--- Escenario 2: Variabilidad Climática (Nubes) ---');
  const horasConNubes = simVerano.horas.filter(h => h.factorNube < 1.0 && h.irradiacion > 0);
  console.log(`Horas con nubosidad (<1.0): ${horasConNubes.length} de ${simVerano.horas.filter(h => h.irradiacion > 0).length} horas de sol`);
  
  if (horasConNubes.length > 0) {
     console.log(`✅ [PASS] Se detectó variabilidad de nubes.`);
     console.log(`Ejemplo de factor nube: ${horasConNubes[0].factorNube.toFixed(2)} a las ${horasConNubes[0].hora}:00`);
  } else {
     console.log(`⚠️ [WARN] Día completamente despejado (posible, pero verificar aleatoriedad).`);
  }

  // Escenario 3: Comparativa Estacional (Invierno vs Verano)
  console.log('\n--- Escenario 3: Comparativa Invierno vs Verano ---');
  const simInvierno = ejecutarSimulacion([paneles, casa], [conexion], 'invierno', 40);
  
  console.log(`Producción Total Verano: ${simVerano.resumen.produccionTotal} kWh`);
  console.log(`Producción Total Invierno: ${simInvierno.resumen.produccionTotal} kWh`);
  
  if (simVerano.resumen.produccionTotal > simInvierno.resumen.produccionTotal) {
    console.log(`✅ [PASS] Verano produce más que invierno (lógico).`);
  } else {
    console.log(`❌ [FAIL] Invierno produjo más o igual que verano.`);
  }

  console.log('\n--- Resumen Global ---');
  console.log(`Pérdidas estimadas del sistema (Verano): ${simVerano.resumen.perdidasSistema} kWh`);
}

runVerification();
