import { create } from 'zustand';
import { SimulationState, CameraViewPreset, SystemMetrics, ComponentChangeLogEntry } from './types';

interface SimulationStore {
  // State
  state: SimulationState;
  previousState: SimulationState;
  activeLabel: string;
  activeSublabel: string;
  
  // Camera & view
  cameraPreset: CameraViewPreset;
  autoTour: boolean;
  simulationSpeed: number;
  
  // Subsystems
  sentinelOnline: boolean;
  lifelineOnline: boolean;
  relayClosed: boolean;
  sirenActive: boolean;
  eStopPushed: boolean;
  productionActive: boolean;
  espNowAlert: boolean;
  honeypotActive: boolean;
  attackerActive: boolean;
  heartbeatPulse: number;
  
  // Highlighting of changes in specific components
  activeHighlights: string[]; // IDs of components currently highlighting changes
  changeLogs: ComponentChangeLogEntry[];
  showTelemetry: boolean;
  
  // Metrics
  metrics: SystemMetrics;
  
  // Actions
  setState: (state: SimulationState) => void;
  triggerAttack: () => void;
  triggerSentinelOffline: () => void;
  triggerIsolate: () => void;
  resetToNormal: () => void;
  setCameraPreset: (preset: CameraViewPreset) => void;
  toggleAutoTour: () => void;
  setSimulationSpeed: (speed: number) => void;
  incrementHeartbeat: () => void;
  toggleTelemetry: () => void;
  clearHighlights: () => void;
}

let transitionTimeout1: NodeJS.Timeout | null = null;
let transitionTimeout2: NodeJS.Timeout | null = null;
let transitionTimeout3: NodeJS.Timeout | null = null;

const getTimeString = () => {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  state: 'NORMAL',
  previousState: 'NORMAL',
  activeLabel: 'NORMAL',
  activeSublabel: 'PRODUCTION ACTIVE',
  
  cameraPreset: 'OVERVIEW',
  autoTour: false,
  simulationSpeed: 1,
  
  sentinelOnline: true,
  lifelineOnline: true,
  relayClosed: true,
  sirenActive: false,
  eStopPushed: false,
  productionActive: true,
  espNowAlert: false,
  honeypotActive: false,
  attackerActive: false,
  heartbeatPulse: 0,
  
  activeHighlights: [],
  changeLogs: [
    {
      id: 'init',
      time: getTimeString(),
      component: 'KAVACH SYSTEM',
      action: 'INITIALIZED',
      detail: 'Factory OT network active. Sentinel & Lifeline operating nominal.',
      color: '#10b981',
      type: 'SUCCESS',
    },
  ],
  showTelemetry: true,
  
  metrics: {
    threatCount: 0,
    deceivedCount: 0,
    heartbeatRate: 1.0,
    relayState: 'CLOSED',
    sirenActive: false,
    eStopActive: false,
    productionActive: true,
    espNowNodesCount: 4,
    activeStateText: 'NORMAL',
    stateSubtext: 'PRODUCTION ACTIVE',
  },

  setState: (newState: SimulationState) => {
    set((s) => ({ state: newState, previousState: s.state }));
  },

  toggleTelemetry: () => {
    set((s) => ({ showTelemetry: !s.showTelemetry }));
  },

  clearHighlights: () => {
    set({ activeHighlights: [] });
  },

  triggerAttack: () => {
    if (transitionTimeout1) clearTimeout(transitionTimeout1);
    if (transitionTimeout2) clearTimeout(transitionTimeout2);
    if (transitionTimeout3) clearTimeout(transitionTimeout3);

    const speed = get().simulationSpeed;

    // STEP 1: Rogue Client injects attack -> Sentinel detects via in-line TAP
    set((s) => ({
      state: 'ATTACK',
      previousState: s.state,
      activeLabel: 'ROGUE TRAFFIC',
      activeSublabel: 'ANOMALY DETECTED',
      attackerActive: true,
      honeypotActive: false,
      espNowAlert: false,
      activeHighlights: ['ATTACKER', 'SENTINEL'],
      changeLogs: [
        {
          id: `log-${Date.now()}-1`,
          time: getTimeString(),
          component: 'ROGUE CLIENT',
          action: 'EXPLOIT INJECTION',
          detail: 'Unauthorized Modbus function code frame injected from external link',
          color: '#ef4444',
          type: 'ALERT',
        },
        {
          id: `log-${Date.now()}-2`,
          time: getTimeString(),
          component: 'SENTINEL',
          action: 'THREAT INTERCEPTED',
          detail: 'Hardware TAP captures packet. Deep packet inspection matches signature',
          color: '#ef4444',
          type: 'ALERT',
        },
        ...s.changeLogs.slice(0, 8),
      ],
      metrics: {
        ...s.metrics,
        threatCount: s.metrics.threatCount + 1,
        activeStateText: 'DETECTED',
        stateSubtext: 'TRAFFIC INTERCEPTED',
      },
    }));

    // STEP 2: Sentinel dynamically updates routing table and diverts packet to Honeypot
    transitionTimeout1 = setTimeout(() => {
      set((s) => ({
        activeLabel: 'THREAT DETECTED',
        activeSublabel: 'REDIRECTING TO HONEYPOT',
        activeHighlights: ['SENTINEL', 'HONEYPOT'],
        changeLogs: [
          {
            id: `log-${Date.now()}-3`,
            time: getTimeString(),
            component: 'SENTINEL',
            action: 'TRAFFIC DIVERSION',
            detail: 'Malicious session routed away from real PLC towards synthetic deception',
            color: '#8b5cf6',
            type: 'WARNING',
          },
          ...s.changeLogs.slice(0, 8),
        ],
      }));

      // STEP 3: Honeypot traps exploit; ESP-NOW broadcasts peer alert; Real PLC stays 100% safe
      transitionTimeout2 = setTimeout(() => {
        set((s) => ({
          state: 'DECEIVED',
          activeLabel: 'DECEIVED',
          activeSublabel: 'PRODUCTION ACTIVE',
          honeypotActive: true,
          espNowAlert: true,
          activeHighlights: ['HONEYPOT', 'ESPNOW', 'PLC'],
          changeLogs: [
            {
              id: `log-${Date.now()}-4`,
              time: getTimeString(),
              component: 'HONEYPOT',
              action: 'DECEPTION ACTIVE',
              detail: 'Synthetic PLC emulates response. Attacker trapped in decoy environment',
              color: '#8b5cf6',
              type: 'WARNING',
            },
            {
              id: `log-${Date.now()}-5`,
              time: getTimeString(),
              component: 'ESP-NOW MESH',
              action: 'PEER ALERT BROADCAST',
              detail: 'Encrypted wireless alert sent to 4 distributed KAVACH peer nodes',
              color: '#0284c7',
              type: 'INFO',
            },
            {
              id: `log-${Date.now()}-6`,
              time: getTimeString(),
              component: 'REAL PLC',
              action: 'PRODUCTION SECURED',
              detail: 'Zero malicious bytes reached machine. Continuous manufacturing maintained',
              color: '#10b981',
              type: 'SUCCESS',
            },
            ...s.changeLogs.slice(0, 8),
          ],
          metrics: {
            ...s.metrics,
            deceivedCount: s.metrics.deceivedCount + 1,
            activeStateText: 'DECEIVED',
            stateSubtext: 'PRODUCTION SECURED',
          },
        }));

        // STEP 4: Settle back to normal monitoring after demonstration
        transitionTimeout3 = setTimeout(() => {
          set((s) => ({
            attackerActive: false,
            espNowAlert: false,
            activeHighlights: [],
            activeLabel: 'NORMAL',
            activeSublabel: 'PRODUCTION ACTIVE',
            state: 'NORMAL',
          }));
        }, 7000 / speed);
      }, 2000 / speed);
    }, 1400 / speed);
  },

  triggerSentinelOffline: () => {
    if (transitionTimeout1) clearTimeout(transitionTimeout1);
    if (transitionTimeout2) clearTimeout(transitionTimeout2);
    if (transitionTimeout3) clearTimeout(transitionTimeout3);

    const speed = get().simulationSpeed;

    // STEP 1: Sentinel MPU powers off; Heartbeat ceases
    set((s) => ({
      state: 'SENTINEL_OFFLINE',
      previousState: s.state,
      sentinelOnline: false,
      activeLabel: 'SENTINEL OFFLINE',
      activeSublabel: 'HEARTBEAT LOST',
      activeHighlights: ['SENTINEL', 'LIFELINE'],
      changeLogs: [
        {
          id: `log-${Date.now()}-off1`,
          time: getTimeString(),
          component: 'SENTINEL',
          action: 'POWER FAULT / OFFLINE',
          detail: 'Raspberry Pi 4B processor ceased operation. Status changed to INACTIVE',
          color: '#f59e0b',
          type: 'WARNING',
        },
        {
          id: `log-${Date.now()}-off2`,
          time: getTimeString(),
          component: 'HEARTBEAT BUS',
          action: 'PULSE SIGNAL LOST',
          detail: '1.0 Hz hardware pulse line dropped to 0.0 Hz',
          color: '#f59e0b',
          type: 'WARNING',
        },
        ...s.changeLogs.slice(0, 8),
      ],
      metrics: {
        ...s.metrics,
        heartbeatRate: 0.0,
        activeStateText: 'SENTINEL OFFLINE',
        stateSubtext: 'HEARTBEAT LOST',
      },
    }));

    // STEP 2: Lifeline hardware watchdog trips and takes over autonomous safety supervision
    transitionTimeout1 = setTimeout(() => {
      set((s) => ({
        state: 'AUTONOMOUS',
        activeLabel: 'LIFELINE ACTIVE',
        activeSublabel: 'AUTONOMOUS SAFE',
        productionActive: true,
        activeHighlights: ['LIFELINE', 'PLC'],
        changeLogs: [
          {
            id: `log-${Date.now()}-auto1`,
            time: getTimeString(),
            component: 'LIFELINE',
            action: 'AUTONOMOUS FAILOVER',
            detail: 'ESP32-S3 hardware watchdog timeout triggered. Full safety supervision engaged',
            color: '#06b6d4',
            type: 'INFO',
          },
          {
            id: `log-${Date.now()}-auto2`,
            time: getTimeString(),
            component: 'REAL PLC',
            action: 'SAFE TRAFFIC FILTERED',
            detail: 'Lifeline MCU maintaining hardware safety interlock during autonomous state',
            color: '#10b981',
            type: 'SUCCESS',
          },
          ...s.changeLogs.slice(0, 8),
        ],
        metrics: {
          ...s.metrics,
          activeStateText: 'AUTONOMOUS',
          stateSubtext: 'LIFELINE SUPERVISION',
        },
      }));
    }, 2200 / speed);
  },

  triggerIsolate: () => {
    if (transitionTimeout1) clearTimeout(transitionTimeout1);
    if (transitionTimeout2) clearTimeout(transitionTimeout2);
    if (transitionTimeout3) clearTimeout(transitionTimeout3);

    set((s) => ({
      state: 'ISOLATE',
      previousState: s.state,
      relayClosed: false,
      sirenActive: true,
      eStopPushed: true,
      productionActive: false,
      activeLabel: 'ISOLATE',
      activeSublabel: 'NETWORK SEVERED — RELAY OPEN — ALL FLOW HALTED',
      activeHighlights: ['LIFELINE', 'RELAY', 'SIREN', 'ESTOP', 'PRODUCTION'],
      changeLogs: [
        {
          id: `log-${Date.now()}-iso1`,
          time: getTimeString(),
          component: 'LIFELINE',
          action: 'FAILSAFE TRIP ENGAGED',
          detail: 'Critical physical anomaly detected. Hardware safety trip asserted',
          color: '#ef4444',
          type: 'ALERT',
        },
        {
          id: `log-${Date.now()}-iso2`,
          time: getTimeString(),
          component: 'RELAY',
          action: 'CIRCUIT DISCONNECTED',
          detail: 'Optocoupler de-energized. Armature contacts mechanically OPEN',
          color: '#ef4444',
          type: 'ALERT',
        },
        {
          id: `log-${Date.now()}-iso3`,
          time: getTimeString(),
          component: 'SIREN',
          action: 'EMERGENCY BEACON ON',
          detail: 'Rotating parabolic warning reflector engaged with high-intensity beacon',
          color: '#ef4444',
          type: 'ALERT',
        },
        {
          id: `log-${Date.now()}-iso4`,
          time: getTimeString(),
          component: 'E-STOP',
          action: 'SAFETY SWITCH TRIPPED',
          detail: 'Red mushroom safety interlock depressed. Hardware power interrupted',
          color: '#ef4444',
          type: 'ALERT',
        },
        {
          id: `log-${Date.now()}-iso5`,
          time: getTimeString(),
          component: 'PRODUCTION CELL',
          action: 'MACHINERY HALTED',
          detail: 'Conveyor belt drive power cut. 6-axis robotic arm frozen instantly',
          color: '#ef4444',
          type: 'ALERT',
        },
        ...s.changeLogs.slice(0, 8),
      ],
      metrics: {
        ...s.metrics,
        relayState: 'OPEN',
        sirenActive: true,
        eStopActive: true,
        productionActive: false,
        activeStateText: 'ISOLATE',
        stateSubtext: 'SAFETY CIRCUIT TRIPPED',
      },
    }));
  },

  resetToNormal: () => {
    if (transitionTimeout1) clearTimeout(transitionTimeout1);
    if (transitionTimeout2) clearTimeout(transitionTimeout2);
    if (transitionTimeout3) clearTimeout(transitionTimeout3);

    set({
      state: 'NORMAL',
      previousState: 'NORMAL',
      activeLabel: 'NORMAL',
      activeSublabel: 'PRODUCTION ACTIVE',
      sentinelOnline: true,
      lifelineOnline: true,
      relayClosed: true,
      sirenActive: false,
      eStopPushed: false,
      productionActive: true,
      espNowAlert: false,
      honeypotActive: false,
      attackerActive: false,
      activeHighlights: [],
      changeLogs: [
        {
          id: `log-${Date.now()}-reset`,
          time: getTimeString(),
          component: 'KAVACH SYSTEM',
          action: 'RESET TO NORMAL',
          detail: 'Safety relay CLOSED. Siren OFF. Production cell running at nominal speed.',
          color: '#10b981',
          type: 'SUCCESS',
        },
      ],
      metrics: {
        threatCount: 0,
        deceivedCount: 0,
        heartbeatRate: 1.0,
        relayState: 'CLOSED',
        sirenActive: false,
        eStopActive: false,
        productionActive: true,
        espNowNodesCount: 4,
        activeStateText: 'NORMAL',
        stateSubtext: 'PRODUCTION ACTIVE',
      },
    });
  },

  setCameraPreset: (preset: CameraViewPreset) => {
    set({ cameraPreset: preset, autoTour: false });
  },

  toggleAutoTour: () => {
    set((s) => ({ autoTour: !s.autoTour }));
  },

  setSimulationSpeed: (speed: number) => {
    set({ simulationSpeed: speed });
  },

  incrementHeartbeat: () => {
    set((s) => ({ heartbeatPulse: s.heartbeatPulse + 1 }));
  },
}));
