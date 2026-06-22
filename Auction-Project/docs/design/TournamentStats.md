# TournamentStats Component Design Spec

**Location**: `src/components/tournament/TournamentStats.jsx`

## Purpose
Display live tournament metrics on the Tournament Hub page: total bids, budget spent, players sold, and current auction status.

## Props
```js
/**
 * Unique identifier of the tournament whose stats are shown.
 */
 tournamentId: string
```

## State
```js
const [stats, setStats] = useState({
  totalBids: 0,
  budgetSpent: 0,
  playersSold: 0,
  status: 'Pending' // 'Live' | 'Paused' | 'Completed'
});
const [loading, setLoading] = useState(false);
```

## Data Fetching
- On mount (`useEffect`) call `fetchStats()`.
- `fetchStats` uses `auctionService.getStats(tournamentId)` (GET `/api/tournaments/:id/stats`).
- Refresh button re‑invokes `fetchStats`.

## UI Layout (textual wireframe)
```
+-----------------------------------------------------------+
|  📊  Tournament Stats                                     |
|-----------------------------------------------------------|
|  Total Bids      :  1 254   (green pill)                  |
|  Budget Spent    :  ₹2 35,000  (blue pill)                |
|  Players Sold    :  18   (orange pill)                    |
|  Auction Status  :  Live / Paused / Completed (red pill) |
|-----------------------------------------------------------|
|  [Refresh ⟳]   [View Details ➔]                           |
+-----------------------------------------------------------+
```

## Styling
- Reuse `MetricCard.jsx` container styles (padding, border, shadow).
- Use existing `Pill.jsx` for colored badges (green, blue, orange, red).
- Buttons use `Button.jsx` with `variant="secondary"` for Refresh and `variant="primary"` for View Details.

## Interactions
- **Refresh**: Calls `fetchStats()` and shows a loading spinner on the button.
- **View Details**: `navigate(`/tournaments/${tournamentId}/stats`);
- Optional real‑time updates via `useSocket` listening to `stats:update` events.

## Accessibility
- All buttons have `aria-label` attributes.
- Color contrast follows the app theme.
- Keyboard navigation supported (tab order).

## Testing (outline)
- Render component with mock stats and verify each pill displays correct values.
- Simulate Refresh click and assert service call.
- Simulate View Details click and assert navigation.

---
*Design created based on PRD §5 (Live Auction State Machine) and Agent.md folder conventions.*
