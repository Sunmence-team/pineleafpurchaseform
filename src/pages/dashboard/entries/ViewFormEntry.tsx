import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaDownload,
  FaArrowLeft,
  FaPaperPlane,
  FaRegCommentDots,
} from "react-icons/fa";
import {
  BsFileEarmarkText,
  BsGeoAlt,
  BsBuilding,
  BsCashCoin,
  BsCheckCircle,
  BsClockHistory,
  BsPerson,
  BsShieldCheck,
} from "react-icons/bs";
import { toast } from "sonner";
import {
  formatISODateToCustom,
  formatISODateToYYYYMMDD,
  formatterUtility,
} from "../../../helpers/formatterUtility";
import {
  useEntryDetails,
  useOldEntryDetails,
  useAddApplicationNote,
} from "../../../hooks/useClientEntries";
import { useExportDownload } from "../../../hooks/useDownload";
import { getErrorMessage } from "../../../helpers/api";
import ActionButton from "../../../components/ui/ActionButton";

interface ViewFormEntryProps {
  endpointType?: "applications" | "clients";
}

const ViewFormEntry: React.FC<ViewFormEntryProps> = ({ endpointType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from;

  const [newNote, setNewNote] = useState("");

  const isOldRecord =
    endpointType === "clients" ||
    (!endpointType && location.pathname.includes("/old-records/"));

  const handleBack = () => {
    if (fromPath) {
      navigate(fromPath);
    } else {
      navigate(isOldRecord ? "/dashboard/old-records" : "/dashboard/records");
    }
  };

  const backButtonText = fromPath
    ? "Go Back"
    : isOldRecord
      ? "Back to Old Records"
      : "Back to Records";

  const entryQuery = useEntryDetails(!isOldRecord ? id : null);
  const oldEntryQuery = useOldEntryDetails(isOldRecord ? id : null);
  const { mutate: exportDownload, isPending: isDownloading } =
    useExportDownload();
  const addNoteMutation = useAddApplicationNote();

  const handleDownload = () => {
    if (!id) return;
    exportDownload(
      {
        type: "single",
        application_id: id,
      },
      {
        onSuccess: () => {
          toast.success("Entry exported successfully!");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "Failed to export entry."));
        },
      },
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed) {
      toast.error("Please enter a note before submitting.");
      return;
    }
    if (!id) return;

    addNoteMutation.mutate(
      { applicationId: id, note: trimmed },
      {
        onSuccess: () => {
          toast.success("Note added successfully");
          setNewNote("");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "Failed to add note"));
        },
      },
    );
  };

  const {
    data: responseData,
    isLoading,
    error,
  } = isOldRecord ? oldEntryQuery : entryQuery;

  const client = responseData?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] p-4 text-center">
        <p className="text-red-500 font-semibold mb-4 text-base">
          {error
            ? (error as any)?.response?.data?.message ||
              (error as Error).message ||
              "Failed to load application details"
            : "No application details found"}
        </p>
        <button
          onClick={handleBack}
          className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition cursor-pointer"
        >
          {backButtonText}
        </button>
      </div>
    );
  }

  const isIndividual =
    !client.purchase_type || client.purchase_type === "individual";

  // Notes array from application details
  const notesList: string[] = Array.isArray(client.notes) ? client.notes : [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Application #{client.id || id}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            <strong className="text-gray-800 capitalize">
              {client.client_name ||
                `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
                client.club_name ||
                "N/A"}
                {" "}
                .
                {" "}
                {client.purchase_type || "Individual"}
                {" "}
                .
                {" "}
                {client.is_online ? "Online" : "Offline"}
            </strong>
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleBack}
            className="h-10 px-2.5 rounded-lg bg-secondary border border-primary/10 text-gray-700 transition cursor-pointer flex items-center gap-2 justify-center shrink-0"
            title={backButtonText}
            aria-label="Back"
          >
            <FaArrowLeft className="text-sm md:text-base text-primary" />
            <span>Close</span>
          </button>
          <ActionButton
            onClick={handleDownload}
            disabled={isDownloading}
            icon={<FaDownload className="text-xs" />}
            text={isDownloading ? "Generating PDF..." : "Download PDF"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="space-y-6 lg:sticky lg:top-1 no-print">
          <div className="bg-secondary p-3.5 rounded-xl border border-primary/10 text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">
                Submission Mode:
              </span>
              <span className="font-semibold text-gray-800">
                {client.is_online ? "Online Entry" : "Physical Form"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">
                Purchase Category:
              </span>
              <span className="font-semibold text-gray-800 capitalize">
                {client.purchase_type || "Individual"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">
                Date Submitted:
              </span>
              <span className="text-gray-700">
                {client.created_at
                  ? formatISODateToCustom(client.created_at)
                  : "N/A"}
              </span>
            </div>

            <div className="border-t border-primary/10 pt-2 flex justify-between items-center">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <BsBuilding size={12} className="text-primary" />
                Estate / Property:
              </span>
              <span
                className="font-semibold text-gray-900 truncate max-w-[150px]"
                title={client.properties?.name || client.site_location}
              >
                {client.properties?.name || client.site_location || "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <BsGeoAlt size={12} className="text-primary" />
                Branch:
              </span>
              <span className="font-semibold text-gray-900">
                {client.branch?.name || client.branches || "HQ"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">
                Plots Allocated:
              </span>
              <span className="font-bold text-primary">
                {client.number_of_plot || 1}{" "}
                {Number(client.number_of_plot) === 1 ? "Plot" : "Plots"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Plot Number:</span>
              <span className="font-medium text-gray-800">
                {client.plot_number || "Unassigned"}
              </span>
            </div>

            <div className="border-t border-primary/10 pt-2 flex justify-between items-center">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <BsCashCoin size={12} className="text-primary" />
                Total Value:
              </span>
              <span className="font-bold text-primary text-sm">
                {formatterUtility(
                  Number(client.land_price || 0) *
                    Number(client.number_of_plot || 1),
                )}
              </span>
            </div>

            {client.downloaded_date && (
              <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                <span>Last Downloaded:</span>
                <span>{formatISODateToCustom(client.downloaded_date)}</span>
              </div>
            )}
          </div>

          <div className="bg-secondary rounded-xl border border-primary/10 p-3.5 space-y-4">
            <form onSubmit={handleAddNote} className="space-y-2.5">
              <label
                htmlFor="application-new-note"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Add New Note
              </label>
              <textarea
                id="application-new-note"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note (e.g. Client requested plot reallocation on 26/10/2026. Approved by management)..."
                className="w-full p-3 rounded-lg border border-primary/20 bg-white text-xs outline-none resize-y"
              />
              <div className="flex justify-end">
                <ActionButton
                  text="Add Note"
                  loadingText="Posting..."
                  icon={<FaPaperPlane size={11} />}
                  loading={addNoteMutation.isPending}
                  disabled={addNoteMutation.isPending}
                  type={"submit"}
                  // onClick={(e) => handleAddNote(e)}
                />
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recorded Notes ({notesList.length})
              </h3>

              {notesList.length === 0 ? (
                <div className="text-center">
                  <FaRegCommentDots className="mx-auto text-gray-300 size-6 mb-1.5" />
                  <p className="text-xs font-medium text-gray-500">
                    No notes recorded yet.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Use the form above to add an activity or follow-up note.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto styled-scrollbar pr-1">
                  {notesList.map((noteItem, index) => {
                    const noteText =
                      typeof noteItem === "string"
                        ? noteItem
                        : (noteItem as any)?.note || JSON.stringify(noteItem);
                    return (
                      <div
                        key={index}
                        className="p-3.5 rounded-xl bg-secondary/70 border border-primary/10 text-xs text-gray-800 space-y-1 hover:border-primary/30 transition shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold mb-1">
                          <span className="text-primary flex items-center gap-1">
                            <BsCheckCircle size={10} />
                            Note #{index + 1}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                          {noteText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (2 Ratio): Comprehensive Application Details
           ======================================================== */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-primary/10 shadow-sm p-6 md:p-8 space-y-8 print-section">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center border-b border-gray-100 pb-6">
            {isIndividual ? (
              <>
                <img
                  src={
                    client.personal_picture ?? "https://via.placeholder.com/150"
                  }
                  alt="Client Avatar"
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-primary/10 shadow-sm shrink-0"
                />
                <div className="space-y-1.5 min-w-0">
                  <div className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-semibold rounded-full uppercase tracking-wider mb-1">
                    Individual Applicant
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 capitalize truncate">
                    {client.client_name ||
                      `${client.first_name || ""} ${client.last_name || ""}`.trim()}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600">
                    Email:{" "}
                    <span className="font-medium text-gray-900">
                      {client.email}
                    </span>
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Phone:{" "}
                    <span className="font-medium text-gray-900">
                      {client.mobile_number}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2 w-full">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                  {client.purchase_type === "club"
                    ? "Club Application"
                    : "Association Application"}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                  {client.client_name || client.club_name}
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  Official Contact:{" "}
                  <span className="font-medium text-gray-900">
                    {client.club_contact}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Personal / Club Information */}
          {isIndividual ? (
            <div>
              <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    First Name:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.first_name || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Middle Name:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.middle_name || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Last Name:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.last_name || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">Gender:</span>{" "}
                  <span className="font-medium text-gray-900 capitalize">
                    {client.gender || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Marital Status:
                  </span>{" "}
                  <span className="font-medium text-gray-900 capitalize">
                    {client.marital_status || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    State of Origin:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.state_of_origin || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">LGA:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.lga || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Country of Residence:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.country || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700 sm:col-span-2">
                  <span className="font-semibold text-gray-500">
                    Residential Address:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.address || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
                  {client.purchase_type === "club"
                    ? "Club Details"
                    : "Association Details"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      Organization Name:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.client_name || client.club_name}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      Official Contact:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.club_contact}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">State:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.state_of_origin || "N/A"}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">LGA:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.lga || "N/A"}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      Country:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.country || "N/A"}
                    </span>
                  </p>
                  <p className="text-gray-700 sm:col-span-2">
                    <span className="font-semibold text-gray-500">
                      Official Address:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.address || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
                  Registered Members
                </h3>
                {client.club_members && client.club_members.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-primary/10 shadow-2xs">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-secondary text-gray-700 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">S/N</th>
                          <th className="py-2.5 px-3 font-bold">Title</th>
                          <th className="py-2.5 px-3 font-bold">Full Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {client.club_members.map(
                          (member: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50/50">
                              <td className="py-2 px-3 text-gray-400 font-medium">
                                {index + 1}
                              </td>
                              <td className="py-2 px-3 font-semibold text-primary">
                                {member.title || member.Title || ""}
                              </td>
                              <td className="py-2 px-3">
                                {member.first_name || member.firstName || ""}{" "}
                                {member.middle_name || member.middleName
                                  ? (member.middle_name || member.middleName) +
                                    " "
                                  : ""}
                                {member.last_name || member.lastName || ""}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">
                    No members registered under this club.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Spouse Info */}
          {isIndividual &&
            (client.first_name_of_spouse || client.last_name_of_spouse) && (
              <div>
                <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
                  Spouse Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      First Name:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.first_name_of_spouse || "N/A"}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      Middle Name:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.middle_name_of_spouse || "N/A"}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      Last Name:
                    </span>{" "}
                    <span className="font-medium text-gray-900">
                      {client.last_name_of_spouse || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            )}

          {/* Next of Kin / Representative Details */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
              {isIndividual
                ? "Next of Kin Details"
                : "Representative / Trustee Details"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  {isIndividual ? "Full Name:" : "Representative Name:"}
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.next_of_kin_full_name || "N/A"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  {isIndividual ? "Relationship:" : "Designation / Role:"}
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.next_of_kin_relationship || "N/A"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Phone Number:
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.next_of_kin_mobile_number || "N/A"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Email Address:
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.next_of_kin_email || "N/A"}
                </span>
              </p>
            </div>
          </div>

          {/* Land Details */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
              Land & Allocation Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Estate / Property:
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.properties?.name || client.site_location || "N/A"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Price per Plot:
                </span>{" "}
                <span className="font-medium text-gray-900 font-mono">
                  {formatterUtility(Number(client.land_price || 0))}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Number of Plots:
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.number_of_plot}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Plot Number:
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.plot_number || "Unassigned"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Branch Location:
                </span>{" "}
                <span className="font-medium text-gray-900">
                  {client.branch?.name || client.branches || "HQ"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-500">
                  Total Purchase Amount:
                </span>{" "}
                <span className="font-bold text-primary font-mono">
                  {formatterUtility(
                    Number(client.land_price || 0) *
                      Number(client.number_of_plot || 1),
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Declaration */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
              Applicant Declaration
            </h3>
            <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
              <div className="space-y-2 text-xs md:text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Declarant Name:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.declaration_name || "N/A"}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Declaration Date:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.declaration_date
                      ? formatISODateToYYYYMMDD(client.declaration_date)
                      : "N/A"}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5">
                  Applicant Signature:
                </p>
                <img
                  src={client.signature ?? "https://via.placeholder.com/150"}
                  alt="Signature"
                  className="w-40 h-20 object-contain border border-primary/10 rounded-lg p-2 bg-secondary"
                />
              </div>
            </div>
          </div>

          {/* Referral */}
          {client.referral_name && (
            <div>
              <h3 className="text-base md:text-lg font-bold text-primary border-b border-primary/10 pb-2 mb-4">
                Referral Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Referral Name:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.referral_name}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">
                    Referral Phone:
                  </span>{" "}
                  <span className="font-medium text-gray-900">
                    {client.referral_number || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFormEntry;
