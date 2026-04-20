document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       State & Elements
       ========================================================================== */
    const views = {
        login: document.getElementById('login-view'),
        dashboard: document.getElementById('dashboard-view')
    };

    const sections = {
        'analyzer-section': document.getElementById('analyzer-section'),
        'history-section': document.getElementById('history-section'),
        'insights-section': document.getElementById('insights-section')
    };

    const navBtns = document.querySelectorAll('.sidebar-nav .nav-btn');
    const currentSectionTitle = document.getElementById('current-section-title');
    
    // Analyzer Elements
    const reviewInput = document.getElementById('review-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultState = document.getElementById('result-state');
    
    // Result Display Elements
    const resultEmoji = document.getElementById('result-emoji');
    const resultBadge = document.getElementById('result-badge');
    const resultConfidence = document.getElementById('result-confidence');
    const resultTopics = document.getElementById('result-topics');

    // History Table
    const historyTableBody = document.getElementById('history-table-body');

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');

    /* ==========================================================================
       Mock Data
       ========================================================================== */
    let historyData = [
        { date: '2026-04-18', text: "The software is incredibly fast and saved our team hours of work.", sentiment: 'Positive', confidence: '0.98' },
        { date: '2026-04-17', text: "It's okay, but missing a few key features we need.", sentiment: 'Neutral', confidence: '0.65' },
        { date: '2026-04-16', text: "Terrible customer support. The app crashed twice today.", sentiment: 'Negative', confidence: '0.92' },
        { date: '2026-04-15', text: "Absolutely love the new UI update!", sentiment: 'Positive', confidence: '0.88' },
    ];

    /* ==========================================================================
       View Management
       ========================================================================== */
    // Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset scroll position to top
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        views.login.classList.remove('active');
        views.dashboard.classList.add('active');
        initCharts(); // Initialize charts when dashboard loads
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        views.dashboard.classList.remove('active');
        views.login.classList.add('active');
    });

    // Sidebar Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch section
            const targetId = btn.getAttribute('data-target');
            Object.values(sections).forEach(sec => sec.classList.remove('active'));
            sections[targetId].classList.add('active');

            // Update Header
            currentSectionTitle.textContent = btn.querySelector('span').textContent;
            
            // Close mobile menu if open
            if(window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    /* ==========================================================================
       Dark Mode Toggle
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark');
            themeIcon.classList.replace('ph-moon', 'ph-sun');
            Chart.defaults.color = '#94a3b8'; // text-muted in dark mode
        } else {
            document.body.classList.remove('dark');
            themeIcon.classList.replace('ph-sun', 'ph-moon');
            Chart.defaults.color = '#64748b'; // text-muted in light mode
        }
        
        // Update charts if they are already initialized
        if (chartsInitialized) {
            Chart.instances.forEach(chart => chart.update());
        }
    }

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        applyTheme(true);
    } else {
        applyTheme(false); // Default chart colors
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        applyTheme(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    /* ==========================================================================
       Analyzer Logic
       ========================================================================== */
    analyzeBtn.addEventListener('click', () => {
        const text = reviewInput.value.trim();
        if(!text) return;

        // Show Loading
        emptyState.classList.add('hidden');
        resultState.classList.add('hidden');
        loadingState.classList.remove('hidden');
        
        analyzeBtn.disabled = true;

        // Simulate API Call
        setTimeout(() => {
            const analysis = simulateAIAnalysis(text);
            displayResults(analysis);
            addToHistory(text, analysis);
            
            loadingState.classList.add('hidden');
            resultState.classList.remove('hidden');
            analyzeBtn.disabled = false;
        }, 1500);
    });

    function simulateAIAnalysis(text) {
        const lower = text.toLowerCase();
        
        const positiveWords = ['great', 'excellent', 'fast', 'love', 'good', 'amazing', 'best', 'perfect', 'easy'];
        const negativeWords = ['terrible', 'bad', 'slow', 'crash', 'worst', 'hard', 'poor', 'hate', 'bug'];
        
        let posCount = 0;
        let negCount = 0;
        
        positiveWords.forEach(w => { if(lower.includes(w)) posCount++; });
        negativeWords.forEach(w => { if(lower.includes(w)) negCount++; });
        
        let sentiment = 'Neutral';
        let emoji = '😐';
        let badgeClass = 'badge-neutral';
        let confidence = (0.5 + Math.random() * 0.2).toFixed(2);
        
        if (posCount > negCount) {
            sentiment = 'Positive';
            emoji = '😊';
            badgeClass = 'badge-positive';
            confidence = (0.8 + Math.random() * 0.19).toFixed(2);
        } else if (negCount > posCount) {
            sentiment = 'Negative';
            emoji = '😞';
            badgeClass = 'badge-negative';
            confidence = (0.75 + Math.random() * 0.2).toFixed(2);
        }

        // Mock topics
        const possibleTopics = ['UI/UX', 'Performance', 'Customer Support', 'Pricing', 'Features'];
        const numTopics = Math.floor(Math.random() * 2) + 1;
        const topics = [];
        for(let i=0; i<numTopics; i++) {
            topics.push(possibleTopics[Math.floor(Math.random() * possibleTopics.length)]);
        }

        return { sentiment, emoji, badgeClass, confidence, topics: [...new Set(topics)] };
    }

    function displayResults(data) {
        resultEmoji.textContent = data.emoji;
        
        resultBadge.textContent = data.sentiment;
        resultBadge.className = `sentiment-badge ${data.badgeClass}`;
        
        resultConfidence.textContent = data.confidence;
        
        resultTopics.innerHTML = '';
        data.topics.forEach(t => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = t;
            resultTopics.appendChild(span);
        });
    }

    /* ==========================================================================
       History Logic
       ========================================================================== */
    function renderHistory() {
        historyTableBody.innerHTML = '';
        historyData.forEach(item => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-neutral';
            if(item.sentiment === 'Positive') badgeClass = 'badge-positive';
            if(item.sentiment === 'Negative') badgeClass = 'badge-negative';

            tr.innerHTML = `
                <td>${item.date}</td>
                <td class="text-truncate" title="${item.text}">${item.text}</td>
                <td><span class="sentiment-badge ${badgeClass}">${item.sentiment}</span></td>
                <td>${item.confidence}</td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    function addToHistory(text, analysis) {
        const today = new Date().toISOString().split('T')[0];
        historyData.unshift({
            date: today,
            text: text,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence
        });
        renderHistory();
    }

    // Initial render
    renderHistory();

    /* ==========================================================================
       Charts (Insights)
       ========================================================================== */
    let chartsInitialized = false;

    function initCharts() {
        if(chartsInitialized) return;
        chartsInitialized = true;

        const pieCtx = document.getElementById('sentimentPieChart').getContext('2d');
        const barCtx = document.getElementById('keywordBarChart').getContext('2d');

        // Pie Chart
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Neutral', 'Negative'],
                datasets: [{
                    data: [1248, 384, 156],
                    backgroundColor: [
                        '#10b981', // Success
                        '#f59e0b', // Warning
                        '#ef4444'  // Danger
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '70%'
            }
        });

        // Bar Chart
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Fast', 'Easy', 'Bug', 'Price', 'Support', 'Crash'],
                datasets: [{
                    label: 'Mentions',
                    data: [420, 350, 210, 150, 120, 85],
                    backgroundColor: '#6366f1',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
});
