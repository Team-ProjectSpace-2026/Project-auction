# Product Requirements Document (PRD)

**Project Title:** CricAuction (Cricket League Auction Management System)
**Document Version:** 4.0 (Comprehensive Design-Locked Specification)
**Date:** June 18, 2026

## 1. System Overview & Branding

CricAuction is an automated, real-time SaaS platform tailored for managing sports league structures, automated public registrations, team configurations, and live interactive auctions.

### Theme & Layout Architecture

- **Organizer Administrative Workspace (Light Theme):** Formulated with high-contrast, structured layout components, card blocks, and explicit data-entry grids. It ensures rapid configuration and complete visibility over historical data metrics.
- **Live Auction Control Panel (Light/Broadcast Hybrid Layout):** Operates on a structured white container canvas backed by a high-visibility real-time telemetry sidebar and state execution triggers. This hybrid approach enables low-latency auction administration directly from the tournament dashboard panel.

## 2. User Authentication & Profile Workflows

### 2.1 Organizer Portal Login Gateway

**UI Structure:** A dual-column layout. The left pane functions as a marketing banner presenting platform features over a stadium graphic backdrop with cricket equipment models. The right pane houses a clean, standalone white input container labeled with header text welcoming users back to their workspace.

**Input Controls & Form Fields:**
- Global Language Selection Dropdown: Upper right layout header bounding configuration selections.
- Email Address Field: Accompanied by a leading mail envelope glyph icon.
- Password Field: Accompanied by a leading padlock glyph icon and an interactive eye visibility toggle element.
- Form Persistence Controls: A localized split row hosting a "Remember Me" checkbox and a "Forgot Password?" anchor link.
- Execution Trigger: A primary deep blue button executing credentials validation.
- Redirection Link: A bottom text anchor guiding non-registered users to the creation portal.

### 2.2 Organizer Registration Workspace

**UI Structure:** Matches the layout of the login screen while modifying input content to establish database structures for new merchants.

**Input Specifications:**
- Full Name Text Input: Configured with a silhouette user glyph icon.
- Email Address Input: Formatted with a localized validation mask.
- Mobile Number Field: Integrates a dropdown country code selection menu and an adjacent text box.
- Password / Confirm Password Parallel Inputs: Feature masking elements to prevent plain-text exposure during input.

**Execution & Navigation Triggers:**
- Primary CTA Button: Highlighted with a high-contrast yellow/gold fill color to differentiate account onboarding from subsequent workspace access actions.
- Redirection Footers: Anchor pathways routing existing users back to the entry gateway.

### 2.3 Profile & Settings Center Workspace

**UI Layout:** Formulates administrative update panels divided into a profile picture staging canvas and an account data form grid.

- **Profile Picture Management:** Features a circular avatar frame containing a camera icon overlay badge. This column lists strict format limit validations (JPG, PNG or GIF. Max size of 2MB.) directly over a secondary "Change Photo" action container.
- **Account Parameters Grid Matrix:**
  - Full Name & Email Address Row: Top horizontally paired form fields tracking identity text data.
  - Phone Number Text Input: Field tracking primary communication lines.
  - Role Display Block: A disabled dropdown text field reflecting the user's platform authorization tier.
  - Organization / Company Input Line: String box to define the parent operational entity.
  - Password Modification Element: Form rows showcasing a masked placeholder paired to a localized "Change Password" inline action button.
- **Save/Cancel Terminal Control Row:**
  - Action Buttons: A generic container text button ("Cancel") positioned alongside a primary blue action trigger ("Save Changes").
  - Informational Disclaimer Banner: A bottom blue alert card containing an informative icon that reads: "This information will be used across the platform and visible to other organizers and users."

## 3. Administrative Operational Hub (Light Theme)

### 3.1 Global Organizer Dashboard

- **Empty State Canvas:** Promotes a clean center-aligned card with a clipboard trophy illustration and a primary `+ Create New Tournament` interaction trigger.
- **Active Telemetry Ribbon:** A row of four metrics summary cards tracking live data across lifecycle states: Total Tournaments (All time), Active Tournaments (Currently running), Upcoming Tournaments (Starting soon), and Completed Tournaments (Finished).
- **Recent Tournaments Workspace Ledger:** A data table mapping system instances with an upper "View All" navigation anchor. Columns match the following structure: Tournament Name (with branding logo) | Status Pill Badge | Auction Date | Teams Count | Action Button (View Details)
- **Permanent Progress Timeline Footer:** A fixed horizontal step layout establishing system usage pathways: 1. Create Tournament ➔ 2. Generate Registration Link ➔ 3. Manage Players ➔ 4. Start Auction

### 3.2 Tournament Creation Engine

**UI Grid Matrix:** Input fields arranged into a two-column layout framework. Required entry markers are designated with red asterisks (*).

**Input Component Parameters:**
- Tournament Name: Unique text lookups box.
- Number of Teams: Numeric limit constraint box.
- Budget Per Team (₹): Field pairing with a static localized currency symbol display.
- Maximum Players Per Team: Integer validation limit input.
- Venue: Text string input to establish physical staging parameters.
- Auction Date & Time: Integrated calendar selector component.

**Alert Panels & Terminal Layout Actions:**
- Informative Alert Block: A blue alert strip with an info glyph reminding users: "Please review the details before creating the tournament. You can edit these details anytime from the tournament overview page."
- Form Action Footers: Balanced inline buttons splitting commands between a white container ("Cancel") and a primary blue trigger button ("Create Tournament").

### 3.3 Tournaments List View Panel

**UI Layout Frame:** Aggregates competing properties into workspace cards.

- **Search & Sorting Mechanics:** Top row houses a text parser reading `Search tournament by name...`, a center status dropdown reading `All Status`, and a right-aligned `+ New Tournament` execution element.
- **Card Specifications:** Each card renders a vertical three-dot overflow context menu and structural rows summarizing parameter specs (Auction Date, Teams, Format), finishing at a clear blue forward arrow icon container (`View Details >`).
- **Pagination Suite Footer:** Tracks list dimension readouts ("Showing X to Y of Z tournaments") mapped to an active step pagination row (Previous | Page Index | Next).

## 4. Tournament Control Center Hub & Lifecycle Management

### 4.1 Hub Workspace Frame & Tab Navigation

**Operational Navigation Switcher:** Groups individual tournament variables into sub-views managed via an upper tab bar row: Overview, Registration Link, Teams, Players, and Live Auction.

**Overview Tab Data Components Layout:**
- Tournament Information Panel: Left-aligned summary block showing the details of active database entities (Tournament Name, Number of Teams, Budget Per Team, Maximum Players Per Team, Venue, Auction Date & Time, Tournament Format, Tournament Status).
- Quick Actions Router Card: Right-aligned quick-navigation menu pointing to View Registration Link, Manage Teams, and Manage Players.
- Summary Telemetry Panel: Compact tracking card recording operational counts (Total Teams, Total Registered Players, Players Sold, Auction Status, and Created On).
- Workspace Action Footer: Displays an informative notification strip combined with an explicit wireframe Edit Tournament button component.

### 4.2 Dynamic Registration Link Hub

**Link Status Module:** Handles access properties for incoming candidate pipelines.

**Component Architecture:**
- Phase Banner Container: A green alert box reflecting live availability states (e.g., Registration Status: Open).
- Registration URL Field Wrapper: Displays an immutable string reflecting the registration pathway, flanked by an explicit "Copy Link" clipboard button and an external "Open Link" redirect tab indicator.
- Registration Settings Summary Rows: Renders structural variables tracing lifecycle gates: Registration Start Date, Registration End Date, Allow Player Registration, Require Player Profile, Maximum Players, and Players Can Edit Profile.
- Instructional Overlay Card: A pale warning container displaying timeline notifications regarding upcoming registration closures.

### 4.3 Public Registration App Interface

**Form Structure:** An asynchronous candidate intake form mapped for external user registration.

**Personal Information Panel Layout:**
- Media Upload Block: Floating box (Upload Photo) detailing file constraints (JPG, PNG up to 2MB).
- Identity Vectors: Text inputs tracking required fields (Full Name, Age, Mobile Number, City) along with a field labeled Email (Optional).

**Cricket Information Segment Layout:**
- Primary Role Grid Matrix: Selected-state block grid capturing performance specializations (Batsman, Bowler, All Rounder, Wicket Keeper).
- Style Options Controls: Horizontally aligned input dropdowns for choosing batting and bowling positions.
- Bowling Type Radio Array: A radio selection matrix listing granular traits (Right Arm Fast, Right Arm Medium, Right Arm Spin, Left Arm Fast, Left Arm Medium, Left Arm Spin, Not Applicable).

**Sidebar Instructional Blocks:** Displays checklist items with validation recommendations, adjacent to a "Need Help?" call center link card. The panel finishes at a primary registration button.

### 4.4 Teams Configuration Panel

**Roster Grid Framework:** Aggregates competing team profiles. Includes contextual filters for parsing text strings (`Search teams...`) and managing presentation sorting steps (`Sort by: Team Name (A-Z)`).

**Team Franchise Card Schema:** Displays circular emblem assets, title labels, and a split parameters footer tracking exact database values side-by-side (Players Purchased counts and Remaining Budget currency). Core pathways terminate at a bottom wireframe button container labeled `View Team`.

### 4.5 Team Detail View & Squad Roster Table

**UI Structure:** Custom workspace dashboard presenting an isolated overview of a franchise's composition. Displays the core brand icon shield, owner identity indicators, active squad volume counters, and an upper "Export Squad" action button.

**Roster Output Table Layout:** Renders real-time transaction rosters row-by-row mapping exact player attributes: Column Index Number (#) | Column Player Name | Column Role (Icon + Pill Badge) | Column Purchase Price

### 4.6 Global Players Directory Workspace

**Roster Ledger Frame:** Houses the primary operational spreadsheet table for managing candidate eligibility states. Includes keyword lines (`Search players...`), selection boxes (`All Roles`), and an explicit shortcut link button: `+ Add Player`.

**Roster Matrix Column Layout:** Processes system database entries row-by-row tracking: Index Number (#) | Player Name | Role Pill Badge | Player Style Compound Attributes | Keeper State Flag (Green Checkmark vs Red Cross) | Action Rows (Pencil Edit Icon + Trash Disposal Icon)

## 5. Live Auction State Machine & Interface Logic

### 5.1 Pre-Start Dashboard View

**Main Control Panel Canvas Layout:** Staged before the live state engine is officially active. It provides a centered activation canvas containing a prominent container button: `Start Auction`. An explicit notice icon warning message is permanently affixed beneath the trigger row: "You can't pause or reset the auction once it has started."

**Side Analytics Splitting Cards:**
- Current Auction Monitoring Block: Features an explicit `Not Started` pill container layout badge. Renders a silhouette profile placeholder stating "No Player Selected: The auction will begin once you start." alongside empty state counters for Base Price, Current Bid, and Highest Bidder.
- Auction Activity Monitor Feed: Staged log container showing an illustrative layout asset labeled: "No activity yet: Auction activity will appear here once the auction begins."

### 5.2 Dynamic Randomizer Selection Modal

**Shuffling Overlay UI Mechanism:** Triggered instantly upon firing the state machine sequence. A modal container card pops over a completely blurred dashboard background matrix.

**Visual Requirements:**
- Header Core Text: Displaying Title strings reading: "Revealing Next Player: Please wait while we reveal the next player..."
- Carousel Animation Track: A horizontal layout depicting mystery profile card silhouettes scrolling behind a center-positioned card containing a query icon (?) and sliding tracking indicators.
- Status Execution Caption: Bottom data lines listing real-time processing messages: "Shuffling players... This will only take a few seconds."
- Security Lock Footers: Affixes a secure blue icon note certifying internal logic integrity: "The next player is selected randomly from the pool."

### 5.3 Player Revealed Control Panel Modal

**Lot Exposure Form Workspace:** Appears once the shuffling engine finishes index selection.

**Component Composition Layout:**
- Left Image Staging Column: Houses the selected candidate's profile illustration within a clean bordered frame container.
- Right Attribute Matrix Rows: Displays identity text labels, role pill badges, and precise icon-supplemented detail parameters tracking: Batting Style, Bowling Style, Nationality, and Base Price.
- Staging Execution Footer Block: High-contrast bordered card showing a large numeric visualization display tracking Starting Bid: [Currency Value] directly over a high-visibility primary CTA button labeled: `Start Bidding`.
- System Validation Subtext: Displays an inline warning message layout card line: "Bidding will begin once you click on Start Bidding."

## 6. Live Bidding Workspace & Resolution Control Room

The real-time live execution view provides administrators with immediate transactional control, increment modifiers, and state resolution actions.

```
+---------------------------------------------------------------------------------------------------------+
| SUMMER LEAGUE 2027                                                            [LIVE AUCTION TABS]        |
+---------------------------------------------------------------------------------------------------------+
| [CURRENT PLAYER STAGING PANEL]      | [REAL-TIME BID METRICS]        | [LATEST 5 BIDS LEDGER SIDER]      |
| +-------------------------------+   | +------------------------------+ | - Franchise Alpha  ₹1,00,000    |
| |                               |   | | Current Bid: ₹1,00,000        | | - Franchise Beta   ₹95,000      |
| |   [PLAYER PORTRAIT IMAGE]     |   | | (Base Price)                  | | - Franchise Alpha   ₹90,000     |
| |                               |   | +------------------------------+ |                                  |
| +-------------------------------+   | | HIGHEST BIDDER:               | +----------------------------------------+
| Name: Candidate Identity            | | [FRANCHISE EMBLEM SHIELD]      | [AUCTION REAL-TIME LOG FEED]            |
| Role: Pill State Badge              | | Franchise Branding Label       | 11:45 AM - [Live Tag] ₹1,00,000          |
| Attributes: Style / Nationality     | +------------------------------+ | 11:44 AM - [Live Tag] ₹95,000            |
+------------------------------------+--------------------------+-----------------------------------------+
                                                                          11:43 AM - [Live Tag] ₹90,000
| [QUICK BID INCREMENT TRIGGERS]      | [CUSTOM BID DIRECT ENTRY FIELD]                                    |
| [ +₹1K ] [ +₹2K ] [ +₹5K ]           | [ Input Text Box Line ]                                            |
| [ +₹10K ] [ +₹20K ] [ +₹50K ]        | >> [ PLACE BID ] <<                                                |
+------------------------------------+--------------------------------------------------------------------+
| [ALL TEAMS SELECTION WRAPPER MATRIX - CHOOSE FRANCHISE SHIELD ICON EMBLEM OBJECTS TO FORCE MANUAL BID]    |
+-------------------------------------------------------------------------------------------------------+
| [ADMIN ACTION ROW FOOTER]   [v MARK SOLD (Green)]   [x MARK UNSOLD (Red)]   [-> NEXT PLAYER (Blue)]      |
+-------------------------------------------------------------------------------------------------------+
```

### 6.1 Active Live Auction Room Panel Layout

- **Current Player Showcase Card Panel:** Left-positioned layout grouping candidate profile media containers with text descriptions detailing the active player's performance attributes and base price floors.
- **Real-Time Bid Telemetry Metrics:** Central card block providing absolute data-binding reads for:
  - Current Bid Display: Bold numeric readout indicating active financial values. Labels beneath transition dynamically to register context (e.g., matching the Base Price text string if no higher entries exist).
  - Highest Bidder Badge Container: Displays large centered layouts housing the leading franchise's emblem shield design and brand text title.
  - Quick Bid Increment Triggers Container: A grid block containing six rapid modification buttons mapped to default pricing step rules: +₹1,000, +₹2,000, +₹5,000, +₹10,000, +₹20,000, and +₹50,000.
  - Custom Bid Entry Field: An inline input block text line enabling manual value input overrides, paired to a subtext reminder mapping the current baseline (Minimum bid increment: ₹1,000), positioned over a primary `Place Bid` shortcut layout trigger.
- **All Teams Proxy Interaction Grid:** A horizontal selection row spanning the lower center field that aggregates all participating franchise emblems. Clicking an individual shield proxy icon instantly forces a manual bid event on behalf of that selected organization.

### 6.2 Monitoring Sidebars & Logs Feed Suite

- **Latest 5 Bids Ledger:** Right-aligned vertical card streaming the five most recent server events. Rows match data fields tracking: Franchise Logo | Team Title Label | Received Bid Value | Server Timestamp (HH:MM AM/PM). The ledger finishes at a "View All Bids" tabular tracking window shortcut button.
- **Auction Activity Flow Timeline:** Positioned under the ledger sidebar, this live timeline tracks transaction actions sequentially using colored dot nodes on a vertical link bar. Each node displays specific metadata tags tracking the exact time, currency amounts, and participating team properties, anchored to a bottom "View All Activity" workflow button.

### 6.3 Administrative Resolution Command Row

A bottom-pinned control row providing administrators with explicit command overrides to manage active lot execution states:

- **Mark Sold (Success Green Button):** Freezes the live bidding stream loop and triggers winning transaction pipeline routines for the highest bidder. Subtext caption layout notes: "Player will be sold to highest bidder".
- **Mark Unsold (Danger Red Button):** Invalidates active lot placement, logs transaction data states, and marks the player entity index as unacquired. Subtext caption layout notes: "Player will go unsold".
- **Next Player (Primary Blue Button):** Advances active pointer indexes sequentially to invoke the next player lot. Subtext caption layout notes: "Reveal and start auction for next player".

### 6.4 Successful Close Transaction Interstitial Overlay

**Sold Resolution Modal:** Appears on clicking Mark Sold. Blurs the active live auction room background and launches a centered confirmation card with a celebratory green checkmark icon.

**Visual Layout Components:**
- Headline Proclamation Text: Boldly displays the confirmation string: "PLAYER SOLD!".
- Lot Profile Block: Renders the player photo portrait stamped with a skewed green graphic label reading "SOLD".
- Acquisition Metadata Readout: Explicitly lists the destination franchise identity (SOLD TO: [Franchise Logo + Team Name]) alongside a bold numeric summary text mapping the terminal cost line (FINAL BID: [Currency Value]).

**State Machine Overrides & Automated Time Loop:**
- Manual Trigger Override: A primary blue CTA button labeled `Reveal Next Player ➔` to advance data sets manually.
- Automated Action Countdown Loop: A localized footer message mapping a low-latency system timer clock instance (e.g., "Auto closing in 4 sec") that automatically triggers database saves and advances the active lot pointer to the next lottery item upon timeout.

## 7. Non-Functional Requirements & Real-Time Logic Rules

### 7.1 Performance & Sync Latency

- Bid Telemetry Broadcasts: Bid events from administrative triggers or team client entries must stream across the WebSocket cluster to synchronize all connected screens within < 200ms.
- UI Update Transitions: The active workspace panels must process real-time status updates smoothly without requiring browser window reloads. Bidding values should flash visually on update to emphasize new inputs.

### 7.2 Concurrency Handling & Transaction Protection

- Atomic Bid Validation Blocks: In the event of near-simultaneous bid submissions, the backend database engine must prioritize inputs by true server arrival sequence. Slower conflicting entries must be rejected automatically, triggering a real-time validation error broadcast that refreshes client viewports with the correct floor price.
- Financial Limit Checks: Financial fields must perform automated checks to block invalid transactions, ensuring that incoming bids do not fall below established step parameters or exceed a franchise's remaining budget.
- Cross-Tenant Isolation Routing: Role selection gates and token definitions must secure the workspace, preventing non-authorized accounts from accessing or spoofing administrative command parameters.
