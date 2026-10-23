import React from "react";

export interface ClubMember {
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface PurchaseFormData {
  purchase_type: string;
  clubName?: string;
  clubContact?: string;
  clubMembers?: ClubMember[];
  image?: File | string | null;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  address?: string;
  maritalStatus?: string;
  shouldSpouseNameShow?: boolean;
  gender?: string;
  spouseTitle?: string;
  spouseFirstName?: string;
  spouseMiddleName?: string;
  spouseLastName?: string;
  stateOfOrigin?: string;
  lga?: string;
  countryOfResidence?: string;
  email?: string;
  mobileNumber?: string;
  additionalInfo1?: string;
  additionalInfo2?: string;
  detail1?: string;
  detail2?: string;
  finalDetail1?: string;
  finalDetail2?: string;
  nextOfKinFullName?: string;
  nextOfKinRelationship?: string;
  nextOfKinRelationshipOther?: string;
  nextOfKinMobileNumber?: string;
  nextOfKinEmail?: string;
  clientDeclarationLandPrice?: string | number;
  clientDeclarationNumberOfPlots?: string | number;
  clientDeclarationSiteLocation?: string;
  clientDeclarationPlotNumber?: string | number;
  branches?: string;
  clientDeclarationClientName?: string;
  clientDeclarationSignature?: string;
  clientDeclarationDate?: string | Date | null;
  referralFullName?: string;
  referralMobileNumber?: string;
  referralDate?: string | Date | null;
  referralEmail?: string;
  [key: string]: any;
}

export interface SectionProps {
  formData: PurchaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  nextSection?: () => void;
  prevSection?: () => void;
  onSubmit?: (e?: any) => void;
}
