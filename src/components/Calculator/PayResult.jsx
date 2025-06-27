import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload, FiSave } = FiIcons

const PayResult = ({ result, formData }) => {
  const { grossRevenue, totalDeductions, finalPay, breakdown } = result

  const profitabilityStatus = () => {
    if (finalPay >= grossRevenue * 0.7) return { color: 'success', label: 'Excellent' }
    if (finalPay >= grossRevenue * 0.5) return { color: 'warning', label: 'Good' }
    return { color: 'danger', label: 'Low Margin' }
  }

  const status = profitabilityStatus()

  const exportToPDF = () => {
    // This would integrate with jsPDF
    console.log('Exporting to PDF...')
  }

  const saveCalculation = () => {
    // This would save to database
    console.log('Saving calculation...')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <SafeIcon icon={FiDollarSign} className="mr-3 h-6 w-6 text-primary-600" />
          Pay Calculation Results
        </h3>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-700`}>
          {status.label}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-50 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-primary-900">${grossRevenue.toFixed(2)}</p>
            </div>
            <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-danger-50 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-danger-600">Total Deductions</p>
              <p className="text-2xl font-bold text-danger-900">${totalDeductions.toFixed(2)}</p>
            </div>
            <SafeIcon icon={FiTrendingDown} className="h-8 w-8 text-danger-600" />
          </div>
        </div>

        <div className={`bg-${status.color}-50 p-6 rounded-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium text-${status.color}-600`}>Final Rep Pay</p>
              <p className={`text-2xl font-bold text-${status.color}-900`}>${finalPay.toFixed(2)}</p>
            </div>
            <SafeIcon icon={FiDollarSign} className={`h-8 w-8 text-${status.color}-600`} />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Revenue (MMR × Multiplier)</span>
            <span className="font-medium">${grossRevenue.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-danger-600">
            <span>Revenue Deduction (10%)</span>
            <span>-${breakdown.revenueDeduction.toFixed(2)}</span>
          </div>
          
          {breakdown.packageCosts > 0 && (
            <div className="flex justify-between items-center text-danger-600">
              <span>Package Costs</span>
              <span>-${breakdown.packageCosts.toFixed(2)}</span>
            </div>
          )}
          
          {breakdown.termAdjustment > 0 && (
            <div className="flex justify-between items-center text-danger-600">
              <span>36-Month Term Adjustment</span>
              <span>-${breakdown.termAdjustment.toFixed(2)}</span>
            </div>
          )}
          
          {breakdown.addonCosts > 0 && (
            <div className="flex justify-between items-center text-danger-600">
              <span>Equipment Add-ons</span>
              <span>-${breakdown.addonCosts.toFixed(2)}</span>
            </div>
          )}
          
          {breakdown.platinumBonus > 0 && (
            <div className="flex justify-between items-center text-success-600">
              <span>Platinum Protection Bonus</span>
              <span>+${breakdown.platinumBonus.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Final Rep Pay</span>
              <span>${finalPay.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Calculation Inputs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">MMR:</span>
            <span className="ml-2 font-medium">${formData.mmr}</span>
          </div>
          <div>
            <span className="text-gray-600">Qualification:</span>
            <span className="ml-2 font-medium">{formData.qualification}</span>
          </div>
          <div>
            <span className="text-gray-600">Contract Term:</span>
            <span className="ml-2 font-medium">{formData.contractTerm} months</span>
          </div>
          <div>
            <span className="text-gray-600">Platinum Protection:</span>
            <span className="ml-2 font-medium">{formData.platinumProtection ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={saveCalculation}
          className="flex-1 bg-success-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-success-700 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiSave} className="mr-2 h-5 w-5" />
          Save Calculation
        </button>
        
        <button
          onClick={exportToPDF}
          className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiDownload} className="mr-2 h-5 w-5" />
          Export PDF
        </button>
      </div>
    </motion.div>
  )
}

export default PayResult