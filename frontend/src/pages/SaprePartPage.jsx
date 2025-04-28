import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SparePartLayer from "../components/SparePartLayer.jsx";

const SparePartPage = () => {

    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Spare Parts" />


                {/* SparePartLayer */}
                <SparePartLayer />

            </MasterLayout>

        </>
    );
};

export default SparePartPage; 