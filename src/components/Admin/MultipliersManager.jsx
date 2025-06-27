import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { supabase } from '../../lib/supabase'

const { FiEdit2, FiTrash2, FiPlus, FiSave, FiX } = FiIcons

const MultipliersManager = () => {
  const [multipliers, setMultipliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [newMultiplier, setNewMultiplier] = useState({
    grade: 'A',
    value: '',
    scope: 'global'
  })

  const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C']

  useEffect(() => {
    loadMultipliers()
  }, [])

  const loadMultipliers = async () => {
    try {
      const { data, error } = await supabase
        .from('multipliers')
        .select('*')
        .order('grade')

      if (error) throw error
      setMultipliers(data || [])
    } catch (error) {
      console.error('Error loading multipliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveMultiplier = async (multiplier) => {
    try {
      if (multiplier.id) {
        const { error } = await supabase
          .from('multipliers')
          .update({
            grade: multiplier.grade,
            value: parseFloat(multiplier.value)
          })
          .eq('id', multiplier.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('multipliers')
          .insert([{
            grade: multiplier.grade,
            value: parseFloat(multiplier.value)
          }])

        if (error) throw error
      }

      await loadMultipliers()
      setEditingId(null)
      setNewMultiplier({ grade: 'A', value: '', scope: 'global' })
    } catch (error) {
      console.error('Error saving multiplier:', error)
    }
  }

  const deleteMultiplier = async (id) => {
    if (!confirm('Are you sure you want to delete this multiplier?')) return

    try {
      const { error } = await supabase
        .from('multipliers')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadMultipliers()
    } catch (error) {
      console.error('Error deleting multiplier:', error)
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Qualification Multipliers</h3>
      </div>

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
              {grades.map(grade => (
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
              disabled={!newMultiplier.value}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <SafeIcon icon={FiPlus} className="mr-2 h-4 w-4" />
              Add Multiplier
            </button>
          </div>
        </div>
      </div>

      {/* Multipliers Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Multiplier Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scope
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
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
                      onClick={() => deleteMultiplier(multiplier.id)}
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
  )
}

export default MultipliersManager