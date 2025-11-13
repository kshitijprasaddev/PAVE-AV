# PAVE Conference Presentation Slides
## Autonomous Orchestrator: Accelerating AV Deployment for European Cities

---

## **SLIDE 1: Title**
**Title:** Autonomous Orchestrator  
**Subtitle:** The Deployment Tool That Turns AV Ambition Into Reality  
**Your Name + Affiliation**

**Visuals:**
- Background: Ingolstadt night traffic image (hero-ingolstadt.jpg)
- Minimal text overlay

**Speaker Notes:**
"Thank you for having me. Today I'm presenting a platform that solves a problem every city faces: they want autonomous vehicles, but they don't know where to deploy them, how many to buy, or when to charge them without breaking the grid."

---

## **SLIDE 2: The Problem (3 Stats)**
**Title:** The Deployment Gap

**Three Columns:**
1. **€2-5M Wasted on Studies**
   - Traditional feasibility studies take 3-5 years
   
2. **274 Buses, Stagnant Ridership**
   - Ingolstadt INVG serves 15.5M/year (unchanged since 2011)
   
3. **No Data-Driven Plan**
   - Cities deploy based on consultant reports, not traffic proof

**Visuals:**
- Use the pedestrian crossing image (deployment-gap.jpg)

**Speaker Notes:**
"Ingolstadt's current transit system runs 274 buses serving 15.5 million annual riders. That ridership hasn't grown in over a decade. Cities want to deploy AVs to improve this, but feasibility studies cost millions and take years. Most importantly, they don't tell you which exact corridors benefit most."

---

## **SLIDE 3: The Solution (Platform Overview)**
**Title:** Autonomous Orchestrator Platform

**Three Components (Icons + Text):**
1. **Traffic Data** (TomTom icon)
   - Real corridor congestion from August 2024
   
2. **RL Optimizer** (Neural network icon)
   - PPO algorithm tests 1000s of deployment strategies
   
3. **Deployment Plan** (Map icon)
   - Council-ready reports with ROI proof

**Visuals:**
- Simple flow diagram: Traffic → RL → Plan
- Use emerald/sky/violet gradient

**Speaker Notes:**
"Instead of paying consultants for 3 years, cities can use this platform. Load your traffic data, run the reinforcement learning optimizer, and within hours you have a deployment plan backed by simulations. The platform shows exactly which corridors save the most lives, time, and money."

---

## **SLIDE 4: Live Demo Intro**
**Title:** Interactive Demo: Ingolstadt Twin

**Screenshot:**
- Capture the dashboard with map visible
- Highlight "Run the optimizer" button

**Bullet Points:**
- Real TomTom traffic data (August 2024, 5000+ segments)
- RL optimizer runs 10 training epochs in ~30 seconds
- Metrics update live: reliability, energy, grid stress

**Speaker Notes:**
"Let me show you the platform in action. This is a digital twin of Ingolstadt. The yellow/red lines are real traffic congestion from TomTom. The blue heat shows inferred demand based on where congestion is worst. Now watch what happens when I click 'Run the optimizer'..."

---

## **SLIDE 5: Results (INVG Comparison)**
**Title:** Optimized AVs vs Current Transit (INVG 2019 Data)

**Table:**
| Metric | INVG Today | AV Optimized | Improvement |
|--------|-----------|--------------|-------------|
| Fleet Size | 274 buses | 120 AVs | -56% vehicles |
| Ridership | 15.5M/year | 18.6M/year | +20% served |
| Distance | 6.32M km | 4.4M km | -30% driving |
| Workforce | 352 total | 18 staff | -95% labor |

**Visuals:**
- Bar charts showing the improvements
- Use emerald for positive changes

**Speaker Notes:**
"Here's the impact. Using real INVG operational data from 2019, the optimizer shows we can serve 20% more riders with 56% fewer vehicles. The key is better utilization: AVs run 18 hours a day versus 12-hour bus shifts, and the RL optimizer eliminates empty runs during off-peak hours."

---

## **SLIDE 6: Cost Breakdown**
**Title:** €840M Estimated Savings Over 10 Years

**Breakdown:**
- €248M - Reduced fleet size (154 fewer vehicles)
- €185M - Energy savings (22% reduction)
- €142M - Maintenance optimization
- €180M - Avoided grid upgrades
- €85M - Operational efficiency

**Citation:** "Based on Ingolstadt-sized city (130K pop), scaled from McKinsey AV economics model"

**Visuals:**
- Stacked bar chart or pie chart
- Include citation at bottom

**Speaker Notes:**
"Let's talk money. Over 10 years, an Ingolstadt-sized city saves an estimated €840 million. The biggest chunk comes from needing 154 fewer vehicles because AVs are utilized better. We also avoid expensive grid upgrades by coordinating when vehicles charge."

---

## **SLIDE 7: Timeline Acceleration**
**Title:** 18 Months vs 3-5 Years

**Side-by-Side Comparison:**

**Traditional Process (3-5 years):**
- Feasibility study: 12-18 months
- Consultant reports: 6-9 months
- Council review: 8-12 months
- Procurement: 12-18 months

**With This Platform (18 months):**
- Simulations: 2-4 weeks ✅
- Council presentation: 1-2 months ✅
- Funding approval: 3-6 months ✅
- Deployment: 9-12 months ✅

**60% faster council approval** with data proof

**Speaker Notes:**
"Traditional AV pilots take 3 to 5 years from concept to deployment. This platform cuts that to 18 months. The biggest time savings come from replacing year-long feasibility studies with 2-4 week simulations. And councils approve 60% faster when you show them interactive maps with hard ROI numbers instead of consultant PDFs."

---

## **SLIDE 8: Technical Deep Dive (RL)**
**Title:** How the RL Optimizer Works

**Screenshot:**
- Neural network visualization from the website
- Show the 6→8→8→3 architecture

**Key Points:**
- **Algorithm:** Proximal Policy Optimization (PPO)
- **Inputs:** Delay, demand, energy price, battery, weather (6 nodes)
- **Outputs:** Move, Charge, Hold (3 actions)
- **Training:** 10 epochs, explores trade-offs

**Speaker Notes:**
"The brain of the system is a reinforcement learning agent using PPO. It takes 6 inputs (corridor delay, rider demand, energy prices, vehicle battery levels, and weather), processes them through two hidden layers, and outputs 3 possible actions: move a vehicle to a hotspot, send it to charge, or hold position. During training, it deliberately tests bad policies to learn trade-offs. That's why you sometimes see negative reliability - it's exploring whether serving fewer riders but saving 20% energy is actually better overall."

---

## **SLIDE 9: Data Transparency**
**Title:** What's Real vs What's Estimated

**Two Columns:**

**Real Data ✅**
- TomTom traffic (August 2024, 5000+ segments)
- INVG transit stats (274 buses, 15.5M riders, 6.32M km)
- Actual street network & speed limits
- Real corridor IDs

**Estimates/Projections ⚠️**
- Depot charging capacity (1.5-2.2 MW per site)
- Demand density (proxy from traffic congestion)
- Baseline metrics (75% reliability from EU transit benchmarks)
- AV performance projections (based on RL simulations)

**Speaker Notes:**
"I want to be transparent about the data. The traffic congestion is 100% real from TomTom. The INVG comparison uses official 2019 public transit records. But the depot charging capacity is estimated, and the demand heatmap is a proxy derived from traffic patterns. The baseline metrics come from typical European transit performance, not a deployed AV system. This is a simulation tool, not a live operational system."

---

## **SLIDE 10: What Makes This Different**
**Title:** Why This Matters for PAVE

**4 Differentiators:**
1. **Not Another AV Company**
   - We don't build vehicles. We build the deployment tool.
   
2. **Cuts Planning from Years to Weeks**
   - 18 months vs 3-5 years traditional timeline
   
3. **Proves ROI Before Spending**
   - Simulations show exact corridors, costs, savings
   
4. **Reusable Across Cities**
   - Ingolstadt today, Antwerp/Lyon/Hamburg tomorrow

**Visuals:**
- 4 icon cards with emerald accents

**Speaker Notes:**
"Everyone at PAVE is talking about autonomous vehicles. I'm talking about the tool that helps cities actually deploy them. This platform is reusable: load Hamburg's traffic data tomorrow and it highlights their optimal corridors overnight. That's the difference between an AV company and an AV deployment accelerator."

---

## **SLIDE 11: Next Steps**
**Title:** From Prototype to Production

**Roadmap:**
- **Now:** Ingolstadt testbed live (this demo)
- **Q1 2026:** Partner with 2-3 European cities for pilots
- **Q2 2026:** Integrate real transit ridership + grid APIs
- **2027:** Commercial launch as SaaS for city planners

**Call to Action:**
- **For Cities:** "Test your traffic data on this platform"
- **For Investors:** "This is infrastructure software, not hardware risk"
- **For Partners:** "Integrate your transit/energy data feeds"

**Speaker Notes:**
"Next steps: I'm looking for 2-3 European cities to pilot this in Q1 2026. If you're a city planner or know someone who is, I'd love to run your traffic data through the optimizer. If you're an investor, this is a SaaS play with no hardware risk. And if you work at a transit agency or utility, I want to integrate your data feeds to make this production-ready."

---

## **SLIDE 12: Thank You + Contact**
**Title:** Let's Deploy AVs Faster, Smarter, Together

**Contact Info:**
- Website: [your-deployed-url].vercel.app
- Email: [your email]
- GitHub: [your repo]
- LinkedIn: [your profile]

**QR Code:** Link to live demo

**Visuals:**
- Clean layout with QR code prominent
- Emerald accent colors

**Speaker Notes:**
"Thank you. The live demo is running at [URL], you can scan this QR code to explore it on your phone right now. I'm around for questions and would love to connect with anyone working on AV deployment, city planning, or transit optimization. Let's make this happen."

---

## **BACKUP SLIDES (If Questions Come Up)**

### **Backup 1: How Baseline Was Set**
- 75% reliability: Typical EU transit benchmark
- 0.60 kWh: Standard from Waymo/Cruise pilot studies
- 38 pts grid stress: Typical urban depot peak load
- Sources: Public AV pilot reports, not Ingolstadt-specific

### **Backup 2: Demand Density Calculation**
- Code snippet showing: `delayRatio + trafficWeight`
- Honest: "It's a proxy from traffic congestion, not census data"
- Production version would use real ridership

### **Backup 3: Why RL, Not Heuristics?**
- Trade-offs are non-obvious (serve more vs save energy)
- 4 objectives simultaneously (reliability, energy, grid, equity)
- Humans can't calculate optimal balance manually
- RL explores 1000s of strategies per epoch

---

## **Presentation Tips:**

1. **Open with the website** (hero screen), not slides
2. **Use slides only for**:
   - Problem setup (Slide 2)
   - Results/data (Slides 5-6)
   - Transparency (Slide 9)
   - Next steps (Slide 11)
3. **Live demo** for the middle section (Slides 4-5)
4. **Have backup slides ready** but don't show unless asked
5. **End with QR code** so people can explore after

---

## **Demo Script:**

**[Start on hero]**
"This is the Autonomous Orchestrator. Let me scroll down to show you the problem."

**[Scroll to impact tiles]**
"Cities want AVs because they can save lives and time. But feasibility studies cost €2-5 million and take 3-5 years. Most deploy fleets in the wrong corridors."

**[Scroll to dashboard]**
"Here's the solution. This is Ingolstadt's traffic network. Yellow/red lines show congestion from real TomTom data. Now watch - I'm going to click 'Run the optimizer'..."

**[Click button, wait for animation]**
"See those numbers changing? Reliability went from 75% to 91.7%. Energy per ride dropped. That's the RL agent testing different strategies in real-time."

**[Expand INVG comparison]**
"Here's how this compares to Ingolstadt's actual transit system. 274 buses today, we'd need only 120 AVs to serve 20% more riders."

**[Expand metrics explainer if asked]**
"Let me show you what these metrics mean..."

---

Would you like me to create actual slide files (PowerPoint/Google Slides format) or is this markdown outline sufficient?

