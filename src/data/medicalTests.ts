export interface MedicalTest {
  id: string;
  name: string;
  subTests?: MedicalTest[];
}

export const MEDICAL_TESTS: MedicalTest[] = [
  {
    id: 'radiology',
    name: 'Radiology',
    subTests: [
      { id: 'ct', name: 'CT Scan' },
      { id: 'mri', name: 'MRI' },
      { id: 'xray', name: 'X-Ray' },
      {
        id: 'ultrasound',
        name: 'Ultrasound',
        subTests: [
          { id: 'abdominal', name: 'Abdominal Scan' },
          { id: 'pelvic', name: 'Pelvic Scan' },
          { id: 'obstetric', name: 'Obstetric Scan' },
          { id: 'thyroid', name: 'Thyroid Scan' },
          { id: 'breast', name: 'Breast Scan' },
          { id: 'transvaginal', name: 'Transvaginal Scan' },
          { id: 'follicular_tracking', name: 'Follicular Tracking' },
          { id: 'doppler', name: 'Doppler Ultrasound' },
        ]
      },
      { id: 'ecg', name: 'ECG' },
      { id: 'mammography', name: 'Mammography' },
      { id: 'fluoroscopy', name: 'Fluoroscopy' },
      { id: 'dexa', name: 'DEXA Scan' },
    ]
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry',
    subTests: [
      { id: 'glucose', name: 'Blood Glucose' },
      { id: 'lft', name: 'Liver Function Test' },
      { id: 'kft', name: 'Kidney Function Test' },
      { id: 'lipid', name: 'Lipid Profile' },
      { id: 'hba1c', name: 'HbA1c' },
      { id: 'electrolytes', name: 'Electrolytes' },
      { id: 'tft', name: 'Thyroid Function Test' },
      { id: 'crp', name: 'C-Reactive Protein' },
    ]
  },
  {
    id: 'hematology',
    name: 'Hematology',
    subTests: [
      { id: 'fbc', name: 'Full Blood Count' },
      { id: 'esr', name: 'ESR' },
      { id: 'blood_group', name: 'Blood Grouping' },
      { id: 'genotype', name: 'Genotype' },
      { id: 'coagulation', name: 'Coagulation Profile' },
      { id: 'malaria', name: 'Malaria Parasite' },
    ]
  },
  {
    id: 'microbiology',
    name: 'Microbiology',
    subTests: [
      { id: 'urinalysis', name: 'Urinalysis' },
      { id: 'stool_analysis', name: 'Stool Analysis' },
      { id: 'mcs', name: 'Microscopy, Culture & Sensitivity' },
      { id: 'h_pylori', name: 'H. Pylori Test' },
      { id: 'hiv', name: 'HIV Screening' },
      { id: 'hepatitis', name: 'Hepatitis Screening' },
    ]
  },
  {
    id: 'pathology',
    name: 'Pathology',
    subTests: [
      { id: 'biopsy', name: 'Biopsy' },
      { id: 'pap_smear', name: 'Pap Smear' },
      { id: 'fnac', name: 'Fine Needle Aspiration Cytology' },
      { id: 'histopathology', name: 'Histopathology' },
    ]
  }
];

export const TREATMENT_PLAN_TYPES = [
  { id: 'pharmacy', name: 'Pharmacy' },
  { id: 'chemotherapy', name: 'Chemotherapy Center' },
  { id: 'immunotherapy', name: 'Immunotherapy Center' },
  { id: 'rehabilitation', name: 'Rehabilitation Center' },
  { id: 'hemodialysis', name: 'Hemodialysis' },
  { id: 'neurology', name: 'Neurology' },
  { id: 'surgery', name: 'Surgery' },
];

export const IMAGE_DELIVERY_METHODS = [
  { id: 'iep', name: 'Image Export Portal (IEP)' },
  { id: 'syngovia', name: 'SyngoVia' },
  { id: 'onis', name: 'Onis' },
  { id: 'pacs', name: 'PACS/DICOM' },
  { id: 'secured_email', name: 'Secured Email' },
];
