import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'

const { FiEdit2, FiTrash2, FiPlus, FiSave, FiX, FiTrendingUp, FiRefreshCw } = FiIcons

const MultipliersManager = () => {
  const [multipliers, setMultipliers] = useState([])
  const [commissionStructure, setCommissionStructure] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [newMultiplier, setNewMultiplier] = useState({ grade: 'A', value: '', scope: 'global' })
  const [newCommissionTier, setNewCommissionTier] = useState({
    mmr_range_min: '',
    mmr_range_max: '',
    base_commission: '',
    spiff_amount: '',
    description: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading multipliers and commission structure...')
      
      const [multipliersResult, commissionResult] = await Promise.all([
        supabase.from('multipliers_rpc_x7k9m2').select('*').order('grade'),
        supabase.from('commission_structure_rpc_x7k9m2').select('*').order('mmr_range_min')
      ])

      if (multipliersResult.error) {
        console.error('Error loading multipliers:', multipliersResult.error)
        setError('Error loading multipliers: ' + multipliersResult.error.message)
      } else {
        console.log('Multipliers loaded:', multipliersResult.data)
        setMultipliers(multipliersResult.data || [])
      }

      if (commissionResult.error) {
        console.error('Error loading commission structure:', commissionResult.error)
        setError('Error loading commission structure: ' + commissionResult.error.message)
      } else {
        console.log('Commission structure loaded:', commissionResult.data)
        setCommissionStructure(commissionResult.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveMultiplier = async (multiplier) => {
    try {
      setSaving(true)
      console.log('Saving multiplier:', multiplier)
      
      if (multiplier.id) {
        const { error } = await supabase
          .from('multipliers_rpc_x7k9m2')
          .update({
            grade: multiplier.grade,
            value: parseFloat(multiplier.value),
            updated_at: new Date().toISOString()
          })
          .eq('id', multiplier.id)

        if (error) throw error
        console.log('Multiplier updated successfully')
      } else {
        const { error } = await supabase
          .from('multipliers_rpc_x7k9m2')
          .insert([{
            grade: multiplier.grade,
            value: parseFloat(multiplier.value)
          }])

        if (error) throw error
        console.log('Multiplier created successfully')
      }

      await loadData()
      setEditingId(null)
      setNewMultiplier({ grade: 'A', value: '', scope: 'global' })
    } catch (error) {
      console.error('Error saving multiplier:', error)
      alert('Error saving multiplier: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const saveCommissionTier = async () => {
    try {
      setSaving(true)
      console.log('Saving commission tier:', newCommissionTier)
      
      const { error } = await supabase
        .from('commission_structure_rpc_x7k9m2')
        .insert([{
          mmr_range_min: parseFloat(newCommissionTier.mmr_range_min),
          mmr_range_max: parseFloat(newCommissionTier.mmr_range_max),
          base_commission: parseFloat(newCommissionTier.base_commission),
          spiff_amount: parseFloat(newCommissionTier.spiff_amount) || 0,
          description: newCommissionTier.description
        }])

      if (error) throw error
      console.log('Commission tier created successfully')
      
      await loadData()
      setNewCommissionTier({
        mmr_range_min: '',
        mmr_range_max: '',
        base_commission: '',
        spiff_amount: '',
        description: ''
      })
    } catch (error) {
      console.error('Error saving commission tier:', error)
      alert('Error saving commission tier: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (table, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      setSaving(true)
      console.log(`Deleting item from ${table}`)
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      console.log('Item deleted successfully')
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
          <p className="text-gray-600">Loading multipliers and commission structure...</p>
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
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Multipliers & Commission Management
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

      {/* Commission Structure Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <SafeIcon icon={FiTrendingUp} className="mr-2 h-5 w-5" />
          Commission Structure (MMR Tiers) 
          <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
            {commissionStructure.length} tiers
          </span>
        </h3>

        {/* Add New Commission Tier */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Commission Tier</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min MMR</label>
              <input
                type="number"
                step="0.01"
                value={newCommissionTier.mmr_range_min}
                onChange={(e) => setNewCommissionTier(prev => ({ ...prev, mmr_range_min: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max MMR</label>
              <input
                type="number"
                step="0.01"
                value={newCommissionTier.mmr_range_max}
                onChange={(e) => setNewCommissionTier(prev => ({ ...prev, mmr_range_max: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="39.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Commission</label>
              <input
                type="number"
                step="0.01"
                value={newCommissionTier.base_commission}
                onChange={(e) => setNewCommissionTier(prev => ({ ...prev, base_commission: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="25.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spiff Bonus</label>
              <input
                type="number"
                step="0.01"
                value={newCommissionTier.spiff_amount}
                onChange={(e) => setNewCommissionTier(prev => ({ ...prev, spiff_amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newCommissionTier.description}
                onChange={(e) => setNewCommissionTier(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Basic Tier"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={saveCommissionTier}
              disabled={!newCommissionTier.mmr_range_min || !newCommissionTier.mmr_range_max || !newCommissionTier.base_commission || saving}
              className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
              Add Commission Tier
            </button>
          </div>
        </div>

        {/* Commission Tiers Display */}
        {commissionStructure.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MMR Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spiff Bonus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissionStructure.map((tier) => (
                  <tr key={tier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${tier.mmr_range_min} - ${tier.mmr_range_max}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${tier.base_commission}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${tier.spiff_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tier.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteItem('commission_structure_rpc_x7k9m2', tier.id)}
                        className="text-danger-600 hover:text-danger-900 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <SafeIcon icon={FiTrendingUp} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No commission tiers found</h3>
            <p className="text-gray-500">Add your first commission tier to get started.</p>
          </div>
        )}
      </div>

      {/* Qualification Multipliers Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Qualification Multipliers
          <span className="ml-2 px-2 py-1 bg-success-100 text-success-600 text-xs rounded-full">
            {multipliers.length} grades
          </span>
        </h3>

        {/* Add New Multiplier */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Multiplier</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={newMultiplier.grade}
                onChange={(e) => setNewMultiplier(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {/* Show only grades that don't already exist */}
                {grades.filter(grade => !multipliers.some(m => m.grade === grade)).map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier Value</label>
              <input
                type="number"
                step="0.01"
                value={newMultiplier.value}
                onChange={(e) => setNewMultiplier(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1.00"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => saveMultiplier(newMultiplier)}
                disabled={!newMultiplier.value || saving}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
                Add Multiplier
              </button>
            </div>
          </div>
        </div>

        {/* Multipliers Display */}
        {multipliers.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplier Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {multipliers.map((multiplier) => (
                  <tr key={multiplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {multiplier.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === multiplier.id ? (
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={multiplier.value}
                          onBlur={(e) => saveMultiplier({ ...multiplier, value: e.target.value })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{multiplier.value}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">Global</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingId(editingId === multiplier.id ? null : multiplier.id)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          <SafeIcon icon={editingId === multiplier.id ? FiX : FiEdit2} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem('multipliers_rpc_x7k9m2', multiplier.id)}
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
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <SafeIcon icon={FiTrendingUp} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No multipliers found</h3>
            <p className="text-gray-500">Add your first qualification multiplier to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MultipliersManager