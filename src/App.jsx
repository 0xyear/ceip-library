import { useState, useEffect, useMemo } from "react";

const RANK_COLORS = { S: "#D4A853", A: "#4CAF7D", B: "#5B8EC4", C: "#8A8FA0" };
const RANK_BG = { S: "rgba(212,168,83,0.12)", A: "rgba(76,175,125,0.10)", B: "rgba(91,142,196,0.08)", C: "rgba(138,143,160,0.06)" };

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [rankFilter, setRankFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/data")
      .then(r => { if (!r.ok) throw new Error("Fetch failed"); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const people = useMemo(() => {
    const map = {};
    data.forEach(d => {
      const name = d["人物名"];
      if (!name) return;
      if (!map[name]) map[name] = { name, cat: d["カテゴリ"], items: [], S: 0, A: 0, B: 0, C: 0 };
      const rank = d["信頼度(S/A/B/C)"] || d["信頼度\n(S/A/B/C)"] || "";
      if (rank in RANK_COLORS) map[name][rank]++;
      map[name].items.push(d);
    });
    return Object.values(map).sort((a, b) => {
      const scoreA = a.S * 4 + a.A * 3 + a.B * 2 + a.C;
      const scoreB = b.S * 4 + b.A * 3 + b.B * 2 + b.C;
      return scoreB - scoreA;
    });
  }, [data]);

  const selectedData = useMemo(() => {
    if (!selectedPerson) return data;
    return data.filter(d => d["人物名"] === selectedPerson);
  }, [data, selectedPerson]);

  const filteredData = useMemo(() => {
    let items = selectedData;
    if (rankFilter !== "all") {
      items = items.filter(d => {
        const r = d["信頼度(S/A/B/C)"] || d["信頼度\n(S/A/B/C)"] || "";
        return r === rankFilter;
      });
    }
    if (mediaFilter !== "all") {
      items = items.filter(d => (d["媒体"] || "") === mediaFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(d =>
        Object.values(d).some(v => String(v).toLowerCase().includes(q))
      );
    }
    return items;
  }, [selectedData, rankFilter, mediaFilter, searchQuery]);

  const totalByRank = useMemo(() => {
    const c = { S: 0, A: 0, B: 0, C: 0 };
    data.forEach(d => {
      const r = d["信頼度(S/A/B/C)"] || d["信頼度\n(S/A/B/C)"] || "";
      if (r in c) c[r]++;
    });
    return c;
  }, [data]);

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: "#6A6F82", marginTop: 16, fontFamily: "DM Sans, sans-serif" }}>
        Google Sheets からデータを取得中…
      </p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <div style={{ background: "#1A1D2B", border: "1px solid #C45B5B55", borderRadius: 10, padding: 32, textAlign: "center", maxWidth: 440 }}>
        <p style={{ color: "#C45B5B", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>読み込みエラー</p>
        <p style={{ color: "#8A8FA0", fontSize: 13, margin: "0 0 16px" }}>{error}</p>
        <p style={{ color: "#6A6F82", fontSize: 11, margin: "0 0 16px" }}>
          GAS設定: 「デプロイ」→「デプロイを管理」→「アクセスできるユーザー」が「全員」か確認してください。
        </p>
        <button onClick={() => window.location.reload()}
          style={{ background: "#1B3A5C", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", cursor: "pointer", fontSize: 13 }}>
          再試行
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>Carnegie Endowment Library</h1>
          <p style={styles.sub}>CEIP Document Index — ソース管理ダッシュボード</p>
        </div>
        <div style={styles.headerStats}>
          <StatBadge label="Total" value={data.length} color="#D4A853" />
          {Object.entries(totalByRank).map(([r, n]) => (
            <StatBadge key={r} label={r + "級"} value={n} color={RANK_COLORS[r]} />
          ))}
          <StatBadge label="人物" value={people.length} color="#9B7EC4" />
        </div>
      </header>

      <div style={styles.body}>
        {/* Sidebar - People */}
        <aside style={styles.sidebar}>
          <div style={styles.sideHeader}>
            <span style={{ fontSize: 12, color: "#D4A853", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>人物一覧</span>
            <button
              onClick={() => setSelectedPerson(null)}
              style={{
                background: !selectedPerson ? "#D4A85322" : "transparent",
                border: !selectedPerson ? "1px solid #D4A85344" : "1px solid transparent",
                color: !selectedPerson ? "#D4A853" : "#6A6F82",
                borderRadius: 4, padding: "3px 10px", fontSize: 11, cursor: "pointer",
              }}
            >全員</button>
          </div>

          <div style={styles.peopleList}>
            {people.map(p => {
              const total = p.S + p.A + p.B + p.C;
              const active = selectedPerson === p.name;
              return (
                <div
                  key={p.name}
                  onClick={() => setSelectedPerson(active ? null : p.name)}
                  style={{
                    ...styles.personCard,
                    background: active ? "#1B3A5C18" : "#0F1119",
                    borderLeft: `3px solid ${active ? "#D4A853" : "transparent"}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#F0F0F0" : "#CCC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#6A6F82", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.cat}</div>
                  </div>
                  <div style={{ display: "flex", gap: 3, alignItems: "center", flexShrink: 0 }}>
                    {["S", "A", "B", "C"].map(r => p[r] > 0 && (
                      <span key={r} style={{
                        background: RANK_BG[r], color: RANK_COLORS[r],
                        fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                        fontFamily: "JetBrains Mono, monospace",
                      }}>{r}{p[r]}</span>
                    ))}
                    <span style={{ fontSize: 11, color: "#4A4D5A", fontFamily: "JetBrains Mono, monospace", marginLeft: 4 }}>{total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main style={styles.main}>
          {/* Filters */}
          <div style={styles.filters}>
            <input
              type="text"
              placeholder="検索（タイトル, ソース, 備考…）"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "S", "A", "B", "C"].map(r => (
                <button
                  key={r}
                  onClick={() => setRankFilter(r)}
                  style={{
                    background: rankFilter === r ? (r === "all" ? "#D4A85322" : RANK_BG[r]) : "transparent",
                    border: rankFilter === r ? `1px solid ${r === "all" ? "#D4A85344" : RANK_COLORS[r] + "55"}` : "1px solid #1E2130",
                    color: rankFilter === r ? (r === "all" ? "#D4A853" : RANK_COLORS[r]) : "#4A4D5A",
                    borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600,
                  }}
                >{r === "all" ? "全ランク" : r + "級"}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "テキスト", "映像", "音声"].map(m => (
                <button
                  key={m}
                  onClick={() => setMediaFilter(m)}
                  style={{
                    background: mediaFilter === m ? "#5B8EC422" : "transparent",
                    border: mediaFilter === m ? "1px solid #5B8EC444" : "1px solid #1E2130",
                    color: mediaFilter === m ? "#5B8EC4" : "#4A4D5A",
                    borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer",
                  }}
                >{m === "all" ? "全媒体" : m}</button>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "#6A6F82", fontSize: 12 }}>
              {selectedPerson ? <><strong style={{ color: "#D4A853" }}>{selectedPerson}</strong> — </> : ""}
              {filteredData.length} 件
            </span>
          </div>

          {/* Document cards */}
          <div style={styles.cardGrid}>
            {filteredData.map((d, i) => {
              const rank = d["信頼度(S/A/B/C)"] || d["信頼度\n(S/A/B/C)"] || "?";
              const url = d["URL（直リンク）"] || "";
              const title = d["ドキュメントタイトル"] || "";
              const source = d["ソース名"] || "";
              const media = d["媒体"] || "";
              const lang = d["言語"] || "";
              const year = d["年"] || "";
              const role = d["人物の役割"] || "";
              const access = d["入手方法"] || "";
              const note = d["備考・抽出ポイント"] || "";
              const person = d["人物名"] || "";
              const id = d["ID"] || "";

              return (
                <div key={i} style={{
                  ...styles.docCard,
                  borderLeft: `3px solid ${RANK_COLORS[rank] || "#4A4D5A"}`,
                }}>
                  {/* Top line */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#F0F0F0", lineHeight: 1.4 }}>{title}</div>
                      <div style={{ fontSize: 11, color: "#8A8FA0", marginTop: 3 }}>{source}</div>
                    </div>
                    <span style={{
                      background: RANK_BG[rank] || "#1E2130",
                      color: RANK_COLORS[rank] || "#6A6F82",
                      fontSize: 13, fontWeight: 800, padding: "2px 10px", borderRadius: 4,
                      fontFamily: "JetBrains Mono, monospace", flexShrink: 0,
                    }}>{rank}</span>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "8px 0" }}>
                    {!selectedPerson && person && (
                      <Tag text={person} color="#9B7EC4" />
                    )}
                    {year && <Tag text={year} color="#D4A853" />}
                    {media && <Tag text={media} color="#5B8EC4" />}
                    {lang && <Tag text={lang.toUpperCase()} color="#8A8FA0" />}
                    {role && <Tag text={role} color="#4CAF7D" />}
                    {access === "有料" && <Tag text="有料" color="#C45B5B" />}
                  </div>

                  {/* Note */}
                  {note && (
                    <div style={{ fontSize: 11, color: "#8A8FA0", lineHeight: 1.6, marginTop: 4 }}>{note}</div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontSize: 10, color: "#3A3D4A", fontFamily: "JetBrains Mono, monospace" }}>{id}</span>
                    {url && url !== "" && (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        style={{
                          background: "#1B3A5C", color: "#D4A853", textDecoration: "none",
                          fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 4,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}>
                        ソースを開く →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredData.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#4A4D5A" }}>
              該当するドキュメントがありません
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Tag({ text, color }) {
  return (
    <span style={{
      background: `${color}15`, color, fontSize: 10, fontWeight: 500,
      padding: "2px 8px", borderRadius: 3, whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{ textAlign: "center", minWidth: 44 }}>
      <div style={{ fontSize: 9, color: "#6A6F82", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "Playfair Display, serif" }}>{value}</div>
    </div>
  );
}

const styles = {
  root: {
    background: "#0B0D14", color: "#E0E2EA", minHeight: "100vh",
    fontFamily: "DM Sans, sans-serif",
  },
  center: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#0B0D14",
  },
  spinner: {
    width: 32, height: 32, border: "3px solid #1E2130", borderTop: "3px solid #D4A853",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  header: {
    background: "linear-gradient(180deg, #111420 0%, #0B0D14 100%)",
    borderBottom: "1px solid #1A1D28", padding: "20px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: 16,
  },
  h1: {
    fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700,
    color: "#F0F0F0", margin: 0,
  },
  sub: { color: "#6A6F82", fontSize: 11, margin: "4px 0 0" },
  headerStats: { display: "flex", gap: 16, alignItems: "center" },
  body: { display: "flex", minHeight: "calc(100vh - 80px)" },
  sidebar: {
    width: 280, minWidth: 280, borderRight: "1px solid #1A1D28",
    background: "#0D0F17", display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  sideHeader: {
    padding: "14px 16px 10px", display: "flex", justifyContent: "space-between",
    alignItems: "center", borderBottom: "1px solid #1A1D28",
  },
  peopleList: { flex: 1, overflowY: "auto", padding: "6px 0" },
  personCard: {
    padding: "8px 14px", cursor: "pointer", transition: "all 0.15s",
    display: "flex", alignItems: "center", gap: 8,
    borderBottom: "1px solid #12141C",
  },
  main: { flex: 1, padding: "16px 24px", overflowY: "auto" },
  filters: {
    display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
    marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #1A1D28",
  },
  searchInput: {
    background: "#12141C", border: "1px solid #1E2130", borderRadius: 6,
    color: "#E0E2EA", padding: "6px 14px", fontSize: 12, width: 240,
    outline: "none", fontFamily: "DM Sans, sans-serif",
  },
  cardGrid: { display: "flex", flexDirection: "column", gap: 8 },
  docCard: {
    background: "#12141C", border: "1px solid #1A1D28", borderRadius: 8,
    padding: "14px 18px", transition: "border-color 0.2s",
  },
};
