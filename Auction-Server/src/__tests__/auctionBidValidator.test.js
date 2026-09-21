import {
  getMaxBid,
  canTeamBid,
  getTeamBidStatus,
  calculateAllTeamsEligibility,
} from "../utils/auctionBidValidator.js";

describe("Auction Bid Validator - Unit Tests", () => {
  const defaultRules = {
    minSquadSize: 15,
    maxSquadSize: 18,
    minReservePerSlot: 100,
    maxOverseas: 8,
  };

  describe("getMaxBid", () => {
    test("1. Mid-auction: Correctly reserves budget for remaining mandatory slots", () => {
      // Team with total purse 10,000, spent 2,000 -> remaining 8,000.
      // Already has 5 players. minSquadSize is 15.
      // slotsStillNeededAfterThis = 15 - 5 - 1 = 9
      // reserveNeeded = 9 * 100 = 900
      // maxBid = 8,000 - 900 = 7,100
      const team = {
        purse: 10000,
        spent: 2000,
        playersOwned: 5,
      };

      const maxBid = getMaxBid(team, defaultRules);
      expect(maxBid).toBe(7100);
    });

    test("2. Last-slot-remaining: Team needs only 1 player to hit minSquadSize", () => {
      // Team with 14 players out of 15 minSquadSize.
      // slotsStillNeededAfterThis = 15 - 14 - 1 = 0
      // reserveNeeded = 0
      // Entire remaining budget is biddable on this player!
      const team = {
        remainingBudget: 5000,
        players: 14,
      };

      const maxBid = getMaxBid(team, defaultRules);
      expect(maxBid).toBe(5000);
    });

    test("3. Already-at-minimum: Team at or above minSquadSize can spend full remaining budget", () => {
      // Team has 16 players (minSquadSize is 15)
      // slotsStillNeededAfterThis = max(0, 15 - 16 - 1) = 0
      // maxBid = full remaining budget
      const team = {
        remainingBudget: 3500,
        players: 16,
      };

      const maxBid = getMaxBid(team, defaultRules);
      expect(maxBid).toBe(3500);
    });

    test("4. Would-be-impossible case: Verifies premature squad exhaustion is mathematically unreachable under cap enforcement", () => {
      // Scenario:
      // A team starts with a tight budget: exactly ₹1,500 for a minimum squad of 15 players with minReservePerSlot = ₹100.
      // Total minimum cost to fill 15 slots at base price is 15 * 100 = ₹1,500.
      const initialPurse = 1500;
      const tournamentRules = {
        minSquadSize: 15,
        maxSquadSize: 18,
        minReservePerSlot: 100,
      };

      let currentPurse = initialPurse;
      let playersOwned = 0;

      // Simulate auctioning 15 players sequentially, where team bids the maximum legal bid every time
      for (let i = 1; i <= 15; i++) {
        const teamState = {
          remainingBudget: currentPurse,
          playersOwned,
        };

        const maxLegalBid = getMaxBid(teamState, tournamentRules);

        // Under tight budget, the team should never be allowed to bid more than 100 on any player
        expect(maxLegalBid).toBe(100);

        // Place the bid and purchase the player
        currentPurse -= maxLegalBid;
        playersOwned += 1;

        // Invariant: At every step, remaining budget MUST be >= (minSquadSize - playersOwned) * minReservePerSlot
        const mandatorySlotsLeft = Math.max(0, tournamentRules.minSquadSize - playersOwned);
        const mandatoryReserveNeeded = mandatorySlotsLeft * tournamentRules.minReservePerSlot;
        expect(currentPurse).toBeGreaterThanOrEqual(mandatoryReserveNeeded);
      }

      // After 15 players, exactly all 15 slots are filled, budget exhausted legally
      expect(playersOwned).toBe(15);
      expect(currentPurse).toBe(0);

      // Contrast with uncapped bid:
      // If a team with 1,500 budget bid 200 on the first player without the cap:
      const uncappedBudgetAfterFirst = 1500 - 200; // 1300 left
      const slotsStillNeeded = 14;
      const neededReserve = slotsStillNeeded * 100; // 1400 needed
      expect(uncappedBudgetAfterFirst).toBeLessThan(neededReserve); // Mathematical impossibility!
    });

    test("5. Clamps maxBid to zero when remaining budget is less than required reserve", () => {
      // Degraded state: team has 200 remaining but needs 5 slots (5 * 100 = 500 reserve)
      const team = {
        remainingBudget: 200,
        playersOwned: 9, // minSquadSize 15 -> slotsNeeded = 15 - 9 - 1 = 5 -> reserve = 500
      };

      const maxBid = getMaxBid(team, defaultRules);
      expect(maxBid).toBe(0);
    });

    test("6. Role-based minimum reserve extension", () => {
      // Tournament requires minimum 2 Wicket Keepers
      const roleRules = {
        minSquadSize: 15,
        minReservePerSlot: 100,
        roleRequirements: {
          "Wicket Keeper": 2,
        },
      };

      // Team has remaining budget 1000, 10 players owned, but 0 Wicket Keepers
      // General slots needed after this = 15 - 10 - 1 = 4
      // Role slots needed:
      // Case A: Current player is Batsman -> team still needs 2 WKs.
      // Total effective slots to reserve = max(4, 2) = 4 slots = 400 reserve.
      const teamA = {
        remainingBudget: 1000,
        playersOwned: 10,
        squad: [{ role: "Batsman" }],
      };
      const maxBidA = getMaxBid(teamA, roleRules, { player: { role: "Batsman" } });
      expect(maxBidA).toBe(600); // 1000 - 400

      // Case B: General slots needed = 1 (13 players owned), but still 0 WKs needed = 2
      // If current player is Batsman: needs 2 WKs -> effective slots to reserve = max(1, 2) = 2
      // reserve = 2 * 100 = 200. Max bid = 1000 - 200 = 800.
      const teamB = {
        remainingBudget: 1000,
        playersOwned: 13,
        squad: [],
      };
      const maxBidB = getMaxBid(teamB, roleRules, { player: { role: "Batsman" } });
      expect(maxBidB).toBe(800); // 1000 - 200
    });
  });

  describe("canTeamBid", () => {
    test("Computes nextBidAmount = currentHighestBid + bidIncrement and validates correctly", () => {
      const team = {
        remainingBudget: 1000,
        playersOwned: 5,
      };

      // Current highest bid = 200, increment = 100 -> nextBid = 300
      // maxBid = 1000 - (15 - 5 - 1) * 100 = 1000 - 900 = 100
      // nextBid (300) > maxBid (100) -> should be false
      expect(canTeamBid(team, 200, 100, 100, defaultRules)).toBe(false);

      // Now with higher budget: remaining = 2000 -> maxBid = 2000 - 900 = 1100
      const richTeam = {
        remainingBudget: 2000,
        playersOwned: 5,
      };
      expect(canTeamBid(richTeam, 200, 100, 100, defaultRules)).toBe(true);
    });

    test("Returns false if nextBidAmount < currentPlayerBasePrice", () => {
      const team = {
        remainingBudget: 5000,
        playersOwned: 5,
      };
      // Base price 500, but next bid computed as 100
      expect(canTeamBid(team, 0, 100, 500, defaultRules)).toBe(false);
    });

    test("Returns false if team reached maxSquadSize", () => {
      const team = {
        remainingBudget: 50000,
        playersOwned: 18,
      };
      expect(canTeamBid(team, 100, 100, 100, defaultRules)).toBe(false);
    });

    test("Returns false if overseas quota reached for overseas player", () => {
      const team = {
        remainingBudget: 50000,
        playersOwned: 10,
        overseasCount: 8,
      };
      const foreignPlayer = {
        name: "Foreign Star",
        isOverseas: true,
        basePrice: 100,
      };
      expect(canTeamBid(team, 100, 100, 100, defaultRules, { player: foreignPlayer })).toBe(false);
    });
  });

  describe("getTeamBidStatus (diagnostic reasons)", () => {
    test("Returns 'Insufficient budget to complete squad' when maxBid < basePrice", () => {
      const team = {
        remainingBudget: 950,
        playersOwned: 5, // slots needed = 9 -> reserve needed = 900 -> maxBid = 50
      };
      const status = getTeamBidStatus(team, 0, 100, 100, defaultRules);
      expect(status.canBid).toBe(false);
      expect(status.reason).toBe("Insufficient budget to complete squad");
    });

    test("Returns exact cap reason when next bid exceeds maxBid", () => {
      const team = {
        remainingBudget: 1200,
        playersOwned: 5, // reserve needed = 900 -> maxBid = 300
      };
      const status = getTeamBidStatus(team, 300, 100, 100, defaultRules);
      expect(status.canBid).toBe(false);
      expect(status.reason).toContain("exceeds max allowed cap");
    });
  });

  describe("calculateAllTeamsEligibility", () => {
    test("Computes map of all teams with their respective eligibility and max bids", () => {
      const teams = [
        { _id: "team_1", remainingBudget: 5000, playersOwned: 5 },
        { _id: "team_2", remainingBudget: 950, playersOwned: 5 },
      ];
      const player = { _id: "p1", basePrice: 100 };

      const eligibility = calculateAllTeamsEligibility(teams, 0, 100, player, defaultRules);
      expect(eligibility.team_1.canBid).toBe(true);
      expect(eligibility.team_1.maxBid).toBe(4100);

      expect(eligibility.team_2.canBid).toBe(false);
      expect(eligibility.team_2.reason).toBe("Insufficient budget to complete squad");
    });
  });
});
