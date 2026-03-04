document.addEventListener('DOMContentLoaded', () => {

    // --- State & Pricing Config ---
    const pricing = {
        setup: {
            creation: 5000,
            tier1: 1500,
            tier2: 2400,
            tier3: 0,
            subAgent: 500
        },
        recurring: {
            retainerStandard: 250,
            retainerEnterprise: 400,
            hosting: 100,
            addonReviews: 100
        }
    };

    let state = {
        infrastructure: 'integration',
        tier: 'tier2',
        subAgents: 0,
        hosting: 'devorise',
        retainer: 'standard',
        addonReviews: false
    };

    // --- DOM Elements ---
    const infraRadios = document.querySelectorAll('input[name="infrastructure"]');
    const tierRadios = document.querySelectorAll('input[name="tier"]');
    const hostingRadios = document.querySelectorAll('input[name="hosting"]');
    const retainerSelect = document.getElementById('retainer-tier');
    const addonReviewsToggle = document.getElementById('addon-reviews');
    const subAgentsInput = document.getElementById('sub-agents');
    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');

    const liInfra = document.getElementById('li-infra');
    const liSubagents = document.getElementById('li-subagents');
    const liHosting = document.getElementById('li-hosting');
    const liAddonReviews = document.getElementById('li-addon-reviews');
    const labelTier = document.getElementById('label-tier');
    const amountTier = document.getElementById('amount-tier');
    const countSubagents = document.getElementById('count-subagents');
    const amountSubagents = document.getElementById('amount-subagents');
    const labelRetainer = document.getElementById('label-retainer');
    const amountRetainer = document.getElementById('amount-retainer');
    const amountHosting = document.getElementById('amount-hosting');
    const totalSetup = document.getElementById('total-setup');
    const totalMonthly = document.getElementById('total-monthly');
    const btnDownload = document.getElementById('btn-download');

    const formatNumber = (num) => {
        if (num === 0 && state.tier === 'tier3') return "Custom Price";
        return new Intl.NumberFormat('en-US').format(num) + ' JOD';
    };

    // --- Calculate & Render ---
    const calculate = () => {
        let setupTotal = 0;
        if (state.infrastructure === 'creation') {
            liInfra.style.display = 'flex';
            setupTotal += pricing.setup.creation;
        } else {
            liInfra.style.display = 'none';
        }
        let tierCost = pricing.setup[state.tier];
        if (state.tier === 'tier1') labelTier.textContent = 'Basic AI Setup (Tier 1)';
        if (state.tier === 'tier2') labelTier.textContent = 'Advanced AI Setup (Tier 2)';
        if (state.tier === 'tier3') labelTier.textContent = 'Enterprise ML (Tier 3)';
        amountTier.textContent = state.tier === 'tier3' ? 'Custom Quote' : formatNumber(tierCost);
        setupTotal += tierCost;

        if (state.subAgents > 0) {
            liSubagents.style.display = 'flex';
            let subCost = state.subAgents * pricing.setup.subAgent;
            countSubagents.textContent = state.subAgents;
            amountSubagents.textContent = formatNumber(subCost);
            setupTotal += subCost;
        } else {
            liSubagents.style.display = 'none';
        }

        if (state.tier === 'tier3' && state.infrastructure !== 'creation' && state.subAgents === 0) {
            totalSetup.textContent = "Custom Quote";
        } else {
            totalSetup.textContent = formatNumber(setupTotal) + (state.tier === 'tier3' ? ' + ' : '');
        }

        let monthlyTotal = 0;
        if (state.retainer === 'standard') {
            labelRetainer.textContent = 'Standard Retainer';
            amountRetainer.textContent = formatNumber(pricing.recurring.retainerStandard);
            monthlyTotal += pricing.recurring.retainerStandard;
        } else {
            labelRetainer.textContent = 'Enterprise Retainer';
            amountRetainer.textContent = formatNumber(pricing.recurring.retainerEnterprise);
            monthlyTotal += pricing.recurring.retainerEnterprise;
        }

        if (state.hosting === 'devorise') {
            liHosting.style.display = 'flex';
            amountHosting.textContent = formatNumber(pricing.recurring.hosting);
            monthlyTotal += pricing.recurring.hosting;
        } else {
            liHosting.style.display = 'none';
        }

        if (state.addonReviews) {
            liAddonReviews.style.display = 'flex';
            monthlyTotal += pricing.recurring.addonReviews;
        } else {
            liAddonReviews.style.display = 'none';
        }
        totalMonthly.textContent = formatNumber(monthlyTotal) + ' / mo';
    };

    // --- Event Listeners ---
    infraRadios.forEach(r => r.addEventListener('change', e => { state.infrastructure = e.target.value; calculate(); }));
    tierRadios.forEach(r => r.addEventListener('change', e => { state.tier = e.target.value; calculate(); }));
    hostingRadios.forEach(r => r.addEventListener('change', e => { state.hosting = e.target.value; calculate(); }));
    retainerSelect.addEventListener('change', e => { state.retainer = e.target.value; calculate(); });
    addonReviewsToggle.addEventListener('change', e => { state.addonReviews = e.target.checked; calculate(); });
    btnMinus.addEventListener('click', () => { if (state.subAgents > 0) { state.subAgents--; subAgentsInput.value = state.subAgents; calculate(); } });
    btnPlus.addEventListener('click', () => { if (state.subAgents < 10) { state.subAgents++; subAgentsInput.value = state.subAgents; calculate(); } });

    // =============================================
    // MULTI-PAGE PROPOSAL PDF GENERATOR
    // Matches Marmara proposal design exactly
    // =============================================
    btnDownload.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();   // 210
        const H = doc.internal.pageSize.getHeight();   // 297
        const M = 18; // margin
        const CW = W - M * 2; // content width

        // --- Client Info ---
        const clientName = document.getElementById('client-name').value || 'Client Company';
        const clientContact = document.getElementById('client-contact').value || '';
        const clientTitle = document.getElementById('client-title').value || '';
        const clientIndustry = document.getElementById('client-industry').value || '';
        const clientDesc = document.getElementById('client-description').value || '';

        // --- Gather pricing data ---
        const tierNames = { tier1: 'Basic AI Agent (Tier 1)', tier2: 'Advanced AI Agent (Tier 2)', tier3: 'Enterprise ML (Tier 3)' };
        const tierCost = pricing.setup[state.tier];
        let setupTotal = (state.infrastructure === 'creation' ? pricing.setup.creation : 0) + tierCost + (state.subAgents * pricing.setup.subAgent);
        let monthlyTotal = state.retainer === 'standard' ? pricing.recurring.retainerStandard : pricing.recurring.retainerEnterprise;
        if (state.hosting === 'devorise') monthlyTotal += pricing.recurring.hosting;
        if (state.addonReviews) monthlyTotal += pricing.recurring.addonReviews;

        const channels = [];
        document.querySelectorAll('input[name="channels"]:checked').forEach(c => {
            const labels = { whatsapp: 'WhatsApp', website: 'Website', social: 'Social Media', internal: 'Internal Systems' };
            channels.push(labels[c.value] || c.value);
        });

        // --- Colors (matching Marmara / Company Profile) ---
        const TEAL = [0, 124, 138];
        const DARK_NAVY = [15, 32, 65];
        const WHITE = [255, 255, 255];
        const BLACK = [0, 0, 0];
        const GRAY = [120, 120, 120];
        const LIGHT_GRAY = [245, 245, 248];

        const today = new Date();
        const dateFormatted = today.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        const validUntil = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        const refNum = 'DAI-' + today.getFullYear().toString().slice(-2) + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 9000) + 1000);

        // --- HELPER FUNCTIONS (Marmara style) ---
        function drawPageHeader() {
            // Header banner from Marmara — navy bar with teal diagonal + network nodes
            if (typeof HEADER_BANNER !== 'undefined') {
                doc.addImage(HEADER_BANNER, 'PNG', 0, 0, W, 28);
            } else {
                doc.setFillColor(...DARK_NAVY);
                doc.rect(0, 0, W, 15, 'F');
                doc.setFillColor(...TEAL);
                doc.triangle(W - 50, 0, W, 0, W, 15, 'F');
            }
        }

        function drawPageFooter(pageNum, totalPages) {
            // Footer with contact bar from Marmara
            if (typeof FOOTER_BAR !== 'undefined') {
                doc.addImage(FOOTER_BAR, 'PNG', 0, H - 16, W, 16);
            } else {
                doc.setFillColor(250, 250, 252);
                doc.rect(0, H - 16, W, 16, 'F');
                doc.setFontSize(7);
                doc.setTextColor(...GRAY);
                doc.text('devorise.com  |  info@devorise.com  |  +962 7 9522 7489', W / 2, H - 7, { align: 'center' });
            }
            // Page number
            doc.setFontSize(7);
            doc.setTextColor(...GRAY);
            doc.text(`${pageNum} / ${totalPages}`, W - M, H - 4, { align: 'right' });
        }

        function sectionTitle(text, y) {
            doc.setFillColor(...TEAL);
            doc.roundedRect(M, y, CW, 10, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...WHITE);
            doc.text(text, M + 5, y + 7);
            return y + 14;
        }

        function paragraph(text, y, options = {}) {
            const fs = options.fontSize || 10;
            const bold = options.bold || false;
            const color = options.color || [40, 40, 40];
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setFontSize(fs);
            doc.setTextColor(...color);
            const lines = doc.splitTextToSize(text, CW - (options.indent || 0));
            doc.text(lines, M + (options.indent || 0), y);
            return y + lines.length * (fs * 0.45) + 2;
        }

        function bulletPoint(text, y) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(...TEAL);
            doc.text('•', M + 4, y);
            doc.setTextColor(40, 40, 40);
            const lines = doc.splitTextToSize(text, CW - 12);
            doc.text(lines, M + 10, y);
            return y + lines.length * 4.5 + 1.5;
        }

        const TOTAL_PAGES = 6;

        // ======================
        // PAGE 1: COVER PAGE (Marmara style)
        // ======================
        // Full-page dark cover with AI background
        if (typeof COVER_BG !== 'undefined') {
            doc.addImage(COVER_BG, 'PNG', 0, 0, W, H);
        } else {
            doc.setFillColor(...DARK_NAVY);
            doc.rect(0, 0, W, H, 'F');
        }
        // Dark overlay
        doc.setGState(new doc.GState({ opacity: 0.5 }));
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, W, H, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));

        // Vertical Devorise logo centered at top
        if (typeof LOGO_VERTICAL !== 'undefined') {
            doc.addImage(LOGO_VERTICAL, 'PNG', W / 2 - 22, 18, 44, 44);
        }

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(...WHITE);
        const titleText = `${clientName} AI Transformation`;
        const titleLines = doc.splitTextToSize(titleText, CW - 20);
        doc.text(titleLines, W / 2, 78, { align: 'center' });

        // Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(180, 200, 210);
        doc.text('Agentic AI Integration Package', W / 2, 92, { align: 'center' });

        // Teal divider
        doc.setFillColor(...TEAL);
        doc.rect(W / 2 - 25, 98, 50, 1.5, 'F');

        // Info cards — two side-by-side frosted glass cards
        const cardY = 110;
        const cardH = 38;
        const cardW = CW / 2 - 5;

        doc.setGState(new doc.GState({ opacity: 0.12 }));
        doc.setFillColor(...WHITE);
        doc.roundedRect(M, cardY, cardW, cardH, 4, 4, 'F');
        doc.roundedRect(M + cardW + 10, cardY, cardW, cardH, 4, 4, 'F');
        doc.setGState(new doc.GState({ opacity: 1 }));

        // Prepared For
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 180, 190);
        doc.text('Prepared For:', M + 6, cardY + 9);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...WHITE);
        doc.text(clientName, M + 6, cardY + 18);
        if (clientIndustry) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(160, 180, 190);
            doc.text(clientIndustry, M + 6, cardY + 25);
        }

        // Prepared By
        const bx = M + cardW + 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 180, 190);
        doc.text('Prepared By:', bx, cardY + 9);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...WHITE);
        doc.text('Devorise', bx, cardY + 18);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 180, 190);
        doc.text('Solutions Made Differently', bx, cardY + 25);

        // Date & Reference centered
        doc.setFontSize(8.5);
        doc.setTextColor(140, 160, 170);
        doc.text('Date: ' + dateFormatted, W / 2, 164, { align: 'center' });
        doc.text('Project Reference: ' + refNum, W / 2, 170, { align: 'center' });

        // Company Profile button
        const btnW = 90;
        const btnY = 182;
        doc.setFillColor(...TEAL);
        doc.roundedRect(W / 2 - btnW / 2, btnY, btnW, 12, 4, 4, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...WHITE);
        doc.text('View Company Profile !—', W / 2, btnY + 8, { align: 'center' });
        doc.link(W / 2 - btnW / 2, btnY, btnW, 12, { url: 'https://devoriseai.framer.website' });

        drawPageFooter(1, TOTAL_PAGES);

        // ======================
        // PAGE 2: COMPANY SUMMARY (condensed — Marmara style)
        // ======================
        doc.addPage();
        doc.setFillColor(...WHITE);
        doc.rect(0, 0, W, H, 'F');
        drawPageHeader();

        let y = 35;

        // Horizontal Devorise logo
        if (typeof LOGO_HORIZONTAL !== 'undefined') {
            doc.addImage(LOGO_HORIZONTAL, 'PNG', M, y, 55, 14);
        }
        y += 22;

        // Company Summary heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...BLACK);
        doc.text('Company Summary', M, y);
        y += 8;

        y = paragraph('Devorise is a dynamic and innovative company founded in 2023 with a mission to deliver cutting-edge solutions tailored to meet the evolving needs of businesses and consumers. Since its inception, Devorise has grown into a trusted name in AI agents, digital transformation, and business consulting, known for its commitment to excellence, creativity, and customer satisfaction.', y, { fontSize: 10 });
        y += 3;
        y = paragraph(`Today, Devorise specializes in AI services, software development, customer engagement solutions, and workflow automation, helping organizations streamline operations, enhance customer experience, and achieve sustainable growth. With a client-centric approach, we empower partners like ${clientName} to scale faster, reduce costs, and unlock new opportunities.`, y, { fontSize: 10 });
        y += 8;

        // Company Profile CTA button
        const profileBtnW = 100;
        doc.setFillColor(...TEAL);
        doc.roundedRect(M, y, profileBtnW, 14, 5, 5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...WHITE);
        doc.text('View Company Profile !—', M + profileBtnW / 2, y + 9.5, { align: 'center' });
        doc.link(M, y, profileBtnW, 14, { url: 'https://devoriseai.framer.website' });

        drawPageFooter(2, TOTAL_PAGES);

        // ======================
        // PAGE 3: PROPOSED SOLUTION
        // ======================
        doc.addPage();
        doc.setFillColor(...WHITE);
        doc.rect(0, 0, W, H, 'F');
        drawPageHeader();

        y = 35;
        y = sectionTitle('PROPOSED SOLUTION', y);
        y += 2;

        // Client-specific intro
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...DARK_NAVY);
        doc.text(`${clientName} — Agentic Customer Experience System`, M, y);
        y += 8;

        y = paragraph(`Our solution for ${clientName} is fully custom-tailored, exclusive, and delivered as a white-labeled system. AI agents will engage customers across selected channels, handle inquiries, check availability, collect data, and forward structured requests directly to your team.`, y);
        y += 2;

        y = paragraph('Impact: This hybrid approach balances automation and human oversight — AI agents streamline communication and information collection, while the internal team remains in control of the final decisions and customer relationship.', y, { fontSize: 9.5 });
        y += 4;

        if (clientDesc) {
            y = paragraph(clientDesc, y, { fontSize: 10 });
            y += 4;
        }

        // Dynamic solution based on channel selections
        const solutionComponents = [];

        if (channels.includes('WhatsApp')) {
            solutionComponents.push({
                title: 'AI WhatsApp Customer Experience & Support',
                items: [
                    'WhatsApp Channel Handling: Managing inquiries centrally with AI-powered responses.',
                    'Intent Recognition: Identifying service type, urgency, and requirements automatically.',
                    'Smart Booking Guidance: Guiding customers through structured booking steps.',
                    'Instant Quotation Logic: Calculating prices based on predefined rules.',
                    'Context Retention: Remembering customer history across conversations.',
                    'Smart Escalation: Routing complex requests with summarized context to staff.'
                ]
            });
        }
        if (channels.includes('Website')) {
            solutionComponents.push({
                title: 'Website Integration & Booking Intelligence',
                items: [
                    'Website Chat Widget: AI-powered live chat embedded on customer-facing pages.',
                    'Booking System Integration: Connecting with existing scheduling or CRM workflows.',
                    'Lead Capture Automation: Structured inquiry collection and qualification.',
                    'Real-Time Availability: Displaying service or slot availability dynamically.'
                ]
            });
        }
        if (channels.includes('Social Media')) {
            solutionComponents.push({
                title: 'Social Media & Meta Messaging Intelligence',
                items: [
                    'Meta Message Handling: AI-managed responses across Facebook Messenger and Instagram.',
                    'Unified Inbox: Centralized view of all social inquiries.',
                    'Automated FAQ Resolution: Resolving common questions without human intervention.',
                    'Engagement Analytics: Tracking response rates and customer satisfaction.'
                ]
            });
        }
        if (channels.includes('Internal Systems')) {
            solutionComponents.push({
                title: 'Internal Systems & ERP Augmentation',
                items: [
                    'CRM/ERP Intelligence Layer: Augmenting existing systems with AI-driven insights.',
                    'Automated Reporting: Generating operational summaries and performance dashboards.',
                    'Workflow Automation: Streamlining internal approval and routing processes.',
                    'Data Synchronization: Keeping all systems aligned in real-time.'
                ]
            });
        }

        if (solutionComponents.length === 0) {
            solutionComponents.push({
                title: 'AI Customer Experience & Operational Intelligence',
                items: [
                    'Intelligent Communication Handling: Managing customer inquiries across channels.',
                    'Intent Recognition: Identifying request type, urgency, and routing automatically.',
                    'Context Retention: Maintaining conversation history for personalized service.',
                    'Smart Escalation: Routing complex cases with AI-generated summaries.',
                    'Operational Analytics: Performance dashboards for management visibility.'
                ]
            });
        }

        solutionComponents.forEach((comp, idx) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(...DARK_NAVY);
            doc.text(`${idx + 1}. ${comp.title}`, M, y);
            y += 6;
            comp.items.forEach(item => {
                y = bulletPoint(item, y);
            });
            y += 3;
        });

        drawPageFooter(3, TOTAL_PAGES);

        // ======================
        // PAGE 3: IMPLEMENTATION ROADMAP
        // ======================
        doc.addPage();
        doc.setFillColor(...WHITE);
        doc.rect(0, 0, W, H, 'F');
        drawPageHeader();

        y = 35;
        y = sectionTitle('IMPLEMENTATION ROADMAP', y);
        y += 4;

        // Project Stages Infographic (from Marmara)
        if (typeof STAGES_INFOGRAPHIC !== 'undefined') {
            doc.addImage(STAGES_INFOGRAPHIC, 'JPEG', M + 5, y, CW - 10, 22);
            y += 28;
        }

        // Phase 1
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(M, y, CW, 62, 3, 3, 'F');
        doc.setDrawColor(...TEAL);
        doc.setLineWidth(1);
        doc.line(M, y, M, y + 62);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...TEAL);
        doc.text('Phase 1: Integration & Data Readiness', M + 6, y + 8);
        doc.setFillColor(...TEAL);
        doc.roundedRect(M + CW - 38, y + 2, 34, 7, 2, 2, 'F');
        doc.setFontSize(7.5);
        doc.setTextColor(...WHITE);
        doc.text('Week 1-2', M + CW - 36, y + 6.5);

        let py = y + 16;
        const p1Items = [
            'Define service logic, pricing rules, and communication standards',
            'Secure API access for selected channels and systems',
            'Map existing workflows and escalation paths',
            'Collect historical data and customer interaction patterns',
            'Architecture design and integration planning',
            'Team onboarding and access provisioning'
        ];
        p1Items.forEach(item => {
            doc.setFontSize(9);
            doc.setTextColor(...TEAL); doc.text('•', M + 8, py);
            doc.setTextColor(50, 50, 50); doc.text(item, M + 14, py);
            py += 5;
        });

        y += 70;

        // Phase 2
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(M, y, CW, 50, 3, 3, 'F');
        doc.setDrawColor(...TEAL);
        doc.line(M, y, M, y + 50);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...TEAL);
        doc.text('Phase 2: Agent Deployment & Execution', M + 6, y + 8);
        doc.setFillColor(...TEAL);
        doc.roundedRect(M + CW - 38, y + 2, 34, 7, 2, 2, 'F');
        doc.setFontSize(7.5);
        doc.setTextColor(...WHITE);
        doc.text('Week 3-4', M + CW - 36, y + 6.5);

        py = y + 16;
        const p2Items = [
            'Deploy and activate autonomous AI agents on live channels',
            'Launch core workflows: booking, support, escalation',
            'Refine conversational structures based on real usage',
            'Staff training on AI-assisted operations',
            'Monitored go-live under operational conditions'
        ];
        p2Items.forEach(item => {
            doc.setFontSize(9);
            doc.setTextColor(...TEAL); doc.text('•', M + 8, py);
            doc.setTextColor(50, 50, 50); doc.text(item, M + 14, py);
            py += 5;
        });

        y += 58;

        // Phase 3
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(M, y, CW, 50, 3, 3, 'F');
        doc.setDrawColor(...TEAL);
        doc.line(M, y, M, y + 50);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...TEAL);
        doc.text('Phase 3: Monitoring & Optimization', M + 6, y + 8);
        doc.setFillColor(...TEAL);
        doc.roundedRect(M + CW - 38, y + 2, 34, 7, 2, 2, 'F');
        doc.setFontSize(7.5);
        doc.setTextColor(...WHITE);
        doc.text('Ongoing', M + CW - 33, y + 6.5);

        py = y + 16;
        const p3Items = [
            'Performance dashboards: response times, conversions, load',
            'Monthly AI logic refinement based on operational feedback',
            'Accuracy improvement and friction reduction',
            'Scaling support as demand increases',
            'Regular reporting and strategic alignment reviews'
        ];
        p3Items.forEach(item => {
            doc.setFontSize(9);
            doc.setTextColor(...TEAL); doc.text('•', M + 8, py);
            doc.setTextColor(50, 50, 50); doc.text(item, M + 14, py);
            py += 5;
        });

        drawPageFooter(4, TOTAL_PAGES);

        // ======================
        // PAGE 4: INVESTING & PRICING
        // ======================
        doc.addPage();
        doc.setFillColor(...WHITE);
        doc.rect(0, 0, W, H, 'F');
        drawPageHeader();

        y = 35;
        y = sectionTitle('INVESTING & PRICING', y);
        y += 4;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...DARK_NAVY);
        doc.text(`${clientName} — Agentic AI Package`, M, y);
        y += 10;

        // Table
        const colWidths = [CW * 0.50, CW * 0.25, CW * 0.25];
        const colX = [M, M + colWidths[0], M + colWidths[0] + colWidths[1]];

        // Table header
        doc.setFillColor(...DARK_NAVY);
        doc.roundedRect(M, y, CW, 10, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...WHITE);
        doc.text('Component', colX[0] + 4, y + 7);
        doc.text('One-Time Setup', colX[1] + 4, y + 7);
        doc.text('Monthly Fee', colX[2] + 4, y + 7);
        y += 12;

        // Table rows
        const rows = [];
        if (state.infrastructure === 'creation') {
            rows.push(['System Creation (Custom Platform)', formatNumber(pricing.setup.creation), '—']);
        }
        rows.push([tierNames[state.tier], state.tier === 'tier3' ? 'Custom Quote' : formatNumber(tierCost), '—']);
        if (state.subAgents > 0) {
            rows.push([`Additional Sub-Agents (×${state.subAgents})`, formatNumber(state.subAgents * pricing.setup.subAgent), '—']);
        }
        const retainerLabel = state.retainer === 'standard' ? 'Standard AI Retainer' : 'Enterprise AI Retainer';
        const retainerCost = state.retainer === 'standard' ? pricing.recurring.retainerStandard : pricing.recurring.retainerEnterprise;
        rows.push([retainerLabel, '—', formatNumber(retainerCost)]);
        if (state.hosting === 'devorise') {
            rows.push(['Hosting & Infrastructure Mgmt', '—', formatNumber(pricing.recurring.hosting)]);
        }
        if (state.addonReviews) {
            rows.push(['Bulk Messaging & Reviews Add-on', '—', formatNumber(pricing.recurring.addonReviews)]);
        }

        rows.forEach((row, i) => {
            if (i % 2 === 0) {
                doc.setFillColor(...LIGHT_GRAY);
                doc.rect(M, y - 1, CW, 9, 'F');
            }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(40, 40, 40);
            doc.text(row[0], colX[0] + 4, y + 5);
            doc.text(row[1], colX[1] + 4, y + 5);
            doc.text(row[2], colX[2] + 4, y + 5);
            y += 9;
        });

        // Totals row
        doc.setFillColor(...DARK_NAVY);
        doc.roundedRect(M, y, CW, 12, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...WHITE);
        doc.text('Total', colX[0] + 4, y + 8.5);
        doc.setTextColor(0, 201, 167);
        const setupText = state.tier === 'tier3' ? 'Custom Quote' : formatNumber(setupTotal);
        doc.text(setupText, colX[1] + 4, y + 8.5);
        doc.text(formatNumber(monthlyTotal) + '/mo', colX[2] + 4, y + 8.5);
        y += 20;

        // Yearly option
        const yearlyTotal = monthlyTotal * 12;
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(M, y, CW, 14, 3, 3, 'F');
        doc.setDrawColor(...TEAL);
        doc.setLineWidth(0.5);
        doc.line(M, y, M, y + 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...DARK_NAVY);
        doc.text('Yearly Subscription Option:', M + 6, y + 6);
        doc.setTextColor(...TEAL);
        doc.text(formatNumber(yearlyTotal) + ' / year', M + 6, y + 12);
        y += 22;

        // API Usage note
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(M, y, CW, 22, 3, 3, 'F');
        doc.setDrawColor(...TEAL);
        doc.setLineWidth(0.5);
        doc.line(M, y, M, y + 22);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...DARK_NAVY);
        doc.text('+ Variable API Usage (Pay-As-You-Go)', M + 6, y + 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 100, 100);
        doc.text('Meta/WhatsApp & OpenAI Token costs + 20% Management Margin, billed monthly in arrears.', M + 6, y + 13);
        doc.text('Approx. ~$0.035/message, ~$10/1M tokens. Actual usage billed separately.', M + 6, y + 18);
        y += 30;

        // Pricing note
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(130, 130, 130);
        const pricingNote = 'Pricing and scope will be reviewed upon renewal based on operational scale, distribution, branch expansion, and system complexity.';
        doc.text(doc.splitTextToSize(pricingNote, CW), M, y);

        drawPageFooter(5, TOTAL_PAGES);

        // ======================
        // PAGE 5: TERMS & SIGNATURES
        // ======================
        doc.addPage();
        doc.setFillColor(...WHITE);
        doc.rect(0, 0, W, H, 'F');
        drawPageHeader();

        y = 35;
        y = sectionTitle('TERMS & CONDITIONS', y);
        y += 2;

        // Proposal Validity
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...DARK_NAVY);
        doc.text('Proposal Validity', M, y);
        y += 5;
        y = paragraph(`This proposal is valid until ${validUntil}. Pricing and resource availability are guaranteed through this date.`, y);
        y += 3;

        // Assumptions
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...DARK_NAVY);
        doc.text('Assumptions', M, y);
        y += 5;
        y = bulletPoint(`${clientName} will provide access to WhatsApp Business API/groups where the AI agent will operate.`, y);
        y = bulletPoint('Offers, packages, and pricing details will be shared to train the AI on accurate responses.', y);
        y = bulletPoint(`A single point of contact from ${clientName} will be assigned for communication, approvals, and decision-making.`, y);
        y += 3;

        // Client Responsibilities
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...DARK_NAVY);
        doc.text('Client Responsibilities', M, y);
        y += 5;
        y = bulletPoint('Provide updated offers, packages, and promotional content for AI responses.', y);
        y = bulletPoint('Approve and review conversation flows and automation logic in a timely manner.', y);
        y = bulletPoint('Ensure smooth coordination with internal stakeholders for testing and rollout.', y);
        y += 3;

        // Payment Terms
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...DARK_NAVY);
        doc.text('Payment Terms', M, y);
        y += 5;
        y = paragraph('50% of setup fee upon agreement signing. 50% upon Phase 2 deployment completion. Monthly recurring fees billed at the start of each calendar month.', y);

        // --- Agreement & Signatures ---
        y += 6;
        y = sectionTitle('AGREEMENT & SIGNATURES', y);
        y += 2;

        y = paragraph(`This proposal constitutes the full understanding between ${clientName} and Devorise regarding the implementation of the Agentic Customer Experience System.`, y);
        y += 8;

        // Two-column signature blocks
        const sigColW = CW / 2 - 5;

        // Devorise Side
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(M, y, sigColW, 55, 3, 3, 'F');

        // Logo in signature box
        if (typeof LOGO_HORIZONTAL !== 'undefined') {
            doc.addImage(LOGO_HORIZONTAL, 'PNG', M + 4, y + 3, 42, 10);
        } else {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...TEAL);
            doc.text('DEVORISE.', M + 6, y + 10);
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Name: Waseem Abu-Harb', M + 6, y + 22);
        doc.text('Title: Head of Sales Department', M + 6, y + 28);
        doc.text('Date: ' + dateFormatted, M + 6, y + 36);
        doc.text('Signature:', M + 6, y + 44);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.line(M + 30, y + 50, M + sigColW - 6, y + 50);

        // Client Side
        const cx = M + sigColW + 10;
        doc.setFillColor(...LIGHT_GRAY);
        doc.roundedRect(cx, y, sigColW, 55, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...TEAL);
        doc.text(clientName, cx + 6, y + 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Name: ' + (clientContact || '________________________'), cx + 6, y + 22);
        doc.text('Title: ' + (clientTitle || '________________________'), cx + 6, y + 28);
        doc.text('Date: ' + dateFormatted, cx + 6, y + 36);
        doc.text('Signature:', cx + 6, y + 44);
        doc.setDrawColor(180, 180, 180);
        doc.line(cx + 30, y + 50, cx + sigColW - 6, y + 50);

        drawPageFooter(6, TOTAL_PAGES);

        // --- SAVE ---
        const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
        const dateStr = today.toISOString().slice(0, 10);
        doc.save(`${safeName}_Proposal_${dateStr}.pdf`);

        const toast = document.getElementById('toast');
        toast.textContent = '✓ Proposal PDF Downloaded!';
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    });

    // Initial render
    calculate();
});
