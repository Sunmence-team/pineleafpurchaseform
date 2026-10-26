import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountryCallingCode } from "libphonenumber-js";
import {
  fetchCountriesService,
  fetchStatesService,
  type CountryItem,
  type CountryData,
  type FetchCountriesParams,
  type FetchStatesParams,
} from "../services/countryService";

export const useCountries = (params?: FetchCountriesParams) => {
  return useQuery<CountryData>({
    queryKey: ["countries", params],
    queryFn: () => fetchCountriesService(params),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useStates = (
  countryId?: number | string | null,
  params?: FetchStatesParams,
) => {
  return useQuery<string[]>({
    queryKey: ["states", countryId, params],
    queryFn: () => {
      if (!countryId) return [];
      return fetchStatesService(countryId, params);
    },
    enabled: Boolean(countryId),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export interface UseCountryStatesParams {
  selectedCountry?: string;
  countrySearch?: FetchCountriesParams;
  stateSearch?: FetchStatesParams;
}

export interface UseCountryStatesReturn {
  countries: string[];
  countryList: CountryItem[];
  countryCodeMap: Record<string, any>;
  countryIdMap: Record<string, number | string>;
  states: string[];
  loadingCountries: boolean;
  loadingStates: boolean;
  loading: { countries: boolean; states: boolean };
  countriesError: unknown;
  statesError: unknown;
  error: string | null;
  getMobilePlaceholder: (countryName?: string) => string;
  fetchCountries: (searchQuery: string, signal?: AbortSignal) => Promise<string[]>;
  fetchStates: (searchQuery: string, signal?: AbortSignal) => Promise<string[]>;
}

export const useCountryStates = (
  options?: string | UseCountryStatesParams,
): UseCountryStatesReturn => {
  const selectedCountry =
    typeof options === "string" ? options : options?.selectedCountry;
  const countryParams =
    typeof options === "object" ? options?.countrySearch : undefined;
  const stateParams =
    typeof options === "object" ? options?.stateSearch : undefined;

  const {
    data: countryData,
    isLoading: loadingCountries,
    error: countriesError,
  } = useCountries(countryParams);

  const countryCodeMap = countryData?.countryCodeMap ?? {};
  const countryIdMap = countryData?.countryIdMap ?? {};
  const countries = countryData?.countries ?? [];
  const countryList = countryData?.countryList ?? [];

  const selectedCountryId = selectedCountry
    ? countryIdMap[selectedCountry]
    : undefined;

  const {
    data: statesData,
    isLoading: loadingStates,
    error: statesError,
  } = useStates(selectedCountryId, stateParams);

  const states = statesData ?? [];

  const fetchCountries = useCallback(
    async (searchQuery: string = "", signal?: AbortSignal) => {
      const data = await fetchCountriesService({
        search: searchQuery,
        signal,
      });
      return data.countries;
    },
    [],
  );

  const fetchStates = useCallback(
    async (searchQuery: string = "", signal?: AbortSignal) => {
      if (!selectedCountryId) return [];
      return await fetchStatesService(selectedCountryId, {
        search: searchQuery,
        signal,
      });
    },
    [selectedCountryId],
  );

  const getMobilePlaceholder = (countryName?: string) => {
    if (!countryName || !countryCodeMap[countryName]) {
      return "Enter phone number";
    }
    try {
      const code = countryCodeMap[countryName];
      const callingCode = getCountryCallingCode(code as any);
      return `+${callingCode} XXXXXXXXXX`;
    } catch {
      return "Enter phone number";
    }
  };

  return {
    countries,
    countryList,
    countryCodeMap,
    countryIdMap,
    states,
    loadingCountries,
    loadingStates,
    loading: {
      countries: loadingCountries,
      states: loadingStates,
    },
    countriesError,
    statesError,
    error: countriesError
      ? "Failed to load countries."
      : statesError
        ? "Failed to load states."
        : null,
    getMobilePlaceholder,
    fetchCountries,
    fetchStates,
  };
};

export default useCountryStates;
