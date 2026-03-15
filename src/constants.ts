import { Car, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'luxury', name: 'LUXURY FLEET', icon: 'Crown', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/luxury%20-%20crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvbHV4dXJ5IC0gY3Jlc2NlbnQucG5nIiwiaWF0IjoxNzczNDE1Mjg1LCJleHAiOjE4MDQ5NTEyODV9.Azz6dhmF-E979yx9-17waG-2KKYsI2pmDMk3jaY9egI', count: 831 },
  { id: 'sports', name: 'SPORTS FLEET', icon: 'Zap', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/sports%20car-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvc3BvcnRzIGNhci1jcmVzY2VudC5wbmciLCJpYXQiOjE3NzM0MTQ3OTEsImV4cCI6MTgwNDk1MDc5MX0.SJ-0AnPzh-vWYNAVKCpc9T-PgFoPN9Aepjh6gYdkFMM', count: 209 },
  { id: 'suv', name: 'SUV FLEET', icon: 'Mountain', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/Patrol-Crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvUGF0cm9sLUNyZXNjZW50LnBuZyIsImlhdCI6MTc3MzQxNDUxMiwiZXhwIjoxODA0OTUwNTEyfQ.kaBz1ITyE_d5TxHTzQdjYV7W-p0PjArgyB7vMPiZgII', count: 874 },
  { id: 'cheap', name: 'ECONOMY FLEET', icon: 'Tag', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/picanto-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvcGljYW50by1jcmVzY2VudC5wbmciLCJpYXQiOjE3NzM0MTUwOTEsImV4cCI6MTgwNDk1MTA5MX0.58cwZH3QBzBNE3ONFq77Iwvwzt8UADEMmBfcncwM_DU', count: 398 },
  { id: 'supercars', name: 'SUPERCARS FLEET', icon: 'Flame', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/super%20car-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvc3VwZXIgY2FyLWNyZXNjZW50LnBuZyIsImlhdCI6MTc3MzQxNDk3NCwiZXhwIjoxODA0OTUwOTc0fQ.9b-jKf0YCmS6h7grGEPTyosFFY_ZQfveMoj8ZuhvkPQ', count: 95 },
  { id: 'convertible', name: 'CONVERTIBLE FLEET', icon: 'Wind', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/convertible-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvY29udmVydGlibGUtY3Jlc2NlbnQucG5nIiwiaWF0IjoxNzczNDE3OTYxLCJleHAiOjE4MDQ5NTM5NjF9.txdMd3jl4ZrturzGacNWQilZZLwUK7W6joAf1-vgjVg', count: 158 },
  { id: 'electric', name: 'ELECTRIC FLEET', icon: 'Battery', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/tesla-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvdGVzbGEtY3Jlc2NlbnQucG5nIiwiaWF0IjoxNzczNDE1MzcyLCJleHAiOjE4MDQ5NTEzNzJ9.6OMXxTeKv7AF2fN1QEgF53nbMckGGNs0yvuj-jIdio0', count: 12 },
  { id: 'driver-only', name: 'DRIVER SERVICE', icon: 'User', image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/cadilac%20with%20driver-cresecent%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvY2FkaWxhYyB3aXRoIGRyaXZlci1jcmVzZWNlbnQgKDEpLnBuZyIsImlhdCI6MTc3MzQxNDY1OSwiZXhwIjoxODA0OTUwNjU5fQ.Z9UsSzosZFYu5_wX8pzJWeEcYgtjrIEk1fg-y-Q41cA', count: 11, unit: 'Services' },
];

export const CARS: Car[] = [
  {
    id: '1',
    name: 'Rolls Royce Cullinan',
    brand: 'Rolls Royce',
    type: 'Luxury',
    pricePerDay: 5000,
    image: 'https://images.unsplash.com/photo-1631214524020-5e18410f542f?auto=format&fit=crop&q=80&w=800',
    features: ['Chauffeur available', 'Massage seats', 'Starlight headliner'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '2',
    name: 'Lamborghini Huracan',
    brand: 'Lamborghini',
    type: 'Sports',
    pricePerDay: 3500,
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=800',
    features: ['V10 Engine', 'Convertible', 'Track mode'],
    specs: { passengers: 2, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '3',
    name: 'Mercedes G63 AMG',
    brand: 'Mercedes',
    type: 'SUV',
    pricePerDay: 2500,
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800',
    features: ['Off-road capability', 'Premium Audio', 'Sunroof'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '4',
    name: 'Ferrari F8 Tributo',
    brand: 'Ferrari',
    type: 'Sports',
    pricePerDay: 4000,
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800',
    features: ['Turbocharged V8', 'Carbon Fiber Interior', 'Launch Control'],
    specs: { passengers: 2, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '5',
    name: 'Range Rover Vogue',
    brand: 'Land Rover',
    type: 'Luxury',
    pricePerDay: 1800,
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=800',
    features: ['Air Suspension', 'Panoramic Roof', 'Cooler Box'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Diesel' }
  },
  {
    id: '6',
    name: 'Tesla Model S Plaid',
    brand: 'Tesla',
    type: 'Luxury',
    pricePerDay: 1200,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    features: ['Autopilot', 'Ludicrous Mode', 'Silent Drive'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Electric' }
  }
];
