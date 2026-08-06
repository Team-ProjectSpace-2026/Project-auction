// Subscription & Pay-Per-Auction Pricing Configuration

export const VIP_EMAILS = ['mscreation005@gmail.com'];

export const AUCTION_PRICING_PLANS = [
  {
    planNumber: 1,
    name: "Plan 1",
    maxTeams: 3,
    price: 0,
    isFree: true,
    effectivePerTeam: 0,
    description: "Great for quick friendly mini-tournaments.",
  },
  {
    planNumber: 2,
    name: "Plan 2",
    maxTeams: 4,
    price: 20,
    isFree: false,
    effectivePerTeam: 5,
    description: "Ideal for 4-team leagues.",
  },
  {
    planNumber: 3,
    name: "Plan 3",
    maxTeams: 6,
    price: 349,
    isFree: false,
    effectivePerTeam: 58,
    description: "Popular choice for club competitions.",
  },
  {
    planNumber: 4,
    name: "Plan 4",
    maxTeams: 8,
    price: 449,
    isFree: false,
    effectivePerTeam: 56,
    description: "Best for standard 8-team franchise leagues.",
  },
  {
    planNumber: 5,
    name: "Plan 5",
    maxTeams: 12,
    price: 599,
    isFree: false,
    effectivePerTeam: 50,
    description: "Designed for mid-scale tournaments.",
  },
  {
    planNumber: 6,
    name: "Plan 6",
    maxTeams: 16,
    price: 749,
    isFree: false,
    effectivePerTeam: 47,
    description: "Perfect for large corporate or district leagues.",
  },
  {
    planNumber: 7,
    name: "Plan 7",
    maxTeams: 20,
    price: 899,
    isFree: false,
    effectivePerTeam: 45,
    description: "Maximum scale for major grand auctions.",
  },
  {
    planNumber: 8,
    name: "Plan 8",
    maxTeams: 30,
    price: 1199,
    isFree: false,
    effectivePerTeam: 40,
    description: "Mega scale for grand tournaments up to 30 teams.",
  },
];

/**
 * Returns the matching pricing plan for a given team count and user email.
 * @param {number|string} teamCount - Number of teams in the tournament
 * @param {string} [userEmail] - Email of the currently logged-in user
 */
export const getPlanForTeamCount = (teamCount, userEmail = '') => {
  const num = parseInt(teamCount, 10);
  const normalizedEmail = (userEmail || '').trim().toLowerCase();

  const isVipUser = VIP_EMAILS.some((email) => email.toLowerCase() === normalizedEmail);

  if (isNaN(num) || num <= 0) {
    return {
      plan: null,
      isVip: isVipUser,
      requiresPayment: false,
      message: "Enter team count to view pricing",
    };
  }

  // Find matching tier
  const plan = AUCTION_PRICING_PLANS.find((p) => num <= p.maxTeams);

  if (isVipUser) {
    return {
      plan: plan || AUCTION_PRICING_PLANS[AUCTION_PRICING_PLANS.length - 1],
      isVip: true,
      requiresPayment: false,
      price: 0,
      badgeText: "👑 VIP Admin Pass — Free Access Granted",
      description: "Developer/Admin test account bypass active.",
    };
  }

  if (!plan) {
    return {
      plan: null,
      isVip: false,
      requiresPayment: true,
      exceedsLimit: true,
      maxAllowed: 30,
      message: "Exceeds maximum limit of 30 teams. Please contact support for custom plans.",
    };
  }

  return {
    plan,
    isVip: false,
    requiresPayment: !plan.isFree,
    price: plan.price,
    badgeText: plan.isFree
      ? "Plan 1 Selected: Free (Up to 3 Teams)"
      : `${plan.name} Selected: ₹${plan.price} per auction (~₹${plan.effectivePerTeam}/team)`,
    description: plan.description,
  };
};
