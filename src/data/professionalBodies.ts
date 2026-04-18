export interface ProfessionalBody {
  name: string;
  email: string;
  phone?: string;
  country: string;
  professions: string[];
  website?: string;
  description?: string;
}

export const PROFESSIONAL_BODIES: ProfessionalBody[] = [
  // NIGERIA
  {
    name: 'Nursing and Midwifery Council of Nigeria (NMCN)',
    email: 'info@nmcn.gov.ng',
    phone: '07029234588, 08150837364',
    country: 'Nigeria',
    professions: ['Nurse', 'Midwife'],
    website: 'https://licence.nmcn.gov.ng'
  },
  {
    name: 'Medical and Dental Council of Nigeria (MDCN)',
    email: 'info@mdcnigeria.org',
    country: 'Nigeria',
    professions: ['Doctor', 'Dentist'],
    website: 'https://portal.mdcn.gov.ng'
  },
  {
    name: 'Medical Laboratory Science Council of Nigeria (MLSCN)',
    email: 'info@mlscn.gov.ng',
    country: 'Nigeria',
    professions: ['Medical Lab Scientist'],
    website: 'https://mlscn.gov.ng'
  },
  {
    name: 'Radiographers Registration Board of Nigeria (RRBN)',
    email: 'info@rrbn.gov.ng',
    phone: '+23492914928',
    country: 'Nigeria',
    professions: ['Radiographer'],
    website: 'https://rrbn.gov.ng'
  },
  {
    name: 'Pharmacists Council of Nigeria (PCN)',
    email: 'registrar@pcn.gov.ng',
    country: 'Nigeria',
    professions: ['Pharmacist'],
    website: 'https://pcn.gov.ng'
  },

  // UNITED KINGDOM
  {
    name: 'General Medical Council (GMC)',
    email: 'gmc@gmc-uk.org',
    country: 'United Kingdom',
    professions: ['Doctor'],
    website: 'https://www.gmc-uk.org/registration-and-licensing/the-medical-register'
  },
  {
    name: 'Health and Care Professions Council (HCPC)',
    email: 'partners@hcpc-uk.org',
    country: 'United Kingdom',
    professions: ['Radiographer', 'Physiotherapist', 'Occupational Therapist', 'Paramedic'],
    website: 'https://www.hcpc-uk.org/check-the-register/'
  },
  {
    name: 'Nursing and Midwifery Council (NMC)',
    email: 'UKenquiries@nmc-uk.org',
    country: 'United Kingdom',
    professions: ['Nurse', 'Midwife'],
    website: 'https://www.nmc.org.uk/registration/search-the-register/'
  },
  {
    name: 'General Pharmaceutical Council (GPhC)',
    email: 'info@pharmacyregulation.org',
    phone: '020 3713 8000',
    country: 'United Kingdom',
    professions: ['Pharmacist', 'Pharmacy Technician'],
    website: 'https://www.pharmacyregulation.org/registers'
  },

  // USA
  {
    name: 'American Medical Association (AMA)',
    email: 'Msc@ama-assn.org',
    country: 'United States',
    professions: ['Doctor'],
    website: 'https://www.ama-assn.org/'
  },
  {
    name: 'Association of Surgical Technologists (AST)',
    email: 'memserv@ast.org',
    country: 'United States',
    professions: ['Surgical Technologist'],
    website: 'https://www.ast.org/'
  },
  {
    name: 'American Physical Therapy Association (APTA)',
    email: 'kgarceau@aptany.org',
    country: 'United States',
    professions: ['Physical Therapist'],
    website: 'https://www.apta.org/'
  },

  // CANADA
  {
    name: 'College of Dental Hygienists of Ontario (CDHO)',
    email: 'info@cdho.org',
    country: 'Canada',
    professions: ['Dental Hygienist'],
    website: 'https://www.cdho.org/'
  },
  {
    name: 'Medical Council of Canada (MCC)',
    email: 'service@mcc.ca',
    country: 'Canada',
    professions: ['Doctor'],
    website: 'https://mcc.ca/'
  },

  // CHINA
  {
    name: 'Chinese Medical Association (CMA)',
    email: 'intl@cma.org.cn',
    country: 'China',
    professions: ['Doctor'],
    website: 'https://www.cma.org.cn/'
  },

  // INDIA
  {
    name: 'India Medical Association (IMA)',
    email: 'hsg@ima-india.org',
    country: 'India',
    professions: ['Doctor'],
    website: 'https://www.ima-india.org/'
  },
  {
    name: 'Indian Nursing Council (INC)',
    email: 'nodalofficer.inc@gov.in',
    country: 'India',
    professions: ['Nurse'],
    website: 'https://www.indiannursingcouncil.org/'
  },
  {
    name: 'Pharmacy Council of India (PCI)',
    email: 'registrar@pci.nic.in',
    country: 'India',
    professions: ['Pharmacist'],
    website: 'https://www.pci.nic.in/'
  }
];
