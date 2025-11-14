export interface CropRequest {
  id?: number;
  cropId: number;
  cropName?: string;
  farmerId?: number;
  dealerId?: number;
  offeredPrice: number;   // ✅ this replaces pricePerUnit
  quantity: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}
