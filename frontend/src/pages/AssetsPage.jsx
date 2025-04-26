import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import AssetsLayer from "../components/AssetsLayer";

const AssetsPage = () => {

    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Assets" />


                {/* AssetsLayer */}
                <AssetsLayer />

            </MasterLayout>

        </>
    );
};

export default AssetsPage; 
