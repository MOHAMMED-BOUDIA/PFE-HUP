/**
 * Utility helper functions for NAJAH
 */

/**
 * Format date string into human-readable format
 * @param {string|Date} dateVal - Date input
 * @returns {string} Formatted date (e.g. 'Oct 24, 2026')
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Get color scheme mapping for different statuses
 * @param {string} status - status code
 * @returns {object} Object with tailwind background, text, and border classes
 */
export const getStatusColorClasses = (status) => {
  const normalized = (status || '').toLowerCase().trim();
  switch (normalized) {
    case 'pending':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/40',
      };
    case 'approved':
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/20',
        text: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-200 dark:border-sky-800/40',
      };
    case 'in-progress':
    case 'in_progress':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800/40',
      };
    case 'completed':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/40',
      };
    case 'rejected':
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800/40',
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/60',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
      };
  }
};

/**
 * Get initials of a name
 * @param {string} name - full name
 * @returns {string} Initials (e.g. 'JD')
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate a string to a certain limit and append ellipsis
 * @param {string} str - target string
 * @param {number} limit - character limit
 * @returns {string} Truncated string
 */
export const truncateString = (str, limit = 100) => {
  if (!str) return '';
  if (str.length <= limit) return str;
  return str.substring(0, limit) + '...';
};
