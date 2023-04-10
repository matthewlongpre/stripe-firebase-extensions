import { logger } from 'firebase-functions';

export async function hasValidSubscription(stripe, customerId) {
  try {
    // Retrieve all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    // Check if the customer has any other `active` or `trialing` subscriptions
    const hasActiveSubscription = subscriptions.data.some(({ status }) =>
      ['active', 'trialing'].includes(status)
    );

    logger.log(`User has another valid subscription`);

    return hasActiveSubscription;
  } catch (error) {
    logger.error(
      `Error checking for additional active subscriptions for '${customerId}'`
    );
  }
}
