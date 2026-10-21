import React, { useState, useEffect, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { PiBellSimple } from "react-icons/pi";
import assets from "../../assets/assets";

const TopNav: React.FC = () => {
  return (
    <div className="w-full pb-4 flex gap-3 items-center justify-between">
      <div className=""></div>
      <div className="flex gap-6 items-center">
        <Link to="">
          <PiBellSimple
            size={20}
            className="text-gray-600 hover:text-gray-900 transition"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-secondary/20 uppercase flex items-center justify-center font-medium">
            <img src={assets.logo} alt="Platform Logo" className="w-8" />
          </div>
          <div className="leading-2">
            <h3 className="truncate m-0 font-medium text-sm">User</h3>
            <small className="uppercase font-medium text-[10px]">Role</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
