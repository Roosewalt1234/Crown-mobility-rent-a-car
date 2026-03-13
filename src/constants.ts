import { Car, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'luxury', name: 'RENT LUXURY', icon: 'Crown', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800', count: 831 },
  { id: 'sports', name: 'RENT SPORTS', icon: 'Zap', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800', count: 209 },
  { id: 'suv', name: 'RENT SUV', icon: 'Mountain', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', count: 874 },
  { id: 'monthly', name: 'RENT MONTHLY', icon: 'Calendar', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800', count: 1606 },
  { id: 'cheap', name: 'CHEAP RENT A CAR', icon: 'Tag', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800', count: 398 },
  { id: 'supercars', name: 'RENT SUPERCARS', icon: 'Flame', image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=800', count: 95 },
  { id: 'convertible', name: 'RENT CONVERTIBLE', icon: 'Wind', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800', count: 158 },
  { id: 'electric', name: 'RENT ELECTRIC', icon: 'Battery', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', count: 12 },
  { id: 'driver', name: 'CAR WITH DRIVER', icon: 'UserCheck', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800', count: 60 },
  { id: 'driver-only', name: 'DRIVER FOR MY CAR', icon: 'User', image: 'https://images.unsplash.com/photo-1549194388-2469d59ec75c?auto=format&fit=crop&q=80&w=800', count: 11, unit: 'Services' },
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
