function formatDate(date) {
    const value = date || new Date();
    const year = value.getFullYear();
    const month = value.getMonth() + 1;
    const day = value.getDate();
    const hours = value.getHours();
    const minutes = value.getMinutes();

    return `${year}${month < 10 ? `0${month}` : month}${day < 10 ? `0${day}` : day}${hours < 10 ? `0${hours}` : hours}${minutes < 10 ? `0${minutes}` : minutes}`;
}

module.exports = {
    formatDate,
};
