import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Camera, Filter, Grid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

const categories = ["All", "Men", "Women", "Boys", "Girls"];

const Collection = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from("products").select("id, name, price, category, image_url");
      
      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory.toLowerCase() as "men" | "women" | "boys" | "girls");
      }

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, [activeCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">Our Collection</p>
            <h1 className="font-display text-4xl md:text-5xl">Curated Fashion</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <Button key={category} variant={activeCategory === category ? "gold" : "ghost"} size="sm" onClick={() => setActiveCategory(category)}>
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 border border-border rounded-md p-1">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] rounded-lg mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-6"}>
              {products.map((product, index) => (
                <Link to={`/product/${product.id}`} key={product.id} className={`group animate-fade-up ${viewMode === "list" ? "flex gap-6 items-center" : ""}`} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className={`relative overflow-hidden rounded-lg bg-secondary ${viewMode === "list" ? "w-48 aspect-square flex-shrink-0" : "aspect-[3/4] mb-4"}`}>
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Button variant="gold" className="w-full gap-2" onClick={(e) => e.preventDefault()}>
                        <Camera className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    <p className="text-muted-foreground text-sm mb-1 capitalize">{product.category}</p>
                    <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                    <p className="text-gold font-medium">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Collection;
