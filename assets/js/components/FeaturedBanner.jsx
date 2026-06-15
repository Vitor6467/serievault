
// Featured Netflix-style banner
function FeaturedBanner() {
  return (
    <section className="featured-banner">
      <img
        className="featured-banner-bg"
        src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop"
        alt="Banner"
      />
      <div className="featured-banner-overlay">
        <span className="featured-tag">SÉRIE EM DESTAQUE</span>
        <h1 className="featured-title">STRANGER THINGS</h1>
        <div className="featured-meta">2016 • 4 Temporadas • ⭐ 8.7 IMDb</div>
        <p className="featured-description">
          Em uma pequena cidade, um desaparecimento misterioso revela segredos sobrenaturais.
        </p>
        <button className="featured-details">Mais informações</button>
      </div>
    </section>
  );
}
