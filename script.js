document.addEventListener('DOMContentLoaded', function() {

    // ── Hamburger ──
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('open');
        const icon = this.querySelector('i');
        icon.className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });

    // Close nav on link click (mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('open');
            document.querySelector('#hamburger i').className = 'fas fa-bars';
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ── Scroll Fade-up ──
    const fadeEls = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => observer.observe(el));

    // ── Toast System ──
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

    // ── Appointment Form ──
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
        showToast(`Thank you, ${name}! Your appointment request has been sent. We'll contact you shortly.`);
        apptForm.reset();
    });

    // ── Contact Form ──
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
        showToast(`Thanks, ${name}! Your message has been received. We'll respond within 24 hours.`);
        contactForm.reset();
    });

    // ── Set min date for appointment to today ──
    const dateInput = document.getElementById('patientDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // ── Active nav on scroll ──
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

    // ── Admin Dashboard Toggle ──
    const adminToggle = document.getElementById('adminToggle');
    const dashboardOverlay = document.getElementById('dashboardOverlay');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const dashClose = document.getElementById('dashClose');

    function openDashboard() {
        dashboardOverlay.classList.add('active');
        dashboardContainer.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDashboard() {
        dashboardOverlay.classList.remove('active');
        dashboardContainer.classList.remove('open');
        document.body.style.overflow = '';
    }

    adminToggle.addEventListener('click', openDashboard);
    dashClose.addEventListener('click', closeDashboard);
    dashboardOverlay.addEventListener('click', closeDashboard);

    // Close dashboard with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dashboardContainer.classList.contains('open')) {
            closeDashboard();
        }
    });

    // ── Dashboard action buttons (demo) ──
    document.querySelectorAll('.action-btns .btn-success').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const statusSpan = row.querySelector('.status');
            if (statusSpan) {
                statusSpan.className = 'status confirmed';
                statusSpan.textContent = 'Confirmed';
            }
            showToast('Appointment approved successfully.');
        });
    });

    document.querySelectorAll('.action-btns .btn-danger').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const statusSpan = row.querySelector('.status');
            if (statusSpan) {
                statusSpan.className = 'status cancelled';
                statusSpan.textContent = 'Cancelled';
            }
            showToast('Appointment cancelled.', true);
        });
    });
});
