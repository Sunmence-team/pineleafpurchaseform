import React from 'react'
import { formatUnderScores } from '../../utilities/formatterUtility'

export const StatusCard = ({ type }) => {
  return (
    <div
        className={`${
            type === "low"
            ? "bg-[#E8F7EF] text-[#14AB5A]"
            : type === "medium"
                ? "bg-[#FDF5E6] text-[#EB9B00]"
                : type === "high" 
                    ? "bg-red-600/20 text-[#EF1212]"
                    : "bg-[#F1F1F1] text-[#828282]"
                
        } uppercase text-xs px-4 py-1 w-max rounded-full`}
    >{type}</div>
  )
}

export const StatusDot = ({ type }) => {
  return (
    <span
        className={`${
            type === "low"
            ? "bg-[#14AB5A]"
            : type === "medium"
                ? "bg-[#EB9B00]"
                : type === "high" 
                    ? "bg-[#EF1212]"
                    : "bg-[#828282]"
                
        } w-2 h-2 rounded-full`}
    ></span>
  )
}

export const StatusTurnPriorityCard = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 border rounded-full text-[10px] whitespace-nowrap font-semibold uppercase ${
        status === "approved" || status === "settled"
          ? "bg-green-100 text-green-700"
          : status === "rejected"
            ? "bg-red-100 text-red-700"
            : status === "in_review"
              ? "bg-purple-100 text-purple-700"
              : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status === "in_review"
        ? "Submitted"
        : formatUnderScores(status)}
    </span>
  )
}