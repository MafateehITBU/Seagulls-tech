import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import VendorLayer from "../components/VendorLayer";

const VendorPage = () => {

    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Vendors" />


                {/* VendorLayer */}
                <VendorLayer />

            </MasterLayout>

        </>
    );
};

export default VendorPage; 