export const shoeImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80"
];

const API_ORIGIN = "http://localhost:8080";
const productPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'%3E%3Crect width='600' height='450' fill='%23f4f4f5'/%3E%3Cpath d='M164 278c56 18 124 20 203 8 34-5 62-11 86-4 17 5 28 20 23 36-5 18-24 28-55 30H190c-46 0-78-12-95-35-8-11-4-27 8-34 15-9 35-8 61-1Z' fill='%23d4d4d8'/%3E%3Cpath d='M209 242c43 30 101 43 174 38 20-2 46-4 70 2-27-20-66-28-116-23-47 4-89-4-128-17Z' fill='%23a1a1aa'/%3E%3Ctext x='300' y='382' text-anchor='middle' font-family='Arial, sans-serif' font-size='22' fill='%2371717a'%3EChua co hinh anh%3C/text%3E%3C/svg%3E";

export const normalizeImageUrl = (url?: string) => {
  const value = url?.split(",")[0]?.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }
  if (value.startsWith("/uploads/")) {
    return `${API_ORIGIN}${value}`;
  }
  return value;
};

export const splitProductImages = (imageUrl?: string, thumbnailUrl?: string) => {
  const source = imageUrl || thumbnailUrl || "";
  return source
    .split(",")
    .map((url) => normalizeImageUrl(url))
    .filter(Boolean);
};

export const getProductImage = (id?: any, imageUrl?: string, thumbnailUrl?: string) => {
  return splitProductImages(imageUrl, thumbnailUrl)[0] || productPlaceholder;
};

export const getProductImages = (id?: any, imageUrl?: string, thumbnailUrl?: string) => {
  const urls = splitProductImages(imageUrl, thumbnailUrl);
  return urls.length > 0 ? urls : [productPlaceholder];
};


export const heroShoeImage =
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1600&q=80";
