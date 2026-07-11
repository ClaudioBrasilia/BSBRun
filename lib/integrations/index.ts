/**
 * Registro de integrações do BSBRun.
 *
 * Garmin Connect e Google Fit foram avaliados e descartados por ora:
 * - Garmin: programa de desenvolvedor suspenso para novos cadastros e não
 *   aceita uso individual (só empresas/instituições).
 * - Google Fit: API sendo descontinuada pelo Google até o fim de 2026,
 *   sem novos cadastros desde maio de 2024.
 *
 * Para habilitar o Strava:
 *   1. Registre um app em https://www.strava.com/settings/api
 *   2. Preencha STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET no .env
 *   (o fluxo OAuth já está implementado em app/api/integrations/strava/*)
 */

import type { LucideIcon } from 'lucide-react';
import { Activity } from 'lucide-react';
import { isStravaConfigured } from './strava';

export type IntegrationStatus = 'available' | 'coming_soon' | 'requires_subscription';

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
    status: isStravaConfigured() ? 'available' : 'requires_subscription',
    configured: isStravaConfigured(),
  },
];
