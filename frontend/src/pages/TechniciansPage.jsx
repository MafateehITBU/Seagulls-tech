import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import TechniciansLayer from '../components/TechniciansLayer'
import { useAuth } from '../context/AuthContext';

function TechniciansPage() {
    const { user } = useAuth();
    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Technicians" />


                {(user.position === 'admin' || user.position === 'superadmin') && <TechniciansLayer />}


            </MasterLayout>

        </>
    );
}

export default TechniciansPage