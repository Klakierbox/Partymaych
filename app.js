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
    // 1. INITIALIZATION, ONBOARDING & SERVER API CONFIG
    // ==========================================================================
    
    const API_URL = "https://k-27lab.pl/partymatch/api.php";
    const inputNick = document.getElementById('input-nick');
    const modalDuplicate = document.getElementById('modal-duplicate');
    const dupModalName = document.getElementById('dup-modal-name');
    const dupModalNick = document.getElementById('dup-modal-nick');
    const btnDupExisting = document.getElementById('btn-dup-existing');
    const btnDupNew = document.getElementById('btn-dup-new');
    const activeGuestsContainer = document.getElementById('active-guests-container');

    // Helper function to query the PHP Hostido API
    async function apiFetch(action, method = 'GET', body = null) {
        try {
            const options = { method };
            if (body) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify(body);
            }
            const res = await fetch(`${API_URL}?action=${action}`, options);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(`[API Error] Action: ${action}`, e);
            return null;
        }
    }

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
                    // Sync immediately and go to dashboard
                    syncWithServer().then(() => {
                        goToDashboard();
                    });
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

        // Start background synchronization polling loop (runs every 10 seconds)
        setInterval(async () => {
            if (gameState.user) {
                await syncWithServer();
            }
        }, 10000);
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
                nick: name, // Default nickname matches name for bots
                table: tableNum,
                team: team,
                avatar: av,
                tags: botTags,
                pin: pin,
                points: Math.floor(Math.random() * 600) + 100 // Starting points for bots
            };
        });
    }

    // Dynamic background sync loop
    async function syncWithServer() {
        if (!gameState.user) return;
        
        // 1. Fetch active guest list from server
        const remoteGuests = await apiFetch('get_guests');
        if (remoteGuests && Array.isArray(remoteGuests)) {
            // Find my own updated profile on server
            const meRemote = remoteGuests.find(g => 
                g.name.toLowerCase().trim() === gameState.user.name.toLowerCase().trim() &&
                g.nick.toLowerCase().trim() === gameState.user.nick.toLowerCase().trim()
            );
            
            if (meRemote) {
                // Update local points if changed on server
                if (gameState.user.points !== meRemote.points) {
                    gameState.user.points = meRemote.points;
                    headerPoints.innerText = gameState.user.points;
                    saveGameState();
                }
            }
            
            // Render leaderboards and guest lists
            renderLeaderboard(remoteGuests);
            renderActiveGuestsList(remoteGuests);
            populateToastRecipients(remoteGuests);
        }
    }

    // Submit Onboarding form
    formOnboarding.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = inputName.value.trim();
        const nick = inputNick.value.trim();
        const selectedAvatarEl = document.querySelector('.avatar-item.selected');
        const selectedTeamEl = document.querySelector('input[name="input-team"]:checked');
        const checkedTagTexts = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(el => {
            const tagObj = TAGS.find(t => t.id === el.value);
            return tagObj ? tagObj.text : el.value;
        });

        // Query the server to see if a guest with this exact combination already exists
        btnStart.setAttribute('disabled', 'true');
        btnStart.innerHTML = '<i class="animate-spin">🔄</i> Sprawdzanie...';

        const checkRes = await apiFetch(`check_user&name=${encodeURIComponent(name)}&nick=${encodeURIComponent(nick)}`);
        
        btnStart.removeAttribute('disabled');
        btnStart.innerHTML = '<span>Wejdź do gry</span> <i data-lucide="arrow-right"></i>';
        lucide.createIcons();

        if (checkRes && checkRes.exists) {
            // Combination already exists: trigger duplicate account popup modal
            dupModalName.innerText = name;
            dupModalNick.innerText = nick;
            modalDuplicate.classList.add('active');
            
            // Store temporary profile data to register/restore on click
            modalDuplicate.dataset.name = name;
            modalDuplicate.dataset.nick = nick;
            modalDuplicate.dataset.table = inputTable.value;
            modalDuplicate.dataset.team = selectedTeamEl.value;
            modalDuplicate.dataset.avatar = selectedAvatarEl ? selectedAvatarEl.dataset.avatar : '🤵';
            modalDuplicate.dataset.tags = JSON.stringify(checkedTagTexts);
        } else {
            // Brand new registration
            await registerUserOnServer({
                name,
                nick,
                table: parseInt(inputTable.value),
                team: selectedTeamEl.value,
                avatar: selectedAvatarEl ? selectedAvatarEl.dataset.avatar : '🤵',
                tags: checkedTagTexts
            });
        }
    });

    // Helper to register user and navigate to dashboard
    async function registerUserOnServer(profile) {
        btnStart.setAttribute('disabled', 'true');
        
        const regRes = await apiFetch('register', 'POST', profile);
        
        if (regRes && regRes.status === 'success') {
            gameState.user = regRes.user;
            saveGameState();
            goToDashboard();
        } else {
            alert("Błąd rejestracji na serwerze! Sprawdź swoje połączenie.");
            btnStart.removeAttribute('disabled');
        }
    }

    // Modal Duplicate: "Tak, to ja! Powróć do gry" button
    btnDupExisting.addEventListener('click', async () => {
        const name = modalDuplicate.dataset.name;
        const nick = modalDuplicate.dataset.nick;
        
        modalDuplicate.classList.remove('active');
        btnStart.setAttribute('disabled', 'true');
        
        // Directly restore by triggering the register endpoint (acts as restore in PHP)
        const restoreRes = await apiFetch('register', 'POST', {
            name,
            nick,
            table: parseInt(modalDuplicate.dataset.table),
            team: modalDuplicate.dataset.team,
            avatar: modalDuplicate.dataset.avatar,
            tags: JSON.parse(modalDuplicate.dataset.tags)
        });
        
        if (restoreRes && restoreRes.status === 'success') {
            gameState.user = restoreRes.user;
            saveGameState();
            goToDashboard();
            
            // Alert user of successful account recovery
            alert(`Witaj z powrotem, ${nick}! Twoje punkty (${restoreRes.user.points}) zostały przywrócone! 🎉`);
        } else {
            alert("Nie udało się odzyskać konta. Spróbuj ponownie.");
            btnStart.removeAttribute('disabled');
        }
    });

    // Modal Duplicate: "Nie, jestem nowym uczestnikiem" button
    btnDupNew.addEventListener('click', () => {
        modalDuplicate.classList.remove('active');
        alert("To imię i nick są już zajęte na weselu! Zmień lekko swój Nick (np. dopisz pierwszą literę nazwiska lub liczbę), aby inni goście nie pomylili Was w misjach.");
        
        // Focus nickname input and highlight it to prompt change
        inputNick.focus();
        inputNick.style.borderColor = "var(--color-bride)";
        setTimeout(() => {
            inputNick.style.borderColor = "";
        }, 3000);
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
        headerName.innerText = gameState.user.nick; // Display nick in header
        headerDetails.innerText = `Stół ${gameState.user.table} • Team ${gameState.user.team}`;
        headerPoints.innerText = gameState.user.points;

        // Render My Profile details
        profilePin.innerText = `${gameState.user.name} (${gameState.user.nick})`; // Pin field replaced by full Name & Nick
        profileTags.innerHTML = gameState.user.tags.map(t => `<span class="mini-tag">${t}</span>`).join('');

        // Draw Player QR Code (contains name and nick for verification, NO PIN)
        const qrContent = JSON.stringify({
            id: gameState.user.id,
            name: gameState.user.name,
            nick: gameState.user.nick
        });
        
        new QRious({
            element: document.getElementById('profile-qr'),
            value: qrContent,
            size: 200,
            background: '#ffffff',
            foreground: '#050406',
            level: 'H'
        });

        // Trigger immediate sync to fetch other players
        syncWithServer();

        // Refresh dynamic UI elements
        renderMissionTab();
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

            // Trigger sync when Leaderboard or Toast tabs are opened
            if (targetTab === 'leaderboard' || targetTab === 'toast') {
                syncWithServer();
            }
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
        syncWithServer();
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
                            <div class="target-name">${m.targetNick}</div>
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
                            💡 Wskazówka: Zeskanuj kod gościa lub wpisz jego Nick (<strong>${m.targetNick}</strong>) w skanerze, by zaliczyć.
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
            const drawButtonText = `<i data-lucide="dices"></i> Losuj Wyzwanie Weselne (+100 pkt)`;

            missionCardWrapper.innerHTML = `
                <div class="glass-card empty-mission-card">
                    <div class="empty-icon">🎲</div>
                    <h3 class="font-serif gold-text">Gotowy na misję?</h3>
                    <p class="section-desc" style="margin: 8px 0 20px;">
                        Wylosuj wyzwanie integracyjne, poznaj kogoś nowego na sali i zdobądź punkty do tabeli liderów!
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

    async function generateNewMission() {
        if (!gameState.missionTemplates || !gameState.missionTemplates.length) {
            alert("Brak dostępnych szablonów misji w puli! Dodaj wyzwanie w Panelu Organizatora.");
            return;
        }

        let candidates = [];
        
        if (gameState.demoMode) {
            // Demo mode: use mock virtual bots
            candidates = [...gameState.mockGuests];
        } else {
            // Live multiplayer mode: retrieve real players registered on server
            const remoteGuests = await apiFetch('get_guests');
            if (remoteGuests && Array.isArray(remoteGuests)) {
                // Exclude myself from active targets
                candidates = remoteGuests.filter(g => 
                    g.name.toLowerCase().trim() !== gameState.user.name.toLowerCase().trim() ||
                    g.nick.toLowerCase().trim() !== gameState.user.nick.toLowerCase().trim()
                );
            }
        }

        if (!candidates.length) {
            alert(gameState.demoMode 
                ? "Brak gości do wylosowania!" 
                : "Nie ma jeszcze innych zalogowanych gości weselnych! Poczekaj, aż znajomi dołączą do zabawy na swoich telefonach."
            );
            return;
        }

        // Draw a target guest
        const randomTarget = candidates[Math.floor(Math.random() * candidates.length)];
        
        // Pick random template from the dynamic pool
        const template = gameState.missionTemplates[Math.floor(Math.random() * gameState.missionTemplates.length)];
        
        // Select random tag from target's tags to specify in the prompt
        const tagSpec = randomTarget.tags[Math.floor(Math.random() * randomTarget.tags.length)] || 'Król Parkietu';

        // Interpolate template fields
        const instruction = template
            .replace(/{name}/g, randomTarget.nick) // Display nickname in instruction
            .replace(/{team}/g, `Team ${randomTarget.team}`)
            .replace(/{table}/g, randomTarget.table)
            .replace(/{tag}/g, tagSpec);

        gameState.activeMission = {
            id: `mission_${Date.now()}`,
            targetId: randomTarget.id,
            targetName: randomTarget.name,
            targetNick: randomTarget.nick,
            targetAvatar: randomTarget.avatar,
            targetTable: randomTarget.table,
            targetTeam: randomTarget.team,
            targetTags: randomTarget.tags,
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
        setTimeout(() => {
            html5QrScanner = new Html5Qrcode("scanner-view");
            const config = { fps: 10, qrbox: { width: 220, height: 220 } };

            html5QrScanner.start(
                { facingMode: "environment" },
                config,
                onQrScanSuccess,
                onQrScanError
            ).catch(err => {
                console.warn("Nie można uruchomić aparatu:", err);
                document.querySelector('.scanner-camera-container').innerHTML = `
                    <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                        <i data-lucide="camera-off" style="width:40px; height:40px; color:#ef4444; margin-bottom:12px;"></i>
                        <p>Brak dostępu do aparatu.</p>
                        <p style="margin-top:6px;">Wpisz bezpiecznie **Nick gościa** na klawiaturze poniżej.</p>
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
            
            // Verify by comparing unique Nickname or full Name (NO PIN)
            const isMatch = gameState.activeMission && (
                data.nick.toLowerCase().trim() === gameState.activeMission.targetNick.toLowerCase().trim() ||
                data.name.toLowerCase().trim() === gameState.activeMission.targetName.toLowerCase().trim()
            );

            if (isMatch) {
                completeActiveMission();
            } else {
                alert(`Zeskanowano kod gościa: "${data.nick}", ale Twój cel to: "${gameState.activeMission.targetNick}".`);
            }
        } catch (e) {
            console.error("Nieznany format kodu QR:", decodedText);
        }
    }

    function onQrScanError(errorMessage) {}

    // Manual Nickname verification (Replaced PIN)
    btnVerifyPinSubmit.addEventListener('click', () => {
        const enteredNick = inputPinVerify.value.trim().toLowerCase();
        if (!enteredNick) {
            alert("Wpisz Nick gościa!");
            return;
        }

        if (gameState.activeMission && enteredNick === gameState.activeMission.targetNick.toLowerCase()) {
            completeActiveMission();
        } else {
            alert("Błędny Nick! Upewnij się, że wpisujesz poprawny przydomek szukanego gościa.");
        }
    });

    async function completeActiveMission() {
        const pointsAwarded = gameState.activeMission.pointsValue;
        gameState.user.points += pointsAwarded;
        
        // Increment metrics
        gameState.missionsCompletedCount += 1;
        
        // 1. Send scoring update to server API
        await apiFetch('add_points', 'POST', {
            name: gameState.user.name,
            nick: gameState.user.nick,
            points: pointsAwarded
        });

        // Remove active mission
        gameState.activeMission = null;
        
        saveGameState();
        closeScannerModal();
        
        // Sync with server immediately to update leaderboard
        await syncWithServer();
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
    // 6. LEADERBOARD & ACTIVE GUESTS DISPLAY SYSTEMS
    // ==========================================================================

    function renderLeaderboard(serverGuests = null) {
        if (!gameState.user) return;

        let allParticipants = [];
        
        if (gameState.demoMode) {
            // Combine local player, remote server guests, and virtual mock guests
            const remoteFiltered = (serverGuests || []).filter(rg => 
                rg.name.toLowerCase().trim() !== gameState.user.name.toLowerCase().trim()
            );
            
            allParticipants = [
                {
                    id: gameState.user.id,
                    name: gameState.user.name,
                    nick: gameState.user.nick,
                    table: gameState.user.table,
                    team: gameState.user.team,
                    avatar: gameState.user.avatar,
                    points: gameState.user.points,
                    isMe: true
                },
                ...remoteFiltered.map(g => ({ ...g, isMe: false })),
                ...gameState.mockGuests.map(g => ({ ...g, isMe: false }))
            ];
        } else {
            // Live multiplayer mode: use ONLY guests registered on server
            if (serverGuests && Array.isArray(serverGuests)) {
                allParticipants = serverGuests.map(g => {
                    const isMe = g.name.toLowerCase().trim() === gameState.user.name.toLowerCase().trim() &&
                               g.nick.toLowerCase().trim() === gameState.user.nick.toLowerCase().trim();
                    return { ...g, isMe };
                });
            } else {
                // Fallback to only myself if server list not yet loaded
                allParticipants = [
                    {
                        id: gameState.user.id,
                        name: gameState.user.name,
                        nick: gameState.user.nick,
                        table: gameState.user.table,
                        team: gameState.user.team,
                        avatar: gameState.user.avatar,
                        points: gameState.user.points,
                        isMe: true
                    }
                ];
            }
        }

        // Sort by points descending
        allParticipants.sort((a, b) => b.points - a.points);

        leaderboardList.innerHTML = '';

        allParticipants.forEach((p, index) => {
            const rank = index + 1;
            let rankClass = '';
            let rankDisplay = rank;

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
                        <div class="leader-name">${p.nick} ${p.isMe ? '(Ty)' : ''}</div>
                        <div class="leader-team-table">Stół ${p.table} • Team ${p.team}</div>
                    </div>
                </div>
                <div class="leader-points">${p.points} pkt</div>
            `;
            leaderboardList.appendChild(el);
        });
    }

    // Render the beautiful guest list under Leaderboard
    function renderActiveGuestsList(serverGuests = null) {
        if (!activeGuestsContainer) return;
        
        let allGuests = [];
        
        if (gameState.demoMode) {
            allGuests = [...gameState.mockGuests];
        } else if (serverGuests && Array.isArray(serverGuests)) {
            // Exclude myself from visual list
            allGuests = serverGuests.filter(g => 
                g.name.toLowerCase().trim() !== gameState.user.name.toLowerCase().trim() ||
                g.nick.toLowerCase().trim() !== gameState.user.nick.toLowerCase().trim()
            );
        }

        if (!allGuests.length) {
            activeGuestsContainer.innerHTML = `
                <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.8rem; font-style:italic;">
                    Nie ma jeszcze innych gości w grze. Opowiedz znajomym przy stoliku o grze! 🥂
                </div>
            `;
            return;
        }

        activeGuestsContainer.innerHTML = '';

        allGuests.forEach(g => {
            const el = document.createElement('div');
            el.style.cssText = 'background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); border-radius:12px; padding:10px 12px; display:flex; align-items:center; gap:12px; justify-content:space-between;';
            
            // Generate tags block
            const tagsHtml = g.tags.map(t => `<span class="mini-tag" style="font-size:0.6rem; padding:1px 4px; background:rgba(255,255,255,0.04);">${t}</span>`).join(' ');
            
            const teamBadgeClass = g.team === 'Panna Młoda' ? 'color-bride' : 'color-groom';
            const teamColor = g.team === 'Panna Młoda' ? 'var(--color-bride)' : 'var(--color-groom)';

            el.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="font-size:1.6rem; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.04); display:flex; justify-content:center; align-items:center;">${g.avatar}</div>
                    <div>
                        <div style="font-size:0.85rem; font-weight:600;">${g.nick} <span style="font-size:0.65rem; color:var(--text-muted); font-weight:300;">(${g.name})</span></div>
                        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
                            Stół <strong style="color:#fff;">${g.table}</strong> • <span style="color:${teamColor};">${g.team}</span>
                        </div>
                        <div style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
                <div style="font-size:0.75rem; color:var(--gold-text-color); font-weight:bold;">${g.points} pkt</div>
            `;
            
            activeGuestsContainer.appendChild(el);
        });
    }


    // ==========================================================================
    // 7. TOAST ICEBREAKERS CHAT MESSAGE SYSTEM (💬)
    // ==========================================================================

    function populateToastRecipients(serverGuests = null) {
        const currentSelection = selectRecipient.value;
        selectRecipient.innerHTML = '';

        selectRecipient.innerHTML = '<option value="" disabled selected>Rozpocznij rozmowę z weselnikiem...</option>';
        
        let targetList = [];
        if (gameState.demoMode) {
            targetList = [...gameState.mockGuests];
        } else if (serverGuests && Array.isArray(serverGuests)) {
            // Exclude myself
            targetList = serverGuests.filter(g => 
                g.name.toLowerCase().trim() !== gameState.user.name.toLowerCase().trim() ||
                g.nick.toLowerCase().trim() !== gameState.user.nick.toLowerCase().trim()
            );
        }
        
        // Sort grouped by table
        const sorted = [...targetList].sort((a, b) => a.table - b.table);
        
        sorted.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id || `remote_${g.name}_${g.nick}`;
            option.innerText = `${g.avatar} ${g.nick} (Stół ${g.table} • Team ${g.team})`;
            if (option.value === currentSelection) option.selected = true;
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

        // Get target name from dropdown text
        const selectedOptionText = selectRecipient.options[selectRecipient.selectedIndex].text;
        const targetCleanName = selectedOptionText.split(' ').slice(1, -2).join(' ') || 'Gościa';

        // Send Toast logic
        btnSendToast.setAttribute('disabled', 'true');
        btnSendToast.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Wysyłanie...';
        lucide.createIcons();

        // Increment dynamic metric
        gameState.toastsSentCount += 1;

        // Simulate network delay
        setTimeout(() => {
            alert(`Toast pomyślnie wysłany do: ${targetCleanName}! Przełamaliście lody! 🥂`);
            
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

            textareaNewMission.value = text.substring(0, startPos) + token + text.substring(endPos, text.length);
            textareaNewMission.focus();
            
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

        gameState.missionTemplates.push(text);
        saveGameState();
        
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

    async function generateInstagramStoryStats() {
        wrappedStatMissions.innerText = gameState.missionsCompletedCount;
        wrappedStatToasts.innerText = gameState.toastsSentCount;

        const tablePoints = {};
        
        if (gameState.user) {
            tablePoints[gameState.user.table] = (tablePoints[gameState.user.table] || 0) + gameState.user.points;
        }
        
        if (gameState.demoMode) {
            gameState.mockGuests.forEach(g => {
                tablePoints[g.table] = (tablePoints[g.table] || 0) + g.points;
            });
        } else {
            const remoteGuests = await apiFetch('get_guests');
            if (remoteGuests && Array.isArray(remoteGuests)) {
                remoteGuests.forEach(g => {
                    tablePoints[g.table] = (tablePoints[g.table] || 0) + g.points;
                });
            }
        }

        let topTableNum = gameState.user ? gameState.user.table : 4;
        let maxTablePoints = -1;
        
        for (const [table, pts] of Object.entries(tablePoints)) {
            if (pts > maxTablePoints) {
                maxTablePoints = pts;
                topTableNum = table;
            }
        }

        wrappedStatTable.innerText = `Stolik nr ${topTableNum}`;

        const tagCounts = {};
        let totalTagsCount = 0;

        if (gameState.user) {
            gameState.user.tags.forEach(t => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
                totalTagsCount++;
            });
        }

        if (gameState.demoMode) {
            gameState.mockGuests.forEach(g => {
                g.tags.forEach(t => {
                    tagCounts[t] = (tagCounts[t] || 0) + 1;
                    totalTagsCount++;
                });
            });
        } else {
            const remoteGuests = await apiFetch('get_guests');
            if (remoteGuests && Array.isArray(remoteGuests)) {
                remoteGuests.forEach(g => {
                    g.tags.forEach(t => {
                        tagCounts[t] = (tagCounts[t] || 0) + 1;
                        totalTagsCount++;
                    });
                });
            }
        }

        let dominantTagText = '🕺 Król Parkietu';
        let maxTagCount = -1;

        for (const [tag, count] of Object.entries(tagCounts)) {
            if (count > maxTagCount) {
                maxTagCount = count;
                dominantTagText = tag;
            }
        }

        let totalAttendees = 1;
        if (gameState.demoMode) {
            totalAttendees = gameState.mockGuests.length + 1;
        } else {
            const remoteGuests = await apiFetch('get_guests');
            totalAttendees = remoteGuests && Array.isArray(remoteGuests) ? remoteGuests.length : 1;
        }

        const percentage = Math.round((maxTagCount / totalAttendees) * 100);
        wrappedStatTag.innerText = `${dominantTagText} (${percentage > 0 ? percentage : 68}%)`;
    }


    // ==========================================================================
    // 10. MULTIPLAYER DEMO SIMULATOR PANEL (Testing Controls)
    // ==========================================================================

    btnSimAction.addEventListener('click', () => {
        if (!gameState.demoMode) return;

        gameState.mockGuests.forEach(g => {
            if (Math.random() > 0.4) {
                g.points += Math.floor(Math.random() * 80) + 20;
                gameState.missionsCompletedCount += 1;
            }
            if (Math.random() > 0.6) {
                gameState.toastsSentCount += 1;
            }
        });

        confetti({
            particleCount: 20,
            spread: 30,
            origin: { y: 0.8 },
            colors: ['#c0c0c0', '#cd7f32']
        });

        saveGameState();
        syncWithServer();

        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(191,149,63,0.95); color:#000; padding:8px 16px; border-radius:30px; font-size:0.75rem; font-weight:700; z-index:9999; box-shadow:0 4px 15px rgba(0,0,0,0.5); pointer-events:none; transition:all 0.3s ease;';
        banner.innerText = '⚡ Wirtualni goście ukończyli misje! Tabela liderów zaktualizowana.';
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 300);
        }, 1800);
    });

    btnSimIncomingToast.addEventListener('click', triggerIncomingToastSimulation);

    function triggerIncomingToastSimulation() {
        if (!gameState.demoMode || !gameState.mockGuests.length || !gameState.user) return;

        const randomBot = gameState.mockGuests[Math.floor(Math.random() * gameState.mockGuests.length)];
        const randomMsg = TOASTS[Math.floor(Math.random() * TOASTS.length)];

        notificationSender.innerText = `${randomBot.avatar} ${randomBot.nick} (Stolik ${randomBot.table})`;
        notificationText.innerText = randomMsg;
        modalNotification.classList.add('active');
    }

    btnCloseNotification.addEventListener('click', () => {
        modalNotification.classList.remove('active');
        
        const toastNavBtn = document.querySelector('.nav-item[data-tab="toast"]');
        if (toastNavBtn) toastNavBtn.click();
    });


    // --- INITIATION RUN ---
    init();
});
