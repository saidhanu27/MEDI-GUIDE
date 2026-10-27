import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image as PILImage

# Ensure output directory
IMG_DIR = os.path.join(os.getcwd(), "chart_assets")
os.makedirs(IMG_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE COMPACT SYSTEM ARCHITECTURE DIAGRAM (300 DPI)
# -------------------------------------------------------------
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(11, 4.8), dpi=300)
    fig.patch.set_facecolor('#070d18')
    ax.set_facecolor('#070d18')
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 4.8)
    ax.axis('off')

    # Card definitions: (x, y, w, h, title, icon, lines, border_color, fill_color)
    layers = [
        (0.4, 0.6, 2.2, 3.6, "1. UI & Voice", "[UI]", 
         ["• Glassmorphic Web UI", "• Telugu / Hindi / EN Voice", "• Live ECG Cardiac Canvas", "• Offline PWA Cache"],
         "#00e5ff", "#0f172a"),
        (3.0, 0.6, 2.2, 3.6, "2. Gateway Layer", "[API]", 
         ["• Python Flask (Port 5050)", "• /predict REST Endpoint", "• User Auth & Sessions", "• Cloudflare Global Tunnel"],
         "#38bdf8", "#0f172a"),
        (5.6, 0.6, 2.2, 3.6, "3. Clinical Core", "[CORE]", 
         ["• Symptom Hallmark Match", "• Risk (Low / Med / High)", "• 0-100 Wellness Index", "• Dual Local & Cloud Engine"],
         "#00ffa3", "#0f172a"),
        (8.2, 0.6, 2.4, 3.6, "4. Output Services", "[SVC]", 
         ["• Certified PDF Medical Report", "• Digital OPD Token Slip & QR", "• Hospital Maps Routing", "• SQLite (mediguide.db)"],
         "#a78bfa", "#0f172a")
    ]

    for (x, y, w, h, title, icon, lines, b_col, f_col) in layers:
        # Outer Card
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.1,rounding_size=0.18",
            ec=b_col, fc=f_col, lw=2, zorder=2
        )
        ax.add_patch(rect)
        
        # Header banner inside card
        header_rect = patches.FancyBboxPatch(
            (x + 0.05, y + h - 0.75), w - 0.1, 0.65,
            boxstyle="round,pad=0.04,rounding_size=0.12",
            ec='none', fc='#1e293b', zorder=3
        )
        ax.add_patch(header_rect)
        
        # Header Text
        ax.text(x + 0.2, y + h - 0.42, icon, fontsize=16, va='center', zorder=4)
        ax.text(x + 0.55, y + h - 0.42, title, fontsize=11, fontweight='bold', color='#ffffff', va='center', zorder=4)
        
        # Bullet Lines
        line_y = y + h - 1.15
        for line in lines:
            ax.text(x + 0.15, line_y, line, fontsize=8.5, color='#cbd5e1', va='center', zorder=4)
            line_y -= 0.62

    # Draw Horizontal Connecting Flow Arrows
    arrows = [
        (2.68, 2.4, 0.24, "Symptom Input"),
        (5.28, 2.4, 0.24, "JSON Payload"),
        (7.88, 2.4, 0.24, "Triage & Score")
    ]
    for (ax_x, ax_y, dx, label) in arrows:
        ax.annotate(
            '', xy=(ax_x + dx, ax_y), xytext=(ax_x, ax_y),
            arrowprops=dict(facecolor='#00e5ff', edgecolor='#00e5ff', arrowstyle="->,head_width=0.35,head_length=0.4", lw=2.5),
            zorder=5
        )
        ax.text(ax_x + dx/2, ax_y + 0.22, label, fontsize=6.5, color='#00e5ff', ha='center', va='bottom', fontweight='bold')

    plt.tight_layout(pad=0.2)
    out_path = os.path.join(IMG_DIR, "architecture_diagram.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Generated: {out_path}")
    return out_path

# -------------------------------------------------------------
# 2. GENERATE PROCESS FLOWCHART (300 DPI)
# -------------------------------------------------------------
def generate_process_flowchart():
    fig, ax = plt.subplots(figsize=(11, 2.6), dpi=300)
    fig.patch.set_facecolor('#070d18')
    ax.set_facecolor('#070d18')
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 2.6)
    ax.axis('off')

    steps = [
        (0.3, 0.3, 1.8, 1.9, "1. Patient Info", "Age, Gender, Name", "#0284c7", "01"),
        (2.45, 0.3, 1.8, 1.9, "2. Symptoms", "Voice / Checklist", "#2563eb", "02"),
        (4.6, 0.3, 1.8, 1.9, "3. Clinical Triage", "Hallmark Patterns", "#059669", "03"),
        (6.75, 0.3, 1.8, 1.9, "4. Risk & Score", "0-100 SVG Gauge", "#d97706", "04"),
        (8.9, 0.3, 1.8, 1.9, "5. Actionable Care", "PDF, Audio, OPD", "#7c3aed", "05")
    ]

    for (x, y, w, h, title, sub, color, icon) in steps:
        # Step Card
        card = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.08,rounding_size=0.15",
            ec=color, fc='#0f172a', lw=2, zorder=2
        )
        ax.add_patch(card)

        # Icon Circle
        circle = patches.Circle((x + w/2, y + h - 0.55), 0.32, facecolor=color, edgecolor='none', zorder=3)
        ax.add_patch(circle)
        ax.text(x + w/2, y + h - 0.55, icon, fontsize=10, fontweight='bold', color='#ffffff', ha='center', va='center', zorder=4)

        # Text
        ax.text(x + w/2, y + 0.65, title, fontsize=9.5, fontweight='bold', color='#ffffff', ha='center', zorder=4)
        ax.text(x + w/2, y + 0.32, sub, fontsize=8, color='#94a3b8', ha='center', zorder=4)

    # Connecting Arrows
    arrow_points = [(2.15, 1.25), (4.3, 1.25), (6.45, 1.25), (8.6, 1.25)]
    for (ax_x, ax_y) in arrow_points:
        ax.annotate(
            '', xy=(ax_x + 0.25, ax_y), xytext=(ax_x, ax_y),
            arrowprops=dict(facecolor='#00e5ff', edgecolor='#00e5ff', arrowstyle="->,head_width=0.3,head_length=0.35", lw=2.2),
            zorder=5
        )

    plt.tight_layout(pad=0.2)
    out_path = os.path.join(IMG_DIR, "process_flowchart.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Generated: {out_path}")
    return out_path

# -------------------------------------------------------------
# 3. GENERATE CORE FEATURES SHOWCASE GRAPHIC (300 DPI)
# -------------------------------------------------------------
def generate_features_showcase():
    fig, ax = plt.subplots(figsize=(11, 3.4), dpi=300)
    fig.patch.set_facecolor('#070d18')
    ax.set_facecolor('#070d18')
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 3.4)
    ax.axis('off')

    cards = [
        (0.3, 0.3, 2.4, 2.7, "Multilingual Voice", "[VOICE]", 
         ["• Natural voice input in Telugu, Hindi & English", "• Soft audio speech synthesis reader", "• High accessibility for rural & elderly users"], "#00e5ff"),
        (2.95, 0.3, 2.4, 2.7, "Risk & SVG Health Gauge", "[GAUGE]", 
         ["• Low / Medium / High clinical risk triage", "• 0-100 Wellness Index calculation", "• Vector SVG gauge: Zero black circle bugs"], "#00ffa3"),
        (5.6, 0.3, 2.4, 2.7, "Certified Clinical PDF", "[REPORT]", 
         ["• Official hospital letterhead & report ID", "• 2-Column nutrition plan (Eat vs Avoid)", "• Emergency alerts & doctor sign-off line"], "#38bdf8"),
        (8.25, 0.3, 2.45, 2.7, "OPD Token & Hospitals", "[ACCESS]", 
         ["• Instant digital OPD appointment booking", "• Auto-generated token slip with QR badge", "• Disease-specialty routing on Google Maps"], "#a78bfa")
    ]

    for (x, y, w, h, title, icon, bullets, color) in cards:
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.08,rounding_size=0.15",
            ec=color, fc='#0f172a', lw=1.8, zorder=2
        )
        ax.add_patch(rect)

        # Header Pill
        pill = patches.FancyBboxPatch(
            (x + 0.1, y + h - 0.65), w - 0.2, 0.55,
            boxstyle="round,pad=0.04,rounding_size=0.1",
            ec='none', fc='#1e293b', zorder=3
        )
        ax.add_patch(pill)

        ax.text(x + 0.18, y + h - 0.38, icon, fontsize=8.5, fontweight='bold', color='#38bdf8', va='center', zorder=4)
        ax.text(x + 0.85, y + h - 0.38, title, fontsize=9.2, fontweight='bold', color='#ffffff', va='center', zorder=4)

        b_y = y + h - 1.05
        for b in bullets:
            ax.text(x + 0.12, b_y, b, fontsize=7.8, color='#cbd5e1', va='center', zorder=4)
            b_y -= 0.52

    plt.tight_layout(pad=0.2)
    out_path = os.path.join(IMG_DIR, "features_showcase.png")
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Generated: {out_path}")
    return out_path

if __name__ == "__main__":
    generate_architecture_diagram()
    generate_process_flowchart()
    generate_features_showcase()
