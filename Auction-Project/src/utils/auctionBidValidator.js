/**
 * auctionBidValidator.js (Client-side)
 * 
 * Budget-safety constraint validation for the Live Auction Engine.
 * Ensures no team can bid an amount that makes it mathematically impossible
 * to fill its remaining mandatory squad slots at base price.
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

export const getMaxBid = (team, tournamentRules = {}, options = {}) => {
  if (!team) return 0;

  const remainingBudget = getTeamRemainingBudget(team);
  const playersOwned = getTeamPlayersCount(team);

  const minSquadSize = typeof tournamentRules?.minSquadSize === 'number'
    ? tournamentRules.minSquadSize
    : (typeof tournamentRules?.maxPlayersPerTeam === 'number' ? tournamentRules.maxPlayersPerTeam : 15);

  const minReservePerSlot = typeof tournamentRules?.minReservePerSlot === 'number'
    ? tournamentRules.minReservePerSlot
    : (typeof tournamentRules?.playerBasePrice === 'number' ? tournamentRules.playerBasePrice : 100);

  let slotsStillNeededAfterThis = minSquadSize - playersOwned - 1;
  if (slotsStillNeededAfterThis < 0) {
    slotsStillNeededAfterThis = 0;
  }

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

export const isPlayerOverseas = (player) => {
  if (!player) return false;
  return Boolean(
    player.isOverseas ||
    player.isForeign ||
    (player.countryCode && player.countryCode !== '+91')
  );
};

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

  if (playersOwned >= maxSquadSize) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: `Maximum squad size reached (${maxSquadSize} players)`,
    };
  }

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

  if (maxBid < basePrice) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: "Insufficient budget to complete squad",
    };
  }

  if (nextBidAmount < basePrice) {
    return {
      canBid: false,
      maxBid,
      nextBidAmount,
      reason: `Bid amount must be at least the base price of ₹${basePrice.toLocaleString()}`,
    };
  }

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
