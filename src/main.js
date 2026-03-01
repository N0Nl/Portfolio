(function() {
	const root = document.documentElement;
	const themeToggle = document.getElementById('themeToggle');
	const yearEl = document.getElementById('year');
	const egg = document.getElementById('easter-egg');
	const eggClose = document.getElementById('eggClose');
	const rbxLogo = document.getElementById('rbxLogo');

	// Year
	yearEl.textContent = new Date().getFullYear();

	// Theme persistence
	const savedTheme = localStorage.getItem('theme') || 'dark';
	if (savedTheme === 'light') document.body.classList.add('theme-light');
	function toggleTheme() {
		document.body.classList.toggle('theme-light');
		localStorage.setItem('theme', document.body.classList.contains('theme-light') ? 'light' : 'dark');
	}

	// Bind theme toggle
	themeToggle.addEventListener('click', toggleTheme);
	document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 't') toggleTheme(); });

	// Enhanced IntersectionObserver for fade-in and fade-out
	const io = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
				entry.target.classList.remove('fade-out');
			} else {
				entry.target.classList.remove('visible');
				// Add fade-out class when element leaves viewport
				entry.target.classList.add('fade-out');
			}
		});
	}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
	for (const el of document.querySelectorAll('.reveal')) io.observe(el);

	// Draggable Roblox logo: show message while dragging, snap back on release
	(function initDraggableLogo() {
		if (!rbxLogo) return;
		rbxLogo.setAttribute('draggable', 'false');
		rbxLogo.style.userSelect = 'none';
		let startX = 0, startY = 0;
		let dx = 0, dy = 0;
		let isDragging = false;

		function setTransform(x, y) {
			rbxLogo.style.transform = `translate(${x}px, ${y}px)`;
		}

		function onDown(clientX, clientY) {
			isDragging = true;
			rbxLogo.classList.add('dragging');
			startX = clientX - dx;
			startY = clientY - dy;
			showEgg("You're a developer Harry!");
		}

		function onMove(clientX, clientY) {
			if (!isDragging) return;
			dx = clientX - startX;
			dy = clientY - startY;
			setTransform(dx, dy);
		}

		function onUp() {
			if (!isDragging) return;
			isDragging = false;
			rbxLogo.classList.remove('dragging');
			dx = 0; dy = 0;
			setTransform(0, 0);
		}

		rbxLogo.addEventListener('mousedown', (e) => { onDown(e.clientX, e.clientY); });
		window.addEventListener('mousemove', (e) => { onMove(e.clientX, e.clientY); });
		window.addEventListener('mouseup', onUp);

		rbxLogo.addEventListener('touchstart', (e) => { const t = e.touches[0]; onDown(t.clientX, t.clientY); }, { passive: true });
		window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
		window.addEventListener('touchend', onUp, { passive: true });
	})();

	// Sneaky drag-to-reveal easter egg
	// Drag the brand text horizontally to fill a hidden meter; crossing threshold shows egg + confetti
	const brand = document.querySelector('.brand');
	let dragging = false; let startX = 0; let dragAccum = 0;
	brand.setAttribute('draggable', 'false');
	brand.style.userSelect = 'none';
	brand.addEventListener('mousedown', (e) => { dragging = true; startX = e.clientX; });
	window.addEventListener('mouseup', () => { dragging = false; dragAccum = Math.max(0, dragAccum - 30); });
	window.addEventListener('mousemove', (e) => {
		if (!dragging) return;
		const dx = e.clientX - startX; startX = e.clientX; dragAccum += Math.abs(dx);
		if (dragAccum > 260) {
			showEgg('Dragged the logo enough — secret unlocked!');
			dragAccum = 0; dragging = false;
		}
	});

	function showEgg(message) {
		const p = egg.querySelector('p');
		p.textContent = message + ' Press G for grid, K for Konami.';
		egg.classList.add('show');
		egg.setAttribute('aria-hidden', 'false');
	}
	eggClose.addEventListener('click', () => { egg.classList.remove('show'); egg.setAttribute('aria-hidden', 'true'); });

	// Konami code easter egg
	const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
	let buffer = [];
	document.addEventListener('keydown', (e) => {
		buffer.push(e.key);
		if (buffer.length > konami.length) buffer.shift();
		if (konami.every((k, i) => k === buffer[i])) {
				showEgg('Konami unlocked — enjoy!');
		}
	});

	// G toggles gallery grid density
	let lastGridToggle = 0;
	document.addEventListener('keydown', (e) => {
		if (e.key.toLowerCase() === 'g') {
			const now = performance.now();
			if (now - lastGridToggle < 250) return; // throttle
			lastGridToggle = now;
			for (const g of document.querySelectorAll('.gallery')) {
				const dense = g.getAttribute('data-dense') === '1';
				g.style.gridTemplateColumns = dense ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(120px, 1fr))';
				g.setAttribute('data-dense', dense ? '0' : '1');
			}
			showEgg('Gallery grid toggled');
		}
	}, { passive: true });

	// Click handler intentionally left empty (confetti removed)
})();


