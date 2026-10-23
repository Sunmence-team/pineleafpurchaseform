import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import OverviewCards from "../../components/cards/OverviewCards";
import {
  BsFillAwardFill,
  BsHouses,
  BsFileEarmarkText,
  BsCloudCheck,
  BsCloudSlash,
  BsShieldExclamation,
  BsFileEarmarkPdf,
  BsArrowRight,
} from "react-icons/bs";
import { useClients } from "../../context/ClientsContext";
import { useUser } from "../../hooks/useUser";
import { propertyApi, api } from "../../helpers/api";
import { getOfflinePropertyIds } from "./properties/Properties";
import { getStoredAssignments } from "../../components/modals/AssignPropertiesModal";
import { getStoredDocuments } from "./documents/DocumentLibrary";
import type { PropertyProp } from "../../lib/interfaces";

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { allClients, loadingAllClients, fetchAllClients } = useClients();

  const [properties, setProperties] = useState<PropertyProp[]>([]);
  const [barristersCount, setBarristersCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (allClients.length === 0 && !loadingAllClients) {
      fetchAllClients(true);
    }
  }, [allClients.length, loadingAllClients, fetchAllClients]);

  useEffect(() => {
    const fetchBaseData = async () => {
      setLoadingStats(true);
      try {
        const [propsRes, barrRes] = await Promise.allSettled([
          propertyApi.get("/properties/search", {
            params: { per_page: 200 },
          }),
          api.get("/barristers"),
        ]);

        if (propsRes.status === "fulfilled") {
          const list =
            propsRes.value.data?.data?.data || propsRes.value.data?.data || [];
          setProperties(Array.isArray(list) ? list : []);
        }

        if (barrRes.status === "fulfilled") {
          const list = barrRes.value.data?.data;
          const data = Array.isArray(list) ? list : list?.data || [];
          setBarristersCount(data.length);
        }
      } catch (e) {
        console.error("Dashboard overview stats fetch error:", e);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchBaseData();
  }, []);

  // Offline vs Online calculations
  const offlineIds = useMemo(
    () => new Set(getOfflinePropertyIds().map(String)),
    [],
  );
  const offlinePropertiesCount = useMemo(() => {
    return properties.filter(
      (p) =>
        offlineIds.has(String(p.id)) ||
        p.is_offline === true ||
        p.is_offline === 1 ||
        p.status === "offline",
    ).length;
  }, [properties, offlineIds]);

  const onlinePropertiesCount = properties.length - offlinePropertiesCount;

  // Assignments & Unassigned calculations
  const assignments = useMemo(() => getStoredAssignments(), []);
  const assignedPropertyNames = useMemo(() => {
    const names = new Set<string>();
    for (const record of Object.values(assignments)) {
      for (const p of record.properties || []) {
        if (p?.name) names.add(p.name.trim().toLowerCase());
      }
    }
    return names;
  }, [assignments]);

  const unassignedEntriesCount = useMemo(() => {
    return allClients.filter((client: any) => {
      const site = (client.site_location || "").trim().toLowerCase();
      if (!site || site === "n/a") return true;
      return !assignedPropertyNames.has(site);
    }).length;
  }, [allClients, assignedPropertyNames]);

  // Documents Library metrics
  const storedDocs = useMemo(() => getStoredDocuments(), []);
  const signedFeedbackCount = useMemo(() => {
    return storedDocs.reduce(
      (sum, d) => sum + (d.feedback?.signed_count || 0),
      0,
    );
  }, [storedDocs]);

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-primary/10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username || "Admin"}
          </h1>
          <p className="text-sm text-gray-500">
            Here is your operational snapshot across properties, entries, and
            legal workflows
          </p>
        </div>

        <Link
          to="/dashboard/records"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition shadow-2xs w-max cursor-pointer"
        >
          <span>View All Form Records</span>
          <BsArrowRight size={14} />
        </Link>
      </div>

      {/* Top Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <OverviewCards
          title="Total Form Entries"
          value={allClients.length}
          icon={BsFileEarmarkText}
          subtitle="All submitted purchase forms"
        />
        <OverviewCards
          title="Total Properties"
          value={properties.length}
          icon={BsHouses}
          subtitle="All managed estate properties"
        />
        <OverviewCards
          title="Active Barristers"
          value={barristersCount}
          icon={BsFillAwardFill}
          subtitle="Registered legal partners"
        />
        <OverviewCards
          title="Batch Documents"
          value={storedDocs.length}
          icon={BsFileEarmarkPdf}
          subtitle="Downloaded document library"
        />
      </div>

      {/* Operational Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Property Online / Offline Status */}
        <div className="bg-secondary rounded-xl border border-primary/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">
                Property Online / Offline Status
              </h3>
              <BsHouses className="text-primary size-5" />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Properties currently flagged as online or marked for offline
              processing.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <BsCloudCheck size={16} />
                  <span>Online Properties</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {onlinePropertiesCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                  <BsCloudSlash size={16} />
                  <span>Offline Properties</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {offlinePropertiesCount}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/properties"
            className="mt-5 text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <span>Manage Properties Status</span>
            <BsArrowRight size={12} />
          </Link>
        </div>

        {/* Card 2: Legal Assignment Health */}
        <div className="bg-secondary rounded-xl border border-primary/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">
                Legal Assignment Coverage
              </h3>
              <BsShieldExclamation className="text-primary size-5" />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Purchase entries awaiting property barrister assignment.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <span className="text-xs font-medium text-red-600">
                  Unassigned Entries
                </span>
                <span className="font-bold text-red-600 text-sm">
                  {unassignedEntriesCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Assigned Coverage
                </span>
                <span className="font-bold text-emerald-600 text-sm">
                  {allClients.length > 0
                    ? `${Math.round(
                        ((allClients.length - unassignedEntriesCount) /
                          allClients.length) *
                          100,
                      )}%`
                    : "100%"}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/entries/unassigned"
            className="mt-5 text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <span>View Unassigned Entries</span>
            <BsArrowRight size={12} />
          </Link>
        </div>

        {/* Card 3: Document Feedback Tracking */}
        <div className="bg-secondary rounded-xl border border-primary/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">
                Document Feedback Tracking
              </h3>
              <BsFileEarmarkPdf className="text-primary size-5" />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Return status and signed documents across downloaded batches.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Total Download Batches
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {storedDocs.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200">
                <span className="text-xs font-medium text-emerald-700">
                  Signed Entries Returned
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  {signedFeedbackCount}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/documents"
            className="mt-5 text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <span>Open Document Library</span>
            <BsArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
