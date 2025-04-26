import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import ProfilePageLayer from '../components/ProfilePageLayer'
function ProfilePage() {
    return (
        <>
    
          {/* MasterLayout */}
          <MasterLayout>
    
            {/* Breadcrumb */}
            <Breadcrumb title="Profile Page" />
    
            <ProfilePageLayer />
    
          </MasterLayout>
    
        </>
      );
}

export default ProfilePage