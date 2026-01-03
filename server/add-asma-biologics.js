import { User, Drug, UserSettings } from './src/models/index.js';
import sequelize from './src/config/database.js';

const adminEmail = 'admin@infharma.com';

// Datos de los medicamentos biológicos para asma
const biologicos = [
  {
    name: 'Omalizumab (Xolair®)',
    dci: 'Omalizumab',
    system: 'Neumología',
    subArea: 'Asma',
    type: 'Anti-IgE (Anticuerpo monoclonal)',
    presentation: 'Solución inyectable 75mg, 150mg, 300mg (jeringas/plumas precargadas)',
    proSections: [
      {
        id: 'validacion_indicacion',
        title: '1. Validación de la Indicación',
        type: 'checklist',
        items: [
          'Asma alérgica grave persistente confirmada',
          'Test cutáneo positivo O IgE específica in vitro positiva a aeroalérgeno perenne',
          'FEV1 <80% del valor teórico (adultos/adolescentes)',
          'Síntomas frecuentes durante el día O despertares nocturnos',
          'Múltiples exacerbaciones graves documentadas',
          'Tratamiento actual: CI dosis altas (≥1000 µg beclometasona o equivalente) + LABA',
          'IgE total basal: 30-1500 UI/ml (CRÍTICO - medir ANTES de iniciar)',
          'Peso corporal dentro de los límites de las tablas de dosificación'
        ],
        footer: 'CRÍTICO: IgE basal es ESENCIAL para dosificación. NO medir durante tratamiento (se eleva por complejos omalizumab-IgE).'
      },
      {
        id: 'screening',
        title: '2. Screening Pre-tratamiento',
        type: 'checklist',
        items: [
          'IgE total sérica basal (método comercial validado)',
          'Prick test a aeroalérgenos perennes O IgE específica in vitro',
          'Espirometría con FEV1 (confirmar FEV1 <80%)',
          'Descartar antecedentes hipersensibilidad a omalizumab',
          'Evaluar antecedentes de anafilaxia (factor de riesgo)',
          'Riesgo elevado infección helmíntica (viajes zonas endémicas)',
          'Documentar exacerbaciones previas (número, gravedad)'
        ],
        footer: 'Antecedentes de anafilaxia = FACTOR DE RIESGO aumentado'
      },
      {
        id: 'posologia',
        title: '3. Cronograma Posológico',
        type: 'text',
        content: `**DETERMINACIÓN DE DOSIS (según IgE basal + peso):**

**Pasos:**
1. Medir IgE basal + peso corporal
2. Aplicar tablas de dosificación (ver ficha técnica completa)
3. Determinar frecuencia: cada 4 semanas O cada 2 semanas

**Ejemplos dosis:**
- IgE 50 UI/ml, peso 70 kg → 150 mg cada 4 semanas
- IgE 250 UI/ml, peso 80 kg → 450 mg cada 4 semanas
- IgE 600 UI/ml, peso 60 kg → 600 mg cada 4 semanas

**Dosis máxima:** 600 mg cada 2 semanas

**Presentaciones:**
- Polvo liofilizado: 75mg, 150mg (reconstitución necesaria 15-20 min)
- Jeringas precargadas: 75mg, 150mg, 300mg
- Plumas precargadas: 75mg, 150mg, 300mg

**VÍA:** Subcutánea ÚNICAMENTE (muslo, abdomen o brazo)
**Si >150 mg:** dividir en múltiples puntos de inyección`
      },
      {
        id: 'monitorizacion',
        title: '4. Monitorización durante Tratamiento',
        type: 'text',
        content: `**EVALUACIÓN A LAS 16 SEMANAS (OBLIGATORIA):**
- GETE score (Global Evaluation of Treatment Effectiveness)
- Decisión continuar: si notable mejoría en control global del asma
- Si NO respuesta clara → considerar suspender

**Parámetros cada 3-6 meses:**
- Número de exacerbaciones (objetivo: reducción ≥40-50%)
- ACT (Asthma Control Test) / ACQ
- FEV1 (mejoría esperada: 100-150 ml)
- Uso de medicación de rescate
- Dosis de corticoides sistémicos (si aplica)
- **NO medir IgE total** (se eleva durante tratamiento)

**Observación post-inyección (CRÍTICO):**
- **Primeras 3 dosis: 2 horas en hospital**
- Monitorizar signos anafilaxia
- Mayoría de anafilaxias ocurren durante primeras 3 dosis
- Reacciones pueden ocurrir hasta 24h post-inyección
- Dosis 4ª en adelante: 30 minutos (si sin antecedentes)`
      },
      {
        id: 'efectos_adversos',
        title: '5. Manejo de Efectos Adversos',
        type: 'text',
        content: `**ANAFILAXIA (0.2% poscomercialización):**
- Mayoría durante primeras 3 dosis y dentro de 2 horas
- Posible hasta 24 horas post-inyección
- **MANEJO:** Interrumpir inmediatamente, adrenalina IM, NO reintroducir nunca

**REACCIONES FRECUENTES:**
- Cefalea
- Reacciones lugar inyección (tumefacción, eritema, dolor)
- Artralgia
- Dolor abdominal superior (niños)

**CHURG-STRAUSS / GEPA:**
- Vigilar especialmente si reducción corticoides orales
- Signos: eosinofilia, rash vasculítico, síntomas pulmonares, neuropatía
- Si aparece → considerar interrupción

**ENFERMEDAD DEL SUERO:**
- Inicio 1-5 días post-inyección
- Síntomas: artritis/artralgias, rash, fiebre, linfoadenopatía
- Tratamiento: antihistamínicos y corticoides

**CRITERIOS SUSPENSIÓN:**
- Anafilaxia (OBLIGATORIO)
- Falta eficacia a las 16 semanas
- Churg-Strauss/GEPA grave
- Efectos adversos intolerables`
      }
    ],
    patientSections: {
      intro: 'Omalizumab (Xolair®) es un anticuerpo que bloquea la IgE, reduciendo las reacciones alérgicas y mejorando el control del asma.',
      admin: [
        'Inyección subcutánea en muslo, abdomen o brazo',
        'Administrada por profesional sanitario',
        'Desde 4ª dosis puede autoadministrarse (si sin antecedentes anafilaxia)',
        'Si varias inyecciones: separar puntos'
      ],
      onset: 'La mejoría suele notarse a partir de las 16 semanas. Evaluación obligatoria en este punto.',
      conservation: [
        '❄️ Nevera (2-8ºC) - NO congelar',
        'Proteger de la luz',
        'Viales reconstituidos: 8h a 2-8ºC, 4h temperatura ambiente'
      ],
      sideEffects: [
        '🟢 Cefalea, dolor lugar inyección, artralgia (frecuentes)',
        '🟡 Reacciones alérgicas, infecciones respiratorias',
        '🔴 Anafilaxia (rara pero grave) - mayoría primeras 3 dosis'
      ],
      precautions: [
        '⏱️ Observación 2 horas en hospital (primeras 3 dosis)',
        '🚫 NO usar para exacerbaciones agudas',
        '⚠️ Avisar inmediatamente si urticaria, dificultad respirar, mareo'
      ],
      alarms: [
        'Urticaria generalizada, angioedema',
        'Dificultad para respirar, broncoespasmo',
        'Hipotensión, síncope, mareo intenso',
        'Síntomas hasta 24h después de inyección'
      ],
      missedDose: 'Si olvidas una dosis, contacta con tu médico para reprogramar. Continuar con el esquema indicado.',
      disposal: 'Punto SIGRE en farmacia',
      contacts: { phone: '(Rellenar)', hours: '(Rellenar)' },
      layout: [
        { id: 'intro', type: 'intro', colSpan: 9, heightLevel: 1, color: 'indigo', iconName: 'Consejo' },
        { id: 'onset', type: 'onset', colSpan: 3, heightLevel: 1, color: 'emerald', iconName: 'Reloj' },
        { id: 'admin', type: 'admin', colSpan: 12, heightLevel: 1, color: 'slate', iconName: 'Jeringa' },
        { id: 'conservation', type: 'conservation', colSpan: 6, heightLevel: 1, color: 'sky', iconName: 'Termómetro' },
        { id: 'precautions', type: 'precautions', colSpan: 6, heightLevel: 1, color: 'amber', iconName: 'Alerta' },
        { id: 'sideEffects', type: 'sideEffects', colSpan: 12, heightLevel: 1, color: 'emerald', iconName: 'Actividad' }
      ]
    }
  },
  {
    name: 'Mepolizumab (Nucala®)',
    dci: 'Mepolizumab',
    system: 'Neumología',
    subArea: 'Asma',
    type: 'Anti-IL5 (Anticuerpo monoclonal)',
    presentation: 'Solución inyectable 40mg, 100mg (jeringas/plumas precargadas)',
    proSections: [
      {
        id: 'validacion_indicacion',
        title: '1. Validación de la Indicación',
        type: 'checklist',
        items: [
          'Asma eosinofílica refractaria grave confirmada',
          'Eosinófilos ≥300 células/µL en sangre (o ≥150 si corticodependiente)',
          '≥2 exacerbaciones graves en últimos 12 meses (requirieron corticoides sistémicos)',
          'Tratamiento actual: CI dosis altas + ≥1 medicamento mantenimiento adicional (LABA/LAMA/antileucotrienos)',
          'Función pulmonar reducida: FEV1 <80% adultos, <90% adolescentes',
          'Asma no controlada pese a tratamiento óptimo'
        ],
        footer: 'Requisito: Eosinófilos ≥300/µL (o ≥150/µL si corticodependiente)'
      },
      {
        id: 'posologia',
        title: '2. Cronograma Posológico',
        type: 'text',
        content: `**ADULTOS Y ADOLESCENTES (≥12 años):**
- **Dosis: 100 mg SC cada 4 semanas**

**NIÑOS (6-11 años):**
- **Peso <40 kg: 40 mg SC cada 4 semanas**
- **Peso ≥40 kg: 100 mg SC cada 4 semanas**

**Presentaciones:**
- Polvo liofilizado: 100 mg (reconstitución necesaria)
- Jeringas precargadas: 40 mg, 100 mg
- Plumas precargadas: 40 mg, 100 mg

**Reconstitución (viales):**
- Añadir 1.2 ml agua estéril
- Girar suavemente cada 15 segundos
- NO agitar
- Concentración final: 100 mg/ml

**VÍA:** Subcutánea ÚNICAMENTE (brazo, muslo o abdomen)

**Autoadministración:** Puede administrar cuidador tras formación`
      },
      {
        id: 'monitorizacion',
        title: '3. Monitorización durante Tratamiento',
        type: 'text',
        content: `**EOSINÓFILOS EN SANGRE:**
- Basal: media 290-306 células/µL
- A las 4 semanas: reducción ~84-87%
- Semana 32: ~40-48 células/µL
- Mantener reducción durante tratamiento
- Monitorizar cada 3-6 meses

**FRECUENCIA EXACERBACIONES:**
- Objetivo: reducción ≥50-53% vs basal
- Registrar número, gravedad, necesidad hospitalización

**FUNCIÓN PULMONAR:**
- FEV1 cada 3-6 meses
- Mejoría esperada: ~100-180 ml vs basal

**CONTROL SÍNTOMAS:**
- ACT/ACQ cada 3 meses
- Calidad de vida (SGRQ) cada 6-12 meses

**REDUCCIÓN CORTICOIDES ORALES:**
- NO retirada brusca → supervisión médica
- Evaluar posibilidad reducción a partir de 4-6 meses

**EVALUACIÓN ANUAL:** Decisión continuar basada en gravedad, control exacerbaciones, reducción corticoides`
      },
      {
        id: 'efectos_adversos',
        title: '4. Manejo de Efectos Adversos',
        type: 'text',
        content: `**FRECUENTES:**
- Cefalea (muy frecuente)
- Reacciones lugar inyección (dolor, eritema)
- Infección tracto respiratorio inferior
- Herpes zóster (tratamiento antiviral)

**ANAFILAXIA (Raro):**
- Puede ocurrir cualquier dosis, incluso tras tratamiento prolongado
- **MANEJO:** Suspender inmediatamente, adrenalina IM, NO reintroducir

**INFECCIONES HELMÍNTICAS:**
- Mepolizumab reduce eosinófilos → puede reducir eficacia respuesta anti-helmíntica
- Si infección NO responde a antihelmíntico → considerar interrupción TEMPORAL

**VIGILANCIA:**
- Reacciones hipersensibilidad (pueden ser agudas o retardadas)
- Signos anafilaxia: urticaria, angioedema, broncoespasmo, hipotensión

**NO REQUIERE observación prolongada rutinaria** post-inyección (a diferencia omalizumab)`
      }
    ],
    patientSections: {
      intro: 'Mepolizumab (Nucala®) reduce los eosinófilos que causan inflamación en el asma, disminuyendo las exacerbaciones.',
      admin: [
        'Inyección subcutánea en brazo, muslo o abdomen',
        'Puede administrar cuidador tras formación',
        'NO agitar los viales'
      ],
      onset: 'La reducción de eosinófilos ocurre en 4 semanas. La mejoría clínica se nota progresivamente.',
      conservation: [
        '❄️ Nevera (2-8ºC) - NO congelar',
        'Jeringas/plumas: pueden estar 7 días a <30ºC',
        'Viales reconstituidos: 8h entre 2-30ºC'
      ],
      sideEffects: [
        '🟢 Cefalea, dolor lugar inyección (frecuentes)',
        '🟡 Infecciones respiratorias, herpes zóster',
        '🔴 Anafilaxia (rara)'
      ],
      precautions: [
        '🚫 NO usar para exacerbaciones agudas',
        '🪱 Tratar infecciones parasitarias antes de iniciar',
        '⚠️ Avisar si síntomas infección, fiebre'
      ],
      alarms: [
        'Urticaria, erupción cutánea',
        'Dificultad respirar',
        'Hinchazón cara, lengua',
        'Mareo, desmayo'
      ],
      missedDose: 'Si olvidas una dosis, administrar cuanto antes y continuar con el esquema cada 4 semanas.',
      disposal: 'Punto SIGRE en farmacia',
      contacts: { phone: '(Rellenar)', hours: '(Rellenar)' },
      layout: [
        { id: 'intro', type: 'intro', colSpan: 9, heightLevel: 1, color: 'emerald', iconName: 'Consejo' },
        { id: 'onset', type: 'onset', colSpan: 3, heightLevel: 1, color: 'indigo', iconName: 'Reloj' },
        { id: 'admin', type: 'admin', colSpan: 12, heightLevel: 1, color: 'slate', iconName: 'Jeringa' },
        { id: 'conservation', type: 'conservation', colSpan: 6, heightLevel: 1, color: 'sky', iconName: 'Termómetro' },
        { id: 'precautions', type: 'precautions', colSpan: 6, heightLevel: 1, color: 'amber', iconName: 'Alerta' },
        { id: 'sideEffects', type: 'sideEffects', colSpan: 12, heightLevel: 1, color: 'rose', iconName: 'Actividad' }
      ]
    }
  },
  {
    name: 'Benralizumab (Fasenra®)',
    dci: 'Benralizumab',
    system: 'Neumología',
    subArea: 'Asma',
    type: 'Anti-IL5R (Anticuerpo monoclonal)',
    presentation: 'Solución inyectable 30mg/1ml (jeringas/plumas precargadas)',
    proSections: [
      {
        id: 'validacion_indicacion',
        title: '1. Validación de la Indicación',
        type: 'checklist',
        items: [
          'Asma grave eosinofílica confirmada',
          'Eosinófilos ≥300 células/µL en sangre',
          'NO controlada pese a CI dosis altas + LABA',
          '≥2 exacerbaciones graves en últimos 12 meses',
          'ACQ-6 ≥1.5',
          'NO antecedentes conocidos de anafilaxia (CONTRAINDICACIÓN)'
        ],
        footer: 'CONTRAINDICACIÓN ESPECÍFICA: Antecedentes conocidos de anafilaxia'
      },
      {
        id: 'posologia',
        title: '2. Cronograma Posológico ÚNICO',
        type: 'text',
        content: `**ESQUEMA CARACTERÍSTICO:**

**Primeras 3 dosis:**
- **30 mg SC cada 4 semanas** (semanas 0, 4, 8)

**Mantenimiento (a partir semana 16):**
- **30 mg SC cada 8 semanas**

✅ **ÚNICO biológico con intervalo 8 semanas en mantenimiento**
✅ Solo **7 dosis/año** tras fase inicial (vs 13 dosis/año otros anti-IL5)
✅ Dosis FIJA 30 mg (no depende peso, IgE, ni eosinófilos)

**Cronograma específico:**
\`\`\`
Semana 0:  30 mg SC (dosis 1)
Semana 4:  30 mg SC (dosis 2)
Semana 8:  30 mg SC (dosis 3)
Semana 16: 30 mg SC (dosis 4) → inicio mantenimiento
Semana 24: 30 mg SC (dosis 5)
Semana 32: 30 mg SC (dosis 6)
... continuar cada 8 semanas
\`\`\`

**Presentaciones:**
- Jeringas precargadas: 30 mg/1 ml
- Plumas precargadas: 30 mg/1 ml

**VÍA:** Subcutánea (abdomen, muslo o brazo)

**Autoadministración:** Solo si SIN antecedentes anafilaxia + experiencia con Fasenra`
      },
      {
        id: 'monitorizacion',
        title: '3. Monitorización - DEPLECIÓN COMPLETA Eosinófilos',
        type: 'text',
        content: `**EOSINÓFILOS - DEPLECIÓN COMPLETA (CARACTERÍSTICO):**
- Basal: ~340-360 células/µL
- A las 4 semanas: depleción marcada
- Durante tratamiento: **<10 células/µL** (vs 40-70 con mepolizumab)
- **Mecanismo ADCC:** apoptosis directa eosinófilos/basófilos vía células NK
- Depleción sostenida con dosis cada 8 semanas

**EXACERBACIONES:**
- Reducción esperada: 50-70% vs placebo
- Estudios SIROCCO/CALIMA: 51-55% vs placebo

**FUNCIÓN PULMONAR:**
- FEV1: mejoría 106-159 ml vs placebo

**REDUCCIÓN OCS (si corticodependiente):**
- Estudio ZONDA:
  - Mediana reducción: **75%** vs 25% placebo
  - Retirada completa OCS: **52%** vs 19% placebo

**PREDICCIÓN RESPUESTA:**
- Eosinófilos ≥300/µL: mejor respuesta
- OCS dependencia: excelente candidato
- ≥3 exacerbaciones/año: mayor reducción`
      },
      {
        id: 'efectos_adversos',
        title: '4. Manejo de Efectos Adversos',
        type: 'text',
        content: `**FRECUENTES:**
- Cefalea (24-26%)
- Faringitis (12-14%)
- Reacciones hipersensibilidad (urticaria, exantema ~5%)

**ANAFILAXIA:**
- Pueden ocurrir tras cualquier dosis
- Dentro de horas O inicio tardío (días)
- **CONTRAINDICADO en pacientes con antecedentes anafilaxia conocidos**
- **MANEJO:** Suspender DEFINITIVAMENTE, adrenalina IM, NO reintroducir

**INFECCIONES HELMÍNTICAS:**
- Depleción eosinófilos → reducción capacidad combatir helmintos
- Si NO responde a antihelmíntico → SUSPENDER hasta resolver

**AUTOADMINISTRACIÓN:**
- Solo si SIN antecedentes anafilaxia + experiencia con Fasenra
- Más conservador que omalizumab

**VIGILANCIA:**
- Churg-Strauss/GEPA al reducir corticoides
- Signos: empeoramiento pulmonar, neuropatía, afectación cardíaca`
      }
    ],
    patientSections: {
      intro: 'Benralizumab (Fasenra®) elimina completamente los eosinófilos que causan inflamación. Ventaja: dosis cada 8 semanas tras carga inicial.',
      admin: [
        'Inyección subcutánea en abdomen, muslo o brazo',
        'Primeras 3 dosis: cada 4 semanas',
        'Luego: cada 8 semanas (¡menos inyecciones!)',
        'Puede autoadministrarse tras experiencia'
      ],
      onset: 'La depleción de eosinófilos ocurre en 4 semanas. Menos exacerbaciones se notan en semanas-meses.',
      conservation: [
        '❄️ Nevera (2-8ºC) - NO congelar',
        'Puede estar 14 días a ≤25ºC',
        'NO agitar'
      ],
      sideEffects: [
        '🟢 Cefalea, faringitis (frecuentes)',
        '🟡 Reacciones alérgicas (urticaria)',
        '🔴 Anafilaxia (muy rara)'
      ],
      precautions: [
        '🚫 NUNCA si has tenido anafilaxia antes',
        '🚫 NO usar para exacerbaciones agudas',
        '🪱 Tratar parásitos antes de iniciar',
        '⚠️ Avisar inmediatamente si urticaria, dificultad respirar'
      ],
      alarms: [
        'Urticaria, habones',
        'Dificultad respirar',
        'Desmayo, mareo intenso',
        'Hinchazón cara, lengua, boca'
      ],
      missedDose: 'Si olvidas: administrar cuanto antes y continuar con el esquema (cada 8 semanas tras carga).',
      disposal: 'Punto SIGRE en farmacia',
      contacts: { phone: '(Rellenar)', hours: '(Rellenar)' },
      layout: [
        { id: 'intro', type: 'intro', colSpan: 9, heightLevel: 1, color: 'purple', iconName: 'Consejo' },
        { id: 'onset', type: 'onset', colSpan: 3, heightLevel: 1, color: 'emerald', iconName: 'Reloj' },
        { id: 'admin', type: 'admin', colSpan: 12, heightLevel: 1, color: 'slate', iconName: 'Jeringa' },
        { id: 'conservation', type: 'conservation', colSpan: 6, heightLevel: 1, color: 'sky', iconName: 'Termómetro' },
        { id: 'precautions', type: 'precautions', colSpan: 6, heightLevel: 1, color: 'rose', iconName: 'Alerta' },
        { id: 'sideEffects', type: 'sideEffects', colSpan: 12, heightLevel: 1, color: 'amber', iconName: 'Actividad' }
      ]
    }
  },
  {
    name: 'Dupilumab (Dupixent®)',
    dci: 'Dupilumab',
    system: 'Neumología',
    subArea: 'Asma',
    type: 'Anti-IL4Rα (Anticuerpo monoclonal)',
    presentation: 'Solución inyectable 200mg, 300mg (jeringas/plumas precargadas)',
    proSections: [
      {
        id: 'validacion_indicacion',
        title: '1. Validación de la Indicación - Asma Tipo 2',
        type: 'checklist',
        items: [
          'Asma grave confirmada',
          'NO controlada con CI dosis altas + LABA',
          'Inflamación TIPO 2 (al menos uno): Eosinófilos ≥150/µL O FeNO ≥25 ppb',
          'Mejor respuesta si: Eosinófilos ≥300/µL Y/O FeNO ≥50 ppb',
          'NOTA: Corticoides sistémicos SUPRIMEN biomarcadores tipo 2'
        ],
        footer: 'BIOMARCADORES PREDICTIVOS: FeNO ≥50 ppb (mejor predictor), Eosinófilos ≥300/µL'
      },
      {
        id: 'posologia',
        title: '2. Cronograma Posológico Estratificado',
        type: 'text',
        content: `**DOSIS ALTA (pacientes con mayor gravedad):**

**Indicaciones:**
- Paciente toma corticosteroides orales mantenimiento
- Asma grave + dermatitis atópica comórbida moderada-grave
- Adultos con asma grave + RSCcPN comórbida grave

**Pauta:**
- Dosis inicial: **600 mg** (2 inyecciones de 300 mg) DÍA 1
- Mantenimiento: **300 mg cada 2 semanas**

---

**DOSIS ESTÁNDAR (resto pacientes):**

**Indicaciones:**
- Asma grave sin OCS mantenimiento
- Sin comorbilidades graves

**Pauta:**
- Dosis inicial: **400 mg** (2 inyecciones de 200 mg) DÍA 1
- Mantenimiento: **200 mg cada 2 semanas**

**Presentaciones:**
- Jeringas precargadas: 200 mg, 300 mg
- Plumas precargadas: 200 mg, 300 mg

**VÍA:** Subcutánea (abdomen, muslo o brazo)

**Autoadministración:** Puede desde inicio tras entrenamiento (sin restricciones especiales)`
      },
      {
        id: 'monitorizacion',
        title: '3. Monitorización - Eosinófilos NO se depletan',
        type: 'text',
        content: `**EOSINÓFILOS (COMPORTAMIENTO PARADÓJICO):**
- **Dupilumab NO depleta eosinófilos**
- **Eosinófilos pueden AUMENTAR durante tratamiento**
- Mecanismo: bloqueo IL-4/IL-13 → eosinófilos persisten
- **Aumento eosinófilos NO indica falta eficacia**
- 13-14% tienen aumento a >1500/µL (generalmente asintomático)

**FeNO:**
- Puede reducirse (bloqueo IL-13)
- Útil seguimiento respuesta tipo 2

**FUNCIÓN PULMONAR:**
- **Evaluación a las 12 semanas** (primary endpoint)
- Mejoría FEV1: +130-210 ml vs placebo
- Mejoría observable ya a las 2 semanas

**EXACERBACIONES:**
- Reducción: ~48% (200 mg) a 46% (300 mg) vs placebo
- **Mejor respuesta según FeNO:**
  - FeNO ≥50 ppb: reducción 69%
  - FeNO 25-50 ppb: reducción 56-61%
  - **FeNO <25 ppb: sin efecto significativo**

**REDUCCIÓN OCS (Estudio VENTURE):**
- Reducción ≥50%: 69% vs 33% placebo
- Retirada completa: 26% vs 9% placebo`
      },
      {
        id: 'efectos_adversos',
        title: '4. Manejo de Efectos Adversos',
        type: 'text',
        content: `**CONJUNTIVITIS (característico):**
- Incidencia: ~10% dermatitis atópica, 2-3% asma
- Mayor riesgo: dermatitis atópica facial comórbida
- **MANEJO:**
  - Leve: lágrimas artificiales, compresas frías
  - Moderada: antihistamínicos tópicos, oftalmología
  - Grave/queratitis: derivación urgente
  - Generalmente NO requiere suspensión

**REACCIONES LUGAR INYECCIÓN (~10%):**
- Eritema, dolor, hinchazón
- Frío local, rotar puntos

**EOSINOFILIA (13-14%):**
- Aumento transitorio (generalmente asintomático)
- **Si síntomas clínicos** (vasculitis, neuropatía): investigar, considerar suspensión

**ANAFILAXIA (muy rara):**
- Suspender DEFINITIVAMENTE, tratamiento estándar

**VIGILANCIA:**
- Problemas oculares (conjuntivitis, queratitis)
- Eosinofilia sintomática
- Churg-Strauss/GEPA al reducir corticoides`
      }
    ],
    patientSections: {
      intro: 'Dupilumab (Dupixent®) bloquea las señales IL-4 e IL-13 que causan inflamación tipo 2 en el asma. Eficaz en múltiples enfermedades alérgicas.',
      admin: [
        'Inyección subcutánea en abdomen, muslo o brazo',
        'Primera dosis: 2 inyecciones (400 mg o 600 mg)',
        'Luego: 1 inyección cada 2 semanas',
        'Puede autoadministrarse desde inicio tras formación'
      ],
      onset: 'Mejoría ya observable a las 2 semanas. Evaluación completa a las 12 semanas.',
      conservation: [
        '❄️ Nevera (2-8ºC) - NO congelar',
        'Puede estar 14 días a ≤25ºC',
        'Dejar 45 min fuera nevera antes de inyectar'
      ],
      sideEffects: [
        '🟢 Conjuntivitis, enrojecimiento ojos (frecuente)',
        '🟢 Reacciones lugar inyección',
        '🟡 Aumento eosinófilos en sangre (asintomático)',
        '🔴 Anafilaxia (muy rara)'
      ],
      precautions: [
        '👁️ Vigilar ojos: enrojecimiento, picor, lagrimeo',
        '🚫 NO usar para exacerbaciones agudas',
        '💧 Usar lágrimas artificiales si ojos secos',
        '⚠️ Avisar si visión borrosa, dolor ocular'
      ],
      alarms: [
        'Visión borrosa, dolor ocular intenso',
        'Urticaria, dificultad respirar',
        'Hinchazón cara, lengua',
        'Síntomas vasculíticos con aumento eosinófilos'
      ],
      missedDose: 'Si olvidas: administrar cuanto antes y continuar cada 2 semanas desde esa dosis.',
      disposal: 'Punto SIGRE en farmacia',
      contacts: { phone: '(Rellenar)', hours: '(Rellenar)' },
      layout: [
        { id: 'intro', type: 'intro', colSpan: 9, heightLevel: 1, color: 'sky', iconName: 'Consejo' },
        { id: 'onset', type: 'onset', colSpan: 3, heightLevel: 1, color: 'emerald', iconName: 'Reloj' },
        { id: 'admin', type: 'admin', colSpan: 12, heightLevel: 1, color: 'slate', iconName: 'Jeringa' },
        { id: 'conservation', type: 'conservation', colSpan: 6, heightLevel: 1, color: 'indigo', iconName: 'Termómetro' },
        { id: 'precautions', type: 'precautions', colSpan: 6, heightLevel: 1, color: 'amber', iconName: 'Ojo' },
        { id: 'sideEffects', type: 'sideEffects', colSpan: 12, heightLevel: 1, color: 'rose', iconName: 'Actividad' }
      ]
    }
  }
];

async function addBiologics() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Buscar usuario admin
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      console.error('❌ Usuario admin no encontrado');
      process.exit(1);
    }

    console.log(`📋 Usuario admin encontrado: ${admin.name}\n`);

    // Crear o actualizar área clínica en settings
    let settings = await UserSettings.findOne({ where: { userId: admin.id } });
    if (!settings) {
      settings = await UserSettings.create({
        userId: admin.id,
        customAreas: {}
      });
    }

    const customAreas = settings.customAreas || {};
    if (!customAreas['Neumología']) {
      customAreas['Neumología'] = { subAreas: ['Asma'] };
    } else if (!customAreas['Neumología'].subAreas.includes('Asma')) {
      customAreas['Neumología'].subAreas.push('Asma');
    }

    await settings.update({ customAreas });
    console.log('✅ Área "Neumología" y patología "Asma" creadas/actualizadas\n');

    // Crear medicamentos
    for (const medicamento of biologicos) {
      // Verificar si ya existe
      const existing = await Drug.findOne({
        where: {
          userId: admin.id,
          name: medicamento.name
        }
      });

      if (existing) {
        console.log(`⚠️  ${medicamento.name} ya existe - ACTUALIZANDO`);
        await existing.update(medicamento);
      } else {
        await Drug.create({
          ...medicamento,
          userId: admin.id,
          isGlobal: true
        });
        console.log(`✅ ${medicamento.name} creado exitosamente`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ COMPLETADO - 4 medicamentos biológicos para asma añadidos');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nMedicamentos añadidos:');
    console.log('1. Omalizumab (Xolair®) - Anti-IgE');
    console.log('2. Mepolizumab (Nucala®) - Anti-IL5');
    console.log('3. Benralizumab (Fasenra®) - Anti-IL5R');
    console.log('4. Dupilumab (Dupixent®) - Anti-IL4Rα');
    console.log('\nÁrea: Neumología > Asma');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addBiologics();
