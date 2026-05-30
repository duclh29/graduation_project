import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const MainLayout = () => (
  <div className="min-h-screen bg-sand text-ink">
    <div className="print:hidden">
      <Header />
    </div>
    <main className="page-transition print:m-0 print:p-0">
      <Outlet />
    </main>
    <div className="print:hidden">
      <Footer />
    </div>
  </div>
);

export default MainLayout;
