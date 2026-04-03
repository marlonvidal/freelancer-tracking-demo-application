---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/architecture.md
outputGenerated: true
validationStatus: complete
epicCount: 7
storyCount: 19
frCoveragePercentage: 100
nfrCoveragePercentage: 100
workflowStatus: ready-for-development
---

# FreelanceFlow - Earnings Dashboard - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the FreelanceFlow Earnings Dashboard feature, decomposing the 73 requirements from the PRD and Architecture into implementable stories organized by user value and technical dependency.

---

## Requirements Inventory

### Functional Requirements (50 total)

**FR1-FR3: Dashboard Navigation & Access**
- FR1: Users can access the Earnings Dashboard from a dedicated page/tab in main navigation
- FR2: The dashboard is accessible via the /earnings route
- FR3: Users can navigate away and return without losing filter state

**FR4-FR10: Data Visualization & Charts**
- FR4: Users can view earnings by Customer in a chart (pie or bar)
- FR5: Users can view earnings by Project in a chart (pie or bar)
- FR6: Users can view earnings by Tag in a chart (pie or bar)
- FR7: Switching chart views preserves date range and billable filter
- FR8: Charts display interactive tooltips with exact values and percentages on hover
- FR9: Chart legends allow toggling data series visibility
- FR10: Charts automatically resize to fit the viewport

**FR11-FR14: Date Range Filtering**
- FR11: Users can select custom date ranges using a date picker
- FR12: Users can select preset ranges (Last 30 days, Quarter, Year, All time)
- FR13: Selected date range applies to all three charts
- FR14: Date range persists when navigating away/back to dashboard

**FR15-FR20: Billable vs Non-Billable Filtering**
- FR15: Users can toggle to show only billable work
- FR16: Users can toggle to show only non-billable work
- FR17: Users can toggle to show all work
- FR18: Billable filter applies to all charts
- FR19: Billable filter persists across sessions
- FR20: Dashboard displays separate metrics for billable/non-billable when filtering

**FR21-FR27: Summary Metrics & Calculations**
- FR21: Dashboard displays total revenue for selected date range
- FR22: Dashboard displays billable revenue for selected date range
- FR23: Dashboard displays non-billable revenue for selected date range
- FR24: Dashboard displays average hourly rate (billable work)
- FR25: Dashboard displays task count (total and billable)
- FR26: All calculations match app's existing revenue formula (100% accuracy)
- FR27: Calculations update immediately when filters change

**FR28-FR32: Internationalization & Localization**
- FR28: All labels, buttons, help text translated to user's language (English/Portuguese)
- FR29: Chart titles and legends translated
- FR30: Date formats respect language preference
- FR31: Currency display respects user's existing FreelanceFlow settings
- FR32: Tooltips available in user's selected language

**FR33-FR38: Accessibility & Keyboard Navigation**
- FR33: All interactive elements are keyboard accessible (Tab, Enter/Space)
- FR34: Charts include ARIA labels for screen readers
- FR35: Focus indicators clearly visible
- FR36: Color not the only data distinction (patterns/labels also used)
- FR37: All text meets WCAG 2.1 Level AA contrast (4.5:1 minimum)
- FR38: Help text/tooltips explain complex features

**FR39-FR42: State Persistence**
- FR39: Selected chart view (Customer/Project/Tag) persists across navigation
- FR40: Date range persists across sessions (localStorage)
- FR41: Billable filter setting persists across sessions
- FR42: Chart state resets when user clears app data or manually resets

**FR43-FR45: Performance & Data Handling**
- FR43: Dashboard loads/renders all charts within 2 seconds (up to 5000 tasks)
- FR44: Filter changes apply within 500ms
- FR45: Charts remain interactive during rendering (no blocking)

**FR46-FR50: Error Handling & Edge Cases**
- FR46: Empty state message if user has no tasks
- FR47: "No data for this period" message if no tasks in selected range
- FR48: "No billable work" message if filtered to billable-only with no results
- FR49: Clear error message if calculation fails, with recovery steps
- FR50: Dashboard remains functional even with edge case data (zero revenue, single client, etc.)

---

### Non-Functional Requirements (13 total)

**Performance (NFR-P1 to NFR-P5)**
- NFR-P1: Dashboard loads/renders all charts within 2 seconds (5,000 tasks max)
- NFR-P2: Filter interactions (date range, billable toggle, chart switching) respond within 500ms
- NFR-P3: Charts display without blocking user interaction
- NFR-P4: Earnings calculations complete before chart rendering (no loading state)
- NFR-P5: Navigation to/from dashboard completes in < 1 second

**Accessibility (NFR-A1 to NFR-A7)**
- NFR-A1: Charts include ARIA labels describing data series for screen readers
- NFR-A2: All interactive elements keyboard navigable via Tab key
- NFR-A3: All text meets WCAG 2.1 Level AA contrast (4.5:1 normal, 3:1 large)
- NFR-A4: Focus indicators always visible and distinguishable
- NFR-A5: Data conveyed via text/patterns in addition to color
- NFR-A6: Help text/tooltips explain complex features for cognitive accessibility
- NFR-A7: All interactions completable with keyboard alone

---

### Additional Requirements (Architecture & Technical)

- Integrate with existing AppState (tasks, clients, columns) — no new backend
- Use React Context + useReducer pattern (existing architecture)
- Persist filter state to localStorage (key: earnings-dashboard-state)
- Use existing LanguageContext for i18n (English/Portuguese)
- Leverage recharts library (^2.15.4 — already in stack)
- Follow shadcn/ui component patterns for consistency
- Responsive design supporting 320px+ viewports
- No external API calls required (all client-side computation)
- New route: /earnings → EarningsDashboard component
- Support dark mode (existing isDarkMode state)
- Calculations: total revenue, billable revenue, non-billable revenue, avg hourly rate

---

### UX Design Requirements

_No UX Design document provided. Visual design follows existing FreelanceFlow design system (shadcn/ui, Tailwind CSS, dark mode support)._

---

### FR Coverage Map

| Epic | Stories | FRs Covered | Purpose |
|------|---------|------------|---------|
| Epic 1: Dashboard Infrastructure | 1.1, 1.2, 1.3 | FR1-FR3, FR39-FR42 | Route setup, navigation integration, state persistence |
| Epic 2: Earnings Calculations Engine | 2.1, 2.2 | FR21-FR27, NFR-P4 | Revenue logic, metric calculations, accuracy |
| Epic 3: Chart Visualizations | 3.1, 3.2, 3.3, 3.4 | FR4-FR10, FR43-FR45, NFR-P1, NFR-P3 | Customer/Project/Tag charts, interactivity, responsiveness |
| Epic 4: Filter & Control UI | 4.1, 4.2, 4.3 | FR11-FR20, FR40-FR41, NFR-P2 | Date picker, presets, billable toggle, filter persistence |
| Epic 5: Metrics & Summary Display | 5.1 | FR21-FR25, FR46-FR50 | Summary cards, edge case handling, empty states |
| Epic 6: Internationalization | 6.1 | FR28-FR32 | Translations, date formats, currency display |
| Epic 7: Accessibility | 7.1 | FR33-FR38, NFR-A1-NFR-A7 | ARIA labels, keyboard nav, contrast, focus indicators |

---

## Epic List

1. **Epic 1: Dashboard Infrastructure** — Foundation for routing, navigation, and state persistence
2. **Epic 2: Earnings Calculations Engine** — Core revenue calculation logic and metrics
3. **Epic 3: Chart Visualizations** — Interactive charts for Customer, Project, and Tag breakdowns
4. **Epic 4: Filter & Control UI** — Date range picker, presets, and billable toggle
5. **Epic 5: Metrics & Summary Display** — Summary cards and empty state handling
6. **Epic 6: Internationalization** — Multi-language support (English/Portuguese)
7. **Epic 7: Accessibility** — WCAG 2.1 AA compliance and keyboard navigation

---

## Epic 1: Dashboard Infrastructure

**Epic Goal:** Establish the foundational routing, navigation integration, and state persistence for the Earnings Dashboard so users can access and interact with the feature.

**Dependencies:** None (foundational)  
**Success Metrics:** Route loads, navigation visible, filter state persists across sessions

---

### Story 1.1: Set up /earnings route and EarningsDashboard component

As a **developer**,
I want **a new /earnings route with the EarningsDashboard component**,
So that **users can access the dashboard via URL and main navigation**.

**Acceptance Criteria:**

**Given** the FreelanceFlow app is running
**When** I navigate to `/earnings`
**Then** the EarningsDashboard component loads successfully
**And** the page title reflects "Earnings Dashboard"

**Given** the user is on the dashboard
**When** I click the back button
**Then** I return to the previous page without losing any data

**Given** the app has multiple routes
**When** I access `/earnings`
**Then** the route loads within < 1 second (NFR-P5)

---

### Story 1.2: Integrate Earnings Dashboard into main navigation

As a **user**,
I want **an "Earnings" link in the main navigation**,
So that **I can easily access the dashboard from any page**.

**Acceptance Criteria:**

**Given** I am on any page in FreelanceFlow
**When** I look at the main navigation
**Then** I see an "Earnings" link or tab (FR1)

**Given** I click the "Earnings" link
**When** the page loads
**Then** I am on the `/earnings` route and the dashboard is displayed

**Given** the dashboard link is active
**When** I view the navigation
**Then** the link is visually highlighted to indicate the current page

---

### Story 1.3: Implement earnings dashboard state persistence

As a **user**,
I want **my filter selections to persist when I leave and return to the dashboard**,
So that **I don't lose my analysis context between sessions**.

**Acceptance Criteria:**

**Given** I am on the Earnings Dashboard
**When** I set a date range (e.g., Last 30 days) and a billable filter
**Then** my selections are saved to localStorage (key: earnings-dashboard-state)

**Given** I navigate away from the dashboard
**When** I return to the dashboard via the `/earnings` route
**Then** my previous date range and filter settings are restored (FR40, FR41)

**Given** I close the browser entirely
**When** I return to FreelanceFlow and navigate to the dashboard
**Then** my filter state persists (FR3, FR14, FR40, FR41)

**Given** I manually clear my app data
**When** I reload the dashboard
**Then** the dashboard shows default state (no filters) (FR42)

---

## Epic 2: Earnings Calculations Engine

**Epic Goal:** Build the core revenue calculation logic that accurately computes all earnings metrics (total, billable, non-billable, average rate) and powers the dashboard visualizations.

**Dependencies:** Epic 1 (requires dashboard component)  
**Success Metrics:** 100% accuracy against app's revenue formula, sub-500ms calculation time

---

### Story 2.1: Implement earnings calculation utilities

As a **developer**,
I want **utility functions to calculate earnings by customer, project, and tag**,
So that **the dashboard has accurate revenue data for visualizations**.

**Acceptance Criteria:**

**Given** I have a list of tasks with time entries and client rates
**When** I call `calculateRevenueByCustomer(tasks, dateRange)`
**Then** I receive an array of {customerId, customerName, totalRevenue, taskCount}

**Given** tasks with varying billable statuses
**When** I filter by billable=true and call calculation functions
**Then** only billable tasks are included (FR15, FR18)

**Given** a date range filter
**When** I call any calculation function with dateRange parameter
**Then** only tasks within that range are included (FR13)

**Given** tasks with null clientId
**When** I call `calculateRevenueByCustomer()`
**Then** unassigned tasks are grouped under "Unassigned" or similar label

**Given** different task scenarios (zero revenue, single client, etc.)
**When** I call calculation functions
**Then** the dashboard remains functional (FR50)

---

### Story 2.2: Implement summary metrics calculations

As a **user**,
I want **to see total revenue, billable revenue, non-billable revenue, and average hourly rate**,
So that **I have a quick overview of my earnings**.

**Acceptance Criteria:**

**Given** I have tasks with time spent and hourly rates
**When** I view the dashboard
**Then** I see:
  - Total Revenue (sum of billable + non-billable) (FR21)
  - Billable Revenue (only billable tasks) (FR22)
  - Non-Billable Revenue (only non-billable tasks) (FR23)
  - Average Hourly Rate (billable work only) (FR24)
  - Task Count (total and billable) (FR25)

**Given** the date range is "Last 30 days"
**When** I view metrics
**Then** only tasks from the last 30 days are included

**Given** I change a filter
**When** the view updates
**Then** all metrics update immediately (FR27)

**Given** I have no tasks
**When** I view the dashboard
**Then** metrics display as $0 or "No data" state

**Given** all calculations are complete
**When** the dashboard renders
**Then** calculations match the app's existing revenue formula exactly (FR26, 100% accuracy)

---

## Epic 3: Chart Visualizations

**Epic Goal:** Implement interactive, responsive charts for Customer, Project, and Tag revenue breakdowns with tooltips, legends, and full accessibility support.

**Dependencies:** Epic 2 (requires calculation functions)  
**Success Metrics:** 3 charts render, < 2s load time, responsive on all viewports, fully accessible

---

### Story 3.1: Implement Customer Revenue chart

As a **user**,
I want **to see my revenue broken down by customer in a pie chart**,
So that **I can identify my most profitable clients**.

**Acceptance Criteria:**

**Given** I have tasks assigned to multiple clients
**When** I view the "By Customer" chart
**Then** I see a pie chart showing each client's revenue and percentage (FR4)

**Given** I hover over a chart segment
**When** I view the tooltip
**Then** I see the client name, exact revenue, and percentage (FR8)

**Given** I click a legend item
**When** that client's slice is toggled
**Then** it is hidden/shown on the chart (FR9)

**Given** I resize my browser window
**When** I view the chart
**Then** it automatically resizes to fit the viewport (FR10)

**Given** the chart has many data points
**When** the page loads
**Then** the chart renders within 2 seconds (FR43, NFR-P1)

---

### Story 3.2: Implement Project Revenue chart

As a **user**,
I want **to see my revenue broken down by project in a pie chart**,
So that **I can drill into which projects are most profitable**.

**Acceptance Criteria:**

**Given** I have tasks assigned to multiple projects/columns
**When** I view the "By Project" chart
**Then** I see a pie chart showing each project's revenue and percentage (FR5)

**Given** I switch from the "By Customer" chart to "By Project"
**When** the chart changes
**Then** my date range and billable filter remain applied (FR7)

**Given** I hover over a chart segment
**When** I view the tooltip
**Then** I see the project name, exact revenue, and percentage (FR8)

**Given** I resize my browser window
**When** I view the chart
**Then** it automatically resizes to fit the viewport (FR10)

---

### Story 3.3: Implement Tag Revenue chart

As a **user**,
I want **to see my revenue broken down by tags in a pie chart**,
So that **I can strategically allocate my time across work categories**.

**Acceptance Criteria:**

**Given** I have tasks tagged with different categories
**When** I view the "By Tag" chart
**Then** I see a pie chart showing each tag's revenue and percentage (FR6)

**Given** I switch from another chart to "By Tag"
**When** the chart changes
**Then** my date range and billable filter remain applied (FR7)

**Given** a task has no tags
**When** I view the tag chart
**Then** the task is grouped under "Untagged" or similar label

**Given** I hover over a chart segment
**When** I view the tooltip
**Then** I see the tag name, exact revenue, and percentage (FR8)

---

### Story 3.4: Ensure chart responsiveness and performance

As a **user**,
I want **charts to remain interactive and render quickly on any device**,
So that **I can analyze my earnings without lag or blocking**.

**Acceptance Criteria:**

**Given** I am on a mobile device (320px viewport)
**When** I view the dashboard
**Then** all charts are readable and fully functional

**Given** I have 5000 tasks in my dataset
**When** the dashboard loads
**Then** all charts render within 2 seconds (FR43, NFR-P1)

**Given** I am hovering over a tooltip
**When** the chart redraws
**Then** the user interaction is not blocked (FR45)

**Given** I switch between different charts
**When** the new chart renders
**Then** the transition is smooth and complete within 500ms (NFR-P2)

---

## Epic 4: Filter & Control UI

**Epic Goal:** Implement date range picker with presets and billable toggle, with all filters persisting and applying across all charts in real-time.

**Dependencies:** Epic 1, Epic 3 (charts must exist to apply filters)  
**Success Metrics:** All filters work, persist, apply within 500ms, keyboard accessible

---

### Story 4.1: Implement date range filter and presets

As a **user**,
I want **to filter the dashboard by date range using a date picker or presets**,
So that **I can analyze my earnings for specific periods (e.g., last 30 days, last quarter)**.

**Acceptance Criteria:**

**Given** I am on the Earnings Dashboard
**When** I click the date range control
**Then** a date picker opens allowing custom start/end date selection (FR11)

**Given** I want to analyze "Last 30 days" earnings
**When** I click the "Last 30 days" preset button
**Then** the dashboard filters to show only the past 30 days of tasks (FR12)

**Given** preset options available
**When** I view the presets
**Then** I see options for:
  - Last 30 days
  - Last Quarter (90 days)
  - Last Year (365 days)
  - All time

**Given** I select a date range
**When** I view the charts
**Then** all three charts (Customer, Project, Tag) apply the filter (FR13)

**Given** I select a date range
**When** I navigate away and back to the dashboard
**Then** my selected date range is restored (FR14, FR40)

**Given** I set custom dates
**When** I interact with the date picker
**Then** it responds within 500ms (NFR-P2)

---

### Story 4.2: Implement billable/non-billable toggle

As a **user**,
I want **to toggle between showing all work, only billable work, or only non-billable work**,
So that **I can distinguish revenue-generating work from unpaid work**.

**Acceptance Criteria:**

**Given** I am on the Earnings Dashboard
**When** I view the filter controls
**Then** I see a toggle or button set with options:
  - Show All Work
  - Show Billable Only
  - Show Non-Billable Only

**Given** I select "Billable Only"
**When** the view updates
**Then** only billable tasks are included in all calculations and charts (FR15, FR18)

**Given** I select "Non-Billable Only"
**When** the view updates
**Then** only non-billable tasks are included in all calculations and charts (FR16)

**Given** I select "Show All Work"
**When** the view updates
**Then** all tasks (billable and non-billable) are included (FR17)

**Given** I set the billable filter
**When** I close the browser and return to FreelanceFlow
**Then** my billable filter setting persists (FR19, FR41)

**Given** the billable filter is active
**When** I view the metrics panel
**Then** I see separate metrics for billable/non-billable (FR20)

---

### Story 4.3: Ensure filter responsiveness and keyboard accessibility

As a **user**,
I want **filters to apply instantly and be fully keyboard accessible**,
So that **I can quickly refine my analysis without a mouse and without delays**.

**Acceptance Criteria:**

**Given** I change a filter
**When** the dashboard updates
**Then** the change applies within 500ms (NFR-P2)

**Given** I am using keyboard navigation
**When** I Tab to a filter control (date picker, preset button, toggle)
**Then** the control receives focus with a visible indicator (FR35)

**Given** I have focus on a date preset button
**When** I press Enter or Space
**Then** that preset is selected and filters apply (FR33)

**Given** I have focus on a toggle button
**When** I press Enter or Space
**Then** that toggle option is selected (FR33)

**Given** I am using a keyboard only
**When** I interact with all filter controls
**Then** I can complete all filtering tasks (NFR-A7)

---

## Epic 5: Metrics & Summary Display

**Epic Goal:** Display summary metrics in an accessible, responsive layout with proper handling of empty states and edge cases.

**Dependencies:** Epic 2 (requires calculation functions)  
**Success Metrics:** All metrics display, edge cases handled, empty states show helpful messages

---

### Story 5.1: Implement summary metrics cards and edge case handling

As a **user**,
I want **to see earnings summary metrics and helpful messages when data is missing**,
So that **I understand my revenue at a glance and know what to do if there's no data**.

**Acceptance Criteria:**

**Given** I have tasks with time entries and rates
**When** I view the dashboard
**Then** I see summary cards displaying:
  - Total Revenue (FR21)
  - Billable Revenue (FR22)
  - Non-Billable Revenue (FR23)
  - Average Hourly Rate (FR24)
  - Task Count (FR25)

**Given** I have no tasks at all
**When** I view the dashboard
**Then** I see an empty state message: "No tasks tracked yet. Start tracking time to see earnings data." (FR46)

**Given** I have tasks, but none fall within the selected date range
**When** I view the dashboard
**Then** I see a message: "No data for this period. Try adjusting the date range." (FR47)

**Given** I filter to show billable-only work, but have no billable tasks
**When** I view the dashboard
**Then** I see a message: "No billable work in this period." (FR48)

**Given** the calculations encounter an error
**When** I view the dashboard
**Then** I see a clear error message with recovery steps (e.g., "Unable to calculate metrics. Try refreshing the page.") (FR49)

**Given** I have edge case data (zero revenue, single client, all non-billable)
**When** I view the dashboard
**Then** the metrics display correctly and the dashboard remains functional (FR50)

---

## Epic 6: Internationalization

**Epic Goal:** Provide full English/Portuguese support for all dashboard labels, chart text, date formats, and help content.

**Dependencies:** Epic 1, Epic 3, Epic 4, Epic 5 (all UI components must exist)  
**Success Metrics:** All text translated, date formats localized, language toggle works

---

### Story 6.1: Implement i18n translations for dashboard

As a **user**,
I want **all dashboard text and labels available in my language (English or Portuguese)**,
So that **I can use the dashboard comfortably in my preferred language**.

**Acceptance Criteria:**

**Given** I have set my language preference to Portuguese
**When** I navigate to the Earnings Dashboard
**Then** all labels, buttons, and help text are in Portuguese (FR28)

**Given** I view the dashboard in my language
**When** I look at the charts
**Then** chart titles, legends, and data labels are translated (FR29)

**Given** I have a date filter active
**When** I view the date display
**Then** dates are formatted according to my language preference (e.g., DD/MM/YYYY for PT) (FR30)

**Given** I view revenue metrics
**When** I look at currency displays
**Then** currency formatting respects my FreelanceFlow settings (FR31)

**Given** I hover over a chart segment or interactive element
**When** a tooltip appears
**Then** the tooltip text is in my selected language (FR32)

**Given** I toggle my language preference
**When** I stay on the dashboard
**Then** all text updates immediately to the new language

---

## Epic 7: Accessibility

**Epic Goal:** Ensure the dashboard meets WCAG 2.1 Level AA standards with full keyboard navigation, screen reader support, and clear visual indicators.

**Dependencies:** Epic 3, Epic 4, Epic 5 (all UI components must implement accessibility)  
**Success Metrics:** WCAG 2.1 AA compliance verified, keyboard-only navigation works, screen reader tested

---

### Story 7.1: Implement accessibility (WCAG 2.1 AA) for dashboard

As a **user with accessibility needs**,
I want **the dashboard to be fully keyboard accessible and screen-reader compatible**,
So that **I can independently analyze my earnings without barriers**.

**Acceptance Criteria:**

**Given** I am using a screen reader
**When** I navigate the dashboard
**Then** all interactive elements, charts, and metrics are announced properly:
  - Chart titles announced (FR34)
  - Data values announced with context (e.g., "Customer: Acme Corp, Revenue: $5,000, Percentage: 45%")
  - Button and toggle purposes clear (NFR-A1)

**Given** I use keyboard navigation only (Tab, Shift+Tab, Enter, Space, Arrow keys)
**When** I interact with the dashboard
**Then** I can:
  - Navigate all filter controls
  - Open and use the date picker
  - Toggle billable filters
  - Switch between charts
  - Access all information (FR33, NFR-A2, NFR-A7)

**Given** an interactive element receives focus
**When** I view the dashboard
**Then** the focus indicator is clearly visible with high contrast (FR35, NFR-A4)

**Given** data is represented by color (e.g., chart segments)
**When** I view the charts
**Then** data is also distinguished by patterns, labels, or other non-color means (FR36, NFR-A5)

**Given** I measure text contrast
**When** I test all dashboard text against backgrounds
**Then** the contrast ratio meets or exceeds 4.5:1 for normal text, 3:1 for large text (FR37, NFR-A3)

**Given** a dashboard feature is complex (e.g., date range picker)
**When** I view the feature
**Then** clear help text or tooltip explains how to use it (FR38, NFR-A6)

---

## Implementation Sequencing

### Phase 1: MVP Foundation (Weeks 1-2)
1. **Epic 1:** Dashboard Infrastructure (Stories 1.1, 1.2, 1.3)
2. **Epic 2:** Earnings Calculations Engine (Stories 2.1, 2.2)
3. **Epic 3:** Chart Visualizations (Stories 3.1, 3.2, 3.3, 3.4)

### Phase 2: Filters & Polish (Weeks 3)
4. **Epic 4:** Filter & Control UI (Stories 4.1, 4.2, 4.3)
5. **Epic 5:** Metrics & Summary Display (Story 5.1)

### Phase 3: Internationalization & Accessibility (Week 4)
6. **Epic 6:** Internationalization (Story 6.1)
7. **Epic 7:** Accessibility (Story 7.1)

---

## Dependencies & Critical Path

```
Epic 1 (Foundation)
└── Epic 2 (Calculations) → Epic 3 (Charts)
    └── Epic 4 (Filters)
        └── Epic 5 (Summary)
└── Epic 6 (i18n) — Parallel
└── Epic 7 (Accessibility) — Parallel
```

**Critical Path:** Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5  
**Parallel Work:** Epic 6 and Epic 7 can be worked on after Epic 1 completion.

