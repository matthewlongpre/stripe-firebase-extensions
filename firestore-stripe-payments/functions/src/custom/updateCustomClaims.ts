import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { getSubscriptionData } from '../getSubscriptionData';
import { Subscription } from '../interfaces';
import * as logs from './../logs';
import { VALID_STATUSES, findValidSubscription } from './findValidSubscription';
import { syncMixpanelPeopleProperties } from './syncMixpanelPeopleProperties';

const CLAIM_KEY = 'stripeRole';

export async function updateCustomClaims(
  uid: string,
  customerId: string,
  subscriptionData: Subscription,
  stripe: Stripe
) {
  const { role } = subscriptionData;

  if (!role) return;

  try {
    // If the subscription that sent this event is valid, use it to apply claims
    if (VALID_STATUSES.includes(subscriptionData.status)) {
      await update(uid, role, subscriptionData);
      return;
    }

    // The subscription that sent this event is invalid
    // Check for other valid subscriptions and attempt to apply claims
    const validSubscription = await findValidSubscription(
      stripe,
      customerId,
      subscriptionData.id
    );

    if (validSubscription) {
      const { subscriptionData } = await getSubscriptionData(
        stripe,
        validSubscription.id
      );
      await update(uid, subscriptionData.role, subscriptionData);
      return;
    }

    // No valid subscription, remove claims from user
    await update(uid, null);
  } catch (error) {
    // User has been deleted, simply return.
    return;
  }
}

async function update(
  uid: string,
  role: string | null,
  subscriptionData?: Subscription
) {
  const { customClaims } = await admin.auth().getUser(uid);

  logs.userCustomClaimSet(uid, CLAIM_KEY, role);

  await admin
    .auth()
    .setCustomUserClaims(uid, { ...customClaims, stripeRole: role });

  syncMixpanelPeopleProperties(uid, role, subscriptionData);
}
