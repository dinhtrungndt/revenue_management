// Hàm chuyển đổi đối tượng Date thành chuỗi ngày tháng định dạng yyyy-MM-dd
export const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Hàm chuyển đổi chuỗi ngày tháng định dạng yyyy-MM-dd thành đối tượng Date
  export const parseYYYYMMDDToDate = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Hàm định dạng ngày tháng theo locale
  export const formatDateToLocale = (date, locale = 'vi-VN') => {
    if (!date) return '';

    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Hàm định dạng ngày tháng và giờ phút
  export const formatDateTime = (date, locale = 'vi-VN') => {
    if (!date) return '';

    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm lấy tháng và năm từ đối tượng Date
  export const getMonthAndYear = (date) => {
    if (!date) return '';

    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // Hàm lấy ngày đầu tiên của tháng
  export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1);
  };

  // Hàm lấy ngày cuối cùng của tháng
  export const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0);
  };

  // Hàm lấy ngày đầu tiên của tuần
  export const getFirstDayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi ngày là Chủ nhật
    return new Date(d.setDate(diff));
  };

  // Hàm lấy ngày cuối cùng của tuần
  export const getLastDayOfWeek = (date) => {
    const firstDay = getFirstDayOfWeek(date);
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    return lastDay;
  };