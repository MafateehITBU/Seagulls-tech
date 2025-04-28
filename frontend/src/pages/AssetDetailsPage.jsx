import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import AssetDetailsLayer from "../components/AssetDetailsLayer";

const AssetDetailsPage = () => {

    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Asset Details" />


                {/* AssetDetailsLayer */}
                <AssetDetailsLayer />

            </MasterLayout>

        </>
    );
};

export default AssetDetailsPage; 
