import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Wallet, Truck } from "lucide-react";
import QRCode from "@/components/QRCode";

interface Profile {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || ""
        });
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(price);
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    if (!profile.full_name || !profile.phone || !profile.address_line1 || !profile.city || !profile.state || !profile.pincode) {
      toast({
        title: "Incomplete details",
        description: "Please fill all required address fields",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === "upi") {
      setShowQR(true);
      return;
    }

    await createOrder();
  };

  const createOrder = async () => {
    if (!user) return;
    
    setLoading(true);

    const shippingAddress = `${profile.full_name}, ${profile.address_line1}, ${profile.address_line2 ? profile.address_line2 + ", " : ""}${profile.city}, ${profile.state} - ${profile.pincode}. Phone: ${profile.phone}`;

    // Update profile
    await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        payment_method: paymentMethod,
        total_amount: total,
        shipping_address: shippingAddress,
        status: paymentMethod === "upi" ? "confirmed" : "pending"
      })
      .select()
      .single();

    if (orderError || !order) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      size: item.size as "XS" | "S" | "M" | "L" | "XL" | "XXL",
      quantity: item.quantity,
      price: item.product?.price || 0
    }));

    await supabase.from("order_items").insert(orderItems);

    // Clear cart
    await clearCart();

    toast({
      title: "Order placed!",
      description: paymentMethod === "cod" 
        ? "Your order will be delivered soon. Pay on delivery."
        : "Payment successful. Your order is confirmed."
    });

    navigate("/account");
    setLoading(false);
  };

  if (items.length === 0 && !showQR) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container px-6">
          <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Shipping Details */}
            <div className="lg:col-span-2 space-y-8">
              {showQR ? (
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                  <h2 className="font-display text-2xl mb-4">Scan to Pay</h2>
                  <p className="text-muted-foreground mb-6">
                    Scan the QR code with any UPI app to complete payment
                  </p>
                  <div className="flex justify-center mb-6">
                    <QRCode upiId="7569774933@ybl" amount={total} name="LUXE Store" />
                  </div>
                  <p className="text-gold text-xl font-medium mb-4">
                    Amount: {formatPrice(total)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    UPI ID: 7569774933@ybl
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => setShowQR(false)}>
                      Cancel
                    </Button>
                    <Button variant="gold" onClick={createOrder} disabled={loading}>
                      {loading ? "Processing..." : "I've Completed Payment"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="font-display text-xl mb-6">Shipping Address</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address1">Address Line 1 *</Label>
                        <Input
                          id="address1"
                          value={profile.address_line1}
                          onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address2">Address Line 2</Label>
                        <Input
                          id="address2"
                          value={profile.address_line2}
                          onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={profile.state}
                          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={profile.pincode}
                          onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <h2 className="font-display text-xl mb-6">Payment Method</h2>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as "upi" | "cod")}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-gold/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer flex items-center gap-3">
                          <QrCode className="h-5 w-5 text-gold" />
                          <div>
                            <p className="font-medium">UPI Payment</p>
                            <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-gold/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-3">
                          <Truck className="h-5 w-5 text-gold" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">Pay when you receive</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </div>

            {/* Order Summary */}
            {!showQR && (
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="font-display text-xl mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.size} × {item.quantity}
                          </p>
                          <p className="text-gold">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 border-t border-border pt-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between text-lg font-medium">
                      <span>Total</span>
                      <span className="text-gold">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="xl"
                    className="w-full gap-2"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    <Wallet className="h-5 w-5" />
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
