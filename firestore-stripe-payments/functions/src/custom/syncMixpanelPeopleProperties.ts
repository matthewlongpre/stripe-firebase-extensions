import { logger } from 'firebase-functions';
import startCase from 'lodash.startcase';
import mixpanel from 'mixpanel';
import config from '../config';
import { parseStripeRole } from './parseStripeRole';
import { SubscriptionData } from './parseSubscriptionData';

export async function syncMixpanelPeopleProperties(
  userId: string,
  role: string | null,
  subscriptionData: SubscriptionData
) {
  try {
    const { planType, maxPlayers } = await parseStripeRole(
      userId,
      role,
      subscriptionData
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
