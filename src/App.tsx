import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import JuarezPage from "./pages/JuarezPage.tsx";
import GenissonPage from "./pages/GenissonPage.tsx";
import CristianPage from "./pages/CristianPage.tsx";
import LetielePage from "./pages/LetielePage.tsx";
import EduardoPage from "./pages/EduardoPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/juarez" element={<JuarezPage />} />
          <Route path="/genisson" element={<GenissonPage />} />
          <Route path="/cristian" element={<CristianPage />} />
          <Route path="/letiele" element={<LetielePage />} />
          <Route path="/eduardo" element={<EduardoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
