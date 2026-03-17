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

export const FLEET_STOCK: Car[] = [
  {
    id: '1',
    name: 'Jetour T2 2026',
    brand: 'Jetour',
    type: 'SUV',
    image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/stock-car-images/jetour%20t2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzdG9jay1jYXItaW1hZ2VzL2pldG91ciB0Mi5wbmciLCJpYXQiOjE3NzM1OTQ5NDYsImV4cCI6MTgwNTEzMDk0Nn0._CVQmK0juZZsOsse2cf58R6wGv14NSY45eZJBl7Qr1E',
    description: 'A rugged off-road SUV with bold styling, strong performance, advanced technology, spacious interior, and excellent capability for both city driving and adventure.',
    location: 'Dubai',
    year: 2026,
    region: 'GCC',
    pricing: {
      day: { original: 300, current: 250 },
      week: { original: 2040, current: 1700 },
      month: { original: 6600, current: 5500 }
    },
    mileageLimit: 100,
    additionalMileageCharge: 20,
    includedFeatures: ['1 day rental available', 'Insurance included'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '2',
    name: 'Dodge Charger GT 2024',
    brand: 'Dodge',
    type: 'Sports',
    image: 'https://images.unsplash.com/photo-1612462225010-388160910156?auto=format&fit=crop&q=80&w=800',
    description: 'Experience the raw power of American muscle. The Dodge Charger GT combines aggressive styling with a comfortable interior and thrilling performance.',
    location: 'Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 600, current: 450 },
      week: { original: 3800, current: 2800 },
      month: { original: 12000, current: 9500 }
    },
    mileageLimit: 250,
    additionalMileageCharge: 5,
    includedFeatures: ['V6 Engine', 'Sport Mode', 'Premium Sound System'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '3',
    name: 'Lamborghini Huracan',
    brand: 'Lamborghini',
    type: 'Sports',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=800',
    description: 'Unleash the power of the V10. A masterpiece of Italian engineering and performance.',
    location: 'Marina, Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 4500, current: 3500 },
      week: { original: 28000, current: 22000 },
      month: { original: 90000, current: 75000 }
    },
    mileageLimit: 250,
    additionalMileageCharge: 10,
    includedFeatures: ['V10 Engine', 'Convertible', 'Track mode'],
    specs: { passengers: 2, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '4',
    name: 'Mercedes G63 AMG',
    brand: 'Mercedes',
    type: 'SUV',
    image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800',
    description: 'The iconic G-Wagon. Combining off-road prowess with ultimate luxury and status.',
    location: 'Jumeirah, Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 3500, current: 2500 },
      week: { original: 20000, current: 15000 },
      month: { original: 70000, current: 55000 }
    },
    mileageLimit: 250,
    additionalMileageCharge: 5,
    includedFeatures: ['Off-road capability', 'Premium Audio', 'Sunroof'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '5',
    name: 'Ferrari F8 Tributo',
    brand: 'Ferrari',
    type: 'Sports',
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800',
    description: 'Turbocharged V8, Carbon Fiber Interior, Launch Control. Experience the thrill of Maranello.',
    location: 'Palm Jumeirah, Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 5500, current: 4000 },
      week: { original: 35000, current: 28000 },
      month: { original: 120000, current: 95000 }
    },
    mileageLimit: 200,
    additionalMileageCharge: 20,
    includedFeatures: ['Turbocharged V8', 'Carbon Fiber Interior', 'Launch Control'],
    specs: { passengers: 2, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '6',
    name: 'Range Rover Vogue',
    brand: 'Land Rover',
    type: 'Luxury',
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&q=80&w=800',
    description: 'Air Suspension, Panoramic Roof, Cooler Box. The ultimate luxury SUV for any terrain.',
    location: 'Business Bay, Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 2500, current: 1800 },
      week: { original: 15000, current: 12000 },
      month: { original: 50000, current: 40000 }
    },
    mileageLimit: 250,
    additionalMileageCharge: 5,
    includedFeatures: ['Air Suspension', 'Panoramic Roof', 'Cooler Box'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Diesel' }
  },
  {
    id: '7',
    name: 'Nissan Patrol V8 2024',
    brand: 'Nissan',
    type: 'SUV',
    image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/Patrol-Crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvUGF0cm9sLUNyZXNjZW50LnBuZyIsImlhdCI6MTc3MzQxNDUxMiwiZXhwIjoxODA0OTUwNTEyfQ.kaBz1ITyE_d5TxHTzQdjYV7W-p0PjArgyB7vMPiZgII',
    description: 'The Hero of All Terrains. The Nissan Patrol combines legendary off-road capability with a premium, spacious interior.',
    location: 'Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 800, current: 650 },
      week: { original: 5000, current: 4200 },
      month: { original: 18000, current: 15000 }
    },
    mileageLimit: 250,
    additionalMileageCharge: 5,
    includedFeatures: ['V8 Engine', '7-Seater', 'Off-road mode'],
    specs: { passengers: 7, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '8',
    name: 'Porsche 911 Carrera 2024',
    brand: 'Porsche',
    type: 'Sports',
    image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/sports%20car-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvc3BvcnRzIGNhci1jcmVzY2VudC5wbmciLCJpYXQiOjE3NzM0MTQ3OTEsImV4cCI6MTgwNDk1MDc5MX0.SJ-0AnPzh-vWYNAVKCpc9T-PgFoPN9Aepjh6gYdkFMM',
    description: 'The definitive sports car. Precision engineering meets timeless design for an unmatched driving experience.',
    location: 'Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 2500, current: 1900 },
      week: { original: 15000, current: 12000 },
      month: { original: 50000, current: 42000 }
    },
    mileageLimit: 200,
    additionalMileageCharge: 10,
    includedFeatures: ['Turbocharged Flat-6', 'Sport Chrono', 'Bose Sound'],
    specs: { passengers: 2, transmission: 'Automatic', fuel: 'Petrol' }
  },
  {
    id: '9',
    name: 'Tesla Model 3 Performance 2024',
    brand: 'Tesla',
    type: 'Electric',
    image: 'https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/web%20page%20images/tesla-crescent.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ3ZWIgcGFnZSBpbWFnZXMvdGVzbGEtY3Jlc2NlbnQucG5nIiwiaWF0IjoxNzczNDE1MzcyLCJleHAiOjE4MDQ5NTEzNzJ9.6OMXxTeKv7AF2fN1QEgF53nbMckGGNs0yvuj-jIdio0',
    description: 'The future of driving. Blistering acceleration, cutting-edge technology, and zero emissions.',
    location: 'Dubai',
    year: 2024,
    region: 'GCC',
    pricing: {
      day: { original: 500, current: 399 },
      week: { original: 3000, current: 2500 },
      month: { original: 10000, current: 8500 }
    },
    mileageLimit: 300,
    additionalMileageCharge: 2,
    includedFeatures: ['Autopilot', 'Supercharging', 'Premium Connectivity'],
    specs: { passengers: 5, transmission: 'Automatic', fuel: 'Electric' }
  }
];
