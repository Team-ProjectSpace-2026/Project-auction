/**
 * auctionBidValidator.js
 * 
 * Budget-safety constraint validation for the Live Auction Engine.
 * Ensures no team can bid an amount that makes it mathematically impossible
 * to fill its remaining mandatory squad slots at base price.
 */

/**
 * Calculates a team's current remaining budget from various supported team object representations.
 * @param {Object} team 
 * @returns {number}
 */
export const getTeamRemainingBudget = (team) => {
  if (!team) return 0;
  if (typeof team.purse === 'number' && typeof team.spent === 'number') {
    return Math.max(0, team.purse - team.spent);
  }
  if (typeof team.remainingBudget === 'number') {
    return Math.max(0, team.remainingBudget);
  }
  if (typeof team.totalBudget === 'number' && typeof team.spent === 'number') {
    return Math.max(0, team.totalBudget - team.spent);
  }
  if (typeof team.budget === 'number') {
    return Math.max(0, team.budget);
  }
  return 0;
};

/**
 * Calculates the number of players currently owned by a team.
 * @param {Object} team 
 * @returns {number}
 */
export const getTeamPlayersCount = (team) => {
  if (!team) return 0;
  if (typeof team.playersOwned === 'number') {
    return team.playersOwned;
  }
  if (Array.isArray(team.squad)) {
    return team.squad.length;
  }
  if (Array.isArray(team.players)) {
    return team.players.length;
  }
  if (typeof team.players === 'number') {
    return team.players;
  }
  return 0;
};

/**
 * Calculates the number of overseas players currently owned by a team.
 * @param {Object} team 
 * @returns {number}
 */
export const getTeamOverseasCount = (team) => {
  if (!team) return 0;
  if (typeof team.overseasCount === 'number') {
    return team.overseasCount;
  }
  if (Array.isArray(team.squad)) {
    return team.squad.filter(p => p && (p.isOverseas || p.isForeign || (p.countryCode && p.countryCode !== '+91'))).length;
  }
  if (Array.isArray(team.players)) {
    return team.players.filter(p => p && typeof p === 'object' && (p.isOverseas || p.isForeign || (p.countryCode && p.countryCode !== '+91'))).length;
  }
  return 0;
};

/**
 * Returns the numeric maximum legal bid ceiling for a team on the CURRENT player.
 * 
 * Formula:
 * maxBid = remainingBudget - (slotsStillNeededAfterThis * minReservePerSlot)
 * 
 * Where:
 * - remainingBudget = team.purse - team.spent (or team.remainingBudget)
 * - slotsStillNeededAfterThis = Math.max(0, minSquadSize - team.playersOwned - 1)
 * - minReservePerSlot = lowest base-price tier (configurable per tournament, default 100)
 * - Clamp final maxBid to a minimum of 0
 * 
 * @param {Object} team - Team object (purse, spent, playersOwned / squad / remainingBudget)
 * @param {Object} tournamentRules - Rules config (minSquadSize, minReservePerSlot, roleRequirements, etc.)
 * @param {Object} [options] - Optional context (e.g. player / playerRole)
 * @returns {number} Max legal bid ceiling
 */
export const getMaxBid = (team, tournamentRules = {}, options = {}) => {
  if (!team) return 0;

  const remainingBudget = getTeamRemainingBudget(team);
  const playersOwned = getTeamPlayersCount(team);

  const minSquadSize = typeof tournamentRules?.minSquadSize === 'number'
    ? tournamentRules.minSquadSize
    : 15;

  const minReservePerSlot = typeof tournamentRules?.minReservePerSlot === 'number'
    ? tournamentRules.minReservePerSlot
    : (typeof tournamentRules?.playerBasePrice === 'number' ? tournamentRules.playerBasePrice : 100);

  // The -1 excludes the player currently up for auction, since this bid covers them
  let slotsStillNeededAfterThis = minSquadSize - playersOwned - 1;
  if (slotsStillNeededAfterThis < 0) {
    slotsStillNeededAfterThis = 0;
  }

  // Edge case: Role-based minimums (e.g. min 2 wicketkeepers, min 3 bowlers)
  // If role requirements are specified in tournamentRules, extend minReservePerSlot
  // to ensure budget isn't exhausted before mandatory role slots are filled.
  let roleSlotsNeededAfterThis = 0;
  if (tournamentRules?.roleRequirements && typeof tournamentRules.roleRequirements === 'object') {
    const roleReqs = tournamentRules.roleRequirements instanceof Map
      ? Object.fromEntries(tournamentRules.roleRequirements)
      : tournamentRules.roleRequirements;

    const squad = Array.isArray(team.squad)
      ? team.squad
      : (Array.isArray(team.players) && typeof team.players[0] === 'object' ? team.players : []);

    const roleCounts = {};
    for (const p of squad) {
      if (p && p.role) {
        roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
      }
    }

    const currentRole = options?.player?.role || options?.playerRole || null;

    for (const [role, minCount] of Object.entries(roleReqs)) {
      if (typeof minCount === 'number' && minCount > 0) {
        const currentCount = roleCounts[role] || 0;
        let neededForRole = Math.max(0, minCount - currentCount);
        if (currentRole && currentRole === role && neededForRole > 0) {
          neededForRole -= 1;
        }
        roleSlotsNeededAfterThis += neededForRole;
      }
    }
  }

  const effectiveSlotsToReserve = Math.max(slotsStillNeededAfterThis, roleSlotsNeededAfterThis);
  const reserveNeeded = effectiveSlotsToReserve * minReservePerSlot;

  const maxBid = remainingBudget - reserveNeeded;
  return Math.max(0, maxBid);
};

/**
 * Checks whether a player is tagged as overseas / foreign.
 * @param {Object} player 
 * @returns {boolean}
 */
export const isPlayerOverseas = (player) => {
  if (!player) return false;
  return Boolean(
    player.isOverseas ||
    player.isForeign ||
    (player.countryCode && player.countryCode !== '+91')
  );
};

/**
 * Detailed diagnostic check on whether a team can bid.
 * Returns an object with canBid (boolean), maxBid (number), nextBidAmount (number), and reason (string | null).
 * 
 * @param {Object} team
 * @param {number} currentHighestBid
 * @param {number} bidIncrement
 * @param {number} currentPlayerBasePrice
 * @param {Object} tournamentRules
 * @param {Object} [options]
 * @returns {{ canBid: boolean, maxBid: number, nextBidAmount: number, reason: string | null }}
 */
export const getTeamBidStatus = (
  team,
  currentHighestBid = 0,
  bidIncrement = 0,
  currentPlayerBasePrice = 0,
  tournamentRules = {},
  options = {}
) => {
  if (!team) {
    return { canBid: false, maxBid: 0, nextBidAmount: 0, reason: "Invalid team" };
  }

  const basePrice = Math.max(0, Number(currentPlayerBasePrice) || 0);
  const currBid = Math.max(0, Number(currentHighestBid) || 0);
  const inc = Math.max(0, Number(bidIncrement) || 0);

  const nextBidAmount = currBid + inc;

  const maxSquadSize = typeof tournamentRules?.maxSquadSize === 'number'
    ? tournamentRules.maxSquadSize
    : (typeof tournamentRules?.maxPlayersPerTeam === 'number' ? tournamentRules.maxPlayersPerTeam : 18);

  const maxOverseas = typeof tournamentRules?.maxOverseas === 'number'
    ? tournamentRules.maxOverseas
    : 8;

  const playersOwned = getTeamPlayersCount(team);
  const maxBid = getMaxBid(team, tournamentRules, options);

  // 1. Max squad size check
  if (playersOwned >= maxSquadSize) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: `Maximum squad size reached (${maxSquadSize} players)`,
    };
  }

  // 2. Overseas player limit check
  const player = options?.player || null;
  const isOverseas = isPlayerOverseas(player) || Boolean(options?.isOverseas);
  if (isOverseas) {
    const overseasCount = getTeamOverseasCount(team);
    if (overseasCount >= maxOverseas) {
      return {
        canBid: false,
        maxBid,
        nextBidAmount,
        reason: `Overseas player quota full (${maxOverseas}/${maxOverseas})`,
      };
    }
  }

  // 3. Team cannot even afford player's base price while preserving squad reserve
  if (maxBid < basePrice) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: "Insufficient budget to complete squad",
    };
  }

  // 4. Next bid amount is below base price
  if (nextBidAmount < basePrice) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: `Bid amount must be at least the base price of ₹${basePrice.toLocaleString()}`,
    };
  }

  // 5. Next bid amount exceeds maxBid ceiling
  if (nextBidAmount > maxBid) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: `Bid of ₹${nextBidAmount.toLocaleString()} exceeds max allowed cap of ₹${maxBid.toLocaleString()} to guarantee squad completion`,
    };
  }

  return {
    canBid: true,
    maxBid,
    nextBidAmount,
    reason: null,
  };
};

/**
 * Determines whether a team can legally place the next bid on the current player.
 * 
 * Computes nextBidAmount = currentHighestBid + bidIncrement
 * Returns false if:
 * - nextBidAmount < currentPlayerBasePrice
 * - nextBidAmount > getMaxBid(team, tournamentRules)
 * - team.squad.length >= tournamentRules.maxSquadSize
 * - player is overseas and overseas cap reached
 * Returns true otherwise.
 * 
 * @param {Object} team
 * @param {number} currentHighestBid
 * @param {number} bidIncrement
 * @param {number} currentPlayerBasePrice
 * @param {Object} tournamentRules
 * @param {Object} [options]
 * @returns {boolean}
 */
export const canTeamBid = (
  team,
  currentHighestBid,
  bidIncrement,
  currentPlayerBasePrice,
  tournamentRules,
  options = {}
) => {
  const status = getTeamBidStatus(
    team,
    currentHighestBid,
    bidIncrement,
    currentPlayerBasePrice,
    tournamentRules,
    options
  );
  return status.canBid;
};

/**
 * Computes the live bid eligibility map for all teams in a tournament.
 * 
 * @param {Array<Object>} teams - List of teams
 * @param {number} currentHighestBid - Current highest bid amount
 * @param {number} bidIncrement - Increment for next bid
 * @param {Object} currentPlayer - Player currently on auction
 * @param {Object} tournamentRules - Tournament rules
 * @returns {Record<string, { canBid: boolean, maxBid: number, nextBidAmount: number, reason: string | null }>}
 */
export const calculateAllTeamsEligibility = (
  teams = [],
  currentHighestBid = 0,
  bidIncrement = 0,
  currentPlayer = null,
  tournamentRules = {}
) => {
  const result = {};
  if (!Array.isArray(teams)) return result;

  const basePrice = currentPlayer?.basePrice || tournamentRules?.playerBasePrice || 0;
  const effectiveIncrement = bidIncrement > 0
    ? bidIncrement
    : (currentHighestBid === 0 ? basePrice : (basePrice > 0 ? basePrice : 1000));

  for (const team of teams) {
    if (!team) continue;
    const teamId = team._id ? String(team._id) : String(team.id || "");
    if (!teamId) continue;

    result[teamId] = getTeamBidStatus(
      team,
      currentHighestBid,
      effectiveIncrement,
      basePrice,
      tournamentRules,
      { player: currentPlayer }
    );
  }

  return result;
};
