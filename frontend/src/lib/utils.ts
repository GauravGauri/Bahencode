export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Clean uploads prefix if double prepended
  let cleanUrl = url;
  if (url.startsWith('/uploads/')) {
    cleanUrl = url;
  } else if (url.startsWith('uploads/')) {
    cleanUrl = `/${url}`;
  }
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const serverRoot = apiBaseUrl.replace(/\/api$/, '');
  return `${serverRoot}${cleanUrl}`;
};
