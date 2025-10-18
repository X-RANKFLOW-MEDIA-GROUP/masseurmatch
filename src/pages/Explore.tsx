import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, CheckCircle2, Star } from "lucide-react";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const therapists = [
    {
      id: 1,
      name: "Marcus Rivera",
      city: "Los Angeles",
      specialty: "Deep Tissue & Sports",
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=800&fit=crop",
      verified: true,
      price: "$120/hr"
    },
    {
      id: 2,
      name: "James Chen",
      city: "San Francisco",
      specialty: "Swedish & Relaxation",
      rating: 4.8,
      reviews: 94,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
      verified: true,
      price: "$100/hr"
    },
    {
      id: 3,
      name: "David Anderson",
      city: "New York",
      specialty: "Therapeutic & Wellness",
      rating: 5.0,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop",
      verified: true,
      price: "$150/hr"
    },
    {
      id: 4,
      name: "Alex Thompson",
      city: "Miami",
      specialty: "Hot Stone & Aromatherapy",
      rating: 4.9,
      reviews: 112,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop",
      verified: true,
      price: "$110/hr"
    },
    {
      id: 5,
      name: "Ryan Martinez",
      city: "Chicago",
      specialty: "Sports Recovery",
      rating: 4.7,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
      verified: true,
      price: "$95/hr"
    },
    {
      id: 6,
      name: "Kyle Johnson",
      city: "Seattle",
      specialty: "Prenatal & Wellness",
      rating: 4.8,
      reviews: 103,
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop",
      verified: false,
      price: "$90/hr"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
            Explore <span className="gradient-text">Professional</span> Therapists
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Find verified massage therapists in your area
          </p>

          {/* Search and Filters */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="los-angeles">Los Angeles</SelectItem>
                    <SelectItem value="san-francisco">San Francisco</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="miami">Miami</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Massage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deep-tissue">Deep Tissue</SelectItem>
                    <SelectItem value="swedish">Swedish</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="hot-stone">Hot Stone</SelectItem>
                    <SelectItem value="prenatal">Prenatal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map((therapist) => (
            <Link
              key={therapist.id}
              to={`/therapist/${therapist.id}`}
              className="glass-card p-6 card-hover group"
            >
              <div className="relative mb-4">
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {therapist.verified && (
                  <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-bold mb-1">{therapist.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                {therapist.city}
              </div>
              <p className="text-sm text-primary mb-3">{therapist.specialty}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{therapist.rating}</span>
                  <span className="text-sm text-muted-foreground">({therapist.reviews})</span>
                </div>
                <span className="text-sm font-semibold text-accent">{therapist.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Explore;
