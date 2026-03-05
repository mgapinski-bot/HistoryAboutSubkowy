// src/UnderConstruction.js
import { useEffect, useRef, useState } from "react";

/* -------------------- THEME (jasne) -------------------- */
const theme = {
  blue1: "#034fbd",
  blue2: "#0391e8",
  blue3: "#057bdd",
  green: "#22c55e",
  bg: "#f7fbff",
  card: "#ffffff",
  text: "#0b132a",
  muted: "#475569",
};

/* -------------------- Icons -------------------- */
function IconHamburger() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 17v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/* -------------------- Hook: lock scroll when open -------------------- */
function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      body.style.overflow = prevOverflow || "";
      body.style.paddingRight = prevPaddingRight || "";
    };
  }, [isLocked]);
}

/* -------------------- Small inline SVG "image" (no extra file needed) -------------------- */
function UnderConstructionArt() {
  return (
    <svg
      className="ucArt"
      viewBox="0 0 760 380"
      role="img"
      aria-label="Ilustracja strony w budowie"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(3,145,232,.25)" />
          <stop offset="1" stopColor="rgba(34,197,94,.18)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="760" height="380" rx="22" fill="url(#g1)" />

      <g opacity="0.9">
        <circle cx="110" cy="92" r="36" fill="rgba(3,79,189,.16)" />
        <circle cx="660" cy="78" r="44" fill="rgba(34,197,94,.14)" />
        <circle cx="640" cy="300" r="54" fill="rgba(3,145,232,.12)" />
      </g>

      {/* "Cone" */}
      <g transform="translate(250 92)">
        <path
          d="M130 220h0c-12 0-22-10-22-22l44-174c2-8 10-14 18-14h0c8 0 16 6 18 14l44 174c0 12-10 22-22 22H130Z"
          fill="rgba(255,255,255,.88)"
          stroke="rgba(15,23,42,.14)"
          strokeWidth="2"
        />
        <path d="M168 32h64l-16 64h-64l16-64Z" fill="rgba(242,183,5,.85)" />
        <path d="M152 96h64l-10 44h-64l10-44Z" fill="rgba(3,79,189,.18)" />
        <path d="M144 140h64l-8 34h-64l8-34Z" fill="rgba(242,183,5,.75)" />
        <rect x="118" y="220" width="250" height="20" rx="10" fill="rgba(11,19,42,.12)" />
      </g>

      {/* Small label */}
      <g transform="translate(42 300)">
        <rect
          x="0"
          y="0"
          width="240"
          height="46"
          rx="14"
          fill="rgba(255,255,255,.86)"
          stroke="rgba(15,23,42,.10)"
        />
        <text x="18" y="30" fontSize="16" fontWeight="800" fill="rgba(11,19,42,.82)">
          Prace trwają
        </text>
      </g>
    </svg>
  );
}

/* -------------------- ROOT -------------------- */
export default function UnderConstruction() {
  const [scrolled, setScrolled] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  useBodyScrollLock(menuOpen);

  // Dropdown wrapper placeholder (zostawiamy strukturę nagłówka)
  const timelineWrapRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <ThemeStyle />

      <div className="app">
        <header className={`topHeader ${scrolled ? "shadow" : ""}`}>
          <div className="topHeaderInner">
            <div className="topLogo" aria-label="Logo">
              LOGO 240x50
            </div>

            <nav className="topNavDesktop" aria-label="Menu główne">
              <div className="navDropWrap" ref={timelineWrapRef}>
                <button type="button" className="topTab topTabDrop" disabled>
                  <span>Ścieżka czasu</span>
                </button>
              </div>

              {["Miejsca", "Epoki", "Kontakt"].map((t) => (
                <button key={t} type="button" className="topTab" disabled>
                  {t}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className="topMobileTrigger"
              aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="topIcon" aria-hidden="true">
                {menuOpen ? <IconX /> : <IconHamburger />}
              </span>
              <span className="topMobileLabel">Menu</span>
            </button>
          </div>
        </header>

        <div
          className={`topOverlay ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        />

        <aside
          className={`topSidebar ${menuOpen ? "open" : ""}`}
          aria-label="Menu boczne"
          aria-hidden={!menuOpen}
        >
          <div className="topSidebarHeader">
            <div className="topSidebarTitle">Menu</div>
            <button
              type="button"
              className="topSidebarClose"
              onClick={() => setMenuOpen(false)}
              aria-label="Zamknij menu"
            >
              <IconX />
            </button>
          </div>

          <div className="topSidebarList" role="list">
            {["Ścieżka czasu", "Miejsca", "Epoki", "Kontakt"].map((t) => (
              <button key={t} type="button" className="topSidebarItem" disabled>
                {t}
              </button>
            ))}
          </div>
        </aside>

        <main className="container contentUnderHeader">
          <section className="card ucCard">
            <div className="ucTop">
              <div className="ucBadge">
                <span className="ucBadgeIcon" aria-hidden="true">
                  <IconInfo />
                </span>
                <span>Strona w budowie</span>
              </div>

              <h1 className="ucTitle">Pracujemy nad tą częścią strony</h1>
              <p className="ucText">
                Wkrótce pojawią się tu treści związane z historią i trasą. Na ten moment
                przygotowujemy materiały, zdjęcia oraz opisy przystanków.
              </p>

              <div className="ucPills">
                <span className="pill ok">Status: w przygotowaniu</span>
                <span className="pill">Aktualizacje: sukcesywnie</span>
              </div>
            </div>

            <div className="ucMedia">
              <UnderConstructionArt />
              <div className="ucCaption">Dziękujemy za cierpliwość</div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/* -------------------- Styles -------------------- */
function ThemeStyle() {
  return (
    <style>{`
      :root{
        --blue1:${theme.blue1};
        --blue2:${theme.blue2};
        --blue3:${theme.blue3};
        --green:${theme.green};
        --bg:${theme.bg};
        --card:${theme.card};
        --text:${theme.text};
        --muted:${theme.muted};
        --shadow:0 12px 28px rgba(2,6,23,.10);
        --stroke: rgba(3,79,189,.16);
        --radius: clamp(16px, 2vw, 22px);
        --pad: clamp(12px, 2.2vw, 22px);
        --gap: 20px;
      }

      *{box-sizing:border-box}
      html,body{height:100%}
      body{
        margin:0;
        font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;
        background:var(--bg);
        color:var(--text);
      }

      .app{
        width: 100%;
        min-height: 100vh;
        position: relative;
        background:
          radial-gradient(900px 500px at 15% 0%, rgba(3,145,232,.12), transparent 60%),
          radial-gradient(900px 500px at 85% 10%, rgba(34,197,94,.10), transparent 60%),
          var(--bg);
        overflow-x: clip;
      }

      /* ===== FIXED TOP HEADER ===== */
      .topHeader{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 70px;
        padding-top: 10px;
        padding-bottom: 10px;
        z-index: 5000;
        background: rgba(255,255,255,.92);
        border-bottom: 1px solid rgba(15,23,42,.10);
        backdrop-filter: blur(10px);
      }
      .topHeader.shadow{box-shadow:0 10px 22px rgba(2,6,23,.14)}

      .topHeaderInner{
        height: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .topLogo{
        width: 240px;
        height: 50px;
        flex: 0 0 auto;
        border-radius: 10px;
        background: rgba(3,79,189,.08);
        border: 1px solid rgba(3,79,189,.16);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 13px;
        color: rgba(11,19,42,.85);
        white-space: nowrap;
      }

      .topNavDesktop{
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: auto;
      }

      .topTab{
        border: 0;
        background: transparent;
        cursor: default;
        padding: 10px 12px;
        border-radius: 999px;
        font-weight: 900;
        font-size: 13px;
        color: rgba(11,19,42,.50);
      }
      .topTab:disabled{opacity:1}

      .topTabDrop{
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .navDropWrap{ position: relative; }

      .topMobileTrigger{
        margin-left: auto;
        border: 0;
        background: transparent;
        cursor: pointer;
        display: none;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 999px;
        color: rgba(11,19,42,.88);
        font-weight: 950;
      }
      .topMobileTrigger:hover{background: rgba(3,145,232,.08)}
      .topIcon{display:inline-flex}
      .topMobileLabel{font-size: 13px}

      .topOverlay{
        position: fixed;
        inset: 0;
        background: rgba(2,6,23,.35);
        z-index: 4900;
        opacity: 0;
        pointer-events: none;
        transition: opacity .18s ease;
      }
      .topOverlay.open{
        opacity: 1;
        pointer-events: auto;
      }

      .topSidebar{
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: min(340px, 88vw);
        background: #ffffff;
        z-index: 5001;
        transform: translateX(100%);
        transition: transform .22s ease;
        border-left: 1px solid rgba(15,23,42,.10);
        display: grid;
        grid-template-rows: auto 1fr;
      }
      .topSidebar.open{transform: translateX(0)}

      .topSidebarHeader{
        height: 70px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(15,23,42,.10);
      }
      .topSidebarTitle{ font-weight: 950; color: rgba(11,19,42,.92); }
      .topSidebarClose{
        border: 0;
        background: transparent;
        cursor: pointer;
        padding: 10px;
        border-radius: 999px;
        color: rgba(11,19,42,.88);
      }
      .topSidebarClose:hover{background: rgba(3,145,232,.08)}

      .topSidebarList{
        padding: 14px;
        display: grid;
        gap: 10px;
        align-content: start;
      }
      .topSidebarItem{
        border: 1px solid rgba(15,23,42,.10);
        background: rgba(255,255,255,.95);
        cursor: default;
        padding: 12px 12px;
        border-radius: 14px;
        font-weight: 950;
        font-size: 14px;
        color: rgba(11,19,42,.48);
        text-align: left;
      }
      .topSidebarItem:disabled{opacity:1}

      @media (max-width: 768px){
        .topNavDesktop{display:none}
        .topMobileTrigger{display:inline-flex}
        .topLogo{ width: 240px; }
      }

      .container{
        position: relative;
        z-index: 2;
        padding: 12px var(--pad) 18px;
        display:grid;
        gap: var(--gap);
      }

      .contentUnderHeader{ padding-top: 90px; }

      .card{
        background: var(--card);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 12px var(--pad) 14px;
      }

      .pill{
        font-size:12px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(15,23,42,.12);
        background: rgba(255,255,255,.72);
        color: rgba(11,19,42,.82);
      }
      .pill.ok{border-color: rgba(34,197,94,.35)}

      /* ===== Under construction card ===== */
      .ucCard{
        display: grid;
        gap: 14px;
        align-items: start;
        padding: clamp(14px, 2.5vw, 22px);
      }

      .ucTop{
        display: grid;
        gap: 10px;
      }

      .ucBadge{
        display: inline-flex;
        align-items: center;
        gap: 10px;
        width: fit-content;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(3,79,189,.08);
        border: 1px solid rgba(3,79,189,.16);
        color: rgba(3,79,189,.95);
        font-weight: 950;
        font-size: 13px;
      }

      .ucBadgeIcon{
        width: 34px;
        height: 34px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: rgba(3,145,232,.10);
        border: 1px solid rgba(3,145,232,.18);
        color: rgba(3,79,189,.95);
      }

      .ucTitle{
        margin: 0;
        font-size: clamp(20px, 3.4vw, 34px);
        line-height: 1.08;
        font-weight: 980;
        color: rgba(11,19,42,.92);
        letter-spacing: -0.2px;
      }

      .ucText{
        margin: 0;
        color: rgba(71,85,105,.92);
        font-weight: 700;
        line-height: 1.45;
        font-size: clamp(13px, 1.5vw, 15px);
        max-width: 70ch;
      }

      .ucPills{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top: 2px;
      }

      .ucMedia{
        display: grid;
        gap: 10px;
        align-content: start;
      }

      .ucArt{
        width: 100%;
        height: auto;
        display: block;
        border-radius: 18px;
        border: 1px solid rgba(15,23,42,.10);
      }

      .ucCaption{
        text-align: center;
        color: rgba(71,85,105,.82);
        font-weight: 800;
        font-size: 12px;
      }

      /* bigger screens, show text + image in 2 columns */
      @media (min-width: 980px){
        .container{max-width: 1100px;margin:0 auto}
        .ucCard{
          grid-template-columns: 1.05fr .95fr;
          gap: 18px;
          align-items: center;
        }
        .ucMedia{ align-content: center; }
      }

      /* small screens spacing */
      @media (max-width: 360px){
        .ucBadge{ font-size: 12px; }
        .ucBadgeIcon{ width: 32px; height: 32px; border-radius: 12px; }
      }
    `}</style>
  );
}