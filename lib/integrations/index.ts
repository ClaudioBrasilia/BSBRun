/**
 * Registro de integrações do BSBRun.
 *
 * Estrutura pronta para plugar provedores externos (Strava, Garmin, etc.).
 * Cada provedor será implementado como um módulo com fluxo OAuth + sincronização
 * de atividades. Por enquanto ficam marcados como "em breve".
 *
 * Para habilitar o Strava, por exemplo:
 *   1. Registre um app em https://www.strava.com/settings/api
 *   2. Preencha STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET no .env
 *   3. Implemente o fluxo OAuth em app/api/integrations/strava/*
 */

import type { LucideIcon } from 'lucide-react';
import { Activity, Watch, HeartPulse } from 'lucide-react';
import { isStravaConfigured } from './strava';

export type IntegrationStatus = 'available' | 'coming_soon';

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: IntegrationStatus;
  /** Indica se as credenciais necessárias estão configuradas no ambiente. */
  configured: boolean;
}

export const integrations: IntegrationProvider[] = [
  {
    id: 'strava',
    name: 'Strava',
    description: 'O atleta conecta a própria conta e as corridas são importadas automaticamente.',
    icon: Activity,
    status: isStravaConfigured() ? 'available' : 'coming_soon',
    configured: isStravaConfigured(),
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    description: 'Sincronize dados de treino de relógios e dispositivos Garmin.',
    icon: Watch,
    status: 'coming_soon',
    configured: false,
  },
  {
    id: 'google-fit',
    name: 'Google Fit',
    description: 'Importe atividades e dados de saúde do Google Fit.',
    icon: HeartPulse,
    status: 'coming_soon',
    configured: false,
  },
];
