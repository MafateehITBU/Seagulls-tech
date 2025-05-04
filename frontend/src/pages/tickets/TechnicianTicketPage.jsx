import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import TechnicianTicketLayer from "../../components/tickets/TechnicianTicketLayer";

const TechnicianTicketPage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Technician Tickets" />


        {/* TechnicianTicketLayer */}
        <TechnicianTicketLayer />
        

      </MasterLayout>

    </>
  );
};

export default TechnicianTicketPage; 
