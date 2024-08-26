import ShopItem from "../components/ShopItem";

const products = [{
  title: "Biblia de Estudio Vida Plena RVR1960 / Tapa dura color negro",
  category: "Biblias de estudio",
  codigo: "COD: 9780829719802",
  description: "Biblia de Estudio de la Vida Plena Características de esta eficaz herramienta: • Extensas notas o comentarios sobre los versículos, a pie de página",
  price: "UYU 2,363",
  image: 'https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/2Cl4UdQWu4UlaOq6oRcosQCt7nI2%2Fthumb_280_7E74B403-04D4-429C-97B2-453B172B75AB.jpg?alt=media'

},
{
  title: "Manual Bíblico Ilustrado a color SBU",
  category: "ESTUDIO BÍBLICO",
  codigo: "COD: 9788531116087",
  description: "Manual Bíblico Ilustrado CARACTERÍSTICAS Y RECURSOS: - Edición Revisada y Ampliada - Guía Util y accesible de la Biblia- Compañero ideal para tu Biblia",
  price: "UYU 2,200",
  image: "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/2Cl4UdQWu4UlaOq6oRcosQCt7nI2%2FD888939D-F793-42A0-8113-3BD99A7D441F.jpg?alt=media"

},
{
  title: 'Bingo “Salmo 34” Bilingüe',
  category: "Juegos",
  codigo: "COD: 9781623878030",
  description: "Explora algunos capítulos de la Biblia mientras disfrutas de este juego con tu familia y amigos. Incluye: 8 tableros 72 tarjetas De 3 años en adelante De 2 a 8 jugadores ",
  price: "UYU 297",
  image: "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/2Cl4UdQWu4UlaOq6oRcosQCt7nI2%2FACA1F1FE-8184-4368-8200-1055447DDB6B.jpg?alt=media"

},
{
  title: 'Bingo “Salmo 34” Bilingüe',
  category: "Juegos",
  codigo: "COD: 9781623878030",
  description: "Explora algunos capítulos de la Biblia mientras disfrutas de este juego con tu familia y amigos. Incluye: 8 tableros 72 tarjetas De 3 años en adelante De 2 a 8 jugadores ",
  price: "UYU 297",
  image: "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/2Cl4UdQWu4UlaOq6oRcosQCt7nI2%2FACA1F1FE-8184-4368-8200-1055447DDB6B.jpg?alt=media"

},
]
function ShoppingPage() {
  return (
    <div className="p-5 pt-28 flex flex-col sm:flex-row items-center sm:items-start sm:justify-between min-h-screen " >
    { products.map(p => <ShopItem product={p}/>) }
      
    </div>
  )
}

export default ShoppingPage