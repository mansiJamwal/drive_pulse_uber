import React from "react"

interface Props {
  current: number
  predicted: number
}

const GOAL = 1200

const EarningsProgress: React.FC<Props> = ({
  current,
  predicted
}) => {

  const percent = Math.min((current / GOAL) * 100, 100)

  return (

    <div className="flex flex-col gap-6">

      <div className="flex items-start justify-between">
        <h3 className="text-2xl md:text-3xl font-semibold">💰 Earnings Progress</h3>
        <div className="text-lg text-gray-300">Current <span className="ml-3 font-bold text-green-400 text-2xl">₹{current}</span></div>
      </div>

      <div className="w-full bg-gray-900/40 border border-gray-700 rounded-full h-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex items-center justify-between text-base text-gray-400">
        <div className="text-lg">Goal: <span className="font-semibold text-gray-100">₹{GOAL}</span></div>
        <div className="text-lg">{Math.round(percent)}%</div>
      </div>

      <div className="mt-3 bg-gray-900/30 border border-gray-700 rounded-md p-4 flex items-center justify-between">
        <div className="text-base text-gray-300">Predicted Final</div>
        <div className="bg-yellow-600 text-black px-5 py-2 rounded font-bold text-lg">₹{predicted}</div>
      </div>

    </div>

  )

}

export default EarningsProgress