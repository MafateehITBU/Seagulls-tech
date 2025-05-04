import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import CleaningLayer from "../../components/tickets/CleaningLayer";
import TechCleaningLayer from '../../components/Technician/TechCleaningLayer';
import { useAuth } from '../../context/AuthContext';

const CleaningPage = () => {
  const { user } = useAuth();

  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Cleaning Tickets" />


        {/* CleaningLayer */}
        {(user.position === 'admin' || user.position === 'superadmin') && <CleaningLayer />}
        {(user.position === 'tech') && <TechCleaningLayer />}

      </MasterLayout>

    </>
  );
};

export default CleaningPage; 
