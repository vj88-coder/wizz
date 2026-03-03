import React, { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   WIZZ · Progressive Unlock Prototype
   Product Card Demo · Head of Product Case
   ═══════════════════════════════════════════════════════ */

// Design tokens from Wizz app
const C = {
  bg: "linear-gradient(180deg, #2D1B33 0%, #1A1020 40%, #15101A 100%)",
  bubbleThem: "rgba(180,140,170,0.25)",
  bubbleMe: "rgba(180,140,170,0.3)",
  bubbleBorder: "rgba(200,170,190,0.15)",
  pink: "#E91E8C",
  green: "#4ADE80",
  blue: "#4FC3F7",
  yellow: "#FFD60A",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.3)",
  card: "rgba(255,255,255,0.08)",
  input: "rgba(255,255,255,0.08)",
};

const MILESTONES = {
  3:  { label: "Bio & Interests", icon: "✨", items: ["Bio","Interest stickers","Zodiac sign"] },
  5:  { label: "Music & Photos",  icon: "🎵", items: ["Deezer music","Photos 2-3"] },
  10: { label: "Full Profile",    icon: "🏆", items: ["Video","Full profile access","Full Profile badge"] },
};

const SCRIPT = [
  { f:"them", t:"heyy 👋" },          // 1
  { f:"me",   t:"hey! what's up" },    // 2
  { f:"them", t:"nm just chilling hbu" }, // 3  → UNLOCK bio
  { f:"me",   t:"same haha, where u from?" }, // 4
  { f:"them", t:"LA 🌴 you?" },        // 5  → UNLOCK music
  { f:"me",   t:"paris! that's cool" }, // 6
  { f:"them", t:"omg i love paris always wanted to go" }, // 7
  { f:"me",   t:"you should! it's amazing in spring 🌸" }, // 8
  { f:"them", t:"adding it to my list rn 😂" }, // 9
  { f:"me",   t:"haha let me know if you ever come" }, // 10 → UNLOCK full + MD
  { f:"them", t:"bet! we should def hang" }, // 11
  { f:"me",   t:"for sure 😊" },       // 12
];

const PROFILE = {
  name: "Maya", emojis: "🦋💗", age: 19, country: "US 🇺🇸",
  bio: "art hoe in recovery 🎨 cat mom x2\nprobably listening to phoebe bridgers rn",
  interests: ["Art", "Music", "Photography", "Cats", "Travel"],
  zodiac: "♒ Aquarius",
  music: { song: "Motion Sickness", artist: "Phoebe Bridgers" },
};

// ─── Reusable pieces ───

const Lock = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const Unlock = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" />
  </svg>
);

const WizzLogo = ({ size = 18 }) => (
  <span style={{
    fontWeight: 900, fontSize: size, fontStyle: "italic", letterSpacing: size > 16 ? 3 : 2,
    color: "#000",
    textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
  }}>WIZZ</span>
);

const Chip = ({ text }) => (
  <span style={{ background: C.card, borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#fff", display: "inline-flex" }}>
    {text}
  </span>
);

const Avatar = ({ badge }) => (
  <div style={{
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg,#E91E8C,#7B2D8E)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0, position: "relative",
    border: badge ? `2px solid ${C.yellow}` : "2px solid transparent",
  }}>
    👩
    {badge && (
      <div style={{
        position: "absolute", bottom: -1, right: -1,
        background: C.yellow, borderRadius: "50%",
        width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 8, border: "2px solid #1A1020",
      }}>★</div>
    )}
  </div>
);

// ─── Milestone progress bar ───

function MilestoneBar({ count }) {
  const ms = [3, 5, 10];
  return (
    <div style={{ padding: "6px 16px 8px", display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,0.2)" }}>
      <span style={{ color: C.muted, fontSize: 10, marginRight: 4 }}>{count}/10</span>
      {ms.map((m, i) => {
        const prev = i === 0 ? 0 : ms[i - 1];
        const pct = Math.min(100, Math.max(0, ((count - prev) / (m - prev)) * 100));
        const ok = count >= m;
        return (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 3, flex: 1 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: C.pink, width: ok ? "100%" : `${Math.max(0, pct)}%`, opacity: ok ? 1 : 0.7, transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, minWidth: 16, textAlign: "center", color: ok ? C.pink : C.dim }}>
              {ok ? MILESTONES[m].icon : m}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── In-chat unlock animation ───

function UnlockBanner({ milestone, onDone }) {
  const [p, setP] = useState("enter");
  const d = MILESTONES[milestone];

  useEffect(() => {
    const a = setTimeout(() => setP("show"), 50);
    const b = setTimeout(() => setP("exit"), 2800);
    const c = setTimeout(onDone, 3400);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, []);

  if (!d) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "center", padding: "8px 16px",
      opacity: p === "show" ? 1 : 0,
      transform: p === "enter" ? "scale(.85) translateY(12px)" : p === "exit" ? "translateY(-8px)" : "scale(1)",
      transition: "all .5s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{
        background: "linear-gradient(135deg,rgba(233,30,140,.15),rgba(255,214,10,.1))",
        border: "1px solid rgba(233,30,140,.3)", borderRadius: 16,
        padding: "14px 24px", textAlign: "center", backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontSize: 28 }}>🔓</div>
        <div style={{ color: C.pink, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>Unlocked</div>
        <div style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginTop: 2 }}>{d.label}</div>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{d.items.join(" · ")}</div>
      </div>
    </div>
  );
}

// ─── Reveal bottom sheet ───

function RevealSheet({ milestone, onClose, onBuy }) {
  const d = MILESTONES[milestone];
  if (!d) return null;
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(10,5,15,.85)",
      display: "flex", alignItems: "flex-end", zIndex: 100, backdropFilter: "blur(6px)",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(180deg,#2A1E30,#1A1020)",
        borderRadius: "24px 24px 0 0", padding: "20px 20px 34px", width: "100%",
        animation: "su .3s cubic-bezier(.22,1,.36,1)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.dim, margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 40, marginBottom: 6 }}>{d.icon}</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Reveal {d.label}</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Skip ahead and unlock instantly</div>
        </div>
        <div style={{ background: C.card, borderRadius: 14, padding: 14, marginBottom: 18 }}>
          {d.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
              borderBottom: i < d.items.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none",
              color: "#fff", fontSize: 13,
            }}>
              <span style={{ color: C.pink }}><Unlock s={14} /></span>{item}
            </div>
          ))}
        </div>
        <button onClick={onBuy} style={{
          width: "100%", padding: 15, borderRadius: 16, border: "none",
          background: `linear-gradient(135deg,${C.pink},#9C27B0)`,
          color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          💎 Reveal · 100 WiCoins
        </button>
        <button onClick={onClose} style={{
          width: "100%", padding: 12, border: "none", background: "transparent",
          color: C.muted, fontSize: 13, cursor: "pointer", marginTop: 6,
        }}>
          Keep chatting to unlock free
        </button>
      </div>
    </div>
  );
}

// ─── Locked profile section ───

function Section({ title, ms, ok, onReveal, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: ok ? "#fff" : C.dim, fontSize: 14, fontWeight: 600 }}>
          {ok ? <Unlock s={14} /> : <Lock s={14} />}<span>{title}</span>
        </div>
        {!ok && <span style={{ color: C.dim, fontSize: 11 }}>{ms} msgs</span>}
      </div>
      {ok ? children : (
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ filter: "blur(8px)", opacity: .2, pointerEvents: "none" }}>{children}</div>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted }}>
            <Lock s={24} />
            <div style={{ fontSize: 13 }}>🔓 Send {ms} messages to unlock</div>
            <button onClick={onReveal} style={{
              marginTop: 4, padding: "7px 16px", borderRadius: 20,
              border: `1px solid ${C.pink}55`, background: "rgba(233,30,140,.1)",
              color: C.pink, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              💎 Reveal Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile view ───

function ProfileView({ cnt, revealed, onClose, onReveal }) {
  const lv = Math.max(cnt, ...[0, ...revealed]);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#15101A", zIndex: 90, overflowY: "auto", animation: "sr .25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "50px 16px 12px", background: "linear-gradient(180deg,#2D1B33,transparent)" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 22 }}>‹</button>
        <span style={{ flex: 1, textAlign: "center", color: "white", fontWeight: 700, fontSize: 16 }}>{PROFILE.name}'s Profile</span>
        <div style={{ width: 24 }} />
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{
          width: "100%", aspectRatio: "3/4", borderRadius: 20,
          background: "linear-gradient(135deg,#3D2244,#2A1530)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 80, position: "relative",
        }}>
          👩
          <div style={{ position: "absolute", bottom: 16, left: 16 }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 22 }}>{PROFILE.name}, {PROFILE.age}</span>
            <span style={{ color: C.blue, marginLeft: 6, fontSize: 16 }}>✓</span>
          </div>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <Chip text={`🎂 ${PROFILE.age}`} /><Chip text={PROFILE.country} />
        </div>

        <Section title="Bio & Interests" ms={3} ok={lv >= 3} onReveal={() => onReveal(3)}>
          <p style={{ color: "#fff", fontSize: 14, lineHeight: 1.5, margin: 0, whiteSpace: "pre-line" }}>{PROFILE.bio}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {PROFILE.interests.map((t, i) => <Chip key={i} text={t} />)}
          </div>
          <div style={{ marginTop: 8 }}><Chip text={PROFILE.zodiac} /></div>
        </Section>

        <Section title="Music & Photos" ms={5} ok={lv >= 5} onReveal={() => onReveal(5)}>
          <div style={{ background: C.card, borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#E91E8C,#7B2D8E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎵</div>
            <div>
              <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{PROFILE.music.song}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{PROFILE.music.artist}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ aspectRatio: "3/4", borderRadius: 14, background: `linear-gradient(${135 + i * 40}deg,#3D2244,#2A1530)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👩</div>
            ))}
          </div>
        </Section>

        <Section title="Video & Full Profile Badge" ms={10} ok={lv >= 10} onReveal={() => onReveal(10)}>
          <div style={{ aspectRatio: "16/9", borderRadius: 14, background: C.card, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 32 }}>▶️</div><div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Video intro</div></div>
          </div>
          <div style={{
            background: "linear-gradient(135deg,rgba(255,214,10,.1),rgba(233,30,140,.08))",
            border: "1px solid rgba(255,214,10,.25)", borderRadius: 14,
            padding: 14, display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <div>
              <div style={{ color: C.yellow, fontSize: 13, fontWeight: 700 }}>Full Profile Badge</div>
              <div style={{ color: C.muted, fontSize: 11 }}>Visible to others in swipe stack</div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ─── Dev annotation (side panel) ───

const Note = ({ tag, children, active }) => (
  <div style={{
    padding: "8px 10px", borderRadius: 10, fontSize: 11, lineHeight: 1.55,
    color: active ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.3)",
    background: active ? "rgba(233,30,140,.08)" : "transparent",
    borderLeft: active ? `2px solid ${C.pink}` : "2px solid rgba(255,255,255,.06)",
    transition: "all .3s ease",
  }}>
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", color: active ? C.pink : "rgba(255,255,255,.2)", marginBottom: 3 }}>{tag}</div>
    {children}
  </div>
);

/* ═══════════════════════════
   MAIN
   ═══════════════════════════ */

export default function App() {
  const [msgs, setMsgs] = useState([]);
  const [cnt, setCnt] = useState(0);
  const [si, setSi] = useState(0);
  const [unlockAnim, setUnlockAnim] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showReveal, setShowReveal] = useState(null);
  const [revealed, setRevealed] = useState(new Set());
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  const scroll = () => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; };
  useEffect(scroll, [msgs, unlockAnim, typing]);

  const lv = Math.max(cnt, ...[0, ...revealed]);
  const done = si >= SCRIPT.length;

  const push = (msg, c) => {
    setMsgs(p => [...p, { ...msg, id: Date.now() + Math.random() }]);
    setCnt(c);
    if (MILESTONES[c] && !revealed.has(c)) setTimeout(() => setUnlockAnim(c), 400);
  };

  const tap = () => {
    if (done || unlockAnim || typing) return;
    const cur = SCRIPT[si], nc = cnt + 1;
    if (cur.f === "me") {
      push(cur, nc);
      setSi(si + 1);
      // Auto-reply from them
      if (si + 1 < SCRIPT.length && SCRIPT[si + 1].f === "them") {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          push(SCRIPT[si + 1], nc + 1);
          setSi(si + 2);
        }, 600 + Math.random() * 500);
      }
    } else {
      push(cur, nc);
      setSi(si + 1);
    }
  };

  const buyReveal = (ms) => {
    setRevealed(p => new Set([...p, ms]));
    setShowReveal(null);
  };

  const next = si < SCRIPT.length ? SCRIPT[si] : null;
  const nextUnlock = [3, 5, 10].find(m => m > cnt && !revealed.has(m));

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      minHeight: "100vh", background: "#08060A", padding: "20px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      color: "white",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <WizzLogo size={24} />
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Progressive Unlock</div>
      </div>

      {/* CTA */}
      <div style={{
        maxWidth: 560, width: "100%",
        background: "rgba(233,30,140,.06)", border: "1px solid rgba(233,30,140,.12)",
        borderRadius: 12, padding: "10px 16px", marginBottom: 16,
        textAlign: "center", fontSize: 12, color: C.muted, lineHeight: 1.5,
      }}>
        {cnt === 0 && <>👆 <span style={{ color: C.pink, fontWeight: 600 }}>Tap the input bar</span> to send messages. Profile content unlocks at messages <span style={{ color: C.yellow, fontWeight: 600 }}>3</span>, <span style={{ color: C.yellow, fontWeight: 600 }}>5</span>, and <span style={{ color: C.yellow, fontWeight: 600 }}>10</span> (= MD). Tap avatar to view profile.</>}
        {cnt > 0 && cnt < 3 && <>{cnt}/3, keep going to unlock <span style={{ color: C.pink, fontWeight: 600 }}>Bio & Interests</span>. Or tap 💎 in chat to pay and skip</>}
        {cnt >= 3 && cnt < 5 && <>✨ Bio unlocked! {cnt}/5, next: <span style={{ color: C.pink, fontWeight: 600 }}>Music & Photos</span></>}
        {cnt >= 5 && cnt < 10 && <>🎵 Music unlocked! {cnt}/10, reach <span style={{ color: C.yellow, fontWeight: 600 }}>MD (10 messages)</span> for full profile</>}
        {cnt >= 10 && <>🏆 <span style={{ color: C.yellow, fontWeight: 600 }}>MD reached!</span> Full profile unlocked. Tap avatar to see badge.</>}
      </div>

      {/* Layout */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 580 }}>

        {/* ═══ PHONE ═══ */}
        <div style={{
          width: 320, minWidth: 320, height: 640, borderRadius: 38,
          border: "3px solid #333", overflow: "hidden",
          position: "relative", display: "flex", flexDirection: "column",
          background: C.bg, boxShadow: "0 24px 80px rgba(0,0,0,.6)",
        }}>
          {/* Status bar */}
          <div style={{ height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>9:41</span>
            <div style={{ width: 110, height: 28, borderRadius: 14, background: "#000" }} />
            <span style={{ fontSize: 12 }}>●● 📶 🔋</span>
          </div>

          {/* Chat header */}
          <div onClick={() => setShowProfile(true)} style={{ display: "flex", alignItems: "center", padding: "6px 12px 8px", gap: 10, cursor: "pointer" }}>
            <span style={{ fontSize: 22 }}>‹</span>
            <Avatar badge={lv >= 10} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{PROFILE.name}</span>
                <span style={{ fontSize: 14 }}>{PROFILE.emojis}</span>
                <span style={{ color: C.blue, fontSize: 14 }}>✓</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
                <span style={{ color: C.green, fontSize: 11, fontWeight: 500 }}>is online now</span>
              </div>
            </div>
            <span style={{ color: C.muted }} onClick={e => { e.stopPropagation(); setShowProfile(true); }}>⋮</span>
          </div>

          {/* Progress bar */}
          <MilestoneBar count={cnt} />

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ textAlign: "center", padding: "6px 0 10px" }}>
              <WizzLogo size={18} />
              <div style={{ color: "rgba(220,180,200,.5)", fontSize: 11, marginTop: 2 }}>Today</div>
            </div>

            {cnt < 10 && !unlockAnim && nextUnlock && (
              <div style={{ textAlign: "center", padding: "2px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ background: "rgba(233,30,140,.08)", border: "1px solid rgba(233,30,140,.2)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: C.muted }}>
                  🔒 {MILESTONES[nextUnlock].label} unlocks at message {nextUnlock}
                </span>
                {cnt >= 1 && (
                  <span
                    onClick={() => { setShowProfile(true); setTimeout(() => setShowReveal(nextUnlock), 300); }}
                    style={{ fontSize: 11, color: C.pink, cursor: "pointer", opacity: .8, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    💎 Or reveal now for 100 WiCoins
                  </span>
                )}
              </div>
            )}

            {msgs.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.f === "me" ? "flex-end" : "flex-start", animation: "mi .2s ease-out" }}>
                <div style={{
                  maxWidth: "70%", padding: "10px 14px",
                  borderRadius: m.f === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: m.f === "me" ? C.bubbleMe : C.bubbleThem,
                  border: `1px solid ${C.bubbleBorder}`, color: "white", fontSize: 15, lineHeight: 1.4,
                }}>{m.t}</div>
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex" }}>
                <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: C.bubbleThem, border: `1px solid ${C.bubbleBorder}`, display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `dot 1s infinite ${i * .15}s` }} />)}
                </div>
              </div>
            )}

            {unlockAnim && <UnlockBanner milestone={unlockAnim} onDone={() => setUnlockAnim(null)} />}

            {cnt >= 3 && !unlockAnim && msgs.length > 0 && (
              <div style={{ textAlign: "center", padding: "6px 0", color: C.dim, fontSize: 12 }}>
                You have unlocked {cnt >= 10 ? "full profile" : cnt >= 5 ? "music & photos" : "all bios"}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 24px", background: "rgba(0,0,0,.15)" }}>
            <span style={{ color: C.muted, fontSize: 18, cursor: "pointer" }}>🎭</span>
            <span style={{ color: C.muted, fontSize: 11, fontWeight: 800, border: `1.5px solid ${C.dim}`, borderRadius: 6, padding: "2px 6px", cursor: "pointer" }}>GIF</span>
            <span style={{ color: C.muted, fontSize: 18, cursor: "pointer" }}>🎤</span>
            <div onClick={tap} style={{
              flex: 1, background: C.input, borderRadius: 22,
              padding: "9px 14px", fontSize: 14, cursor: "pointer", userSelect: "none",
              color: done ? C.dim : "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.06)",
            }}>
              {done ? "Conversation complete ✓" : unlockAnim || typing ? "..." : next?.f === "me" ? next.t : "Tap to continue…"}
            </div>
            <span onClick={tap} style={{ color: C.pink, fontSize: 20, cursor: done ? "default" : "pointer", opacity: done ? .3 : 1 }}>▶</span>
          </div>

          {showProfile && <ProfileView cnt={cnt} revealed={revealed} onClose={() => setShowProfile(false)} onReveal={m => setShowReveal(m)} />}
          {showReveal && <RevealSheet milestone={showReveal} onClose={() => setShowReveal(null)} onBuy={() => buyReveal(showReveal)} />}
        </div>

        {/* ═══ DEV NOTES ═══ */}
        <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 6, paddingTop: 2, flexShrink: 0 }}>

          <Note tag="Unlock flow" active={cnt < 3}>
            0 msg → photo 1 + name + age + country<br />
            3 msg → bio + stickers + zodiac<br />
            5 msg → music + photos 2-3<br />
            10 msg → video + badge (= MD)
          </Note>

          <Note tag="Msg 3 · Bio" active={cnt >= 2 && cnt < 5}>
            Animation: 🔓 scale bounce (3s)<br />
            System msg: "You unlocked all bios"<br />
            Both users see it
          </Note>

          <Note tag="Msg 5 · Music" active={cnt >= 4 && cnt < 10}>
            Deezer already integrated<br />
            Photos 2-3 unblur<br />
            Same animation pattern
          </Note>

          <Note tag="Msg 10 · MD" active={cnt >= 9}>
            Full profile + video<br />
            🏆 badge visible in swipe stack<br />
            = social proof for real convos
          </Note>

          <Note tag="Reveal booster" active={showReveal !== null || revealed.size > 0}>
            💎 100 WiCoins per tier<br />
            Unlocks next tier only<br />
            Events: reveal_tapped → purchased / abandoned
          </Note>

          <Note tag="Edge cases" active={false}>
            Empty profiles → feature disabled<br />
            One-sided → both must exchange<br />
            Block → re-lock · Existing convos → no retroactive lock
          </Note>
        </div>
      </div>

      <div style={{ color: C.dim, fontSize: 11, marginTop: 12 }}>
        {cnt}/10 messages · Tap input to advance · Tap avatar for profile
      </div>

      <style>{`
        @keyframes mi { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes dot { 0%,60%,100% { transform:translateY(0); opacity:.4 } 30% { transform:translateY(-4px); opacity:1 } }
        @keyframes su { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes sr { from { transform:translateX(100%) } to { transform:translateX(0) } }
        * { box-sizing:border-box; margin:0; padding:0 }
        ::-webkit-scrollbar { display:none }
      `}</style>
    </div>
  );
}
