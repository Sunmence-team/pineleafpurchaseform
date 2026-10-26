import React, { useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { toast } from "sonner";
import { getErrorMessage } from "../../helpers/api";
import type { BarristerProp, PropertyProp } from "../../lib/interfaces";
import Modal from "./Modal";
import ActionButton from "../ui/ActionButton";
import SearchablePropertyInput from "../ui/SearchablePropertyInput";
import {
  useAssignBarristerProperties,
  useUpdateBarristerProperties,
} from "../../hooks/useBarristers";

const ASSIGNMENTS_STORAGE_KEY = "pineleaf_barrister_property_assignments";

export interface BarristerAssignmentRecord {
  barristerId: string | number;
  propertyIds: (string | number)[];
  properties: { id: string | number; name: string }[];
}

export const getStoredAssignments = (): Record<
  string,
  BarristerAssignmentRecord
> => {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStoredAssignments = (
  data: Record<string, BarristerAssignmentRecord>,
) => {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save assignments:", e);
  }
};

interface AssignPropertiesModalProps {
  barrister: BarristerProp;
  isEdit?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignPropertiesModal: React.FC<AssignPropertiesModalProps> = ({
  barrister,
  isEdit = false,
  onClose,
  onSuccess,
}) => {
  const barristerId = String(barrister.id ?? "");
  const stored = getStoredAssignments()[barristerId];

  const initialProperties =
    stored?.properties && stored.properties.length > 0
      ? stored.properties
      : (barrister.properties || []).map((p) => ({
          id: p.id!,
          name: p.name || `Property #${p.id}`,
        }));

  const [selectedProperties, setSelectedProperties] = useState<
    { id: string | number; name: string }[]
  >(initialProperties);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const assignMutation = useAssignBarristerProperties();
  const updateMutation = useUpdateBarristerProperties();

  const handleSelectProperty = (property: PropertyProp) => {
    if (!property.id) return;
    const propId = String(property.id);

    // Check if property is already assigned to THIS barrister
    if (selectedProperties.some((p) => String(p.id) === propId)) {
      toast.info("Property is already selected");
      return;
    }

    // Check if property is assigned to ANOTHER barrister (1 barrister per property rule)
    const allAssignments = getStoredAssignments();
    for (const [bId, record] of Object.entries(allAssignments)) {
      if (
        bId !== barristerId &&
        record.propertyIds.some((id) => String(id) === propId)
      ) {
        toast.warning(
          `This property is already assigned to another barrister. Reassigning will override.`,
        );
      }
    }

    setSelectedProperties((prev) => [
      ...prev,
      { id: property.id!, name: property.name },
    ]);
  };

  const handleRemoveProperty = (propId: string | number) => {
    setSelectedProperties((prev) =>
      prev.filter((p) => String(p.id) !== String(propId)),
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (selectedProperties.length === 0) {
      toast.error("Please select at least one property");
      return;
    }

    setIsSubmitting(true);
    const propertyIds = selectedProperties.map((p) => p.id);

    try {
      // 1. Backend API call to assign/update properties for barrister
      if (isEdit) {
        await updateMutation.mutateAsync({
          barristerId: barrister.id,
          barrister_id: Number(barrister.id) || barrister.id || 0,
          property_id: propertyIds.map(String),
        });
      } else {
        await assignMutation.mutateAsync({
          barrister_id: Number(barrister.id) || barrister.id || 0,
          property_id: propertyIds.map(String),
        });
      }

      // 2. Persist in local storage for immediate client-side UI availability
      const allAssignments = getStoredAssignments();

      // Remove selected properties from any other barrister (enforcing 1 barrister per property)
      for (const bId of Object.keys(allAssignments)) {
        if (bId !== barristerId) {
          allAssignments[bId].propertyIds = allAssignments[
            bId
          ].propertyIds.filter(
            (id) => !propertyIds.some((pId) => String(pId) === String(id)),
          );
          allAssignments[bId].properties = allAssignments[
            bId
          ].properties.filter(
            (p) => !propertyIds.some((pId) => String(pId) === String(p.id)),
          );
        }
      }

      // Assign to this barrister
      allAssignments[barristerId] = {
        barristerId,
        propertyIds,
        properties: selectedProperties,
      };

      saveStoredAssignments(allAssignments);

      toast.success(
        isEdit
          ? `Updated properties assigned to ${barrister.full_name || barrister.name}`
          : `Assigned ${selectedProperties.length} propert${
              selectedProperties.length > 1 ? "ies" : "y"
            } to ${barrister.full_name || barrister.name}`,
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isEdit
            ? "Failed to update assigned properties"
            : "Failed to assign properties",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending =
    isSubmitting || assignMutation.isPending || updateMutation.isPending;

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit
              ? "Edit Assigned Properties"
              : "Assign Properties to Barrister"}
          </h3>
          <p className="text-sm text-gray-500">
            {isEdit
              ? "Update assigned properties for "
              : "Assign one or more properties to "}
            <span className="font-semibold text-primary">
              {barrister.full_name || barrister.name || "Barrister"}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <SearchablePropertyInput
            label="Search and Select Properties"
            placeholder="Type property name (e.g. Obodo-Oma)..."
            onSelect={handleSelectProperty}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Assigned Properties ({selectedProperties.length})
            </label>

            {selectedProperties.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-400">
                No properties selected yet. Use the search input above to add
                properties.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {selectedProperties.map((prop) => (
                  <span
                    key={prop.id}
                    className="inline-flex items-center gap-2 bg-secondary text-primary border border-primary/10 text-sm rounded-full px-3 py-1"
                  >
                    <span>{prop.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(prop.id)}
                      className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <HiXMark size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <ActionButton
            text={isEdit ? "Update Assignment" : "Save Assignment"}
            loadingText={isEdit ? "Updating..." : "Saving..."}
            loading={isPending}
            disabled={isPending}
            action={() => handleSubmit()}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AssignPropertiesModal;
