import React from "react";
import { Link } from "react-router-dom";
import OverviewCards from "../../components/cards/OverviewCards";
import {
  BsFillAwardFill,
  BsHouses,
  BsFileEarmarkText,
  BsCloudCheck,
  BsCloudSlash,
  BsArrowRight,
  BsBuildings,
  BsDownload,
  BsPerson,
  BsPeople,
  BsTag,
} from "react-icons/bs";
import { useUser } from "../../hooks/useUser";
import { useAdminStats } from "../../hooks/useAdminStats";
import { getErrorMessage } from "../../helpers/api";

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { data: statsResponse, isLoading, error } = useAdminStats();

  const stats = statsResponse?.data;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-primary/10">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username || "Admin"}
          </h1>
          <p className="text-xs text-gray-500">
            Here is your live administrative summary across properties,
            applications, branches, and downloads.
          </p>
        </div>

        <Link
          to="/dashboard/records"
          className="action-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold hover:bg-primary/90 transition shadow-2xs w-max cursor-pointer"
        >
          <span>View All Applications</span>
          <BsArrowRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {getErrorMessage(error, "Failed to load dashboard statistics.")}
        </div>
      )}

      {/* Top Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 my-4">
        <OverviewCards
          title="Total Applications"
          value={isLoading ? "..." : (stats?.applications?.total ?? 0)}
          icon={BsFileEarmarkText}
        />
        <OverviewCards
          title="Total Properties"
          value={
            isLoading
              ? "..."
              : (stats?.properties?.total ?? stats?.total_no_of_property ?? 0)
          }
          icon={BsHouses}
        />
        <OverviewCards
          title="Branches"
          value={isLoading ? "..." : (stats?.branches?.total ?? 0)}
          icon={BsBuildings}
        />
        <OverviewCards
          title="Active Barristers"
          value={
            isLoading
              ? "..."
              : `${stats?.barristers?.active ?? 0} / ${stats?.barristers?.total ?? 0}`
          }
          icon={BsFillAwardFill}
        />
        <OverviewCards
          title="Total Downloads"
          value={isLoading ? "..." : (stats?.downloads?.total_downloads ?? 0)}
          icon={BsDownload}
        />
      </div>

      {/* Operational Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Property Inventory Breakdown */}
        <div className="bg-secondary rounded-xl border border-primary/10 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Property Inventory
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Availability and catalog breakdown of all registered estate
              properties.
            </p>

            <div className="space-y-2.5 mt-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsCloudCheck size={16} />
                  <span>Online Properties</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.properties?.online ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsCloudSlash size={16} />
                  <span>Offline Properties</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.properties?.offline ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsHouses size={16} />
                  <span>Regular Properties</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.properties?.regular ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsTag size={16} />
                  <span>Promo Properties</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.properties?.promo ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/properties"
            className="mt-5 text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <span>Manage Properties</span>
            <BsArrowRight size={12} />
          </Link>
        </div>

        {/* Card 2: Applications & Submissions Breakdown */}
        <div className="bg-secondary rounded-xl border border-primary/10 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Applications Breakdown
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Purchase applications segmented by processing channel and
              applicant type.
            </p>

            <div className="space-y-2.5 mt-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsCloudCheck size={16} />
                  <span>Online Submissions</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.applications?.online ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsCloudSlash size={16} />
                  <span>Offline Entries</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.applications?.offline ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsPerson size={16} />
                  <span>Individual Applicants</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.applications?.individual ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <BsPeople size={16} />
                  <span>Club / Association</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading
                    ? "..."
                    : (stats?.applications?.club_or_association ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/records"
            className="mt-5 text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <span>Manage Application Records</span>
            <BsArrowRight size={12} />
          </Link>
        </div>

        {/* Card 3: Download & Export Activity */}
        <div className="bg-secondary rounded-xl border border-primary/10 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Download & Export Activity
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Summary of all generated data exports and last recorded download.
            </p>

            <div className="space-y-2.5 mt-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Total Download Batches
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {isLoading ? "..." : (stats?.downloads?.total_downloads ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Total Records Downloaded
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  {isLoading
                    ? "..."
                    : (stats?.downloads?.total_records_downloaded ?? 0)}
                </span>
              </div>

              <div className="pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    Last Export
                  </span>
                  <span className="text-[11px] font-semibold text-primary">
                    {stats?.downloads?.last_download?.human ||
                      stats?.downloads?.last_download?.date ||
                      "N/A"}
                  </span>
                </div>
                {stats?.downloads?.last_download ? (
                  <div className="space-y-1">
                    <p
                      className="text-xs font-semibold text-gray-900 truncate"
                      title={stats.downloads.last_download.file_name}
                    >
                      {stats.downloads.last_download.file_name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {stats.downloads.last_download.records_count} records •{" "}
                      <span className="capitalize">
                        {stats.downloads.last_download.download_type.replace(
                          /_/g,
                          " ",
                        )}
                      </span>
                      {stats.downloads.last_download.user_name
                        ? ` by ${stats.downloads.last_download.user_name}`
                        : ""}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {isLoading ? "Loading..." : "No downloads recorded yet"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/records/downloaded"
            className="mt-5 text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <span>View Download History</span>
            <BsArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
