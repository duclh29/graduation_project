import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useFavorite } from "../hooks/useFavorite";

const FavoritePage = () => {
  const { favorites } = useFavorite();

  return (
    <div className="page-shell py-10">
      <div className="mb-6 flex items-center gap-3">
        <Heart className="fill-[#E32A15] text-[#E32A15]" />
        <h1 className="text-3xl font-black text-ink">Sản phẩm yêu thích</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-slate-500">Bạn chưa có sản phẩm yêu thích nào.</p>
          <Link to="/" className="btn-primary mt-5">
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
