import { Link } from "wouter";
import { Brackets } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <Brackets className="bg-blue-500 text-black rounded p-1 h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold text-gradient">Preflow</h1>
          </div>
        </Link>
        <nav>
          <ul className="flex">
            <li>
              <a href="#" className="px-4 py-2 text-sm font-medium button-gradient text-white rounded-md shadow-lg shadow-blue-500/20">Get Started</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
