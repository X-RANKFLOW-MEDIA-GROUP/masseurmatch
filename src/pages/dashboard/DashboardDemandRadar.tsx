import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Radar, TrendingUp, TrendingDown, MapPin, Flame, Eye, Search,
  ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Zap, Globe, Filter,
  BarChart3, Info, Clock, Target, Navigation, Sparkles
} from "lucide-react";
import {
  US_METROS,
  generateDemandData,
  getCityById,
  findNearbyCities,
  getUniqueStates,
  getUniqueMetros,
  DEMAND_KEYWORDS,
  estimateHotelCost,
  distanceMiles,
  type CityDemandData,
  type USCity,
} from "@/data/us-metros-demand";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from "recharts";

// ── Label styling ──
const labelConfig: Record<string, { text: string; class: string; icon: typeof Flame }> = {
  go_now: { text: "GO NOW", class: "bg-success/20 text-success border-success/30", icon: Flame },
  watch: { text: "WATCH", class: "bg-warning/20 text-warning border-warning/30", icon: Eye },
  low_priority: { text: "LOW", class: "bg-muted text-muted-foreground border-muted-foreground/20", icon: Minus },
  ignore: { text: "IGNORE", class: "bg-destructive/10 text-destructive border-destructive/20", icon: Minus },
};

type TripPlan = {
  id: string;
  hub: USCity;
  cities: Array<USCity & { demand: CityDemandData; hotelCost: number; distanceFromHub: number }>;
  avgDemand: number;
  avgHotelCost: number;
  routeDistance: number;
  expectedOpportunity: number;
  tripScore: number;
};

function TrendIndicator({ value }: { value: number }) {
  if (value > 5) return <span className="flex items-center gap-0.5 text-success text-xs font-medium"><ArrowUpRight className="h-3 w-3" />+{value}%</span>;
  if (value < -5) return <span className="flex items-center gap-0.5 text-destructive text-xs font-medium"><ArrowDownRight className="h-3 w-3" />{value}%</span>;
  return <span className="flex items-center gap-0.5 text-muted-foreground text-xs font-medium"><Minus className="h-3 w-3" />{value}%</span>;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : score >= 40 ? "text-muted-foreground" : "text-destructive";
  return <span className={`text-2xl font-bold ${color}`}>{score}</span>;
}

function LabelBadge({ label }: { label: CityDemandData["label"] }) {
  const config = labelConfig[label];
  return (
    <Badge variant="outline" className={`text-[10px] font-bold tracking-wider ${config.class}`}>
      {config.text}
    </Badge>
  );
}

// ── Main Component ──
export default function DashboardDemandRadar() {
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [travelOriginId, setTravelOriginId] = useState<string>("nyc");
  const [travelBudget, setTravelBudget] = useState<string>("all");
  const [travelRadius, setTravelRadius] = useState<string>("100");
  const [minRouteScore, setMinRouteScore] = useState<string>("60");

  const demandData = useMemo(() => generateDemandData(), []);
  const states = useMemo(() => getUniqueStates(), []);
  const metros = useMemo(() => getUniqueMetros(), []);

  // Merge city + demand
  const enriched = useMemo(() => {
    return demandData.map((d) => ({ ...d, city: getCityById(d.cityId)! })).filter((d) => d.city);
  }, [demandData]);

  // Filtered
  const filtered = useMemo(() => {
    let result = enriched;
    if (stateFilter !== "all") result = result.filter((d) => d.city.stateCode === stateFilter);
    if (labelFilter !== "all") result = result.filter((d) => d.label === labelFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => d.city.city.toLowerCase().includes(q) || d.city.metroArea.toLowerCase().includes(q));
    }
    return result.sort((a, b) => b.travelScore - a.travelScore);
  }, [enriched, stateFilter, labelFilter, searchQuery]);

  // Stats
  const goNowCount = enriched.filter((d) => d.label === "go_now").length;
  const watchCount = enriched.filter((d) => d.label === "watch").length;
  const avgScore = Math.round(enriched.reduce((s, d) => s + d.travelScore, 0) / enriched.length);
  const spikingCount = enriched.filter((d) => d.spikeScore >= 50).length;

  // Top 10 for charts
  const top10 = filtered.slice(0, 10);
  const chartData = top10.map((d) => ({ name: d.city.city, score: d.travelScore, demand: d.demandScore, spike: d.spikeScore }));

  // State ranking
  const stateRanking = useMemo(() => {
    const map = new Map<string, { total: number; count: number; goNow: number }>();
    enriched.forEach((d) => {
      const st = d.city.stateCode;
      const cur = map.get(st) || { total: 0, count: 0, goNow: 0 };
      cur.total += d.travelScore;
      cur.count++;
      if (d.label === "go_now") cur.goNow++;
      map.set(st, cur);
    });
    return [...map.entries()]
      .map(([state, v]) => ({ state, avg: Math.round(v.total / v.count), goNow: v.goNow, count: v.count }))
      .sort((a, b) => b.avg - a.avg);
  }, [enriched]);

  // Selected city detail
  const selectedDetail = selectedCityId ? enriched.find((d) => d.cityId === selectedCityId) : null;
  const nearbyCities = selectedCityId ? findNearbyCities(selectedCityId, 100) : [];
  const nearbyDemand = nearbyCities.map((nc) => ({ ...nc, demand: enriched.find((d) => d.cityId === nc.id) })).filter((n) => n.demand);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radar className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">National Demand Radar</h1>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">AI POWERED</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Track search demand spikes across {US_METROS.length} U.S. cities · Updated daily
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Simulated Data
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">Connect a keyword data API (DataForSEO or SerpAPI) for real search volume data. Currently showing realistic simulated patterns.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Go Now</span>
            </div>
            <p className="text-3xl font-bold text-success">{goNowCount}</p>
            <p className="text-xs text-muted-foreground">cities with score 80+</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Watch</span>
            </div>
            <p className="text-3xl font-bold text-warning">{watchCount}</p>
            <p className="text-xs text-muted-foreground">cities trending up</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Spiking</span>
            </div>
            <p className="text-3xl font-bold">{spikingCount}</p>
            <p className="text-xs text-muted-foreground">active demand spikes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Avg Score</span>
            </div>
            <p className="text-3xl font-bold">{avgScore}</p>
            <p className="text-xs text-muted-foreground">national average</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cities or metros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={labelFilter} onValueChange={setLabelFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Labels</SelectItem>
            <SelectItem value="go_now">🔥 Go Now</SelectItem>
            <SelectItem value="watch">👁 Watch</SelectItem>
            <SelectItem value="low_priority">Low Priority</SelectItem>
            <SelectItem value="ignore">Ignore</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-xs">{filtered.length} cities</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="top-cities" className="space-y-4">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="top-cities" className="text-xs">Top Cities</TabsTrigger>
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="states" className="text-xs">By State</TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
          <TabsTrigger value="clusters" className="text-xs">Clusters</TabsTrigger>
          {selectedDetail && <TabsTrigger value="detail" className="text-xs">City Detail</TabsTrigger>}
        </TabsList>

        {/* ── Top Cities ── */}
        <TabsContent value="top-cities" className="space-y-3">
          {filtered.slice(0, 25).map((d, i) => (
            <Card
              key={d.cityId}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelectedCityId(d.cityId)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-8 text-right">#{i + 1}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{d.city.city}, {d.city.stateCode}</h3>
                        <LabelBadge label={d.label} />
                        {d.city.isLgbtFriendly && <Badge variant="outline" className="text-[9px]">🏳️‍🌈 LGBT+</Badge>}
                        {d.city.isTourism && <Badge variant="outline" className="text-[9px]">✈️ Tourism</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.city.metroArea} · Pop. {(d.city.population / 1000).toFixed(0)}K</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Top keyword: <span className="text-foreground font-medium">{d.topKeyword}</span></span>
                        <span className="text-xs text-muted-foreground">{d.keywordCount} keywords spiking</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <ScoreBadge score={d.travelScore} />
                    <p className="text-[10px] text-muted-foreground mt-1">TRAVEL SCORE</p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <TrendIndicator value={d.trend7d} />
                      <span className="text-[10px] text-muted-foreground">7d</span>
                    </div>
                  </div>
                </div>
                {/* Score bars */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                  {[
                    { label: "Demand", value: d.demandScore },
                    { label: "Spike", value: d.spikeScore },
                    { label: "Growth", value: Math.max(0, d.growthVelocity) },
                    { label: "Tourism", value: d.tourismWeight },
                    { label: "Low Comp.", value: 100 - d.competitionScore },
                    { label: "Confidence", value: d.confidence },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">{s.label}</span>
                        <span className="text-[10px] font-medium">{s.value}</span>
                      </div>
                      <Progress value={s.value} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Overview Chart ── */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 Cities by Travel Opportunity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={90} className="text-xs" />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          className={entry.score >= 80 ? "fill-success" : entry.score >= 60 ? "fill-warning" : "fill-muted-foreground"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Demand vs Spike (Top 10)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-[10px]" angle={-45} textAnchor="end" height={60} />
                      <YAxis className="text-xs" />
                      <Bar dataKey="demand" className="fill-primary" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="spike" className="fill-warning" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Score Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Go Now (80-100)", count: goNowCount, color: "bg-success" },
                    { label: "Watch (60-79)", count: watchCount, color: "bg-warning" },
                    { label: "Low Priority (40-59)", count: enriched.filter((d) => d.label === "low_priority").length, color: "bg-muted-foreground" },
                    { label: "Ignore (<40)", count: enriched.filter((d) => d.label === "ignore").length, color: "bg-destructive" },
                  ].map((b) => (
                    <div key={b.label} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${b.color}`} />
                      <span className="text-sm flex-1">{b.label}</span>
                      <span className="text-sm font-bold">{b.count}</span>
                      <div className="w-24">
                        <Progress value={(b.count / enriched.length) * 100} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── State Ranking ── */}
        <TabsContent value="states" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stateRanking.map((sr, i) => (
              <Card key={sr.state} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setStateFilter(sr.state); }}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6 text-right">#{i + 1}</span>
                    <div>
                      <h3 className="font-semibold">{sr.state}</h3>
                      <p className="text-xs text-muted-foreground">{sr.count} cities tracked</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{sr.avg}</p>
                    <p className="text-[10px] text-muted-foreground">avg score</p>
                    {sr.goNow > 0 && (
                      <Badge variant="outline" className="text-[9px] mt-1 bg-success/10 text-success border-success/30">
                        {sr.goNow} GO NOW
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Keywords ── */}
        <TabsContent value="keywords" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Keyword Performance Across Cities</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DEMAND_KEYWORDS.slice(0, 15).map((kw) => {
                  const citiesWithKw = enriched.filter((d) => d.topKeyword === kw);
                  const avgDemand = citiesWithKw.length > 0 ? Math.round(citiesWithKw.reduce((s, d) => s + d.demandScore, 0) / citiesWithKw.length) : 0;
                  return (
                    <div key={kw} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 font-medium">{kw}</span>
                      <span className="text-xs text-muted-foreground">{citiesWithKw.length} cities</span>
                      <div className="w-20">
                        <Progress value={avgDemand} className="h-1.5" />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{avgDemand}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Clusters ── */}
        <TabsContent value="clusters" className="space-y-3">
          <p className="text-sm text-muted-foreground">Cities within 100 miles that create travel cluster opportunities.</p>
          {enriched.filter((d) => d.label === "go_now").slice(0, 5).map((d) => {
            const nearby = findNearbyCities(d.cityId, 100);
            const nearbyWithDemand = nearby.map((nc) => ({ ...nc, demand: enriched.find((e) => e.cityId === nc.id) })).filter((n) => n.demand);
            const clusterScore = Math.round((d.travelScore + nearbyWithDemand.reduce((s, n) => s + (n.demand?.travelScore || 0), 0)) / (1 + nearbyWithDemand.length));
            return (
              <Card key={d.cityId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{d.city.city}, {d.city.stateCode}</h3>
                      <LabelBadge label={d.label} />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Cluster Score </span>
                      <span className="font-bold">{clusterScore}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nearbyWithDemand.slice(0, 6).map((n) => (
                      <Badge
                        key={n.id}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-primary/10"
                        onClick={() => setSelectedCityId(n.id)}
                      >
                        {n.city}, {n.stateCode}
                        <span className="ml-1 font-bold">{n.demand?.travelScore}</span>
                      </Badge>
                    ))}
                    {nearbyWithDemand.length === 0 && <span className="text-xs text-muted-foreground">No nearby cities in dataset</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ── City Detail ── */}
        {selectedDetail && (
          <TabsContent value="detail" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">{selectedDetail.city.city}, {selectedDetail.city.stateCode}</h2>
                      <LabelBadge label={selectedDetail.label} />
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedDetail.city.metroArea} · {selectedDetail.city.county} County · Pop. {(selectedDetail.city.population / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold">{selectedDetail.travelScore}</div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Travel Opportunity Score</p>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Demand Score", value: selectedDetail.demandScore, weight: "30%" },
                    { label: "Spike Score", value: selectedDetail.spikeScore, weight: "25%" },
                    { label: "Growth Velocity", value: Math.max(0, selectedDetail.growthVelocity), weight: "15%" },
                    { label: "Population", value: selectedDetail.populationWeight, weight: "10%" },
                    { label: "Tourism", value: selectedDetail.tourismWeight, weight: "10%" },
                    { label: "Low Competition", value: 100 - selectedDetail.competitionScore, weight: "10%" },
                    { label: "Confidence", value: selectedDetail.confidence, weight: "—" },
                    { label: "Seasonality", value: selectedDetail.seasonalityScore, weight: "—" },
                  ].map((s) => (
                    <div key={s.label} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className="text-xs text-muted-foreground">×{s.weight}</span>
                      </div>
                      <Progress value={s.value} className="h-2" />
                      <p className="text-sm font-bold">{s.value}/100</p>
                    </div>
                  ))}
                </div>

                {/* Trends */}
                <div className="flex items-center gap-6 mb-6 flex-wrap">
                  <div><span className="text-xs text-muted-foreground">7-day </span><TrendIndicator value={selectedDetail.trend7d} /></div>
                  <div><span className="text-xs text-muted-foreground">14-day </span><TrendIndicator value={selectedDetail.trend14d} /></div>
                  <div><span className="text-xs text-muted-foreground">30-day </span><TrendIndicator value={selectedDetail.trend30d} /></div>
                  <div><span className="text-xs text-muted-foreground">Volume </span><span className="text-sm font-bold">{selectedDetail.currentVolume}</span><span className="text-xs text-muted-foreground"> / baseline {selectedDetail.baseline30d}</span></div>
                </div>

                {/* Keywords */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Top Keyword</h4>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{selectedDetail.topKeyword}</Badge>
                  <span className="ml-2 text-xs text-muted-foreground">{selectedDetail.keywordCount} keywords spiking simultaneously</span>
                </div>

                {/* Nearby cluster */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Nearby Opportunities (100mi radius)</h4>
                  <div className="flex flex-wrap gap-2">
                    {nearbyDemand.slice(0, 8).map((n) => (
                      <Badge
                        key={n.id}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-primary/10"
                        onClick={() => setSelectedCityId(n.id)}
                      >
                        {n.city}, {n.stateCode}
                        <span className="ml-1 font-bold">{n.demand?.travelScore}</span>
                      </Badge>
                    ))}
                    {nearbyDemand.length === 0 && <span className="text-xs text-muted-foreground">No nearby cities in current dataset</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
