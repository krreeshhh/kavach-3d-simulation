export type SimulationState =
  | 'NORMAL'
  | 'ATTACK'
  | 'DECEIVED'
  | 'SENTINEL_OFFLINE'
  | 'AUTONOMOUS'
  | 'ISOLATE';

export type CameraViewPreset =
  | 'OVERVIEW'
  | 'NETWORK'
  | 'SENTINEL'
  | 'LIFELINE'
  | 'SAFETY'
  | 'ATTACK_DECEPTION'
  | 'ESP_NOW'
  | 'PRODUCTION'
  | 'TOP'
  | 'ISOMETRIC'
  | 'FRONT'
  | 'SIDE';

export interface ComponentChangeLogEntry {
  id: string;
  time: string;
  component: string;
  action: string;
  detail: string;
  color: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
}

export interface SystemMetrics {
  threatCount: number;
  deceivedCount: number;
  heartbeatRate: number; // Hz
  relayState: 'CLOSED' | 'OPEN';
  sirenActive: boolean;
  eStopActive: boolean;
  productionActive: boolean;
  espNowNodesCount: number;
  activeStateText: string;
  stateSubtext: string;
}
