export type RegionKey = "north" | "northeast" | "central" | "south";

export const regionNameMap: Record<RegionKey, string> = {
  north: "ภาคเหนือ",
  northeast: "ภาคอีสาน",
  central: "ภาคกลาง",
  south: "ภาคใต้",
};

export const companies = [
  { id: "All", label: "One Logistic", color: "#0099FF" },
  { id: "TBL", label: "TBL", color: "#6B7280" },
  { id: "SERMSUK", label: "SERMSUK", color: "#6B7280" },
  { id: "HAVI", label: "HAVI", color: "#6B7280" },
];
