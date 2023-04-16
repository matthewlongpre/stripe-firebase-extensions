import {
  parseStripeRole,
  SubscriptionData,
} from '@matthewlongpre/music-bingo-common';
import { logger } from 'firebase-functions';
import startCase from 'lodash.startcase';
import mixpanel from 'mixpanel';
import config from '../config';

export async function syncMixpanelPeopleProperties(
  userId: string,
  role: string | null,
  subscriptionData: SubscriptionData
) {
  const getProSubscriptionData = () => Promise.resolve(subscriptionData);

  try {
    const { planType, maxPlayers } = await parseStripeRole(
      userId,
      role,
      getProSubscriptionData
    );

    const MixpanelService = mixpanel.init(config.mixpanelProjectId);

    MixpanelService.people.set(userId, {
      'Plan Type': startCase(planType),
      'Max Players': maxPlayers,
    });

    logger.log(`✅ Synced user profile to Mixpanel`);
  } catch (error) {
    logger.error(
      `[Error]: Failed to sync Mixpanel properties for user [${userId}]`
    );
  }
}
