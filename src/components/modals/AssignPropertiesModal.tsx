import React, { useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { toast } from "sonner";
import { api, getErrorMessage } from "../../helpers/api";
import type { BarristerProp, PropertyProp } from "../../lib/interfaces";
import Modal from "./Modal";
import ActionButton from "../ui/ActionButton";
import SearchablePropertyInput from "../ui/SearchablePropertyInput";

const ASSIGNMENTS_STORAGE_KEY = "pineleaf_barrister_property_assignments";

export interface BarristerAssignmentRecord {
  barristerId: string | number;
  propertyIds: (string | number)[];
  properties: { id: string | number; name: string }[];
}

export const getStoredAssignments = (): Record<string, BarristerAssignmentRecord> => {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStoredAssignments = (data: Record<string, BarristerAssignmentRecord>) => {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save assignments:", e);
  }
};

interface AssignPropertiesModalProps {
  barrister: BarristerProp;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignPropertiesModal: React.FC<AssignPropertiesModalProps> = ({
  barrister,
  onClose,
  onSuccess,
}) => {
  const barristerId = String(barrister.id ?? "");
  const stored = getStoredAssignments()[barristerId];

  const [selectedProperties, setSelectedProperties] = useState<
    { id: string | number; name: string }[]
  >(stored?.properties || []);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (bId !== barristerId && record.propertyIds.some((id) => String(id) === propId)) {
        toast.warning(
          `This property is already assigned to another barrister. Reassigning will override.`
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
      prev.filter((p) => String(p.id) !== String(propId))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProperties.length === 0) {
      toast.error("Please select at least one property");
      return;
    }

    setIsSubmitting(true);
    const propertyIds = selectedProperties.map((p) => p.id);

    try {
      // 1. Attempt API update if backend endpoint exists
      try {
        await api.post(`/barristers/${barristerId}/assign-properties`, {
          property_ids: propertyIds,
        });
      } catch (err) {
        console.warn("Backend assignment endpoint fallback:", err);
      }

      // 2. Persist in local storage for reliable client-side state
      const allAssignments = getStoredAssignments();

      // Remove selected properties from any other barrister (enforcing 1 barrister per property)
      for (const bId of Object.keys(allAssignments)) {
        if (bId !== barristerId) {
          allAssignments[bId].propertyIds = allAssignments[bId].propertyIds.filter(
            (id) => !propertyIds.some((pId) => String(pId) === String(id))
          );
          allAssignments[bId].properties = allAssignments[bId].properties.filter(
            (p) => !propertyIds.some((pId) => String(pId) === String(p.id))
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
        `Assigned ${selectedProperties.length} propert${
          selectedProperties.length > 1 ? "ies" : "y"
        } to ${barrister.full_name || barrister.name}`
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign properties"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Assign Properties to Barrister
          </h3>
          <p className="text-sm text-gray-500">
            Assign one or more properties to{" "}
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

          {/* Selected Properties Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Assigned Properties ({selectedProperties.length})
            </label>

            {selectedProperties.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-400">
                No properties selected yet. Use the search input above to add properties.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-secondary rounded-lg border border-primary/10">
                {selectedProperties.map((prop) => (
                  <span
                    key={prop.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-primary/20 text-xs font-medium text-gray-900 shadow-2xs"
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
            text="Save Assignment"
            loadingText="Saving..."
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
};

export default AssignPropertiesModal;
