import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from '@iconify/react/dist/iconify.js';
import axiosInstance from '../axiosConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Cookie from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const ProfilePageLayer = () => {
    const { user, loading, updateUser, setUser } = useAuth();
    const [imagePreview, setImagePreview] = useState(user?.photo || 'assets/images/user-grid/user-grid-img13.png');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        photo: user?.photo || ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    // Toggle function for password field
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // Toggle function for confirm password field
    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    // Validation functions
    const validatePhone = (phone) => {
        const phoneRegex = /^07[7-9]\d{7}$/;
        return phoneRegex.test(phone);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {
            name: '',
            email: '',
            phone: ''
        };

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone number must start with 07 followed by 7 or 8 or 9 and 7 digits';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create a preview URL for the image
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Changes',
            text: 'Are you sure you want to update your profile?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Determine the endpoint based on user position
            const endpoint = user?.position === 'admin' || user?.position === 'superadmin'
                ? `/admin/${user?.id}`
                : `/tech/${user?.id}`;

            // Create FormData object
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            
            // Add the file if it exists
            if (selectedFile) {
                formDataToSend.append('profilePic', selectedFile);
            }

            const response = await axiosInstance.put(endpoint, formDataToSend);
            
            if (response.data) {
                updateUser({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    photo: response.data.admin?.photo || response.data.tech?.photo || formData.photo
                });

                await Swal.fire({
                    title: 'Success!',
                    text: 'Your profile has been updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update profile',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const validatePassword = (password) => {
        // Password must be at least 8 characters long
        // and contain at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const validatePasswordForm = () => {
        const newErrors = {
            newPassword: '',
            confirmPassword: ''
        };

        // New password validation
        if (!passwordData.newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        } else if (!validatePassword(passwordData.newPassword)) {
            newErrors.newPassword = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }

        // Confirm password validation
        if (!passwordData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePasswordForm()) {
            return;
        }

        const result = await Swal.fire({
            title: 'Change Password',
            text: 'Are you sure you want to change your password? This will sign you out of all sessions.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!',
            cancelButtonText: 'No, cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Determine the endpoint based on user position
            const endpoint = user?.position === 'admin' || user?.position === 'superadmin'
                ? `/admin/update-password/${user?.id}`
                : `/tech/update-password/${user?.id}`;

            const response = await axiosInstance.put(endpoint, {
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            });
            
            if (response.data) {
                await Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK'
                });

                // Clear the token from cookies
                Cookie.remove('token');
                // Reset user state
                updateUser({
                    id: null,
                    position: null,
                    name: null,
                    email: null,
                    photo: null,
                    phone: null,
                    bio: null
                });
                // Navigate to sign in page
                navigate('/signin');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            await Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to change password',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row gy-4">
            <div className="col-lg-4">
                <div className="user-grid-card position-relative border radius-16 overflow-hidden bg-base h-100">
                    <img
                        src="assets/images/asset/test.jpeg"
                        alt=""
                        className="w-100 object-fit-cover"
                    />
                    <div className="pb-24 ms-16 mb-24 me-16  mt--100">
                        <div className="text-center border border-top-0 border-start-0 border-end-0">
                            <div className="w-120-px h-120-px rounded-circle overflow-hidden mb-16">
                                {loading ? (
                                    <div className="w-100 h-100 bg-neutral-200 animate-pulse" />
                                ) : (
                                    <img
                                        src={imagePreview}
                                        alt="Profile"
                                        className="w-100 h-100 object-fit-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=128`;
                                        }}
                                    />
                                )}
                            </div>
                            <h4 className="text-lg fw-semibold mb-4">
                                {loading ? (
                                    <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
                                ) : (
                                    user?.name || 'User'
                                )}
                            </h4>
                            <span className="text-secondary-light fw-medium">
                                {loading ? (
                                    <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                                ) : (
                                    user?.position || 'User'
                                )}
                            </span>
                        </div>
                        <div className="mt-24">
                            <h6 className="text-xl mb-16">Personal Info</h6>
                            <ul>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Full Name
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {loading ? (
                                            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                                        ) : (
                                            user?.name || 'Not set'
                                        )}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Email
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {loading ? (
                                            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                                        ) : (
                                            user?.email || 'Not set'
                                        )}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Phone
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {loading ? (
                                            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                                        ) : (
                                            user?.phone || 'Not set'
                                        )}
                                    </span>
                                </li>
                                <li className="d-flex align-items-center gap-1 mb-12">
                                    <span className="w-30 text-md fw-semibold text-primary-light">
                                        Position
                                    </span>
                                    <span className="w-70 text-secondary-light fw-medium">
                                        : {loading ? (
                                            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                                        ) : (
                                            user?.position || 'Not set'
                                        )}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-8">
                <div className="card h-100">
                    <div className="card-body p-24">
                        <ul
                            className="nav border-gradient-tab nav-pills mb-20 d-inline-flex"
                            id="pills-tab"
                            role="tablist"
                        >
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link d-flex align-items-center px-24 active"
                                    id="pills-edit-profile-tab"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-edit-profile"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-edit-profile"
                                    aria-selected="true"
                                >
                                    Edit Profile
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link d-flex align-items-center px-24"
                                    id="pills-change-passwork-tab"
                                    data-bs-toggle="pill"
                                    data-bs-target="#pills-change-passwork"
                                    type="button"
                                    role="tab"
                                    aria-controls="pills-change-passwork"
                                    aria-selected="false"
                                    tabIndex={-1}
                                >
                                    Change Password
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                            <div
                                className="tab-pane fade show active"
                                id="pills-edit-profile"
                                role="tabpanel"
                                aria-labelledby="pills-edit-profile-tab"
                                tabIndex={0}
                            >
                                <h6 className="text-md text-primary-light mb-16">Profile Image</h6>
                                {/* Upload Image Start */}
                                <div className="mb-24 mt-16">
                                    <div className="avatar-upload">
                                        <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept=".png, .jpg, .jpeg"
                                                hidden
                                                onChange={handleFileChange}
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                                            >
                                                <Icon icon="solar:camera-outline" className="icon"></Icon>
                                            </label>
                                        </div>
                                        <div className="avatar-preview">
                                            <div
                                                id="imagePreview"
                                                style={{
                                                    backgroundImage: `url(${imagePreview})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Upload Image End */}
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="mb-20">
                                                <label
                                                    htmlFor="name"
                                                    className="form-label fw-semibold text-primary-light text-sm mb-8"
                                                >
                                                    Full Name
                                                    <span className="text-danger-600">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control radius-8 ${errors.name ? 'is-invalid' : ''}`}
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Full Name"
                                                    required
                                                />
                                                {errors.name && (
                                                    <div className="invalid-feedback">
                                                        {errors.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-20">
                                                <label
                                                    htmlFor="email"
                                                    className="form-label fw-semibold text-primary-light text-sm mb-8"
                                                >
                                                    Email <span className="text-danger-600">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control radius-8 ${errors.email ? 'is-invalid' : ''}`}
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter email address"
                                                    required
                                                />
                                                {errors.email && (
                                                    <div className="invalid-feedback">
                                                        {errors.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="mb-20">
                                                <label
                                                    htmlFor="phone"
                                                    className="form-label fw-semibold text-primary-light text-sm mb-8"
                                                >
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    className={`form-control radius-8 ${errors.phone ? 'is-invalid' : ''}`}
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter phone number (e.g., 0771234567)"
                                                />
                                                {errors.phone && (
                                                    <div className="invalid-feedback">
                                                        {errors.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <button
                                            type="button"
                                            className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="tab-pane fade" id="pills-change-passwork" role="tabpanel" aria-labelledby="pills-change-passwork-tab" tabIndex="0">
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-20">
                                        <label htmlFor="newPassword" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            New Password <span className="text-danger-600">*</span>
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                type={passwordVisible ? "text" : "password"}
                                                className={`form-control radius-8 ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter New Password*"
                                            />
                                            <span
                                                className="toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                                                onClick={togglePasswordVisibility}
                                            >
                                                <Icon icon={passwordVisible ? 'mdi:eye-off' : 'mdi:eye'} />
                                            </span>
                                            {passwordErrors.newPassword && (
                                                <div className="invalid-feedback">
                                                    {passwordErrors.newPassword}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-20">
                                        <label htmlFor="confirmPassword" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Confirm Password <span className="text-danger-600">*</span>
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                type={confirmPasswordVisible ? "text" : "password"}
                                                className={`form-control radius-8 ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Confirm Password*"
                                            />
                                            <span
                                                className="toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
                                                onClick={toggleConfirmPasswordVisibility}
                                            >
                                                <Icon icon={confirmPasswordVisible ? 'mdi:eye-off' : 'mdi:eye'} />
                                            </span>
                                            {passwordErrors.confirmPassword && (
                                                <div className="invalid-feedback">
                                                    {passwordErrors.confirmPassword}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <button
                                            type="button"
                                            className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                                            onClick={() => {
                                                setPasswordData({
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                                setPasswordErrors({
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePageLayer;