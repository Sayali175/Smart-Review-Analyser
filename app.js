document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       SAFE ELEMENT GETTER (prevents crashes)
    ========================================================================== */
    const $ = (id) => document.getElementById(id);

    /* ==========================================================================
       State & Elements
    ========================================================================== */
    const views = {
        login: $('login-view'),
        dashboard: $('dashboard-view')
    };

    const sections = {
        'analyzer-section': $('analyzer-section'),
        'history-section': $('history-section'),
        'insights-section': $('insights-section')
    };

    const navBtns = document.querySelectorAll('.sidebar-nav .nav-btn');
    const currentSectionTitle = $('current-section-title');

    // Analyzer Elements
    const reviewInput = $('review-input');
    const analyzeBtn = $('analyze-btn');
    const emptyState = $('empty-state');
    const loadingState = $('loading-state');
    const resultState = $('result-state');

    const resultEmoji = $('result-emoji');
    const resultBadge = $('result-badge');
    const resultConfidence = $('result-confidence');
    const resultTopics = $('result-topics');

    const historyTableBody = $('history-table-body');

    const mobileMenuBtn = $('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');

    /* ==========================================================================
       LOGIN / VIEW SWITCH
    ========================================================================== */
    const loginForm = $('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            views.login?.classList.remove('active');
            views.dashboard?.classList.add('active');

            initCharts();
        });
    }

    const logoutBtn = $('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            views.dashboard?.classList.remove('active');
            views.login?.classList.add('active');
        });
    }

    /* ==========================================================================
       NAVIGATION
    ========================================================================== */
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');

            Object.values(sections).forEach(sec => sec?.classList.remove('active'));
            sections[targetId]?.classList.add('active');

            if (currentSectionTitle) {
                currentSectionTitle.textContent = btn.querySelector('span')?.textContent || '';
            }

            if (window.innerWidth <= 768) {
                sidebar?.classList.remove('open');
            }
        });
    });

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
    }

    /* ==========================================================================
       ANALYZER LOGIC (FIXED)
    ========================================================================== */
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const text = reviewInput?.value.trim();

            if (!text) {
                alert("Please enter feedback");
                return;
            }

            console.log("Analyze clicked:", text);

            emptyState?.classList.add('hidden');
            resultState?.classList.add('hidden');
            loadingState?.classList.remove('hidden');

            analyzeBtn.disabled = true;

            setTimeout(() => {
                try {
                    const analysis = simulateAIAnalysis(text);

                    console.log("Analysis:", analysis);

                    displayResults(analysis);
                    addToHistory(text, analysis);

                    loadingState?.classList.add('hidden');
                    resultState?.classList.remove('hidden');

                } catch (err) {
                    console.error(err);
                    alert("Error processing sentiment");
                }

                analyzeBtn.disabled = false;
            }, 1000);
        });
    }

    /* ==========================================================================
       AI SIMULATION
    ========================================================================== */
    function simulateAIAnalysis(text) {
        const lower = text.toLowerCase();

        const positiveWords = ['great', 'excellent', 'fast', 'love', 'good', 'amazing', 'best', 'perfect', 'easy'];
        const negativeWords = ['terrible', 'bad', 'slow', 'crash', 'worst', 'hard', 'poor', 'hate', 'bug'];

        let pos = 0, neg = 0;

        positiveWords.forEach(w => { if (lower.includes(w)) pos++; });
        negativeWords.forEach(w => { if (lower.includes(w)) neg++; });

        let sentiment = 'Neutral';
        let emoji = '😐';
        let badgeClass = 'badge-neutral';
        let confidence = '0.60';

        if (pos > neg) {
            sentiment = 'Positive';
            emoji = '😊';
            badgeClass = 'badge-positive';
            confidence = '0.90';
        } else if (neg > pos) {
            sentiment = 'Negative';
            emoji = '😞';
            badgeClass = 'badge-negative';
            confidence = '0.85';
        }

        return {
            sentiment,
            emoji,
            badgeClass,
            confidence,
            topics: ['General']
        };
    }

    /* ==========================================================================
       DISPLAY RESULTS
    ========================================================================== */
    function displayResults(data) {
        if (!data) return;

        if (resultEmoji) resultEmoji.textContent = data.emoji;
        if (resultBadge) {
            resultBadge.textContent = data.sentiment;
            resultBadge.className = `sentiment-badge ${data.badgeClass}`;
        }
        if (resultConfidence) resultConfidence.textContent = data.confidence;

        if (resultTopics) {
            resultTopics.innerHTML = '';
            data.topics.forEach(t => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = t;
                resultTopics.appendChild(span);
            });
        }
    }

    /* ==========================================================================
       HISTORY
    ========================================================================== */
    let historyData = [];

    function renderHistory() {
        if (!historyTableBody) return;

        historyTableBody.innerHTML = '';

        historyData.forEach(item => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${item.date}</td>
                <td>${item.text}</td>
                <td>${item.sentiment}</td>
                <td>${item.confidence}</td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    function addToHistory(text, analysis) {
        const today = new Date().toISOString().split('T')[0];

        historyData.unshift({
            date: today,
            text,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence
        });

        renderHistory();
    }

    renderHistory();

    /* ==========================================================================
       CHARTS SAFE INIT
    ========================================================================== */
    let chartsInitialized = false;

    function initCharts() {
        if (chartsInitialized) return;
        chartsInitialized = true;

        if (typeof Chart === 'undefined') return;

        const pie = $('sentimentPieChart');
        const bar = $('keywordBarChart');

        if (!pie || !bar) return;

        new Chart(pie, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [10, 5, 3]
                }]
            }
        });

        new Chart(bar, {
            type: 'bar',
            data: {
                labels: ['Fast', 'Bug', 'Support'],
                datasets: [{
                    data: [10, 5, 3]
                }]
            }
        });
    }

});