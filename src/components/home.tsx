import React, { useState } from "react";
import DashboardContent from "./dashboard/DashboardContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, Settings } from "lucide-react";

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock user data
  const user = {
    name: "Investor",
    email: "investor@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=investor",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/apex-logo.svg"
                alt="Apex Numismatics"
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold hidden md:block">
                Apex Numismatics Fund
              </h1>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost">Dashboard</Button>
              <Button variant="ghost">Performance</Button>
              <Button variant="ghost">Holdings</Button>
              <Button variant="ghost">Transactions</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t p-4 bg-background">
              <nav className="flex flex-col space-y-3">
                <Button variant="ghost" className="justify-start">
                  Dashboard
                </Button>
                <Button variant="ghost" className="justify-start">
                  Performance
                </Button>
                <Button variant="ghost" className="justify-start">
                  Holdings
                </Button>
                <Button variant="ghost" className="justify-start">
                  Transactions
                </Button>
                <Button variant="ghost" className="justify-start">
                  Profile
                </Button>
                <Button variant="ghost" className="justify-start">
                  Settings
                </Button>
              </nav>
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 px-2 md:px-4 lg:px-6">
          <DashboardContent />
        </main>

        {/* Footer */}
        <footer className="border-t py-4 bg-card">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rare Coins Investment Portal. All
            rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
