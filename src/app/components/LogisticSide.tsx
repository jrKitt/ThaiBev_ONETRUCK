"use client";
import { FaBars, FaGlobeAsia, FaChevronLeft } from "react-icons/fa";

const Sidebar = ({ drawerOpen, setDrawerOpen, showRegionSelector, setShowRegionSelector, regions, selectedRegion, handleRegionSelect }) => {
  return (
    <aside className={`bg-white shadow-lg overflow-y-auto transform transition-all duration-300 ${drawerOpen ? "w-120" : "w-16"}`} style={{ height: "100vh" }}>
      <div className="sticky top-0 bg-white z-10 p-2 flex justify-between items-center">
        <button onClick={() => setDrawerOpen((v) => !v)} className="bg-white p-2 rounded shadow-lg text-black flex items-center justify-center w-10 h-10">
          <FaBars className="text-xl" />
        </button>

        {drawerOpen && (
          <button onClick={() => setShowRegionSelector(!showRegionSelector)} className="bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2">
            <FaGlobeAsia />
            <span>{selectedRegion ? selectedRegion.name : "เลือกภูมิภาค"}</span>
          </button>
        )}
      </div>

      {showRegionSelector && (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button onClick={() => setShowRegionSelector(false)} className="flex items-center text-blue-500 font-medium">
              <FaChevronLeft className="mr-2" /> กลับ
            </button>
            <h2 className="text-xl font-semibold ml-4">เลือกภูมิภาค</h2>
          </div>

          <div className="space-y-2">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionSelect(region)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedRegion && selectedRegion.id === region.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              >
                <div className="flex items-center">
                  <FaGlobeAsia className="mr-3 text-blue-500" />
                  <span className="font-medium">{region.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
