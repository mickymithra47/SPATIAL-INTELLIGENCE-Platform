import copy
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml import parse_xml

SRC_FILE = r'C:\Users\User\Downloads\College_AI_Assistant_Review_1_UPDATED (2).pptx'
DEST_WORKSPACE = r'c:\Users\User\Desktop\campusAI\Spatial_Intelligence_Platform_Pitch_Deck.pptx'
DEST_DOWNLOADS_1 = r'C:\Users\User\Downloads\College_AI_Assistant_Review_1_UPDATED (2).pptx'
DEST_DOWNLOADS_2 = r'C:\Users\User\Downloads\College_AI_Assistant_Review_1_UPDATED.pptx'
DEST_LOCAL = r'c:\Users\User\Desktop\campusAI\College_AI_Assistant_Review_1_UPDATED.pptx'

RED_COLOR = RGBColor(0xDC, 0x2D, 0x2D)
CHARCOAL = RGBColor(0x1F, 0x29, 0x37)
GRAY_TEXT = RGBColor(0x4B, 0x55, 0x63)
LIGHT_GRAY = RGBColor(0x94, 0xA3, 0xB8)
AMBER_COLOR = RGBColor(0xE6, 0x7E, 0x00)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GREEN_ACCENT = RGBColor(0x00, 0xB0, 0x50)

def set_card_header_and_bullets(shape, header_text, bullets, header_size=15, bullet_size=11, header_color=RED_COLOR):
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.2)
    tf.margin_bottom = Inches(0.2)
    
    # clear existing paragraphs except the first
    while len(tf.paragraphs) > 1:
        p_elem = tf.paragraphs[-1]._p
        p_elem.getparent().remove(p_elem)
        
    p0 = tf.paragraphs[0]
    p0.text = ""
    p0.space_after = Pt(8)
    p0.space_before = Pt(0)
    p0.line_spacing = 1.15
    run0 = p0.add_run()
    run0.text = header_text
    run0.font.bold = True
    run0.font.size = Pt(header_size)
    run0.font.color.rgb = header_color
    
    for item in bullets:
        p = tf.add_paragraph()
        p.space_after = Pt(5)
        p.space_before = Pt(0)
        p.line_spacing = 1.15
        
        if isinstance(item, tuple):
            prefix, body = item
            r1 = p.add_run()
            r1.text = prefix + " "
            r1.font.bold = True
            r1.font.size = Pt(bullet_size)
            r1.font.color.rgb = CHARCOAL
            
            r2 = p.add_run()
            r2.text = body
            r2.font.bold = False
            r2.font.size = Pt(bullet_size)
            r2.font.color.rgb = CHARCOAL
        else:
            r = p.add_run()
            r.text = item
            r.font.bold = False
            r.font.size = Pt(bullet_size)
            r.font.color.rgb = CHARCOAL

def run_update():
    prs = Presentation(SRC_FILE)
    print("Loaded presentation with", len(prs.slides), "slides")
    
    # ==========================================
    # SLIDE 1: COVER
    # ==========================================
    s1 = prs.slides[0]
    # Shape 1 is the Title TextBox
    title_box = s1.shapes[1]
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    while len(tf1.paragraphs) > 1:
        p_elem = tf1.paragraphs[-1]._p
        p_elem.getparent().remove(p_elem)
    p0 = tf1.paragraphs[0]
    p0.text = ""
    p0.space_after = Pt(4)
    r_title = p0.add_run()
    r_title.text = "SPATIAL INTELLIGENCE PLATFORM\n"
    r_title.font.bold = True
    r_title.font.size = Pt(36)
    r_title.font.color.rgb = WHITE
    
    r_sub = p0.add_run()
    r_sub.text = "AI That Understands, Navigates & Operates Physical Spaces\n"
    r_sub.font.bold = True
    r_sub.font.size = Pt(17)
    r_sub.font.color.rgb = AMBER_COLOR
    
    r_supp = p0.add_run()
    r_supp.text = "Starting with Smart Campuses  -->  Expanding to Enterprise Environments"
    r_supp.font.bold = False
    r_supp.font.size = Pt(13)
    r_supp.font.color.rgb = LIGHT_GRAY
    
    title_box.top = int(1.65 * 914400)
    title_box.height = int(1.45 * 914400)
    
    # Shape 2 is milestone subtext
    s1.shapes[2].top = int(3.25 * 914400)
    
    print("Slide 1 updated")
    
    # ==========================================
    # SLIDE 2: PROBLEM & SOLUTION
    # ==========================================
    s2 = prs.slides[1]
    # Shape 6: Card 1 (Problem)
    s2_p_bullets = [
        ("• Information Fragmentation:", "Campus data is scattered across static maps, notice boards, PDFs, timetables, disparate ERPs, and manual enquiries."),
        ("• Navigation & Finding Friction:", "Students, staff, and visitors lose significant time locating classrooms, labs, blocks, and accessibility amenities."),
        ("• Zero Live Operational Visibility:", "No unified system provides real-time room availability, equipment operational status, or schedule changes."),
        ("• Operational Bottlenecks:", "Maintenance reporting is slow and manual; absence of 24/7 intelligent spatial guidance across large campus facilities."),
        ("• Core Limitation:", "Physical campuses completely lack a digital intelligence layer that connects physical spaces with operational workflows.")
    ]
    set_card_header_and_bullets(s2.shapes[6], "1. THE UNRESOLVED PROBLEM", s2_p_bullets, header_size=16, bullet_size=11.5)
    
    # Shape 7: Card 2 (Solution)
    s2_s_bullets = [
        ("• Spatial Intelligence Platform:", "An AI intelligence layer deployed over the physical campus that truly understands spaces and assets."),
        ("• Natural Conversational Querying:", "Ask naturally like ChatGPT: 'Where is Lab 3?', 'Is Room 204 free?', 'Which lab equipment is under maintenance?'"),
        ("• Unified Spatial Data Fabric:", "Connects Location + Rooms + Equipment + People + Timetable + Navigation + Maintenance + Live State."),
        ("• Action-Oriented AI Workflows:", "Beyond text answers, executes turn-by-turn indoor routing, facility reservations, maintenance tickets, and operational alerts."),
        ("• Scalable Market Vision:", "Starting with university campuses as an entry market, scaling across hospitals, factories, warehouses, and smart buildings.")
    ]
    set_card_header_and_bullets(s2.shapes[7], "2. OUR PROPOSED SOLUTION", s2_s_bullets, header_size=16, bullet_size=11.5)
    print("Slide 2 updated")
    
    # ==========================================
    # SLIDE 3: INNOVATION & TECHNICAL NOVELTY
    # ==========================================
    s3 = prs.slides[2]
    # Card 1: Traditional systems
    s3_c1_bullets = [
        ("• Standalone Maps:", "Outdoor geographic roads only; blind to indoor layouts, rooms, and assets."),
        ("• Campus ERP Systems:", "Tabular database records; lacks spatial mapping and indoor navigation."),
        ("• Basic Text Chatbots:", "Superficial FAQ bots; unable to reason about physical spaces or routes."),
        ("• Digital Twins & IoT Silos:", "Isolated 3D visualizers or sensor feeds without unified conversational AI."),
        ("• The Core Gap:", "Information exists in silos; no unified intelligence layer connects spaces with everyday campus operations.")
    ]
    set_card_header_and_bullets(s3.shapes[6], "FRAGMENTED TRADITIONAL TOOLS", s3_c1_bullets, header_size=15, bullet_size=10.5)
    
    # Card 2: 6 concepts
    s3_c2_bullets = [
        ("• WHERE:", "Precise block, floor, room & indoor coordinate geometry."),
        ("• WHAT:", "Deep entity context (room capacity, lab equipment, assets)."),
        ("• WHEN:", "Dynamic timetable schedules & real-time room availability."),
        ("• STATE:", "Current condition, maintenance tickets & operational status."),
        ("• HOW:", "Turn-by-turn indoor navigation & accessibility paths."),
        ("• ACTION:", "AI agents executing workflows (booking, reporting, alerting).")
    ]
    set_card_header_and_bullets(s3.shapes[7], "OUR SPATIAL INTELLIGENCE LAYER", s3_c2_bullets, header_size=15, bullet_size=10.5)
    
    # Card 3: Tech stack & IP
    s3_c3_bullets = [
        ("• Buildable MVP Stack (Current):", ""),
        ("  - AI/LLM + Domain RAG Engine:", "Grounded institutional responses."),
        ("  - Spatial Knowledge Graph:", "PostgreSQL + PostGIS spatial schema."),
        ("  - Navigation Engine:", "Indoor floor-plan graph with A* routing."),
        ("  - Asset DB & Timetable API:", "Live entity data synchronization."),
        ("• Planned Future IP Expansion:", ""),
        ("  - BLE & Wi-Fi indoor positioning telemetry."),
        ("  - Computer Vision & 3D Digital Twin visualization."),
        ("  - Predictive maintenance & real-time campus IoT hub.")
    ]
    set_card_header_and_bullets(s3.shapes[8], "TECHNICAL STACK & IP VIABILITY", s3_c3_bullets, header_size=15, bullet_size=10)
    print("Slide 3 updated")
    
    # ==========================================
    # SLIDE 4: CASE STUDY ANALYSIS
    # ==========================================
    s4 = prs.slides[3]
    # Shape 6: Compliance / Subtitle
    s4.shapes[6].text_frame.text = "Syllabus Compliance: Business analytics on real-world spatial intelligence, indoor navigation, and digital twin benchmarks."
    for p in s4.shapes[6].text_frame.paragraphs:
        for r in p.runs:
            r.font.size = Pt(11)
            r.font.italic = True
            
    # Startup 1: JioXplor Indoor
    s4_s1_bullets = [
        ("• Target Market:", "Large campuses, enterprise venues, airports & malls."),
        ("• Core Solution:", "High-precision indoor navigation & location intelligence."),
        ("• Commercial Strength:", "Proven market demand for precise indoor venue mapping."),
        ("• KEY STRATEGIC LEARNING:", ""),
        ("Validates strong commercial demand for digital indoor wayfinding; our opportunity is adding room, equipment, and schedule intelligence.")
    ]
    set_card_header_and_bullets(s4.shapes[7], "BENCHMARK 1: JioXplor Indoor", s4_s1_bullets, header_size=14, bullet_size=10.5)
    
    # Startup 2: Paathner
    s4_s2_bullets = [
        ("• Target Market:", "Higher education campuses, convention halls & venues."),
        ("• Core Solution:", "Venue digitization, navigation, visitor engagement & analytics."),
        ("• Commercial Strength:", "Comprehensive spatial orchestration and venue analytics."),
        ("• KEY STRATEGIC LEARNING:", ""),
        ("Demonstrates that digitizing campus spaces boosts engagement; combining spatial data with conversational AI creates an enduring moat.")
    ]
    set_card_header_and_bullets(s4.shapes[8], "BENCHMARK 2: Paathner", s4_s2_bullets, header_size=14, bullet_size=10.5)
    
    # Startup 3: DestinofyAI & Novalumic
    s4_s3_bullets = [
        ("• Target Market:", "Smart buildings, industrial facilities & enterprises."),
        ("• Core Solution:", "AI floor-plan understanding & 3D digital twin intelligence."),
        ("• Commercial Strength:", "Deep spatial intelligence combined with sensor overlays."),
        ("• KEY STRATEGIC LEARNING:", ""),
        ("Proves industry appetite for AI that understands floor plans; our platform unifies spatial models with operational agent workflows.")
    ]
    set_card_header_and_bullets(s4.shapes[9], "BENCHMARK 3: Destinofy / Novalumic", s4_s3_bullets, header_size=14, bullet_size=10.5)
    print("Slide 4 updated")
    
    # ==========================================
    # SLIDE 5: COMPETITOR LANDSCAPE & MARKET ANALYSIS
    # ==========================================
    s5 = prs.slides[4]
    table_shape = [sh for sh in s5.shapes if sh.has_table][0]
    t = table_shape.table
    
    # Ensure 5 columns
    if len(t.columns) == 4:
        grid = t._tbl.tblGrid
        new_col = copy.deepcopy(grid.gridCol_lst[-1])
        grid.append(new_col)
        for tr in t._tbl.tr_lst:
            new_tc = copy.deepcopy(tr.tc_lst[-1])
            tr.append(new_tc)
            
    # Set desired number of rows (1 header + 7 comparison rows = 8 rows)
    while len(t.rows) < 8:
        new_tr = copy.deepcopy(t._tbl.tr_lst[-1])
        t._tbl.append(new_tr)
        
    # Column widths (Total = 11.83 inches = 10820095 EMUs)
    col_widths = [int(2.4 * 914400), int(2.1 * 914400), int(2.1 * 914400), int(2.2 * 914400), int(3.0 * 914400)]
    for idx, w in enumerate(col_widths):
        t.columns[idx].width = w
        
    table_data = [
        ["FEATURES / PARAMETERS", "CAMPUS WEBSITE", "CAMPUS ERP", "STANDALONE NAV", "OUR SPATIAL PLATFORM"],
        ["Campus Spatial Info", "Static text / PDFs", "Tabular records", "Road map only", "Unified Spatial Graph"],
        ["Conversational AI", "None", "None (Complex menus)", "Basic voice search", "Natural Language AI + RAG"],
        ["Indoor Navigation", "None", "None", "Outdoor only", "Turn-by-Turn Wayfinding"],
        ["Room & Lab Context", "Basic directory", "Room code list", "Building pin only", "Deep Context & Live Availability"],
        ["Equipment Tracking", "None", "Static inventory DB", "None", "Location + Maintenance State"],
        ["Timetable Integration", "Static schedule PDF", "Tabular schedule", "None", "Integrated Where + When Search"],
        ["Actions & AI Agents", "None", "Manual form filing", "None", "Automated Booking & Alert Workflows"]
    ]
    
    for r_idx, row in enumerate(table_data):
        for c_idx, val in enumerate(row):
            cell = t.cell(r_idx, c_idx)
            cell.text = val
            cell.margin_left = Inches(0.08)
            cell.margin_right = Inches(0.08)
            cell.margin_top = Inches(0.04)
            cell.margin_bottom = Inches(0.04)
            p = cell.text_frame.paragraphs[0]
            p.space_before = Pt(0)
            p.space_after = Pt(0)
            if r_idx == 0:
                p.alignment = PP_ALIGN.CENTER
                for r in p.runs:
                    r.font.bold = True
                    r.font.size = Pt(9.5)
                    r.font.color.rgb = WHITE
            else:
                for r in p.runs:
                    r.font.size = Pt(8.5)
                    if c_idx == 4:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(0x99, 0x1B, 0x1B)
                    elif c_idx == 0:
                        r.font.bold = True
                        r.font.color.rgb = CHARCOAL
                    else:
                        r.font.color.rgb = GRAY_TEXT
                        
    # Adjust table position and height
    table_shape.top = int(1.42 * 914400)
    table_shape.height = int(3.35 * 914400)
    
    # Bottom card
    adv_card = s5.shapes[7]
    adv_card.top = int(4.88 * 914400)
    adv_card.height = int(1.25 * 914400)
    adv_bullets = [
        ("• Unified Spatial Intelligence:", "Traditional systems operate in silos. Our platform seamlessly connects Maps + AI + Spatial Knowledge + Assets + Schedules + Live State + Actions."),
        ("• Deep Contextual Reasoning:", "Answers complex multi-hop queries ('Where is my next class and what equipment is inside?') that ERPs and navigation apps cannot solve."),
        ("• Enterprise Extensibility:", "Modular architecture built to expand from college campuses directly into hospitals, factories, and smart enterprise environments.")
    ]
    set_card_header_and_bullets(adv_card, "OUR SUSTAINABLE COMPETITIVE ADVANTAGE: UNIFIED SPATIAL INTELLIGENCE", adv_bullets, header_size=12, bullet_size=9.5)
    print("Slide 5 updated")
    
    # ==========================================
    # SLIDE 6: BUSINESS MODEL CANVAS (9-BLOCK)
    # ==========================================
    s6 = prs.slides[5]
    
    # Helper for BMC box
    def update_bmc_box(shape, title, items, font_sz=8.5, title_sz=11):
        tf = shape.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.12)
        tf.margin_right = Inches(0.12)
        tf.margin_top = Inches(0.12)
        tf.margin_bottom = Inches(0.12)
        while len(tf.paragraphs) > 1:
            p_elem = tf.paragraphs[-1]._p
            p_elem.getparent().remove(p_elem)
        p0 = tf.paragraphs[0]
        p0.text = ""
        p0.space_after = Pt(4)
        r0 = p0.add_run()
        r0.text = title
        r0.font.bold = True
        r0.font.size = Pt(title_sz)
        r0.font.color.rgb = RED_COLOR
        
        for item in items:
            p = tf.add_paragraph()
            p.space_after = Pt(2)
            p.space_before = Pt(0)
            p.line_spacing = 1.1
            r = p.add_run()
            r.text = "• " + item
            r.font.size = Pt(font_sz)
            r.font.color.rgb = CHARCOAL
            
    # Shape 6: Key Partners
    update_bmc_box(s6.shapes[6], "KEY PARTNERS", [
        "Universities & Colleges",
        "Mapping & GIS Providers",
        "IoT & BLE Hardware Vendors",
        "Cloud & AI Providers (OpenAI, AWS)",
        "Campus ERP System Vendors",
        "Incubators & Academic CoEs"
    ], font_sz=8.5, title_sz=11)
    
    # Shape 7: Value Proposition
    update_bmc_box(s6.shapes[7], "VALUE PROPOSITION", [
        "Natural language campus interaction",
        "Turn-by-turn indoor wayfinding",
        "Unified room & lab intelligence",
        "Equipment tracking & maintenance",
        "Dynamic timetable & room search",
        "Accessibility routing support",
        "Future IoT & sensor-ready architecture"
    ], font_sz=8.5, title_sz=11)
    
    # Shape 8: Customer Segments
    update_bmc_box(s6.shapes[8], "CUSTOMER SEGMENTS", [
        "Initial Market (Campuses):",
        "• Colleges & Universities",
        "• Higher-ed institutions",
        "• Large educational campuses",
        "Future Enterprise Expansion:",
        "• Hospitals & Healthcare",
        "• Factories & Manufacturing",
        "• Warehouses & Airports",
        "• Corporate Smart Buildings"
    ], font_sz=8, title_sz=11)
    
    # Shape 9: Key Activities
    update_bmc_box(s6.shapes[9], "KEY ACTIVITIES", [
        "Campus mapping & digitization",
        "Spatial Knowledge Graph modeling",
        "AI / RAG fine-tuning & algorithms",
        "Indoor navigation & API integration",
        "AI-agent operational workflows"
    ], font_sz=8, title_sz=10.5)
    
    # Shape 10: Key Resources
    update_bmc_box(s6.shapes[10], "KEY RESOURCES", [
        "Spatial datasets & floor plans",
        "Spatial Knowledge Graph schemas",
        "Indoor routing & navigation engine",
        "AI models & cloud infra",
        "Engineering & AI development team"
    ], font_sz=8, title_sz=10.5)
    
    # Shape 11: Customer Relationships
    update_bmc_box(s6.shapes[11], "CUSTOMER RELATIONSHIPS", [
        "B2B SaaS institutional onboarding",
        "Dedicated technical SLA & support",
        "Campus analytics & space insights",
        "Continuous map & asset updates"
    ], font_sz=8, title_sz=10.5)
    
    # Shape 12: Channels
    update_bmc_box(s6.shapes[12], "CHANNELS", [
        "Direct B2B institutional sales",
        "College pilot deployments & demos",
        "University consortia & edu expos",
        "Incubation centers & CoE networks"
    ], font_sz=8, title_sz=10.5)
    
    # Shape 13: Cost Structure
    update_bmc_box(s6.shapes[13], "COST STRUCTURE", [
        "AI inferencing & cloud infrastructure (AWS/Azure)  |  Software R&D & platform engineering",
        "Campus mapping, CAD ingestion & data processing  |  Enterprise integration, testing & support"
    ], font_sz=9, title_sz=11)
    
    # Shape 14: Revenue Streams
    update_bmc_box(s6.shapes[14], "REVENUE STREAMS", [
        "Initial campus setup & floor-plan digitization fee  |  Annual recurring B2B SaaS subscription",
        "Custom ERP & timetable integration charges  |  Premium spatial analytics & asset intelligence"
    ], font_sz=9, title_sz=11)
    print("Slide 6 updated")
    
    # ==========================================
    # SLIDE 7: FEASIBILITY ASSESSMENT
    # ==========================================
    s7 = prs.slides[6]
    s7_tech_bullets = [
        ("• Core MVP Technology Stack:", ""),
        ("  - Frontend:", "React / Next.js responsive web app with interactive map canvas."),
        ("  - Backend:", "Node.js / Express microservices + modular REST & GraphQL APIs."),
        ("  - Spatial Database:", "PostgreSQL + PostGIS for spatial queries, polygons & nodes."),
        ("  - AI & RAG Engine:", "LLM + Vector Embeddings grounded on verified campus data."),
        ("  - Core Innovation:", "Spatial Knowledge Graph linking spaces, assets & schedules."),
        ("  - Navigation Engine:", "Indoor floor-plan graph with A* routing & accessibility weights."),
        ("• System Architecture Flow:", ""),
        ("  User --> AI Chat Interface --> RAG Engine --> Spatial Knowledge Graph --> Campus Maps/Assets/Timetable --> Navigation & Action"),
        ("• Planned Horizon (Future):", "IoT telemetry, BLE/Wi-Fi positioning, Computer Vision & Digital Twins.")
    ]
    set_card_header_and_bullets(s7.shapes[6], "TECHNICAL FEASIBILITY: BUILDABLE MVP TO HORIZONS", s7_tech_bullets, header_size=14, bullet_size=9.5)
    
    s7_fin_bullets = [
        ("• Economical Prototype Build:", "Developed with open-source GIS tools (PostGIS) and college CoE lab workstations, keeping upfront R&D costs minimal."),
        ("• Controlled Cloud & AI Costs:", "Semantic query caching, vector indexing, and tiered model routing reduce token inference expenses by over 60%."),
        ("• Scalable Commercial Economics:", ""),
        ("  - Onboarding / Setup Fee:", "One-time campus mapping and spatial digitization."),
        ("  - Recurring SaaS License:", "Annual per-campus subscription based on scale."),
        ("  - Enterprise Integrations:", "Custom ERP, timetable, and SIS connectors."),
        ("  - Spatial Analytics:", "High-margin add-on for facility & asset utilization."),
        ("• Operating Leverage:", "Pure software delivery yields gross margins exceeding 75% as institutional adoption multiplies."),
        ("• Feasibility Decision:", "Highly feasible for immediate MVP build and rapid student validation.")
    ]
    set_card_header_and_bullets(s7.shapes[7], "FINANCIAL FEASIBILITY: LEAN PROTOTYPE & HIGH MARGINS", s7_fin_bullets, header_size=14, bullet_size=9.5)
    print("Slide 7 updated")
    
    # ==========================================
    # SLIDE 8: COE & INCUBATION MAPPING
    # ==========================================
    s8 = prs.slides[7]
    s8_coe_bullets = [
        ("• Associated Centre of Excellence:", "Product Development Lab, ESEC."),
        ("• Prototype Engineering:", "Leveraging lab workstation infrastructure to design the Spatial Knowledge Graph schemas and A* routing engine."),
        ("• Real-World Campus Testbed:", "ESEC campus acts as our living laboratory for surveying blocks, mapping indoor corridors, and cataloging lab assets."),
        ("• AI & RAG Experimentation:", "Benchmarking prompt performance, retrieval accuracy, and timetable API synchronization in a controlled setting."),
        ("• User Validation & Pilot:", "Conducting structured usability trials with ESEC students, faculty, and administrative staff."),
        ("• Faculty Mentorship:", "Direct technical supervision and architectural reviews under Ms. E. Janani (AP/CSE).")
    ]
    set_card_header_and_bullets(s8.shapes[7], "COLLEGE COE & LAB INFRASTRUCTURE", s8_coe_bullets, header_size=15, bullet_size=11)
    
    s8_inc_bullets = [
        ("• Business Model Guidance:", "Refining B2B SaaS pricing, institutional ROI justification, and enterprise customer acquisition strategies."),
        ("• Pilot Customer Facilitation:", "Connecting with campus administration and neighboring educational institutions for live trial deployments."),
        ("• Industry Mentorship:", "Advisory sessions from experienced startup founders on B2B sales cycles and enterprise software architecture."),
        ("• Startup Formalization:", "Comprehensive support for startup registration, MSME compliance, and software copyright/IP filing."),
        ("• Grant & Funding Pathways:", "Preparing investor pitches for student innovation grants, incubation seed support, and venture funds."),
        ("• Ecosystem Validation:", "Transforming academic R&D into a commercially viable, scalable enterprise venture.")
    ]
    set_card_header_and_bullets(s8.shapes[8], "INCUBATION CENTRE VALUE-ADD", s8_inc_bullets, header_size=15, bullet_size=11)
    print("Slide 8 updated")
    
    # ==========================================
    # SLIDE 9: BUSINESS OPPORTUNITY & SCALING
    # ==========================================
    s9 = prs.slides[8]
    s9_bullets = [
        ("CORE THESIS: \"The campus is our entry market — not our final market. We are building an AI intelligence layer for the physical world.\"", ""),
        ("• Market Reality:", "Physical environments everywhere suffer from the exact same friction: spaces, assets, schedules, and operations are disconnected and digitally invisible."),
        ("• PHASE 1: Smart Campuses (Entry Market):", "Classrooms, labs, blocks, equipment tracking, timetable integration, maintenance ticketing, and turn-by-turn indoor wayfinding. Controlled environment ideal for rapid validation."),
        ("• PHASE 2: Healthcare & Hospitals:", "Clinical departments, diagnostic labs, doctor consultation rooms, critical mobile medical equipment tracking, and patient/visitor navigation."),
        ("• PHASE 3: Smart Factories & Manufacturing:", "Production bays, heavy machinery assets, maintenance logs, safety compliance protocols, and worker indoor navigation."),
        ("• PHASE 4: Warehouses, Airports & Smart Buildings:", "High-throughput logistics hubs, flight gate & terminal wayfinding, automated asset locating, and commercial facility management."),
        ("• Strategic Scalability:", "Every industry transition leverages the exact same underlying Spatial Knowledge Graph and indoor navigation foundation, expanding our addressable market exponentially.")
    ]
    set_card_header_and_bullets(s9.shapes[6], "START WITH CAMPUSES. BUILD FOR THE PHYSICAL WORLD.", s9_bullets, header_size=16, bullet_size=11.5)
    print("Slide 9 updated")
    
    # ==========================================
    # SLIDE 10: ELEVATOR PITCH
    # ==========================================
    s10 = prs.slides[9]
    pitch_card = s10.shapes[6]
    tf10 = pitch_card.text_frame
    tf10.word_wrap = True
    tf10.margin_left = Inches(0.3)
    tf10.margin_right = Inches(0.3)
    tf10.margin_top = Inches(0.25)
    tf10.margin_bottom = Inches(0.25)
    while len(tf10.paragraphs) > 1:
        p_elem = tf10.paragraphs[-1]._p
        p_elem.getparent().remove(p_elem)
        
    p0 = tf10.paragraphs[0]
    p0.text = ""
    p0.space_after = Pt(12)
    r0 = p0.add_run()
    r0.text = "THE 1-MINUTE ELEVATOR PITCH"
    r0.font.bold = True
    r0.font.size = Pt(16)
    r0.font.color.rgb = RED_COLOR
    
    pitch_lines = [
        "\"Good morning panel members. Today, physical campus information is scattered across static maps, timetables, PDFs, disparate databases, and manual enquiries.",
        "We are building a Spatial Intelligence Platform that gives AI a deep understanding of the physical environment.",
        "Students and staff can simply ask questions in natural language, such as: 'Where is my next class?', 'Is Lab 3 available right now?', or 'Which equipment in this lab is under maintenance?'",
        "Beyond just answering questions, our platform navigates users indoors with turn-by-turn routing, connects equipment and room data, triggers maintenance requests, and prepares campuses for future real-time IoT integration.",
        "We are starting with universities as our initial entry market, but our long-term vision is much larger: expanding into hospitals, factories, warehouses, airports, and smart buildings.",
        "Our ultimate goal is to build the AI intelligence layer for the physical world.\""
    ]
    for line in pitch_lines:
        p = tf10.add_paragraph()
        p.space_after = Pt(8)
        p.line_spacing = 1.2
        r = p.add_run()
        r.text = line
        r.font.size = Pt(13)
        r.font.italic = True
        r.font.color.rgb = CHARCOAL
    print("Slide 10 updated")
    
    # ==========================================
    # SLIDE 11: ROADMAP & MILESTONES
    # ==========================================
    s11 = prs.slides[10]
    
    def update_roadmap_card(shape, week_str, milestone_str, items, mark_str="50 Marks"):
        tf = shape.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.12)
        tf.margin_right = Inches(0.12)
        tf.margin_top = Inches(0.15)
        tf.margin_bottom = Inches(0.15)
        while len(tf.paragraphs) > 1:
            p_elem = tf.paragraphs[-1]._p
            p_elem.getparent().remove(p_elem)
        p0 = tf.paragraphs[0]
        p0.text = ""
        p0.space_after = Pt(2)
        r_w = p0.add_run()
        r_w.text = week_str + "\n"
        r_w.font.bold = True
        r_w.font.size = Pt(14)
        r_w.font.color.rgb = RED_COLOR
        
        r_m = p0.add_run()
        r_m.text = milestone_str
        r_m.font.bold = True
        r_m.font.size = Pt(10.5)
        r_m.font.color.rgb = CHARCOAL
        
        for item in items:
            p = tf.add_paragraph()
            p.space_after = Pt(2)
            p.space_before = Pt(0)
            p.line_spacing = 1.1
            r = p.add_run()
            r.text = "• " + item
            r.font.size = Pt(9.5)
            r.font.color.rgb = CHARCOAL
            
        p_last = tf.add_paragraph()
        p_last.space_before = Pt(4)
        r_last = p_last.add_run()
        r_last.text = mark_str
        r_last.font.bold = True
        r_last.font.size = Pt(9.5)
        r_last.font.color.rgb = RED_COLOR
        
    update_roadmap_card(s11.shapes[6], "WEEK 1 - 6", "MILESTONE I: IDEA & SPATIAL VALIDATION", [
        "Problem & spatial validation",
        "Competitor study (JioXplor, Paathner)",
        "9-block BMC finalized",
        "CoE resource mapping",
        "Spatial graph schema design",
        "System architecture defined"
    ], "Review I: 50 Marks (Current)")
    
    update_roadmap_card(s11.shapes[7], "WEEK 7 - 12", "MILESTONE II: BUILD MVP & CORE AI", [
        "Campus map digitization",
        "PostgreSQL + PostGIS setup",
        "AI conversational RAG engine",
        "Basic indoor routing engine",
        "Timetable API integration",
        "Admin asset dashboard"
    ], "Review II: 50 Marks")
    
    update_roadmap_card(s11.shapes[8], "WEEK 13 - 15", "MILESTONE III: PROGRESS & ADVANCED V2", [
        "Live room availability tracking",
        "Equipment maintenance logging",
        "QR-based waypoint wayfinding",
        "Accessibility routing (ramps)",
        "User testing & feedback at ESEC",
        "Mentorship logs completed"
    ], "Component III: 50 Marks")
    
    update_roadmap_card(s11.shapes[9], "WEEK 16", "MILESTONE IV: FULL APP & VISION", [
        "Cross-platform responsive app",
        "AI agent workflow demo",
        "Pilot demonstration at ESEC",
        "Multi-industry scaling roadmap",
        "Filing/publication evidence",
        "Commercialization route"
    ], "Component IV: 50 Marks")
    print("Slide 11 updated")
    
    # ==========================================
    # SLIDE 12: RISK & FEASIBILITY
    # ==========================================
    s12 = prs.slides[11]
    s12_risk_bullets = [
        ("• AI Hallucination:", "Grounded RAG with strict schema validation against verified campus data."),
        ("• Outdated Information:", "Role-based admin portals with automated ERP synchronization and audit alerts."),
        ("• Navigation Errors:", "Pre-calibrated vector map nodes with physical waypoint verification before rollout."),
        ("• Privacy & Security:", "Role-Based Access Control (RBAC), data encryption, minimal personal data collection."),
        ("• Integration Complexity:", "Modular, API-first architecture compatible with existing college ERPs."),
        ("• AI Inferencing Costs:", "Semantic query caching, model routing, and token usage controls."),
        ("• Low User Adoption:", "Pilot rollout at ESEC with physical QR waypoint markers and student ambassador drive.")
    ]
    set_card_header_and_bullets(s12.shapes[7], "Risk Identification & Mitigation Matrix", s12_risk_bullets, header_size=15, bullet_size=10.5)
    
    s12_decision_bullets = [
        ("• Technical Feasibility:", "FEASIBLE — Proven modern stack (React, Node.js, PostGIS, RAG) with clearly bounded MVP scope."),
        ("• Financial Feasibility:", "FEASIBLE — Lean prototype built with open-source tools; highly scalable SaaS subscription economics."),
        ("• Market Feasibility:", "FEASIBLE — High recurring pain point across universities, with direct scaling pathways into multi-industry enterprise spaces."),
        ("• Incubation Viability:", "VALIDATED — Supported by Product Development Lab, ESEC for rapid testing, prototype validation, and pilot feedback."),
        ("• FINAL FEASIBILITY DECISION:", ""),
        ("GO — BUILD & VALIDATE MVP IN PRODUCT DEVELOPMENT LAB")
    ]
    set_card_header_and_bullets(s12.shapes[8], "Feasibility Assessment & Decision", s12_decision_bullets, header_size=15, bullet_size=10.5)
    print("Slide 12 updated")
    
    # ==========================================
    # SLIDE 13: VIVA-VOCE PREPARATION
    # ==========================================
    s13 = prs.slides[12]
    
    s13_hod_bullets = [
        ("• Focus:", "Syllabus compliance, lab utilization & revenue model."),
        ("• Q1: Isn't this just Google Maps or a basic chatbot?", ""),
        ("Prep: Google Maps stops outdoors; chatbots only output text. We unify a Spatial Knowledge Graph, indoor routing, room availability, equipment tracking, and operational actions."),
        ("• Q2: How are CoE lab resources used & what is the revenue model?", ""),
        ("Prep: Product Development Lab provides workstations and campus testbeds. Revenue is generated via initial setup fees, annual SaaS subscriptions, and custom ERP integration.")
    ]
    set_card_header_and_bullets(s13.shapes[6], "HOD'S COMPLIANCE EXPECTATIONS", s13_hod_bullets, header_size=14, bullet_size=9.5)
    
    s13_fac_bullets = [
        ("• Focus:", "Technical innovation, graph architecture & feasibility."),
        ("• Q1: What makes the technology novel?", ""),
        ("Prep: A multi-dimensional Spatial Knowledge Graph connecting Where (location), What (asset), When (schedule), State (condition), How (routing), and Action (AI agents)."),
        ("• Q2: Can a student team realistically build this in 16 weeks?", ""),
        ("Prep: Yes. The MVP relies on accessible technologies (React, Node.js, PostGIS, RAG). Complex horizons like BLE positioning and computer vision are phased into future releases.")
    ]
    set_card_header_and_bullets(s13.shapes[7], "FACULTY TECHNICAL CONCERNS", s13_fac_bullets, header_size=14, bullet_size=9.5)
    
    s13_ind_bullets = [
        ("• Focus:", "Commercial viability, defensibility & scaling potential."),
        ("• Q1: Who will buy it first and why?", ""),
        ("Prep: Universities and large colleges with distributed infrastructure buy it to reduce manual administrative load, improve student experience, and optimize facility utilization."),
        ("• Q2: What is the long-term defensibility & scaling roadmap?", ""),
        ("Prep: Campus is our entry testbed. Our spatial graph and indoor routing engine scales directly into hospitals, factories, warehouses, and smart buildings.")
    ]
    set_card_header_and_bullets(s13.shapes[8], "INDUSTRY EXPERT QUESTIONS", s13_ind_bullets, header_size=14, bullet_size=9.5)
    print("Slide 13 updated")
    
    # ==========================================
    # SAVE PRESENTATION
    # ==========================================
    prs.save(DEST_WORKSPACE)
    prs.save(DEST_LOCAL)
    prs.save(DEST_DOWNLOADS_1)
    prs.save(DEST_DOWNLOADS_2)
    print("Successfully saved presentation to:")
    print(" -", DEST_WORKSPACE)
    print(" -", DEST_LOCAL)
    print(" -", DEST_DOWNLOADS_1)
    print(" -", DEST_DOWNLOADS_2)

if __name__ == "__main__":
    run_update()
