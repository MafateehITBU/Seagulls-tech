import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import TableDataLayer from "../components/TableDataLayer";
import CleaningLayer from "../../components/ticket/CleaningLayer";

const CleaningPage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Cleaning Tickets" />

        {/* CleaningLayer */}
        <CleaningLayer />

      </MasterLayout>

    </>
  );
};

export default CleaningPage; 
