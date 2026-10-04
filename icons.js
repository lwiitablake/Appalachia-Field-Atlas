// Original single-color SVG artwork, GPL-3.0-only. No game logo or font copied.
const paths={
 toiletpaper:'<path d="M8 3h9a5 5 0 0 1 5 5v12h-8v-8H8a5 5 0 1 1 0-9m0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4" fill-rule="evenodd"/>',
 plunger:'<path d="M10 1h4v12c4 1 6 4 6 8H4c0-4 2-7 6-8zM2 21h20v2H2z"/>',
 safe:'<path d="M2 2h20v20H2zm3 3v14h14V5zm8 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8m-1 2v4h2v-4zM6 9h2v6H6z" fill-rule="evenodd"/>',
 object:'<path d="m12 1 10 5v12l-10 5-10-5V6zm-8 6 8 4 8-4-8-4zm7 6-7-4v8l7 3zm2 7 7-3V9l-7 4z" fill-rule="evenodd"/>',
 fish:'<path d="M3 12 0 6v12zm0 0c5-10 15-10 21 0-6 10-16 10-21 0m15-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" fill-rule="evenodd"/>',
 lunchbox:'<path d="M8 3h8v4h5v14H3V7h5zm2 2v2h4V5z" fill-rule="evenodd"/><path fill="var(--cat)" d="M3 11h18v2H3z"/>',
 cooler:'<path d="M2 5h20v4H2zM4 10h16v12H4zM8 1h8v3h-2V3h-4v1H8z"/>',
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
