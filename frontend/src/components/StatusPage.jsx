import { useEffect, useMemo, useState } from "react";

export default function StatusPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch(`${API_URL}/reports/status`);
        const json = await res.json();

        if (isMounted) {
          setData(json.data || []);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = setInterval(load, 30_000); // refresco suave cada 30s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const { upCount, downCount } = useMemo(() => {
    const up = data.filter((item) => item.latest_status_code === 200).length;
    return { upCount: up, downCount: data.length - up };
  }, [data]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.loadingText}>Sincronizando métricas...</p>
          <div style={styles.loader} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>Aplicaciones EMPRESS</p>
            <h1 style={styles.title}>Dashboard de Monitoreo</h1>
            <p style={styles.subtitle}>
              Revisión automática de los sitios EMPRESS.
            </p>
          </div>
          <div style={styles.badges}>
            <MetricBadge label="Sitios OK" value={upCount} accent="#3bffce" />
            <MetricBadge label="Sitios con alerta" value={downCount} accent="#ff5f6d" />
          </div>
        </header>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Sitio</th>
                <th style={styles.th}>Último código</th>
                <th style={styles.th}>Última revisión</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <StatusRow key={item.site_id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ item }) {
  const ok = item.latest_status_code === 200;
  const statusLabel = ok ? "Ok" : "Incidencia";
  const statusColor = ok ? "rgba(46, 213, 115, 0.15)" : "rgba(255, 95, 109, 0.15)";
  const badgeColor = ok ? "#2ed573" : "#ff5f6d";

  return (
    <tr style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
      <td style={styles.tdMuted}>{item.site_id}</td>
      <td style={styles.tdMain}>
        <span style={styles.siteName}>{item.displayname}</span>
        
        <ChecksTimeline checks={item.checks} />
      </td>
      <td style={styles.tdStatus}>
        <span style={{ ...styles.statusBadge, backgroundColor: statusColor, color: badgeColor }}>
          {statusLabel} · {item.latest_status_code}
        </span>
      </td>
      <td style={styles.tdMuted}>{formatTimestamp(item.latest_checked_at)}</td>
    </tr>
  );
}

function ChecksTimeline({ checks }) {
  if (!checks || checks.length === 0) return null;

  return (
    <div style={styles.timeline}>
     
      <div style={styles.timelineTrack}>
        {checks.map((check) => {
          const ok = check.status_code === 200;
          const dotColor = ok ? "#1fb58f" : "#ff5f6d";
          const ringColor = ok ? "rgba(31, 181, 143, 0.2)" : "rgba(255, 95, 109, 0.25)";
          return (
            <span
              key={check.id}
              title={`${formatTimestamp(check.checked_at)} · Código ${check.status_code} · ${formatResponseTime(check.response_time_ms)}`}
              style={{
                ...styles.timelineDot,
                backgroundColor: dotColor,
                boxShadow: `0 0 0 2px ${ringColor}`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function MetricBadge({ label, value, accent }) {
  return (
    <div style={{ ...styles.badgeCard, borderColor: accent }}>
      <p style={styles.badgeLabel}>{label}</p>
      <p style={{ ...styles.badgeValue, color: accent }}>{value}</p>
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City"
});

function formatTimestamp(value) {
  if (!value) return "–";
  return dateFormatter.format(new Date(value));
}

function formatResponseTime(value) {
  if (typeof value !== "number") {
    return "N/D";
  }
  const ms = Math.round(value * 1000); // backend envía segundos
  return `${ms} ms`;
}

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "40px 20px",
    background:
      "radial-gradient(circle at top, #00788e, transparent 60%), #0c0e19",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "'Inter', 'Segoe UI', system-ui"
  },
  card: {
    width: "100%",
    maxWidth: "1100px",
    background: "rgba(12, 14, 25, 0.85)",
    borderRadius: "28px",
    padding: "32px",
    boxShadow: "0 30px 50px rgba(0, 0, 0, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#f5f7ff"
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "24px",
    marginBottom: "24px"
  },
  kicker: {
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.55)",
    marginBottom: "8px"
  },
  title: {
    fontSize: "2rem",
    margin: 0
  },
  subtitle: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.65)",
    maxWidth: "520px",
    lineHeight: 1.5
  },
  badges: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  },
  badgeCard: {
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 20px",
    minWidth: "140px",
    backgroundColor: "rgba(255,255,255,0.02)"
  },
  badgeLabel: {
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.45)",
    marginBottom: "4px"
  },
  badgeValue: {
    fontSize: "1.75rem",
    fontWeight: 600,
    margin: 0
  },
  tableWrapper: {
    borderRadius: "22px",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    overflow: "hidden",
    background: "rgba(9, 10, 18, 0.85)"
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0
  },
  th: {
    textAlign: "left",
    padding: "18px 24px",
    fontSize: "0.85rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  tdMain: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  siteName: {
    display: "block",
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: "4px"
  },
  siteUrl: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.55)"
  },
  tdStatus: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.05)"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 600,
    borderRadius: "999px",
    padding: "8px 16px",
    fontSize: "0.9rem"
  },
  tdMuted: {
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.65)",
    fontSize: "0.9rem"
  },
  loadingText: {
    marginBottom: "16px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "1rem"
  },
  loader: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "6px solid rgba(255,255,255,0.15)",
    borderTopColor: "#00788e"
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  timelineLabel: {
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)"
  },
  timelineTrack: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    transition: "transform 0.2s ease",
    cursor: "pointer"
  }
};
