import React from "react";

/**
 * Flat study-desk illustration for the dashboard hero.
 * Inline SVG so it stays crisp at any size and picks up brand colours.
 */
const StudyIllustration = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 420 230"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    {/* soft backdrop blob */}
    <path
      d="M18 150C18 96 62 34 140 26c78-8 104 34 168 30 44-3 82-14 106 6v88H18z"
      fill="#eef3fd"
    />
    <circle cx="196" cy="70" r="17" fill="#f7faff" />
    <circle cx="330" cy="46" r="11" fill="#e2ecfc" />

    {/* desk */}
    <rect x="24" y="188" width="372" height="4" rx="2" fill="#cddcf5" />

    {/* ---- potted plant ---- */}
    <path
      d="M74 150c-16-4-24-16-22-30 15-2 26 8 28 22"
      fill="#7ec9a0"
      opacity=".9"
    />
    <path
      d="M80 150c14-6 20-19 16-33-15 0-25 11-25 25"
      fill="#4fb07f"
    />
    <path d="M77 152v-26" stroke="#3d9a6c" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M62 188h30l5-36H57l5 36z" fill="#fff" />
    <path d="M62 188h30l5-36H57l5 36z" stroke="#cddcf5" strokeWidth="2" />
    <rect x="55" y="147" width="44" height="9" rx="4.5" fill="#e8f0fd" stroke="#cddcf5" strokeWidth="2" />

    {/* ---- stack of books ---- */}
    <rect x="124" y="170" width="122" height="18" rx="4" fill="#fff" stroke="#c3d6f4" strokeWidth="2" />
    <rect x="124" y="170" width="14" height="18" rx="4" fill="#dbe7fb" />
    <rect x="132" y="152" width="108" height="18" rx="4" fill="#eaf1fd" stroke="#c3d6f4" strokeWidth="2" />
    <rect x="132" y="152" width="13" height="18" rx="4" fill="#c3d6f4" />
    <rect x="126" y="134" width="116" height="18" rx="4" fill="#fff" stroke="#c3d6f4" strokeWidth="2" />
    <rect x="126" y="134" width="13" height="18" rx="4" fill="#dbe7fb" />

    {/* ---- pencil cup ---- */}
    <path d="M254 188h34l-4-38h-26l-4 38z" fill="#dbe7fb" stroke="#b7cff2" strokeWidth="2" />
    <path d="M259 108v42" stroke="#f5b544" strokeWidth="6" strokeLinecap="round" />
    <path d="M271 100v50" stroke="#5b8def" strokeWidth="6" strokeLinecap="round" />
    <path d="M283 112v38" stroke="#ef7d6b" strokeWidth="6" strokeLinecap="round" />
    <path d="M256 112l3-6 3 6z" fill="#3d4f6b" />
    <path d="M268 104l3-6 3 6z" fill="#3d4f6b" />
    <path d="M280 116l3-6 3 6z" fill="#3d4f6b" />

    {/* ---- desk calendar ---- */}
    <path d="M318 122v-8M340 122v-8M362 122v-8" stroke="#9db8e4" strokeWidth="3" strokeLinecap="round" />
    <rect x="302" y="120" width="76" height="68" rx="7" fill="#fff" stroke="#c3d6f4" strokeWidth="2" />
    <path d="M302 127a7 7 0 017-7h62a7 7 0 017 7v11h-76v-11z" fill="#2f62c4" />
    <g fill="#c3d6f4">
      <rect x="312" y="148" width="12" height="8" rx="2" />
      <rect x="330" y="148" width="12" height="8" rx="2" />
      <rect x="348" y="148" width="12" height="8" rx="2" />
      <rect x="312" y="162" width="12" height="8" rx="2" />
      <rect x="348" y="162" width="12" height="8" rx="2" />
      <rect x="312" y="176" width="12" height="6" rx="2" />
      <rect x="330" y="176" width="12" height="6" rx="2" />
    </g>
    <rect x="330" y="162" width="12" height="8" rx="2" fill="#4f83e3" />

    {/* ---- sparkles ---- */}
    <g fill="#9db8e4">
      <path d="M108 74l2.6 5.4 5.4 2.6-5.4 2.6-2.6 5.4-2.6-5.4-5.4-2.6 5.4-2.6L108 74z" />
      <path d="M286 58l2 4.2 4.2 2-4.2 2-2 4.2-2-4.2-4.2-2 4.2-2 2-4.2z" />
      <path d="M232 100l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6 1.6-3.4z" />
    </g>
  </svg>
);

export default StudyIllustration;
