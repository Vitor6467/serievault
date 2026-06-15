// ============================================================
// SerieVault — Page: Home
// ============================================================

function FeaturedBanner() {
const { navigate } = useApp();

const banners = React.useMemo(() => [
{
id: 169,
title: "Breaking Bad",
year: "2008",
genres: "Drama • Crime",
rating: "9.5",
image: "https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg",
description:
"Um professor de química descobre que tem câncer e decide fabricar metanfetamina para garantir o futuro de sua família."
},
{
id: 82,
title: "Game of Thrones",
year: "2011",
genres: "Fantasia • Drama",
rating: "9.2",
image: "https://static.tvmaze.com/uploads/images/original_untouched/190/476117.jpg",
description:
"Famílias nobres disputam o controle dos Sete Reinos em uma guerra repleta de intrigas, batalhas e dragões."
},
{
id: 2993,
title: "Stranger Things",
year: "2016",
genres: "Ficção • Suspense",
rating: "8.8",
image: "https://static.tvmaze.com/uploads/images/original_untouched/200/501942.jpg",
description:
"Um grupo de amigos enfrenta acontecimentos sobrenaturais após o desaparecimento misterioso de um garoto."
},
{
id: 1855,
title: "The Walking Dead",
year: "2010",
genres: "Terror • Drama",
rating: "8.3",
image: "https://static.tvmaze.com/uploads/images/original_untouched/67/168817.jpg",
description:
"Sobreviventes tentam reconstruir suas vidas em um mundo devastado por uma epidemia zumbi."
},
{
id: 793,
title: "Dexter",
year: "2006",
genres: "Crime • Suspense",
rating: "8.7",
image: "https://static.tvmaze.com/uploads/images/original_untouched/1/2668.jpg",
description:
"Durante o dia, analista forense. À noite, um serial killer que caça outros assassinos."
},
{
id: 975,
title: "The Big Bang Theory",
year: "2007",
genres: "Comédia",
rating: "8.1",
image: "https://static.tvmaze.com/uploads/images/original_untouched/173/433868.jpg",
description:
"A divertida rotina de um grupo de cientistas brilhantes tentando lidar com a vida social."
},
{
id: 194,
title: "Vikings",
year: "2013",
genres: "Ação • Drama",
rating: "8.6",
image: "https://static.tvmaze.com/uploads/images/original_untouched/117/295520.jpg",
description:
"A ascensão de Ragnar Lothbrok e suas aventuras rumo a novas terras."
},
{
id: 246,
title: "Peaky Blinders",
year: "2013",
genres: "Crime • Drama",
rating: "8.8",
image: "https://static.tvmaze.com/uploads/images/original_untouched/415/1035431.jpg",
description:
"Uma família de gângsteres domina Birmingham após a Primeira Guerra Mundial."
}
], []);

const [current, setCurrent] = React.useState(0);

React.useEffect(() => {
const timer = setInterval(() => {
setCurrent(prev =>
prev === banners.length - 1 ? 0 : prev + 1
);
}, 6000);


return () => clearInterval(timer);


}, [banners.length]);

const banner = banners[current];

return (
<div
style={{
width: "100%",
height: "430px",
background:
"linear-gradient(90deg,#020617 0%, #020617 58%, #111827 100%)",
borderRadius: "24px",
overflow: "hidden",
display: "flex",
marginBottom: "28px",
boxShadow: "0 20px 50px rgba(0,0,0,.45)",
position: "relative"
}}
>
<div
style={{
flex: 1,
padding: "40px 55px",
display: "flex",
flexDirection: "column",
justifyContent: "center"
}}
>
<div
style={{
width: "fit-content",
background:
"linear-gradient(135deg,#7c3aed,#9333ea)",
color: "#fff",
padding: "10px 20px",
borderRadius: "999px",
fontWeight: 700,
marginBottom: "20px"
}}
>
Em Destaque </div>

    <h1
      style={{
        fontSize: "4rem",
        fontWeight: 800,
        color: "#fff",
        lineHeight: 0.95,
        margin: 0,
        marginBottom: "18px"
      }}
    >
      {banner.title}
    </h1>

    <div
      style={{
        display: "flex",
        gap: "20px",
        color: "#fff",
        marginBottom: "18px",
        fontSize: "1rem"
      }}
    >
      <span>⭐ {banner.rating}</span>
      <span>📅 {banner.year}</span>
      <span>🎭 {banner.genres}</span>
    </div>

    <p
      style={{
        color: "#d1d5db",
        maxWidth: "560px",
        lineHeight: 1.7,
        fontSize: "1rem",
        marginBottom: "25px"
      }}
    >
      {banner.description}
    </p>

    <button
      onClick={() => navigate("detail", banner.id)}
      style={{
        width: "fit-content",
        border: "none",
        cursor: "pointer",
        padding: "14px 28px",
        borderRadius: "14px",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#fff",
        background:
          "linear-gradient(135deg,#7c3aed,#9333ea)"
      }}
    >
      Mais Informações
    </button>
  </div>

  <div
    style={{
      width: "42%",
      minWidth: "320px",
      background: "#111827"
    }}
  >
    <img
      src={banner.image}
      alt={banner.title}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center top"
      }}
    />
  </div>

  <div
    style={{
      position: "absolute",
      bottom: "18px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "8px"
    }}
  >
    {banners.map((_, index) => (
      <div
        key={index}
        onClick={() => setCurrent(index)}
        style={{
          width: index === current ? "32px" : "10px",
          height: "10px",
          borderRadius: "999px",
          background:
            index === current
              ? "#7c3aed"
              : "rgba(255,255,255,.35)",
          cursor: "pointer",
          transition: ".3s"
        }}
      />
    ))}
  </div>
</div>


);
}

function HomePage() {
  const { api, navigate, user, myShows } = useApp();
  const [popularShows, setPopularShows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [statusModalShow, setStatusModalShow] = React.useState(null);

  const { saveShow, updateShow } = useApp();

  React.useEffect(() => {
    let active = true;

    const fetchPopular = async () => {
      setLoading(true);

      try {
        const data = await api('/shows/search');

        if (active) {
          const shuffled = data
            .sort(() => 0.5 - Math.random())
            .slice(0, 18);

          setPopularShows(shuffled);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPopular();

    return () => {
      active = false;
    };
  }, [api]);

  const stats = user
    ? [
        { label: 'Séries Salvas', value: myShows.length },
        { label: 'Episódios', value: myShows.length * 24 },
        {
          label: 'Favoritos',
          value: myShows.filter((s) => s.is_favorite).length
        }
      ]
    : [
        { label: 'Obras', value: '1.2M+' },
        { label: 'Usuários', value: '50k+' },
        { label: 'Reviews', value: '2M+' }
      ];

  const handleSaveStatus = async (show, status, isFav) => {
    const saved = myShows.find((s) => s.tvmaze_id == show.id);

    if (saved) {
      await updateShow(show.id, {
        status,
        is_favorite: isFav ? 1 : 0
      });
    } else {
      await saveShow(show, status);

      if (isFav) {
        await updateShow(show.id, {
          is_favorite: 1
        });
      }
    }
  };

  return (
  <div>
    <FeaturedBanner />

    <div className="page-header" style={{ marginBottom: 16 }}>
      <h2 className="page-title" style={{ fontSize: 24 }}>
        Em Destaque
      </h2>

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('explore')}
      >
        Ver Tudo →
      </button>
    </div>
      {loading ? (
        <div className="loading-grid">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <SkeletonCard key={i} />
            ))}
        </div>
      ) : (
        <div className="shows-grid">
          {popularShows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              onOpenDetail={(id) => navigate('detail', id)}
              onOpenStatus={(s) => setStatusModalShow(s)}
            />
          ))}
        </div>
      )}

      {statusModalShow && (
        <StatusModal
          show={statusModalShow}
          onClose={() => setStatusModalShow(null)}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}