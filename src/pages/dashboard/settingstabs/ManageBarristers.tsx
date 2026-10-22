import React, { useCallback, useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi2";
import { toast } from "sonner";
import AddBarristerModal from "../../../components/modals/AddBarristerModal";
import ConfirmDialog from "../../../components/modals/ConfirmDialog";
import ActionButton from "../../../components/ui/ActionButton";
import ActionCell from "../../../components/ui/ActionCell";
import BulkSelectionBar from "../../../components/ui/BulkSelectionBar";
import { api, getErrorMessage } from "../../../helpers/api";
import type { BarristerProp, TableColumnProps } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";

const ManageBarristers: React.FC = () => {
  const [barristers, setBarristers] = useState<BarristerProp[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModal, setDeleteModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [loadingBarristers, setLoadingBarristers] = useState(false);
  const [selectedBarrister, setSelectedBarrister] =
    useState<BarristerProp | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedBarristerIds, setSelectedBarristerIds] = useState<
    Array<number | string>
  >([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<
    Array<number | string>
  >([]);

  const fetchBarristers = useCallback(async () => {
    setLoadingBarristers(true);
    try {
      const res = await api.get("/barristers");
      if (res.status === 200) {
        const responseData = res.data?.data;
        const barristerData = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        setBarristers(barristerData);
        setTotalItems(responseData?.total || barristerData.length || 1);
        setTotalPages(responseData?.last_page || 1);
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to fetch barristers"));
    } finally {
      setLoadingBarristers(false);
    }
  }, []);

  const handleDeleteBarrister = async () => {
    if (deleteTargetIds.length === 0) return;

    setDeleting(true);

    try {
      await Promise.all(
        deleteTargetIds.map((id) => api.delete(`/barristers/${id}`))
      );

      toast.success(
        deleteTargetIds.length > 1
          ? `${deleteTargetIds.length} barristers deleted successfully`
          : "Barrister deleted successfully"
      );
      setDeleteModal(false);
      setDeleteTargetIds([]);
      setSelectedBarristerIds([]);
      setSelectedBarrister(null);
      fetchBarristers();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete barrister"));
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleRowSelection = (id: number | string) => {
    setSelectedBarristerIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const handleToggleAllRows = (checked: boolean) => {
    const currentPageIds = barristers
      .map((barrister) => barrister.id)
      .filter((id): id is number | string => id !== undefined && id !== null);

    setSelectedBarristerIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...currentPageIds]));
      }

      return prev.filter((id) => !currentPageIds.includes(id));
    });
  };

  const openBulkDeleteConfirm = () => {
    if (validSelectedBarristerIds.length === 0) return;
    setSelectedBarrister(null);
    setDeleteTargetIds(validSelectedBarristerIds);
    setDeleteModal(true);
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchBarristers();
    });
  }, [fetchBarristers]);

  const validSelectedBarristerIds = selectedBarristerIds.filter((id) =>
    barristers.some((barrister) => barrister.id === id)
  );

  const columns: TableColumnProps<BarristerProp>[] = [
    {
      label: "Barrister Name",
      key: "name",
      render: (row) => row.full_name || row.name || "-",
    },
    {
      label: "Phone Number",
      key: "phone_number",
      render: (row) => row.phone_number || row.phone || "-",
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          onDelete={() => {
            setDeleteModal(true);
            setSelectedBarrister(item);
            setDeleteTargetIds(item.id ? [item.id] : []);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Barristers</h2>
            <p className="text-sm text-gray-500">
              Manage, track, and update barrister records
            </p>
          </div>

          <ActionButton
            text="Add Barrister"
            icon={<HiPlus size={18} />}
            action={() => setCreateModal(true)}
          />
        </div>

        <ReusableTable
          columns={columns}
          data={barristers}
          isLoading={loadingBarristers}
          error={null}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          setItemsPerPage={setItemsPerPage}
          hasSerialNo={true}
          selectable
          selectedRowIds={validSelectedBarristerIds}
          onToggleRowSelection={handleToggleRowSelection}
          onToggleAllRows={handleToggleAllRows}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteModal && deleteTargetIds.length > 0}
        isLoading={deleting}
        onCancel={() => {
          setDeleteModal(false);
          if (deleteTargetIds.length === 1) {
            setSelectedBarrister(null);
          }
          setDeleteTargetIds([]);
        }}
        onConfirm={handleDeleteBarrister}
        title={
          deleteTargetIds.length > 1
            ? `Proceed to delete ${deleteTargetIds.length} barristers?`
            : `Proceed to delete ${
                selectedBarrister?.full_name ||
                selectedBarrister?.name ||
                "this barrister"
              }?`
        }
        message={
          deleteTargetIds.length > 1
            ? "Are you sure you want to delete the selected barristers? This action cannot be undone."
            : "Are you sure you want to delete this barrister? This action cannot be undone."
        }
        confirmText="Yes, Delete"
      />

      {createModal && (
        <AddBarristerModal
          onClose={() => setCreateModal(false)}
          onCreated={fetchBarristers}
        />
      )}

      <BulkSelectionBar
        count={validSelectedBarristerIds.length}
        itemLabel="barrister"
        proceedText="Delete selected"
        onProceed={openBulkDeleteConfirm}
        onCancel={() => setSelectedBarristerIds([])}
      />
    </>
  );
};

export default ManageBarristers;
