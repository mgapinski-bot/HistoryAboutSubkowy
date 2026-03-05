// src/App.js
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import UnderConstruction from "./Pages/UnderConstruction";
import WorldWindow from "./Pages/WorldWindow";

import twoOaksImg from "./img/two-oaks.png";
import twoOaks2Img from "./img/2oaks.png";
import Zabytek1Img from "./img/Zabytek1.png";
import Zabytek2Img from "./img/Zabytek2.png";
import Zabytek3Img from "./img/Zabytek3.png";
import Zabytek4Img from "./img/Zabytek4.png";

import videoTestMp4 from "./Video/VideoTest.mp4";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />} />
      <Route path="/UnderConstruction" element={<UnderConstruction />} />
      <Route path="/WorldWindow" element={<WorldWindow />} />
      {/* opcjonalnie fallback */}
      {/* <Route path="*" element={<UnderConstruction />} /> */}
    </Routes>
  );
}

/* -------------------- THEME (jasne) -------------------- */
const theme = {
  blue1: "#034fbd",
  blue2: "#0391e8",
  blue3: "#057bdd",
  green: "#22c55e",
  bg: "#ecf7f0",
  card: "#ffffff",
  text: "#0b132a",
  muted: "#475569",
};

/* -------------------- Subkowy fixed location -------------------- */
const SLUBKI = {
  lat: 53.98607676741472,
  lng: 18.752940205999938,
};

/* -------------------- Leaflet icon fix -------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* -------------------- Helpers -------------------- */
const rand = (min, max) => Math.random() * (max - min) + min;

function makeRandomRouteAround(user, count = 4) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const dLat = rand(-0.006, 0.006);
    const dLng = rand(-0.01, 0.01);
    pts.push({
      id: `p${i + 1}`,
      title: `Punkt ${i + 1}`,
      lat: user.lat + dLat,
      lng: user.lng + dLng,
    });
  }
  return pts;
}

function pickRandom(arr) {
  if (!arr?.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

function toRad(v) {
  return (v * Math.PI) / 180;
}

function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dLng / 2) * Math.sin(dLng / 2));

  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

/* -------------------- Icons -------------------- */
function IconHamburger() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.32 1.7.6 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.12a2 2 0 0 1 2.11-.45c.8.28 1.64.48 2.5.6A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4h16v16H4V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m22 6-10 7L2 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
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

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) body.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      body.style.overflow = prevOverflow || "";
      body.style.paddingRight = prevPaddingRight || "";
    };
  }, [isLocked]);
}

/* -------------------- Hook: hide header behind modal -------------------- */
function useHeaderBehindModal(isOn) {
  useEffect(() => {
    const header = document.querySelector(".topHeader");
    if (!header) return;

    const prevZ = header.style.zIndex;
    if (isOn) header.style.zIndex = "0";

    return () => {
      header.style.zIndex = prevZ || "";
    };
  }, [isOn]);
}

/* -------------------- Pill label helpers -------------------- */
function hexToRgb(hex) {
  const h = (hex || "").replace("#", "").trim();
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b]
    .map((v) => v / 255)
    .map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastTextColor(bgHex) {
  const lum = relativeLuminance(hexToRgb(bgHex));
  return lum > 0.55 ? "rgba(11,19,42,.92)" : "rgba(255,255,255,.96)";
}

const pillVariants = {
  miejsca: "#f2b705",
  lista: "#0ea5e9",
  mapa: "#2563eb",
  film: "#10b981",
};

function CardPillLabel({ text, variant = "miejsca" }) {
  const bg = pillVariants[variant] || pillVariants.miejsca;
  const fg = contrastTextColor(bg);

  return (
    <div className="cardPill" style={{ background: bg, color: fg }}>
      {text}
    </div>
  );
}

/* -------------------- Image fullscreen modal -------------------- */
function ImageModal({ src, alt, onClose }) {
  useBodyScrollLock(true);
  useHeaderBehindModal(true);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="imgModalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Podgląd zdjęcia"
      onClick={onClose}
    >
      <div className="imgModalShell" onClick={(e) => e.stopPropagation()}>
        <div className="imgModalHd">
          <div className="imgModalTitle">Podgląd zdjęcia</div>
          <button
            type="button"
            className="modalCloseBtn"
            onClick={onClose}
            aria-label="Zamknij"
            title="Zamknij"
          >
            <IconX />
          </button>
        </div>

        <div className="imgModalBd">
          <img className="imgFull" src={src} alt={alt || "Zdjęcie"} />
        </div>
      </div>
    </div>
  );
}

/* -------------------- Modal: video in fullscreen -------------------- */
function VideoModal({ src, onClose }) {
  useBodyScrollLock(true);
  useHeaderBehindModal(true);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="imgModalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Odtwarzacz wideo"
      onClick={onClose}
    >
      <div className="videoModalShell" onClick={(e) => e.stopPropagation()}>
        <div className="imgModalHd">
          <div className="imgModalTitle">Film</div>
          <button
            type="button"
            className="modalCloseBtn"
            onClick={onClose}
            aria-label="Zamknij"
            title="Zamknij"
          >
            <IconX />
          </button>
        </div>

        <div className="videoModalBd">
          <video
            className="videoModalPlayer"
            src={src}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------- Modal: kontakt -------------------- */
function ContactModal({ onClose }) {
  useBodyScrollLock(true);
  useHeaderBehindModal(true);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="imgModalBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Kontakt"
      onClick={onClose}
    >
      <div
        className="imgModalShell contactShell"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="imgModalHd">
          <div className="imgModalTitle">Kontakt</div>
          <button
            type="button"
            className="modalCloseBtn"
            onClick={onClose}
            aria-label="Zamknij"
            title="Zamknij"
          >
            <IconX />
          </button>
        </div>

        <div className="imgModalBd contactBd">
          <div className="contactPanel">
            <div className="contactLead">
              Wybierz właściwy kontakt, merytoryczny lub techniczny.
            </div>

            <div className="contactGrid">
              <div className="contactMiniCard">
                <div className="contactMiniTitle">Kontakt merytoryczny</div>

                <div className="contactMiniRow">
                  <div className="contactMiniLabel">Imię</div>
                  <div className="contactMiniValue">Jan Kowalski</div>
                </div>

                <a className="contactMiniRow link" href="tel:+48123123123">
                  <div className="contactMiniLabel">Telefon</div>
                  <div className="contactMiniValue">+48 123 123 123</div>
                </a>

                <a
                  className="contactMiniRow link"
                  href="mailto:kontakt@twojadomena.pl"
                >
                  <div className="contactMiniLabel">Email</div>
                  <div className="contactMiniValue">kontakt@twojadomena.pl</div>
                </a>
              </div>

              <div className="contactMiniCard">
                <div className="contactMiniTitle">Kontakt techniczny</div>

                <div className="contactMiniRow">
                  <div className="contactMiniLabel">Imię</div>
                  <div className="contactMiniValue">Support Team</div>
                </div>

                <a className="contactMiniRow link" href="tel:+48555111222">
                  <div className="contactMiniLabel">Telefon</div>
                  <div className="contactMiniValue">+48 555 111 222</div>
                </a>

                <a
                  className="contactMiniRow link"
                  href="mailto:support@twojadomena.pl"
                >
                  <div className="contactMiniLabel">Email</div>
                  <div className="contactMiniValue">support@twojadomena.pl</div>
                </a>
              </div>
            </div>

            <div className="contactHint">Kliknij poza oknem, aby zamknąć.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- HERO ARTICLE -------------------- */
function HeroArticle({
  imgSrc,
  tagText,
  title,
  subtitle,
  body,
  meta,
  childrenBelow,
}) {
  return (
    <section className="heroArticle">
      <div className="heroMedia">
        <img className="heroImg" src={imgSrc} alt={title} />
        <div className="heroGradient" aria-hidden="true" />
      </div>

      <div className="heroOverlayCard">
        <div className="heroTag">{tagText}</div>
        <h2 className="heroTitle">{title}</h2>
        {subtitle ? <div className="heroSubtitle">{subtitle}</div> : null}
        {body ? <p className="heroBody">{body}</p> : null}
        {meta ? <div className="heroMeta">{meta}</div> : null}
      </div>

      {childrenBelow ? <div className="heroBelow">{childrenBelow}</div> : null}
    </section>
  );
}

/* -------------------- ROOT -------------------- */
function HomeLayout() {
  const [scrolled, setScrolled] = useState(false);

  const [loc] = useState(SLUBKI);
  const [points, setPoints] = useState(() => makeRandomRouteAround(SLUBKI, 4));

  // ✅ TYLKO JEDNA deklaracja navigate
  const navigate = useNavigate();
  const location = useLocation();

  const [openImg, setOpenImg] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  useBodyScrollLock(menuOpen);

  // Dropdown pod "Ścieżka czasu"
  const [timelineOpen, setTimelineOpen] = useState(false);
  const timelineWrapRef = useRef(null);

  // Kontakt popup
  const [contactOpen, setContactOpen] = useState(false);

  const timelineItems = useMemo(
    () => [
      "Okno na Świat, Odzyskanie Niepodległości",
      "Marzenie, Leonid Teliga",
      "Sobek, Legendarny Założyciel",
      "Wejście do Grodu Kerin, Grecja i Początki Europy",
      "Rzym, Koloseum i Gladiatorzy",
      "Słowianie i Wikingowie, Narodziny Polski",
      "Św. Wojciech, Patron i Misjonarz",
      "Odwaga, Pomnik Młodzieży",
    ],
    []
  );

  // zamykaj dropdown klikając poza nim
  useEffect(() => {
    const onDown = (e) => {
      if (!timelineOpen) return;
      const el = timelineWrapRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setTimelineOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [timelineOpen]);

  const routeImages = useMemo(
    () => [
      { src: Zabytek1Img, alt: "Zabytek 1" },
      { src: Zabytek2Img, alt: "Zabytek 2" },
      { src: Zabytek3Img, alt: "Zabytek 3" },
      { src: Zabytek4Img, alt: "Zabytek 4" },
    ],
    []
  );

  const openRandomRouteImage = (pointTitle) => {
    const picked = pickRandom(routeImages);
    if (!picked) return;
    setOpenImg({ src: picked.src, alt: `${pointTitle}, ${picked.alt}` });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (!scrollTo) return;

    // zamknij rzeczy, żeby nie zasłaniały scrolla
    setMenuOpen(false);
    setTimelineOpen(false);

    if (scrollTo === "section-kontakt") {
      setContactOpen(true);
    } else {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // wyczyść state, żeby po odświeżeniu nie scrollowało znowu
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const center = useMemo(() => [loc.lat, loc.lng], [loc.lat, loc.lng]);
  const polyline = useMemo(
    () => [center, ...points.map((p) => [p.lat, p.lng])],
    [center, points]
  );

  const routeSegments = useMemo(() => {
    const nodes = [
      { id: "start", title: "Subkowy, start", lat: loc.lat, lng: loc.lng },
      ...points,
    ];

    const segs = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const d = distanceMeters(a, b);
      segs.push({
        id: `${a.id || `n${i}`}-${b.id || `n${i + 1}`}`,
        from: a.title,
        to: b.title,
        meters: d,
        text: formatDistance(d),
      });
    }

    const total = segs.reduce((sum, s) => sum + (s.meters || 0), 0);
    return { segs, total, totalText: formatDistance(total) };
  }, [loc.lat, loc.lng, points]);

  const welcome = "Witamy na pierwszym przystanku związanym z historią Subkowa";

  const opisBody =
    "Znajdujesz się przy charakterystycznych dębach, które od lat są punktem orientacyjnym dla okolicznych mieszkańców. To dobry moment, żeby rozejrzeć się po otoczeniu i przygotować do kolejnych przystanków na trasie.";

  const [activeTab, setActiveTab] = useState("Miejsca");

  const navigateToSection = (tabName) => {
    const idMap = {
      Miejsca: "section-miejsca",
      Epoki: "section-epoki",
    };
    const el = document.getElementById(idMap[tabName]);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onNavigate = (tabName) => {
    if (tabName === "Ścieżka czasu") {
      setTimelineOpen((v) => !v);
      setMenuOpen(false);
      return;
    }

    if (tabName === "Kontakt") {
      setActiveTab("Kontakt");
      setTimelineOpen(false);
      setMenuOpen(false);
      setContactOpen(true);
      return;
    }

    setActiveTab(tabName);
    setTimelineOpen(false);
    setMenuOpen(false);
    setContactOpen(false);
    navigateToSection(tabName);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setTimelineOpen(false);
        setContactOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const videoWrapRef = useRef(null);
  const [loadVideo, setLoadVideo] = useState(false);

  useEffect(() => {
    const el = videoWrapRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setLoadVideo(true);
          obs.disconnect();
        }
      },
      { root: null, threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ✅ NAWIGACJA: timeline item -> konkretna strona
  const onPickTimelineItem = (label) => {
    setTimelineOpen(false);
    setMenuOpen(false);
    setActiveTab("Ścieżka czasu");

    if (label === "Okno na Świat, Odzyskanie Niepodległości") {
      navigate("/WorldWindow");
    } else {
      navigate("/UnderConstruction");
    }
  };

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
                <button
                  type="button"
                  className={`topTab topTabDrop ${
                    activeTab === "Ścieżka czasu" || timelineOpen
                      ? "active"
                      : ""
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={timelineOpen}
                  onClick={() => onNavigate("Ścieżka czasu")}
                >
                  <span>Ścieżka czasu</span>
                  <span
                    className={`chev ${timelineOpen ? "up" : ""}`}
                    aria-hidden="true"
                  >
                    <IconChevronDown />
                  </span>
                </button>

                {timelineOpen && (
                  <div
                    className="navDropdown"
                    role="menu"
                    aria-label="Ścieżka czasu"
                  >
                    <div className="navDropdownArrow" aria-hidden="true" />
                    <div className="navDropdownGrid">
                      {timelineItems.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className="navDropdownItem"
                          role="menuitem"
                          onClick={() => onPickTimelineItem(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {["Miejsca", "Epoki", "Kontakt"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`topTab ${activeTab === t ? "active" : ""}`}
                  onClick={() => onNavigate(t)}
                >
                  {t}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className="topMobileTrigger"
              aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen((v) => !v);
                setTimelineOpen(false);
              }}
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
            <button
              type="button"
              className="topSidebarItem"
              onClick={() => setTimelineOpen((v) => !v)}
              role="listitem"
              aria-expanded={timelineOpen}
            >
              Ścieżka czasu
            </button>

            {timelineOpen && (
              <div className="sideSubMenu" role="list">
                {timelineItems.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="sideSubItem"
                    onClick={() => {
                      onPickTimelineItem(t);
                      setMenuOpen(false);
                    }}
                    role="listitem"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {["Miejsca", "Epoki", "Kontakt"].map((t) => (
              <button
                key={t}
                type="button"
                className="topSidebarItem"
                onClick={() => {
                  setTimelineOpen(false);
                  if (t === "Kontakt") {
                    setActiveTab("Kontakt");
                    setMenuOpen(false);
                    setContactOpen(true);
                    return;
                  }
                  onNavigate(t);
                }}
                role="listitem"
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        <main className="container contentUnderHeader">
          <div className="grid2">
            <div className="leftCol">
              <div className="card cardLabeled" id="section-miejsca">
                <CardPillLabel text="Miejsca" variant="miejsca" />

                <h1 className="h1">{welcome}</h1>

                <div className="statusRow">
                  <span className="pill ok">Lokalizacja startowa: Subkowy</span>
                  <span className="pill">
                    Punkty na mapie: <strong>{points.length}</strong>
                  </span>
                </div>
              </div>

              <HeroArticle
                imgSrc={twoOaksImg}
                tagText="OPIS MIEJSCA"
                title="Dwa dęby, punkt startowy"
                subtitle="Przystanek 1"
                body={opisBody}
                meta="Subkowy, trasa historyczna"
                childrenBelow={
                  <>
                    <div className="gallery">
                      <button
                        className="imgBtn"
                        onClick={() =>
                          setOpenImg({ src: twoOaksImg, alt: "Dwa dęby" })
                        }
                        aria-label="Otwórz zdjęcie: Dwa dęby"
                      >
                        <img className="img" src={twoOaksImg} alt="Dwa dęby" />
                      </button>

                      <button
                        className="imgBtn"
                        onClick={() =>
                          setOpenImg({ src: twoOaks2Img, alt: "Zabytek 1" })
                        }
                        aria-label="Otwórz zdjęcie: Zabytek 1"
                      >
                        <img
                          className="img"
                          src={twoOaks2Img}
                          alt="Zabytek 1"
                        />
                      </button>
                    </div>

                    <div className="infoGrid">
                      <div className="infoBox">
                        <div className="infoLabel">Gdzie jestem</div>
                        <div className="infoValue">Subkowy, przystanek 1</div>
                      </div>
                      <div className="infoBox">
                        <div className="infoLabel">Co dalej</div>
                        <div className="infoValue">
                          Idź do najbliższego punktu na mapie
                        </div>
                      </div>
                    </div>
                  </>
                }
              />

              <div className="card cardLabeled" id="section-epoki">
                <CardPillLabel text="Lista Przystanków" variant="lista" />

                <div className="routeMeta" style={{ marginTop: 2 }}>
                  <span className="pill">
                    Łącznie: <strong>{routeSegments.totalText}</strong>
                  </span>
                  <span className="pill">
                    Odcinki: <strong>{routeSegments.segs.length}</strong>
                  </span>
                </div>

                <div className="routeList" role="list">
                  {routeSegments.segs.map((s, idx) => (
                    <div className="routeRow" role="listitem" key={s.id}>
                      <div className="routeIdx">{idx + 1}</div>
                      <div className="routeMain">
                        <div className="routeTitle">
                          {s.from} <span className="routeArrow">→</span> {s.to}
                        </div>
                        <div className="routeSub mutedSmall">
                          Odległość: <strong>{s.text}</strong>
                        </div>
                      </div>
                      <div className="routeKm">{s.text}</div>
                    </div>
                  ))}

                  {!routeSegments.segs.length && (
                    <div className="muted">Brak punktów do wyświetlenia.</div>
                  )}
                </div>

                <div className="row gap wrap" style={{ marginTop: 10 }}>
                  <button
                    className="btn"
                    onClick={() => setPoints(makeRandomRouteAround(loc, 4))}
                  >
                    Wylosuj punkty
                  </button>
                </div>
              </div>
            </div>

            <div className="rightSticky">
              <div className="card cardLabeled" id="section-mapa">
                <CardPillLabel text="Mapa trasy" variant="mapa" />

                <div className="mapWrap" style={{ marginTop: 6 }}>
                  <MapContainer
                    center={center}
                    zoom={15}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Polyline positions={polyline} />

                    <Marker position={center}>
                      <Popup>
                        <strong>Subkowy, start</strong>
                        <div className="mutedSmall">
                          {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                        </div>
                        <div className="row gap wrap" style={{ marginTop: 8 }}>
                          <button
                            className="btn btnSmall"
                            onClick={() =>
                              setOpenImg({ src: twoOaksImg, alt: "Dwa dęby" })
                            }
                          >
                            Pokaż zdjęcie
                          </button>
                        </div>
                      </Popup>
                    </Marker>

                    {points.map((p) => (
                      <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        eventHandlers={{
                          click: () => openRandomRouteImage(p.title),
                        }}
                      >
                        <Popup>
                          <strong>{p.title}</strong>
                          <div className="mutedSmall">
                            Kliknij, żeby zobaczyć zdjęcie
                          </div>
                          <div
                            className="row gap wrap"
                            style={{ marginTop: 8 }}
                          >
                            <button
                              className="btn btnSmall"
                              onClick={() => openRandomRouteImage(p.title)}
                            >
                              Pokaż zdjęcie
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                <div className="row gap wrap" style={{ marginTop: 10 }}>
                  <a
                    className="btn"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${loc.lat},${loc.lng}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Otwórz Subkowy w Mapach
                  </a>

                  <button
                    className="btn"
                    onClick={() => setPoints(makeRandomRouteAround(loc, 4))}
                  >
                    Wylosuj punkty
                  </button>
                </div>
              </div>

              <div className="card cardLabeled" id="section-kontakt">
                <CardPillLabel text="Film" variant="film" />

                <div
                  className="videoWrap"
                  ref={videoWrapRef}
                  style={{ marginTop: 6 }}
                >
                  {!loadVideo ? (
                    <div
                      className="videoPlaceholder"
                      role="status"
                      aria-label="Ładowanie filmu"
                    >
                      Film ładuje się, przewiń kawałek niżej lub chwilę poczekaj
                    </div>
                  ) : (
                    <video
                      className="videoPlayer"
                      src={videoTestMp4}
                      controls
                      playsInline
                      preload="metadata"
                    >
                      Twoja przeglądarka nie wspiera odtwarzania wideo.
                    </video>
                  )}
                </div>

                <div className="row gap wrap" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setVideoOpen(true)}
                  >
                    Otwórz film na pełnym ekranie
                  </button>

                  <a
                    className="btn"
                    href={videoTestMp4}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Otwórz film w nowej karcie
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="footerSpace" />
        </main>

        {openImg && (
          <ImageModal
            src={openImg.src}
            alt={openImg.alt}
            onClose={() => setOpenImg(null)}
          />
        )}

        {videoOpen && (
          <VideoModal src={videoTestMp4} onClose={() => setVideoOpen(false)} />
        )}

        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
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
        cursor: pointer;
        padding: 10px 12px;
        border-radius: 999px;
        font-weight: 900;
        font-size: 13px;
        color: rgba(11,19,42,.84);
      }
      .topTab:hover{background: rgba(3,145,232,.08)}
      .topTab.active{
        background: rgba(3,79,189,.10);
        color: rgba(3,79,189,.95);
      }

      .topTabDrop{
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .topTabDrop .chev{
        display:inline-flex;
        opacity: .9;
        transform: translateY(1px);
        transition: transform .14s ease;
      }
      .topTabDrop .chev.up{
        transform: rotate(180deg) translateY(-1px);
      }

      .navDropWrap{ position: relative; }

      .navDropdown{
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(560px, 72vw);
        background: rgba(255,255,255,.98);
        border: 1px solid rgba(15,23,42,.14);
        border-radius: 14px;
        box-shadow: 0 18px 46px rgba(2,6,23,.18);
        padding: 14px;
        z-index: 5002;
      }

      .navDropdownArrow{
        position: absolute;
        top: -7px;
        left: 40px;
        width: 14px;
        height: 14px;
        background: rgba(255,255,255,.98);
        border-left: 1px solid rgba(15,23,42,.14);
        border-top: 1px solid rgba(15,23,42,.14);
        transform: rotate(45deg);
      }

      .navDropdownGrid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 26px;
      }

      .navDropdownItem{
        width: 100%;
        border: 0;
        background: transparent;
        cursor: pointer;
        text-align: left;
        padding: 10px 10px;
        border-radius: 12px;
        color: rgba(11,19,42,.88);
        font-weight: 750;
        font-size: 13px;
        line-height: 1.25;
      }
      .navDropdownItem:hover{ background: rgba(3,145,232,.08); }

      @media (max-width: 820px){
        .navDropdown{ width: min(520px, 86vw); }
        .navDropdownGrid{ grid-template-columns: 1fr; }
      }

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
        cursor: pointer;
        padding: 12px 12px;
        border-radius: 14px;
        font-weight: 950;
        font-size: 14px;
        color: rgba(11,19,42,.86);
        text-align: left;
      }
      .topSidebarItem:hover{
        background: rgba(3,145,232,.08);
        border-color: rgba(3,145,232,.20);
      }

      .sideSubMenu{
        margin-top: -6px;
        padding: 8px 10px 2px 10px;
        border-left: 2px solid rgba(3,145,232,.22);
        display: grid;
        gap: 6px;
      }
      .sideSubItem{
        border: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
        padding: 10px 10px;
        border-radius: 12px;
        color: rgba(11,19,42,.86);
        font-weight: 750;
      }
      .sideSubItem:hover{ background: rgba(3,145,232,.08); }

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

      .grid2{
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--gap);
        align-items: start;
      }

      .leftCol,
      .rightSticky{
        display: grid;
        gap: var(--gap);
        align-content: start;
      }

      .card{
        background: var(--card);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 12px var(--pad) 14px;
      }

      .cardLabeled{
        position: relative;
        padding-top: 26px;
      }

      .cardPill{
        position: absolute;
        left: var(--pad);
        top: 0;
        transform: translateY(-50%);
        z-index: 3;
        display: inline-flex;
        align-items: center;
        max-width: calc(100% - (var(--pad) * 2));
        padding: 7px 25px;
        border-radius: 4px;
        font-weight: 950;
        font-size: 12px;
        letter-spacing: .2px;
        box-shadow: 0 12px 26px rgba(2,6,23,.18);
        border: 1px solid rgba(2,6,23,.10);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .h1{font-size:18px;margin:0 0 10px;line-height:1.25}

      .statusRow{display:flex;flex-wrap:wrap;gap:8px}
      .pill{
        font-size:12px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(15,23,42,.12);
        background: rgba(255,255,255,.72);
        color: rgba(11,19,42,.82);
      }
      .pill.ok{border-color: rgba(34,197,94,.35)}

      .row{display:flex;align-items:center}
      .gap{gap:8px}
      .wrap{flex-wrap:wrap}

      .btn{
        padding: 10px 12px;
        border-radius: 999px;
        border: 1px solid rgba(3,79,189,.28);
        background: rgba(255,255,255,.92);
        color: var(--blue1);
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        text-decoration: none;
      }
      .btn:hover{background: rgba(3,145,232,.08)}
      .btn.btnSmall{ padding: 8px 10px; font-size: 12px }

      .mapWrap{
        height: 320px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(15,23,42,.10);
      }
      .mapWrap .leaflet-container{height:100%;width:100%}

      .gallery{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:10px;
        margin-top: 12px;
      }
      .img{
        width:100%;
        height: 120px;
        object-fit: cover;
        border-radius: 14px;
        border: 1px solid rgba(15,23,42,.10);
        display:block;
      }
      .imgBtn{
        padding:0;
        border:0;
        background:transparent;
        cursor:pointer;
      }

      .infoGrid{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:10px;
        margin-top: 12px;
      }
      .infoBox{
        border-radius: 14px;
        border: 1px solid rgba(3,79,189,.16);
        background: rgba(3,145,232,.06);
        padding: 10px 10px;
      }
      .infoLabel{font-size:12px;color:rgba(11,19,42,.70);font-weight:700;margin-bottom:4px}
      .infoValue{font-size:13px;font-weight:800;color:rgba(11,19,42,.88)}

      .videoWrap{
        margin-top: 6px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(15,23,42,.10);
        background: #000;
        aspect-ratio: 16 / 9;
        width: 100%;
        display: grid;
        place-items: center;
      }

      .videoPlayer{
        width: 100%;
        height: 100%;
        display: block;
        border: 0;
        background: #000;
      }

      .videoPlaceholder{
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        color: rgba(255,255,255,.90);
        font-weight: 800;
        font-size: 13px;
        padding: 14px;
        text-align: center;
        background: linear-gradient(180deg, rgba(0,0,0,.70), rgba(0,0,0,.92));
      }

      .routeMeta{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-bottom: 10px;
      }

      .routeList{ display: grid; gap: 10px; }

      .routeRow{
        display:grid;
        grid-template-columns: 26px 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 10px 10px;
        border: 1px solid rgba(15,23,42,.10);
        border-radius: 14px;
        background: rgba(255,255,255,.78);
      }

      .routeIdx{
        width: 26px;
        height: 26px;
        border-radius: 999px;
        display:grid;
        place-items:center;
        font-weight: 900;
        font-size: 12px;
        color: var(--blue1);
        background: rgba(3,145,232,.10);
        border: 1px solid rgba(3,145,232,.18);
      }

      .routeTitle{
        font-weight: 900;
        font-size: 13px;
        color: rgba(11,19,42,.88);
        line-height: 1.2;
      }

      .routeArrow{
        color: rgba(71,85,105,.9);
        font-weight: 900;
        padding: 0 4px;
      }

      .routeKm{
        font-weight: 900;
        font-size: 12px;
        color: rgba(11,19,42,.82);
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(3,145,232,.08);
        border: 1px solid rgba(3,145,232,.16);
        white-space: nowrap;
      }

      .footerSpace{height: 14px}

      .heroArticle{
        border-radius: var(--radius);
        overflow: hidden;
        border: 1px solid rgba(15,23,42,.10);
        box-shadow: var(--shadow);
        background: var(--card);
      }

      .heroMedia{
        position: relative;
        max-height: 340px;
        overflow: hidden;
        border-radius: 16px;
      }

      .heroImg{
        width: 100%;
        height: auto;
        max-height: 340px;
        object-fit: cover;
        display: block;
      }

      .heroGradient{
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(2,6,23,.15), rgba(2,6,23,.10) 40%, rgba(2,6,23,.55) 100%);
      }

      .heroOverlayCard{padding: 14px var(--pad) 14px}
      .heroTag{
        display:inline-flex;
        align-items:center;
        padding: 6px 10px;
        border-radius: 8px;
        background: var(--blue1);
        color: white;
        font-weight: 900;
        font-size: 12px;
        letter-spacing: .2px;
        margin-bottom: 10px;
      }
      .heroTitle{margin: 0 0 8px;font-size: 22px;line-height: 1.05;font-weight: 950;color: rgba(11,19,42,.92)}
      .heroSubtitle{font-size: 12px;color: var(--muted);font-weight: 700;margin-bottom: 8px}
      .heroBody{margin: 0;color: rgba(11,19,42,.88);line-height: 1.45}
      .heroMeta{margin-top: 10px;font-size: 12px;color: rgba(71,85,105,.9);font-weight: 700}

      .heroBelow{
        padding: 12px var(--pad) 14px;
        border-top: 1px solid rgba(15,23,42,.10);
        background: rgba(255,255,255,.80);
      }

      .imgModalBackdrop{
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.92);
        z-index: 9000;
        display: grid;
        padding: 0;
      }

      .imgModalShell{
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .videoModalShell{
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .imgModalHd{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding: 12px 14px;
        background: rgba(0,0,0,.88);
        border-bottom: 1px solid rgba(255,255,255,.12);
      }

      .imgModalTitle{
        font-weight: 900;
        color: rgba(255,255,255,.94);
        font-size: 13px;
      }

      .modalCloseBtn{
        position: relative;
        z-index: 9001;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.22);
        background: rgba(255,255,255,.10);
        color: rgba(255,255,255,.95);
        cursor: pointer;
      }
      .modalCloseBtn:hover{background: rgba(255,255,255,.16)}

      .imgModalBd{
        display:flex;
        align-items:center;
        justify-content:center;
        padding: 10px;
        overflow: hidden;
      }

      .imgFull{
        max-width: 90vw;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 16px;
        display:block;
      }

      .videoModalBd{
        padding: 10px;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .videoModalPlayer{
        width: min(1100px, 92vw);
        height: auto;
        max-height: 82vh;
        border-radius: 16px;
        background: #000;
      }

      .contactShell{
        width: min(760px, 92vw);
        height: auto;
        max-height: 92vh;
        margin: auto;
        border-radius: 16px;
        overflow: hidden;
        background: transparent;
      }

      .contactBd{
        width: 100%;
        padding: 12px;
        overflow: auto;
        display: grid;
        place-items: center;
      }

      .contactPanel{
        width: min(620px, 90vw);
        background: rgba(255,255,255,.96);
        border: 1px solid rgba(15,23,42,.12);
        border-radius: 16px;
        box-shadow: 0 18px 46px rgba(2,6,23,.22);
        padding: 14px;
      }

      .contactLead{
        font-size: 13px;
        font-weight: 800;
        color: rgba(71,85,105,.92);
        margin-bottom: 12px;
        line-height: 1.25;
      }

      .contactGrid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      @media (max-width: 760px){
        .contactGrid{ grid-template-columns: 1fr; }
      }

      .contactMiniCard{
        border: 1px solid rgba(3,79,189,.14);
        background: rgba(247,251,255,.70);
        border-radius: 14px;
        padding: 12px;
      }

      .contactMiniTitle{
        font-weight: 950;
        font-size: 13px;
        color: rgba(3,79,189,.95);
        margin-bottom: 8px;
      }

      .contactMiniRow{
        display: grid;
        grid-template-columns: 92px 1fr;
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid rgba(15,23,42,.10);
        background: rgba(255,255,255,.86);
        text-decoration: none;
        color: inherit;
        margin-top: 8px;
      }

      .contactMiniRow.link:hover{
        background: rgba(3,145,232,.08);
        border-color: rgba(3,145,232,.22);
      }

      .contactMiniLabel{
        font-size: 11px;
        font-weight: 850;
        color: rgba(71,85,105,.90);
      }

      .contactMiniValue{
        font-size: 13px;
        font-weight: 950;
        color: rgba(11,19,42,.92);
        word-break: break-word;
      }

      .contactHint{
        margin-top: 12px;
        font-size: 12px;
        font-weight: 750;
        color: rgba(71,85,105,.80);
        text-align: center;
      }

      @media (max-width: 360px){
        .gallery{ grid-template-columns: 1fr; }
        .infoGrid{ grid-template-columns: 1fr; }
        .routeRow{ grid-template-columns: 26px 1fr; }
        .routeKm{ grid-column: 1 / -1; justify-self: start; }
      }

      @media (min-width: 980px){
        .container{max-width: 1100px;margin:0 auto}
        .heroTitle{font-size: 32px}
      }
    `}</style>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
