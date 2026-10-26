import React from "react";
import type { IconType } from "react-icons/lib";

export type OverviewCardsProps = {
  title: string;
  value: string | number;
  icon?: IconType;
  subtitle?: string;
  className?: string;
};

export interface TableColumnProps<T = unknown> {
  label: string | React.ReactNode;
  key?: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  tableHeadingClassName?: string;
}

export interface BaseReusableTableProps<T = unknown> {
  columns: TableColumnProps<T>[];
  isLoading: boolean;
  data: T[];
  error: unknown;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isDeleting?: boolean;
  hasSerialNo?: boolean;
  selectable?: boolean;
  selectedRowIds?: Array<number | string>;
  onToggleRowSelection?: (id: number | string) => void;
  onToggleAllRows?: (checked: boolean) => void;
  getRowId?: (item: T, index: number) => number | string | undefined;
  footerContent?: React.ReactNode;
}

export type ReusableTableWithPaginationProps<T = unknown> =
  BaseReusableTableProps<T> &
    PaginationControlProps & {
      hasPagination?: true;
    };

export type ReusableTableWithoutPaginationProps<T = unknown> =
  BaseReusableTableProps<T> &
    Partial<PaginationControlProps> & {
      hasPagination: false;
    };

export type ReusableTableProps<T = unknown> =
  | ReusableTableWithPaginationProps<T>
  | ReusableTableWithoutPaginationProps<T>;

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}

export interface StatusCardProps {
  type: "success" | "pending" | "failed" | string;
  statusText: string | number;
  icon?: IconType;
  optStyles?: string;
}

export interface UserProps {
  id: number;
  username: string;
  first_name: string;
  full_name: string;
  last_name: string;
  email: string;
  is_admin: number;
  role: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface SearchableInputProps<T = any> {
  endpoint?: string;
  fetcher?: (query: string, signal?: AbortSignal) => Promise<T[]>;
  options?: T[];
  onSelect: (item: T) => void;
  onClear?: () => void;
  onInputChange?: (value: string) => void;
  displayKey?: keyof T | (keyof T)[] | ((item: T) => string);
  getDisplayLabel?: (item: T) => string;
  renderOption?: (item: T, isSelected: boolean) => React.ReactNode;
  queryParam?: string;
  requestMethod?: "get" | "post";
  transformResponse?: (res: unknown) => T[];
  label?: string;
  placeholder?: string;
  className?: string;
  inputContClassName?: string;
  dataKey?: string;
  initialValue?: string;
  value?: T | null | string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  fetchOnEmpty?: boolean;
  isSelector?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  debounceMs?: number;
  minChars?: number;
  error?: string | null;
}

export interface ActionButtonProps {
  text: string;
  loadingText?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  action?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  buttonStyle?: string;
  overideBg?: boolean;
  type?: "button" | "submit";
}

export interface BarristerProp {
  id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  address?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  properties: PropertyProp[];
}

export interface BulkSelectionBarProps {
  count: number;
  itemLabel?: string;
  proceedText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onProceed: () => void;
  onCancel: () => void;
}

export interface PropertyProp {
  id?: string | number;
  name: string;
  estate_name?: string;
  location: string;
  price: number | string;
  type?: string;
  total_units?: number | string;
  unit_sold?: number | string;
  is_promo?: boolean;
  discount_price?: number | string;
  landmark?: string | string[];
  description?: string;
  size?: string;
  created_at?: string;
  is_online: boolean;
  barrister_id?: number | string;
  barrister?: BarristerProp;
  stats: {
    no_of_online: number;
    no_of_offline: number;
  };
}

export interface ApplicantUser {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  branch: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_email: string;
  next_of_kin_relationship: string;
  next_of_kin_address: string;
  job_description: string;
  salary: number | string;
  statement_of_account: string;
}

export interface Application {
  id: number | string;
  user_id: number | string;
  amount: number | string;
  payment_method: string;
  reference: string;
  paystack_reference: string;
  status: string;
  proof_of_payment: string;
  created_at: string;
  paid_at: string;
  user: ApplicantUser;
}

export interface HomeUser extends ApplicantUser {
  job_type?: string;
  monthly_revenue?: number | string;
  admin_approved_salary?: number | string;
  verified_salary?: number | string;
  is_verified?: number | boolean;
  is_interested?: number | boolean;
  interest_transactions_count?: number;
}

export interface SubscriptionTransaction {
  id: number | string;
  reference: string;
  transaction_reference: string;
  customer_name: string;
  customer_email: string;
  amount: number | string;
  total: number | string;
  status: string;
  transaction_status: string;
  payment_status: string;
  created_at: string;
  paid_at: string;
  updated_at: string;
  user: HomeUser;
}

export interface RefundItem {
  id: number;
  amount: number | string;
  status: string;
  created_at: string;
  admin_note: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  user: HomeUser;
}

export interface HouseProperty {
  id: number;
  name: string;
  estate_name: string;
  description: string;
  images: string[];
  location: string;
  type: string;
  price: number | string;
  total_units: number | string;
  unit_sold: number | string;
  no_of_bedrooms: number | string;
}

export interface PurchaseTransaction {
  id: number | string;
  type: string;
  reference: string;
  amount: number | string;
  status: string;
  payment_method: string;
  created_at: string;
  paid_at: string;
  payment_gateway_response?: {
    proof_of_payment?:
      | string
      | {
          url?: string;
          path?: string;
        };
  };
}

export interface PurchaseItem {
  id: number;
  status: string;
  agreed_duration_months: number | string;
  upfront_paid: boolean | number;
  created_at: string;
  approved_at: string;
  user: HomeUser;
  property: HouseProperty;
  transactions: PurchaseTransaction[];
}

export interface FlaggedAccountItem {
  id: number;
  reason?: string;
  flag_type?: string;
  type?: string;
  attempts_count?: number;
  attempts?: number;
  status?: string;
  resolution_status?: string;
  last_attempt_at?: string;
  updated_at?: string;
  created_at?: string;
  name?: string;
  user?: HomeUser;
}

export interface BranchItem {
  id: number;
  name: string;
  state: string;
  country: string;
  address: string;
  status: string;
}

export interface ClubMember {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}
export interface ClientEntry {
  id: number | string;
  purchase_type: string;
  is_online: boolean;

  personal_picture?: string;
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  address?: string;
  gender?: string;

  marital_status?: string;
  title_of_spouse?: string;
  first_name_of_spouse?: string;
  middle_name_of_spouse?: string;
  last_name_of_spouse?: string;

  lga?: string;
  country?: string;
  email: string;
  mobile_number: string;

  branch: BranchItem;

  next_of_kin_full_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_mobile_number?: string;
  next_of_kin_email?: string;
  next_of_kin_address?: string;

  declaration_name?: string;
  land_price?: string | number;
  number_of_plot?: string | number;
  plot_number?: string | number;
  client_name: string;
  signature?: string;
  declaration_date?: string;

  referral_name?: string;
  referral_number?: string;

  downloaded_date: string;

  club_name: string;
  club_contact: string;
  club_members: ClubMember[];

  created_at: string;
  updated_at?: string;

  properties: PropertyProp;

  branches?: string;
  site_location?: string;

  state_of_origin?: string;
  dob?: string;
  language?: string;
  nationality?: string;
  occupation?: string;
  referral_date?: string;
  referral_email?: string;
  notes?: NoteProps[];
}

export interface NoteProps {
  id: string | number;
  note: string;
  human_time: string;
  user_name: string;
  created_at: string;
}

export type ExportScope = "last_memory" | "all";

export type ExportFormats = "pdf" | "zip" | "excel" | "csv";

export type ExportDownloadType =
  | "single"
  | "by_property"
  | "by_branch"
  | "by_barrister";

export interface DocumentLibraryFiltersApplied {
  type?: string;
  application_id?: string;
  branch?: string | number;
  property?: string | number;
  barrister_id?: string | number;
}

export interface DocumentLibraryDownloadedAt {
  datetime?: string;
  date?: string;
  time?: string;
  human?: string;
}

export interface DocumentLibrarySummary {
  total_documents: number;
  total_records_represented: number;
  format_breakdown: {
    pdf?: number;
    zip?: number;
    excel?: number;
    csv?: number;
  };
  feedback_summary: {
    filled_count: number;
    pending_count: number;
    total_worked_on: number;
    total_not_worked_on: number;
  };
}

export interface DocumentItemFeedback {
  is_filled: boolean;
  barrister?: string | null;
  worked_on_count: number;
  not_worked_on_count: number;
  reason?: string | null;
  total_count: number;
  submitted_at?: string | null;
  submitted_by?: string | null;
}

export interface LibraryDocumentItem {
  id: number;
  title: string;
  file_name: string;
  download_url: string;
  file_type: ExportFormats;
  file_exists?: boolean;
  records_count: number;
  download_type?: string;
  scope?: ExportScope;
  filters_applied?: DocumentLibraryFiltersApplied;
  downloaded_by: string;
  downloaded_at: DocumentLibraryDownloadedAt;
  is_feedback_filled: boolean;
  feedback: DocumentItemFeedback;
}
