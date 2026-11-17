export interface ComplianceDoc {
  id: 'terms' | 'dpdp' | 'prohibited' | 'grievance';
  title: string;
  badge: string;
  lastUpdated: string;
  content: {
    heading: string;
    text: string;
    bulletPoints?: string[];
  }[];
}

export const COMPLIANCE_DOCS: Record<string, ComplianceDoc> = {
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    badge: 'Indian E-Commerce Rules, 2020',
    lastUpdated: '15th November 2026',
    content: [
      {
        heading: '1. Introduction & Acceptance',
        text: 'RIO by Vink (Resell It Online) operates as an intermediary marketplace connecting individual buyers and sellers across Indian cities under the Information Technology Act, 2000.',
      },
      {
        heading: '2. User Eligibility & KYC Verification',
        text: 'Users must be at least 18 years of age. All sellers listing high-value items (such as electronics and vehicles) are required to verify their mobile numbers via OTP and verify identity via DigiLocker / Aadhaar verification.',
      },
      {
        heading: '3. Listings & Fair Marketplace Conduct',
        text: 'Sellers must ensure their listings are authentic, physically owned, accurately described with genuine photos, and priced in Indian Rupees (₹).',
        bulletPoints: [
          'No deceptive pricing or hidden charges.',
          'Sellers must physically possess the goods offered for sale.',
          'Face-to-face transactions in safe public zones or verified escrow hubs are recommended.',
        ],
      },
      {
        heading: '4. Limitation of Intermediary Liability',
        text: 'RIO functions solely as an intermediary under Section 79 of the Information Technology Act, 2000. RIO is not party to private sales agreements between buyers and sellers.',
      },
    ],
  },
  dpdp: {
    id: 'dpdp',
    title: 'DPDP Privacy Policy',
    badge: 'Digital Personal Data Protection Act, 2023',
    lastUpdated: '10th November 2026',
    content: [
      {
        heading: '1. Data Fiduciary Commitment',
        text: 'Vink Technologies Pvt. Ltd. acts as the Data Fiduciary under the Digital Personal Data Protection Act (DPDPA), 2023. We collect only necessary personal data with your explicit notice and verifiable consent.',
      },
      {
        heading: '2. Personal Data Collected & Purpose',
        text: 'We collect your name, mobile phone number, locality/GPS location (for radius filtering), device identifiers, and chat messages strictly for facilitating peer-to-peer buying and selling.',
        bulletPoints: [
          'Location data is masked to general neighborhood radii (e.g. 5 km) and exact home coordinates are never publicly shown.',
          'Mobile numbers are masked using virtual relay numbers unless you explicitly share your contact in chat.',
          'Data is processed on secure servers located within the Republic of India in compliance with data residency norms.',
        ],
      },
      {
        heading: '3. Data Principal Rights',
        text: 'You have the right to access a summary of your personal data, request correction or erasure of old listings, and withdraw consent at any time from your Profile settings.',
      },
    ],
  },
  prohibited: {
    id: 'prohibited',
    title: 'Prohibited Items List',
    badge: 'Banned & Regulated Goods',
    lastUpdated: '1st November 2026',
    content: [
      {
        heading: 'Strict Zero-Tolerance Items',
        text: 'Listing or attempting to transact any of the following items on RIO is strictly illegal and will result in immediate account termination and reporting to Indian law enforcement authorities:',
        bulletPoints: [
          'Firearms, weapons, knives, ammunition, and explosive materials.',
          'Narcotics, psychotropic substances, and prescription drugs regulated under the Drugs and Cosmetics Act.',
          'Wildlife, ivory, endangered animal parts under the Wildlife Protection Act, 1972.',
          'Counterfeit goods, replicas, fake currency, or stolen property.',
          'Adult content, obscene materials, and pirated media.',
          'Hazardous chemicals, uncertified lithium cells, and fireworks.',
        ],
      },
    ],
  },
  grievance: {
    id: 'grievance',
    title: 'Grievance Redressal Officer',
    badge: 'Statutory Compliance Rule 3(2)',
    lastUpdated: '15th November 2026',
    content: [
      {
        heading: 'Grievance Officer Contact Details',
        text: 'In accordance with Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, the contact details of the Grievance Redressal Officer are provided below:',
        bulletPoints: [
          'Officer Name: Rajesh Varma K.',
          'Designation: Principal Nodal Grievance Officer',
          'Company: Vink Technologies Pvt. Ltd.',
          'Office Address: D.No 48-12-3, Dwaraka Nagar 3rd Lane, Visakhapatnam, Andhra Pradesh — 530016, India',
          'Official Email: grievance@rio-vink.in / rajesh.varma@vink.in',
          'Helpline (10:00 AM - 6:00 PM IST, Mon-Sat): +91 891 2548900',
        ],
      },
      {
        heading: 'Grievance Redressal Timeline',
        text: 'We acknowledge every grievance ticket within 24 hours of receipt and provide complete investigation and resolution within 15 working days as mandated by Indian Law.',
      },
    ],
  },
};

