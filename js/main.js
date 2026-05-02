// Detect whether visit originated from Instagram (UTM params, in-app browser, or referrer)
const isFromInstagram = () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const source = (params.get('utm_source') || '').toLowerCase();
        const medium = (params.get('utm_medium') || '').toLowerCase();
        if (['instagram', 'ig', 'insta'].includes(source)) return true;
        if (medium === 'bio') return true;
        if (/instagram/i.test(navigator.userAgent || '')) return true;
        if (/instagram\.com/i.test(document.referrer || '')) return true;
    } catch (_) { /* ignore */ }
    return false;
};

// Pre-filled WhatsApp message (uses seller's name; varies by origin)
const buildMessage = (name) => {
    const origin = isFromInstagram() ? 'Instagram' : 'site';
    return `Olá, ${name}! Vim pelo ${origin} da Zampers e gostaria de saber mais sobre as peças do atacado.`;
};

document.addEventListener('DOMContentLoaded', function () {
    // Add ?text=... to every seller WhatsApp link
    document.querySelectorAll('.seller').forEach((el) => {
        const nameEl = el.querySelector('.name');
        if (!nameEl) return;
        const fullName = (nameEl.firstChild?.textContent || '').trim();
        if (!fullName) return;
        try {
            const url = new URL(el.href);
            url.searchParams.set('text', buildMessage(fullName));
            el.href = url.toString();
        } catch (_) { /* ignore malformed URLs */ }
    });

    // Randomize store order on each visit (preserves prior behavior)
    const blocks = document.querySelectorAll('.stores .store');
    if (blocks.length >= 2 && Math.random() > 0.5) {
        const parent = blocks[0].parentNode;
        parent.insertBefore(blocks[1], blocks[0]);
        // Re-number store roman numerals based on new order
        const romans = ['I.', 'II.', 'III.', 'IV.'];
        document.querySelectorAll('.stores .store .store-head .num').forEach((el, i) => {
            el.textContent = romans[i] || (i + 1) + '.';
        });
    }

    // IntersectionObserver-based reveal
    const els = document.querySelectorAll('.in-view');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach((el) => io.observe(el));
    } else {
        els.forEach((el) => el.classList.add('is-visible'));
    }
});

// Meta Pixel: Contact event on WhatsApp seller clicks
document.addEventListener('click', function(e) {
    var link = e.target.closest('a.seller');
    if (!link) return;
    var seller = link.dataset.seller || 'unknown';
    if (typeof fbq === 'function') {
        fbq('track', 'Contact', { content_name: seller });
    }
});
