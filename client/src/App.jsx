import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
  // Iconos Generales de UI
  Search, ChevronRight, ChevronDown, X, Plus, Minus, Trash2, Save,
  Edit3, LogOut, Settings, ExternalLink, XCircle, GripVertical,
  Menu, MoreHorizontal, Check, AlertCircle, HelpCircle,
  ArrowUpRight, ArrowLeft, ArrowRight, MessageCircle, Download,
  Mail, Loader,

  // Herramientas
  Printer, Calculator, CalendarCheck, Phone,

  // Iconos Médicos y Clínicos
  Stethoscope, Syringe, Pill, Activity, HeartPulse,
  Thermometer, Microscope, Biohazard, Droplet, Brain,
  Bone, Eye, Ear, Baby, Accessibility, TestTube, Dna,
  Heart, Scissors, Scale,

  // Iconos para Secciones / Contexto
  FileText, AlertTriangle, CheckCircle, Clock,
  Sparkles, Zap, Flame, Snowflake, Sun,
  Coffee, Bed, Music, Anchor, StopCircle,
  Recycle, Plane, ThumbsUp, MapPin, Timer,
  FolderPlus, FolderMinus, MoveHorizontal, MoveVertical,
  Bold, Italic, Underline, Wind,

  // ESTADÍSTICAS Y GRÁFICAS
  BarChart3, History
} from 'lucide-react';
import ChatLayout from './components/Chat/ChatLayout';
import { useAuth } from './context/AuthContext';
import { useChat } from './context/ChatContext';

// --- MAPA DE ICONOS ---
const ICON_MAP = {
  'Estetoscopio': Stethoscope, 'Jeringa': Syringe, 'Pastilla': Pill, 'Actividad': Activity,
  'Corazón': Heart, 'Pulso': HeartPulse, 'Cerebro': Brain, 'Hueso': Bone, 
  'Ojo': Eye, 'Oído': Ear, 'Bebé': Baby, 'Accesibilidad': Accessibility,
  'Termómetro': Thermometer, 'Microscopio': Microscope, 'Riesgo Bio': Biohazard, 'Gota/Sangre': Droplet,
  'Ensayo': TestTube, 'ADN': Dna, 'Respiratorio': Wind, 'Cirugía': Scissors, 'Peso': Scale,
  'Alerta': AlertTriangle, 'Reloj': Timer, 'Calendario': CalendarCheck, 'Reciclaje': Recycle, 
  'Avión': Plane, 'Viaje': MapPin, 'Consejo': Sparkles, 'Energía': Zap, 
  'Calor': Flame, 'Frío': Snowflake, 'Sol': Sun, 'Cama': Bed, 
  'Café': Coffee, 'Música': Music, 'Stop': StopCircle, 'Check': CheckCircle
};

// --- DEFINICIÓN DE TEMAS ---
const CARD_THEMES = {
  indigo: { name: 'Índigo', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-900', title: 'text-indigo-800', icon: 'text-indigo-600', accent: 'bg-indigo-600' },
  emerald: { name: 'Esmeralda', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', title: 'text-emerald-800', icon: 'text-emerald-600', accent: 'bg-emerald-600' },
  rose: { name: 'Rosa', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-900', title: 'text-rose-800', icon: 'text-rose-600', accent: 'bg-rose-600' },
  amber: { name: 'Ámbar', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', title: 'text-amber-800', icon: 'text-amber-600', accent: 'bg-amber-500' },
  sky: { name: 'Cielo', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-900', title: 'text-sky-800', icon: 'text-sky-600', accent: 'bg-sky-500' },
  purple: { name: 'Violeta', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-900', title: 'text-purple-800', icon: 'text-purple-600', accent: 'bg-purple-600' },
  slate: { name: 'Gris', bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-900', title: 'text-slate-800', icon: 'text-slate-600', accent: 'bg-slate-600' },
  orange: { name: 'Naranja', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-900', title: 'text-orange-800', icon: 'text-orange-600', accent: 'bg-orange-500' },
};

const SUGGESTED_AREAS = ['Digestivo', 'Dermatología', 'Reumatología', 'Oncología', 'Hematología', 'Neurología', 'Neumología', 'Enfermedades Infecciosas', 'Pediatría', 'Cardiología'];
const FONT_SIZES = [{ label: 'S', value: '1' }, { label: 'M', value: '3' }, { label: 'L', value: '5' }];

// --- DATOS INICIALES ---
const INITIAL_DATA = [
  {
    id: 'ada_dig',
    name: 'Adalimumab (Digestivo)',
    dci: 'Adalimumab',
    system: 'Digestivo',
    type: 'Anti-TNFα',
    presentation: 'Pluma/Jeringa 40mg',
    updatedAt: '02/12/2025', 
    proSections: [
      {
         id: 'ren_hep_adj', title: 'Ajuste Renal y Hepático', type: 'adjustments',
         items: [
           { label: 'ClCr 30-50 ml/min', action: 'Sin ajuste necesario' },
           { label: 'ClCr < 30 ml/min', action: 'Reducir dosis al 50%' },
           { label: 'Insuficiencia Hepática', action: 'Monitorizar función hepática' }
         ]
      },
      {
         id: 'dig_crit', title: '1. Validación de la Indicación (Crohn/CU)', type: 'checklist',
         items: [
           'Diagnóstico confirmado por endoscopia y anatomía patológica.',
           'Enfermedad ACTIVA moderada-grave (CDAI > 220 o Mayo Score > 6).',
           'Fallo, intolerancia o contraindicación a tratamiento convencional.',
           'Marcadores de actividad: Calprotectina fecal elevada > 250 mcg/g.'
         ],
         footer: 'Nota: Revisar criterios específicos de financiación según CCAA.'
      },
      {
         id: 'dig_screening', title: '2. Screening Pre-tratamiento', type: 'checklist',
         items: [
           'Descartar tuberculosis latente/activa (Mantoux/QuantiFERON + Rx tórax).',
           'Serología VHB, VHC, VIH.',
           'Hemograma completo, perfil hepático y renal.',
           'Actualizar calendario vacunal (NO vacunas vivas durante tratamiento).',
           'Descartar procesos infecciosos activos.',
           'Valorar riesgo cardiovascular (antecedentes de insuficiencia cardíaca).'
         ],
         footer: 'Importante: Completar screening antes de iniciar tratamiento.'
      },
      {
         id: 'dig_poso_timeline', title: '3. Cronograma Posológico', type: 'timeline',
         data: [
            { week: 'Semana 0', dose: 160, label: 'INDUCCIÓN', subtext: '4 inyecciones', color: 'indigo', height: 100 },
            { week: 'Semana 2', dose: 80, label: 'INDUCCIÓN', subtext: '2 inyecciones', color: 'indigo', height: 50 },
            { week: 'Semana 4', dose: 40, label: 'MANTENIMIENTO', subtext: 'C/ 14 días', color: 'emerald', height: 25, isMaintenance: true }
         ]
      },
      {
         id: 'dig_monitoring', title: '4. Monitorización durante Tratamiento', type: 'text',
         content: '**Controles Periódicos:**\n\n• **Semana 4, 8 y 12:** Evaluar respuesta clínica (reducción CDAI ≥70 puntos o Mayo Score). Analítica: Hemograma, VSG, PCR, perfil hepático.\n\n• **Cada 3-6 meses durante mantenimiento:** Analítica completa + valoración clínica.\n\n• **Calprotectina fecal:** Considerar cada 3-6 meses para evaluar remisión mucosa.\n\n• **Monitorizar síntomas de infección** en cada visita (fiebre, tos, síntomas urinarios).\n\n**Respuesta Inadecuada:**\n- Si no hay respuesta a semana 12: Valorar escalado de dosis (40mg/semana) o cambio de estrategia.\n- Pérdida de respuesta: Considerar acortamiento intervalo o cambio de anti-TNF.'
      },
      {
         id: 'dig_adverse', title: '5. Manejo de Efectos Adversos', type: 'text',
         content: '**Reacciones en sitio de inyección:** Frecuentes (20%). Aplicar frío local, rotar zonas de inyección. Suelen mejorar con el tiempo.\n\n**Infecciones:**\n- **Leves-moderadas** (IRA, ITU): Tratar según protocolo habitual. Suspender temporalmente Adalimumab hasta resolución.\n- **Graves** (neumonía, sepsis, TBC activa): **SUSPENDER DEFINITIVAMENTE**. Hospitalización y tratamiento específico.\n\n**Reactivación Tuberculosis:** Alta sospecha si fiebre persistente, tos, sudoración nocturna. → Suspender inmediatamente y derivar a Neumología.\n\n**Reacciones de hipersensibilidad:** Raras pero graves. Si urticaria, broncoespasmo o anafilaxia → Suspender definitivamente y tratar sintomáticamente.\n\n**Hepatotoxicidad:** Si transaminasas >3x LSN → Suspender temporalmente. Reevaluar tras normalización.\n\n**Alteraciones hematológicas:** Si neutropenia <1000/μL o plaquetas <50000/μL → Suspender y valorar por Hematología.'
      },
      {
         id: 'dig_suspension', title: '6. Criterios de Suspensión', type: 'checklist',
         items: [
           'Infección grave o sepsis.',
           'Reactivación de tuberculosis.',
           'Neoplasia activa (excepto cáncer piel no melanoma tras valoración individual).',
           'Insuficiencia cardíaca descompensada (clase III-IV NYHA).',
           'Reacción de hipersensibilidad grave.',
           'Hepatotoxicidad severa (>5x LSN transaminasas).',
           'Falta de respuesta tras 12 semanas de tratamiento óptimo.',
           'Pérdida de respuesta mantenida pese a optimización.',
           'Embarazo: Suspender en 3er trimestre (valorar individualmente).',
           'Deseo del paciente tras información adecuada.'
         ],
         footer: 'Importante: Suspensión debe ser valorada por el equipo multidisciplinar (Digestivo + Farmacia Hospitalaria).'
      }
    ],
    patientSections: {
      intro: 'Bienvenido a tu nuevo tratamiento. El Adalimumab es un "escudo biológico" diseñado para frenar la inflamación.',
      admin: ['Sácalo 30 min antes.', 'Elige zona: Muslo o Abdomen.', 'Pellizco suave.', 'Click y espera 10 seg.'],
      onset: 'La mejoría suele notarse a partir de la 4ª semana.',
      conservation: ['❄️ Nevera (2-8ºC).', '✈️ Viaje: Máx 14 días fuera.'],
      sideEffects: ['🟢 Dolor en pinchazo, dolor de cabeza leve.', '🟡 Fiebre, infecciones.'],
      precautions: ['🧊 Hielo local si duele.', '💉 No vacunas vivas.', '🦠 No pinchar con fiebre.'],
      alarms: ['Dificultad respiratoria.', 'Fiebre alta.', 'Dolor abdominal intenso.'],
      missedDose: 'Si olvidas: Inyectar cuanto antes, salvo que toque la siguiente.',
      disposal: 'Punto SIGRE.',
      contacts: { phone: '91 000 00 00', hours: 'L-V 9-14h' },
      layout: [
         { id: 'intro', type: 'intro', colSpan: 9, heightLevel: 1, color: 'indigo', iconName: 'Consejo' },
         { id: 'onset', type: 'onset', colSpan: 3, heightLevel: 1, color: 'emerald', iconName: 'Reloj' },
         { id: 'admin', type: 'admin', colSpan: 12, heightLevel: 1, color: 'slate', iconName: 'Jeringa' },
         { id: 'missed', type: 'missed', colSpan: 4, heightLevel: 1, color: 'purple', iconName: 'Check' },
         { id: 'disposal', type: 'disposal', colSpan: 4, heightLevel: 1, color: 'amber', iconName: 'Reciclaje' },
         { id: 'travel', type: 'travel', colSpan: 4, heightLevel: 1, color: 'orange', iconName: 'Avión' },
         { id: 'conservation', type: 'conservation', colSpan: 6, heightLevel: 1, color: 'sky', iconName: 'Termómetro' },
         { id: 'tips', type: 'tips', colSpan: 6, heightLevel: 1, color: 'slate', iconName: 'Consejo' },
         { id: 'sideEffects', type: 'sideEffects', colSpan: 12, heightLevel: 1, color: 'emerald', iconName: 'Actividad' }
      ]
    }
  }
];

const INITIAL_SETTINGS = { hospitalName: 'Hospital Universitario General', pharmacistName: 'Dr. F. García', logoUrl: '', primaryColor: 'indigo' };

// --- COMPONENTES UI ---
const Badge = ({ children, className = "" }) => <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wide font-bold ${className}`}>{children}</span>;

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in" onClick={onClose}>
       <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
             <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700">Confirmar</button>
          </div>
       </div>
    </div>
  );
};

const CreateAreaModal = ({ isOpen, onClose, onConfirm, existingAreas }) => {
  const [areaName, setAreaName] = useState('');
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FolderPlus className="text-indigo-600"/> Nueva Área Clínica</h3>
          <form onSubmit={(e) => { e.preventDefault(); if(areaName.trim()) { onConfirm(areaName.trim()); setAreaName(''); onClose(); }}}>
             <input autoFocus type="text" className="w-full p-3 border border-slate-300 rounded-lg mb-4" placeholder="Ej: Neumología" value={areaName} onChange={e => setAreaName(e.target.value)} list="suggested-areas"/>
             <datalist id="suggested-areas">{SUGGESTED_AREAS.filter(a => !existingAreas.includes(a)).map(a => <option key={a} value={a}/>)}</datalist>
             <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Crear Área</button>
             </div>
          </form>
       </div>
    </div>
  );
};

const CreateSubAreaModal = ({ isOpen, onClose, onConfirm, areaName }) => {
  const [subAreaName, setSubAreaName] = useState('');
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FolderMinus className="text-indigo-600"/> Nueva Patología en {areaName}</h3>
          <form onSubmit={(e) => { e.preventDefault(); if(subAreaName.trim()) { onConfirm(areaName, subAreaName.trim()); setSubAreaName(''); onClose(); }}}>
             <input autoFocus type="text" className="w-full p-3 border border-slate-300 rounded-lg mb-4" placeholder="Ej: Psoriasis, Dermatitis, Alopecia..." value={subAreaName} onChange={e => setSubAreaName(e.target.value)} />
             <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Crear Patología</button>
             </div>
          </form>
       </div>
    </div>
  );
};

const RenameModal = ({ isOpen, onClose, onConfirm, currentName, type }) => {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    setNewName(currentName);
  }, [currentName, isOpen]);

  if(!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if(newName.trim() && newName.trim() !== currentName) {
      onConfirm(newName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Edit3 size={20} className="text-indigo-600"/>
            Renombrar {type === 'area' ? 'Área Clínica' : 'Patología'}
          </h3>
          <form onSubmit={handleSubmit}>
             <input
               autoFocus
               type="text"
               className="w-full p-3 border border-slate-300 rounded-lg mb-4"
               placeholder={type === 'area' ? 'Nombre del área' : 'Nombre de la patología'}
               value={newName}
               onChange={e => setNewName(e.target.value)}
             />
             <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancelar</button>
                <button type="submit" disabled={!newName.trim() || newName.trim() === currentName} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:bg-slate-300 disabled:cursor-not-allowed">Renombrar</button>
             </div>
          </form>
       </div>
    </div>
  );
};

const CopyTemplateModal = ({ isOpen, onClose, onConfirm, drugs, mode }) => {
  const [selectedDrug, setSelectedDrug] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if(!isOpen) return null;

  const filteredDrugs = drugs.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.dci.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if(selectedDrug) {
      const drug = drugs.find(d => d.id === selectedDrug);
      onConfirm(drug);
      setSelectedDrug('');
      setSearchTerm('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="text-indigo-600"/>
            {mode === 'pro' ? 'Copiar Protocolo Existente' : 'Copiar Documento de Paciente Existente'}
          </h3>

          <div className="mb-4">
            <input
              autoFocus
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg"
              placeholder="Buscar fármaco..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto mb-4 border rounded-lg">
            {filteredDrugs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No se encontraron fármacos</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDrugs.map(drug => (
                  <div
                    key={drug.id}
                    onClick={() => setSelectedDrug(drug.id)}
                    className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedDrug === drug.id ? 'bg-indigo-100 border-l-4 border-indigo-600' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{drug.name}</p>
                        <p className="text-sm text-slate-500">{drug.dci} • {drug.system}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {mode === 'pro'
                            ? `${drug.proSections?.length || 0} secciones`
                            : `${drug.patientSections?.layout?.length || 0} tarjetas`}
                        </p>
                      </div>
                      {selectedDrug === drug.id && (
                        <Check className="text-indigo-600" size={24}/>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={() => { onConfirm(null); setSelectedDrug(''); setSearchTerm(''); onClose(); }}
              className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              Empezar en blanco
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedDrug(''); setSearchTerm(''); onClose(); }}
                className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedDrug}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Copiar Plantilla
              </button>
            </div>
          </div>
       </div>
    </div>
  );
};

// --- CALCULADORA MÉDICA ---
const CalculatorsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('bsa');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [scr, setScr] = useState('');
  
  if(!isOpen) return null;

  const calculateBSA = () => { if(!weight || !height) return '-'; return (0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725)).toFixed(2) + ' m²'; };
  const calculateBMI = () => { if(!weight || !height) return '-'; const hM = height / 100; return (weight / (hM * hM)).toFixed(1) + ' kg/m²'; };
  const calculateCockcroft = () => { if(!weight || !age || !scr) return '-'; let val = ((140 - age) * weight) / (72 * scr); if(gender === 'female') val *= 0.85; return val.toFixed(1) + ' ml/min'; };

  return (
    <div className="fixed inset-0 bg-black/20 z-[150] flex items-center justify-center animate-in fade-in p-4" onClick={onClose}>
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="bg-slate-900 text-white p-3 flex justify-between items-center">
             <h3 className="font-bold flex items-center gap-2 text-sm"><Calculator size={16}/> Calculadoras Clínicas</h3>
             <button onClick={onClose}><X size={16}/></button>
          </div>
          <div className="flex border-b bg-slate-50">
             <button onClick={()=>setActiveTab('bsa')} className={`flex-1 py-2 text-xs font-bold ${activeTab==='bsa'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-500'}`}>BSA / IMC</button>
             <button onClick={()=>setActiveTab('clcr')} className={`flex-1 py-2 text-xs font-bold ${activeTab==='clcr'?'text-indigo-600 border-b-2 border-indigo-600':'text-slate-500'}`}>Cockcroft (ClCr)</button>
          </div>
          <div className="p-4">
             <div className="space-y-3 mb-4">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase">Peso (kg)</label><input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-1.5 border rounded font-mono text-sm"/></div>
                {activeTab === 'bsa' && <div><label className="text-[10px] font-bold text-slate-500 uppercase">Altura (cm)</label><input type="number" value={height} onChange={e=>setHeight(e.target.value)} className="w-full p-1.5 border rounded font-mono text-sm"/></div>}
                {activeTab === 'clcr' && (
                  <>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase">Edad (años)</label><input type="number" value={age} onChange={e=>setAge(e.target.value)} className="w-full p-1.5 border rounded font-mono text-sm"/></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase">Creatinina (mg/dL)</label><input type="number" value={scr} onChange={e=>setScr(e.target.value)} className="w-full p-1.5 border rounded font-mono text-sm"/></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Sexo</label><div className="flex gap-4 text-xs"><label className="flex items-center"><input type="radio" checked={gender==='male'} onChange={()=>setGender('male')} className="mr-2"/>Hombre</label><label className="flex items-center"><input type="radio" checked={gender==='female'} onChange={()=>setGender('female')} className="mr-2"/>Mujer</label></div></div>
                  </>
                )}
             </div>
             <div className="bg-slate-100 p-3 rounded-lg text-center space-y-1">
                 {activeTab === 'bsa' ? (
                   <>
                     <div><p className="text-[10px] text-slate-500 uppercase">Superficie</p><p className="text-xl font-black text-indigo-600">{calculateBSA()}</p></div>
                     <div className="border-t border-slate-200 pt-1"><p className="text-[10px] text-slate-500 uppercase">IMC</p><p className="text-lg font-bold text-slate-700">{calculateBMI()}</p></div>
                   </>
                 ) : (
                   <div><p className="text-[10px] text-slate-500 uppercase">Aclaramiento (ClCr)</p><p className="text-2xl font-black text-emerald-600">{calculateCockcroft()}</p></div>
                 )}
             </div>
          </div>
       </div>
    </div>
  );
};

// --- SOLUCIÓN DEFINITIVA AL BUG DE ESCRITURA ---
const EditableText = ({ value, onChange, isEditing, className, multiline = false, placeholder = "" }) => {
  const contentEditableRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // EFECTO CRÍTICO: Solo actualizamos el HTML si NO estamos escribiendo.
  // Esto evita que React resetee el cursor mientras el usuario teclea.
  useEffect(() => {
    if (contentEditableRef.current && document.activeElement !== contentEditableRef.current) {
        if (contentEditableRef.current.innerHTML !== (value || "")) {
            contentEditableRef.current.innerHTML = value || "";
        }
    }
  }, [value, isEditing]);

  const execCmd = (command, arg = null) => {
    document.execCommand(command, false, arg);
    // Forzamos actualización inmediata del estado tras comando de formato
    if (contentEditableRef.current) onChange(contentEditableRef.current.innerHTML);
  };

  const handleToolbarAction = (e, command, arg) => {
    e.preventDefault(); e.stopPropagation(); execCmd(command, arg);
  };

  if (!isEditing) {
    return <div className={`whitespace-pre-wrap ${className || ''}`} dangerouslySetInnerHTML={{ __html: value || placeholder }}/>;
  }

  return (
    <div className="relative group/edit w-full">
      {isEditing && isFocused && (
        <div className="flex items-center gap-1 bg-slate-900 text-white rounded-lg shadow-2xl absolute -top-10 left-0 z-[150] px-3 py-2 animate-in fade-in zoom-in-95 duration-100 border border-slate-700" onMouseDown={(e) => e.preventDefault()}>
          <button onMouseDown={(e) => handleToolbarAction(e, 'bold')} className="hover:bg-slate-700 rounded px-1.5 py-1 transition-colors" title="Negrita"><Bold size={14}/></button>
          <button onMouseDown={(e) => handleToolbarAction(e, 'italic')} className="hover:bg-slate-700 rounded px-1.5 py-1 transition-colors" title="Cursiva"><Italic size={14}/></button>
          <button onMouseDown={(e) => handleToolbarAction(e, 'underline')} className="hover:bg-slate-700 rounded px-1.5 py-1 transition-colors" title="Subrayado"><Underline size={14}/></button>
          <div className="w-px h-4 bg-slate-600 mx-2"></div>
          <span className="text-[9px] text-slate-400 uppercase mr-1">Tamaño</span>
          {FONT_SIZES.map(s => (<button key={s.value} onMouseDown={(e) => handleToolbarAction(e, 'fontSize', s.value)} className="px-2 py-1 text-xs font-bold hover:bg-slate-700 rounded transition-colors" title={`Tamaño ${s.label}`}>{s.label}</button>))}
        </div>
      )}

      {/* AQUÍ ESTÁ LA SOLUCIÓN: Eliminamos dangerouslySetInnerHTML en el render de edición.
          El contenido se inicializa vía useEffect y se mantiene vía onInput nativo. */}
      <div
        ref={contentEditableRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        className={`w-full p-1 border-b border-dashed border-indigo-300 bg-transparent outline-none focus:border-indigo-500 transition-colors min-h-[1.5em] ${className}`}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => { setIsFocused(false); onChange(e.currentTarget.innerHTML); }}
        style={{ minHeight: multiline ? '1.5em' : 'auto', display: multiline ? 'block' : 'inline-block', width: '100%' }}
      />
      {(!value && placeholder) && <div className="absolute top-1 left-1 text-slate-300 pointer-events-none text-xs">{placeholder}</div>}
    </div>
  );
};

// --- SELECTOR DE ICONOS ---
const IconPicker = ({ isOpen, onClose, onSelect }) => {
  if(!isOpen) return null;
  return (
    <div className="absolute top-8 left-0 z-[100] bg-white rounded-xl shadow-2xl p-3 w-64 border border-slate-200 animate-in fade-in zoom-in-95" onMouseDown={e=>e.stopPropagation()}>
       <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
          {Object.entries(ICON_MAP).map(([name, Icon]) => (
             <button key={name} onClick={()=>{onSelect(name); onClose();}} className="p-2 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg flex justify-center items-center transition-colors" title={name}><Icon size={18}/></button>
          ))}
       </div>
    </div>
  );
};

const InitialSetupModal = ({ isOpen, onComplete, user }) => {
  const [hospitalName, setHospitalName] = useState(user?.hospital || '');
  const [pharmacistName, setPharmacistName] = useState(user?.name || '');

  const handleComplete = () => {
    if (hospitalName.trim() && pharmacistName.trim()) {
      onComplete({ hospitalName: hospitalName.trim(), pharmacistName: pharmacistName.trim() });
    }
  };

  if (!isOpen) return null;

  const isValid = hospitalName.trim() && pharmacistName.trim();

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Stethoscope size={32} className="text-white"/>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Bienvenido a InFHarma!</h2>
          <p className="text-slate-600">Configura tu perfil para empezar</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Hospital</label>
            <input
              autoFocus
              type="text"
              className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-indigo-600 outline-none transition-colors"
              value={hospitalName}
              onChange={e => setHospitalName(e.target.value)}
              placeholder="Ej: San Juan de Dios"
              onKeyPress={e => e.key === 'Enter' && isValid && handleComplete()}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tu Nombre</label>
            <input
              type="text"
              className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-indigo-600 outline-none transition-colors"
              value={pharmacistName}
              onChange={e => setPharmacistName(e.target.value)}
              placeholder="Ej: Dr. García"
              onKeyPress={e => e.key === 'Enter' && isValid && handleComplete()}
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleComplete}
            disabled={!isValid}
            className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Comenzar
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Podrás modificar esta información en cualquier momento desde Configuración
        </p>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  useEffect(() => { setLocalSettings(settings); }, [settings]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center"><Settings className="mr-2"/> Configuración</h2>
        <div className="space-y-4">
          <input type="text" className="w-full p-3 border rounded-lg" value={localSettings.hospitalName} onChange={e => setLocalSettings({...localSettings, hospitalName: e.target.value})} placeholder="Nombre Hospital"/>
          <input type="text" className="w-full p-3 border rounded-lg" value={localSettings.logoUrl} onChange={e => setLocalSettings({...localSettings, logoUrl: e.target.value})} placeholder="URL Logo"/>
          <input type="text" className="w-full p-3 border rounded-lg" value={localSettings.pharmacistName} onChange={e => setLocalSettings({...localSettings, pharmacistName: e.target.value})} placeholder="Farmacéutico"/>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-500">Cancelar</button>
          <button onClick={() => { onSave(localSettings); onClose(); }} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Guardar</button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login, register, verifyEmail, resendVerification } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'email-sent', 'verifying', 'verified'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [hospital, setHospital] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Check for verification token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      handleVerifyEmail(token);
    }
  }, []);

  const handleVerifyEmail = async (token) => {
    setMode('verifying');
    setIsLoading(true);
    setError('');

    const result = await verifyEmail(token);

    if (result.success) {
      setMode('verified');
      setSuccess(result.message || '¡Email verificado! Redirigiendo...');
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto-login is handled by verifyEmail in AuthContext
    } else {
      setMode('login');
      setError(result.message || 'Error al verificar email');
      if (result.code === 'TOKEN_EXPIRED') {
        // Show resend option
        setUnverifiedEmail(email);
      }
    }

    setIsLoading(false);
  };

  const handleResendEmail = async () => {
    if (!unverifiedEmail) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await resendVerification(unverifiedEmail);

    if (result.success) {
      setSuccess('Email de verificación reenviado. Revisa tu bandeja de entrada.');
      setMode('email-sent');
    } else {
      setError(result.message || 'Error al reenviar email');
    }

    setIsLoading(false);
  };

  const handleAuth = async () => {
    if (mode === 'login') {
      // Login
      if (!email || !password) {
        setError('Por favor ingresa email y contraseña');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setIsLoading(true);
      setError('');

      const result = await login(email, password);

      if (!result.success) {
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(result.email || email);
          setError(result.message || 'Por favor verifica tu email antes de iniciar sesión');
        } else {
          setError(result.message || 'Error al iniciar sesión');
        }
        setTimeout(() => setError(''), 5000);
      }

      setIsLoading(false);
    } else {
      // Register
      if (!email || !password || !name || !hospital || !specialty) {
        setError('Por favor completa todos los campos');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setIsLoading(true);
      setError('');
      setSuccess('');

      const result = await register(email, password, name, hospital);

      if (result.success) {
        setMode('email-sent');
        setSuccess(result.message || '¡Registro exitoso! Revisa tu email para verificar tu cuenta.');
      } else {
        setError(result.message || 'Error al registrarse');
        setTimeout(() => setError(''), 3000);
      }

      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className="md:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10"><div className="flex items-center gap-3 mb-8"><Stethoscope size={24} className="text-indigo-400"/><span className="text-2xl font-light">In<span className="font-extrabold text-indigo-400">FH</span>arma</span></div><h1 className="text-5xl font-bold mb-6">Consulta Farmacéutica Inteligente.</h1></div>
      </div>
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl">
          {/* Pantalla de Email Enviado */}
          {mode === 'email-sent' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">¡Revisa tu correo!</h2>
              <p className="text-slate-600 mb-6">
                Te hemos enviado un email de verificación a <strong>{email}</strong>.
                Por favor, haz click en el enlace del correo para activar tu cuenta.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">
                  <strong>¿No recibiste el email?</strong>
                  <br />
                  Revisa tu carpeta de spam o solicita un nuevo email de verificación.
                </p>
              </div>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full py-3 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 disabled:bg-gray-400 mb-3"
              >
                {isLoading ? 'Reenviando...' : 'Reenviar email de verificación'}
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}

          {/* Pantalla de Verificando */}
          {mode === 'verifying' && (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verificando tu email...</h2>
              <p className="text-slate-600">Por favor espera un momento.</p>
            </div>
          )}

          {/* Pantalla de Verificado */}
          {mode === 'verified' && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">¡Email verificado!</h2>
              <p className="text-slate-600 mb-6">
                Tu cuenta ha sido activada correctamente. Iniciando sesión...
              </p>
            </div>
          )}

          {/* Pantalla de Login/Registro */}
          {(mode === 'login' || mode === 'register') && (
            <>
              {/* Pestañas Login/Registro */}
              <div className="flex border-b mb-6">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 pb-3 font-bold transition-colors ${mode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 pb-3 font-bold transition-colors ${mode === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
                >
                  Registrarse
                </button>
              </div>

              <h2 className="text-3xl font-bold text-center">{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>

              {/* Campos comunes */}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border rounded-lg"
                placeholder="Email"
                disabled={isLoading}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border rounded-lg"
                placeholder="Contraseña"
                disabled={isLoading}
              />

              {/* Campos adicionales para registro */}
              {mode === 'register' && (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Nombre completo"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={hospital}
                    onChange={e => setHospital(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Hospital"
                    disabled={isLoading}
                  />
                </>
              )}

              {error && (
                <div className="text-rose-500 text-center text-sm bg-rose-50 border border-rose-200 rounded-lg p-3">
                  {error}
                  {unverifiedEmail && (
                    <button
                      onClick={handleResendEmail}
                      className="block w-full mt-2 text-indigo-600 hover:text-indigo-700 font-medium underline"
                    >
                      Reenviar email de verificación
                    </button>
                  )}
                </div>
              )}
              {success && <div className="text-emerald-500 text-center text-sm font-medium bg-emerald-50 border border-emerald-200 rounded-lg p-3">{success}</div>}

              <button
                onClick={handleAuth}
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (mode === 'login' ? 'Iniciando sesión...' : 'Registrando...') : (mode === 'login' ? 'Acceder' : 'Crear Cuenta')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES PRINCIPALES ---
const ProSection = ({ section, children, onRemove, isEditing, updateContent }) => {
  if (section.type === 'alert') {
    const isDanger = section.variant === 'danger';
    return (
      <div className="mb-16 relative group break-inside-avoid">
         {isEditing && <button onClick={onRemove} className="absolute -right-2 -top-2 p-1.5 bg-white border shadow-sm rounded-full text-slate-400 hover:text-rose-500 z-10"><Trash2 size={14}/></button>}
         <div className={`${isDanger ? 'bg-rose-50 border-rose-500 text-rose-900' : 'bg-amber-50 border-amber-500 text-amber-900'} border-l-4 p-4 rounded-r-md flex gap-3`}>
            <AlertTriangle size={20} className="mt-0.5 flex-shrink-0"/>
            <div className="w-full">
               {isEditing ? <EditableText value={section.title} onChange={(v) => updateContent('title', v)} className="font-bold bg-transparent border-b border-rose-200 w-full outline-none mb-1"/> : <h3 className="font-bold uppercase tracking-wide mb-1" dangerouslySetInnerHTML={{__html: section.title}}></h3>}
               <div className="text-sm leading-relaxed font-medium">{children}</div>
            </div>
         </div>
      </div>
    );
  }
  return (
    <div className="mb-16 pl-2 relative group break-inside-avoid">
      {isEditing && <button onClick={onRemove} className="absolute -left-8 top-0 p-1.5 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>}
      <div className="flex items-center mb-3 border-b border-slate-100 pb-2">
         {isEditing ? (
          <div className="flex items-center w-full"><FileText size={24} className="text-slate-400 mr-2"/><EditableText value={section.title} onChange={(v) => updateContent('title', v)} className="text-2xl font-bold text-slate-800 bg-transparent outline-none w-full"/></div>
        ) : <h3 className="text-2xl font-bold text-slate-800 flex items-center tracking-tight" dangerouslySetInnerHTML={{__html: section.title}}></h3>}
      </div>
      <div className="text-slate-700 text-sm leading-relaxed pl-1">{children}</div>
    </div>
  );
};

const ResizableCard = ({ children, colSpan = 12, heightLevel = 1, isEditing, onResize, onResizeHeight, onDelete, onDragStart, onDrop, onDragEnter, onDragEnd, index, color, onColorChange, isDragging, isDragOver }) => {
  const [isActive, setIsActive] = useState(false);
  const spanClasses = { 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6', 8: 'col-span-8', 9: 'col-span-9', 12: 'col-span-12' };
  const heightClasses = { 1: 'h-auto', 2: 'min-h-[16rem]', 3: 'min-h-[24rem]', 4: 'min-h-[32rem]', 5: 'min-h-[40rem]' };

  return (
    <div
      className={`${spanClasses[colSpan]} relative transition-all duration-200 ${isEditing ? 'cursor-pointer' : ''} ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${isDragOver ? 'border-l-4 border-indigo-500 pl-2' : ''}`}
      onClick={() => isEditing && setIsActive(!isActive)}
      draggable={isEditing} onDragStart={(e) => isEditing && onDragStart(e, index)} onDragEnter={(e) => isEditing && onDragEnter(e, index)} onDragEnd={onDragEnd} onDragOver={(e) => e.preventDefault()} onDrop={(e) => isEditing && onDrop(e, index)}
    >
      {isEditing && isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex bg-white border rounded-lg p-2 items-center shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
             <div className="mr-2 text-slate-400 cursor-grab hover:text-indigo-600 rounded p-1" title="Arrastrar"><GripVertical size={16}/></div>
             <div className="w-px bg-slate-200 h-5 mx-2"></div>

             <div className="flex flex-col mr-2">
               <span className="text-[8px] text-slate-400 uppercase mb-1">Color</span>
               <div className="flex gap-1">{Object.keys(CARD_THEMES).map(k => <button key={k} onClick={() => onColorChange(k)} className={`w-4 h-4 rounded ${CARD_THEMES[k].accent} hover:scale-125 transition-transform ${color === k ? 'ring-2 ring-indigo-600' : 'opacity-60'}`} title={CARD_THEMES[k].name}/>)}</div>
             </div>

             <div className="w-px bg-slate-200 h-5 mx-2"></div>

             <div className="flex flex-col mr-2">
               <span className="text-[8px] text-slate-400 uppercase mb-1">Ancho</span>
               <div className="flex items-center gap-1">
                 <button onClick={() => onResize(-1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30" disabled={colSpan <= 3}><Minus size={12}/></button>
                 <span className="text-xs font-mono font-bold w-6 text-center">{colSpan}</span>
                 <button onClick={() => onResize(1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30" disabled={colSpan >= 12}><Plus size={12}/></button>
               </div>
             </div>

             <div className="w-px bg-slate-200 h-5 mx-2"></div>

             <div className="flex flex-col mr-2">
               <span className="text-[8px] text-slate-400 uppercase mb-1">Alto</span>
               <div className="flex items-center gap-1">
                 <button onClick={() => onResizeHeight(-1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30" disabled={heightLevel <= 1}><Minus size={12}/></button>
                 <span className="text-xs font-mono font-bold w-4 text-center">{heightLevel}</span>
                 <button onClick={() => onResizeHeight(1)} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30" disabled={heightLevel >= 5}><Plus size={12}/></button>
               </div>
             </div>

             <div className="w-px bg-slate-200 h-5 mx-2"></div>

             <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded" title="Eliminar tarjeta"><Trash2 size={16}/></button>
        </div>
      )}
      <div className={`h-full flex flex-col transition-all ${heightClasses[heightLevel]} ${isEditing ? `border-2 ${isActive ? 'border-indigo-500 shadow-lg' : 'border-dashed border-slate-300'} rounded-xl` : ''}`}>
        {children}
      </div>
    </div>
  );
};

const PatientInfographic = ({ drug, isEditing, updateDrug, settings }) => {
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [iconPicker, setIconPicker] = useState({ isOpen: false, targetIndex: null });

  const layout = drug.patientSections.layout || [];
  const customCards = drug.patientSections.customCards || [];

  const updatePat = (field, val) => updateDrug({ ...drug, patientSections: { ...drug.patientSections, [field]: val } });
  const updateArray = (field, idx, val) => { const n = [...drug.patientSections[field]]; n[idx] = val; updatePat(field, n); };
  const updateLayout = (newLayout) => updatePat('layout', newLayout);
  
  const handleResize = (index, direction) => {
      const newLayout = [...layout]; const item = newLayout[index];
      const sizes = [3, 4, 6, 8, 9, 12];
      const newIdx = Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(item.colSpan) + direction));
      newLayout[index] = { ...item, colSpan: sizes[newIdx] };
      updateLayout(newLayout);
  };
  const handleResizeHeight = (index, direction) => {
      const newLayout = [...layout]; const item = newLayout[index];
      const newHeight = Math.max(1, Math.min(5, (item.heightLevel || 1) + direction));
      newLayout[index] = { ...item, heightLevel: newHeight };
      updateLayout(newLayout);
  };
  const handleColorChange = (index, newColor) => { const newLayout = [...layout]; newLayout[index] = { ...newLayout[index], color: newColor }; updateLayout(newLayout); };
  const handleDeleteItem = (index) => { setConfirmModal({ isOpen: true, title: 'Eliminar Tarjeta', message: '¿Seguro?', onConfirm: () => { const newLayout = [...layout]; newLayout.splice(index, 1); updateLayout(newLayout); } }); };
  const handleDrop = (e, dropIndex) => { e.preventDefault(); if (draggedItemIndex === null || draggedItemIndex === dropIndex) return; const newLayout = [...layout]; const item = newLayout.splice(draggedItemIndex, 1)[0]; newLayout.splice(dropIndex, 0, item); updateLayout(newLayout); setDraggedItemIndex(null); setDragOverIndex(null); };
  const handleIconSelect = (iconName) => { const newLayout = [...layout]; newLayout[iconPicker.targetIndex] = { ...newLayout[iconPicker.targetIndex], iconName: iconName }; updateLayout(newLayout); };

  const titles = drug.patientSections.titles || { intro: 'Tu Nuevo Aliado', onset: 'Efecto Esperado', admin: 'Cómo inyectarse', missed: '¿Se te olvidó?', disposal: '¿Dónde lo tiro?', travel: 'Kit Viaje', conservation: 'Conservación', tips: 'Consejos', normal: 'Lo Normal', consult: 'Consultar', urgency: 'Urgencias' };
  const updateTitle = (key, val) => updatePat('titles', { ...titles, [key]: val });

  const renderCardContent = (item, index) => {
      const theme = CARD_THEMES[item.color] || CARD_THEMES.indigo;
      const IconComponent = ICON_MAP[item.iconName] || ICON_MAP['Actividad'] || Activity;
      
      const commonHeader = (key) => (
         <div className={`flex items-center gap-2 mb-2 ${theme.icon} font-bold uppercase tracking-widest text-[10px]`}>
            <div className={`cursor-pointer ${isEditing ? 'hover:bg-slate-100 p-1 rounded hover:scale-110 transition-transform' : ''}`} onClick={(e) => { if(isEditing) { e.stopPropagation(); setIconPicker({ isOpen: true, targetIndex: index }); } }}>
              <IconComponent size={16}/>
            </div>
            <EditableText value={titles[key]} isEditing={isEditing} onChange={v => updateTitle(key, v)} className={`bg-transparent border-b ${theme.border} w-full outline-none`}/>
            {iconPicker.isOpen && iconPicker.targetIndex === index && <IconPicker isOpen={true} onClose={()=>setIconPicker({isOpen:false, targetIndex:null})} onSelect={handleIconSelect} />}
         </div>
      );

      switch(item.type) {
        case 'intro': return <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} h-full overflow-auto break-words`}><IconComponent className={`absolute top-2 right-2 opacity-30 ${theme.icon}`}/>{commonHeader('intro')}<EditableText value={drug.patientSections.intro} isEditing={isEditing} multiline onChange={(v) => updatePat('intro', v)} className={`${theme.text} leading-snug text-sm font-medium break-words`}/></div>;
        case 'onset': return <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} h-full text-center overflow-auto break-words`}><div className={`mx-auto bg-white p-2 rounded-full shadow-sm ${theme.icon} mb-2 w-min`}><IconComponent size={20}/></div>{commonHeader('onset')}<EditableText value={drug.patientSections.onset} isEditing={isEditing} multiline onChange={(v) => updatePat('onset', v)} className={`${theme.text} text-[10px] leading-snug break-words`}/></div>;
        case 'admin': return <div className="h-full flex flex-col">{commonHeader('admin')}<div className={`bg-white border ${theme.border} rounded-xl p-4 relative h-full shadow-sm flex-1`}><ul className="grid grid-cols-1 md:grid-cols-2 gap-4">{drug.patientSections.admin.map((item, i) => (<li key={i} className="flex gap-2 text-xs"><div className={`w-5 h-5 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>{i+1}</div><EditableText value={item} isEditing={isEditing} multiline onChange={v=>updateArray('admin',i,v)} className="w-full"/>{isEditing && <button onClick={()=>{const n=[...drug.patientSections.admin];n.splice(i,1);updatePat('admin',n)}} className="text-rose-300"><Trash2 size={10}/></button>}</li>))}</ul>{isEditing && <button onClick={()=>updatePat('admin',[...drug.patientSections.admin,'Nuevo paso'])} className="text-[10px] text-indigo-500 mt-2">+ Paso</button>}</div></div>;
        case 'missed': return <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} h-full overflow-auto break-words`}>{commonHeader('missed')}<EditableText value={drug.patientSections.missedDose} isEditing={isEditing} multiline onChange={v=>updatePat('missedDose',v)} className={`text-xs ${theme.text} break-words`}/></div>;
        case 'disposal': return <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} h-full overflow-auto break-words`}>{commonHeader('disposal')}<EditableText value={drug.patientSections.disposal} isEditing={isEditing} multiline onChange={v=>updatePat('disposal',v)} className={`text-xs ${theme.text} break-words`}/></div>;
        case 'travel': return <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} h-full overflow-auto break-words`}>{commonHeader('travel')}<div className={`text-xs ${theme.text} break-words`}><p>✈️ Certificado.</p><p>🌡️ Nevera.</p></div></div>;
        case 'conservation': return <div className={`${theme.bg} rounded-xl p-5 border ${theme.border} h-full overflow-auto break-words`}>{commonHeader('conservation')}<div className="space-y-2">{drug.patientSections.conservation.map((item,i)=><div key={i} className="flex gap-2"><div className={`w-1 h-1 rounded-full mt-1.5 ${theme.accent}`}></div><EditableText value={item} isEditing={isEditing} multiline onChange={v=>updateArray('conservation',i,v)} className={`text-xs ${theme.text} break-words`}/></div>)}</div></div>;
        case 'tips': return <div className={`${theme.bg} rounded-xl p-5 border ${theme.border} h-full overflow-auto break-words`}>{commonHeader('tips')}<div className="space-y-2">{drug.patientSections.precautions.map((item,i)=><div key={i} className="flex gap-2"><div className="w-1 h-1 rounded-full mt-1.5 bg-slate-400"></div><EditableText value={item} isEditing={isEditing} multiline onChange={v=>updateArray('precautions',i,v)} className="text-xs text-slate-600 break-words"/></div>)}</div></div>;
        case 'sideEffects': return <div className="grid grid-cols-3 gap-4 h-full"><div className="border-t-4 border-emerald-400 bg-white pt-3">{commonHeader('normal')}<div className="text-[10px] text-slate-500 space-y-1">{drug.patientSections.sideEffects.filter(s=>!s.includes('🟡')).map((s,i)=><EditableText key={i} value={s.replace('🟢','')} isEditing={isEditing} multiline onChange={()=>{}}/>)}</div></div><div className="border-t-4 border-amber-400 bg-white pt-3">{commonHeader('consult')}<div className="text-[10px] text-slate-500 space-y-1">{drug.patientSections.sideEffects.filter(s=>s.includes('🟡')).map((s,i)=><EditableText key={i} value={s.replace('🟡','')} isEditing={isEditing} multiline onChange={()=>{}}/>)}</div></div><div className="border-t-4 border-rose-500 bg-rose-50 pt-3 px-2">{commonHeader('urgency')}<div className="text-[10px] text-rose-800 font-bold space-y-1">{drug.patientSections.alarms.map((s,i)=><div key={i} className="flex"><span className="mr-1">•</span><EditableText value={s} isEditing={isEditing} multiline onChange={v=>updateArray('alarms',i,v)}/></div>)}</div></div></div>;
        case 'custom': const c = customCards.find(x=>x.id===item.id)||{title:'',content:''}; return <div className={`${theme.bg} rounded-xl p-4 border ${theme.border} h-full overflow-auto break-words`}>{isEditing?<input value={c.title} onChange={v=>updatePat('customCards',customCards.map(z=>z.id===item.id?{...z,title:v.target.value}:z))} className="font-bold bg-transparent outline-none w-full mb-2" placeholder="Título"/>:<h4 className="font-bold text-xs uppercase mb-2 break-words">{c.title}</h4>}<EditableText value={c.content} isEditing={isEditing} multiline onChange={v=>updatePat('customCards',customCards.map(z=>z.id===item.id?{...z,content:v}:z))} className="text-xs break-words"/></div>;
        default: return null;
      }
  };

  return (
    <div className="bg-slate-100 p-8 flex justify-center overflow-y-auto h-full" onClick={()=>setIconPicker({isOpen:false, targetIndex:null})}>
       <ConfirmModal isOpen={confirmModal.isOpen} onClose={()=>setConfirmModal({...confirmModal,isOpen:false})} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message}/>
       <div id="pdf-content" className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] relative flex flex-col text-slate-800 box-border print:shadow-none print:w-full print:p-0">
          <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-4 mb-6"><div className="flex gap-4 items-center"><div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-600">{settings.logoUrl?<img src={settings.logoUrl} className="w-full h-full object-contain p-2"/>:<Stethoscope size={32}/>}</div><div><h1 className="text-2xl font-black text-slate-900 tracking-tight">{drug.name}</h1><p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Guía de Inicio</p></div></div><div className="text-right"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{settings.hospitalName}</div></div></div>
          <div className="grid grid-cols-12 auto-rows-min gap-6 mb-6">{layout.map((item, index) => (<ResizableCard key={item.id} index={index} colSpan={item.colSpan} heightLevel={item.heightLevel||1} isEditing={isEditing} color={item.color||'indigo'} onResize={d=>handleResize(index,d)} onResizeHeight={d=>handleResizeHeight(index,d)} onDelete={()=>handleDeleteItem(index)} onDragStart={(e)=>setDraggedItemIndex(index)} onDragEnter={(e)=>{e.preventDefault();if(index!==dragOverIndex)setDragOverIndex(index)}} onDragEnd={()=>{setDraggedItemIndex(null);setDragOverIndex(null)}} onDrop={e=>handleDrop(e,index)} isDragging={draggedItemIndex===index} isDragOver={dragOverIndex===index} onColorChange={c=>handleColorChange(index,c)}>{renderCardContent(item, index)}</ResizableCard>))}</div>
          {isEditing && <div className="mb-6 flex justify-center"><button onClick={()=>updatePat('layout',[...layout,{id:`custom_${Date.now()}`,type:'custom',colSpan:4,heightLevel:1,color:'indigo', iconName:'Consejo'}])} className="flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 border-dashed rounded-lg text-indigo-600 font-bold text-xs"><Plus size={16} className="mr-2"/> AÑADIR TARJETA</button></div>}
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center"><div className="flex gap-6"><div className="flex gap-2 items-center"><Phone size={14} className="text-slate-400"/><EditableText value={drug.patientSections.contacts?.phone} isEditing={isEditing} onChange={v=>updateContact('phone',v)} className="text-xs font-bold text-slate-700"/></div></div></div>
       </div>
    </div>
  );
};

// --- APP ---
const App = () => {
  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const { totalUnreadCount, pendingRequests } = useChat(); 
  const [view, setView] = useState('home'); 
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState({});
  const [showCreateArea, setShowCreateArea] = useState(false);
  const [showCreateSubArea, setShowCreateSubArea] = useState(false);
  const [selectedAreaForSubArea, setSelectedAreaForSubArea] = useState('');
  const [customAreas, setCustomAreas] = useState(() => {
    const saved = localStorage.getItem('infharma_custom_areas');
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // Migrar de array a objeto si es necesario
    if (Array.isArray(parsed)) {
      return parsed.reduce((acc, area) => ({ ...acc, [area]: { subAreas: [] } }), {});
    }
    return parsed;
  });
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('infharma_data')) || INITIAL_DATA);
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('infharma_settings')) || INITIAL_SETTINGS);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('pro');
  const [showChat, setShowChat] = useState(false);
  const [showCopyTemplateModal, setShowCopyTemplateModal] = useState(false);
  const [templateMode, setTemplateMode] = useState('pro');
  const [pendingNewDrugSystem, setPendingNewDrugSystem] = useState('');
  const [pendingSubArea, setPendingSubArea] = useState('');
  const [showInitialSetup, setShowInitialSetup] = useState(() => {
    // Mostrar setup inicial si el usuario no tiene configuración guardada
    const hasCompletedSetup = localStorage.getItem('infharma_setup_completed');
    return !hasCompletedSetup;
  });
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameData, setRenameData] = useState({ type: 'area', currentName: '', areaName: '', pathologyName: '' });

  useEffect(() => { localStorage.setItem('infharma_data', JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem('infharma_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('infharma_custom_areas', JSON.stringify(customAreas)); }, [customAreas]);

  const handleLogout = () => { authLogout(); setView('home'); setIsEditing(false); };
  const handleSaveSettings = (newSettings) => { setSettings(newSettings); };
  const handleCompleteInitialSetup = (setupData) => {
    setSettings({ ...settings, hospitalName: setupData.hospitalName, pharmacistName: setupData.pharmacistName });
    localStorage.setItem('infharma_setup_completed', 'true');
    setShowInitialSetup(false);
  };
  const handleSaveDrug = (d) => { const now = new Date(); const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`; const toSave = { ...d, updatedAt: dateStr }; setData(prev => { const ex = prev.find(x=>x.id===toSave.id); return ex ? prev.map(x=>x.id===toSave.id?toSave:x) : [...prev, toSave]; }); setIsCreating(false); setIsEditing(false); };
  const handleCancelEdit = () => { if(isCreating){ setIsCreating(false); setIsEditing(false); setView('home'); setSelectedDrug(null); } else { const orig = data.find(d=>d.id===selectedDrug.id); if(orig) setSelectedDrug(JSON.parse(JSON.stringify(orig))); setIsEditing(false); }};
  const handleDeleteDrug = (id) => { if(window.confirm("¿Eliminar?")) { setData(data.filter(d=>d.id!==id)); setSelectedDrug(null); setView('home'); setIsEditing(false); }};

  const handleAddNew = (sys='', subArea='') => {
    setPendingNewDrugSystem(sys);
    setPendingSubArea(subArea);
    setTemplateMode('pro');
    setShowCopyTemplateModal(true);
  };

  const handleCopyTemplate = (templateDrug) => {
    const newId = `new-${Date.now()}`;
    if (templateDrug) {
      // Copiar desde plantilla
      const copiedDrug = JSON.parse(JSON.stringify(templateDrug));
      setSelectedDrug({
        ...copiedDrug,
        id: newId,
        name: '',
        dci: '',
        system: pendingNewDrugSystem,
        subArea: pendingSubArea,
        type: '',
        presentation: '',
        updatedAt: new Date().toLocaleDateString()
      });
    } else {
      // Empezar en blanco
      setSelectedDrug({
        id: newId,
        name: '',
        subArea: pendingSubArea,
        dci: '',
        system: pendingNewDrugSystem,
        type: '',
        presentation: '',
        updatedAt: new Date().toLocaleDateString(),
        proSections: [],
        patientSections: { intro: '', admin: [], layout: [] }
      });
    }
    setIsCreating(true);
    setIsEditing(true);
    setView('detail');
    setActiveTab('pro');
  };
  const handleCreateArea = (name) => {
    if(name && !customAreas[name]) {
      setCustomAreas({...customAreas, [name]: { subAreas: [] }});
      setExpandedAreas({...expandedAreas, [name]: true});
    }
  };

  const handleCreateSubArea = (areaName, subAreaName) => {
    if (customAreas[areaName]) {
      const updatedArea = {
        ...customAreas[areaName],
        subAreas: [...(customAreas[areaName].subAreas || []), subAreaName]
      };
      setCustomAreas({...customAreas, [areaName]: updatedArea});
    } else {
      // Si el área no existe en customAreas, créala
      setCustomAreas({...customAreas, [areaName]: { subAreas: [subAreaName] }});
    }
  };

  const openSubAreaModal = (areaName) => {
    setSelectedAreaForSubArea(areaName);
    setShowCreateSubArea(true);
  };

  const openRenameAreaModal = (areaName) => {
    setRenameData({ type: 'area', currentName: areaName, areaName: '', pathologyName: '' });
    setShowRenameModal(true);
  };

  const openRenamePathologyModal = (areaName, pathologyName) => {
    setRenameData({ type: 'pathology', currentName: pathologyName, areaName, pathologyName });
    setShowRenameModal(true);
  };

  const handleRenameArea = (newName) => {
    const oldName = renameData.currentName;
    if (oldName === newName) return;

    // Actualizar customAreas
    const newCustomAreas = { ...customAreas };
    if (newCustomAreas[oldName]) {
      newCustomAreas[newName] = newCustomAreas[oldName];
      delete newCustomAreas[oldName];
    }
    setCustomAreas(newCustomAreas);

    // Actualizar todos los medicamentos que tengan este sistema
    setData(data.map(d => d.system === oldName ? { ...d, system: newName } : d));
  };

  const handleRenamePathology = (newName) => {
    const { areaName, currentName: oldName } = renameData;
    if (oldName === newName) return;

    // Actualizar la patología en customAreas
    const newCustomAreas = { ...customAreas };
    if (newCustomAreas[areaName] && newCustomAreas[areaName].subAreas) {
      const subAreas = newCustomAreas[areaName].subAreas.map(sa => sa === oldName ? newName : sa);
      newCustomAreas[areaName] = { ...newCustomAreas[areaName], subAreas };
      setCustomAreas(newCustomAreas);
    }

    // Actualizar todos los medicamentos que tengan esta patología
    setData(data.map(d => (d.system === areaName && d.subArea === oldName) ? { ...d, subArea: newName } : d));
  };
  const getOutdatedDrugs = () => { const parseDate = (str) => { if(!str) return new Date(0); const [d, m, y] = str.split('/'); return new Date(`${y}-${m}-${d}`); }; return [...data].sort((a,b) => parseDate(a.updatedAt) - parseDate(b.updatedAt)).slice(0, 2); };
  const outdatedDrugs = getOutdatedDrugs();
  const handleOpenLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  const handleExportToPDF = () => {
    const element = document.getElementById('pdf-content');
    const fileName = `${selectedDrug.name.replace(/\s+/g, '_')}_${activeTab === 'pro' ? 'Protocolo' : 'Paciente'}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const renderProContent = (section) => {
      const updateItems = (newItems) => setSelectedDrug({...selectedDrug, proSections: selectedDrug.proSections.map(s=>s.id===section.id?{...s,items:newItems}:s)});
      const updateFooter = (val) => setSelectedDrug({...selectedDrug, proSections: selectedDrug.proSections.map(s=>s.id===section.id?{...s,footer:val}:s)});
      if (section.type === 'adjustments') {
        const updateAdj = (idx, field, val) => { const newItems = [...section.items]; newItems[idx] = { ...newItems[idx], [field]: val }; updateItems(newItems); };
        const addItem = () => updateItems([...section.items, { label: 'Nuevo Criterio', action: 'Acción' }]);
        const removeItem = (idx) => { const n=[...section.items]; n.splice(idx,1); updateItems(n); };
        return (
          <div className="w-full mb-8"><div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-lg overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-amber-100 text-amber-900 border-b border-amber-200"><th className="text-left p-3 w-1/3">Situación Clínica (ClCr / Hepática)</th><th className="text-left p-3">Ajuste de Dosis Recomendado</th>{isEditing && <th className="w-10"></th>}</tr></thead><tbody className="divide-y divide-amber-200/50">{section.items.map((item, i) => (<tr key={i} className="hover:bg-amber-100/50"><td className="p-3 font-bold text-amber-800"><EditableText value={item.label} isEditing={isEditing} onChange={v=>updateAdj(i, 'label', v)}/></td><td className="p-3 text-amber-900"><EditableText value={item.action} isEditing={isEditing} multiline onChange={v=>updateAdj(i, 'action', v)}/></td>{isEditing && (<td className="p-3 text-center"><button onClick={()=>removeItem(i)} className="text-amber-400 hover:text-amber-600"><Trash2 size={14}/></button></td>)}</tr>))}</tbody></table>{isEditing && <div className="p-2 bg-amber-100/30 text-center"><button onClick={addItem} className="text-xs font-bold text-amber-600 hover:text-amber-800">+ Añadir Criterio</button></div>}</div></div>
        );
      }
      if (section.type === 'timeline') {
        const updateData = (newData) => setSelectedDrug({...selectedDrug, proSections: selectedDrug.proSections.map(s=>s.id===section.id?{...s,data:newData}:s)});
        const handleBarResize = (idx, change) => { const n=[...section.data]; n[idx].height = Math.max(20, Math.min(150, (n[idx].height||50)+change)); updateData(n); };
        const handleAddStep = () => updateData([...section.data, { week: 'Sem X', dose: 40, label: 'FASE', subtext: 'Desc.', color: 'emerald', height: 50 }]);
        const handleRemoveStep = (idx) => { const n = [...section.data]; n.splice(idx, 1); updateData(n); };
        const handleToggleColor = (idx) => { const n = [...section.data]; n[idx].color = n[idx].color === 'indigo' ? 'emerald' : 'indigo'; updateData(n); };
        return (
           <div className="mt-8 mb-10 w-full"><div className="flex w-full items-end justify-between gap-2 border-b border-slate-200 pb-1 min-h-[220px]">{section.data.map((item, idx) => { const isIndigo = item.color === 'indigo'; return (<div key={idx} className="flex flex-col items-center justify-end relative group flex-1">{isEditing && (<div className="absolute -top-10 flex flex-col gap-1 items-center bg-white shadow-md border rounded p-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity"><div className="flex gap-1"><button onClick={() => handleBarResize(idx, 10)} className="hover:bg-slate-100 p-0.5 rounded"><ChevronDown className="rotate-180" size={12}/></button><button onClick={() => handleBarResize(idx, -10)} className="hover:bg-slate-100 p-0.5 rounded"><ChevronDown size={12}/></button></div><div className="flex gap-1 border-t pt-1"><button onClick={() => handleToggleColor(idx)} className={`w-3 h-3 rounded-full ${isIndigo ? 'bg-emerald-500' : 'bg-indigo-500'}`} title="Cambiar Color"></button><button onClick={() => handleRemoveStep(idx)} className="text-rose-500 hover:bg-rose-50 p-0.5 rounded"><Trash2 size={12}/></button></div></div>)}<div className={`mb-3 font-bold text-xl ${isIndigo?'text-indigo-700':'text-emerald-700'}`}><EditableText value={item.dose} isEditing={isEditing} onChange={v=>{const n=[...section.data];n[idx].dose=v;updateData(n)}} className="text-center min-w-[30px]"/></div><div className={`w-full max-w-[80px] rounded-t-lg shadow-lg ${isIndigo?'bg-gradient-to-t from-indigo-600 to-indigo-400':'bg-gradient-to-t from-emerald-600 to-emerald-400'}`} style={{ height: `${item.height*2}px` }}></div><div className="mt-3 flex flex-col items-center w-full"><div className="bg-slate-50 px-2 py-1 rounded-full border text-[10px] font-bold text-slate-500 uppercase w-full max-w-[80px] text-center overflow-hidden"><EditableText value={item.week} isEditing={isEditing} onChange={v=>{const n=[...section.data];n[idx].week=v;updateData(n)}} className="text-center w-full"/></div><div className={`mt-1 text-[10px] font-black uppercase text-center ${isIndigo?'text-indigo-500':'text-emerald-600'}`}><EditableText value={item.label} isEditing={isEditing} onChange={v=>{const n=[...section.data];n[idx].label=v;updateData(n)}} className="text-center w-full"/></div><div className="text-[9px] text-slate-400 font-medium text-center"><EditableText value={item.subtext} isEditing={isEditing} onChange={v=>{const n=[...section.data];n[idx].subtext=v;updateData(n)}} className="text-center w-full"/></div></div></div>)})} {isEditing && <div className="flex flex-col justify-end"><button onClick={handleAddStep} className="h-40 w-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors ml-4"><Plus/></button></div>}</div></div>
        );
      }
      if (section.type === 'checklist') {
        const toggleItemType = (idx) => {
          const n = [...section.items];
          const item = n[idx];
          // Si es string (checkbox), convertir a texto libre
          if (typeof item === 'string') {
            n[idx] = { type: 'text', content: item };
          }
          // Si es objeto tipo text, convertir a checkbox
          else if (item.type === 'text') {
            n[idx] = item.content;
          }
          updateItems(n);
        };

        const getItemContent = (item) => typeof item === 'string' ? item : item.content;
        const isCheckboxItem = (item) => typeof item === 'string' || item.type === 'checkbox';

        return (
          <div className="space-y-4">
            <ul className="space-y-3">
              {section.items.map((it, i) => {
                const isCheckbox = isCheckboxItem(it);
                return (
                  <li key={i} className="flex items-start text-sm text-slate-700 group/item">
                    {isCheckbox ? (
                      <CheckCircle size={16} className="mt-1 mr-3 text-emerald-600 shrink-0"/>
                    ) : (
                      <FileText size={16} className="mt-1 mr-3 text-indigo-500 shrink-0"/>
                    )}
                    <EditableText
                      value={getItemContent(it)}
                      isEditing={isEditing}
                      multiline
                      onChange={(v) => {
                        const n=[...section.items];
                        n[i] = typeof n[i] === 'string' ? v : { ...n[i], content: v };
                        updateItems(n);
                      }}
                      className={`font-medium w-full ${isCheckbox ? 'text-slate-600' : 'text-slate-700 bg-slate-50 p-2 rounded border-l-2 border-indigo-300'}`}
                    />
                    {isEditing && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => toggleItemType(i)}
                          className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          title={isCheckbox ? "Convertir a texto libre" : "Convertir a checkbox"}
                        >
                          {isCheckbox ? <FileText size={12}/> : <CheckCircle size={12}/>}
                        </button>
                        <button
                          onClick={()=>{const n=[...section.items];n.splice(i,1);updateItems(n)}}
                          className="text-rose-300 hover:text-rose-500"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
              {isEditing && (
                <div className="flex gap-2 ml-7">
                  <button
                    onClick={()=>updateItems([...section.items, 'Nuevo requisito'])}
                    className="text-xs text-emerald-600 mt-2 font-bold hover:text-emerald-700"
                  >
                    + CHECKLIST
                  </button>
                  <button
                    onClick={()=>updateItems([...section.items, { type: 'text', content: 'Texto libre...' }])}
                    className="text-xs text-indigo-500 mt-2 font-bold hover:text-indigo-700"
                  >
                    + TEXTO LIBRE
                  </button>
                </div>
              )}
            </ul>
            {(section.footer || isEditing) && (
              <div className="mt-2 pl-7 flex items-start gap-2 group/footer">
                <EditableText
                  value={section.footer || ''}
                  isEditing={isEditing}
                  multiline
                  placeholder={isEditing ? "Añadir notas..." : ""}
                  onChange={(v) => updateFooter(v)}
                  className="text-sm text-slate-500 italic border-l-2 border-slate-200 pl-3 block w-full"
                />
                {isEditing && section.footer && (
                  <button
                    onClick={() => updateFooter('')}
                    className="text-rose-300 hover:text-rose-500 opacity-0 group-hover/footer:opacity-100 transition-opacity mt-1"
                    title="Eliminar nota"
                  >
                    <Trash2 size={12}/>
                  </button>
                )}
              </div>
            )}
          </div>
        )
      }

      // Para secciones de texto libre (type='text' o sin tipo específico)
      // Soportar tanto contenido simple como items mixtos (checklist + texto)
      if (section.items && Array.isArray(section.items)) {
        // Tiene items mixtos, usar la misma lógica que checklist
        const toggleItemType = (idx) => {
          const n = [...section.items];
          const item = n[idx];
          if (typeof item === 'string') {
            n[idx] = { type: 'text', content: item };
          } else if (item.type === 'text') {
            n[idx] = item.content;
          }
          updateItems(n);
        };

        const getItemContent = (item) => typeof item === 'string' ? item : item.content;
        const isCheckboxItem = (item) => typeof item === 'string' || item.type === 'checkbox';

        return (
          <div className="space-y-4">
            <ul className="space-y-3">
              {section.items.map((it, i) => {
                const isCheckbox = isCheckboxItem(it);
                return (
                  <li key={i} className="flex items-start text-sm text-slate-700 group/item">
                    {isCheckbox ? (
                      <CheckCircle size={16} className="mt-1 mr-3 text-emerald-600 shrink-0"/>
                    ) : (
                      <FileText size={16} className="mt-1 mr-3 text-indigo-500 shrink-0"/>
                    )}
                    <EditableText
                      value={getItemContent(it)}
                      isEditing={isEditing}
                      multiline
                      onChange={(v) => {
                        const n=[...section.items];
                        n[i] = typeof n[i] === 'string' ? v : { ...n[i], content: v };
                        updateItems(n);
                      }}
                      className={`font-medium w-full ${isCheckbox ? 'text-slate-600' : 'text-slate-700 bg-slate-50 p-2 rounded border-l-2 border-indigo-300'}`}
                    />
                    {isEditing && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => toggleItemType(i)}
                          className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          title={isCheckbox ? "Convertir a texto libre" : "Convertir a checkbox"}
                        >
                          {isCheckbox ? <FileText size={12}/> : <CheckCircle size={12}/>}
                        </button>
                        <button
                          onClick={()=>{const n=[...section.items];n.splice(i,1);updateItems(n)}}
                          className="text-rose-300 hover:text-rose-500"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={()=>updateItems([...section.items, 'Nuevo requisito'])}
                    className="text-xs text-emerald-600 mt-2 font-bold hover:text-emerald-700"
                  >
                    + CHECKLIST
                  </button>
                  <button
                    onClick={()=>updateItems([...section.items, { type: 'text', content: 'Texto libre...' }])}
                    className="text-xs text-indigo-500 mt-2 font-bold hover:text-indigo-700"
                  >
                    + TEXTO LIBRE
                  </button>
                </div>
              )}
            </ul>
            {(section.footer || isEditing) && (
              <div className="mt-2 flex items-start gap-2 group/footer">
                <EditableText
                  value={section.footer || ''}
                  isEditing={isEditing}
                  multiline
                  placeholder={isEditing ? "Añadir notas..." : ""}
                  onChange={(v) => updateFooter(v)}
                  className="text-sm text-slate-500 italic border-l-2 border-slate-200 pl-3 block w-full"
                />
                {isEditing && section.footer && (
                  <button
                    onClick={() => updateFooter('')}
                    className="text-rose-300 hover:text-rose-500 opacity-0 group-hover/footer:opacity-100 transition-opacity mt-1"
                    title="Eliminar nota"
                  >
                    <Trash2 size={12}/>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }

      // Texto libre simple (sin items todavía)
      return (
        <div className="space-y-3">
          <EditableText
            value={section.content || ''}
            isEditing={isEditing}
            multiline
            onChange={v => setSelectedDrug({...selectedDrug, proSections: selectedDrug.proSections.map(s => s.id === section.id ? {...s, content: v} : s)})}
            className="text-sm text-slate-700 leading-relaxed block w-full"
          />
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Convertir content a items y añadir checklist
                  const currentContent = section.content || '';
                  const newItems = currentContent.trim() ? [{ type: 'text', content: currentContent }, 'Nuevo requisito'] : ['Nuevo requisito'];
                  setSelectedDrug({
                    ...selectedDrug,
                    proSections: selectedDrug.proSections.map(s =>
                      s.id === section.id ? {...s, items: newItems, content: ''} : s
                    )
                  });
                }}
                className="text-xs text-emerald-600 font-bold hover:text-emerald-700"
              >
                + CHECKLIST
              </button>
              <button
                onClick={() => {
                  // Convertir content a items y añadir texto libre
                  const currentContent = section.content || '';
                  const newItems = currentContent.trim() ? [{ type: 'text', content: currentContent }, { type: 'text', content: 'Texto libre...' }] : [{ type: 'text', content: 'Texto libre...' }];
                  setSelectedDrug({
                    ...selectedDrug,
                    proSections: selectedDrug.proSections.map(s =>
                      s.id === section.id ? {...s, items: newItems, content: ''} : s
                    )
                  });
                }}
                className="text-xs text-indigo-500 font-bold hover:text-indigo-700"
              >
                + TEXTO LIBRE
              </button>
            </div>
          )}
        </div>
      );
  };

  return (
    <>
      <style>{`@media print { @page { size: A4; margin: 0; } body { background: white; } .no-print { display: none !important; } aside, header { display: none !important; } .a4-container { width: 100% !important; height: 100% !important; box-shadow: none !important; margin: 0 !important; } button { display: none !important; } input, textarea { border: none !important; } }`}</style>

      {/* Modal de configuración inicial obligatorio */}
      <InitialSetupModal isOpen={isAuthenticated && showInitialSetup} onComplete={handleCompleteInitialSetup} user={user}/>

      <SettingsModal isOpen={showSettings} onClose={()=>setShowSettings(false)} settings={settings} onSave={handleSaveSettings}/>
      <CalculatorsModal isOpen={showCalculator} onClose={()=>setShowCalculator(false)}/>
      <CreateAreaModal isOpen={showCreateArea} onClose={()=>setShowCreateArea(false)} onConfirm={handleCreateArea} existingAreas={Array.from(new Set([...data.map(d=>d.system),...Object.keys(customAreas)])).sort()}/>
      <CreateSubAreaModal isOpen={showCreateSubArea} onClose={()=>setShowCreateSubArea(false)} onConfirm={handleCreateSubArea} areaName={selectedAreaForSubArea}/>
      <RenameModal
        isOpen={showRenameModal}
        onClose={()=>setShowRenameModal(false)}
        onConfirm={renameData.type === 'area' ? handleRenameArea : handleRenamePathology}
        currentName={renameData.currentName}
        type={renameData.type}
      />
      <CopyTemplateModal isOpen={showCopyTemplateModal} onClose={()=>setShowCopyTemplateModal(false)} onConfirm={handleCopyTemplate} drugs={data} mode={templateMode}/>

      {!isAuthenticated ? <LoginPage /> : (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
          <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col z-20 no-print">
            <div className="h-16 flex items-center px-6 border-b cursor-pointer" onClick={()=>setView('home')}><div className="w-8 h-8 bg-indigo-600 rounded mr-3 flex items-center justify-center text-white"><Stethoscope size={18}/></div><span className="font-bold">InFHarma</span></div>
            <div className="p-4 flex-1 overflow-y-auto">
               <div className="relative mb-4"><Search className="absolute left-3 top-2.5 text-slate-400" size={16}/><input type="text" placeholder="Buscar..." className="w-full pl-9 py-2 bg-slate-50 border rounded-lg text-sm" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>{searchTerm && <button onClick={()=>setSearchTerm('')} className="absolute right-2 top-2.5 text-slate-400"><XCircle size={16}/></button>}</div>

               {/* Barra de Chat */}
               <button
                 onClick={() => setShowChat(true)}
                 className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 px-3 flex items-center justify-between transition-colors relative"
               >
                 <div className="flex items-center gap-2">
                   <MessageCircle size={16}/>
                   <span className="font-medium text-sm">Mensajes</span>
                 </div>
                 {(totalUnreadCount > 0 || pendingRequests?.length > 0) && (
                   <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                     {totalUnreadCount + (pendingRequests?.length || 0)}
                   </span>
                 )}
               </button>

               {Array.from(new Set([...data.map(d=>d.system).filter(Boolean),...Object.keys(customAreas)])).sort().map(sys => {
                  const allDrugsInArea = data.filter(d => d.system === sys && (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.dci.toLowerCase().includes(searchTerm.toLowerCase())));
                  const subAreas = customAreas[sys]?.subAreas || [];

                  // Solo mostrar medicamentos que estén en patologías
                  const hasDrugsInPathologies = subAreas.some(subArea =>
                    allDrugsInArea.some(d => d.subArea === subArea)
                  );

                  if(!hasDrugsInPathologies && !customAreas[sys] && searchTerm) return null;
                  const isOpen = expandedAreas[sys] || searchTerm;

                  return (
                    <div key={sys} className="mb-1">
                       <div className="flex items-center justify-between group">
                         <button onClick={()=>setExpandedAreas({...expandedAreas,[sys]:!expandedAreas[sys]})} className="flex items-center justify-between flex-1 px-2 py-2 text-left hover:bg-slate-50 rounded">
                           <div className="flex items-center text-sm font-bold text-slate-600">
                             <FolderPlus size={16} className="mr-2 text-slate-400"/>{sys}
                           </div>
                           {isOpen?<ChevronDown size={14}/>:<ChevronRight size={14}/>}
                         </button>
                         <button onClick={()=>openRenameAreaModal(sys)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-emerald-50 rounded text-emerald-500" title="Renombrar área">
                           <Edit3 size={14}/>
                         </button>
                         <button onClick={()=>openSubAreaModal(sys)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-indigo-50 rounded text-indigo-400" title="Añadir patología">
                           <FolderMinus size={14}/>
                         </button>
                       </div>
                       {isOpen && (
                         <div className="pl-6 mt-1 space-y-1">
                           {/* Solo mostrar patologías, NO medicamentos sueltos */}
                           {subAreas.length === 0 && (
                             <p className="text-xs text-slate-400 italic py-2">
                               No hay patologías. Crea una patología para añadir fármacos.
                             </p>
                           )}

                           {/* Patologías */}
                           {subAreas.map(subArea => {
                             const subAreaDrugs = allDrugsInArea.filter(d => d.subArea === subArea);
                             const subAreaKey = `${sys}-${subArea}`;
                             const isSubAreaOpen = expandedAreas[subAreaKey] || searchTerm;

                             return (
                               <div key={subArea} className="mt-2">
                                 <div className="flex items-center justify-between group/pathology">
                                   <button onClick={()=>setExpandedAreas({...expandedAreas,[subAreaKey]:!expandedAreas[subAreaKey]})} className="flex items-center justify-between flex-1 px-2 py-1 text-left hover:bg-slate-100 rounded">
                                     <div className="flex items-center text-xs font-semibold text-slate-500">
                                       <FolderMinus size={12} className="mr-2 text-slate-300"/>{subArea}
                                     </div>
                                     {isSubAreaOpen?<ChevronDown size={12}/>:<ChevronRight size={12}/>}
                                   </button>
                                   <button onClick={()=>openRenamePathologyModal(sys, subArea)} className="opacity-0 group-hover/pathology:opacity-100 transition-opacity p-1 hover:bg-emerald-50 rounded text-emerald-400" title="Renombrar patología">
                                     <Edit3 size={10}/>
                                   </button>
                                 </div>
                                 {isSubAreaOpen && (
                                   <div className="pl-6 mt-1 space-y-1">
                                     {subAreaDrugs.length === 0 && (
                                       <p className="text-xs text-slate-300 italic py-1">Sin fármacos</p>
                                     )}
                                     {subAreaDrugs.map(d=>
                                       <button key={d.id} onClick={()=>{setSelectedDrug(d);setView('detail');setActiveTab('pro');setIsEditing(false)}} className="block w-full text-left text-xs text-slate-400 hover:text-indigo-600 py-1">
                                         {d.name}
                                       </button>
                                     )}
                                     <button onClick={()=>handleAddNew(sys, subArea)} className="text-xs text-indigo-300 flex items-center mt-1 hover:text-indigo-500">
                                       <Plus size={10} className="mr-1"/> Añadir Fármaco
                                     </button>
                                   </div>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       )}
                    </div>
                  )
               })}
            </div>
            <div className="p-4 border-t space-y-2"><button onClick={()=>setShowSettings(true)} className="flex items-center text-sm w-full p-2 hover:bg-slate-50 rounded"><Settings size={16} className="mr-2"/> Configuración</button><button onClick={handleLogout} className="flex items-center text-sm w-full p-2 hover:bg-rose-50 text-rose-600 rounded"><LogOut size={16} className="mr-2"/> Salir</button></div>
          </aside>
          <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
            <header className="h-16 flex items-center justify-between px-8 border-b bg-white/80 backdrop-blur no-print">
               <div className="text-sm text-slate-500">{view==='detail' && <button onClick={()=>setView('home')} className="hover:text-slate-900 flex items-center"><ArrowLeft size={14} className="mr-1"/> Volver</button>}</div>
               <div className="flex gap-2"></div>
            </header>
            <div className="flex-1 overflow-y-auto bg-slate-50">
               {view === 'home' ? (
                 <div className="max-w-6xl mx-auto pt-12 px-8 pb-20">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">HOSPITAL {user?.hospital || settings.hospitalName || 'Hospital'}</h1>
                    <p className="text-slate-500 mb-10">Panel de Control • {user?.name || settings.pharmacistName || 'Usuario'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                       <div onClick={() => setShowCreateArea(true)} className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors flex flex-col justify-between min-h-[160px] relative overflow-hidden group"><div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110"><FolderPlus size={100}/></div><div className="p-3 bg-white/20 w-fit rounded-lg mb-4"><Plus size={24}/></div><div><p className="font-bold text-lg">Nueva Área</p><p className="text-indigo-200 text-sm">Crear carpeta</p></div></div>
                       <div onClick={() => handleOpenLink('https://www.aemps.gob.es/medicamentos-de-uso-humano/')} className="bg-white rounded-xl p-6 border shadow-sm cursor-pointer hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] group"><div className="flex justify-between items-start"><div className="p-3 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors"><AlertCircle size={24}/></div><ExternalLink size={16} className="text-slate-300"/></div><div className="mt-4"><p className="font-bold text-slate-900 text-lg leading-tight">Alertas Seguridad</p><p className="text-slate-500 text-sm mt-1">Web AEMPS Humana</p></div></div>
                       <div onClick={() => handleOpenLink('https://cima.aemps.es/cima/publico/listadesabastecimiento.html')} className="bg-white rounded-xl p-6 border shadow-sm cursor-pointer hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] group"><div className="flex justify-between items-start"><div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors"><AlertTriangle size={24}/></div><ExternalLink size={16} className="text-slate-300"/></div><div className="mt-4"><p className="font-bold text-slate-900 text-lg">Desabastecimiento</p><p className="text-slate-500 text-sm mt-1">Problemas Suministro</p></div></div>
                       <div className="bg-white rounded-xl p-6 border shadow-sm flex flex-col justify-between min-h-[160px]"><div className="p-3 bg-sky-50 text-sky-600 rounded-lg w-fit"><BarChart3 size={24}/></div><div className="mt-4"><p className="font-bold text-slate-900 text-lg">Estadísticas</p><p className="text-slate-500 text-sm mt-1">{data.length} Fichas activas</p></div></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-2 space-y-6"><h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Acceso Rápido</h3><div className="bg-white rounded-xl border shadow-sm overflow-hidden">{data.slice(0, 5).map(d => (<div key={d.id} onClick={() => { setSelectedDrug(d); setView('detail'); setActiveTab('pro'); }} className="p-4 border-b hover:bg-slate-50 cursor-pointer flex items-center justify-between last:border-0"><div className="flex items-center"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 text-slate-500 font-bold text-xs">{d.name.substring(0,2).toUpperCase()}</div><div><p className="font-bold text-slate-800">{d.name}</p><p className="text-xs text-slate-500">{d.dci}</p></div></div><ArrowUpRight size={18} className="text-indigo-600"/></div>))}</div></div>
                       <div className="space-y-6"><h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide flex items-center gap-2 text-rose-600"><History size={16}/> Pendientes de Revisión</h3><div className="bg-white rounded-xl border shadow-sm p-5 space-y-4"><p className="text-xs text-slate-500">Protocolos con fecha de actualización más antigua.</p>{outdatedDrugs.map(d => (<div key={d.id} onClick={() => { setSelectedDrug(d); setView('detail'); setActiveTab('pro'); }} className="flex gap-3 cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded transition-colors"><div className="mt-1 text-amber-500"><Clock size={16}/></div><div><p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">{d.name}</p><p className="text-xs text-slate-400 mt-1">Actualizado: <span className="font-mono text-slate-600">{d.updatedAt}</span></p></div></div>))}{outdatedDrugs.length === 0 && <p className="text-sm text-slate-400 italic">Todo actualizado.</p>}</div></div>
                    </div>
                 </div>
               ) : (
                 <div className="max-w-5xl mx-auto p-8 pb-20">
                    <div className="mb-8">{isEditing ? (<div className="flex flex-col gap-4"><EditableText className="text-4xl font-bold border-b border-indigo-200 outline-none" value={selectedDrug.name} onChange={v=>setSelectedDrug({...selectedDrug, name: v})} isEditing={true} placeholder="Nombre Comercial"/><div className="flex gap-4"><EditableText className="border p-2 rounded w-full" value={selectedDrug.dci} onChange={v=>setSelectedDrug({...selectedDrug,dci:v})} isEditing={true} placeholder="DCI"/><EditableText className="border p-2 rounded w-full" value={selectedDrug.presentation} onChange={v=>setSelectedDrug({...selectedDrug,presentation:v})} isEditing={true} placeholder="Presentación"/></div></div>) : (<div><div className="flex gap-2 mb-2"><Badge className="bg-indigo-100 text-indigo-800">{selectedDrug.system}</Badge><Badge className="bg-slate-100 text-slate-600">{selectedDrug.type}</Badge></div><h1 className="text-5xl font-bold text-slate-900 mb-2">{selectedDrug.name}</h1><p className="text-xl text-slate-500 font-light">{selectedDrug.dci} | {selectedDrug.presentation}</p></div>)}</div>
                    
                    {/* --- PESTAÑAS Y BOTÓN EDITAR --- */}
                    <div className="flex justify-between items-center mb-10 border-b no-print">
                        <div className="flex">
                           <button onClick={()=>setActiveTab('pro')} className={`pb-4 px-6 font-bold border-b-2 ${activeTab==='pro'?'border-indigo-600 text-indigo-600':'border-transparent text-slate-400'}`}>Protocolo</button>
                           <button onClick={()=>setActiveTab('patient')} className={`pb-4 px-6 font-bold border-b-2 ${activeTab==='patient'?'border-emerald-500 text-emerald-600':'border-transparent text-slate-400'}`}>Paciente</button>
                        </div>
                        {/* Botones de acción */}
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={handleExportToPDF}
                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center font-medium"
                            title="Exportar a PDF"
                          >
                            <Download size={14} className="mr-2"/> PDF
                          </button>
                          {isEditing ? (
                            <>
                              <button onClick={handleCancelEdit} className="px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 font-medium">
                                Cancelar
                              </button>
                              <button onClick={()=>handleSaveDrug(selectedDrug)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center font-bold">
                                <Save size={14} className="mr-2"/> Guardar
                              </button>
                                </>
                              ) : (
                                <button onClick={()=>setIsEditing(true)} className="px-3 py-2 border rounded-lg text-sm hover:bg-slate-50 flex items-center font-medium">
                                  <Edit3 size={14} className="mr-2"/> Editar
                                </button>
                              )}
                        </div>
                    </div>

                    {activeTab === 'pro' ? (
                       <div id="pdf-content" className="bg-white shadow-lg mx-auto p-12 min-h-[297mm] max-w-[210mm]">
                          <div className="flex justify-between items-end border-b pb-6 mb-8"><div><h2 className="text-2xl font-black uppercase">Protocolo Clínico</h2><div className="flex items-center gap-2 text-sm text-slate-500 mt-1"><Activity size={16} className="text-indigo-500"/> Farmacia Hospitalaria</div></div><div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Revisión</p><p className="font-mono text-sm">{selectedDrug.updatedAt}</p></div></div>
                          <div>{selectedDrug.proSections.map(section => (<ProSection key={section.id} section={section} isEditing={isEditing} updateContent={(f,v)=>setSelectedDrug({...selectedDrug, proSections: selectedDrug.proSections.map(s=>s.id===section.id?{...s,[f]:v}:s)})} onRemove={()=>{if(window.confirm("Borrar sección?")) setSelectedDrug({...selectedDrug, proSections: selectedDrug.proSections.filter(s=>s.id!==section.id)})}}>{renderProContent(section)}</ProSection>))}</div>
                          {isEditing && (<div className="mt-12 pt-6 border-t border-dashed text-center flex gap-3 justify-center no-print"><button onClick={()=>setSelectedDrug({...selectedDrug, proSections: [...selectedDrug.proSections, { id: Date.now(), title: 'Nueva Sección', type: 'text', content: 'Escriba aquí el contenido del protocolo...' }]})} className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm hover:bg-indigo-100 flex items-center"><Plus size={16} className="mr-2"/> Texto Libre</button><button onClick={()=>setSelectedDrug({...selectedDrug, proSections: [...selectedDrug.proSections, { id: Date.now(), title: 'Ajuste Renal/Hepático', type: 'adjustments', items: [{label: 'Criterio', action: 'Acción'}] }]})} className="px-6 py-3 bg-amber-100 text-amber-700 rounded-full font-bold text-sm hover:bg-amber-200 flex items-center border border-amber-300"><AlertTriangle size={16} className="mr-2"/> Ajustes Dosis</button><button onClick={()=>setSelectedDrug({...selectedDrug, proSections: [...selectedDrug.proSections, { id: Date.now(), title: 'Gráfica Posología', type: 'timeline', data: [{ week: 'S0', dose: 100, label: 'Inicio', subtext: '', color: 'indigo', height: 100 }] }]})} className="px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full font-bold text-sm hover:bg-emerald-100 flex items-center"><BarChart3 size={16} className="mr-2"/> Gráfica</button><button onClick={()=>setSelectedDrug({...selectedDrug, proSections: [...selectedDrug.proSections, { id: Date.now(), title: 'Checklist', type: 'checklist', items: ['Requisito 1'] }]})} className="px-6 py-3 bg-sky-50 text-sky-700 rounded-full font-bold text-sm hover:bg-sky-100 flex items-center"><CheckCircle size={16} className="mr-2"/> Checklist</button></div>)}
                       </div>
                    ) : <PatientInfographic drug={selectedDrug} isEditing={isEditing} updateDrug={setSelectedDrug} settings={settings}/>}
                 </div>
               )}
            </div>
          </main>
        </div>
      )}

      {/* Chat Layout */}
      {showChat && <ChatLayout onClose={() => setShowChat(false)} />}
    </>
  );
};

export default App;