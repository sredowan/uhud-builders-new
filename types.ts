export interface UnitConfig {
  name: string;
  size: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  features: string[];
  floorPlanImage?: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  price?: string;
  description: string;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  imageUrl: string;
  logoUrl?: string;
  units: UnitConfig[];
  buildingAmenities: string[];
  order?: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string; // ISO String
  read: boolean;
}

export interface SiteSettings {
  headerLogo?: string;
  footerLogo?: string;
  contact: {
    phone: string;
    whatsapp?: string;
    email: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  content: {
    aboutUsShort: string;
    aboutUsFull: string;
    privacyPolicy: string;
    termsOfService: string;
  };
  homePage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    showWhyChooseUs: boolean;
  };
  analytics: {
    googleSearchConsole?: string;
    facebookPixel?: string;
  };
  seo: {
    siteTitle?: string;
    metaDescription?: string;
    favicon?: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}