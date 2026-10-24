import React, { useState } from "react";
import { BsHouses } from "react-icons/bs";
import AssignPropertiesModal from "../../../components/modals/AssignPropertiesModal";
import ActionCell from "../../../components/ui/ActionCell";
import { getErrorMessage } from "../../../helpers/api";
import type { BarristerProp, TableColumnProps } from "../../../lib/interfaces";
import ReusableTable from "../../../utilities/ReusableTable";
import {
  useBarristers,
  // useDeleteBarristersBatch,
} from "../../../hooks/useBarristers";
// import { HiPlus } from "react-icons/hi2";
// import { toast } from "sonner";
// import ConfirmDialog from "../../../components/modals/ConfirmDialog";
// import BulkSelectionBar from "../../../components/ui/BulkSelectionBar";

const ManageBarristers: React.FC = () => {
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data,
    isLoading: loadingBarristers,
    error,
    refetch,
  } = useBarristers({
    // page: currentPage,
    // per_page: itemsPerPage,
  });

  const barristers = data?.barristers ?? [];
  // const totalItems = data?.total ?? 1;
  // const totalPages = data?.last_page ?? 1;

  // const deleteBatchMutation = useDeleteBarristersBatch();
  // const deleting = deleteBatchMutation.isPending;

  // const [deleteModal, setDeleteModal] = useState(false);

  const [assignModal, setAssignModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBarrister, setSelectedBarrister] =
    useState<BarristerProp | null>(null);
  const [selectedBarristerIds, setSelectedBarristerIds] = useState<
    Array<number | string>
  >([]);
  // const [deleteTargetIds, setDeleteTargetIds] = useState<
  //   Array<number | string>
  // >([]);

  // Local assignment tracking trigger to force re-render on save
  const [assignmentVersion, setAssignmentVersion] = useState(0);

  // const handleDeleteBarrister = async () => {
  //   if (deleteTargetIds.length === 0) return;

  //   try {
  //     await deleteBatchMutation.mutateAsync(deleteTargetIds);

  //     toast.success(
  //       deleteTargetIds.length > 1
  //         ? `${deleteTargetIds.length} barristers deleted successfully`
  //         : "Barrister deleted successfully",
  //     );
  //     setDeleteModal(false);
  //     setDeleteTargetIds([]);
  //     setSelectedBarristerIds([]);
  //     setSelectedBarrister(null);
  //   } catch (err: unknown) {
  //     toast.error(getErrorMessage(err, "Failed to delete barrister"));
  //   }
  // };

  const handleToggleRowSelection = (id: number | string) => {
    setSelectedBarristerIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
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

  // const openBulkDeleteConfirm = () => {
  //   if (validSelectedBarristerIds.length === 0) return;
  //   setSelectedBarrister(null);
  //   setDeleteTargetIds(validSelectedBarristerIds);
  //   setDeleteModal(true);
  // };

  const validSelectedBarristerIds = selectedBarristerIds.filter((id) =>
    barristers.some((barrister) => barrister.id === id),
  );

  const columns: TableColumnProps<BarristerProp>[] = [
    {
      label: "Barrister Name",
      key: "name",
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {row.full_name || row.name || "-"}
        </span>
      ),
    },
    {
      label: "Phone Number",
      key: "phone_number",
      render: (row) => <span>{row.phone_number || row.phone || "-"}</span>,
    },
    {
      label: "Assigned Properties",
      key: "assigned_properties",
      render: (row) => {
        const count = row.properties?.length ?? 0;
        return (
          <span>
            {count} {count === 1 ? "Property" : "Properties"}
          </span>
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={Number(item.id)}
          onEdit={() => {
            setSelectedBarrister(item);
            setIsEditMode(true);
            setAssignModal(true);
          }}
          otherActions={[
            {
              name: "Assign Properties",
              icon: <BsHouses className="text-primary size-3" />,
              action: () => {
                setSelectedBarrister(item);
                setIsEditMode(false);
                setAssignModal(true);
              },
            },
          ]}
          // onDelete={() => {
          //   setDeleteModal(true);
          //   setSelectedBarrister(item);
          //   setDeleteTargetIds(item.id ? [item.id] : []);
          // }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6" key={assignmentVersion}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Barristers</h2>
          <p className="text-sm text-gray-500">
            Manage, track, assign properties, and update barrister records
          </p>
        </div>

        <ReusableTable
          columns={columns}
          data={barristers}
          isLoading={loadingBarristers}
          error={
            error ? getErrorMessage(error, "Failed to fetch barristers") : null
          }
          hasPagination={false}
          hasSerialNo={true}
          // selectable
          selectedRowIds={validSelectedBarristerIds}
          onToggleRowSelection={handleToggleRowSelection}
          onToggleAllRows={handleToggleAllRows}
        />
      </div>

      {/* <ConfirmDialog
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
      /> */}

      {assignModal && selectedBarrister && (
        <AssignPropertiesModal
          barrister={selectedBarrister}
          isEdit={isEditMode}
          onClose={() => {
            setAssignModal(false);
            setSelectedBarrister(null);
            setIsEditMode(false);
          }}
          onSuccess={() => {
            setAssignmentVersion((v) => v + 1);
            refetch();
          }}
        />
      )}

      {/* <BulkSelectionBar
        count={validSelectedBarristerIds.length}
        itemLabel="barrister"
        proceedText="Delete selected"
        onProceed={openBulkDeleteConfirm}
        onCancel={() => setSelectedBarristerIds([])}
      /> */}
    </>
  );
};

export default ManageBarristers;
