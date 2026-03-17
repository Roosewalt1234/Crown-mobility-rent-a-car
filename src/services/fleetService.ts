import { supabase } from '../lib/supabase';
import { Car } from '../types';

export const fleetService = {
  async getFeaturedCars(): Promise<Car[]> {
    const { data, error } = await supabase
      .from('fleet_stock')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(9);
    
    if (error) {
      console.error('Error fetching featured cars:', error);
      throw error;
    }

    if (!data) return [];

    try {
      return data.map((item: any) => ({
        id: item.vehicle_id || item.created_at,
        name: `${item.vehicle_make} ${item.vehicle_model} ${item.vehicle_year}`,
        brand: item.vehicle_make,
        type: (item.fleet_type || 'SUV') as any,
        image: item.vehicle_image_url,
        description: item.car_description,
        location: 'Dubai', // Default location as it's not in schema
        year: Number(item.vehicle_year),
        region: 'GCC',
        pricing: {
          day: { original: Math.round(Number(item.day_price) * 1.2), current: Number(item.day_price) },
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
    } catch (mapError) {
      console.error('Error mapping fleet data:', mapError);
      throw new Error('Data format mismatch from Supabase');
    }
  },

  async getFleetForAI(): Promise<any[]> {
    const { data, error } = await supabase
      .from('fleet_stock')
      .select('*');
    
    if (error) {
      console.error('Error fetching fleet for AI:', error);
      return [];
    }
    return data || [];
  }
};
