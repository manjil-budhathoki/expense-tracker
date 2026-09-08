import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatNPR } from '../utils/currency';
import { NEPALI_MONTHS } from '../utils/nepaliDate';
import mockData from '../data/mockData.json';
import { Zap, Home, History, CheckCircle2, Sliders, Calendar } from 'lucide-react';

export default function RentPage() {
  const { rentConfig, updateRentConfig, rentHistory, recordRentPayment } = useFinance();

  // Settings State
  const [baseRentInput, setBaseRentInput] = useState(rentConfig.baseRent);
  const [rateInput, setRateInput] = useState(rentConfig.electricityRate);
  const [waterWasteInput, setWaterWasteInput] = useState(rentConfig.waterWasteFee);
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  // Month Dropdown State
  const [selectedMonth, setSelectedMonth] = useState(mockData.defaultSelectedMonth);
  const [selectedYear, setSelectedYear] = useState(mockData.defaultSelectedYear);

  const [prevReading, setPrevReading] = useState(
    rentHistory.length > 0 ? rentHistory[0].currReading : mockData.rentHistoryFallbackPrevReading
  );
  const [currReading, setCurrReading] = useState('');

  // Live Calculations
  const unitsConsumed = Math.max(0, (parseFloat(currReading) || 0) - (parseFloat(prevReading) || 0));
  const electricityTotal = unitsConsumed * rentConfig.electricityRate;
  const grandTotalDue = rentConfig.baseRent + electricityTotal + rentConfig.waterWasteFee;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateRentConfig({
      baseRent: Number(baseRentInput),
      electricityRate: Number(rateInput),
      waterWasteFee: Number(waterWasteInput),
    });
    setIsConfigSaved(true);
    setTimeout(() => setIsConfigSaved(false), 2000);
  };

  const handleRecordMonth = (e) => {
    e.preventDefault();
    if (!currReading || Number(currReading) < Number(prevReading)) {
      alert('Current meter reading must be greater than or equal to previous reading.');
      return;
    }

    recordRentPayment({
      month: `${selectedMonth} ${selectedYear}`,
      baseRent: rentConfig.baseRent,
      prevReading: Number(prevReading),
      currReading: Number(currReading),
      units: unitsConsumed,
      electricityBill: electricityTotal,
      waterWasteFee: rentConfig.waterWasteFee,
      totalAmount: grandTotalDue,
    });

    setPrevReading(Number(currReading));
    setCurrReading('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Overview */}
      <div className="bg-white p-8 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-zinc-900">Rent & Utility Hub</h1>
          </div>
          <p className="text-xs text-zinc-400">
            Log unit readings per Nepali month and archive past landlord payments.
          </p>
        </div>

        {/* Live Total Due Highlight */}
        <div className="bg-zinc-50 px-6 py-4 rounded-2xl text-left md:text-right w-full md:w-auto">
          <span className="text-xs text-zinc-400 block font-medium">Payable This Month</span>
          <span className="text-3xl font-black text-zinc-900 tracking-tight">
            {formatNPR(grandTotalDue)}
          </span>
          <span className="text-[11px] text-zinc-400 block mt-0.5">
            Rent ({formatNPR(rentConfig.baseRent)}) + Light ({formatNPR(electricityTotal)})
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calculator & Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-7 rounded-3xl shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Meter Reading
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Select the month and enter meter readings</p>
            </div>

            <form onSubmit={handleRecordMonth} className="space-y-4">
              {/* Dropdown for Nepali Month & Year */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-500 block mb-1.5">Nepali Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 font-semibold text-zinc-800"
                  >
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m.bs} value={m.bs}>
                        {m.bs}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1.5">BS Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 font-semibold text-zinc-800"
                  >
                    {mockData.bsYearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Meter Readings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1.5">Previous Reading</label>
                  <input
                    type="number"
                    value={prevReading}
                    onChange={(e) => setPrevReading(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 font-medium text-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1.5">Current Reading</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1580"
                    value={currReading}
                    onChange={(e) => setCurrReading(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-zinc-100 font-bold text-zinc-900"
                  />
                </div>
              </div>

              {/* Live Cost Breakdown */}
              <div className="bg-zinc-50 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Units Consumed:</span>
                  <span className="font-bold text-zinc-900">{unitsConsumed} units</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Light Cost (@ Rs. {rentConfig.electricityRate}/unit):</span>
                  <span className="font-bold text-zinc-900">{formatNPR(electricityTotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Fixed Rent:</span>
                  <span className="font-bold text-zinc-900">{formatNPR(rentConfig.baseRent)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Water & Sanitation:</span>
                  <span className="font-bold text-zinc-900">{formatNPR(rentConfig.waterWasteFee)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save {selectedMonth} Rent
              </button>
            </form>
          </div>

          {/* Rates Settings */}
          <div className="bg-white p-7 rounded-3xl shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-400" /> Default Rates Setup
              </h3>
              {isConfigSaved && <span className="text-[11px] text-emerald-600 font-semibold">Saved!</span>}
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Fixed Monthly Rent (NPR)</label>
                <input
                  type="number"
                  value={baseRentInput}
                  onChange={(e) => setBaseRentInput(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:bg-zinc-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Rs. per Unit</label>
                  <input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:bg-zinc-100 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Water / Waste (Rs.)</label>
                  <input
                    type="number"
                    value={waterWasteInput}
                    onChange={(e) => setWaterWasteInput(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:bg-zinc-100 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Update Default Rates
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-900">Payment History</h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium">{rentHistory.length} records</span>
          </div>

          <div className="space-y-3">
            {rentHistory.map((item) => (
              <div key={item.id} className="bg-zinc-50/70 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">{item.month}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Recorded on {item.paidDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-zinc-900 text-base">{formatNPR(item.totalAmount)}</span>
                    <span className="text-[11px] font-semibold text-emerald-600 block">Paid</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/50 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                  <span>
                    Usage: <strong className="text-zinc-800">{item.units} units</strong> ({item.prevReading} → {item.currReading})
                  </span>
                  <span>Electricity: <strong className="text-zinc-800">{formatNPR(item.electricityBill)}</strong></span>
                  <span>Base Rent: <strong className="text-zinc-800">{formatNPR(item.baseRent)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}