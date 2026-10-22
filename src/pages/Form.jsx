import React, { useState } from "react";
import { FaUser, FaUsers, FaBriefcase } from "react-icons/fa";
import assets from "../assets/assets";
import Section1 from "../section/Section1";
import Section2 from "../section/Section2";
import Section3 from "../section/Section3";
import Section4 from "../section/Section4";

const Form = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    purchase_type: "",
    clubName: "",
    clubContact: "",
    clubMembers: [],
    image: null,
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    maritalStatus: "",
    shouldSpouseNameShow: false,
    gender: "",
    spouseTitle: "",
    spouseFirstName: "",
    spouseMiddleName: "",
    spouseLastName: "",
    stateOfOrigin: "",
    lga: "",
    countryOfResidence: "",
    email: "",
    mobileNumber: "",
    additionalInfo1: "",
    additionalInfo2: "",
    detail1: "",
    detail2: "",
    finalDetail1: "",
    finalDetail2: "",
    nextOfKinFullName: "",
    nextOfKinRelationship: "",
    nextOfKinRelationshipOther: "",
    nextOfKinMobileNumber: "",
    nextOfKinEmail: "",
    clientDeclarationLandPrice: "",
    clientDeclarationNumberOfPlots: "",
    clientDeclarationSiteLocation: "",
    clientDeclarationPlotNumber: "",
    branches: "",
    clientDeclarationClientName: "",
    clientDeclarationSignature: "",
    clientDeclarationDate: "",
    referralFullName: "",
    referralMobileNumber: "",
  });

  const nextSection = () => {
    if (currentSection < 4) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const resetFormWithPurchaseType = (type) => {
    setFormData({
      purchase_type: type,
      clubName: "",
      clubContact: "",
      clubMembers: [],
      image: null,
      title: "",
      firstName: "",
      middleName: "",
      lastName: "",
      address: "",
      maritalStatus: "",
      shouldSpouseNameShow: false,
      gender: "",
      spouseTitle: "",
      spouseFirstName: "",
      spouseMiddleName: "",
      spouseLastName: "",
      stateOfOrigin: "",
      lga: "",
      countryOfResidence: "",
      email: "",
      mobileNumber: "",
      additionalInfo1: "",
      additionalInfo2: "",
      detail1: "",
      detail2: "",
      finalDetail1: "",
      finalDetail2: "",
      nextOfKinFullName: "",
      nextOfKinRelationship: "",
      nextOfKinRelationshipOther: "",
      nextOfKinMobileNumber: "",
      nextOfKinEmail: "",
      clientDeclarationLandPrice: "",
      clientDeclarationNumberOfPlots: "",
      clientDeclarationSiteLocation: "",
      clientDeclarationPlotNumber: "",
      branches: "",
      clientDeclarationClientName: "",
      clientDeclarationSignature: "",
      clientDeclarationDate: "",
      referralFullName: "",
      referralMobileNumber: "",
    });
    setCurrentSection(1);
  };

  const onSubmit = () => {
    // Reset to the first section and clear selection after submission
    setFormData((prev) => ({ ...prev, purchase_type: "" }));
    setCurrentSection(1);
  };

  const cards = [
    {
      icon: <FaUser className="text-3xl" />,
      key: "individual",
      label:
        "Single property purchase for personal investments and private ownership.",
    },
    {
      icon: <FaUsers className="text-3xl" />,
      key: "club",
      label:
        "Cooperative investment or property purchase on behalf of a social/investment club.",
    },
  ];

  if (!formData.purchase_type) {
    return (
      <div className="w-full min-h-screen bg-primary/20 flex items-center justify-center p-4">
        <div className="w-[90%] md:w-[80%] lg:w-[65%] max-w-4xl bg-white rounded-2xl p-6 md:p-10 flex flex-col items-center shadow-2xl transition-all duration-300">
          <img
            src={assets.logo}
            className="w-16 h-16"
            alt="Pineleaf Estate Logo"
          />
          <div className="flex flex-col gap-2 text-center mt-4 mb-8">
            <h2 className="text-primary font-bold text-2xl md:text-3xl">
              Pineleaf Estate and Properties Limited
            </h2>
            <p className="text-black/50 text-sm md:text-base font-medium">
              Land Purchase Client Details Form - For Outright Payment
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Select your purchase category below to start the application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2 mb-4">
            {cards.map((card, index) => (
              <div
                key={card.key + index}
                onClick={() => resetFormWithPurchaseType(card.key)}
                className="group flex flex-col items-center text-center p-6 border-2 border-gray-100 hover:border-primary rounded-2xl cursor-pointer hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className="p-4 bg-secondary rounded-full text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">
                  {card.key}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {card.label}
                </p>
              </div>
            ))}

            {/* Card 3: Association
            <div
              onClick={() => resetFormWithPurchaseType("association")}
              className="group flex flex-col items-center text-center p-6 border-2 border-gray-100 hover:border-primary rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
            >
              <div className="p-4 bg-secondary rounded-full text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <FaBriefcase className="text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Association
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Corporate, cooperative, union, or formal organization-based
                property acquisitions.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary/20 flex items-center justify-center py-8">
      <div className="w-[90%] md:w-[80%] lg:w-[65%] max-w-4xl bg-white rounded-2xl p-6 md:p-8 flex items-center justify-center flex-col shadow-xl">
        <img src={assets.logo} className="w-12" alt="Pineleaf Estate Logo" />
        <div className="flex flex-col gap-2 text-center mt-2">
          <p className="text-primary font-semibold text-2xl md:text-3xl">
            Pineleaf Estate and Properties Limited
          </p>
          <p className="text-black/50 text-sm font-medium">
            Land Purchase Client Details Form - For Outright Payment
          </p>
          <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
            Category: {formData.purchase_type}
          </p>
        </div>
        <div className="w-full mt-6">
          {currentSection === 1 && (
            <Section1
              formData={formData}
              setFormData={setFormData}
              nextSection={nextSection}
              prevSection={() =>
                setFormData((prev) => ({ ...prev, purchase_type: "" }))
              }
            />
          )}
          {currentSection === 2 && (
            <Section2
              formData={formData}
              setFormData={setFormData}
              prevSection={prevSection}
              nextSection={nextSection}
            />
          )}
          {currentSection === 3 && (
            <Section3
              formData={formData}
              setFormData={setFormData}
              prevSection={prevSection}
              nextSection={nextSection}
            />
          )}
          {currentSection === 4 && (
            <Section4
              formData={formData}
              setFormData={setFormData}
              prevSection={prevSection}
              onSubmit={onSubmit} // Pass the onSubmit function
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
