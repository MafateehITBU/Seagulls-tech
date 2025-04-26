import React from "react";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import AccidentLayer from "../../components/archive/AccidentLayer";

const ClosedAccidentPage = () => {

    return (
        <>
            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Closed Accident Tickets" />


                {/* AccidentLayer */}
                <AccidentLayer />

            </MasterLayout>
        </>
    );
};

export default ClosedAccidentPage; 