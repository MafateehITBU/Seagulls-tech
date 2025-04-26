import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import MaintenanceLayer from "../../components/archive/MaintenanceLayer";

const ClosedMaintenancePage = () => {

    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Closed Accident Tickets" />


                {/* MaintenanceLayer */}
                <MaintenanceLayer />

            </MasterLayout>
        </>
    );
};

export default ClosedMaintenancePage; 