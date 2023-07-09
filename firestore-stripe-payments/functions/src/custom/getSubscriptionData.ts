import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import config from '../config';
import { Subscription } from '../interfaces';

interface SubscriptionResult {
  /** Response from Stripe */
  subscription: Stripe.Response<Stripe.Subscription>;
  /** Formatted to write to Firebase */
  subscriptionData: Subscription;
}

export async function getSubscriptionData(
  stripe: Stripe,
  subscriptionId: string
): Promise<SubscriptionResult> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'items.data.price.product'],
  });

  const price: Stripe.Price = subscription.items.data[0].price;
  const prices = [];

  for (const item of subscription.items.data) {
    prices.push(
      admin
        .firestore()
        .collection(config.productsCollectionPath)
        .doc((item.price.product as Stripe.Product).id)
        .collection('prices')
        .doc(item.price.id)
    );
  }

  const product: Stripe.Product = price.product as Stripe.Product;
  const role = product.metadata.firebaseRole ?? null;

  const subscriptionData = {
    metadata: subscription.metadata,
    role,
    status: subscription.status,
    stripeLink: `https://dashboard.stripe.com${
      subscription.livemode ? '' : '/test'
    }/subscriptions/${subscription.id}`,
    product: admin
      .firestore()
      .collection(config.productsCollectionPath)
      .doc(product.id),
    price: admin
      .firestore()
      .collection(config.productsCollectionPath)
      .doc(product.id)
      .collection('prices')
      .doc(price.id),
    prices,
    quantity: subscription.items.data[0].quantity ?? null,
    items: subscription.items.data,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? admin.firestore.Timestamp.fromMillis(subscription.cancel_at * 1000)
      : null,
    canceled_at: subscription.canceled_at
      ? admin.firestore.Timestamp.fromMillis(subscription.canceled_at * 1000)
      : null,
    current_period_start: admin.firestore.Timestamp.fromMillis(
      subscription.current_period_start * 1000
    ),
    current_period_end: admin.firestore.Timestamp.fromMillis(
      subscription.current_period_end * 1000
    ),
    created: admin.firestore.Timestamp.fromMillis(subscription.created * 1000),
    ended_at: subscription.ended_at
      ? admin.firestore.Timestamp.fromMillis(subscription.ended_at * 1000)
      : null,
    trial_start: subscription.trial_start
      ? admin.firestore.Timestamp.fromMillis(subscription.trial_start * 1000)
      : null,
    trial_end: subscription.trial_end
      ? admin.firestore.Timestamp.fromMillis(subscription.trial_end * 1000)
      : null,
  };

  return {
    subscription,
    subscriptionData,
  };
}
