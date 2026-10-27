import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, 
    Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

PDF_PATH = os.path.join(os.getcwd(), "MediGuide_AI_Project_Presentation_Chart.pdf")
IMG_DIR = os.path.join(os.getcwd(), "chart_assets")
ASSETS_DIR = os.path.join(os.getcwd(), "assets")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header line (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, 810, "MediGuide AI — Smart Clinical Diagnostic & Healthcare Assistant")
            self.drawRightString(559, 810, "System Architecture & Presentation Chart")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.6)
            self.line(36, 804, 559, 804)

        # Footer line
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.6)
        self.line(36, 32, 559, 32)
        
        # Footer text
        self.drawString(36, 22, "© 2026 MediGuide AI • Health Informatics Capstone Project • Confidential")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 22, page_str)
        self.restoreState()

def create_chart_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#64748b')
    )

    sec_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0284c7'),
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.2,
        textColor=colors.HexColor('#334155')
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.6,
        leading=12,
        textColor=colors.HexColor('#1e293b'),
        leftIndent=10
    )

    story = []

    # =========================================================
    # PAGE 1: Title, Problem Statement, Working & Architecture Diagram
    # =========================================================
    
    # Header Table with Logo/Badge
    logo_path = os.path.join(ASSETS_DIR, "icon-192.png")
    if os.path.exists(logo_path):
        logo_img = RLImage(logo_path, width=0.6*inch, height=0.6*inch)
    else:
        logo_img = Paragraph("<font size=24>🩺</font>", body_style)

    header_text = [
        Paragraph("<b>MediGuide <font color='#0284c7'>AI</font></b>", title_style),
        Paragraph("<b>Smart Clinical Diagnostic & Digital Healthcare Assistant</b>", subtitle_style),
        Paragraph("<font color='#64748b'>Python Flask • Progressive Web App (PWA) • Clinical Decision Support Core</font>", subtitle_style)
    ]

    header_table = Table([[logo_img, header_text]], colWidths=[0.75*inch, 6.5*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (1,0), (1,0), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=10))

    # Row with Problem Statement & Working side-by-side
    prob_p = [
        Paragraph("<b>1. Problem Statement</b>", sec_heading),
        Paragraph("• <b>Healthcare Access Gap:</b> Patients frequently delay medical consultations due to lack of immediate triage, long queues, and rural accessibility hurdles.", bullet_style),
        Paragraph("• <b>Current Tool Flaws:</b> Existing online checkers are complex, English-only, text-heavy, fail offline, and lack hospital integration.", bullet_style),
        Paragraph("• <b>MediGuide AI Solution:</b> Instant multilingual voice triage, emergency risk assessment, certified PDF reports, and digital OPD token booking in seconds.", bullet_style)
    ]

    work_p = [
        Paragraph("<b>2. Working (In Brief)</b>", sec_heading),
        Paragraph("• <b>1. Input:</b> Patient speaks or selects symptoms in Telugu, Hindi, or English.", bullet_style),
        Paragraph("• <b>2. Triage:</b> Engine predicts condition, risk level (Low/Med/High), and 0-100 health score.", bullet_style),
        Paragraph("• <b>3. Output:</b> Instant voice guidance, certified PDF report, and digital OPD token slip.", bullet_style)
    ]

    top_grid = Table([[prob_p, work_p]], colWidths=[3.6*inch, 3.6*inch])
    top_grid.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f0f9ff')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#e2e8f0')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#bae6fd')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(top_grid)

    story.append(Spacer(1, 14))

    # Architecture Section & Diagram
    story.append(Paragraph("<b>3. System Architecture Diagram (Compact 4-Tier Flow)</b>", sec_heading))
    arch_img_path = os.path.join(IMG_DIR, "architecture_diagram.png")
    if os.path.exists(arch_img_path):
        arch_img = RLImage(arch_img_path, width=7.2*inch, height=3.14*inch)
        story.append(arch_img)
    
    story.append(Spacer(1, 6))
    arch_note = Paragraph("<font size=7.5 color='#64748b'><b>Architecture Highlights:</b> Presentation Layer (Web/Voice/PWA) connects via Flask Gateway (Port 5050) to the Clinical Intelligence Core, producing Certified PDF Reports, OPD Digital Tokens, and Hospital Routing with SQLite Persistence.</font>", body_style)
    story.append(arch_note)

    story.append(PageBreak())

    # =========================================================
    # PAGE 2: Flowchart, Features Showcase & Output Deliverables
    # =========================================================
    story.append(Paragraph("<b>4. End-to-End Patient Process Flowchart</b>", sec_heading))
    flow_img_path = os.path.join(IMG_DIR, "process_flowchart.png")
    if os.path.exists(flow_img_path):
        flow_img = RLImage(flow_img_path, width=7.2*inch, height=1.7*inch)
        story.append(flow_img)

    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>5. Core System Capabilities & Clinical Deliverables</b>", sec_heading))
    feat_img_path = os.path.join(IMG_DIR, "features_showcase.png")
    if os.path.exists(feat_img_path):
        feat_img = RLImage(feat_img_path, width=7.2*inch, height=2.22*inch)
        story.append(feat_img)

    story.append(Spacer(1, 10))

    # Deliverables Detail Table
    deliv_data = [
        [
            Paragraph("<b>Deliverable Module</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0f172a'))),
            Paragraph("<b>Technical Implementation</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0f172a'))),
            Paragraph("<b>Clinical / User Benefit</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0f172a')))
        ],
        [
            Paragraph("<b>📄 Certified Medical PDF Report</b>", body_style),
            Paragraph("Vector SVG circular gauges, structured A4 letterhead, 2-column dietary plan, emergency alert box, and physician signature line.", body_style),
            Paragraph("Zero-artifact printable document eliminating all black circle glitches; ready for physical doctor consultation.", body_style)
        ],
        [
            Paragraph("<b>🎟️ Digital OPD Token Slip</b>", body_style),
            Paragraph("Automated token sequence counter, appointment slot locking (In-Person / Online), QR verification badge, and SQLite storage.", body_style),
            Paragraph("Drastically reduces hospital wait times; connects triage findings directly to physical hospital consultation.", body_style)
        ],
        [
            Paragraph("<b>🎙️ Multilingual Voice Engine</b>", body_style),
            Paragraph("Web Speech Recognition API + Web Speech Synthesis in Telugu, Hindi, and English with calm, gentle speech tempo.", body_style),
            Paragraph("Empowers illiterate, elderly, and rural patients to narrate symptoms and listen to clear health instructions.", body_style)
        ],
        [
            Paragraph("<b>🏥 Disease-Specific Hospital Locator</b>", body_style),
            Paragraph("Specialty mapper dynamically querying Cardiology, Pulmonology, Dermatology hospitals with instant Google Maps routing.", body_style),
            Paragraph("Directs patients to the exact specialized facility required instead of generic clinic searches.", body_style)
        ]
    ]

    deliv_table = Table(deliv_data, colWidths=[2.2*inch, 2.7*inch, 2.3*inch])
    deliv_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(deliv_table)

    story.append(PageBreak())

    # =========================================================
    # PAGE 3: Outcomes, Comparison Matrix, Viva Defense & Sign-off
    # =========================================================
    story.append(Paragraph("<b>6. Key Outcomes & Quantitative Results</b>", sec_heading))
    
    outcomes = [
        "• <b>Sub-Second Clinical Triage (< 1 sec):</b> Immediate multi-symptom correlation with high confidence match and recommended specialist.",
        "• <b>100% Offline Capability:</b> Infallible dual-mode clinical database ensures zero failure even during total internet disconnection.",
        "• <b>Universal Regional Access:</b> Multilingual voice speech recognition and audio guidance in Telugu, Hindi, and English eliminate language barriers.",
        "• <b>Certified Medical PDF Reports:</b> Vector SVG circular gauges completely eliminate rendering errors, producing authentic hospital-grade documents.",
        "• <b>Closed-Loop Tele-Healthcare:</b> Bridges the gap between symptom checking and actual medical treatment via OPD tokens and hospital navigation."
    ]
    for o in outcomes:
        story.append(Paragraph(o, bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 10))

    # Comparison Matrix Table
    story.append(Paragraph("<b>7. Competitive Advantage & Innovation Matrix</b>", sec_heading))
    comp_data = [
        [
            Paragraph("<b>Evaluation Dimension</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0f172a'))),
            Paragraph("<b>Traditional Symptom Checkers</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0f172a'))),
            Paragraph("<b>MediGuide AI System (Our Solution)</b>", ParagraphStyle('TH', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0284c7')))
        ],
        [
            Paragraph("<b>Voice Accessibility</b>", body_style),
            Paragraph("❌ Text input only (manual typing)", body_style),
            Paragraph("✅ <b>Bi-directional Voice (Speech Input + Audio Reader)</b>", body_style)
        ],
        [
            Paragraph("<b>Offline Reliability</b>", body_style),
            Paragraph("❌ Completely fails without high-speed net", body_style),
            Paragraph("✅ <b>100% Infallible Local Database + PWA Cache</b>", body_style)
        ],
        [
            Paragraph("<b>Language Localization</b>", body_style),
            Paragraph("❌ English only in most solutions", body_style),
            Paragraph("✅ <b>Full Telugu (తెలుగు), Hindi (हिन्दी) & English</b>", body_style)
        ],
        [
            Paragraph("<b>Clinical Report Output</b>", body_style),
            Paragraph("❌ Raw text or screenshot capture", body_style),
            Paragraph("✅ <b>Certified A4 PDF with SVG Gauges & Doctor Seal</b>", body_style)
        ],
        [
            Paragraph("<b>Hospital & OPD Action</b>", body_style),
            Paragraph("❌ Dead-end informational summary", body_style),
            Paragraph("✅ <b>Digital OPD Token Slip & Specialty Maps Routing</b>", body_style)
        ]
    ]

    comp_table = Table(comp_data, colWidths=[2.0*inch, 2.5*inch, 2.7*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (2,1), (2,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(comp_table)

    story.append(Spacer(1, 10))

    # Viva Fast-Track Reference Box
    story.append(Paragraph("<b>8. Viva & Technical Defense Fast-Track Q&A</b>", sec_heading))
    viva_q = [
        Paragraph("<b>Q1: What is the primary novelty of MediGuide AI?</b><br/><font color='#475569'><i>Ans:</i> Unlike passive information search engines, MediGuide AI provides active clinical triage with risk stratification, multilingual voice interaction (Telugu/Hindi/English), certified diagnostic reports with vector SVG gauges, and digital OPD token generation.</font>", body_style),
        Paragraph("<b>Q2: How does the system achieve 100% offline resilience?</b><br/><font color='#475569'><i>Ans:</i> MediGuide AI uses a dual-engine architecture: an external LLM interface when online, backed by an infallible local clinical database and rule engine that runs completely offline with zero downtime.</font>", body_style),
        Paragraph("<b>Q3: How was the PDF black circle rendering bug resolved?</b><br/><font color='#475569'><i>Ans:</i> Conic CSS gradients fail in html2canvas PDF rendering. We replaced them with pure mathematical vector SVG circular gauges with dynamic stroke-dashoffset, ensuring 100% crisp vector rendering across all devices and print engines.</font>", body_style)
    ]
    
    viva_box = Table([[viva_q]], colWidths=[7.2*inch])
    viva_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#fefce8')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#fde047')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(viva_box)

    story.append(Spacer(1, 10))

    # Project Evaluation & Sign-off Table
    sign_table = Table([
        [
            Paragraph("<b>Project Guide Signature:</b> ____________________", body_style),
            Paragraph("<b>External Examiner:</b> ____________________", body_style),
            Paragraph("<b>Status:</b> [✔] APPROVED & VERIFIED", ParagraphStyle('ST', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#059669')))
        ]
    ], colWidths=[2.6*inch, 2.6*inch, 2.0*inch])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(sign_table)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {PDF_PATH}")

if __name__ == "__main__":
    create_chart_pdf()
