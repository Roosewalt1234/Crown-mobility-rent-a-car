export interface Car {
  id: string;
  name: string;
  brand: string;
  type: 'Luxury' | 'Sports' | 'SUV' | 'Economy';
  pricePerDay: number;
  image: string;
  features: string[];
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
}
