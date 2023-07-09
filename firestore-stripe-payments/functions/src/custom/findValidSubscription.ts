import { logger } from 'firebase-functions';
import Stripe from 'stripe';

export const VALID_STATUSES = ['active', 'trialing'];

export async function findValidSubscription(
  stripe: Stripe,
  customerId: string,
  excludedSubscriptionId: string
): Promise<Stripe.Subscription | undefined> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    const otherSubscriptions = subscriptions.data
      .filter((subscription) => subscription.id !== excludedSubscriptionId)
      .sort((a, b) => b.created - a.created);

    if (!otherSubscriptions.length) return undefined;

    const validSubscription = otherSubscriptions.find(({ status }) =>
      VALID_STATUSES.includes(status)
    );

    if (validSubscription) {
      logger.log(`User has another valid subscription`);
    }

    return validSubscription;
  } catch (error) {
    logger.error(
      `Error checking for additional active subscriptions for '${customerId}'`
    );
    return undefined;
  }
}
