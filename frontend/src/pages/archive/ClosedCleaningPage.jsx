import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import CleaningLayer from "../../components/archive/CleaningLayer";

const ClosedCleaningPage = () => {

  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Closed Cleaning Tickets" />


        {/* CleaningLayer */}
        <CleaningLayer />

      </MasterLayout>

    </>
  );
};

export default ClosedCleaningPage; 