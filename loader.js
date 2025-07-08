document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href')) {
            const href = link.getAttribute('href');
            if (
                href.endsWith('.html') &&
                !href.startsWith('http') &&
                !href.startsWith('#') &&
                !href.startsWith('mailto')
            ) {
                e.preventDefault();
                triggerLoad(href);
            }
        }
    });
});

export function triggerLoad(href) {
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto')) {
        sessionStorage.setItem('showLoaderOnLoad', 'true');
        document.getElementById('loading-screen').style.display = 'flex';
        setTimeout(() => {
            window.location.href = href;
        }, 100);
    } else {
        window.location.href = href;
    }
}
window.triggerLoad = triggerLoad;
