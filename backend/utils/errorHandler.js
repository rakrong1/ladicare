// utils/errorHandler.js
const handleError = (res, error, message = 'Server error') => {
  console.error(error);
  res.status(500).json({ success: false, message });
};

// eslint-disable-next-line eol-last
export default handleError;