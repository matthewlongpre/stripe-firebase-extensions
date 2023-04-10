import {
  SubscriptionData,
  parseSubscriptionData,
} from './parseSubscriptionData';
import { PlanType, playerLimits } from './types';

interface ParsedStripeRole {
  planType: PlanType;
  maxPlayers: number;
}

const DEFAULT_PLAN = {
  planType: PlanType.FREE,
  maxPlayers: playerLimits[PlanType.FREE],
};

export async function parseStripeRole(
  userId: string,
  role: string | null,
  subscriptionData: SubscriptionData
): Promise<ParsedStripeRole> {
  if (!role) return DEFAULT_PLAN;

  try {
    return parseStripeRoleAsJson(role);
  } catch {
    return parseStripeRoleAsString(userId, role, subscriptionData);
  }
}

function parseStripeRoleAsJson(jsonRole: string): ParsedStripeRole {
  const parsed = JSON.parse(jsonRole) as { [key: string]: unknown };
  parsed.maxPlayers = parseInt(parsed.maxPlayers as string, 10);
  return parsed as unknown as ParsedStripeRole;
}

async function parseStripeRoleAsString(
  userId: string,
  role: string,
  subscriptionDoc
): Promise<ParsedStripeRole> {
  if (role === PlanType.PRO) {
    const maxPlayersFromSubscription = parseSubscriptionData(subscriptionDoc);

    return {
      planType: PlanType.PRO,
      maxPlayers: maxPlayersFromSubscription || playerLimits[PlanType.PRO],
    };
  }

  if (role === PlanType.BASIC) {
    return {
      planType: PlanType.BASIC,
      maxPlayers: playerLimits[PlanType.BASIC],
    };
  }

  if (role === PlanType.PREMIUM) {
    return {
      planType: PlanType.PREMIUM,
      maxPlayers: playerLimits[PlanType.PREMIUM],
    };
  }

  return DEFAULT_PLAN;
}
