import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import AccidentLayer from "../../components/tickets/AccidentLayer";
import TechAccidentLayer from "../../components/Technician/TechAccidentLayer";
import { useAuth } from '../../context/AuthContext';

const AccidentPage = () => {
  const { user } = useAuth();

  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Accident Tickets" />

        {/* AccidentLayer */}
        {(user.position === 'admin' || user.position === 'superadmin') && <AccidentLayer />}
        {(user.position === 'tech') && <TechAccidentLayer />}
        
      </MasterLayout>

    </>
  );
};

export default AccidentPage; 
