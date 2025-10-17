(function() {
	const root = document.documentElement;
	const themeToggle = document.getElementById('themeToggle');
	const yearEl = document.getElementById('year');
	const egg = document.getElementById('easter-egg');
	const eggClose = document.getElementById('eggClose');
	const confettiCanvas = document.getElementById('confettiCanvas');
	const ctx = confettiCanvas.getContext('2d');

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

	// IntersectionObserver reveal
	const io = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) entry.target.classList.add('visible');
			else entry.target.classList.remove('visible');
		});
	}, { threshold: 0.15 });
	for (const el of document.querySelectorAll('.reveal')) io.observe(el);

	// Apply fade-out class to long texts
	for (const el of document.querySelectorAll('h1, h2, p, .subtitle')) el.classList.add('fade-out-on-scroll');

	// Confetti system (simple & lightweight)
	let confettiPieces = [];
	function resizeCanvas() {
		confettiCanvas.width = window.innerWidth;
		confettiCanvas.height = window.innerHeight;
	}
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);

	function spawnConfetti(x = confettiCanvas.width / 2, y = 20, amount = 120) {
		const colors = ['#7dd3fc', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'];
		for (let i = 0; i < amount; i++) {
			confettiPieces.push({
				x: x + (Math.random() - 0.5) * 120,
				y: y + (Math.random() - 0.5) * 40,
				s: Math.random() * 6 + 4,
				vx: (Math.random() - 0.5) * 3,
				vy: Math.random() * 2 + 2,
				rot: Math.random() * Math.PI,
				vr: (Math.random() - 0.5) * 0.2,
				c: colors[Math.floor(Math.random() * colors.length)]
			});
		}
	}

	function drawConfetti() {
		ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
		for (let i = confettiPieces.length - 1; i >= 0; i--) {
			const p = confettiPieces[i];
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.03;
			p.rot += p.vr;
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.fillStyle = p.c;
			ctx.fillRect(-p.s * 0.5, -p.s * 0.2, p.s, p.s * 0.4);
			ctx.restore();
			if (p.y > confettiCanvas.height + 40) confettiPieces.splice(i, 1);
		}
		requestAnimationFrame(drawConfetti);
	}
	requestAnimationFrame(drawConfetti);

	// Fire confetti on load
	window.addEventListener('load', () => spawnConfetti(confettiCanvas.width / 2, 40, 180));

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
			spawnConfetti(e.clientX, 40, 160);
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
			showEgg('Konami unlocked — turbo confetti!');
			for (let i = 0; i < 5; i++) setTimeout(() => spawnConfetti(Math.random() * confettiCanvas.width, 20, 140), i * 120);
		}
	});

	// G toggles gallery grid density
	document.addEventListener('keydown', (e) => {
		if (e.key.toLowerCase() === 'g') {
			for (const g of document.querySelectorAll('.gallery')) {
				const dense = g.getAttribute('data-dense') === '1';
				g.style.gridTemplateColumns = dense ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(120px, 1fr))';
				g.setAttribute('data-dense', dense ? '0' : '1');
			}
			showEgg('Gallery grid toggled');
			spawnConfetti(confettiCanvas.width - 60, confettiCanvas.height - 80, 100);
		}
	});

	// Click and maybe throw confetti (10% chance)
	document.addEventListener('click', (e) => {
		if (Math.random() < 0.1) {
			const r = 90; // delay ring
			spawnConfetti(e.clientX, e.clientY, 80);
			setTimeout(() => spawnConfetti(e.clientX + r, e.clientY, 40), 60);
			setTimeout(() => spawnConfetti(e.clientX - r, e.clientY, 40), 120);
		}
	});
})();


