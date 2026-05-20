import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeClient } from "./page-client";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HomeClient />
      <Footer />
    </div>
  );
}
