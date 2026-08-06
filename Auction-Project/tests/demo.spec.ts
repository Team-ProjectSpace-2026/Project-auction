import { test, expect } from "@playwright/test";

const TEST_USER = {
  name: "Playwright Demo User",
  email: `demo_${Date.now()}@test.com`,
  mobile: String(7000000000 + Math.floor(Math.random() * 3000000000)),
  password: "Test@12345",
};

const TOURNAMENT = {
  name: `Demo Tournament ${Date.now()}`,
  teams: "4",
  budget: "500000",
  maxPlayers: "15",
  venue: "Mumbai Cricket Ground",
  basePrice: "50000",
};

const TEAM_2 = {
  name: "Chennai Super Kings",
  owner: "Suresh Raina",
};

const PLAYER_1 = {
  name: "Virat Kohli",
  role: "Batsman",
  battingStyle: "Right Hand",
  age: "34",
  mobile: "9876543210",
};

const PLAYER_2 = {
  name: "Jasprit Bumrah",
  role: "Bowler",
  bowlingStyle: "Right Arm Fast",
  age: "29",
  mobile: "9123456789",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setupCaptchaInterceptor(page: import("@playwright/test").Page) {
  let captchaText = "";
  page.route("**/api/auth/captcha/new", async (route) => {
    const response = await route.fetch();
    try {
      const body = await response.json();
      captchaText = body.text || "";
    } catch {
      // Rate-limited or non-JSON response — leave captchaText empty
    }
    await route.fulfill({ response });
  });
  return { getText: () => captchaText };
}

async function fillCaptcha(page: import("@playwright/test").Page, captcha: { getText: () => string }) {
  const captchaInput = page.locator('input[placeholder="Enter text"]');
  await captchaInput.waitFor({ state: "visible", timeout: 10_000 });
  await captchaInput.fill(captcha.getText());
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.getByText("Verified")).toBeVisible({ timeout: 5_000 });
}

// Helper: extract tournament ID from the current URL
function getTournamentIdFromUrl(url: string): string {
  const match = url.match(/tournament-details\/([a-f0-9]+)/i);
  return match ? match[1] : "";
}

test.describe("CricAuction Product Walkthrough", () => {
  test("full product demo", async ({ page }) => {
    test.setTimeout(300_000);

    // ─── 1. Landing Page ──────────────────────────────────────────
    await page.goto("/");
    await expect(page.locator("body")).toContainText("CricAuction");
    await expect(page.locator("body")).toContainText("Cricket League Auction Platform");

    // ─── 2. Navigate to Login ─────────────────────────────────────
    await page.getByRole("button", { name: "Login" }).first().click();
    await page.waitForURL("**/login");
    await expect(page.locator("body")).toContainText("Welcome Back!");

    // ─── 3. Navigate to Register ──────────────────────────────────
    const captcha = setupCaptchaInterceptor(page);
    await page.getByRole("link", { name: "Register Here" }).click();
    await page.waitForURL("**/register");
    await expect(page.locator("body")).toContainText("Create Your");

    // ─── 4. Register New Account ──────────────────────────────────
    await page.locator("#fullName").fill(TEST_USER.name);
    await page.locator("#email").fill(TEST_USER.email);
    await page.locator("#mobile").fill(TEST_USER.mobile);
    await page.locator("#password").fill(TEST_USER.password);
    await page.locator("#confirmPassword").fill(TEST_USER.password);

    await fillCaptcha(page, captcha);

    await page.getByRole("button", { name: "Create Account" }).click();

    const alreadyExists = page.getByText("already exists");
    if (await alreadyExists.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole("link", { name: "Login Here" }).click();
      await page.waitForURL("**/login");
      const loginCaptcha = setupCaptchaInterceptor(page);
      await page.locator("#email").fill(TEST_USER.email);
      await page.locator("#password").fill(TEST_USER.password);
      await fillCaptcha(page, loginCaptcha);
      await page.getByRole("button", { name: "Login" }).click();
    }

    await page.waitForURL("**/dashboard", { timeout: 15_000 });

    // ─── 5. Dashboard ─────────────────────────────────────────────
    await expect(page.locator("body")).toContainText("Total Tournaments");
    await expect(page.locator("body")).toContainText("Active Tournaments");

    // ─── 6. Create Tournament ─────────────────────────────────────
    await page.goto("/create-tournament");
    await page.locator('input[name="tournamentName"]').fill(TOURNAMENT.name);
    await page.locator('input[name="numTeams"]').fill(TOURNAMENT.teams);
    await page.locator('input[name="budgetPerTeam"]').fill(TOURNAMENT.budget);
    await page.locator('input[name="maxPlayersPerTeam"]').fill(TOURNAMENT.maxPlayers);
    await page.locator('input[name="venue"]').fill(TOURNAMENT.venue);
    await page.locator('input[name="playerBasePrice"]').fill(TOURNAMENT.basePrice);

    // Set auction date to tomorrow so isBeforeDate resolves quickly
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 16);
    await page.locator('input[name="auctionDateTime"]').fill(dateStr);

    await page.getByRole("button", { name: "Create Tournament" }).click();
    await page.waitForTimeout(2000);

    const continueBtn = page.getByRole("button", { name: "Continue" });
    if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueBtn.click();
    }

    // ─── 7. Tournament List ───────────────────────────────────────
    await page.goto("/tournaments");
    await expect(page.locator("body")).toContainText("Tournaments");
    await expect(page.locator("body")).toContainText(TOURNAMENT.name);

    // ─── 8. Tournament Details ────────────────────────────────────
    const detailsBtn = page.getByRole("button", { name: "Details →" }).first();
    await detailsBtn.click();
    await page.waitForTimeout(2000);

    // Assert all 5 tabs are visible
    await expect(page.locator("body")).toContainText("Overview");
    await expect(page.locator("body")).toContainText("Registration Link");
    await expect(page.locator("body")).toContainText("Teams");
    await expect(page.locator("body")).toContainText("Players");
    await expect(page.locator("body")).toContainText("Live Auction");

    // Extract tournament ID from URL for API calls
    const tournamentId = getTournamentIdFromUrl(page.url());
    expect(tournamentId).toBeTruthy();

    // ─── 9. Overview Tab ──────────────────────────────────────────
    await page.getByRole("button", { name: "Overview", exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toContainText("Tournament Name");
    await expect(page.locator("body")).toContainText(TOURNAMENT.name);
    await expect(page.locator("body")).toContainText("Budget Per Team");
    await expect(page.locator("body")).toContainText(TOURNAMENT.venue);

    // ─── 10. Registration Tab ─────────────────────────────────────
    await page.getByRole("button", { name: "Registration Link" }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toContainText("Registration URL");
    await expect(page.locator("body")).toContainText("Copy Link");

    // Verify registration URL contains the tournament ID
    const regUrlInput = page.locator('input[readonly]');
    await expect(regUrlInput).toContainValue(tournamentId);

    // Test Copy Link button
    await page.getByRole("button", { name: "Copy Link" }).click();
    await expect(page.getByText("Copied!")).toBeVisible({ timeout: 3000 });

    // Set registration deadline
    const deadlineInput = page.locator('input[type="datetime-local"]');
    if (await deadlineInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 3);
      const deadlineStr = deadlineDate.toISOString().slice(0, 16);
      await deadlineInput.fill(deadlineStr);
      await page.getByRole("button", { name: "Save Deadline" }).click();
      await expect(page.getByText("Deadline saved successfully!")).toBeVisible({ timeout: 5000 });
    }

    // ─── 11. Teams Tab & Add 2 Teams ─────────────────────────────
    await page.getByRole("button", { name: "Teams", exact: true }).click();
    await page.waitForTimeout(1000);

    // Add first team
    await page.getByRole("button", { name: "+ Add Team" }).click();
    await expect(page.getByText("Add New Team")).toBeVisible();
    await page.locator('input[name="teamName"]').fill("Mumbai Super Kings");
    await page.locator('input[name="ownerName"]').fill("Rajesh Kumar");
    await page.locator('input[name="maxPlayers"]').fill("18");
    await page.getByRole("button", { name: "Add Team", exact: true }).click();
    await page.waitForTimeout(2000);

    // Add second team
    await page.getByRole("button", { name: "+ Add Team" }).click();
    await expect(page.getByText("Add New Team")).toBeVisible();
    await page.locator('input[name="teamName"]').fill(TEAM_2.name);
    await page.locator('input[name="ownerName"]').fill(TEAM_2.owner);
    await page.locator('input[name="maxPlayers"]').fill("18");
    await page.getByRole("button", { name: "Add Team", exact: true }).click();
    await page.waitForTimeout(2000);

    // Verify both teams appear
    await expect(page.locator("body")).toContainText("Mumbai Super Kings");
    await expect(page.locator("body")).toContainText(TEAM_2.name);

    // ─── 12. Add Players via API ──────────────────────────────────
    // Use REST API to add players (UI only has public registration link)
    await page.evaluate(async ({ tId, p1, p2 }) => {
      const addPlayer = async (player: Record<string, string>) => {
        await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...player,
            tournamentId: tId,
            basePrice: 50000,
          }),
        });
      };
      await addPlayer(p1);
      await addPlayer(p2);
    }, { tId: tournamentId, p1: PLAYER_1, p2: PLAYER_2 });

    // ─── 13. Players Tab ──────────────────────────────────────────
    await page.getByRole("button", { name: "Players", exact: true }).click();
    await page.waitForTimeout(3000);

    // Verify players appear in the table
    await expect(page.locator("body")).toContainText(PLAYER_1.name);
    await expect(page.locator("body")).toContainText(PLAYER_2.name);

    // Test search filter
    const searchInput = page.locator('input[placeholder*="Search players"]');
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill(PLAYER_1.name);
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toContainText(PLAYER_1.name);
      await searchInput.fill("");
    }

    // Test role filter
    const roleSelect = page.locator('select');
    if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleSelect.selectOption("Batsman");
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toContainText(PLAYER_1.name);
      await roleSelect.selectOption("All Roles");
    }

    // ─── 14. Update Tournament Date to Past (for auction) ──────────
    await page.evaluate(async (tId) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await fetch(`/api/tournaments/${tId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date: yesterday.toISOString() }),
      });
    }, tournamentId);

    // Reload to pick up the updated tournament data
    await page.reload();
    await page.waitForTimeout(3000);

    // ─── 15. Live Auction Tab ──────────────────────────────────────
    await page.getByRole("button", { name: "Live Auction", exact: true }).click();
    await page.waitForTimeout(3000);

    // Verify auction tab loaded
    await expect(page.locator("body")).toContainText("Live Auction");

    // Start Auction — opens PlayerRevealModal
    const startAuctionBtn = page.getByRole("button", { name: /Start Auction/i });
    if (await startAuctionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startAuctionBtn.click();
      await page.waitForTimeout(1000);

      // ─── PlayerRevealModal — wait for card shuffle to finish ────
      const revealBtn = page.locator("button.reveal-btn");
      await revealBtn.waitFor({ state: "visible", timeout: 15_000 });

      // Wait until button is enabled (phase === "selected")
      await expect(revealBtn).toBeEnabled({ timeout: 12_000 });
      await revealBtn.click();

      // ─── PlayerDetailsModal — "PLAYER REVEALED!" ───────────────
      await expect(page.getByText("PLAYER REVEALED!")).toBeVisible({ timeout: 10_000 });

      // Click START BIDDING → navigates to /live-auction
      const startBiddingBtn = page.locator("button.details-bid__btn");
      await startBiddingBtn.waitFor({ state: "visible", timeout: 8_000 });
      await startBiddingBtn.click();

      // ─── Auction Room ──────────────────────────────────────────
      await page.waitForURL("**/live-auction**", { timeout: 10_000 });
      await page.waitForTimeout(3000);

      // Verify auction room loaded
      await expect(page.locator("body")).toContainText("Team Budgets");

      // Select first team for bidding by clicking on its card
      const teamCards = page.locator("text=Mumbai Super Kings").first();
      await teamCards.click();
      await page.waitForTimeout(800);

      // Place a bid using RAISE BID
      const raiseBidBtn = page.locator("button").filter({ hasText: "RAISE BID" });
      if (await raiseBidBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await raiseBidBtn.click();
        await page.waitForTimeout(1000);

        // Verify bid was placed
        await expect(page.locator("body")).toContainText("Current Bid");

        // Mark player as SOLD
        const soldBtn = page.locator("button.auction-action-card").filter({ hasText: "SOLD" });
        if (await soldBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
          await soldBtn.click();
          await page.waitForTimeout(2000);

          // ─── AuctionResultModal ─────────────────────────────────
          await expect(page.locator("body")).toContainText("SOLD").first();

          // Click "Reveal Next Player" to auction the second player
          const nextPlayerBtn = page.locator("button.result-btn.primary-btn");
          if (await nextPlayerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await nextPlayerBtn.click();
            await page.waitForTimeout(1000);

            // Second player reveal
            const revealBtn2 = page.locator("button.reveal-btn");
            if (await revealBtn2.isVisible({ timeout: 15_000 }).catch(() => false)) {
              await expect(revealBtn2).toBeEnabled({ timeout: 12_000 });
              await revealBtn2.click();

              // Second player details
              await expect(page.getByText("PLAYER REVEALED!")).toBeVisible({ timeout: 10_000 });
              const startBiddingBtn2 = page.locator("button.details-bid__btn");
              await startBiddingBtn2.waitFor({ state: "visible", timeout: 8_000 });
              await startBiddingBtn2.click();

              // Back in auction room with second player
              await page.waitForURL("**/live-auction**", { timeout: 10_000 });
              await page.waitForTimeout(3000);

              // Select second team
              const team2Card = page.locator("text=Chennai Super Kings").first();
              await team2Card.click();
              await page.waitForTimeout(800);

              // Raise bid for second player
              const raiseBidBtn2 = page.locator("button").filter({ hasText: "RAISE BID" });
              if (await raiseBidBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
                await raiseBidBtn2.click();
                await page.waitForTimeout(1000);
              }

              // Mark second player as SOLD
              const soldBtn2 = page.locator("button.auction-action-card").filter({ hasText: "SOLD" });
              if (await soldBtn2.isEnabled({ timeout: 3000 }).catch(() => false)) {
                await soldBtn2.click();
                await page.waitForTimeout(2000);
              }

              // Close auction result — Return to Auction
              const returnBtn = page.locator("button.result-btn.secondary-btn");
              if (await returnBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                await returnBtn.click();
                await page.waitForTimeout(2000);
              }
            }
          }
        }
      }
    }

    // ─── 16. Settings ─────────────────────────────────────────────
    await page.goto("/settings");
    await expect(page.locator("body")).toContainText("Profile Settings");
    await expect(page.locator("body")).toContainText("Save Changes");

    // ─── 17. Logout ───────────────────────────────────────────────
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page.getByText("Are you sure you want to logout?")).toBeVisible();
    await page.getByRole("button", { name: "Yes, Logout" }).click();
    await page.waitForURL("**/login", { timeout: 10_000 });
    await expect(page.locator("body")).toContainText("Welcome Back!");
  });
});
