export const parseDate = (dateString) => {
    if (!dateString) return new Date();

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(`${dateString}T00:00:00`);
    }

    return new Date(dateString);
};
