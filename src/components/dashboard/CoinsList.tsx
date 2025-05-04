import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Info,
  Trash,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coin as CoinType } from "@/lib/coinService";

interface CoinsListProps {
  coins: CoinType[];
  onDeleteCoin?: (coinId: string) => void;
  onMarkAsSold?: (coinId: string, soldPrice: number) => void;
  tabType: 'holdings' | 'transactions';
}

const CoinsList = ({ coins, onDeleteCoin, onMarkAsSold, tabType }: CoinsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof CoinType>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCoin, setSelectedCoin] = useState<CoinType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");

  // Filter coins based on tab type and search query
  const filteredCoins = React.useMemo(() => {
    console.log("Filtering coins:", coins, "Tab type:", tabType);
    const filtered = coins.filter(coin => {
      // First check if the coin matches the tab type
      const matchesTab = tabType === 'holdings' ? !coin.is_sold : coin.is_sold;
      
      // Then check if it matches the search query
      const matchesSearch = searchQuery === '' || 
        coin.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      console.log("Coin:", coin.name, "is_sold:", coin.is_sold, "matchesTab:", matchesTab, "matchesSearch:", matchesSearch);
      
      return matchesTab && matchesSearch;
    });
    
    console.log("Filtered coins result:", filtered);
    return filtered;
  }, [coins, tabType, searchQuery]);

  // Sort coins based on selected field and direction
  const sortedCoins = React.useMemo(() => {
    console.log("Sorting filtered coins:", filteredCoins);
    const sorted = [...filteredCoins].sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortField === 'purchase_price') {
        return sortDirection === 'asc'
          ? a.purchase_price - b.purchase_price
          : b.purchase_price - a.purchase_price;
      }
      if (sortField === 'current_value') {
        return sortDirection === 'asc'
          ? a.current_value - b.current_value
          : b.current_value - a.current_value;
      }
      if (sortField === 'roi') {
        return sortDirection === 'asc'
          ? a.roi - b.roi
          : b.roi - a.roi;
      }
      return 0;
    });
    
    console.log("Sorted coins result:", sorted);
    return sorted;
  }, [filteredCoins, sortField, sortDirection]);

  // Add effect to log props changes
  React.useEffect(() => {
    console.log("CoinsList props updated:", { coins, tabType });
  }, [coins, tabType]);

  // Handle sort click
  const handleSort = (field: keyof CoinType) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleMarkAsSold = () => {
    if (selectedCoin && soldPrice && !isNaN(parseFloat(soldPrice))) {
      onMarkAsSold && onMarkAsSold(selectedCoin.id, parseFloat(soldPrice));
      setSoldPrice("");
      setIsDialogOpen(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format ROI with color
  const formatROI = (roi: number) => {
    const isPositive = roi >= 0;
    return (
      <Badge
        variant={isPositive ? "default" : "destructive"}
        className={isPositive ? "bg-green-600" : ""}
      >
        {isPositive ? "+" : ""}
        {roi.toFixed(2)}%
      </Badge>
    );
  };

  return (
    <Card className="w-full bg-white shadow-none border-none">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">
            {tabType === 'holdings' ? 'Current Holdings' : 'Sold Assets'}
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as keyof CoinType);
              }}
            >
              <option value="name">Name</option>
              <option value="acquisition_date">Acquisition Date</option>
              <option value="purchase_price">Purchase Price</option>
              <option value="current_value">Current Value</option>
              <option value="roi">ROI</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sortedCoins.length > 0 ? (
            sortedCoins.map((coin) => (
              <Card
                key={coin.id}
                className="overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!coin.is_sold && onMarkAsSold && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCoin(coin);
                            setIsDialogOpen(true);
                          }}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Mark as Sold
                        </DropdownMenuItem>
                      )}
                      {onDeleteCoin && (
                        <DropdownMenuItem
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this coin?")) {
                              onDeleteCoin(coin.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Coin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="relative">
                  <div className="h-40 w-full overflow-hidden bg-muted">
                    <img
                      src={coin.image_url}
                      alt={coin.name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    {coin.is_sold && (
                      <Badge variant="secondary" className="bg-red-500 text-white">
                        Sold
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{coin.name}</h3>
                  
                  {coin.is_sold && coin.sold_price != null ? (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Purchased:</span>
                          <p>{formatDate(coin.acquisition_date)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sold:</span>
                          <p>{formatDate(coin.sold_date || "")}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Purchase Price:</span>
                          <p>{formatCurrency(coin.purchase_price)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sold Price:</span>
                          <p>{formatCurrency(coin.sold_price)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground">Profit:</span>
                          <p>
                            {formatCurrency(coin.sold_price - coin.purchase_price)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROI:</span>
                          {(() => {
                            const roi = ((coin.sold_price - coin.purchase_price) / coin.purchase_price) * 100;
                            return (
                              <p className={roi < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                {roi.toFixed(2)}%
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Acquired:</span>
                        <span>{formatDate(coin.acquisition_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span>{formatCurrency(coin.purchase_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Market Value:</span>
                        <span>{formatCurrency(coin.current_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-600">Active</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No coins found
            </div>
          )}
        </div>

        {/* Coin Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedCoin && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={selectedCoin.image_url}
                          alt={selectedCoin.name}
                        />
                        <AvatarFallback>
                          {selectedCoin.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedCoin.name}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this coin?")) {
                            onDeleteCoin && onDeleteCoin(selectedCoin.id);
                            setIsDialogOpen(false);
                          }
                        }}
                        className="h-8"
                      >
                        Delete Coin
                      </Button>
                    </div>
                  </div>
                  <DialogDescription>
                    {selectedCoin.year && (
                      <span className="mr-2">Year: {selectedCoin.year}</span>
                    )}
                    {selectedCoin.mint && (
                      <span className="mr-2">Mint: {selectedCoin.mint}</span>
                    )}
                    {selectedCoin.grade && (
                      <span>Grade: {selectedCoin.grade}</span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Acquisition Details</h3>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Acquisition Date
                          </h4>
                          <p>{formatDate(selectedCoin.acquisition_date)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Purchase Price
                          </h4>
                          <p>{formatCurrency(selectedCoin.purchase_price)}</p>
                        </div>
                        {selectedCoin.is_sold && selectedCoin.sold_price && (
                          <>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Sold Date
                              </h4>
                              <p>
                                {selectedCoin.sold_date
                                  ? formatDate(selectedCoin.sold_date)
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Sold Price
                              </h4>
                              <p>{formatCurrency(selectedCoin.sold_price)}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Profit
                              </h4>
                              <p>
                                {formatCurrency(
                                  selectedCoin.sold_price - selectedCoin.purchase_price
                                )}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                ROI
                              </h4>
                              <p className="text-green-600 font-medium">
                                {(
                                  ((selectedCoin.sold_price - selectedCoin.purchase_price) /
                                    selectedCoin.purchase_price) *
                                  100
                                ).toFixed(2)}
                                %
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Asset Image</h3>
                        <div className="border rounded-md p-2 flex items-center justify-center bg-muted/30">
                          <img 
                            src={selectedCoin.image_url} 
                            alt={selectedCoin.name}
                            className="max-h-[200px] object-contain" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-sm">
                          {selectedCoin.description || "No description available."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!selectedCoin.is_sold && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="soldPrice">Sold Price ($)</Label>
                          <Input
                            id="soldPrice"
                            type="number"
                            value={soldPrice}
                            onChange={(e) => setSoldPrice(e.target.value)}
                            placeholder="Enter sold price"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setSoldPrice("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleMarkAsSold}
                            disabled={!soldPrice || isNaN(parseFloat(soldPrice))}
                          >
                            Mark as Sold
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CoinsList;
