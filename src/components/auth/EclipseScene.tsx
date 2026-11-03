export function EclipseScene() {
  return (
    <div className="eclipse-scene" aria-hidden="true">
      <svg className="eclipse-scene__illustration" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="auth-sky" cx="44%" cy="38%" r="80%">
            <stop offset="0" stopColor="#183b56" />
            <stop offset=".48" stopColor="#0b2238" />
            <stop offset="1" stopColor="#030c16" />
          </radialGradient>
          <radialGradient id="auth-eclipse-glow">
            <stop offset=".43" stopColor="#ff9b28" stopOpacity="0" />
            <stop offset=".54" stopColor="#ffae45" stopOpacity=".72" />
            <stop offset=".62" stopColor="#ff8a23" stopOpacity=".15" />
            <stop offset="1" stopColor="#ff8a23" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="auth-pack-shell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#37546b" />
            <stop offset=".42" stopColor="#162c40" />
            <stop offset="1" stopColor="#07131f" />
          </linearGradient>
          <linearGradient id="auth-pack-pocket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#213c51" />
            <stop offset="1" stopColor="#0b1b2a" />
          </linearGradient>
          <linearGradient id="auth-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#183349" />
            <stop offset="1" stopColor="#030a12" />
          </linearGradient>
          <filter id="auth-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <rect width="1200" height="900" fill="url(#auth-sky)" />
        <g className="eclipse-scene__stars" fill="#d8edf2">
          <circle cx="118" cy="166" r="1.6" /><circle cx="253" cy="92" r="1.2" /><circle cx="337" cy="207" r="1.4" />
          <circle cx="721" cy="110" r="1.4" /><circle cx="924" cy="176" r="1.5" /><circle cx="1070" cy="91" r="1.2" />
          <circle cx="1015" cy="305" r="1.8" /><circle cx="170" cy="350" r="1.2" /><circle cx="828" cy="65" r="1.1" />
        </g>
        <circle cx="525" cy="365" r="330" fill="url(#auth-eclipse-glow)" className="eclipse-scene__corona" />
        <circle cx="525" cy="365" r="228" fill="#030913" stroke="#ffb34f" strokeOpacity=".74" strokeWidth="3" className="eclipse-scene__sun" />
        <circle cx="525" cy="365" r="245" fill="none" stroke="#ffd18a" strokeOpacity=".16" strokeWidth="1" />
        <path d="M0 512 112 405 183 456 275 364 352 451 414 397 510 493 599 413 700 478 782 384 882 477 976 392 1080 464 1200 363V900H0Z" fill="#0a1927" />
        <path d="m0 575 118-91 92 54 95-82 96 116 108-86 87 80 97-105 130 120 90-92 99 68 94-88 94 67v364H0Z" fill="#10283b" />
        <path d="m0 652 106-76 112 54 90-60 113 91 105-52 102 89 104-75 105 64 103-76 112 83 100-57 48 20v243H0Z" fill="url(#auth-ground)" />
        <path d="M0 736 119 672l107 46 93-41 125 82 113-52 109 63 107-39 122 61 99-50 101 44 105-45v159H0Z" fill="#050d15" />
        <path d="m0 638 245 85 193-29 163 82 165-51 175 55 259-79" fill="none" stroke="#ff9e32" strokeOpacity=".22" strokeWidth="2" />
        <path d="m0 815 183-41 147 29 207-48 138 49 182-32 170 37 173-52" fill="none" stroke="#78dce8" strokeOpacity=".13" strokeWidth="2" />
        <ellipse cx="566" cy="680" rx="288" ry="31" fill="#ff9e32" opacity=".2" filter="url(#auth-glow)" />
        <ellipse cx="566" cy="680" rx="226" ry="17" fill="none" stroke="#ffb02e" strokeOpacity=".75" strokeWidth="2" className="eclipse-scene__orbit" />
        <ellipse cx="566" cy="680" rx="288" ry="30" fill="none" stroke="#78dce8" strokeOpacity=".22" strokeWidth="1" className="eclipse-scene__orbit eclipse-scene__orbit--outer" />
        <g className="eclipse-scene__backpack">
          <g transform="rotate(-17 560 452)">
            <path d="M493 340c8-42 35-67 72-67s66 25 74 67l21 177c5 38-13 62-49 67l-99 14c-36 5-59-13-63-49l-13-148c-3-31 14-53 57-61Z" fill="#07111c" stroke="#7f9caf" strokeOpacity=".65" strokeWidth="5" />
            <path d="M501 337c8-31 31-48 63-48 30 0 52 17 61 48l16 43-131 18-12-41Z" fill="url(#auth-pack-shell)" stroke="#9eb4c0" strokeOpacity=".55" strokeWidth="4" />
            <path d="M493 386c33 11 92 6 148-9l18 145c4 30-9 45-39 49l-94 14c-29 4-45-8-49-37l-14-124c-2-19 7-32 30-38Z" fill="url(#auth-pack-shell)" stroke="#7891a1" strokeOpacity=".55" strokeWidth="4" />
            <path d="M499 431c34 10 87 6 147-10l9 80c3 22-7 34-29 37l-90 13c-22 3-35-6-38-29Z" fill="url(#auth-pack-pocket)" stroke="#91a8b7" strokeOpacity=".7" strokeWidth="3" />
            <path d="M516 439c24 7 62 4 104-5l4 42c-36 12-69 16-103 10Z" fill="#18374d" stroke="#a2b6c1" strokeOpacity=".38" strokeWidth="2" />
            <path d="M538 282c-3-34 13-52 36-52 24 0 39 18 37 49" fill="none" stroke="#172b3d" strokeWidth="15" />
            <path d="M538 282c-3-34 13-52 36-52 24 0 39 18 37 49" fill="none" stroke="#8ca2af" strokeOpacity=".48" strokeWidth="3" />
            <path d="M491 361c-30 7-49 28-51 62l-4 113c-1 24 6 40 20 49l18-11c-12-16-13-30-11-50l6-96c2-26 10-38 31-45Z" fill="#0b1a28" stroke="#647d8e" strokeOpacity=".58" strokeWidth="3" />
            <path d="M634 341c30 3 49 21 55 51l23 112c5 23 1 40-11 51l-20-8c9-18 7-32 3-52l-21-94c-6-25-16-35-38-38Z" fill="#0b1a28" stroke="#647d8e" strokeOpacity=".58" strokeWidth="3" />
            <path d="m486 359 20 5 26 176-19 3Z" fill="#ffb02e" opacity=".84" />
            <path d="m625 348 18-5 34 168-18 5Z" fill="#e89a32" opacity=".78" />
            <path d="M524 389c29 5 72 1 106-9" fill="none" stroke="#d4e0e5" strokeOpacity=".42" strokeWidth="3" />
            <path d="m514 408 2 23m110-40 2 23" stroke="#ffbd52" strokeWidth="4" strokeLinecap="round" />
            <path d="M553 487c14 5 34 4 49-1" fill="none" stroke="#78dce8" strokeOpacity=".44" strokeWidth="2" />
            <rect x="591" y="496" width="20" height="12" rx="3" fill="#ffb02e" transform="rotate(-8 591 496)" />
            <path d="m478 523-20 21m205-30 22 14" stroke="#09131e" strokeWidth="12" strokeLinecap="round" />
            <path d="m478 523-20 21m205-30 22 14" stroke="#8ca1ad" strokeOpacity=".46" strokeWidth="2" strokeLinecap="round" />
            <circle cx="498" cy="378" r="4" fill="#ffbd52" /><circle cx="639" cy="362" r="4" fill="#ffbd52" />
            <path d="m536 548 5 20m101-37 7 19" stroke="#ffb02e" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>
        <g fill="#ffb02e">
          <circle cx="271" cy="633" r="2" className="eclipse-scene__ember" />
          <circle cx="832" cy="597" r="2" className="eclipse-scene__ember eclipse-scene__ember--two" />
          <circle cx="766" cy="274" r="1.5" className="eclipse-scene__ember eclipse-scene__ember--three" />
        </g>
      </svg>
      <div className="eclipse-scene__caption"><span>GOOD THINGS</span><i /> FIND THEIR WAY BACK</div>
      <div className="eclipse-scene__coordinate">LOSTLINK / SIGNAL</div>
    </div>
  )
}
