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

export interface TruckInfo {
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  truckClass: string;
  region: number;
  depot: string;
}
export interface Shipment {
  id: string;
  company: string;
  origin: { name: string; latitude: number; longitude: number };
  destination: { name: string; latitude: number; longitude: number };
  departure_time: string;
  estimated_arrival_time: string;
  distance_km: number;
  estimated_duration_hours: number;
  status: "All" | "available" | "in_transit" | "broken";
  progress: number;
  orders: { orderId: string; item: string; quantity: number }[];
  route?: { lat: number; lng: number }[];
  truck?: TruckInfo;
}