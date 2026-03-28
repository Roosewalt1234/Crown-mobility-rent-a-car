import { Car } from '../types';

export const fleetService = {
  async getFeaturedCars(): Promise<Car[]> {
    try {
      const res = await fetch('/api/fleet');
      if (!res.ok) throw new Error('Failed to fetch fleet');
      const data = await res.json();
      
      return data.map((item: any) => ({
        id: item.vehicle_id || item.id,
        name: `${item.vehicle_make} ${item.vehicle_model} ${item.vehicle_year}`,
        brand: item.vehicle_make,
        type: (item.fleet_type || 'SUV') as any,
        image: item.vehicle_image_url,
        description: item.car_description,
        location: 'Dubai',
        year: Number(item.vehicle_year),
        region: 'GCC',
        pricing: {
          day: { original: Math.round(Number(item.special_day_price || item.day_price) * 1.2), current: Number(item.special_day_price || item.day_price) },
          week: { original: Math.round(Number(item.week_price) * 1.2), current: Number(item.week_price) },
          month: { original: Math.round(Number(item.month_price) * 1.2), current: Number(item.month_price) }
        },
        mileageLimit: Number(item.milage_limit),
        additionalMileageCharge: Number(item.extra_km_charge),
        includedFeatures: item.car_features ? item.car_features.split(',').map((f: string) => f.trim()) : ['Insurance included', '1 day rental available'],
        specs: {
          passengers: 5,
          transmission: 'Automatic',
          fuel: 'Petrol'
        }
      })) as Car[];
    } catch (err) {
      console.error('Error fetching featured cars:', err);
      return [];
    }
  },

  async getFleetForAI(): Promise<any[]> {
    try {
      if (typeof window === 'undefined') {
        console.warn('[FLEET-SERVICE] getFleetForAI called from server-side. This should be avoided; use direct DB query instead.');
        return [];
      }
      const res = await fetch('/api/fleet');
      if (!res.ok) throw new Error('Failed to fetch fleet');
      return await res.json();
    } catch (err) {
      console.error('Error fetching fleet for AI:', err);
      return [];
    }
  }
};
