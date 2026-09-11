let storedUser = null;

const header = document.querySelector('header');
const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('#login-status');
const accountPanel = document.querySelector('#account-panel');
const accountInitial = document.querySelector('#account-initial');
const accountEmail = document.querySelector('#account-email');
const logoutButton = document.querySelector('#logout-button');
const profileInitial = document.querySelector('.profile-initial');
const revealElements = document.querySelectorAll('h1, p, .home-next, .product-card, .cart-panel, .invoice-panel, .order-history, .contact-intro, .contact-panel');
const navigationLinks = document.querySelectorAll('nav ul li a');
const contactForm = document.querySelector('#contact-form');
const pageSections = document.querySelectorAll('main[id], section[id]');

try {
	const savedLogin = JSON.parse(localStorage.getItem('velseyon-login') || 'null');
	if (savedLogin?.loggedIn && savedLogin.email) {
		storedUser = { email: savedLogin.email, authenticated: true };
	}
} catch (error) {
	localStorage.removeItem('velseyon-login');
}

const getUserInitial = (email) => email?.trim().charAt(0).toUpperCase() || '?';

if (profileInitial && storedUser) profileInitial.textContent = getUserInitial(storedUser.email);

if (loginForm && storedUser) {
	loginForm.hidden = true;
	accountPanel.hidden = false;
	accountInitial.textContent = getUserInitial(storedUser.email);
	accountEmail.textContent = storedUser.email;
}

loginForm?.addEventListener('submit', async (event) => {
	event.preventDefault();
	const email = loginForm.elements['login-email'].value.trim();
	const password = loginForm.elements['login-password'].value;
	if (!email.toLowerCase().endsWith('@gmail.com') || !password.trim()) {
		loginStatus.textContent = 'Enter a Gmail address and password.';
		return;
	}
	storedUser = { email, authenticated: true };
	localStorage.setItem('velseyon-login', JSON.stringify({ email, loggedIn: true }));
	loginStatus.textContent = '';
	window.location.href = 'HOME%20PAGE.html';
});

logoutButton?.addEventListener('click', () => {
	localStorage.removeItem('velseyon-login');
	window.location.href = 'LOGIN.html';
});

const setActiveLink = (targetId) => {
	navigationLinks.forEach((link) => {
		const isActive = link.getAttribute('href') === `#${targetId}`;
		link.classList.toggle('active', isActive);
		if (isActive) {
			link.setAttribute('aria-current', 'page');
		} else {
			link.removeAttribute('aria-current');
		}
	});
};

navigationLinks.forEach((link) => {
	const targetId = link.getAttribute('href');
	if (!targetId || !targetId.startsWith('#')) return;

	link.addEventListener('click', (event) => {
		event.preventDefault();
		const target = document.querySelector(targetId);
		if (!target) return;

		navigationLinks.forEach((navigationLink) => {
			navigationLink.classList.remove('active');
			navigationLink.removeAttribute('aria-current');
		});
		link.classList.add('active');
		link.setAttribute('aria-current', 'page');
		history.replaceState(null, '', targetId);
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
});

if ('IntersectionObserver' in window) {
	const sectionObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				setActiveLink(entry.target.id);
			}
		});
	}, { threshold: 0.35, rootMargin: '-15% 0px -45% 0px' });

	pageSections.forEach((section) => sectionObserver.observe(section));
}

const updateHeader = () => {
	header?.classList.toggle('scrolled', window.scrollY > 16);
};

revealElements.forEach((element) => element.classList.add('reveal'));

if ('IntersectionObserver' in window) {
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	revealElements.forEach((element) => revealObserver.observe(element));
} else {
	revealElements.forEach((element) => element.classList.add('is-visible'));
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.querySelectorAll('[data-gallery]').forEach((gallery) => {
	const images = gallery.querySelectorAll('.product-image');
	const dots = gallery.querySelector('[data-gallery-dots]');
	let currentIndex = 0;

	const showImage = (index) => {
		currentIndex = (index + images.length) % images.length;
		images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === currentIndex));
		dots.querySelectorAll('button').forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === currentIndex));
	};

	images.forEach((image, imageIndex) => {
		const dot = document.createElement('button');
		dot.type = 'button';
		dot.setAttribute('aria-label', `Show product photo ${imageIndex + 1}`);
		dot.addEventListener('click', () => showImage(imageIndex));
		dots.appendChild(dot);
	});

	gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => showImage(currentIndex - 1));
	gallery.querySelector('[data-gallery-next]').addEventListener('click', () => showImage(currentIndex + 1));
	showImage(0);
	window.setInterval(() => showImage(currentIndex + 1), 4500);	
});

contactForm?.addEventListener('submit', (event) => {
	event.preventDefault();
	const contactStatus = document.querySelector('#contact-status');
	localStorage.setItem('velseyon-contact', JSON.stringify({
		name: contactForm.elements.name.value.trim(),
		email: contactForm.elements.email.value.trim(),
		message: contactForm.elements.message.value.trim(),
		createdAt: new Date().toISOString()
	}));
	contactStatus.textContent = 'Thank you. Your message has been received.';
	contactForm.reset();
});

const shopPage = document.querySelector('[data-shop-page]');

if (shopPage) {
	const PRODUCT_PRICE = 399;
	const cartItems = document.querySelector('#cart-items');
	const cartCount = document.querySelector('#cart-count');
	const cartSubtotal = document.querySelector('#cart-subtotal');
	const cartShipping = document.querySelector('#cart-shipping');
	const cartTotal = document.querySelector('#cart-total');
	const checkoutForm = document.querySelector('#checkout-form');
	const orderStatus = document.querySelector('#order-status');
	const invoicePanel = document.querySelector('#invoice-panel');
	const orderHistoryList = document.querySelector('#order-history-list');
	let cart = {};
	let orderHistory = [];

	try {
		cart = JSON.parse(localStorage.getItem('velsera-cart')) || {};
		orderHistory = JSON.parse(localStorage.getItem('velsera-order-history')) || [];
	} catch (error) {
		cart = {};
		orderHistory = [];
	}

	const availableProductIds = new Set([...document.querySelectorAll('.add-to-cart')].map((button) => button.dataset.productId));
	cart = Object.fromEntries(Object.values(cart).flatMap((item) => {
		const price = PRODUCT_PRICE;
		const quantity = Math.floor(Number(item.quantity));
		if (!availableProductIds.has(item.id) || !item.name || !Number.isFinite(quantity) || quantity < 1) return [];
		return [[item.id, { ...item, price, quantity }]];
	}));
	localStorage.setItem('velsera-cart', JSON.stringify(cart));

	const formatPrice = (price) => {
		const safePrice = Number.isFinite(Number(price)) ? Number(price) : 0;
		return `₹${safePrice.toLocaleString('en-IN')}`;
	};

	const saveCart = () => {
		localStorage.setItem('velsera-cart', JSON.stringify(cart));
	};

	const getCartTotals = () => {
		const items = Object.values(cart);
		const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
		const shipping = items.length ? (subtotal >= 5000 ? 0 : 21) : 0;
		return { items, itemCount: items.reduce((count, item) => count + Number(item.quantity), 0), subtotal, shipping, total: subtotal + shipping };
	};

	const renderOrderHistory = () => {
		if (!orderHistory.length) {
			orderHistoryList.innerHTML = '<p class="history-empty">Your completed COD orders will appear here.</p>';
			return;
		}

		orderHistoryList.innerHTML = orderHistory.slice().reverse().map((order) => `
			<div class="history-item">
				<div>
					<strong>${order.orderId}</strong>
					<span>${order.date}</span>
				</div>
				<div>
					<span>${order.items.reduce((count, item) => count + item.quantity, 0)} items | Cash on Delivery</span>
					<strong>${formatPrice(order.total)}</strong>
				</div>
			</div>
		`).join('');
	};

	const renderInvoice = (invoice) => {
		if (!invoice) {
			invoicePanel.innerHTML = '<div class="invoice-empty">Your invoice will appear here after you place a COD order.</div>';
			return;
		}
		invoicePanel.innerHTML = `
			<div class="invoice-header">
				<div>
					<p class="invoice-label">VELSERA</p>
					<h2>Order Invoice</h2>
				</div>
				<div class="invoice-actions">
					<button type="button" class="print-invoice" data-print-invoice>Print Invoice</button>
					<button type="button" class="reset-invoice" data-reset-invoice>Reset Invoice</button>
				</div>
			</div>
			<div class="invoice-meta">
				<span>Order: <strong>${invoice.orderId}</strong></span>
				<span>${invoice.date}</span>
				<span>Payment: <strong>Cash on Delivery</strong></span>
			</div>
			<div class="invoice-customer">
				<strong>${invoice.customer.name}</strong>
				<span>${invoice.customer.phone}</span>
				<span>${invoice.customer.address}</span>
			</div>
			<div class="invoice-lines">
				${invoice.items.map((item) => `<div><span>${item.name} × ${item.quantity}</span><strong>${formatPrice(item.price * item.quantity)}</strong></div>`).join('')}
			</div>
			<div class="invoice-grand-total"><span>Subtotal</span><strong>${formatPrice(invoice.subtotal)}</strong></div>
			<div class="invoice-grand-total"><span>Delivery</span><strong>${formatPrice(invoice.shipping)}</strong></div>
			<div class="invoice-grand-total"><span>Total payable on delivery</span><strong>${formatPrice(invoice.total)}</strong></div>
		`;
	};

	let savedInvoice = null;
	try {
		savedInvoice = JSON.parse(localStorage.getItem('velsera-invoice') || 'null');
	} catch (error) {
		savedInvoice = null;
		localStorage.removeItem('velsera-invoice');
	}

	if (savedInvoice && savedInvoice.items && savedInvoice.total !== undefined) {
		renderInvoice(savedInvoice);
	}

	const renderCart = () => {
		const { items, itemCount, subtotal, shipping, total } = getCartTotals();

		cartCount.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
		cartSubtotal.textContent = formatPrice(subtotal);
		cartShipping.textContent = formatPrice(shipping);
		cartTotal.textContent = formatPrice(total);

		if (!items.length) {
			cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
			return;
		}

		cartItems.innerHTML = items.map((item) => `
			<div class="cart-item" data-cart-item="${item.id}">
				<div>
					<strong>${item.name}</strong>
					<span>${formatPrice(item.price)} each</span>
				</div>
				<div class="cart-item-controls">
					<button type="button" data-cart-action="decrease" aria-label="Decrease ${item.name} quantity">−</button>
					<span>${item.quantity}</span>
					<button type="button" data-cart-action="increase" aria-label="Increase ${item.name} quantity">+</button>
					<button type="button" class="remove-item" data-cart-action="remove">Remove</button>
				</div>
			</div>
		`).join('');
	};

	document.querySelectorAll('.add-to-cart').forEach((button) => {
		button.addEventListener('click', () => {
			const id = button.dataset.productId;
			const currentPrice = PRODUCT_PRICE;
			if (cart[id]) {
				cart[id].price = currentPrice;
				cart[id].quantity = Number(cart[id].quantity) + 1;
			} else {
				cart[id] = {
					id,
					name: button.dataset.productName,
					price: currentPrice,
					quantity: 1
				};
			}
			orderStatus.textContent = `${cart[id].name} added to your cart.`;
			saveCart();
			renderCart();
		});
	});

	cartItems.addEventListener('click', (event) => {
		const actionButton = event.target.closest('[data-cart-action]');
		if (!actionButton) return;

		const item = actionButton.closest('[data-cart-item]');
		const itemId = item.dataset.cartItem;
		const action = actionButton.dataset.cartAction;

		if (!cart[itemId]) return;
		if (action === 'increase') cart[itemId].quantity = Number(cart[itemId].quantity) + 1;
		if (action === 'decrease') cart[itemId].quantity = Number(cart[itemId].quantity) - 1;
		if (action === 'remove' || cart[itemId].quantity <= 0) delete cart[itemId];

		saveCart();
		renderCart();
	});

	checkoutForm.addEventListener('submit', (event) => {
		event.preventDefault();
		if (!Object.keys(cart).length) {
			orderStatus.textContent = 'Add a product before placing your order.';
			return;
		}

		const { items, subtotal, shipping, total } = getCartTotals();

		const invoice = {
			orderId: `VS-${Date.now().toString().slice(-6)}`,
			date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
			customer: {
				name: checkoutForm.elements['customer-name'].value,
				phone: checkoutForm.elements['customer-phone'].value,
				address: checkoutForm.elements['customer-address'].value
			},
			items,
			subtotal,
			shipping,
			total
		};

		localStorage.setItem('velsera-invoice', JSON.stringify(invoice));
		orderHistory.push(invoice);
		localStorage.setItem('velsera-order-history', JSON.stringify(orderHistory));
		renderInvoice(invoice);
		renderOrderHistory();
		orderStatus.textContent = 'COD order placed successfully. Your invoice is shown below.';
		cart = {};
		saveCart();
		renderCart();
		checkoutForm.reset();
	});

	invoicePanel.addEventListener('click', (event) => {
		if (event.target.closest('[data-print-invoice]')) window.print();
		if (event.target.closest('[data-reset-invoice]')) {
			localStorage.removeItem('velsera-invoice');
			checkoutForm.reset();
			orderStatus.textContent = 'Invoice reset.';
			renderInvoice(null);
		}
	});

	document.querySelector('[data-clear-history]').addEventListener('click', () => {
		orderHistory = [];
		localStorage.removeItem('velsera-order-history');
		renderOrderHistory();
	});

	renderCart();
	renderOrderHistory();
}