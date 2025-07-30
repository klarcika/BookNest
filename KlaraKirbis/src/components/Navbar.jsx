import { BookOpen, UserCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="bg-white shadow px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <BookOpen className="w-6 h-6 text-green-600" />
        <span>ReadNest</span>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books..."
          className="w-64 p-2 border rounded"
        />
        <UserCircle className="w-8 h-8 text-gray-600 cursor-pointer" />
      </div>
    </nav>
  );
}