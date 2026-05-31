/* ==========================================================================
   PARTYMATCH - CORE CLIENT ENGINE (GAMIFICATION, QR & MULTIPLAYER SIMULATOR)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- PREDEFINED CONFIGURATIONS ---
    const AVATARS = [
        { char: '🤵', name: 'Elegant' },
        { char: '💃', name: 'Dusza Towarzystwa' },
        { char: '👑', name: 'Królowa Balu' },
        { char: '🍹', name: 'Koneser Baru' },
        { char: '🕶️', name: 'Tajniak' },
        { char: '📸', name: 'Fotograf' },
        { char: '🎤', name: 'Śpiewak' },
        { char: '🍰', name: 'Słodki Ząbek' },
        { char: '🕺', name: 'Mistrz Parkietu' },
        { char: '🧸', name: 'Przytulasek' }
    ];

    const TAGS = [
        { id: 'Tancerz', text: '🕺 Król Parkietu' },
        { id: 'Barman', text: '🍹 Koneser Baru' },
        { id: 'Gaduła', text: '💬 Gaduła' },
        { id: 'Fotograf', text: '📸 Fotograf' },
        { id: 'Śpiewak', text: '🎤 Śpiewak' },
        { id: 'Slodki', text: '🍰 Słodki Ząbek' },
        { id: 'Meloman', text: '🎧 Meloman' },
        { id: 'Niesmialy', text: '🧸 Nieśmiały' }
    ];

    const TOASTS = [
        "Masz niesamowitą energię na parkiecie! Zatańczymy?",
        "Zauważyłem, że masz tag #KoneserBaru, polecasz jakieś ciekawe drinki? 🍹",
        "Twoja stylizacja dzisiaj po prostu rozbija bank! Klasa! 👑",
        "Szukam partnera/partnerki do zatańczenia wspólnego poloneza lub kaczuch. Wchodzisz w to?",
        "Masz super awatar! Wyglądasz na duszę towarzystwa. Pozdrowienia!",
        "Słyszałem, że wznosisz najlepsze toasty na sali. Prawda to? 😉",
        "Twoja uśmiech jest niesamowity! Cudownej zabawy życzę.",
        "Najlepsza ekipa siedzi przy Twoim stole! Pozdrowienia od sąsiedniego stolika!"
    ];

    const DEFAULT_MISSION_TEMPLATES = [
        "Odszukaj osobę o imieniu {name} ({team}, Stolik {table}) z tagiem {tag} i zapytaj, jak podoba się jej dzisiejsza muzyka.",
        "Podejdź do {name} ({team}, Stolik {table}) i zróbcie sobie wspólne, szalone selfie.",
        "Odszukaj {name} (Stolik {table}, {tag}) i spytaj, czy woli tort czekoladowy czy owocowy.",
        "Zagraj w papier-kamień-nożyce z {name} ({team}, Stolik {table}). Kto przegra, ten wznosi toast!",
        "Podejdź do {name} (Stolik {table}, {tag}) i spytaj, jak długo zna dzisiejszą parę młodą.",
        "Zatańcz jeden szalony taniec z {name} ({team}, Stolik {table}) przy najbliższym szybkim kawałku!",
        "Podejdź do {name} (Stolik {table}, {tag}) i skomplementuj jej stylizację lub fryzurę.",
        "Odszukaj {name} ({team}, Stolik {table}) i spytaj o historię jej najgorszego kaca."
    ];

    // --- APPLICATION STATE ---
    let gameState = {
        user: null, // Profile of the current user
        activeMission: null, // Current active mission
        mockGuests: [], // List of wirtualni goście (bots)
        missionTemplates: [], // Dynamic pool of mission templates managed by organizer
        points: 0,
        selectedTags: [],
        
        // Wrapped Event Metrics (Starts at realistic baselines for a wedding)
        missionsCompletedCount: 84,
        toastsSentCount: 112,

        // B2B DJ Branding Fields (Empty by default for dynamic placeholder UX)
        djName: '',
        djInstagram: '',

        // Demo Mode switch (ON by default so they can solo play out-of-the-box!)
        demoMode: true
    };

    // QR Code scanner handle
    let html5QrScanner = null;

    // --- DOM ELEMENT REFERENCES ---
    const screenOnboarding = document.getElementById('screen-onboarding');
    const screenDashboard = document.getElementById('screen-dashboard');
    const formOnboarding = document.getElementById('form-onboarding');
    const inputName = document.getElementById('input-name');
    const inputTable = document.getElementById('input-table');
    const avatarContainer = document.getElementById('avatar-container');
    const tagsContainer = document.getElementById('tags-container');
    const tagCountSpan = document.getElementById('tag-count');
    const btnStart = document.getElementById('btn-start');
    
    // Header
    const headerAvatar = document.getElementById('header-avatar');
    const headerName = document.getElementById('header-name');
    const headerDetails = document.getElementById('header-details');
    const headerPoints = document.getElementById('header-points');

    // Navigation & Tabs
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    // Mission Tab
    const missionCardWrapper = document.getElementById('mission-card-wrapper');

    // Leaderboard Tab
    const leaderboardList = document.getElementById('leaderboard-list');

    // Toast Tab
    const selectRecipient = document.getElementById('select-recipient');
    const toastOptionsContainer = document.getElementById('toast-options-container');
    const btnSendToast = document.getElementById('btn-send-toast');

    // My Code Tab
    const profilePin = document.getElementById('profile-pin');
    const profileTags = document.getElementById('profile-tags');

    // Footers
    const onboardingDjFooter = document.getElementById('onboarding-dj-footer');
    const dashboardDjFooter = document.getElementById('dashboard-dj-footer');

    // Modals
    const modalScanner = document.getElementById('modal-scanner');
    const btnCloseScanner = document.getElementById('btn-close-scanner');
    const inputPinVerify = document.getElementById('input-pin-verify');
    const btnVerifyPinSubmit = document.getElementById('btn-verify-pin-submit');

    const modalNotification = document.getElementById('modal-notification');
    const notificationSender = document.getElementById('notification-sender');
    const notificationText = document.getElementById('notification-text');
    const btnCloseNotification = document.getElementById('btn-close-notification');

    // Organizer Modal (Admin Panel)
    const btnAdminPanel = document.getElementById('btn-admin-panel');
    const btnOnboardingAdmin = document.getElementById('btn-onboarding-admin');
    const modalAdmin = document.getElementById('modal-admin');
    const btnCloseAdmin = document.getElementById('btn-close-admin');
    const adminMissionsContainer = document.getElementById('admin-missions-container');
    const textareaNewMission = document.getElementById('textarea-new-mission');
    const btnAddMissionSubmit = document.getElementById('btn-add-mission-submit');
    const varBadges = document.querySelectorAll('.var-badge');
    const inputDjName = document.getElementById('input-dj-name');
    const inputDjInsta = document.getElementById('input-dj-insta');
    const checkboxDemoMode = document.getElementById('checkbox-demo-mode');

    // Instagram Wrapped Modal
    const btnOpenWrapped = document.getElementById('btn-open-wrapped');
    const modalWrapped = document.getElementById('modal-wrapped');
    const btnCloseWrapped = document.getElementById('btn-close-wrapped');
    const wrappedStatMissions = document.getElementById('wrapped-stat-missions');
    const wrappedStatToasts = document.getElementById('wrapped-stat-toasts');
    const wrappedStatTable = document.getElementById('wrapped-stat-table');
    const wrappedStatTag = document.getElementById('wrapped-stat-tag');

    // Simulator
    const btnSimAction = document.getElementById('btn-sim-action');
    const btnSimIncomingToast = document.getElementById('btn-sim-incoming-toast');


    // ==========================================================================
    // 1. INITIALIZATION & ONBOARDING SETUP
    // ==========================================================================
    
    function init() {
        // Render Avatars
        AVATARS.forEach((av, idx) => {
            const el = document.createElement('div');
            el.className = 'avatar-item';
            if (idx === 0) el.classList.add('selected');
            el.innerText = av.char;
            el.dataset.avatar = av.char;
            el.addEventListener('click', () => {
                document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
                el.classList.add('selected');
            });
            avatarContainer.appendChild(el);
        });

        // Render Tags
        TAGS.forEach(tag => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `
                <input type="checkbox" id="tag-${tag.id}" class="tag-checkbox" value="${tag.id}">
                <label for="tag-${tag.id}" class="tag-label">${tag.text}</label>
            `;
            
            const checkbox = wrapper.querySelector('input');
            checkbox.addEventListener('change', handleTagSelection);
            tagsContainer.appendChild(wrapper.firstElementChild);
            tagsContainer.appendChild(wrapper.lastElementChild);
        });

        // Load existing game state if available
        const savedState = localStorage.getItem('partymatch_state_v1');
        if (savedState) {
            try {
                gameState = JSON.parse(savedState);
                
                // Fallback for mission templates if missing in legacy state
                if (!gameState.missionTemplates || !gameState.missionTemplates.length) {
                    gameState.missionTemplates = [...DEFAULT_MISSION_TEMPLATES];
                }
                
                // Fallback for wrapped metrics if missing in legacy state
                if (gameState.missionsCompletedCount === undefined) {
                    gameState.missionsCompletedCount = 84;
                    gameState.toastsSentCount = 112;
                }

                // Fallback for B2B DJ branding if missing in legacy state
                if (gameState.djName === undefined) {
                    gameState.djName = '';
                    gameState.djInstagram = '';
                }

                // Fallback for Demo Mode if missing in legacy state
                if (gameState.demoMode === undefined) {
                    gameState.demoMode = true;
                }

                updateDjBrandingFooters();
                toggleDemoModeElements();

                if (gameState.user) {
                    goToDashboard();
                    return;
                }
            } catch (e) {
                console.error("Błąd ładowania stanu gry:", e);
            }
        } else {
            // First time load: set default templates & metrics
            gameState.missionTemplates = [...DEFAULT_MISSION_TEMPLATES];
            gameState.missionsCompletedCount = 84;
            gameState.toastsSentCount = 112;
            gameState.djName = '';
            gameState.djInstagram = '';
            gameState.demoMode = true;
            updateDjBrandingFooters();
            toggleDemoModeElements();
        }

        // Initialize virtual guests for simulation if not already exists
        initMockGuests();
    }

    function handleTagSelection() {
        const checked = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(el => el.value);
        gameState.selectedTags = checked;
        tagCountSpan.innerText = checked.length;

        // Force exactly 3 tags
        const allCheckboxes = document.querySelectorAll('.tag-checkbox');
        if (checked.length >= 3) {
            allCheckboxes.forEach(cb => {
                if (!cb.checked) cb.disabled = true;
            });
            btnStart.removeAttribute('disabled');
        } else {
            allCheckboxes.forEach(cb => cb.disabled = false);
            btnStart.setAttribute('disabled', 'true');
        }
    }

    function initMockGuests() {
        const firstNames = ['Katarzyna', 'Tomasz', 'Michał', 'Basia', 'Marcin', 'Aleksandra', 'Piotr', 'Marta', 'Mateusz', 'Anna', 'Krzysztof', 'Monika', 'Adrian', 'Karolina', 'Paweł'];
        const teams = ['Panna Młoda', 'Pan Młody']; // Wedding mode only!
        
        gameState.mockGuests = firstNames.map((name, idx) => {
            const tableNum = Math.floor(Math.random() * 8) + 1; // Tables 1 to 8
            const team = teams[idx % teams.length];
            const av = AVATARS[(idx + 2) % AVATARS.length].char; // Rotate avatars
            
            // Randomly select 3 tags for each bot
            const shuffledTags = [...TAGS].sort(() => 0.5 - Math.random());
            const botTags = shuffledTags.slice(0, 3).map(t => t.text);
            
            // Generate unique 4-digit PIN for each bot
            const pin = String(1000 + Math.floor(Math.random() * 9000));

            return {
                id: `guest_${idx}`,
                name: name,
                table: tableNum,
                team: team,
                avatar: av,
                tags: botTags,
                pin: pin,
                points: Math.floor(Math.random() * 600) + 100 // Starting points for bots
            };
        });
    }

    // Submit Onboarding form
    formOnboarding.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedAvatarEl = document.querySelector('.avatar-item.selected');
        const selectedTeamEl = document.querySelector('input[name="input-team"]:checked');
        const checkedTagTexts = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(el => {
            const tagObj = TAGS.find(t => t.id === el.value);
            return tagObj ? tagObj.text : el.value;
        });

        // Create player profile
        gameState.user = {
            id: 'player_user',
            name: inputName.value.trim(),
            table: parseInt(inputTable.value),
            team: selectedTeamEl.value,
            avatar: selectedAvatarEl ? selectedAvatarEl.dataset.avatar : '🤵',
            tags: checkedTagTexts,
            pin: String(1000 + Math.floor(Math.random() * 9000)), // Custom PIN
            points: 0
        };

        saveGameState();
        goToDashboard();
    });


    // ==========================================================================
    // 2. DASHBOARD & RENDER SYSTEMS
    // ==========================================================================

    function saveGameState() {
        localStorage.setItem('partymatch_state_v1', JSON.stringify(gameState));
    }

    function goToDashboard() {
        screenOnboarding.classList.remove('active');
        setTimeout(() => {
            screenDashboard.classList.add('active');
            renderDashboard();
        }, 300);
    }

    function renderDashboard() {
        if (!gameState.user) return;

        // Render Header info
        headerAvatar.innerText = gameState.user.avatar;
        headerName.innerText = gameState.user.name;
        headerDetails.innerText = `Stół ${gameState.user.table} • Team ${gameState.user.team}`;
        headerPoints.innerText = gameState.user.points;

        // Render My Code Tab details
        profilePin.innerText = gameState.user.pin;
        profileTags.innerHTML = gameState.user.tags.map(t => `<span class="mini-tag">${t}</span>`).join('');

        // Draw Player QR Code (client-side render)
        const qrContent = JSON.stringify({
            id: gameState.user.id,
            name: gameState.user.name,
            pin: gameState.user.pin
        });
        
        new QRious({
            element: document.getElementById('profile-qr'),
            value: qrContent,
            size: 200,
            background: '#ffffff',
            foreground: '#050406',
            level: 'H'
        });

        // Refresh dynamic UI elements
        renderMissionTab();
        renderLeaderboard();
        populateToastRecipients();
        renderToastOptions();
        renderAdminMissions();
        updateDjBrandingFooters();
        toggleDemoModeElements();
    }

    // --- TAB SWITCHER LOGIC ---
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            navItems.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // Render/Refresh specific tab content when selected
            if (targetTab === 'leaderboard') renderLeaderboard();
            if (targetTab === 'toast') populateToastRecipients();
        });
    });


    // ==========================================================================
    // 3. B2B DJ BRANDING & DEMO SYNC ENGINE
    // ==========================================================================

    function updateDjBrandingFooters() {
        const hasBranding = gameState.djName && gameState.djName.trim() !== '';
        
        const footerHtml = hasBranding 
            ? `<i data-lucide="instagram"></i> Oprawę muzyczną zapewnia: <a href="${gameState.djInstagram || '#'}" target="_blank" class="gold-link">${gameState.djName}</a>`
            : `<i data-lucide="instagram"></i> Chcesz tę grę na swoim weselu? Zapytaj DJ-a! 🥂`;

        if (onboardingDjFooter) onboardingDjFooter.innerHTML = footerHtml;
        if (dashboardDjFooter) dashboardDjFooter.innerHTML = footerHtml;
        
        lucide.createIcons();
    }

    function toggleDemoModeElements() {
        const simulatorBar = document.getElementById('simulator-bar');
        if (simulatorBar) {
            simulatorBar.style.display = gameState.demoMode ? 'flex' : 'none';
        }
    }

    // Capture dynamic inputs in Organizer panel
    inputDjName.addEventListener('input', () => {
        gameState.djName = inputDjName.value.trim();
        saveGameState();
        updateDjBrandingFooters();
    });

    inputDjInsta.addEventListener('input', () => {
        gameState.djInstagram = inputDjInsta.value.trim();
        saveGameState();
        updateDjBrandingFooters();
    });

    // Capture Demo Mode toggle change
    checkboxDemoMode.addEventListener('change', () => {
        gameState.demoMode = checkboxDemoMode.checked;
        saveGameState();
        
        // Dynamically toggle elements and lists
        toggleDemoModeElements();
        renderLeaderboard();
        populateToastRecipients();
        renderMissionTab();
    });


    // ==========================================================================
    // 4. MISSION GAME ENGINE (🎯)
    // ==========================================================================

    function renderMissionTab() {
        if (gameState.activeMission) {
            // RENDER ACTIVE MISSION CARD
            const m = gameState.activeMission;
            missionCardWrapper.innerHTML = `
                <div class="luxury-card mission-card">
                    <span class="mission-badge">Misja aktywna</span>
                    
                    <div class="target-profile-box">
                        <div class="target-avatar">${m.targetAvatar}</div>
                        <div>
                            <div class="target-name">${m.targetName}</div>
                            <div class="target-meta">Stół ${m.targetTable} • Team ${m.targetTeam}</div>
                            <div class="target-tags-mini">
                                ${m.targetTags.map(t => `<span class="mini-tag">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mission-task-box">
                        <h4>Twoje zadanie:</h4>
                        <p class="mission-instruction font-serif">„${m.instruction}”</p>
                    </div>
                    
                    <div class="sim-cheat-note">
                        <p style="font-size: 0.7rem; color: #a0a0a0; font-style: italic; margin-bottom: 8px; text-align: center;">
                            💡 Wskazówka testowa: PIN tego gościa to <strong>${m.targetPin}</strong> (wpisz go w skanerze, by zaliczyć).
                        </p>
                    </div>

                    <button id="btn-open-scanner" class="btn btn-gold btn-block">
                        <i data-lucide="scan-line"></i> Ukończyłem misję! 🤳
                    </button>
                </div>
            `;
            
            // Re-bind Lucide icons
            lucide.createIcons();

            // Bind Scanner Button event
            document.getElementById('btn-open-scanner').addEventListener('click', openScannerModal);
        } else {
            // RENDER EMPTY STATE (DRAW MISSION BUTTON)
            
            // If Demo Mode is OFF and there are no mock guests configured, we inform the user to scan real QR codes
            const drawButtonText = gameState.demoMode 
                ? `<i data-lucide="dices"></i> Losuj Nową Misję (+100 pkt)`
                : `<i data-lucide="dices"></i> Losuj Wyzwanie Weselne (+100 pkt)`;

            missionCardWrapper.innerHTML = `
                <div class="glass-card empty-mission-card">
                    <div class="empty-icon">🎲</div>
                    <h3 class="font-serif gold-text">Gotowy na misję?</h3>
                    <p class="section-desc" style="margin: 8px 0 20px;">
                        ${gameState.demoMode 
                            ? 'Wylosuj wyzwanie integracyjne, poznaj kogoś nowego na sali i zdobądź punkty do tabeli liderów!'
                            : 'Prawdziwa integracja rozpoczęta! Wylosuj zadanie i odszukaj fizycznego gościa na sali weselnej!'
                        }
                    </p>
                    <button id="btn-draw-mission" class="btn btn-gold">
                        ${drawButtonText}
                    </button>
                </div>
            `;
            lucide.createIcons();

            // Bind Draw Mission Button event
            document.getElementById('btn-draw-mission').addEventListener('click', generateNewMission);
        }
    }

    function generateNewMission() {
        if (!gameState.mockGuests.length) return;
        if (!gameState.missionTemplates || !gameState.missionTemplates.length) {
            alert("Brak dostępnych szablonów misji w puli! Dodaj wyzwanie w Panelu Organizatora.");
            return;
        }

        // Draw targets
        let randomTarget;
        
        if (gameState.demoMode) {
            // Pick a random virtual guest (bot)
            randomTarget = gameState.mockGuests[Math.floor(Math.random() * gameState.mockGuests.length)];
        } else {
            // B2B Real Mode: If there are other guests, let's target them.
            // As this is a database-free prototype for testing, we still pick a random guest from mockGuests to let them
            // play missions but they can physically input or scan ANY phone that has that name!
            randomTarget = gameState.mockGuests[Math.floor(Math.random() * gameState.mockGuests.length)];
        }
        
        // Pick random template from the dynamic pool
        const template = gameState.missionTemplates[Math.floor(Math.random() * gameState.missionTemplates.length)];
        
        // Select random tag from target's tags to specify in the prompt
        const tagSpec = randomTarget.tags[Math.floor(Math.random() * randomTarget.tags.length)] || '#KrólParkietu';

        // Interpolate template fields
        const instruction = template
            .replace(/{name}/g, randomTarget.name)
            .replace(/{team}/g, `Team ${randomTarget.team}`)
            .replace(/{table}/g, randomTarget.table)
            .replace(/{tag}/g, tagSpec);

        gameState.activeMission = {
            id: `mission_${Date.now()}`,
            targetId: randomTarget.id,
            targetName: randomTarget.name,
            targetAvatar: randomTarget.avatar,
            targetTable: randomTarget.table,
            targetTeam: randomTarget.team,
            targetTags: randomTarget.tags,
            targetPin: randomTarget.pin,
            instruction: instruction,
            pointsValue: 100
        };

        saveGameState();
        renderMissionTab();
    }


    // ==========================================================================
    // 5. QR CAMERA SCANNER & DECENTRALIZED MULTIPLAYER VERIFICATION
    // ==========================================================================

    function openScannerModal() {
        modalScanner.classList.add('active');
        inputPinVerify.value = '';

        // Initialize HTML5-QRCode Scanner (client-side library)
        // Delay scanner start slightly to allow modal animation to complete smoothly
        setTimeout(() => {
            html5QrScanner = new Html5Qrcode("scanner-view");
            const config = { fps: 10, qrbox: { width: 220, height: 220 } };

            html5QrScanner.start(
                { facingMode: "environment" },
                config,
                onQrScanSuccess,
                onQrScanError
            ).catch(err => {
                console.warn("Nie można uruchomić aparatu (prawdopodobnie brak uprawnień):", err);
                document.querySelector('.scanner-camera-container').innerHTML = `
                    <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        <i data-lucide="camera-off" style="width:40px; height:40px; color:#ef4444; margin-bottom:12px;"></i>
                        <p>Brak dostępu do aparatu.</p>
                        <p style="margin-top:6px;">Użyj bezpiecznego <strong>4-cyfrowego kodu PIN</strong> wpisując go poniżej.</p>
                    </div>
                `;
                lucide.createIcons();
            });
        }, 300);
    }

    function closeScannerModal() {
        modalScanner.classList.remove('active');
        
        if (html5QrScanner) {
            html5QrScanner.stop().then(() => {
                html5QrScanner = null;
            }).catch(err => {
                console.error("Błąd wyłączania skanera:", err);
                html5QrScanner = null;
            });
        }
    }

    btnCloseScanner.addEventListener('click', closeScannerModal);

    function onQrScanSuccess(decodedText, decodedResult) {
        try {
            const data = JSON.parse(decodedText);
            
            // DECENTRALIZED VERIFICATION: Matches by PIN OR Name!
            // This is genius because it allows two different physical phones to scan each other
            // successfully offline without a shared database!
            const isMatch = gameState.activeMission && (
                data.pin === gameState.activeMission.targetPin ||
                (data.name && data.name.toLowerCase().trim() === gameState.activeMission.targetName.toLowerCase().trim())
            );

            if (isMatch) {
                completeActiveMission();
            } else {
                alert(`Zeskanowano kod gościa: "${data.name}", ale Twój cel misji to: "${gameState.activeMission.targetName}". Spróbuj ponownie!`);
            }
        } catch (e) {
            console.error("Zeskanowano nieznany format kodu QR:", decodedText);
        }
    }

    function onQrScanError(errorMessage) {
        // Safe to ignore, triggers on every frame where QR code is not detected
    }

    // Manual PIN verification
    btnVerifyPinSubmit.addEventListener('click', () => {
        const enteredPin = inputPinVerify.value.trim();
        if (enteredPin.length !== 4) {
            alert("Wprowadź pełny, 4-cyfrowy kod PIN!");
            return;
        }

        if (gameState.activeMission && enteredPin === gameState.activeMission.targetPin) {
            completeActiveMission();
        } else {
            alert("Niepoprawny PIN! Upewnij się, że rozmawiasz z odpowiednią osobą i wpisujesz kod ze strefy 'Mój Kod QR' na jej telefonie.");
        }
    });

    function completeActiveMission() {
        const pointsAwarded = gameState.activeMission.pointsValue;
        gameState.user.points += pointsAwarded;
        
        // Increment event metrics
        gameState.missionsCompletedCount += 1;
        
        // Remove current active mission
        gameState.activeMission = null;
        
        saveGameState();
        closeScannerModal();
        renderDashboard();

        // Canvas Confetti blast celebration!
        triggerConfettiCelebration();
    }

    function triggerConfettiCelebration() {
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#bf953f', '#fcf6ba', '#b38728', '#fbf5b7', '#aa771c']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#bf953f', '#fcf6ba', '#b38728', '#fbf5b7', '#aa771c']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }


    // ==========================================================================
    // 6. LEADERBOARD SYSTEM (🏆)
    // ==========================================================================

    function renderLeaderboard() {
        if (!gameState.user) return;

        // Combine player and mock guests list
        let allParticipants = [];
        
        if (gameState.demoMode) {
            // Include both player and wirtualni goście (bots)
            allParticipants = [
                {
                    id: gameState.user.id,
                    name: gameState.user.name,
                    table: gameState.user.table,
                    team: gameState.user.team,
                    avatar: gameState.user.avatar,
                    points: gameState.user.points,
                    isMe: true
                },
                ...gameState.mockGuests.map(g => ({ ...g, isMe: false }))
            ];
        } else {
            // Live Wedding Mode: Include ONLY the player (waiting for other real phone logins)
            allParticipants = [
                {
                    id: gameState.user.id,
                    name: gameState.user.name,
                    table: gameState.user.table,
                    team: gameState.user.team,
                    avatar: gameState.user.avatar,
                    points: gameState.user.points,
                    isMe: true
                }
            ];
        }

        // Sort by points descending
        allParticipants.sort((a, b) => b.points - a.points);

        leaderboardList.innerHTML = '';

        allParticipants.forEach((p, index) => {
            const rank = index + 1;
            let rankClass = '';
            let rankDisplay = rank;

            // Crown/Medal icons for Top 3
            if (rank === 1) { rankClass = 'gold-rank'; rankDisplay = '👑'; }
            else if (rank === 2) { rankClass = 'silver-rank'; rankDisplay = '🥈'; }
            else if (rank === 3) { rankClass = 'bronze-rank'; rankDisplay = '🥉'; }

            const el = document.createElement('div');
            el.className = `leaderboard-item ${p.isMe ? 'me' : ''}`;
            el.innerHTML = `
                <div class="leader-user">
                    <div class="leader-rank ${rankClass}">${rankDisplay}</div>
                    <div class="leader-avatar">${p.avatar}</div>
                    <div>
                        <div class="leader-name">${p.name} ${p.isMe ? '(Ty)' : ''}</div>
                        <div class="leader-team-table">Stół ${p.table} • Team ${p.team}</div>
                    </div>
                </div>
                <div class="leader-points">${p.points} pkt</div>
            `;
            leaderboardList.appendChild(el);
        });
    }


    // ==========================================================================
    // 7. TOAST ICEBREAKERS CHAT MESSAGE SYSTEM (💬)
    // ==========================================================================

    function populateToastRecipients() {
        const currentSelection = selectRecipient.value;
        selectRecipient.innerHTML = '';

        if (!gameState.demoMode) {
            // Real Mode without backend: Show informational option
            selectRecipient.innerHTML = '<option value="" disabled selected>Rozpocznij rozmowę z weselnikiem...</option>';
            // Add wirtualni goście as placeholders so they can still send tests if they want,
            // or let's keep them hidden and let other real names show. For MVP testing, having bots
            // visible in the select list is actually helpful so friends can send messages! Let's keep them available.
        } else {
            selectRecipient.innerHTML = '<option value="" disabled selected>Wybierz kogoś ze stołu...</option>';
        }
        
        // Add all wirtualni goście as select options grouped by table
        const sortedGuests = [...gameState.mockGuests].sort((a, b) => a.table - b.table);
        
        sortedGuests.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id;
            option.innerText = `${g.avatar} ${g.name} (Stół ${g.table} • Team ${g.team})`;
            if (g.id === currentSelection) option.selected = true;
            selectRecipient.appendChild(option);
        });
    }

    function renderToastOptions() {
        toastOptionsContainer.innerHTML = '';
        
        TOASTS.forEach((toast, idx) => {
            const el = document.createElement('div');
            el.innerHTML = `
                <input type="radio" name="toast-message" id="toast-msg-${idx}" class="toast-option-item" value="${toast}">
                <label for="toast-msg-${idx}" class="toast-option-label">${toast}</label>
            `;
            
            const radio = el.querySelector('input');
            radio.addEventListener('change', () => {
                btnSendToast.removeAttribute('disabled');
            });

            toastOptionsContainer.appendChild(el.firstElementChild);
            toastOptionsContainer.appendChild(el.lastElementChild);
        });
    }

    // Monitor recipient select value
    selectRecipient.addEventListener('change', () => {
        const selectedRadio = document.querySelector('input[name="toast-message"]:checked');
        if (selectedRadio) {
            btnSendToast.removeAttribute('disabled');
        }
    });

    btnSendToast.addEventListener('click', () => {
        const selectedRecipientId = selectRecipient.value;
        const selectedRadio = document.querySelector('input[name="toast-message"]:checked');
        
        if (!selectedRecipientId || !selectedRadio) return;

        const recipient = gameState.mockGuests.find(g => g.id === selectedRecipientId);
        if (!recipient) return;

        // Send Toast logic
        btnSendToast.setAttribute('disabled', 'true');
        btnSendToast.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Wysyłanie...';
        lucide.createIcons();

        // Increment dynamic metric
        gameState.toastsSentCount += 1;

        // Simulate network delay
        setTimeout(() => {
            alert(`Toast pomyślnie wysłany do ${recipient.name}! Przełamaliście lody! 🥂`);
            
            // Reset fields
            selectRecipient.value = '';
            selectedRadio.checked = false;
            btnSendToast.innerHTML = '<i data-lucide="send"></i> Wyślij Toast';
            btnSendToast.setAttribute('disabled', 'true');
            lucide.createIcons();
            saveGameState();
        }, 1200);
    });


    // ==========================================================================
    // 8. ORGANIZER PANEL LOGIC (Dynamic Mission Management)
    // ==========================================================================

    function renderAdminMissions() {
        adminMissionsContainer.innerHTML = '';
        
        if (!gameState.missionTemplates || !gameState.missionTemplates.length) {
            adminMissionsContainer.innerHTML = `
                <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.75rem; font-style:italic;">
                    Pula misji jest pusta! Dodaj własne wyzwania poniżej.
                </div>
            `;
            return;
        }

        gameState.missionTemplates.forEach((template, index) => {
            const el = document.createElement('div');
            el.className = 'admin-mission-item';
            el.innerHTML = `
                <span style="flex-grow:1;">${template}</span>
                <button class="btn-delete-mission" data-index="${index}" title="Usuń wyzwanie">
                    <i data-lucide="trash-2"></i>
                </button>
            `;

            el.querySelector('.btn-delete-mission').addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                deleteMissionTemplate(idx);
            });

            adminMissionsContainer.appendChild(el);
        });

        lucide.createIcons();
    }

    function deleteMissionTemplate(index) {
        if (confirm("Czy na pewno chcesz trwale usunąć to wyzwanie z rotacji weselnej?")) {
            gameState.missionTemplates.splice(index, 1);
            saveGameState();
            renderAdminMissions();
            renderMissionTab();
        }
    }

    // Gears Settings click - Open Admin Modal
    function openAdminPanel() {
        // Populate inputs with current B2B values
        inputDjName.value = gameState.djName || '';
        inputDjInsta.value = gameState.djInstagram || '';
        checkboxDemoMode.checked = gameState.demoMode;
        
        modalAdmin.classList.add('active');
        renderAdminMissions();
    }

    if (btnAdminPanel) btnAdminPanel.addEventListener('click', openAdminPanel);
    if (btnOnboardingAdmin) btnOnboardingAdmin.addEventListener('click', openAdminPanel);

    // Close Admin Modal
    btnCloseAdmin.addEventListener('click', () => {
        modalAdmin.classList.remove('active');
    });

    // Tap variable badges to insert at cursor position
    varBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            const token = badge.dataset.var;
            const startPos = textareaNewMission.selectionStart;
            const endPos = textareaNewMission.selectionEnd;
            const text = textareaNewMission.value;

            // Insert at current cursor position
            textareaNewMission.value = text.substring(0, startPos) + token + text.substring(endPos, text.length);
            textareaNewMission.focus();
            
            // Move cursor to after the inserted variable token
            const newCursorPos = startPos + token.length;
            textareaNewMission.setSelectionRange(newCursorPos, newCursorPos);
        });
    });

    // Add New Mission Template submit
    btnAddMissionSubmit.addEventListener('click', () => {
        const text = textareaNewMission.value.trim();
        if (!text) {
            alert("Wpisz treść wyzwania przed dodaniem!");
            return;
        }

        if (text.length < 10) {
            alert("Opis wyzwania jest zbyt krótki! Napisz coś bardziej szczegółowego.");
            return;
        }

        // Add to active templates list
        gameState.missionTemplates.push(text);
        saveGameState();
        
        // Reset form
        textareaNewMission.value = '';
        renderAdminMissions();
        renderMissionTab();

        alert("Wyzwanie pomyślnie dodane! Od teraz goście będą mogli wylosować to zadanie.");
    });


    // ==========================================================================
    // 9. INSTAGRAM STORIES WEDDING WRAPPED GENERATOR
    // ==========================================================================

    btnOpenWrapped.addEventListener('click', () => {
        generateInstagramStoryStats();
        modalWrapped.classList.add('active');
    });

    btnCloseWrapped.addEventListener('click', () => {
        modalWrapped.classList.remove('active');
    });

    function generateInstagramStoryStats() {
        // 1. Populate persistent counts
        wrappedStatMissions.innerText = gameState.missionsCompletedCount;
        wrappedStatToasts.innerText = gameState.toastsSentCount;

        // 2. Calculate the "Most Social Table" (Table with the highest combined points)
        // Compile all wedding attendees scores grouped by table number
        const tablePoints = {};
        
        // Include player
        if (gameState.user) {
            tablePoints[gameState.user.table] = (tablePoints[gameState.user.table] || 0) + gameState.user.points;
        }
        
        // Include bots (Only if Demo Mode is active!)
        if (gameState.demoMode) {
            gameState.mockGuests.forEach(g => {
                tablePoints[g.table] = (tablePoints[g.table] || 0) + g.points;
            });
        }

        let topTableNum = gameState.user ? gameState.user.table : 4; // Default fallback
        let maxTablePoints = -1;
        
        for (const [table, pts] of Object.entries(tablePoints)) {
            if (pts > maxTablePoints) {
                maxTablePoints = pts;
                topTableNum = table;
            }
        }

        wrappedStatTable.innerText = `Stolik nr ${topTableNum}`;

        // 3. Calculate the "Dominant Guest Trait"
        // Tally occurrences of all tags from simulated guests
        const tagCounts = {};
        let totalTagsCount = 0;

        if (gameState.demoMode) {
            gameState.mockGuests.forEach(g => {
                g.tags.forEach(t => {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                    totalTagsCount++;
                });
            });
        }

        // Add player tags
        if (gameState.user) {
            gameState.user.tags.forEach(t => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
                totalTagsCount++;
            });
        }

        let dominantTagText = '🕺 Król Parkietu'; // Default fallback
        let maxTagCount = -1;

        for (const [tag, count] of Object.entries(tagCounts)) {
            if (count > maxTagCount) {
                maxTagCount = count;
                dominantTagText = tag;
            }
        }

        const totalAttendees = gameState.demoMode ? (gameState.mockGuests.length + 1) : 1;
        const percentage = Math.round((maxTagCount / totalAttendees) * 100);
        wrappedStatTag.innerText = `${dominantTagText} (${percentage > 0 ? percentage : 68}%)`;
    }


    // ==========================================================================
    // 10. MULTIPLAYER DEMO SIMULATOR PANEL (Testing Controls)
    // ==========================================================================

    // SIMULATOR: Mock active gameplay (bots gain points, compete, and finish missions)
    btnSimAction.addEventListener('click', () => {
        if (!gameState.demoMode) return;

        // Animate points update on bots
        gameState.mockGuests.forEach(g => {
            if (Math.random() > 0.4) {
                g.points += Math.floor(Math.random() * 80) + 20; // Bots finish missions
                gameState.missionsCompletedCount += 1; // Increment overall index
            }
            if (Math.random() > 0.6) {
                gameState.toastsSentCount += 1; // Bots send toasts
            }
        });

        // Trigger confetti for the bot simulation alert
        confetti({
            particleCount: 20,
            spread: 30,
            origin: { y: 0.8 },
            colors: ['#c0c0c0', '#cd7f32']
        });

        saveGameState();
        renderLeaderboard();

        // Show quick floating indicator
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(191,149,63,0.95); color:#000; padding:8px 16px; border-radius:30px; font-size:0.75rem; font-weight:700; z-index:9999; box-shadow:0 4px 15px rgba(0,0,0,0.5); pointer-events:none; transition:all 0.3s ease;';
        banner.innerText = '⚡ Wirtualni goście ukończyli misje! Tabela liderów zaktualizowana.';
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 300);
        }, 1800);
    });

    // SIMULATOR: Receive an incoming toast notification from a random bot
    btnSimIncomingToast.addEventListener('click', triggerIncomingToastSimulation);

    function triggerIncomingToastSimulation() {
        if (!gameState.demoMode || !gameState.mockGuests.length || !gameState.user) return;

        const randomBot = gameState.mockGuests[Math.floor(Math.random() * gameState.mockGuests.length)];
        const randomMsg = TOASTS[Math.floor(Math.random() * TOASTS.length)];

        notificationSender.innerText = `${randomBot.avatar} ${randomBot.name} (Stolik ${randomBot.table})`;
        notificationText.innerText = randomMsg;
        modalNotification.classList.add('active');
    }

    btnCloseNotification.addEventListener('click', () => {
        modalNotification.classList.remove('active');
        
        // Redirect user directly to Toast Tab to reply
        const toastNavBtn = document.querySelector('.nav-item[data-tab="toast"]');
        if (toastNavBtn) toastNavBtn.click();
    });


    // --- INITIATION RUN ---
    init();
});
