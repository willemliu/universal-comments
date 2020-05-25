function getUrlParam(parameter: string) {
    const url = new URL(window.location.href);
    return url.searchParams.get(parameter);
}

function getCanonical() {
    const canonical = document
        ? document.querySelector('link[rel="canonical"]')
        : '';
    const uriCanonical = getUrlParam('canonical');
    const url = uriCanonical
        ? uriCanonical
        : canonical
        ? canonical?.getAttribute('href')
        : window.location.origin +
          (window.location.pathname.length > 1 ? window.location.pathname : '');
    return url.replace(/\/$/, '');
}

export { getCanonical, getUrlParam };
