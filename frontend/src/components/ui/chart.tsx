import { ReactNode } from 'react';

export interface RechartsPayload {
  name: string;
  dataKey: string;
  value: number;
  color?: string;
  payload: Record<string, any>;
}

export interface ChartPayloadConfig {
  label?: string | ((value: any, payload: RechartsPayload) => ReactNode);
  format?: (value: any) => string | number;
  color?: string;
  show?: boolean;
  unit?: string;
  suffix?: string;
}

export interface ChartConfig {
  [key: string]: ChartPayloadConfig;
}

export function getPayloadConfigFromPayload(payload: RechartsPayload[], config: ChartConfig): Array<{
  label: string;
  value: string | number;
  color?: string;
}> {
  return payload
    .filter((item) => config[item.dataKey]?.show !== false)
    .map((item) => {
      const itemConfig = config[item.dataKey] || {};
      let label = itemConfig.label;
      if (typeof label === 'function') {
          label = label(item.value, item);
        }
        if (typeof label !== 'string') {
          label = item.name || item.dataKey;
        }
        const value = itemConfig.format ? itemConfig.format(item.value) : item.value;
      return {
        label: `${label}${itemConfig.suffix ?? ''}`,
        value: `${value}${itemConfig.unit ?? ''}`,
        color: itemConfig.color || item.color,
      };
    });
}
