import React, { useState } from 'react';
import assets from '../assets/assests';
import Section1 from '../section/Section1';
import Section2 from '../section/Section2';
import Section3 from '../section/Section3';
import Section4 from '../section/Section4';

const Form = () => {
  const [currentSection, setCurrentSection] = useState(3);
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    gender: '',
    spouseTitle: '',
    spouseFirstName: '',
    spouseMiddleName: '',
    spouseLastName: '',
    stateOfOrigin: '',
    lga: '',
    occupation: '',
    countryOfResidence: '',
    language: '',
    email: '',
    mobileNumber: '',
    telephoneNumber: '',
    additionalInfo1: '',
    additionalInfo2: '',
    detail1: '',
    detail2: '',
    finalDetail1: '',
    finalDetail2: '',
    nextOfKinFullName: '',
    nextOfKinAddress: '',
    nextOfKinMobileNumber: '',
    nextOfKinEmail: '',
    clientDeclarationLandPrice: '',
    clientDeclarationNumberOfPlots: '',
    clientDeclarationSiteLocation: '',
    clientDeclarationPlotNumber: '',
    branches: '',
    clientDeclarationClientName: '',
    clientDeclarationSignature: '',
    clientDeclarationDate: '',
    referralFullName: '',
    referralMobileNumber: '',
    referralDate: '',
    referralEmail: '',
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

  const onSubmit = () => {
    // Reset to the first section after submission
    setCurrentSection(1);
  };

  return (
    <div className="w-full min-h-[100vh] bg-secClr/20 flex items-start justify-center py-12">
      <div className="w-[90%] md:w-[60%] lg:w-[50%] bg-white rounded-lg p-6 md:p-8 flex items-center justify-center flex-col">
        <img src={assets.logo} className="w-12" alt="Pineleaf Estate Logo" />
        <div className="flex flex-col gap-2 text-center mt-2">
          <p className="text-secClr font-semibold text-2xl md:text-3xl">Pineleaf Estate and Properties Limited</p>
          <p className="text-black/50 text-sm">Land Purchase Client Details Form - For Outright Payment</p>
        </div>
        <div className="w-full mt-6">
          {currentSection === 1 && <Section1 formData={formData} setFormData={setFormData} nextSection={nextSection} />}
          {currentSection === 2 && (
            <Section2 formData={formData} setFormData={setFormData} prevSection={prevSection} nextSection={nextSection} />
          )}
          {currentSection === 3 && (
            <Section3 formData={formData} setFormData={setFormData} prevSection={prevSection} nextSection={nextSection} />
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