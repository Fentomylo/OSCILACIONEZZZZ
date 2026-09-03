export function createParameters() {
  return {
    // --- Kuramoto base ---
    nodeCount: 8,
    dt: 0.025,
    couplingStrength: 1.8,   // K global (agentes "libres" en el escritorio, acople de campo medio)
    noise: 0.18,
    phaseDrift: 0.35,
    order: 0.0,              // r, parámetro de orden global (solo agentes NO en papelera)
    orderPhase: 0.0,         // ψ, fase promedio del colectivo
    musicBpm: 152,           // tempo del Transport — hyperpop/PC music, tipo "iPod Touch"

    // --- Movimiento en el escritorio 2D ---
    wanderSpeed: 0.9,        // unidades/seg al ir hacia su destino de deambulación
    wanderRetarget: 2.5,     // segundos promedio entre cambios de destino
    desktopBounds: { minX: -7.6, maxX: 7.6, minY: -3.9, maxY: 4.2 },

    // --- Pulso / beat visual y sonoro ---
    beatKickScale: 0.55,     // qué tan grande es el "thump" al pulsar
    beatKickDecay: 4.2,      // qué tan rápido decae el thump (más alto = más corto)

    // --- Temblor por hi-hat (independiente del kick de fase) ---
    hatShakeAmount: 0.055,   // amplitud del jitter de posición, en unidades de mundo
    hatShakeDecay: 16,       // qué tan rápido decae el temblor (más alto = más nervioso/corto)

    // --- Atributos dinámicos para Paint ---
    paintDensity: 0.0,

    // --- Efectos por tipo de ventana ---
    windowEffects: {
      google: {
        // desacopla: cada agente adentro corre solo con su propio ω_i
        decouple: true
      },
      files: {
        // agrupa fuerte: solo se acoplan entre sí los agentes dentro de la MISMA ventana
        groupCouplingBoost: 2.2
      },
      player: {
        // sincronía forzada: metrónomo interno que arrastra la fase de quien esté adentro
        beatBpm: 100,
        pullStrength: 3.2
      },
      paint: {
        pitchModulation: true
      },
      gmail: {
        pulseFrequency: 1.5
      },
      trash: {
        // aísla y silencia por completo, y se excluye del cálculo de r
        freeze: true
      }
    },

    // Fase interna del "metrónomo" del Reproductor (avanza sola, independiente del ruido)
    playerMetronomePhase: 0
  };
}