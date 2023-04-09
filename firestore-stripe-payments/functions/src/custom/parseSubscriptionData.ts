const MINIMUM_PRO_PLAYERS = 20;

export interface SubscriptionData {
  metadata?: { maxPlayers?: string };
  quantity?: number;
}

export function parseSubscriptionData(subscription: SubscriptionData) {
  // If maxPlayers is set on the subscription, use that value
  if (subscription?.metadata?.maxPlayers) {
    return parseInt(subscription.metadata.maxPlayers, 10);
  }

  // If the subscription has a valid quantity, use it as the maxPlayers value
  if (subscription?.quantity && subscription.quantity >= MINIMUM_PRO_PLAYERS) {
    return subscription.quantity;
  }

  return undefined;
}
