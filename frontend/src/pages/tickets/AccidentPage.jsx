import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import AccidentLayer from "../../components/tickets/AccidentLayer";
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

      </MasterLayout>

    </>
  );
};

export default AccidentPage; 
