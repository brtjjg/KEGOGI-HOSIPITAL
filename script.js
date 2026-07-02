document.addEventListener('DOMContentLoaded', function() {

    // ─── CONSTANTS ───
    const ADMIN_PASSWORD = 'admin123'; // change this to your desired password
    const STORAGE_KEYS = {
        patients: 'kegogi_patients',
        workers: 'kegogi_workers',
        visitors: 'kegogi_visitors'
    };

    // ─── HELPERS ───
    function getData(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    function setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleString('en-KE', { hour12: false });
    }

    function getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    // ─── TOAST SYSTEM ───
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    let toastTimer;

    function showToast(msg, isError = false) {
        clearTimeout(toastTimer);
        toastMsg.textContent = msg;
        toast.querySelector('i').className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        toast.querySelector('i').style.color = isError ? '#f87171' : '#4ade80';
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // ─── NAVIGATION & HAMBURGER ───
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('open');
        const icon = this.querySelector('i');
        icon.className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('open');
            document.querySelector('#hamburger i').className = 'fas fa-bars';
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ─── SCROLL FADE-UP ───
    const fadeEls = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => observer.observe(el));

    // ─── PUBLIC FORMS (Appointment & Contact) ───
    const apptForm = document.getElementById('appointmentForm');
    apptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('patientName').value.trim();
        const email = document.getElementById('patientEmail').value.trim();
        const phone = document.getElementById('patientPhone').value.trim();
        const date = document.getElementById('patientDate').value;
        if (!name || !email || !phone || !date) {
            showToast('Please fill in all required fields.', true);
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Please enter a valid email address.', true);
            return;
        }
        showToast(`Thank you, ${name}! Your appointment request has been sent.`);
        apptForm.reset();
    });

    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const msg = document.getElementById('contactMsg').value.trim();
        if (!name || !email || !msg) {
            showToast('Please fill in all required fields.', true);
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Please enter a valid email address.', true);
            return;
        }
        showToast(`Thanks, ${name}! Your message has been received.`);
        contactForm.reset();
    });

    // ─── ACTIVE NAV ON SCROLL ───
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPos = window.pageYOffset + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // ─── PASSWORD MODAL ───
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordCancel = document.getElementById('passwordCancel');
    const passwordError = document.getElementById('passwordError');

    let pendingOpen = false;

    function openPasswordModal() {
        passwordModal.classList.add('active');
        passwordInput.value = '';
        passwordError.style.display = 'none';
        passwordInput.focus();
        pendingOpen = true;
    }

    function closePasswordModal() {
        passwordModal.classList.remove('active');
        pendingOpen = false;
    }

    function verifyPassword() {
        const entered = passwordInput.value.trim();
        if (entered === ADMIN_PASSWORD) {
            closePasswordModal();
            openDashboard();
        } else {
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    passwordSubmit.addEventListener('click', verifyPassword);
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') verifyPassword();
    });
    passwordCancel.addEventListener('click', closePasswordModal);

    // ─── ADMIN DASHBOARD TOGGLE ───
    const adminToggle = document.getElementById('adminToggle');
    const dashboardOverlay = document.getElementById('dashboardOverlay');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const dashClose = document.getElementById('dashClose');

    function openDashboard() {
        dashboardOverlay.classList.add('active');
        dashboardContainer.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderAllTables();
        updateStats();
    }

    function closeDashboard() {
        dashboardOverlay.classList.remove('active');
        dashboardContainer.classList.remove('open');
        document.body.style.overflow = '';
    }

    adminToggle.addEventListener('click', function(e) {
        e.preventDefault();
        openPasswordModal();
    });

    dashClose.addEventListener('click', closeDashboard);
    dashboardOverlay.addEventListener('click', closeDashboard);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dashboardContainer.classList.contains('open')) {
            closeDashboard();
        }
        if (e.key === 'Escape' && passwordModal.classList.contains('active')) {
            closePasswordModal();
        }
    });

    // ─── DASHBOARD TABS ───
    const tabButtons = document.querySelectorAll('.dash-tab');
    const tabContents = document.querySelectorAll('.dash-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
            // Re-render tables when switching to data tabs
            if (tabId === 'patients') renderPatientTable();
            if (tabId === 'workers') renderWorkerTable();
            if (tabId === 'visitors') renderVisitorTable();
            if (tabId === 'dashboard') { renderRecentPatients(); updateStats(); }
        });
    });

    // ─── PATIENT FUNCTIONS ───
    function registerPatient(name, phone, age, kin, kinPhone) {
        const patients = getData(STORAGE_KEYS.patients);
        const newPatient = {
            id: generateId(),
            name: name.trim(),
            phone: phone.trim(),
            age: parseInt(age),
            nextOfKin: kin.trim(),
            kinContact: kinPhone.trim(),
            timeIn: getCurrentDateTime(),
            timeOut: null,
            checkedOut: false
        };
        patients.push(newPatient);
        setData(STORAGE_KEYS.patients, patients);
        return newPatient;
    }

    function checkOutPatient(patientId) {
        const patients = getData(STORAGE_KEYS.patients);
        const patient = patients.find(p => p.id === patientId);
        if (patient && !patient.checkedOut) {
            patient.timeOut = getCurrentDateTime();
            patient.checkedOut = true;
            setData(STORAGE_KEYS.patients, patients);
            return true;
        }
        return false;
    }

    function getPatients() {
        return getData(STORAGE_KEYS.patients);
    }

    // ─── WORKER FUNCTIONS ───
    function registerWorker(name, role) {
        const workers = getData(STORAGE_KEYS.workers);
        const newWorker = {
            id: generateId(),
            name: name.trim(),
            role: role.trim() || 'Staff',
            timeIn: getCurrentDateTime(),
            timeOut: null,
            checkedOut: false
        };
        workers.push(newWorker);
        setData(STORAGE_KEYS.workers, workers);
        return newWorker;
    }

    function checkOutWorker(workerId) {
        const workers = getData(STORAGE_KEYS.workers);
        const worker = workers.find(w => w.id === workerId);
        if (worker && !worker.checkedOut) {
            worker.timeOut = getCurrentDateTime();
            worker.checkedOut = true;
            setData(STORAGE_KEYS.workers, workers);
            return true;
        }
        return false;
    }

    function getWorkers() {
        return getData(STORAGE_KEYS.workers);
    }

    // ─── VISITOR FUNCTIONS ───
    function registerVisitor(name, phone, purpose) {
        const visitors = getData(STORAGE_KEYS.visitors);
        const newVisitor = {
            id: generateId(),
            name: name.trim(),
            phone: phone.trim(),
            purpose: purpose.trim(),
            timeIn: getCurrentDateTime(),
            timeOut: null,
            checkedOut: false
        };
        visitors.push(newVisitor);
        setData(STORAGE_KEYS.visitors, visitors);
        return newVisitor;
    }

    function checkOutVisitor(visitorId) {
        const visitors = getData(STORAGE_KEYS.visitors);
        const visitor = visitors.find(v => v.id === visitorId);
        if (visitor && !visitor.checkedOut) {
            visitor.timeOut = getCurrentDateTime();
            visitor.checkedOut = true;
            setData(STORAGE_KEYS.visitors, visitors);
            return true;
        }
        return false;
    }

    function getVisitors() {
        return getData(STORAGE_KEYS.visitors);
    }

    // ─── RENDER FUNCTIONS ───
    function renderPatientTable() {
        const patients = getPatients();
        const tbody = document.getElementById('patientTableBody');
        const countBadge = document.getElementById('patientCount');
        countBadge.textContent = patients.length;

        if (patients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--gray);">No patients registered yet.</td></tr>`;
            return;
        }

        let html = '';
        patients.forEach((p, index) => {
            const status = p.checkedOut ? '✅ Checked Out' : '🕒 Checked In';
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.name}</td>
                    <td>${p.age}</td>
                    <td>${p.nextOfKin}</td>
                    <td>${p.kinContact}</td>
                    <td>${p.timeIn}</td>
                    <td>${p.timeOut || '—'}</td>
                    <td>
                        ${!p.checkedOut ? `<button class="btn btn-secondary btn-sm checkout-patient" data-id="${p.id}">Check Out</button>` : '✅ Done'}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        // Attach event listeners to checkout buttons
        document.querySelectorAll('.checkout-patient').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (checkOutPatient(id)) {
                    showToast('Patient checked out successfully.');
                    renderPatientTable();
                    updateStats();
                    renderRecentPatients();
                } else {
                    showToast('Patient already checked out.', true);
                }
            });
        });
    }

    function renderWorkerTable() {
        const workers = getWorkers();
        const tbody = document.getElementById('workerTableBody');
        const countBadge = document.getElementById('workerCount');
        countBadge.textContent = workers.length;

        if (workers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--gray);">No workers registered.</td></tr>`;
            return;
        }

        let html = '';
        workers.forEach((w, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${w.name}</td>
                    <td>${w.role}</td>
                    <td>${w.timeIn}</td>
                    <td>${w.timeOut || '—'}</td>
                    <td>
                        ${!w.checkedOut ? `<button class="btn btn-secondary btn-sm checkout-worker" data-id="${w.id}">Check Out</button>` : '✅ Done'}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        document.querySelectorAll('.checkout-worker').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (checkOutWorker(id)) {
                    showToast('Worker checked out successfully.');
                    renderWorkerTable();
                    updateStats();
                } else {
                    showToast('Worker already checked out.', true);
                }
            });
        });
    }

    function renderVisitorTable() {
        const visitors = getVisitors();
        const tbody = document.getElementById('visitorTableBody');
        const countBadge = document.getElementById('visitorCount');
        countBadge.textContent = visitors.length;

        if (visitors.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--gray);">No visitors logged.</td></tr>`;
            return;
        }

        let html = '';
        visitors.forEach((v, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${v.name}</td>
                    <td>${v.phone}</td>
                    <td>${v.purpose}</td>
                    <td>${v.timeIn}</td>
                    <td>${v.timeOut || '—'}</td>
                    <td>
                        ${!v.checkedOut ? `<button class="btn btn-secondary btn-sm checkout-visitor" data-id="${v.id}">Check Out</button>` : '✅ Done'}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        document.querySelectorAll('.checkout-visitor').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (checkOutVisitor(id)) {
                    showToast('Visitor checked out successfully.');
                    renderVisitorTable();
                    updateStats();
                } else {
                    showToast('Visitor already checked out.', true);
                }
            });
        });
    }

    function renderRecentPatients() {
        const patients = getPatients();
        const tbody = document.getElementById('recentPatients');
        // Show last 5 (most recent) – we can sort by timeIn descending
        const sorted = patients.slice().sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn));
        const recent = sorted.slice(0, 5);
        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--gray);">No recent activity.</td></tr>`;
            return;
        }
        let html = '';
        recent.forEach(p => {
            const status = p.checkedOut ? '✅ Out' : '🕒 In';
            html += `<tr><td>${p.name}</td><td>${p.timeIn}</td><td>${status}</td></tr>`;
        });
        tbody.innerHTML = html;
    }

    function updateStats() {
        const patients = getPatients();
        const workers = getWorkers();
        const total = patients.length;
        const checkedIn = patients.filter(p => !p.checkedOut).length;
        const checkedOut = patients.filter(p => p.checkedOut).length;
        document.getElementById('totalPatients').textContent = total;
        document.getElementById('checkedInPatients').textContent = checkedIn;
        document.getElementById('checkedOutPatients').textContent = checkedOut;
        document.getElementById('totalWorkers').textContent = workers.length;
    }

    function renderAllTables() {
        renderPatientTable();
        renderWorkerTable();
        renderVisitorTable();
        renderRecentPatients();
        updateStats();
    }

    // ─── FORM HANDLERS ───
    // Patient registration
    document.getElementById('patientRegisterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('patientRegName').value.trim();
        const phone = document.getElementById('patientRegPhone').value.trim();
        const age = document.getElementById('patientRegAge').value.trim();
        const kin = document.getElementById('patientRegKin').value.trim();
        const kinPhone = document.getElementById('patientRegKinPhone').value.trim();

        if (!name || !phone || !age || !kin || !kinPhone) {
            showToast('Please fill in all fields.', true);
            return;
        }
        if (isNaN(age) || parseInt(age) <= 0) {
            showToast('Age must be a positive number.', true);
            return;
        }
        registerPatient(name, phone, age, kin, kinPhone);
        showToast(`Patient ${name} registered successfully.`);
        this.reset();
        renderPatientTable();
        updateStats();
        renderRecentPatients();
    });

    // Worker registration
    document.getElementById('workerRegisterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('workerName').value.trim();
        const role = document.getElementById('workerRole').value.trim();
        if (!name) {
            showToast('Please enter worker name.', true);
            return;
        }
        registerWorker(name, role || 'Staff');
        showToast(`Worker ${name} registered.`);
        this.reset();
        renderWorkerTable();
        updateStats();
    });

    // Visitor registration
    document.getElementById('visitorRegisterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('visitorName').value.trim();
        const phone = document.getElementById('visitorPhone').value.trim();
        const purpose = document.getElementById('visitorPurpose').value.trim();
        if (!name || !phone || !purpose) {
            showToast('Please fill in all fields.', true);
            return;
        }
        registerVisitor(name, phone, purpose);
        showToast(`Visitor ${name} logged.`);
        this.reset();
        renderVisitorTable();
        updateStats();
    });

    // ─── SET MIN DATE FOR APPOINTMENT ───
    const dateInput = document.getElementById('patientDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // ─── INITIAL LOAD ───
    // Pre-populate with some sample data if empty (optional)
    // (we'll keep it empty to start fresh)

    console.log('🏥 Kegogi Medicare Hospital System ready.');
});
