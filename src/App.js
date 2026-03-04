// src/App.js
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import twoOaksImg from "./img/two-oaks.png";
import twoOaks2Img from "./img/Zabytek1.png";
import Zabytek1Img from "./img/Zabytek1.png";
import Zabytek2Img from "./img/Zabytek2.png";
import Zabytek3Img from "./img/Zabytek3.png";
import Zabytek4Img from "./img/Zabytek4.png";

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

/* -------------------- Slubki fixed location -------------------- */
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

// Haversine distance in meters
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

/* -------------------- Image fullscreen modal -------------------- */
function ImageModal({ src, alt, onClose }) {
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
      onClick={onClose}
    >
      <div className="imgModalShell" onClick={(e) => e.stopPropagation()}>
        <div className="imgModalHd">
          <div className="imgModalTitle">Podgląd zdjęcia</div>
          <button className="btn ghost imgClose" onClick={onClose}>
            Zamknij
          </button>
        </div>

        <div className="imgModalBd">
          <img className="imgFull" src={src} alt={alt || "Zdjęcie"} />
        </div>
      </div>
    </div>
  );
}

/* -------------------- YouTube helper -------------------- */
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be"))
      return u.pathname.replace("/", "").trim();
    const v = u.searchParams.get("v");
    if (v) return v.trim();
    const parts = u.pathname.split("/").filter(Boolean);
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1].trim();
    return "";
  } catch {
    return "";
  }
}

/* -------------------- ROOT -------------------- */
export default function App() {
  const [scrolled, setScrolled] = useState(false);

  const [loc] = useState(SLUBKI);
  const [points, setPoints] = useState(() => makeRandomRouteAround(SLUBKI, 4));

  const ytUrl = "https://youtu.be/CDdNJNtv8LQ";
  const ytId = useMemo(() => getYouTubeId(ytUrl), [ytUrl]);
  const ytEmbed = ytId
    ? `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`
    : "";

  const [openImg, setOpenImg] = useState(null);

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

  const center = useMemo(() => [loc.lat, loc.lng], [loc.lat, loc.lng]);
  const polyline = useMemo(
    () => [center, ...points.map((p) => [p.lat, p.lng])],
    [center, points]
  );

  // lista odcinków trasy: Start -> P1 -> P2 -> ...
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

  return (
    <>
      <ThemeStyle />

      <div className="phoneOnly">
        {/* MAPA W TLE ZA HEADER */}
        <div className="headerMapBg" aria-hidden="true">
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={polyline} />
          </MapContainer>
          <div className="headerMapFade" />
        </div>

        <header className={`header ${scrolled ? "shadow" : ""}`}>
          <div className="headerInner">
            <div className="brandDot" />
            <div className="brand">
              Trasa historyczna
              <div className="brandSub">QR gra terenowa</div>
            </div>
          </div>
        </header>

        <main className="container">
          <div className="grid2">
            {/* LEWA KOLUMNA */}
            <div className="leftCol">
              <div className="card">
                <h1 className="h1">{welcome}</h1>

                <div className="statusRow">
                  <span className="pill ok">Lokalizacja startowa: Subkowy</span>
                  <span className="pill">
                    Punkty na mapie: <strong>{points.length}</strong>
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="cardHd">
                  <div className="cardTitle">Opis miejsca</div>
                  <div className="mutedSmall">Dwa dęby, punkt startowy</div>
                </div>

                <p className="p">
                  Blee Bllee NEw Test Znajdujesz się przy charakterystycznych
                  dębach, które od lat są punktem orientacyjnym dla okolicznych
                  mieszkańców. To dobry moment, żeby rozejrzeć się po otoczeniu
                  i przygotować do kolejnych przystanków na trasie.
                </p>

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
                    <img className="img" src={twoOaks2Img} alt="Zabytek 1" />
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
              </div>

              {/* NOWY KONTENER: lista przystanków i odległości */}
              <div className="card">
                <div className="cardHd">
                  <div className="cardTitle">Lista przystanków</div>
                  <div className="mutedSmall">Odległości między punktami</div>
                </div>

                <div className="routeMeta">
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

            {/* PRAWA KOLUMNA (sticky na desktopie) */}
            <div className="rightSticky">
              {/* MAPA */}
              <div className="card">
                <div className="cardHd">
                  <div className="cardTitle">Mapa trasy</div>
                  <div className="mutedSmall">
                    Start Subkowy i kolejne punkty
                  </div>
                </div>

                <div className="mapWrap">
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

              {/* FILM, jako ostatni element po prawej na desktopie */}
              <div className="card">
                <div className="cardHd">
                  <div className="cardTitle">Film</div>
                  <div className="mutedSmall">Materiał o miejscu</div>
                </div>

                <div className="videoWrap">
                  {ytEmbed ? (
                    <iframe
                      title="Film YouTube"
                      src={ytEmbed}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <div className="muted">
                      Nie udało się wczytać linku do filmu.
                    </div>
                  )}
                </div>

                <div className="row gap wrap" style={{ marginTop: 10 }}>
                  <a
                    className="btn"
                    href={ytUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Otwórz film w YouTube
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
      body{margin:0;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text)}

      .phoneOnly{
        width: 100%;
        max-width: 430px;
        margin: 0 auto;
        min-height: 100vh;
        position: relative;
        background:
          radial-gradient(900px 500px at 15% 0%, rgba(3,145,232,.12), transparent 60%),
          radial-gradient(900px 500px at 85% 10%, rgba(34,197,94,.10), transparent 60%),
          var(--bg);
        overflow: hidden;
      }

      /* ===== MAPA W TLE ZA HEADER ===== */
      .headerMapBg{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 170px;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
      }
      .headerMapBg .leaflet-container{
        height: 100%;
        width: 100%;
        transform: scale(1.08);
      }
      .headerMapFade{
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(2,6,23,.22), rgba(2,6,23,.04) 55%, rgba(247,251,255,1) 100%);
      }

      .header{
        position: sticky;
        top: 0;
        z-index: 999;
        background: linear-gradient(90deg, var(--blue1), var(--blue3));
        color: white;
        border-bottom: 1px solid rgba(255,255,255,.16);
      }
      .header.shadow{box-shadow:0 8px 18px rgba(2,6,23,.22)}

      .headerInner{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding: 12px var(--pad);
      }

      .brandDot{
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: rgba(255,255,255,.92);
        box-shadow: 0 0 0 4px rgba(255,255,255,.12);
        flex: 0 0 auto;
      }
      .brand{font-weight:800; letter-spacing:.2px; line-height:1.05}
      .brandSub{font-size:12px; opacity:.9; font-weight:600; margin-top:2px}

      .container{
        position: relative;
        z-index: 2;
        padding: 12px var(--pad) 18px;
        display:grid;
        gap: var(--gap);
      }
      .container:before{
        content:"";
        display:block;
        height: 78px;
      }

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

      .cardHd{
        display:flex;
        align-items:baseline;
        justify-content:space-between;
        gap:10px;
        margin-bottom: 6px;
      }
      .cardTitle{font-weight:800; color: var(--blue1)}
      .mutedSmall{font-size:12px;color:var(--muted)}

      .h1{font-size:18px;margin:0 0 10px;line-height:1.25}
      .p{margin:0;color:rgba(11,19,42,.88);line-height:1.45}

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
      .btn.primary{
        background: var(--blue2);
        border-color: var(--blue2);
        color: white;
      }
      .btn.primary:hover{background: var(--blue3)}
      .btn.ghost{
        background: rgba(255,255,255,.12);
        border-color: rgba(255,255,255,.35);
        color: white;
      }
      .btn.ghost:hover{background: rgba(255,255,255,.18)}
      .btnSmall{padding: 8px 10px; font-size: 12px}

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
      .imgBtn:focus{
        outline: 3px solid rgba(3,145,232,.35);
        outline-offset: 3px;
        border-radius: 16px;
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
      }
      .videoWrap iframe{
        width: 100%;
        height: 100%;
        border: 0;
        display:block;
      }

      /* ===== Lista przystanków ===== */
      .routeMeta{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-bottom: 10px;
      }

      .routeList{
        display: grid;
        gap: 10px;
      }

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

      /* ===== FULLSCREEN IMAGE (responsive) ===== */
      .imgModalBackdrop{
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.92);
        z-index: 3000;
        display: grid;
        padding: 0;
      }

      .imgModalShell{
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
      @media (min-width: 900px){
        .phoneOnly{
          max-width: none;
          overflow: visible;
        }

        .headerMapBg{
          height: 220px;
        }

        .container{
          max-width: 1200px;
          margin: 0 auto;
          padding: 18px var(--pad) 26px;
          gap: var(--gap);
        }

        .container:before{
          height: 110px;
        }

        .grid2{
          grid-template-columns: 1.1fr 0.9fr;
          gap: var(--gap);
        }

        .rightSticky{
          position: sticky;
          top: 74px;
        }

        .mapWrap{
          height: min(54vh, 520px);
        }

        .img{
          height: 180px;
        }

        .routeTitle{font-size: 14px}
        .h1{font-size: 22px}
        .p{font-size: 15px}
        .btn{font-size: 13px; padding: 11px 14px}

        /* modal padding and rounding on desktop */
        .imgModalHd{ padding: 14px 18px }
        .imgModalBd{ padding: 18px }
        .imgFull{ border-radius: 16px }
      }

      @media (min-width: 1300px){
        .container{max-width: 1360px}
      }
    `}</style>
  );
}
