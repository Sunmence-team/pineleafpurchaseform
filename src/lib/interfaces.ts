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
  type: "success" | "pending" | "failed";
  statusText: string | number;
  icon?: IconType;
}

export interface SearchableInputProps<T> {
  endpoint: string;
  onSelect: (item: T) => void;
  onInputChange?: (value: string) => void;
  displayKey?: keyof T;
  queryParam?: string;
  requestMethod?: "get" | "post";
  label?: string;
  placeholder?: string;
  className?: string;
  inputContClassName?: string;
  dataKey?: string;
  initialValue?: string;
  showIcon?: boolean;
  fetchOnEmpty?: boolean;
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
