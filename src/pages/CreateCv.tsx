import { useState } from 'react';
import { api } from '../lib/api';

// A comprehensive Create CV form mapped to the backend payload
// Endpoint: POST /applicants/create

type StrNum = string | number;

type Applicant = {
  application_no: string;
  date: string; // yyyy-mm-dd
  full_name: string;
  photo?: string;
  passport_no?: string;
  passport_type?: string;
  place_of_issue?: string;
  place_of_birth?: string;
  date_of_issue?: string;
  date_of_expiry?: string;
  date_of_birth?: string;
  phone_no?: string;
  religion?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  qualification?: string;
  region?: string;
  city?: string;
  subcity_zone?: string;
  woreda?: string;
  house_no?: string;
};

type SponsorVisa = {
  visa_no?: string;
  sponsor_name?: string;
  sponsor_phone?: string;
  sponsor_address?: string;
  sponsor_arabic?: string;
  sponsor_id?: string;
  agent_no?: string;
  email?: string;
  file_no?: string;
  signed_on?: string;
  biometric_id?: string;
  contract_no?: string;
  sticker_visa_no?: string;
  current_nationality?: string;
  labor_id?: string;
  visa_type?: string;
};

type Relative = {
  relative_name?: string;
  relative_phone?: string;
  relative_kinship?: string;
  relative_region?: string;
  city?: string;
  subcity_zone?: string;
  woreda?: string;
  house_no?: string;
};

type OtherInformation = {
  contact_person?: string;
  contact_phone?: string;
  ccc_center_name?: string;
  certificate_no?: string;
  certified_date?: string;
  medical_place?: string;
  trip_photographs?: boolean;
  id_card?: boolean;
  relative_id_card?: boolean;
};

type SkillsExperience = {
  english?: string;
  arabic?: string;
  experience_abroad?: boolean;
  works_in?: string;
  salary?: StrNum;
  height?: StrNum;
  weight?: StrNum;
  reference_no?: string;
  no_of_children?: number;
  remarks?: string;
  ironing?: boolean;
  sewing?: boolean;
  baby_sitting?: boolean;
  old_care?: boolean;
  all_cooking?: boolean;
  cleaning?: boolean;
  washing?: boolean;
  cooking?: boolean;
};

type ApplicantSelection = {
  is_active: boolean;
  is_selected: boolean;
  selected_by: number | null;
};

export default function CreateCv() {
  const [applicant, setApplicant] = useState<Applicant>({
    application_no: '',
    date: '',
    full_name: '',
    passport_no: '',
    passport_type: '',
    place_of_issue: '',
    place_of_birth: '',
    date_of_issue: '',
    date_of_expiry: '',
    date_of_birth: '',
    phone_no: '',
    religion: '',
    gender: '',
    marital_status: '',
    occupation: '',
    qualification: '',
    region: '',
    city: '',
    subcity_zone: '',
    woreda: '',
    house_no: '',
  });

  const [sponsorVisa, setSponsorVisa] = useState<SponsorVisa>({});
  const [relative, setRelative] = useState<Relative>({});
  const [otherInformation, setOtherInformation] = useState<OtherInformation>({
    trip_photographs: false,
    id_card: false,
    relative_id_card: false,
  });
  const [skills, setSkills] = useState<SkillsExperience>({
    experience_abroad: false,
    ironing: false,
    sewing: false,
    baby_sitting: false,
    old_care: false,
    all_cooking: false,
    cleaning: false,
    washing: false,
    cooking: false,
  });
  const [selection, setSelection] = useState<ApplicantSelection>({
    is_active: true,
    is_selected: false,
    selected_by: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = <T extends object>(setter: (s: any) => void) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setter((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    if (!applicant.application_no || !applicant.date || !applicant.full_name) {
      return 'Application No, Date and Full Name are required.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      applicant,
      sponsor_visa: sponsorVisa,
      relative,
      other_information: otherInformation,
      skills_experience: {
        ...skills,
        // normalize numeric fields
        salary: normalizeNumber(skills.salary),
        height: normalizeNumber(skills.height),
        weight: normalizeNumber(skills.weight),
        no_of_children: toNumber(skills.no_of_children),
      },
      applicant_selection: selection,
    };

    setLoading(true);
    try {
      const res = await api.createApplicant(payload);
      const status = (res as any)?.status ?? 'success';
      const message = (res as any)?.message ?? 'CV created successfully!';
      if (status === 'success') {
        setSuccess(message);
        resetForm();
      } else {
        setError(message || 'Failed to create CV');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setApplicant({
      application_no: '',
      date: '',
      full_name: '',
      passport_no: '',
      passport_type: '',
      place_of_issue: '',
      place_of_birth: '',
      date_of_issue: '',
      date_of_expiry: '',
      date_of_birth: '',
      phone_no: '',
      religion: '',
      gender: '',
      marital_status: '',
      occupation: '',
      qualification: '',
      region: '',
      city: '',
      subcity_zone: '',
      woreda: '',
      house_no: '',
    });
    setSponsorVisa({});
    setRelative({});
    setOtherInformation({ trip_photographs: false, id_card: false, relative_id_card: false });
    setSkills({ experience_abroad: false, ironing: false, sewing: false, baby_sitting: false, old_care: false, all_cooking: false, cleaning: false, washing: false, cooking: false });
    setSelection({ is_active: true, is_selected: false, selected_by: null });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Cv</h1>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Applicant */}
        <Section title="Applicant">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Application No" name="application_no" value={applicant.application_no} onChange={handleChange(setApplicant)} required />
            <Input label="Date" name="date" type="date" value={applicant.date} onChange={handleChange(setApplicant)} required />
            <Input label="Full Name" name="full_name" value={applicant.full_name} onChange={handleChange(setApplicant)} required />
            <Input label="Phone No" name="phone_no" value={applicant.phone_no || ''} onChange={handleChange(setApplicant)} />
            <Input label="Gender" name="gender" value={applicant.gender || ''} onChange={handleChange(setApplicant)} />
            <Input label="Religion" name="religion" value={applicant.religion || ''} onChange={handleChange(setApplicant)} />
            <Input label="Marital Status" name="marital_status" value={applicant.marital_status || ''} onChange={handleChange(setApplicant)} />
            <Input label="Occupation" name="occupation" value={applicant.occupation || ''} onChange={handleChange(setApplicant)} />
            <Input label="Qualification" name="qualification" value={applicant.qualification || ''} onChange={handleChange(setApplicant)} />
            <Input label="Passport No" name="passport_no" value={applicant.passport_no || ''} onChange={handleChange(setApplicant)} />
            <Input label="Passport Type" name="passport_type" value={applicant.passport_type || ''} onChange={handleChange(setApplicant)} />
            <Input label="Place of Issue" name="place_of_issue" value={applicant.place_of_issue || ''} onChange={handleChange(setApplicant)} />
            <Input label="Place of Birth" name="place_of_birth" value={applicant.place_of_birth || ''} onChange={handleChange(setApplicant)} />
            <Input label="Date of Issue" name="date_of_issue" type="date" value={applicant.date_of_issue || ''} onChange={handleChange(setApplicant)} />
            <Input label="Date of Expiry" name="date_of_expiry" type="date" value={applicant.date_of_expiry || ''} onChange={handleChange(setApplicant)} />
            <Input label="Date of Birth" name="date_of_birth" type="date" value={applicant.date_of_birth || ''} onChange={handleChange(setApplicant)} />
            <Input label="Region" name="region" value={applicant.region || ''} onChange={handleChange(setApplicant)} />
            <Input label="City" name="city" value={applicant.city || ''} onChange={handleChange(setApplicant)} />
            <Input label="Subcity/Zone" name="subcity_zone" value={applicant.subcity_zone || ''} onChange={handleChange(setApplicant)} />
            <Input label="Woreda" name="woreda" value={applicant.woreda || ''} onChange={handleChange(setApplicant)} />
            <Input label="House No" name="house_no" value={applicant.house_no || ''} onChange={handleChange(setApplicant)} />
          </div>
        </Section>

        {/* Sponsor & Visa */}
        <Section title="Sponsor & Visa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Visa No" name="visa_no" value={sponsorVisa.visa_no || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Sponsor Name" name="sponsor_name" value={sponsorVisa.sponsor_name || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Sponsor Phone" name="sponsor_phone" value={sponsorVisa.sponsor_phone || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Sponsor Address" name="sponsor_address" value={sponsorVisa.sponsor_address || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Sponsor Arabic" name="sponsor_arabic" value={sponsorVisa.sponsor_arabic || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Sponsor ID" name="sponsor_id" value={sponsorVisa.sponsor_id || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Agent No" name="agent_no" value={sponsorVisa.agent_no || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Email" name="email" type="email" value={sponsorVisa.email || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="File No" name="file_no" value={sponsorVisa.file_no || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Signed On" name="signed_on" type="date" value={sponsorVisa.signed_on || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Biometric ID" name="biometric_id" value={sponsorVisa.biometric_id || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Contract No" name="contract_no" value={sponsorVisa.contract_no || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Sticker Visa No" name="sticker_visa_no" value={sponsorVisa.sticker_visa_no || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Current Nationality" name="current_nationality" value={sponsorVisa.current_nationality || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Labor ID" name="labor_id" value={sponsorVisa.labor_id || ''} onChange={handleChange(setSponsorVisa)} />
            <Input label="Visa Type" name="visa_type" value={sponsorVisa.visa_type || ''} onChange={handleChange(setSponsorVisa)} />
          </div>
        </Section>

        {/* Relative */}
        <Section title="Relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Relative Name" name="relative_name" value={relative.relative_name || ''} onChange={handleChange(setRelative)} />
            <Input label="Relative Phone" name="relative_phone" value={relative.relative_phone || ''} onChange={handleChange(setRelative)} />
            <Input label="Kinship" name="relative_kinship" value={relative.relative_kinship || ''} onChange={handleChange(setRelative)} />
            <Input label="Region" name="relative_region" value={relative.relative_region || ''} onChange={handleChange(setRelative)} />
            <Input label="City" name="city" value={relative.city || ''} onChange={handleChange(setRelative)} />
            <Input label="Subcity/Zone" name="subcity_zone" value={relative.subcity_zone || ''} onChange={handleChange(setRelative)} />
            <Input label="Woreda" name="woreda" value={relative.woreda || ''} onChange={handleChange(setRelative)} />
            <Input label="House No" name="house_no" value={relative.house_no || ''} onChange={handleChange(setRelative)} />
          </div>
        </Section>

        {/* Other Information */}
        <Section title="Other Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Contact Person" name="contact_person" value={otherInformation.contact_person || ''} onChange={handleChange(setOtherInformation)} />
            <Input label="Contact Phone" name="contact_phone" value={otherInformation.contact_phone || ''} onChange={handleChange(setOtherInformation)} />
            <Input label="CCC Center Name" name="ccc_center_name" value={otherInformation.ccc_center_name || ''} onChange={handleChange(setOtherInformation)} />
            <Input label="Certificate No" name="certificate_no" value={otherInformation.certificate_no || ''} onChange={handleChange(setOtherInformation)} />
            <Input label="Certified Date" name="certified_date" type="date" value={otherInformation.certified_date || ''} onChange={handleChange(setOtherInformation)} />
            <Input label="Medical Place" name="medical_place" value={otherInformation.medical_place || ''} onChange={handleChange(setOtherInformation)} />
            <Checkbox label="Trip Photographs" name="trip_photographs" checked={!!otherInformation.trip_photographs} onChange={handleChange(setOtherInformation)} />
            <Checkbox label="ID Card" name="id_card" checked={!!otherInformation.id_card} onChange={handleChange(setOtherInformation)} />
            <Checkbox label="Relative ID Card" name="relative_id_card" checked={!!otherInformation.relative_id_card} onChange={handleChange(setOtherInformation)} />
          </div>
        </Section>

        {/* Skills & Experience */}
        <Section title="Skills & Experience">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="English" name="english" value={skills.english || ''} onChange={handleChange(setSkills)} />
            <Input label="Arabic" name="arabic" value={skills.arabic || ''} onChange={handleChange(setSkills)} />
            <Checkbox label="Experience Abroad" name="experience_abroad" checked={!!skills.experience_abroad} onChange={handleChange(setSkills)} />
            <Input label="Works In" name="works_in" value={skills.works_in || ''} onChange={handleChange(setSkills)} />
            <Input label="Salary" name="salary" type="number" value={String(skills.salary ?? '')} onChange={handleChange(setSkills)} />
            <Input label="Height (cm)" name="height" type="number" value={String(skills.height ?? '')} onChange={handleChange(setSkills)} />
            <Input label="Weight (kg)" name="weight" type="number" value={String(skills.weight ?? '')} onChange={handleChange(setSkills)} />
            <Input label="Reference No" name="reference_no" value={skills.reference_no || ''} onChange={handleChange(setSkills)} />
            <Input label="No. of Children" name="no_of_children" type="number" value={String(skills.no_of_children ?? '')} onChange={handleChange(setSkills)} />
            <TextArea label="Remarks" name="remarks" value={skills.remarks || ''} onChange={handleChange(setSkills)} />
            <Checkbox label="Ironing" name="ironing" checked={!!skills.ironing} onChange={handleChange(setSkills)} />
            <Checkbox label="Sewing" name="sewing" checked={!!skills.sewing} onChange={handleChange(setSkills)} />
            <Checkbox label="Baby Sitting" name="baby_sitting" checked={!!skills.baby_sitting} onChange={handleChange(setSkills)} />
            <Checkbox label="Old Care" name="old_care" checked={!!skills.old_care} onChange={handleChange(setSkills)} />
            <Checkbox label="All Cooking" name="all_cooking" checked={!!skills.all_cooking} onChange={handleChange(setSkills)} />
            <Checkbox label="Cleaning" name="cleaning" checked={!!skills.cleaning} onChange={handleChange(setSkills)} />
            <Checkbox label="Washing" name="washing" checked={!!skills.washing} onChange={handleChange(setSkills)} />
            <Checkbox label="Cooking" name="cooking" checked={!!skills.cooking} onChange={handleChange(setSkills)} />
          </div>
        </Section>

        {/* Selection */}
        <Section title="Selection">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox label="Active" name="is_active" checked={selection.is_active} onChange={handleChange(setSelection)} />
            <Checkbox label="Selected" name="is_selected" checked={selection.is_selected} onChange={handleChange(setSelection)} />
          </div>
        </Section>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Create CV'}
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            onClick={resetForm}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded shadow p-6">
      <h2 className="font-semibold text-lg mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Input({ label, name, value, onChange, type = 'text', required = false }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}{required ? ' *' : ''}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded px-3 py-2"
      />
    </label>
  );
}

function TextArea({ label, name, value, onChange }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full border rounded px-3 py-2"
      />
    </label>
  );
}

function Checkbox({ label, name, checked, onChange }: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<any>) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 select-none">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function toNumber(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeNumber(v: any): string | number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : String(v);
}
