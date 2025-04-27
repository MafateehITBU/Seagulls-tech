import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AdminsLayer from '../components/AdminsLayer'
import { useAuth } from '../context/AuthContext';

function AdminsPage() {
    const { user } = useAuth();
    return (
        <>

            {/* MasterLayout */}
            <MasterLayout>

                {/* Breadcrumb */}
                <Breadcrumb title="Admins" />


                {(user.position === 'superadmin') && <AdminsLayer />}


            </MasterLayout>

        </>
    );
}

export default AdminsPage