export interface Car {
  id: string;
  name: string;
  brand: string;
  type: 'Luxury' | 'Sports' | 'SUV' | 'Economy' | 'Supercars' | 'Convertible' | 'Electric' | 'Driver Service';
  image: string;
  description?: string;
  location?: string;
  year?: number;
  region?: string;
  pricing: {
    day: { original: number; current: number };
    week: { original: number; current: number };
    month: { original: number; current: number };
  };
  mileageLimit?: number;
  additionalMileageCharge?: number;
  includedFeatures?: string[];
  specs: {
    passengers: number;
    transmission: string;
    fuel: string;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  count: number;
  unit?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  media_url?: string;
  media_type?: string;
}
