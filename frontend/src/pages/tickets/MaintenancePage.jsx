import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import MaintenanceLayer from "../../components/tickets/MaintenanceLayer";
import TechMaintLayer from "../../components/Technician/TechMaintLayer";
import { useAuth } from '../../context/AuthContext';


const MaintenancePage = () => {
    const { user } = useAuth();

    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Maintenance Tickets" />

                {/* MaintenanceLayer */}
                {(user.position === 'admin' || user.position === 'superadmin') && <MaintenanceLayer />}
                {(user.position === 'tech') && <TechMaintLayer />}

            </MasterLayout>

        </>
    );
};

export default MaintenancePage; 
