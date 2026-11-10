
export default function Dashboard({ stats, loading }) {
  const statsCards = [
    {
      title: "Sarana Inventaris",
      value: stats.masterSaranaInventaris,
      description: "Jenis sarana yang terdaftar",
      icon: "ti-category",
    },
    {
      title: "Total Inventaris",
      value: stats.totalInventaris,
      description: "Total unit inventaris",
      icon: "ti-package",
    },
    {
      title: "Lokasi",
      value: stats.lokasi,
      description: "Lokasi yang terdaftar",
      icon: "ti-map-pin",
    },
    {
      title: "Penanggung Jawab",
      value: stats.penanggungJawab,
      description: "Penanggung jawab terdaftar",
      icon: "ti-users",
    },
  ];

  return (
    <section className="stats-grid">
      {statsCards.map((card) => (
        <article className="stat-card" key={card.title}>
          <div className="stat-card-body">
            <div className="stat-header">
              <div className="stat-icon">
                <i className={`ti ${card.icon}`} />
              </div>

              <div className="stat-content">
                <div className="stat-title">{card.title}</div>
                <div className="stat-value">
                  {loading ? "…" : card.value}
                </div>
              </div>
            </div>

            <div className="stat-description">
              {card.description}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
