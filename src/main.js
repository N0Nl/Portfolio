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

	// Confetti system (simple & lightweight)
	let confettiPieces = [];
	function resizeCanvas() {
		confettiCanvas.width = window.innerWidth;
		confettiCanvas.height = window.innerHeight;
	}
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);

	function spawnConfetti(x = confettiCanvas.width / 2, y = 20, amount = 200, fromCorner = false) {
		const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
		
		for (let i = 0; i < amount; i++) {
			let startX, startY, velocityX, velocityY;
			
			if (fromCorner) {
				// Shoot from corners at 45-degree angles
				const corner = Math.floor(Math.random() * 4);
				switch(corner) {
					case 0: // Top-left
						startX = -50;
						startY = -50;
						velocityX = Math.random() * 4 + 2;
						velocityY = Math.random() * 4 + 2;
						break;
					case 1: // Top-right
						startX = confettiCanvas.width + 50;
						startY = -50;
						velocityX = -(Math.random() * 4 + 2);
						velocityY = Math.random() * 4 + 2;
						break;
					case 2: // Bottom-left
						startX = -50;
						startY = confettiCanvas.height + 50;
						velocityX = Math.random() * 4 + 2;
						velocityY = -(Math.random() * 4 + 2);
						break;
					case 3: // Bottom-right
						startX = confettiCanvas.width + 50;
						startY = confettiCanvas.height + 50;
						velocityX = -(Math.random() * 4 + 2);
						velocityY = -(Math.random() * 4 + 2);
						break;
				}
			} else {
				// Original center-based spawning
				startX = x + (Math.random() - 0.5) * 120;
				startY = y + (Math.random() - 0.5) * 40;
				velocityX = (Math.random() - 0.5) * 3;
				velocityY = Math.random() * 2 + 2;
			}
			
			confettiPieces.push({
				x: startX,
				y: startY,
				s: Math.random() * 12 + 8, // Larger size (8-20px)
				vx: velocityX,
				vy: velocityY,
				rot: Math.random() * Math.PI,
				vr: (Math.random() - 0.5) * 0.3,
				c: colors[Math.floor(Math.random() * colors.length)],
				life: 1.0, // Life counter for faster fade
				fadeSpeed: 0.008 // Faster fade speed
			});
		}
	}

	function drawConfetti() {
		ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
		for (let i = confettiPieces.length - 1; i >= 0; i--) {
			const p = confettiPieces[i];
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.05; // Slightly faster gravity
			p.rot += p.vr;
			p.life -= p.fadeSpeed; // Faster fade
			
			// Remove particles that are off-screen or faded out
			if (p.y > confettiCanvas.height + 40 || p.x < -50 || p.x > confettiCanvas.width + 50 || p.life <= 0) {
				confettiPieces.splice(i, 1);
				continue;
			}
			
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.globalAlpha = p.life; // Apply fade
			ctx.fillStyle = p.c;
			ctx.fillRect(-p.s * 0.5, -p.s * 0.2, p.s, p.s * 0.4);
			ctx.restore();
		}
		requestAnimationFrame(drawConfetti);
	}
	requestAnimationFrame(drawConfetti);

	// Fire confetti on load from corners
	window.addEventListener('load', () => {
		spawnConfetti(confettiCanvas.width / 2, 40, 300, true); // Shoot from corners
		setTimeout(() => spawnConfetti(confettiCanvas.width / 2, 40, 200, true), 200);
		setTimeout(() => spawnConfetti(confettiCanvas.width / 2, 40, 150, true), 400);
	});

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
			spawnConfetti(e.clientX, 40, 250, true);
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
			for (let i = 0; i < 5; i++) setTimeout(() => spawnConfetti(Math.random() * confettiCanvas.width, 20, 200, true), i * 120);
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
			spawnConfetti(confettiCanvas.width - 60, confettiCanvas.height - 80, 150, true);
		}
	});

	// Click and maybe throw confetti (10% chance)
	document.addEventListener('click', (e) => {
		if (Math.random() < 0.1) {
			const r = 90; // delay ring
			spawnConfetti(e.clientX, e.clientY, 120, true);
			setTimeout(() => spawnConfetti(e.clientX + r, e.clientY, 80, true), 60);
			setTimeout(() => spawnConfetti(e.clientX - r, e.clientY, 80, true), 120);
		}
	});
})();


