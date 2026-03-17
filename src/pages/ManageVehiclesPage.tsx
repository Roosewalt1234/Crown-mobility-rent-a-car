import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  Car, 
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Info,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Vehicle {
  vehicle_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  fleet_type: string;
  vehicle_image_url: string;
  car_description: string;
  day_price: number;
  week_price: number;
  month_price: number;
  milage_limit: number;
  extra_km_charge: number;
  car_features: string;
  deposit_amount: number;
  created_at?: string;
}

export const ManageVehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear().toString(),
    fleet_type: '',
    vehicle_image_url: '',
    car_description: '',
    day_price: 0,
    week_price: 0,
    month_price: 0,
    milage_limit: 250,
    extra_km_charge: 5,
    car_features: '',
    deposit_amount: 3000
  });

  const FLEET_TYPES = ['SUV', 'Luxury', 'Sports', 'Economy', 'Convertible', 'Sedan', 'Electric'];

  const toggleFleetType = (type: string) => {
    const currentTypes = formData.fleet_type ? formData.fleet_type.split(',').map(t => t.trim()) : [];
    let newTypes;
    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    setFormData({ ...formData, fleet_type: newTypes.join(', ') });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fleet_stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to handle potential 'deposit - amount' column name
      const mappedData = (data || []).map((v: any) => ({
        ...v,
        deposit_amount: v.deposit_amount ?? v['deposit - amount'] ?? 3000
      }));
      
      setVehicles(mappedData);
    } catch (error: any) {
      toast.error('Failed to fetch vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: new Date().getFullYear().toString(),
        fleet_type: 'SUV',
        vehicle_image_url: '',
        car_description: '',
        day_price: 0,
        week_price: 0,
        month_price: 0,
        milage_limit: 250,
        extra_km_charge: 5,
        car_features: '',
        deposit_amount: 3000
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = { ...formData };
      
      // Handle potential column name mismatch for deposit
      if (formData.deposit_amount !== undefined) {
        payload['deposit - amount'] = formData.deposit_amount;
      }

      if (editingVehicle) {
        const { error } = await supabase
          .from('fleet_stock')
          .update(payload)
          .eq('vehicle_id', editingVehicle.vehicle_id);
        
        if (error) throw error;
        toast.success('Vehicle updated successfully');
      } else {
        const { error } = await supabase
          .from('fleet_stock')
          .insert([formData]);
        
        if (error) throw error;
        toast.success('Vehicle added successfully');
      }
      
      setIsModalOpen(false);
      fetchVehicles();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('fleet_stock')
        .delete()
        .eq('vehicle_id', id);

      if (error) throw error;
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error: any) {
      toast.error('Error deleting vehicle: ' + error.message);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    `${v.vehicle_make} ${v.vehicle_model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Vehicles</h1>
          <p className="text-slate-500">Add, edit, or remove vehicles from your fleet.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2e7d32] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by make or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-[#2e7d32]/50 transition-all"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing (Day)</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-[#2e7d32] animate-spin" />
                      <p className="text-slate-500 font-medium">Loading vehicles...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Car size={48} />
                      <p className="font-medium">No vehicles found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                          {vehicle.vehicle_image_url ? (
                            <img src={vehicle.vehicle_image_url} alt={vehicle.vehicle_model} className="w-full h-full object-cover" />
                          ) : (
                            <Car size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{vehicle.vehicle_make} {vehicle.vehicle_model}</p>
                          <p className="text-xs text-slate-500">{vehicle.vehicle_year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1">
                        {vehicle.fleet_type?.split(',').map((type, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                            {type.trim()}
                          </span>
                        )) || (
                          <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">AED {vehicle.day_price}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Per Day</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-slate-600">Available</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(vehicle)}
                          className="p-2 text-slate-400 hover:text-[#2e7d32] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(vehicle.vehicle_id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h2>
                  <p className="text-sm text-slate-500">Fill in the details below to update your fleet.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#2e7d32]">
                    <Info size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Make</label>
                      <input 
                        required
                        value={formData.vehicle_make}
                        onChange={e => setFormData({...formData, vehicle_make: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                        placeholder="e.g. Nissan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model</label>
                      <input 
                        required
                        value={formData.vehicle_model}
                        onChange={e => setFormData({...formData, vehicle_model: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                        placeholder="e.g. Kicks"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                      <input 
                        required
                        value={formData.vehicle_year}
                        onChange={e => setFormData({...formData, vehicle_year: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#2e7d32]">
                    <DollarSign size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Pricing Details (AED)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day Price</label>
                      <input 
                        type="number"
                        required
                        value={formData.day_price}
                        onChange={e => setFormData({...formData, day_price: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Week Price</label>
                      <input 
                        type="number"
                        required
                        value={formData.week_price}
                        onChange={e => setFormData({...formData, week_price: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Month Price</label>
                      <input 
                        type="number"
                        required
                        value={formData.month_price}
                        onChange={e => setFormData({...formData, month_price: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#2e7d32]">
                    <Calendar size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Technical & Limits</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-4 space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Types (Select multiple)</label>
                      <div className="flex flex-wrap gap-2">
                        {FLEET_TYPES.map(type => {
                          const isSelected = formData.fleet_type?.split(',').map(t => t.trim()).includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleFleetType(type)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-[#2e7d32] text-white border-[#2e7d32]' 
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#2e7d32]/30'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mileage Limit (KM)</label>
                      <input 
                        type="number"
                        value={formData.milage_limit}
                        onChange={e => setFormData({...formData, milage_limit: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extra KM Charge</label>
                      <input 
                        type="number"
                        value={formData.extra_km_charge}
                        onChange={e => setFormData({...formData, extra_km_charge: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deposit</label>
                      <input 
                        type="number"
                        value={formData.deposit_amount}
                        onChange={e => setFormData({...formData, deposit_amount: Number(e.target.value)})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Media & Features */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#2e7d32]">
                    <ImageIcon size={18} />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Media & Features</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                      <input 
                        value={formData.vehicle_image_url}
                        onChange={e => setFormData({...formData, vehicle_image_url: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features (Comma separated)</label>
                      <input 
                        value={formData.car_features}
                        onChange={e => setFormData({...formData, car_features: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50"
                        placeholder="Apple CarPlay, Sunroof, Leather Seats..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea 
                        rows={4}
                        value={formData.car_description}
                        onChange={e => setFormData({...formData, car_description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2e7d32]/50 resize-none"
                        placeholder="Describe the vehicle..."
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-10 py-3 bg-[#2e7d32] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2e7d32]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={20} />
                  )}
                  {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
