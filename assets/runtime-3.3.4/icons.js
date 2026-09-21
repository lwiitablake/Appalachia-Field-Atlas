// Original single-color SVG artwork, GPL-3.0-only. No game logo or font copied.
const paths={
 bobblehead:'<circle cx="12" cy="7" r="5"/><path d="M10 12h4v2l3 2v5H7v-5l3-2zM5 21h14v2H5z"/>',
 magazine:'<path d="M4 2h14v18H4zM19 5h2v18H6v-2h13z"/><path fill="var(--cat)" d="M7 5h8v5H7zM7 12h8v1H7zM7 15h6v1H7z"/>',
 caps:'<path d="M20 5C17 1 9 1 5 6c-4 5-3 12 2 15 4 3 10 2 13-2l-4-3c-2 2-5 3-7 0-2-2-1-6 1-8 2-2 4-2 6 0z"/>',
 fusion:'<path d="M9 1h6v3h3v18H6V4h3z"/><path fill="var(--cat)" d="m13 6-5 8h4l-1 5 5-8h-4z"/>',
 location:'<path d="M12 1a8 8 0 0 0-8 8c0 6 8 14 8 14s8-8 8-14a8 8 0 0 0-8-8m0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6" fill-rule="evenodd"/>',
 area:'<path d="m2 8 6-5 8 3 6-3v15l-6 3-8-3-6 3zm7-2v10l6 2V8z" fill-rule="evenodd"/>',
 region:'<path d="m1 20 7-15 4 7 4-11 7 19zm7-10-3 7h6zm8-3-3 10h6z" fill-rule="evenodd"/>',
 interior:'<path d="M5 1h14v22h-5v-3h2V4H8v16h3v3H5z"/><circle cx="13" cy="12" r="1.5"/>',
 custom:'<path d="M4 1h2v22H4zM7 2h14l-4 5 4 5H7z"/>'
};
export function icon(category){return category==='armor'?'<span class="pa-icon">PA</span>':`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${paths[category]||paths.location}</svg>`;}
