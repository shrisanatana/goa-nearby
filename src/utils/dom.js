
let savedScrollPosition = 0;

export function hideMainContent() {
    savedScrollPosition = window.scrollY;
    const mainContent = document.getElementById('main-content');
    const header = document.querySelector('header');
    const fab = document.querySelector('.fab');

    if (mainContent) mainContent.style.display = 'none';
    if (header) header.style.display = 'none';
    if (fab) fab.classList.add('hidden');
}

export function showMainContent() {
    const mainContent = document.getElementById('main-content');
    const header = document.querySelector('header');
    const fab = document.querySelector('.fab');

    if (mainContent) mainContent.style.display = 'block';
    if (header) header.style.display = 'block';
    if (fab) fab.classList.remove('hidden');

    // Restore scroll position
    if (savedScrollPosition > 0) {
        window.scrollTo(0, savedScrollPosition);
    }

    // Hide other pages
    const packagesPage = document.getElementById('packages-page');
    if (packagesPage) packagesPage.classList.add('hidden');

    const infoPage = document.getElementById('info-page');
    if (infoPage) infoPage.innerHTML = '';

    // const placeDetail = document.getElementById('place-detail');
    // if (placeDetail) placeDetail.classList.add('hidden');
}
