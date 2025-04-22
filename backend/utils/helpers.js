const helpers = {
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    validatePhone: (phone) => {
        const re = /^07[789]\d{7}$/;
        return re.test(phone);
    },
    validatePassword: (password) => {
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    },
    validateDOB: (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        return age >= 18 || (age === 18 && m >= 0);
    },

    validateCoordinates: (coordinates) => {
        const { lat, long } = coordinates;
        if (typeof lat !== 'number' || typeof long !== 'number') {
            return "Coordinates must be numbers";
        }
        if (lat < -90 || lat > 90 || long < -180 || long > 180) {
            return "Coordinates are out of range";
        }
        return true;
    },

    validateInstallationDate: (installationDate) => {
        const date = new Date(installationDate);
        if (isNaN(date)) {
            return "Invalid installation date";
        }
        return true;
    },

    validateAssetStatus: (status) => {
        const validStatuses = ['Active', 'Inactive'];
        if (!validStatuses.includes(status)) {
            return "Invalid asset status";
        }
        return true;
    },

    validateQuantity: (quantity) => {
        if (quantity < 1) {
            return "Quantity must be greater than 0";
        }
        return true;
    },
};

export default helpers;
