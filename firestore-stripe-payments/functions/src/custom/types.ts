export enum PlanType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  PRO = 'pro',
}

export const playerLimits: { [key in PlanType]: number } = {
  [PlanType.FREE]: 5,
  [PlanType.BASIC]: 10,
  [PlanType.PREMIUM]: 30,
  [PlanType.PRO]: 20,
};
