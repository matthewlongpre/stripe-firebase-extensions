import { logger } from 'firebase-functions';
import Stripe from 'stripe';

export async function hasValidSubscription(
  stripe: Stripe,
  customerId: string,
  subscriptionId: string
) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    const otherSubscriptions = subscriptions.data.filter(
      (subscription) => subscription.id !== subscriptionId
    );

    if (!otherSubscriptions.length) return false;

    // Check if the customer has any other `active` or `trialing` subscriptions
    const hasActiveSubscription = otherSubscriptions.some(({ status }) =>
      ['active', 'trialing'].includes(status)
    );

    if (hasActiveSubscription) {
      logger.log(`User has another valid subscription`);
    }

    return hasActiveSubscription;
  } catch (error) {
    logger.error(
      `Error checking for additional active subscriptions for '${customerId}'`
    );
    return false;
  }
}
