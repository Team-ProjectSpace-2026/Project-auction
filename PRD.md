# Product Requirements Document (PRD)

## Document Control
* **Project Title:** CricAuction (Cricket League Auction Management System)
* **Document Version:** 2.0 (Design-Aligned)
* **Date:** June 12, 2026
* **Figma Target Node Reference:** [Figma Design Link](#)

---

## 1. System Overview & Branding

### 1.1 Platform Purpose
CricAuction is a highly specialized Software-as-a-Service (SaaS) platform built for cricket league administrators and team owners. The system streamlines cricket tournament management, processes player registration payloads, orchestrates real-time low-latency live bidding events, and visualizes live squad compilation matrices.

### 1.2 Design Identity & Split Theme Scheme
To optimize user focus and system ergonomics, CricAuction utilizes an intentional split UI theme strategy:

* **Administrative & Configuration Interfaces (Light Theme):** Admin panels, setup wizards, profile configuration areas, and basic tabular registries utilize an intuitive, clean, crisp Light Theme. This minimizes cognitive fatigue during heavy data entry workflows.
* **High-Stakes Live Execution Interfaces (Dark Theme):** The Live Auction Room, real-time bidding dashboards, "Sold" state overlay animations, and final transaction breakdown displays transition completely to a dark-saturated, premium, tactical Dark Theme. This visual layout is specifically styled to emulate professional sports television broadcasting networks (e.g., ESPN, Sky Sports) to maximize engagement and clarity under high-concurrency pressure.

---

## 2. User Authentication & Core Entry Flows

### 2.1 Organizer Registration Form
* **UI Structure:** A balanced dual-column layout configuration.
    * **Left Panel:** Dedicated to high-fidelity platform capability marketing, containing dynamic benefit propositions and system feature highlights.
    * **Right Panel:** Houses a standalone, elevated white card container holding the "Create Organizer Account" form.
* **Input Fields & Validation Constraints:**
    1.  **Full Name:** Text input field containing an inline leading user profile icon/glyph. *Constraint:* Required; alphabet characters only; maximum 70 characters.
    2.  **Email Address:** Text entry field with a standard email verification mask regex pattern matching (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`).
    3.  **Mobile Number:** Numeric string input field with a dedicated international region prefix/placeholder flag dropdown component. *Constraint:* Validated against regional length rules (e.g., 10 digits for India).
    4.  **Password:** Masked string field toggled via an interactive trailing inline "eye" icon visibility component. *Constraint:* Minimum 8 characters, including 1 uppercase letter, 1 number, and 1 special character.
    5.  **Confirm Password:** Masked string field identical to the Password field. *Constraint:* Strict string matching with the input password before enabling form submission.
* **CTA Element:** A primary, prominent full-width action button labeled **"Create Account"**. Beneath this container sits an anchor redirection link labeled *"Already have an account? Login Here"*.

### 2.2 Portal Login Gateway
* **UI Structure:** Standardized login interface fronted by a prominent, distinct role-selection switcher array before allowing gateway authentication.
* **Interactive Elements:**
    * **Role Selection Matrix:** Explicit toggle radio switch buttons differentiating between an **Organizer** entry stream and a **Team Owner** entry stream.
    * **Credentials Entry:** Email Address text field and Password masked field.
* **System Routing Rule:** The authentication handler must natively parse the active selection state of the role toggle. Upon credential verification, token routing must direct users strictly to their respective workspaces (**Organizer Dashboard** vs. **Team Owner Dashboard**) to guarantee complete separation of administrative privileges and prevent interface mixing.

---

## 3. Administrative Workflows (Light Theme)

### 3.1 Tournament Creation Engine
* **UI Layout:** Centered, structured multi-field form layout built using a clear key-value pairing alignment matrix.
* **Form Field Specifications:**

| Field Label | Component Type | Constraints & System Rules |
| :--- | :--- | :--- |
| **Tournament Name** | Text Input String | Must be globally unique across active entities. |
| **Auction Date** | HTML5 Calendar Picker | Disallows past dates relative to the execution timestamp. |
| **Number of Teams** | Numeric Integer Controller | Positive integer only. Range boundary: $2 \le N \le 20$. |
| **Budget per Team** | Financial Decimal Input | Formatted with Indian Rupee (₹) localization symbol. Max: ₹1,000,000,000. |
| **Min Players per Team**| Integer Input | Minimum valid roster constraint. Must be $\le$ Max Players. |
| **Max Players per Team**| Integer Input | Hard ceiling boundary for squad completion calculations. |
| **Tournament Logo** | File Upload Control | Multi-part image payload. Restricted to `.png` or `.jpeg` formats; max size 5MB. |

### 3.2 Organizer Operational Control Dashboard
* **KPI Metrics Strip:** A top-level responsive strip containing four lightweight data display cards pulling asynchronous, non-blocking counts from the datastore:
    1.  **Total Players:** Counter of all database-entered player profiles.
    2.  **Approved Players:** Count of verified, auction-eligible player records.
    3.  **Teams:** Total count of onboarded franchise entities.
    4.  **Auction Status:** A dynamic text state badge displaying localized system statuses (e.g., `[ Ready ]`, `[ Live ]`, `[ Paused ]`, `[ Concluded ]`) mapping to distinct state-color tokens.
* **Data Content Splits:**
    * **Recent Registrations Ledger:** Chronological data list rendering player full name initials as rounded avatar icons, basic registration metadata timestamp strings, and a baseline hyperlink redirection footer labeled **"View All Players"**.
    * **Financial Budget Overview:** Visual snapshot widget comparing the global total budget allocated against the cumulative remaining balance across all participating teams.

### 3.3 Dynamic Tournament Registration Link Generation
* **UI Layout:** Informational panel generated and presented immediately after successful tournament initialization.
* **Component Framework Details:**
    * **Active Info Header Block:** Context-setting banner containing key tournament variables: *Tournament Dates, Total Teams, Max Players Per Team, and Base Auction Budget*.
    * **Active Share Core:** Read-only input field housing a secured public domain URI string formatted as: `https://cricauction.com/register/[TournamentID]`. This component includes a trailing primary interactive execution button labeled **"Copy Link"**, which saves the text string to the client clipboard device.
    * **Instant Access Channels:** Inline iconography links mapped directly to social deep-linking API hooks for rapid forwarding: WhatsApp API, WhatsApp Groups, and Telegram channels.
    * **System Kill Switch:** A prominent, destructive red button labeled **"Disable Link"**. Clicking this instantly flips a Boolean flag in the database, invalidating the dynamic token, closing public access, and dropping any subsequent registration HTTP requests with an error response.
* **Linear System Stepper:** A visual workflow progress indicator row illustrating the system logic linearly to the administrator:
    $$	ext{1. Share Link} \longrightarrow 	ext{2. Player Registration} \longrightarrow 	ext{3. Review Applications} \longrightarrow 	ext{4. Approve Players} \longrightarrow 	ext{5. Ready for Auction}$$

### 3.4 Team Management Workspace
* **Roster Deck View:** A responsive grid layout mapping individual registered team blocks as distinct information cards.
* **Card Element Schemas:**
    * High-resolution circular placeholder slot showcasing unique custom franchise logos.
    * Text string parameters: **Owner Name**, **Assigned Budget Capacity Tracker**, and an active **Headcount Index Fraction Indicator** (formatted explicitly as `Players: X / Y`).
    * **Modifier Routing Trigger:** An inline contextual action link button labeled **"Edit Team"**, allowing modifications to team variables.

---

## 4. Team Owner Workspace

### 4.1 Hub Dashboard View (Light Theme)
* **UI Frame:** High-level dashboard interface for authenticated Team Owners to monitor team health, spending velocity, and pending requirements before or during the auction event.
* **Key Components:**
    * **Summary Header Cards:** Three analytical widgets rendering real-time metrics:
        1.  **Budget Left:** Numerical currency text bound to an inline horizontal colored progress bar asset representing total consumption depth. The bar shifts color as spending approaches maximum capacity (Green $	o$ Amber $	o$ Red).
        2.  **Players Bought:** Integer count tracking successfully won lots against the maximum team roster cap.
        3.  **Auction Status:** A flashing status marker containing a real-time pulse animation signaling `● LIVE` when the event loop is active.
    * **Primary Gateway Interaction:** A large, prominent call-to-action button labeled **"Join Auction Room"**, engineered to transition the user experience into the dark-theme layout while executing low-latency WebSocket initialization handshakes.
    * **Recent Purchases Ledger:** A clean data table tracking recent acquisitions made exclusively by the local client's franchise:

| Photo | Player Name | Position Type Badge | Purchase Price | Time Elapsed |
| :---: | :--- | :---: | :--- | :---: |
| `[Avatar]` | Suresh Raina | `WK - Batter` | ₹5,50,00,000 | 2 mins ago |
| `[Avatar]` | Jasprit Bumrah | `Bowler` | ₹12,00,00,000 | 14 mins ago |

---

## 5. Live Auction Room (Dark Theme Broadcast Interface)

The real-time live execution workspace completely overrides the standard interface configuration, dropping light layouts for an immersive, highly tactical dark broadcast console optimized for real-time visual clarity during extreme-concurrency event handling.

### 5.1 Profile Showcasing & Core State Block
* **Active View Profile Structure:** Left/Center stage focal area presenting a high-contrast background mask displaying the active player's high-resolution portrait photograph. Directly adjacent to the image are contextual demographic labels (*Age, Country of Origin*) and physical/technical trait metrics (*Batting Style, Bowling Variant*).
* **Active Marketplace Metric States:** Highly prominent, split side-by-side indicator layout block designed for immediate scanning:
    * **Base Price Panel:** Static structural minimum asset value field displaying the initial opening cost string of the active lot.
    * **Current Bid Panel:** A dynamic, mutable currency field that auto-flashes and updates its values via real-time WebSocket payload events without UI redraw latency.
    * **Highest Bidder Badge:** A centrally placed, stylized badge component displaying the leading team's identity name string and structural icon placeholder, marking who currently controls the lot contract.

### 5.2 Interactive Bidding Interface
* **Multi-Tier Preset Raise Controls:** To facilitate rapid, speed-of-light bidding interaction without manual typing errors, the interface provides five discrete incremental interaction buttons. These buttons calculate absolute bid values inline based on pre-defined system bidding rules:
    * Button: `+ ₹1,000` $\longrightarrow$ *Subtext dynamically renders calculated target: (e.g., ₹11,000)*
    * Button: `+ ₹2,000` $\longrightarrow$ *Subtext dynamically renders calculated target*
    * Button: `+ ₹5,000` $\longrightarrow$ *Subtext dynamically renders calculated target*
    * Button: `+ ₹10,000` $\longrightarrow$ *Subtext dynamically renders calculated target*
    * Button: `+ ₹20,000` $\longrightarrow$ *Subtext dynamically renders calculated target*
* **Custom Bid Option:** A manual entry text wrapper field with an absolute input validator constraint checking that inputs exceed the `Current Bid + Minimum Allowable Step`.
* **Execution Interaction Trigger:** A prominent, primary, high-visibility action call-to-action button labeled **"RAISE BID"**. On click, this dispatches atomic transaction payloads directly to the WebSocket server layer.

### 5.3 Live Sidebar Monitors
* **Real-Time Team Budgets Registry:** A clean, continuously updated matrix listing all participating teams in the tournament alongside their precise remaining financial reserves and current roster fractions (formatted as `Taken Players: X / 15`).
* **Live Bidding Feed Log:** A terminal-style stream pipeline rendering every successful message block received from the auction server. Each log item displays an immutable server execution timestamp, team identity string, event action marker (e.g., *RAISED BID*), and transaction currency value.

### 5.4 Host Control Panel Row (Organizer View Specification Only)
Visible exclusively to the authenticated League Organizer at the bottom of the live auction interface to control the underlying state machine:
* **[ START AUCTION ]**: Triggers the global countdown timer initialization and flags the player lot as open for public bidding over WebSockets.
* **[ SOLD ]**: Halts the incoming WebSocket bidding loop, freezes active values, and triggers winning transaction ledger routine pipelines to bind the player to the highest bidder's roster.
* **[ UNSOLD ]**: Invalidates the active lot placement, logs an unsold state index flag against the player record, and advances the room state to prompt the next asset choice.
* **[ NEXT PLAYER ]**: Advances the active pointer index value sequentially to fetch the next player profile in the registry queue.
* **Player Direct Lookup Input:** A numeric text entry field labeled `Enter Player No.` paired to an explicit manual overwrite execution trigger button labeled **"SHOW PLAYER"**, enabling non-sequential lot overrides.

### 5.5 State Transition Overlays
* **Sold Banner Interstitial Modal:** A full-screen background-blurring promotional modal container that pops over the active workspace instantly upon a positive lot closure event (`[ SOLD ]`).
* **Component Metrics Rendered:**
    * Large, high-impact typography headline banner string: **"SOLD"**.
    * Winning franchise team logo badge asset centered alongside the player name.
    * Finalized Sold Price record value text string.
    * The updated destination team's post-transaction financial metric state (*Remaining Budget*).
    * **Primary Interaction Button:** A right-aligned action element labeled **"NEXT PLAYER ➔"** to step the admin forward into the next live loop.

---

## 6. Comprehensive Final Analytics Suite

### 6.1 Final Squad Matrix Dashboard View
* **Global Layout Workspace:** A deep data frame dashboard displaying rich tabular data visualizations and compiled post-event transaction records.
* **All Teams Carousel Row Selector:** Located at the top of the workspace, this horizontal grid component details high-level team summary cards (*Franchise Logo, Owner Name, Final Headcount Fractions, Cumulative Expenditures*). Clicking a card dynamically focuses the entire parent analytical dashboard data frame on that specific team's dataset.

### 6.2 Target Roster Output Table Layout
A highly structured data grid tracking team player acquisition components row by row:

| # | Player Identity Details | Role Type Designation | Bought Price | Bought At Location Reference |
| :---: | :--- | :--- | :--- | :--- |
| **01** | `[Avatar]` Virat Kohli | `[ Batsman ]` | ₹15,00,00,000 | Player No. 18 |
| **02** | `[Avatar]` KL Rahul | `[ WK - Batsman ]` | ₹9,50,00,000 | Player No. 04 |
| **03** | `[Avatar]` Hardik Pandya | `[ All Rounder ]` | ₹11,00,00,000 | Player No. 33 |
| **04** | `[Avatar]` Rashid Khan | `[ Bowler ]` | ₹8,00,00,000 | Player No. 12 |

### 6.3 Aggregated Insights & Charts Panels (Right-Side Content Columns)
* **Squad Composition Radial Graph:** An interactive SVG donut/radial chart component illustrating player distribution density across roster role categories (*Batter, Bowler, All-Rounder, Wicketkeeper*).
* **Role-Wise Breakdown Metric Blocks:** Individual data summary rows explicitly tracking exact integer counts per type category to validate roster rules (e.g., `Batters: 5`, `Bowlers: 6`, `All-Rounders: 3`, `WK: 1`).
* **Financial Summary Ledger Card:** An analytical financial breakdown widget displaying:
    * **Total Budget** (Base allocation ceiling)
    * **Total Spent** (Sum of all winning bids)
    * **Remaining Budget** (Leftover unspent reserves)
    * **Average Spent Per Player:** Evaluated dynamically using the system formula:
    
    $$	ext{Average Spent Per Player} = rac{	ext{Total Spent}}{	ext{Players Bought}}$$

* **Top Buys Leaderboard:** A visually distinct, ranked podium component parsing, sorting, and displaying the three highest financial player investments made by the focused team franchise.

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance & Latency
* **Bid Broadcast Distribution:** Every valid incoming bid transaction payload dispatched from an interactive client room must execute, process, and propagate to all active WebSocket connections globally within **< 200ms**. This ensures complete parity and absolute structural fairness during high-velocity bidding wars.
* **UI Frame Rates:** Complex state transitions and live countdown timer updates must render at a consistent **60fps** across consumer browsers, preventing layout stuttering during rapid updates.

### 7.2 Concurrency & Scalability
* **High-Volume Real-Time Handshaking:** The backend infrastructure layer must safely support simultaneous multi-device API pooling and maintain active concurrent WebSocket links without memory allocation dropouts or transaction deadlocks during intense last-second countdown sequences.

### 7.3 Security & Data Integrity
* **Request Sanitization & Verification:** The API gateway and WebSocket connection controller must run strict atomic server-side authorization checks on all inbound payload variables. 
* **Validation Rules:** The system must reject and discard any bidding events where a Team Owner attempts to spoof a transaction, execute a bid beneath the allowable calculated threshold, or submit a financial allocation value that exceeds their team's real-time remaining wallet balance.
