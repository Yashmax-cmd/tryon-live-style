import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, CameraOff, ShoppingBag, Sparkles, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string;
}

const TryOn = () => {
  const [searchParams] = useSearchParams();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [overlaySize, setOverlaySize] = useState(60); // percentage of container width
  const [overlayY, setOverlayY] = useState(15); // percentage from top
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Fetch all products from database
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, image_url, description")
        .order("name");

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
        
        // If product ID is in URL, select it
        const productId = searchParams.get("product");
        if (productId && data) {
          const product = data.find(p => p.id === productId);
          if (product) {
            setSelectedItem(product);
          }
        }
      }
      setLoadingProducts(false);
    };

    fetchProducts();
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      toast({
        title: "Camera activated",
        description: "Select an item to see it on you in real-time!",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use virtual try-on.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleAddToCart = async () => {
    if (selectedItem) {
      await addToCart(selectedItem.id, "M");
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between h-16">
            <Link
              to="/collection"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Collection
            </Link>
            <h1 className="font-display text-xl">Virtual Try-On</h1>
            <div className="w-24" />
          </nav>
        </div>
      </header>

      <div className="pt-16 flex min-h-screen">
        {/* Sidebar - Clothing items */}
        <aside className="w-80 border-r border-border bg-card p-6 overflow-y-auto max-h-screen">
          <h2 className="font-display text-lg mb-4">Select an Item</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose clothing to preview in real-time ({products.length} items)
          </p>

          <div className="space-y-4 pb-20">
            {loadingProducts ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="w-16 h-16 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))
            ) : (
              products.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
                    selectedItem?.id === item.id
                      ? "bg-gold/10 border border-gold"
                      : "bg-secondary hover:bg-secondary/80 border border-transparent"
                  }`}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                    <p className="text-gold text-sm font-medium mt-1">{formatPrice(item.price)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main camera area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-secondary border border-border">
            {isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                
                {/* Real-time clothing overlay */}
                {selectedItem && (
                  <div 
                    className="absolute pointer-events-none"
                    style={{
                      top: `${overlayY}%`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: `${overlaySize}%`,
                    }}
                  >
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="w-full h-auto object-contain opacity-80 mix-blend-multiply dark:mix-blend-screen"
                      style={{ 
                        filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
                      }}
                    />
                  </div>
                )}

                {selectedItem && (
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-gold">
                    <p className="text-sm font-medium text-gold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {selectedItem.name}
                    </p>
                    <p className="text-xs text-muted-foreground">Live preview</p>
                  </div>
                )}

                {!selectedItem && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 text-center">
                      <Sparkles className="h-8 w-8 text-gold mx-auto mb-3" />
                      <p className="font-medium">Select an item from the sidebar</p>
                      <p className="text-sm text-muted-foreground">to see it on you in real-time</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                  <Camera className="h-12 w-12 text-gold" />
                </div>
                <h3 className="font-display text-2xl mb-2">Virtual Try-On</h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                  Enable your camera to see clothing on you in real-time!
                </p>
                <Button
                  variant="hero"
                  size="xl"
                  onClick={startCamera}
                  disabled={isLoading}
                  className="gap-3"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                  {isLoading ? "Activating..." : "Enable Camera"}
                </Button>
              </div>
            )}
          </div>

          {/* Controls */}
          {isCameraActive && (
            <div className="w-full max-w-3xl mt-6 space-y-4">
              {/* Size and position controls */}
              {selectedItem && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm font-medium mb-3">Adjust Overlay</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Size</label>
                      <div className="flex items-center gap-3">
                        <Minus className="h-4 w-4 text-muted-foreground" />
                        <Slider
                          value={[overlaySize]}
                          onValueChange={(v) => setOverlaySize(v[0])}
                          min={30}
                          max={100}
                          step={5}
                          className="flex-1"
                        />
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Position</label>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Top</span>
                        <Slider
                          value={[overlayY]}
                          onValueChange={(v) => setOverlayY(v[0])}
                          min={0}
                          max={50}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground">Bottom</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={stopCamera} className="gap-2">
                  <CameraOff className="h-4 w-4" />
                  Stop Camera
                </Button>
                {selectedItem && (
                  <Button variant="gold" className="gap-2" onClick={handleAddToCart}>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart - {formatPrice(selectedItem.price)}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 text-center max-w-lg">
            <p className="text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 inline-block mr-2" />
              {isCameraActive && selectedItem
                ? "Adjust the size and position to see how the item looks on you!"
                : "Select an item from the sidebar to see it overlaid on your camera feed in real-time."
              }
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TryOn;
