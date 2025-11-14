export interface Crop {
  id?: number;
  name: string;
  type: string;
  pricePerUnit: number;  // ✅ matches backend field
  quantity: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl?: string;
  location?: string;
  farmerId?: number;
  createdAt?: string;
}
