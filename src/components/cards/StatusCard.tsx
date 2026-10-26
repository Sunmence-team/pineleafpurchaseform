import React from 'react'
import { StatusCardProps } from '../../lib/interfaces'

const StatusCard: React.FC<StatusCardProps> = ({ type, statusText, icon: Icon, optStyles }) => {
  return (
    <div
        className={`${
            type === "success"
            ? "bg-[#E8F7EF] text-[#14AB5A]"
            : type === "pending"
                ? "bg-[#FDF5E6] text-[#EB9B00]"
                : type === "failed" 
                    ? "bg-[#F7ECE8] text-[#AB1414]"
                    : "bg-[#F1F1F1] text-[#828282]"
                
        } capitalize text-xs px-2 py-0.5 shrink-0 w-max rounded-lg flex items-center gap-1 ${optStyles}`}
    >{Icon && <Icon />}{statusText}</div>
  )
}

export default StatusCard