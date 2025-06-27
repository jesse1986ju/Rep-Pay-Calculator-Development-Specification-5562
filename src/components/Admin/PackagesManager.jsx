import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'

const { FiPackage, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } = FiIcons

const PackagesManager = () => {
  const [activeTab, setActiveTab] = useState('packages')
  const [basePackages, setBasePackages] = useState([])
  const [equipmentAddons, setEquipmentAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [newPackage, setNewPackage] = useState({
    name: '',
    equipment_cost: '',
    install_fee: '',
    activation_fee: ''
  })
  const [newAddon, setNewAddon] = useState({
    name: '',
    cost: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [packagesResult, addonsResult] = await Promise.all([
        supabase.from('base_packages').select('*').order('name'),
        supabase.from('equipment_addons').select('*').order('name')
      ])

      setBasePackages(packagesResult.data || [])
      setEquipmentAddons(addonsResult.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePackage = async (packageData) => {
    try {
      if (packageData.id) {
        const { error } = await supabase
          .from('base_packages')
          .update({
            name: packageData.name,
            equipment_cost: parseFloat(packageData.equipment_cost),
            install_fee: parseFloat(packageData.install_fee),
            activation_fee: parseFloat(packageData.activation_fee)
          })
          .eq('id', packageData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('base_packages')
          .insert([{
            name: packageData.name,
            equipment_cost: parseFloat(packageData.equipment_cost),
            install_fee: parseFloat(packageData.install_fee),
            activation_fee: parseFloat(packageData.activation_fee)
          }])

        if (error) throw error
      }

      await loadData()
      setEditingId(null)
      setNewPackage({
        name: '',
        equipment_cost: '',
        install_fee: '',
        activation_fee: ''
      })
    } catch (error) {
      console.error('Error saving package:', error)
    }
  }

  const saveAddon = async (addonData) => {
    try {
      if (addonData.id) {
        const { error } = await supabase
          .from('equipment_addons')
          .update({
            name: addonData.name,
            cost: parseFloat(addonData.cost),
            description: addonData.description
          })
          .eq('id', addonData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('equipment_addons')
          .insert([{
            name: addonData.name,
            cost: parseFloat(addonData.cost),
            description: addonData.description
          }])

        if (error) throw error
      }

      await loadData()
      setEditingId(null)
      setNewAddon({
        name: '',
        cost: '',
        description: ''
      })
    } catch (error) {
      console.error('Error saving addon:', error)
    }
  }

  const deleteItem = async (table, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'packages', label: 'Base Packages' },
            { id: 'addons', label: 'Equipment Add-ons' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'packages' ? (
        <div className="space-y-6">
          {/* Add New Package */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Base Package</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Package name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPackage.equipment_cost}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, equipment_cost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Install Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPackage.install_fee}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, install_fee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activation Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPackage.activation_fee}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, activation_fee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => savePackage(newPackage)}
                disabled={!newPackage.name || !newPackage.equipment_cost || !newPackage.install_fee || !newPackage.activation_fee}
                className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
                Add Package
              </button>
            </div>
          </div>

          {/* Packages Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activation Fee</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {basePackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SafeIcon icon={FiPackage} className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pkg.equipment_cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pkg.install_fee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${pkg.activation_fee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingId(editingId === pkg.id ? null : pkg.id)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          <SafeIcon icon={editingId === pkg.id ? FiX : FiEdit2} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem('base_packages', pkg.id)}
                          className="text-danger-600 hover:text-danger-900 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add New Addon */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Add New Equipment Add-on</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAddon.name}
                  onChange={(e) => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add-on name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAddon.cost}
                  onChange={(e) => setNewAddon(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newAddon.description}
                  onChange={(e) => setNewAddon(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => saveAddon(newAddon)}
                disabled={!newAddon.name || !newAddon.cost}
                className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
                Add Add-on
              </button>
            </div>
          </div>

          {/* Add-ons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentAddons.map((addon) => (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{addon.name}</h3>
                    <p className="text-2xl font-bold text-primary-600">${addon.cost}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(editingId === addon.id ? null : addon.id)}
                      className="text-primary-600 hover:text-primary-900 transition-colors"
                    >
                      <SafeIcon icon={editingId === addon.id ? FiX : FiEdit2} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem('equipment_addons', addon.id)}
                      className="text-danger-600 hover:text-danger-900 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {addon.description && (
                  <p className="text-sm text-gray-600">{addon.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PackagesManager