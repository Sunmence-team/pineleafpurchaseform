import React, { useState, useEffect } from "react";
import SideNav from "../../../../components/SideNav";
import { branchOptions } from "../../../../lib/branchList";
import { FaBars } from "react-icons/fa6";
import assets from "../../../../assets/assests";
import ReusableTable from "../../../../utilities/ReusableTable";
import { useNavigate } from "react-router-dom";
import ActionCell from "../../../../components/ActionCell";
import api, { getErrorMessage } from "../../../../utilities/api";
import { toast } from "sonner";

const ManageUsers = () => {
    const token = localStorage.getItem("token");
    const [openMenu, setOpenMenu] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });
            const { data, total } = response.data.data;
            setUsers(data);
            setTotalItems(total);
        } catch (err) {
            const msg = getErrorMessage(err);
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage]);

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (item) => (
        <span className="capitalize">{item.firstname} {item.lastname}</span>
      ),
    },
    {
      label: "Email",
      key: "email",
    },
    {
      label: "Phone",
      key: "phone",
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={(id) =>
            navigate(`/dashboard/manage/users/${id}/view`, {
              state: item,
            })
          }
          canView
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SideNav
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        branches={branchOptions}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center bg-white shadow-sm z-10 w-full px-4 md:px-6 lg:px-8 py-4">
          <button
            onClick={() => setOpenMenu(true)}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <img src={assets.logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-gray-900 ps-6 truncate">
            Manage Users
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ReusableTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            error={error}
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            emptyDataHeading="No users found"
            emptyDataMessage="There are currently no registered users."
          />
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;

