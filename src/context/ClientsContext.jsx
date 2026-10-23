import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { api } from "../helpers/api";

const ClientsContext = createContext();

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const ClientsProvider = ({ children }) => {
  const [allClients, setAllClients] = useState([]);
  const [loadingAllClients, setLoadingAllClients] = useState(false);
  const [allClientsFetched, setAllClientsFetched] = useState(false);

  // For paginated/search results
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const parseApplicationsResponse = (response) => {
    let applications = [];
    let meta = {};

    if (response.data && Array.isArray(response.data.data)) {
      applications = response.data.data;
      meta = response.data.meta || {};
    } else if (response.data && Array.isArray(response.data.applications)) {
      applications = response.data.applications;
      meta = response.data.meta || {};
    } else if (response.data && Array.isArray(response.data.clients)) {
      applications = response.data.clients;
      meta = response.data.meta || {};
    } else if (Array.isArray(response.data)) {
      applications = response.data;
    } else {
      console.error("Unexpected response structure:", response.data);
      throw new Error(
        "Response data is not an array or does not contain an array of clients",
      );
    }

    const mappedApplications = applications.map((item) => ({
      id: item.id || "N/A",
      client_name: item.client_name || item.club_name || "N/A",
      email: item.email || "N/A",
      mobile_number: item.mobile_number || item.club_contact || "N/A",
      branches: item.branches || "N/A",
      created_at: item.created_at || "N/A",
      address: item.address || "N/A",
      country: item.country || "N/A",
      declaration_date: item.declaration_date || "N/A",
      declaration_name: item.declaration_name || "N/A",
      dob: item.dob || "N/A",
      first_name: item.first_name || "N/A",
      first_name_of_spouse: item.first_name_of_spouse || "N/A",
      gender: item.gender || "N/A",
      land_price: item.land_price || "N/A",
      language: item.language || "N/A",
      last_name: item.last_name || "N/A",
      last_name_of_spouse: item.last_name_of_spouse || "N/A",
      lga: item.lga || "N/A",
      marital_status: item.marital_status || "N/A",
      middle_name: item.middle_name || "N/A",
      middle_name_of_spouse: item.middle_name_of_spouse || "N/A",
      nationality: item.nationality || "N/A",
      next_of_kin_address: item.next_of_kin_address || "N/A",
      next_of_kin_email: item.next_of_kin_email || "N/A",
      next_of_kin_full_name: item.next_of_kin_full_name || "N/A",
      next_of_kin_mobile_number: item.next_of_kin_mobile_number || "N/A",
      number_of_plot: item.number_of_plot || "N/A",
      occupation: item.occupation || "N/A",
      personal_picture: item.personal_picture || "N/A",
      plot_number: item.plot_number || "N/A",
      referral_date: item.referral_date || "N/A",
      referral_email: item.referral_email || "N/A",
      referral_name: item.referral_name || "N/A",
      referral_number: item.referral_number || "N/A",
      signature: item.signature || "N/A",
      site_location: item.site_location || "N/A",
      state_of_origin: item.state_of_origin || "N/A",
      telephone_number: item.telephone_number || "N/A",
      title: item.title || "N/A",
      title_of_spouse: item.title_of_spouse || "N/A",
      updated_at: item.updated_at || "N/A",
    }));

    return { applications: mappedApplications, meta };
  };

  const fetchAllClients = useCallback(
    async (force = false) => {
      if ((allClientsFetched && !force) || loadingAllClients) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingAllClients(true);

      try {
        let allData = [];
        let page = 1;
        let lastPage = 1;

        do {
          const payload = { page, per_page: 200 };
          const response = await api.post(`${API_URL}/all_clients`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const { applications, meta } = parseApplicationsResponse(response);
          allData.push(...applications);

          lastPage = meta.last_page || 1;
          page += 1;

          console.log(
            `Loaded ${allData.length} clients (page ${page - 1}/${lastPage})`,
          );
        } while (page <= lastPage);

        setAllClients(allData);
        setAllClientsFetched(true);
        toast.success("Client data synchronized");
      } catch (error) {
        console.error("Error fetching all clients:", error);
        toast.error("Failed to load all clients");
      } finally {
        setLoadingAllClients(false);
      }
    },
    [allClientsFetched, loadingAllClients],
  );

  const fetchApplications = useCallback(async (page, perPage, query = "") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingApplications(true);
    try {
      let response;
      if (query.trim()) {
        response = await api.get(
          `${API_URL}/applications/search?query=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, per_page: perPage },
          },
        );
      } else {
        const payload = { page, per_page: perPage };
        response = await api.post(`${API_URL}/all_clients`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      const { applications: mappedApps, meta } =
        parseApplicationsResponse(response);
      setApplications(mappedApps);
      setTotalPages(meta.last_page || 1);
      setTotalRecords(meta.total || mappedApps.length);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  const removeClient = (id) => {
    setAllClients((prev) => prev.filter((client) => client.id !== id));
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  return (
    <ClientsContext.Provider
      value={{
        allClients,
        loadingAllClients,
        allClientsFetched,
        fetchAllClients,
        applications,
        loadingApplications,
        fetchApplications,
        totalPages,
        setTotalPages,
        totalRecords,
        setTotalRecords,
        removeClient,
        setAllClients,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
};
