import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'

const { FiPackage, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiDollarSign, FiTool, FiZap, FiRefreshCw } = FiIcons

const PackagesManager = () => {
  const [activeTab, setActiveTab] = useState('packages')
  const [basePackages, setBasePackages] = useState([])
  const [equipmentAddons, setEquipmentAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editingData, setEditingData] = useState({})
  const [newPackage, setNewPackage] = useState({
    name: '',
    mmr_value: '',
    passthrough_deduction: '',
    equipment_cost: '',
    install_fee: '',
    activation_fee: ''
  })
  const [newAddon, setNewAddon] = useState({
    name: '',
    cost: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading packages and addons...')
      
      // Load base packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('base_packages_rpc_x7k9m2')
        .select('*')
        .order('name')

      if (packagesError) {
        console.error('Error loading packages:', packagesError)
        setError('Error loading packages: ' + packagesError.message)
      } else {
        console.log('Packages loaded:', packagesData)
        setBasePackages(packagesData || [])
      }

      // Load equipment addons
      const { data: addonsData, error: addonsError } = await supabase
        .from('equipment_addons_rpc_x7k9m2')
        .select('*')
        .order('name')

      if (addonsError) {
        console.error('Error loading addons:', addonsError)
        setError('Error loading addons: ' + addonsError.message)
      } else {
        console.log('Addons loaded:', addonsData)
        setEquipmentAddons(addonsData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (item, type) => {
    console.log('Starting edit for:', item)
    setEditingId(item.id)
    // Make sure we copy all the values properly
    setEditingData({
      ...item,
      type,
      // Ensure all numeric fields are strings for input fields
      mmr_value: item.mmr_value?.toString() || '',
      passthrough_deduction: item.passthrough_deduction?.toString() || '',
      equipment_cost: item.equipment_cost?.toString() || '',
      install_fee: item.install_fee?.toString() || '',
      activation_fee: item.activation_fee?.toString() || '',
      cost: item.cost?.toString() || ''
    })
  }

  const cancelEditing = () => {
    console.log('Canceling edit')
    setEditingId(null)
    setEditingData({})
  }

  const updateEditingData = (field, value) => {
    console.log('Updating editing data:', field, value)
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const savePackage = async (packageData) => {
    try {
      setSaving(true)
      console.log('Saving package:', packageData)
      
      // Validate required fields
      if (!packageData.name || !packageData.mmr_value) {
        alert('Package name and MMR value are required')
        return
      }

      const updateData = {
        name: packageData.name.trim(),
        mmr_value: parseFloat(packageData.mmr_value) || 0,
        passthrough_deduction: parseFloat(packageData.passthrough_deduction) || 0,
        equipment_cost: parseFloat(packageData.equipment_cost) || 0,
        install_fee: parseFloat(packageData.install_fee) || 0,
        activation_fee: parseFloat(packageData.activation_fee) || 0,
        updated_at: new Date().toISOString()
      }

      console.log('Update data prepared:', updateData)
      
      if (packageData.id) {
        // Update existing package
        const { data, error } = await supabase
          .from('base_packages_rpc_x7k9m2')
          .update(updateData)
          .eq('id', packageData.id)
          .select()

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        
        console.log('Package updated successfully:', data)
        alert('Package updated successfully!')
      } else {
        // Create new package
        const { data, error } = await supabase
          .from('base_packages_rpc_x7k9m2')
          .insert([{
            name: updateData.name,
            mmr_value: updateData.mmr_value,
            passthrough_deduction: updateData.passthrough_deduction,
            equipment_cost: updateData.equipment_cost,
            install_fee: updateData.install_fee,
            activation_fee: updateData.activation_fee
          }])
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        
        console.log('Package created successfully:', data)
        alert('Package created successfully!')
      }

      // Reload data and reset form
      await loadData()
      setEditingId(null)
      setEditingData({})
      setNewPackage({
        name: '',
        mmr_value: '',
        passthrough_deduction: '',
        equipment_cost: '',
        install_fee: '',
        activation_fee: ''
      })
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Error saving package: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveAddon = async (addonData) => {
    try {
      setSaving(true)
      console.log('Saving addon:', addonData)
      
      // Validate required fields
      if (!addonData.name || !addonData.cost) {
        alert('Add-on name and cost are required')
        return
      }

      const updateData = {
        name: addonData.name.trim(),
        cost: parseFloat(addonData.cost) || 0,
        description: addonData.description?.trim() || '',
        updated_at: new Date().toISOString()
      }

      console.log('Update data prepared:', updateData)
      
      if (addonData.id) {
        // Update existing addon
        const { data, error } = await supabase
          .from('equipment_addons_rpc_x7k9m2')
          .update(updateData)
          .eq('id', addonData.id)
          .select()

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        
        console.log('Add-on updated successfully:', data)
        alert('Add-on updated successfully!')
      } else {
        // Create new addon
        const { data, error } = await supabase
          .from('equipment_addons_rpc_x7k9m2')
          .insert([{
            name: updateData.name,
            cost: updateData.cost,
            description: updateData.description
          }])
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        
        console.log('Add-on created successfully:', data)
        alert('Add-on created successfully!')
      }

      // Reload data and reset form
      await loadData()
      setEditingId(null)
      setEditingData({})
      setNewAddon({
        name: '',
        cost: '',
        description: ''
      })
    } catch (error) {
      console.error('Error saving addon:', error)
      alert('Error saving addon: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (table, id, itemName) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) return

    try {
      setSaving(true)
      console.log(`Deleting ${itemName} from ${table}`)
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log(`${itemName} deleted successfully`)
      alert(`${itemName} deleted successfully!`)
      await loadData()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages and add-ons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-danger-900 mb-2">Error Loading Data</h3>
          <p className="text-danger-700 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-danger-600 text-white py-2 px-4 rounded-lg hover:bg-danger-700 transition-colors flex items-center mx-auto"
          >
            <SafeIcon icon={FiRefreshCw} className="mr-2 h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'packages', label: 'Base Packages', icon: FiPackage, count: basePackages.length },
            { id: 'addons', label: 'Equipment Add-ons', icon: FiTool, count: equipmentAddons.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {activeTab === 'packages' ? 'Base Packages Management' : 'Equipment Add-ons Management'}
        </h3>
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <SafeIcon icon={FiRefreshCw} className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {activeTab === 'packages' ? (
        <div className="space-y-6">
          {/* Add New Package Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiPlus} className="mr-2 h-5 w-5 text-primary-600" />
              Add New Base Package
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Interactive, Doorbell, Outdoor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MMR Value</label>
                <div className="relative">
                  <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPackage.mmr_value}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, mmr_value: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="54.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passthrough Deduction</label>
                <div className="relative">
                  <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPackage.passthrough_deduction}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, passthrough_deduction: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="4.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Cost</label>
                <div className="relative">
                  <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPackage.equipment_cost}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, equipment_cost: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="199.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Install Fee</label>
                <div className="relative">
                  <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPackage.install_fee}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, install_fee: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="99.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activation Fee</label>
                <div className="relative">
                  <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newPackage.activation_fee}
                    onChange={(e) => setNewPackage(prev => ({ ...prev, activation_fee: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="49.99"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => savePackage(newPackage)}
                disabled={!newPackage.name || !newPackage.mmr_value || saving}
                className="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
                )}
                {saving ? 'Adding...' : 'Add Package'}
              </button>
            </div>
          </motion.div>

          {/* Current Packages Display */}
          {basePackages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {basePackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                >
                  {editingId === pkg.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                        <input
                          type="text"
                          value={editingData.name || ''}
                          onChange={(e) => updateEditingData('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Package name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">MMR Value</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingData.mmr_value || ''}
                            onChange={(e) => updateEditingData('mmr_value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passthrough</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingData.passthrough_deduction || ''}
                            onChange={(e) => updateEditingData('passthrough_deduction', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingData.equipment_cost || ''}
                            onChange={(e) => updateEditingData('equipment_cost', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Install Fee</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingData.install_fee || ''}
                            onChange={(e) => updateEditingData('install_fee', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Activation Fee</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingData.activation_fee || ''}
                            onChange={(e) => updateEditingData('activation_fee', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => savePackage(editingData)}
                          disabled={saving}
                          className="flex-1 bg-success-600 text-white py-2 px-4 rounded-lg hover:bg-success-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <SafeIcon icon={FiSave} className="mr-2 h-4 w-4" />
                          )}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <SafeIcon icon={FiX} className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <SafeIcon icon={FiPackage} className="mr-2 h-5 w-5 text-primary-600" />
                            {pkg.name}
                          </h3>
                          <p className="text-2xl font-bold text-primary-600 mt-1">
                            ${(pkg.mmr_value || 0).toFixed(2)} MMR
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(pkg, 'package')}
                            className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Package"
                          >
                            <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteItem('base_packages_rpc_x7k9m2', pkg.id, pkg.name)}
                            className="p-2 text-danger-600 hover:text-danger-900 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete Package"
                          >
                            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-600">Passthrough Deduction</p>
                            <p className="font-semibold text-gray-900">-${(pkg.passthrough_deduction || 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-600">Equipment Cost</p>
                            <p className="font-semibold text-gray-900">${(pkg.equipment_cost || 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-600">Install Fee</p>
                            <p className="font-semibold text-gray-900">${(pkg.install_fee || 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-600">Activation Fee</p>
                            <p className="font-semibold text-gray-900">${(pkg.activation_fee || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiPackage} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
              <p className="text-gray-500">Add your first base package to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add New Add-on Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SafeIcon icon={FiPlus} className="mr-2 h-5 w-5 text-orange-600" />
              Add New Equipment Add-on
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add-on Name</label>
                <input
                  type="text"
                  value={newAddon.name}
                  onChange={(e) => setNewAddon(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Door/Window Sensor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                <div className="relative">
                  <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={newAddon.cost}
                    onChange={(e) => setNewAddon(prev => ({ ...prev, cost: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="29.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newAddon.description}
                  onChange={(e) => setNewAddon(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => saveAddon(newAddon)}
                disabled={!newAddon.name || !newAddon.cost || saving}
                className="bg-orange-600 text-white py-2 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
                )}
                {saving ? 'Adding...' : 'Add Add-on'}
              </button>
            </div>
          </motion.div>

          {/* Current Add-ons Display */}
          {equipmentAddons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipmentAddons.map((addon) => (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                >
                  {editingId === addon.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editingData.name || ''}
                          onChange={(e) => updateEditingData('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingData.cost || ''}
                          onChange={(e) => updateEditingData('cost', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={editingData.description || ''}
                          onChange={(e) => updateEditingData('description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows="2"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveAddon(editingData)}
                          disabled={saving}
                          className="flex-1 bg-success-600 text-white py-2 px-4 rounded-lg hover:bg-success-700 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <SafeIcon icon={FiSave} className="mr-2 h-4 w-4" />
                          )}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={saving}
                          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                          <SafeIcon icon={FiX} className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <SafeIcon icon={FiTool} className="mr-2 h-4 w-4 text-orange-600" />
                            {addon.name}
                          </h3>
                          <p className="text-2xl font-bold text-orange-600 mt-1">
                            ${(addon.cost || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(addon, 'addon')}
                            className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Add-on"
                          >
                            <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteItem('equipment_addons_rpc_x7k9m2', addon.id, addon.name)}
                            className="p-2 text-danger-600 hover:text-danger-900 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete Add-on"
                          >
                            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {addon.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {addon.description}
                        </p>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <SafeIcon icon={FiTool} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons found</h3>
              <p className="text-gray-500">Add your first equipment add-on to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PackagesManager