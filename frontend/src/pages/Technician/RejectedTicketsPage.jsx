import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import RejectedTicketsLayer from '../../components/Technician/RejectedTicketsLayer';

const RejectedTicketsPage = () => {

  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Rejected Tickets" />

        {/* RejectedTicketsLayer */}
        <RejectedTicketsLayer />
      </MasterLayout>

    </>
  );
};

export default RejectedTicketsPage; 
