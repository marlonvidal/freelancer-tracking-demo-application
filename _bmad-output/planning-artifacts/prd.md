---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain-skipped
  - step-06-innovation-skipped
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - _bmad-output/project-context.md
  - docs/project-overview.md
  - docs/index.md
  - docs/architecture.md
  - docs/component-inventory.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 7
projectType: brownfield
workflowType: prd
classification:
  projectType: Web Application (React SPA)
  domain: Freelance Operations & Business Intelligence
  complexity: Medium
  projectContext: brownfield
---

# Product Requirements Document - FreelanceFlow Earnings Dashboard

**Author:** Marlon  
**Date:** 2026-04-03  
**Project Type:** Brownfield (Existing Project Enhancement)  
**Feature:** Earnings Dashboard — Multi-dimensional revenue analytics for freelancer business intelligence

---

## Executive Summary

**Vision:** FreelanceFlow evolves from a task execution tool to a **complete freelancer business tool**. By adding earnings intelligence, freelancers gain clarity into their business profitability—enabling data-driven decisions about which clients to pursue, which projects are truly valuable, and where to focus their limited time.

**Problem Statement:** Freelancers currently lack visibility into where their income comes from. They can track tasks and billable hours, but cannot easily answer critical questions: Which clients are most profitable? Which projects consume time without adequate compensation? This blindness prevents strategic business decisions.

**Target Users:** Freelancers and independent contractors using FreelanceFlow who want to understand and optimize their business economics.

### What Makes This Special

**Core Differentiator:** The earnings dashboard transforms FreelanceFlow into a business intelligence tool for freelancers by providing multi-dimensional revenue insights (by customer, project, and tag) with the ability to isolate billable vs non-billable work. This moves FreelanceFlow beyond task management into business analytics—enabling users to decline unprofitable contracts and prioritize high-value opportunities.

**Unique Insight:** Freelancers don't optimize their business because they lack data. By surfacing earnings breakdowns they already generate (through time tracking), FreelanceFlow becomes a tool for business growth, not just task execution.

## Project Classification

| Attribute | Value |
|-----------|-------|
| **Project Type** | Web Application (React SPA) — Analytics/Reporting Feature |
| **Domain** | Freelance Operations & Business Intelligence |
| **Complexity** | Medium (charting, filtering, export on existing data model) |
| **Project Context** | Brownfield (extending existing FreelanceFlow product) |

---

## Success Criteria

### User Success

Freelancers gain clear visibility into their business economics and can make strategic decisions:

- **Primary success:** User can identify their most profitable clients and low-profit/unprofitable projects within seconds
- **Aha moment:** Realizing "Client A generates 40% of my revenue" or "Project X only nets $15/hr"
- **Behavioral outcome:** Users act on insights — prioritizing high-value clients, negotiating rates with low-profit clients, or declining unprofitable work
- **Completion:** User completes at least one analysis task (e.g., "view 3-month earnings by client" or "filter out non-billable work")

### Business Success

- **Adoption:** 30% of active FreelanceFlow users access the dashboard within first 30 days of launch
- **Engagement:** Users return to the dashboard at least once per month to review earnings
- **Impact:** Dashboard becomes a primary tool for freelancers' business planning and rate negotiation decisions

### Technical Success

- Dashboard loads earnings data in under 2 seconds for typical freelancer datasets (500-5000 tasks)
- Date range filtering and billable/non-billable filters work without lag
- Charts remain responsive with large datasets
- Data accuracy: 100% match between dashboard totals and app-calculated revenue

### Measurable Outcomes

| Metric | Target | Timeline |
|--------|--------|----------|
| Dashboard page views per active user | ≥ 2 per month | 3 months post-launch |
| Users who filter by date range | ≥ 60% of dashboard users | 3 months post-launch |
| Users who separate billable/non-billable | ≥ 50% of dashboard users | 3 months post-launch |
| Average time on dashboard | ≥ 3 minutes per session | Baseline measure |
| Chart rendering performance | < 2 seconds for typical data | Launch readiness |

---

## User Journeys

The following three user journeys represent the primary value propositions and reveal the core capabilities required for the Earnings Dashboard:

### Journey 1: Sarah — The Optimization-Focused Freelancer

**Persona:** Sarah, a mid-career freelancer with 5-6 active clients and varying hourly rates. She manages her workflow on FreelanceFlow but has never had clarity into which work is actually profitable.

**Problem:** Sarah suspects some projects aren't worth her time, but she's been making decisions based on gut feeling rather than data.

**The Journey:**

1. **Discovery:** Sarah opens the Earnings Dashboard and selects the last 6 months to view her revenue by customer.
2. **Insight:** She sees Client A generates 45% of her revenue, while Client E only 8%.
3. **Deep Dive:** She switches to "By Project," filters to Client E's projects, and discovers Project X nets only $12/hr (her target: $50/hr).
4. **Decision:** Sarah decides to decline Project X and reallocate that time to higher-value work.

**Success Outcome:** Data-driven business decision to decline unprofitable work.

### Journey 2: Marcus — The New Freelancer

**Persona:** Marcus, a junior freelancer just starting with FreelanceFlow. He has 3 clients, but some work is unpaid (friendly favors while building reputation).

**Problem:** Marcus doesn't understand his real billable revenue versus time invested in unpaid work.

**The Journey:**

1. **Confusion:** Marcus sees dashboard totals showing all his work, appearing lower than expected.
2. **Discovery:** He uses the Billable/Non-Billable toggle to filter the view.
3. **Clarity:** He realizes he's spending 33% of his time on unpaid favors; his billable hourly rate is $28/hr (below market).
4. **Decision:** Marcus commits to raising rates and being selective about unpaid work.

**Success Outcome:** Confidence in pricing and business model.

### Journey 3: Priya — The Business-Minded Freelancer

**Persona:** Priya, an experienced freelancer who tags work by category ("Client Work," "Upskilling," "Internal Projects") and uses tags for quarterly business planning.

**Problem:** Priya lacks visibility into revenue by tag category to inform strategic resource allocation.

**The Journey:**

1. **Planning:** Priya opens the dashboard at end of Q1 to plan Q2. She views earnings by tag.
2. **Analysis:** She filters to billable-only and sees Client Work (75%, $13K), Upskilling (5%, $900), Internal Projects (20%, $3.5K).
3. **Insight:** Her upskilling work is a net loss; internal projects are more valuable than she thought.
4. **Decision:** She sets Q2 targets: 75% Client Work, 15% Internal Projects, 10% paid-only upskilling.

**Success Outcome:** Tags become a strategic business planning tool.

### Journey Requirements Summary

| Capability | Why It Matters | Revealed By |
|-----------|----------------|------------|
| **By Customer Chart** | Identify highest-revenue clients | Sarah's Journey |
| **By Project Chart** | Drill into profitability by project | Sarah's Journey |
| **By Tag Chart** | Strategic planning by work category | Priya's Journey |
| **Billable/Non-Billable Toggle** | Distinguish revenue-generating work | Marcus's Journey |
| **Date Range Filtering** | Quarterly trend analysis | Priya & Sarah's Journeys |
| **Summary Metrics** | Quick earnings overview | All journeys |
| **Accurate Calculations** | Enable confident decisions | All journeys |

---

## Product Scope

### MVP - Minimum Viable Product (Phase 1 - Launch)

**Core Features:**

- **Three earnings visualizations:** Customer, Project, and Tag breakdowns (pie or bar charts)
- **Date range filtering:** Custom date picker + presets (Last 30 days, Last quarter, Last year, All time)
- **Billable toggle:** Show/hide non-billable work across all charts
- **Summary metrics:** Total revenue, billable revenue, non-billable revenue, average hourly rate
- **Responsive design:** Mobile-friendly layout (320px+ viewports)
- **Internationalization:** Full English/Portuguese support
- **Dashboard page:** Accessible from main navigation at `/earnings` route
- **State persistence:** Filter selections persist across sessions

**MVP Success Criteria:**
- All three breakdowns display with 100% calculation accuracy
- Charts load within 2 seconds for typical datasets (500-5000 tasks)
- Filters apply without lag or data inconsistencies
- Mobile experience is fully functional

### Growth Features (Phase 2 - 2-3 months post-launch)

- Export data as CSV/PDF for accounting/taxes
- Drill-down: Click chart segments to see underlying task details
- Billable rate alerts: Notify when clients/projects fall below minimum rate
- Enhanced filtering: Filter by specific client, project, or tag
- Client profitability ranking: Auto-scoring of high/medium/low value clients
- Saved date range filters: Quick access to favorite analysis periods

### Future Vision (Phase 3 - Long-term roadmap)

- Month-over-month comparison analytics
- Revenue forecasting based on trends
- Goal-setting: Revenue targets by client with progress tracking
- AI-powered insights: Automated recommendations for rate increases/declines
- Advanced analytics: Cohort analysis, burndown charts, productivity metrics

---

## Web Application Technical Requirements

### Project-Type Overview

The Earnings Dashboard is a **React SPA feature** integrated into FreelanceFlow. It processes existing time-tracking data to compute and visualize earnings across three dimensions (customer, project, tag) with interactive filtering and responsive design.

### Technical Architecture

#### Performance & Data Handling

- **Data Computation:** On-the-fly calculation from existing tasks in AppState (no new backend)
- **Performance Target:** Dashboard loads/renders charts in < 2 seconds (500-5000 tasks)
- **Real-Time:** Charts do NOT update real-time; users manually navigate to dashboard or refresh
- **State Persistence:** Filter state (date range, billable toggle, active chart) persists in localStorage
- **Data Volume:** Display all filtered data at once; no pagination needed for MVP dataset sizes

#### Charting & Visualization

- **Library:** **Recharts** (`^2.15.4` — already in project stack)
  - Supports pie/bar charts, responsive containers, accessibility features
- **Chart Types:** Pie charts for proportional view; alternative bar chart for absolute values
- **Interactivity:** Tooltips on hover, legend toggles, responsive resizing

#### Responsive Design & Accessibility

- **Mobile:** Layouts adapt to 320px+ viewports; charts stack vertically on small screens
- **Accessibility (WCAG 2.1 Level AA):**
  - ARIA labels for chart data
  - Keyboard navigation (Tab, Enter/Space)
  - Screen reader support
  - Color + patterns for data distinction
  - 4.5:1 contrast ratio for text

#### Internationalization

- **Languages:** English and Portuguese (via existing LanguageContext)
- **Translations:** Chart labels, legends, button text, help text, date formats
- **Currency:** Respects user's existing FreelanceFlow currency context

#### Browser Compatibility

- **Minimum:** Chrome/Edge/Firefox/Safari — latest 2 versions; iOS Safari 14+, Chrome Android 90+

#### State Management & Integration

- **State:** Dashboard state follows existing AppContext reducer pattern
- **Data Source:** Flows from existing AppState (tasks, clients, tags)
- **Persistence:** Uses existing localStorage mechanism; no new storage layer
- **Route:** New `/earnings` path; component at `src/pages/EarningsDashboard.tsx`

### Implementation Structure

- **Components:** `src/components/EarningsDashboard/` (ChartCard, DateRangeFilter, BillableToggle)
- **Utilities:** `src/lib/earnings-calculations.ts` for revenue logic
- **Types:** Extend `src/types/index.ts` with EarningsBreakdown, EarningsMetrics
- **Testing:** Unit tests (calculations), component tests (rendering/filters), E2E tests (workflows)

---

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** **Problem-Solving MVP** — Solve the core user problem (earnings visibility) with minimal features sufficient for freelancers to make business decisions. Success is measured by user adoption and decision-making impact, not feature richness.

### Risk Mitigation

**Technical Risks:**
- **Recharts performance with large datasets:** Include performance testing; if needed, implement data aggregation in Phase 2
- **Calculation accuracy:** Comprehensive unit tests; validation against manual calculations; E2E journey tests

**Market Risks:**
- **Low engagement post-launch:** Measure visits (target: 2/month); gather feedback at 2-week mark
- **Insights don't drive decisions:** Follow-up survey to measure business impact

**Resource Risks:**
- **Implementation delays:** MVP scope is tight; if needed, defer i18n to Phase 2 (accessibility non-negotiable)
- **Team constraints:** MVP is achievable by 1-2 engineers; no backend work required

---

## Functional Requirements

The following 50 functional requirements define the complete capability contract for the Earnings Dashboard. Every feature must trace back to these requirements.

### Dashboard Navigation & Access

- **FR1:** Users can access the Earnings Dashboard from a dedicated page/tab in main navigation
- **FR2:** The dashboard is accessible via the `/earnings` route
- **FR3:** Users can navigate away and return without losing filter state

### Data Visualization & Charts

- **FR4:** Users can view earnings by Customer in a chart (pie or bar)
- **FR5:** Users can view earnings by Project in a chart (pie or bar)
- **FR6:** Users can view earnings by Tag in a chart (pie or bar)
- **FR7:** Switching chart views preserves date range and billable filter
- **FR8:** Charts display interactive tooltips with exact values and percentages on hover
- **FR9:** Chart legends allow toggling data series visibility
- **FR10:** Charts automatically resize to fit the viewport

### Date Range Filtering

- **FR11:** Users can select custom date ranges using a date picker
- **FR12:** Users can select preset ranges (Last 30 days, Quarter, Year, All time)
- **FR13:** Selected date range applies to all three charts
- **FR14:** Date range persists when navigating away/back to dashboard

### Billable vs Non-Billable Filtering

- **FR15:** Users can toggle to show only billable work
- **FR16:** Users can toggle to show only non-billable work
- **FR17:** Users can toggle to show all work
- **FR18:** Billable filter applies to all charts
- **FR19:** Billable filter persists across sessions
- **FR20:** Dashboard displays separate metrics for billable/non-billable when filtering

### Summary Metrics & Calculations

- **FR21:** Dashboard displays total revenue for selected date range
- **FR22:** Dashboard displays billable revenue for selected date range
- **FR23:** Dashboard displays non-billable revenue for selected date range
- **FR24:** Dashboard displays average hourly rate (billable work)
- **FR25:** Dashboard displays task count (total and billable)
- **FR26:** All calculations match app's existing revenue formula (100% accuracy)
- **FR27:** Calculations update immediately when filters change

### Internationalization & Localization

- **FR28:** All labels, buttons, help text translated to user's language (English/Portuguese)
- **FR29:** Chart titles and legends translated
- **FR30:** Date formats respect language preference
- **FR31:** Currency display respects user's existing FreelanceFlow settings
- **FR32:** Tooltips available in user's selected language

### Accessibility & Keyboard Navigation

- **FR33:** All interactive elements are keyboard accessible (Tab, Enter/Space)
- **FR34:** Charts include ARIA labels for screen readers
- **FR35:** Focus indicators clearly visible
- **FR36:** Color not the only data distinction (patterns/labels also used)
- **FR37:** All text meets WCAG 2.1 Level AA contrast (4.5:1 minimum)
- **FR38:** Help text/tooltips explain complex features

### State Persistence

- **FR39:** Selected chart view (Customer/Project/Tag) persists across navigation
- **FR40:** Date range persists across sessions (localStorage)
- **FR41:** Billable filter setting persists across sessions
- **FR42:** Chart state resets when user clears app data or manually resets

### Performance & Data Handling

- **FR43:** Dashboard loads/renders all charts within 2 seconds (up to 5000 tasks)
- **FR44:** Filter changes apply within 500ms
- **FR45:** Charts remain interactive during rendering (no blocking)

### Error Handling & Edge Cases

- **FR46:** Empty state message if user has no tasks
- **FR47:** "No data for this period" message if no tasks in selected range
- **FR48:** "No billable work" message if filtered to billable-only with no results
- **FR49:** Clear error message if calculation fails, with recovery steps
- **FR50:** Dashboard remains functional even with edge case data (zero revenue, single client, etc.)

---

## Non-Functional Requirements

### Performance

- **NFR-P1:** Dashboard loads/renders all charts within 2 seconds (5,000 tasks max)
- **NFR-P2:** Filter interactions (date range, billable toggle, chart switching) respond within 500ms
- **NFR-P3:** Charts display without blocking user interaction
- **NFR-P4:** Earnings calculations complete before chart rendering (no loading state)
- **NFR-P5:** Navigation to/from dashboard completes in < 1 second

### Accessibility

- **NFR-A1:** Charts include ARIA labels describing data series for screen readers
- **NFR-A2:** All interactive elements keyboard navigable via Tab key
- **NFR-A3:** All text meets WCAG 2.1 Level AA contrast (4.5:1 normal, 3:1 large)
- **NFR-A4:** Focus indicators always visible and distinguishable
- **NFR-A5:** Data conveyed via text/patterns in addition to color
- **NFR-A6:** Help text/tooltips explain complex features for cognitive accessibility
- **NFR-A7:** All interactions completable with keyboard alone

---

## Document Summary

This PRD provides a complete capability contract for the Earnings Dashboard feature. It defines:

- **Vision & Strategy:** Transforming FreelanceFlow into a complete business tool through earnings intelligence
- **User Needs:** Three primary personas revealing the core value proposition
- **Success Metrics:** Measurable outcomes for adoption, engagement, and impact
- **Scope:** Clear MVP, Growth, and Vision phases
- **Technical Requirements:** Architecture, performance, accessibility, and integration with existing system
- **Functional & Non-Functional Requirements:** 50 capabilities and 7 quality attributes

All downstream work (UX design, architecture, epic breakdown, implementation) must trace back to these requirements.
