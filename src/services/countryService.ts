const COUNTRY_URL =
  import.meta.env.VITE_COUNTRY_BASE_URL ||
  "https://countriesbox.pineleafesates.com.ng/api";

export interface CountryItem {
  id: number | string;
  name: string;
  iso2: string;
  iso3?: string;
  phone_code?: string;
}

export interface StateItem {
  id: number | string;
  name: string;
  country_id?: number | string;
  country_code?: string;
}

export interface CountryData {
  countries: string[];
  countryList: CountryItem[];
  countryCodeMap: Record<string, any>;
  countryIdMap: Record<string, number | string>;
}

export interface FetchCountriesParams {
  search?: string;
  signal?: AbortSignal;
}

export interface FetchStatesParams {
  search?: string;
  signal?: AbortSignal;
}

export const fetchCountriesService = async (
  params?: FetchCountriesParams,
): Promise<CountryData> => {
  const search = params?.search?.trim() || "";
  const signal = params?.signal;

  const url = new URL(`${COUNTRY_URL}/countries`);
  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.statusText}`);
  }
  const raw = await response.json();
  const result: any[] = Array.isArray(raw) ? raw : raw?.data || [];
  if (!result || result.length === 0) {
    throw new Error("No countries found");
  }

  let countryList: CountryItem[] = result
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      iso2: c.iso2,
      iso3: c.iso3,
      phone_code: c.phone_code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const countryCodeMap: Record<string, any> = {};
  const countryIdMap: Record<string, number | string> = {};

  countryList.forEach((c) => {
    countryCodeMap[c.name] = c.iso2;
    countryIdMap[c.name] = c.id;
  });

  // Client-side fallback filter while BE deployment is being finalized
  if (search) {
    const q = search.toLowerCase();
    countryList = countryList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.iso2 && c.iso2.toLowerCase().includes(q)),
    );
  }

  return {
    countries: countryList.map((c) => c.name),
    countryList,
    countryCodeMap,
    countryIdMap,
  };
};

export const fetchStatesService = async (
  countryId: number | string,
  params?: FetchStatesParams,
): Promise<string[]> => {
  if (!countryId) return [];

  const search = params?.search?.trim() || "";
  const signal = params?.signal;

  const url = new URL(`${COUNTRY_URL}/countries/${countryId}/states`);
  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch states: ${response.statusText}`);
  }
  const raw = await response.json();
  const result: any[] = Array.isArray(raw) ? raw : raw?.data || [];
  let stateList: string[] = result?.map((s: any) => s.name) || [];
  stateList = stateList.sort();

  // Client-side fallback filter while BE deployment is being finalized
  if (search) {
    const q = search.toLowerCase();
    stateList = stateList.filter((name) => name.toLowerCase().includes(q));
  }

  return stateList;
};
