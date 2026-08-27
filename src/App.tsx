import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { CompareProvider } from "@/context/CompareContext";
import { AuthProvider } from "@/hooks/useAuth";
import { OrgProvider } from "@/context/OrgContext";
import CompareBar from "@/components/CompareBar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PropertyListPage from "./pages/PropertyListPage";
import PropertyDetail from "./pages/PropertyDetail";
import NewProjects from "./pages/NewProjects";
import PriceTrends from "./pages/PriceTrends";
import HomeLoans from "./pages/HomeLoans";
import News from "./pages/News";
import ArticleDetail from "./pages/ArticleDetail";
import Agents from "./pages/Agents";
import PostProperty from "./pages/PostProperty";
import Login from "./pages/Login";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import BecomeAgent from "./pages/BecomeAgent";
import AgentProfile from "./pages/AgentProfile";
import ProjectDetail from "./pages/ProjectDetail";
import ResetPassword from "./pages/ResetPassword";
import SupportChat from "./components/SupportChat";
import OrgCreate from "./pages/OrgCreate";
import OrgSettings from "./pages/OrgSettings";
import OrgMembers from "./pages/OrgMembers";
import OrgInviteAccept from "./pages/OrgInviteAccept";
import AgentCRM from "./pages/AgentCRM";
import BuyerShortlists from "./pages/BuyerShortlists";
import ThankYou from "./pages/ThankYou";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LocalityPage from "./pages/LocalityPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <OrgProvider>
          <CompareProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/buy" element={<PropertyListPage type="buy" title="Property for Sale in Lucknow" subtitle="Search verified property listings for sale across Lucknow" />} />
                <Route path="/rent" element={<PropertyListPage type="rent" title="Properties for Rent in Lucknow" subtitle="Find verified rental homes from owners and agents across Lucknow" />} />
                <Route path="/commercial" element={<PropertyListPage type="commercial" title="Commercial Property for Sale in Lucknow" subtitle="Search verified commercial properties for sale across Lucknow" />} />
                <Route path="/pg" element={<PropertyListPage type="pg" title="PG & Co-Living Spaces" subtitle="Affordable PG accommodations across major cities" />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/new-projects" element={<NewProjects />} />
                <Route path="/price-trends" element={<PriceTrends />} />
                <Route path="/home-loans" element={<HomeLoans />} />
                <Route path="/news" element={<News />} />
                <Route path="/articles/:slug" element={<ArticleDetail />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/post-property" element={<PostProperty />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/agent-dashboard" element={<AgentDashboard />} />
                <Route path="/become-agent" element={<BecomeAgent />} />
                <Route path="/agent/:id" element={<AgentProfile />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/org/create" element={<OrgCreate />} />
                <Route path="/org/settings" element={<OrgSettings />} />
                <Route path="/org/members" element={<OrgMembers />} />
                <Route path="/org/invite/:token" element={<OrgInviteAccept />} />
                <Route path="/agent-dashboard/crm" element={<AgentCRM />} />
                <Route path="/shortlists" element={<BuyerShortlists />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/lucknow/:slug" element={<LocalityPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CompareBar />
              <SupportChat />
            </BrowserRouter>
          </TooltipProvider>
          </CompareProvider>
        </OrgProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
