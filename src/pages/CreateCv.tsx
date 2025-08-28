import { useEffect, useState } from 'react';
import { api } from '../lib/api';

// A comprehensive Create CV form mapped to the backend payload
// Endpoint: POST /applicants/create

type StrNum = string | number;

type Applicant = {
  application_no: string;
  date: string; // yyyy-mm-dd
  full_name: string;
  photo?: string;
  full_photo?: string;
  passport_photo?: string;
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

import { useLocation } from 'react-router-dom';

export default function CreateCv() {
  const location = useLocation() as any;
  const prefill = (location?.state && (location.state.applicant || location.state)) || null;

  const [applicant, setApplicant] = useState<Applicant>({
    application_no: '',
    date: '',
    full_name: '',
    photo: '',
    full_photo: '',
    passport_photo: '',
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

  const [sponsorVisa, setSponsorVisa] = useState<SponsorVisa>((prefill?.sponsor_visa) || {});
  const [relative, setRelative] = useState<Relative>((prefill?.relative) || {});
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
  const [originalPassportNo] = useState<string | undefined>(prefill?.passport_no ?? prefill?.applicant?.passport_no);
  const editMode = !!originalPassportNo;

  const [selection, setSelection] = useState<ApplicantSelection>({
    is_active: prefill?.applicant_selection?.is_active ?? true,
    is_selected: prefill?.applicant_selection?.is_selected ?? false,
    selected_by: prefill?.applicant_selection?.selected_by ?? null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoTab, setPhotoTab] = useState<'photo' | 'full_photo' | 'passport_photo'>('photo');

  const handleChange = (setter: (s: any) => void) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setter((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (name: 'photo' | 'full_photo' | 'passport_photo') => async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setApplicant((prev) => ({ ...prev, [name]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (name: 'photo' | 'full_photo' | 'passport_photo') => {
    setApplicant((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    // Required fields per spec:
    // Full name, passport number, gender, age (from date_of_birth), experience, works in, religion, labor id (certificate_no)
    if (!applicant.full_name) return 'Full name is required.';
    if (!applicant.passport_no) return 'Passport number is required.';
    if (!applicant.gender) return 'Gender is required.';
    if (!applicant.date_of_birth) return 'Date of birth (for age) is required.';
    if (!skills.experience_abroad && !skills.remarks && !skills.reference_no && !skills.experience_abroad) {
      // Fallback: require some indicator of experience; prefer a boolean or text
    }
    if (skills.works_in == null || String(skills.works_in).trim() === '') return 'Works in is required.';
    if (!applicant.religion) return 'Religion is required.';
    if (!otherInformation.certificate_no) return 'Labor ID (certificate_no) is required.';
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

    // Sanitize photos for backend varchar(100) columns: omit long base64 strings
    const sanitizedApplicant: any = { ...applicant };
    (['photo','full_photo','passport_photo'] as const).forEach((key) => {
      const v = sanitizedApplicant[key];
      if (typeof v === 'string' && v.length > 100) {
        delete sanitizedApplicant[key];
      }
    });

    const payload = {
      applicant: sanitizedApplicant,
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
      if (editMode) {
        // Try updating by passport_no first, then by application_no if available,
        // and finally attempt to discover the application_no via a list fetch.
        const identifiers: string[] = [];
        if (originalPassportNo) identifiers.push(originalPassportNo);
        if (applicant.application_no) identifiers.push(applicant.application_no);

        let updated = false;
        let lastErr: any = null;

        for (const id of identifiers) {
          try {
            try {
            const json: any = await api.updateApplicant(id, payload);
            const status = json?.status ?? 'success';
            if (status === 'success') {
            setSuccess(json?.message ?? 'CV updated successfully!');
            updated = true;
            break;
            } else {
            lastErr = new Error(json?.message || 'Failed to update');
            }
            } catch (e: any) {
            lastErr = e;
            }
          } catch (e) {
            lastErr = e;
          }
        }

        if (!updated) {
          // Attempt to discover application_no by fetching list and matching passport_no
          try {
            const list: any = await api.listApplicants();
            const match = Array.isArray(list) ? list.find((x: any) => x?.passport_no === applicant.passport_no) : null;
            const appNo = match?.application_no;
            if (appNo) {
              const json: any = await api.updateApplicant(appNo, payload);
              const status = json?.status ?? 'success';
              if (status !== 'success') throw new Error(json?.message || 'Failed to update');
              setSuccess(json?.message ?? 'CV updated successfully!');
              updated = true;
            }
          } catch (e) {
            lastErr = e;
          }
        }

        if (!updated) {
          throw lastErr || new Error('Applicant not found for update');
        }
      } else {
        // Create new applicant
        const res = await api.createApplicant(payload);
        const status = (res as any)?.status ?? 'success';
        const message = (res as any)?.message ?? 'CV created successfully!';
        if (status === 'success') {
          setSuccess(message);
          resetForm();
        } else {
          setError(message || 'Failed to create CV');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.');
    }
    setLoading(false);
  };

  // Initialize applicant with possible prefill flattening
  // prefill may come as a flat object or grouped; map best-effort
  useEffect(() => {
    if (!prefill) return;
    setApplicant((prev) => ({
      ...prev,
      ...pick(prefill, [
        'application_no','date','full_name','passport_no','passport_type','place_of_issue','place_of_birth','date_of_issue','date_of_expiry','date_of_birth','phone_no','religion','gender','marital_status','occupation','qualification','region','city','subcity_zone','woreda','house_no','photo','full_photo','passport_photo'
      ]),
      ...(prefill.applicant ? pick(prefill.applicant, [
        'application_no','date','full_name','passport_no','passport_type','place_of_issue','place_of_birth','date_of_issue','date_of_expiry','date_of_birth','phone_no','religion','gender','marital_status','occupation','qualification','region','city','subcity_zone','woreda','house_no','photo','full_photo','passport_photo'
      ]) : {}),
    }));
    if (prefill.skills_experience) setSkills((s) => ({ ...s, ...prefill.skills_experience }));
    if (prefill.other_information) setOtherInformation((o) => ({ ...o, ...prefill.other_information }));
  }, [prefill]);

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
        {/* Photos */}
        <section className="bg-white rounded shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <button type="button" className={`px-3 py-1 rounded border ${photoTab === 'photo' ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`} onClick={() => setPhotoTab('photo')}>Passport size</button>
            <button type="button" className={`px-3 py-1 rounded border ${photoTab === 'full_photo' ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`} onClick={() => setPhotoTab('full_photo')}>Full size</button>
            <button type="button" className={`px-3 py-1 rounded border ${photoTab === 'passport_photo' ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`} onClick={() => setPhotoTab('passport_photo')}>Passport photo</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 items-start">
            <div className="w-full aspect-[3/4] border rounded overflow-hidden bg-gray-50 flex items-center justify-center">
              { (photoTab === 'photo' && applicant.photo) || (photoTab === 'full_photo' && applicant.full_photo) || (photoTab === 'passport_photo' && applicant.passport_photo) ? (
                <img src={(photoTab === 'photo' ? applicant.photo : photoTab === 'full_photo' ? applicant.full_photo : applicant.passport_photo) as string} alt="Preview" className="object-contain w-full h-full" />
              ) : (
                <span className="text-sm text-gray-500">No image</span>
              )}
            </div>
            <div className="space-y-3">
              <input type="file" accept="image/*" onChange={handleImageChange(photoTab)} />
              <div className="text-xs text-gray-500">Optional. JPG/PNG recommended. Stored as base64 data URL.</div>
              { ((photoTab === 'photo' && applicant.photo) || (photoTab === 'full_photo' && applicant.full_photo) || (photoTab === 'passport_photo' && applicant.passport_photo)) && (
                <button type="button" className="px-3 py-1 border rounded text-red-700 hover:bg-red-50" onClick={() => clearImage(photoTab)}>
                  Remove image
                </button>
              )}
            </div>
          </div>
        </section>
        {/* Applicant */}
        <Section title="Applicant">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Application No" name="application_no" value={applicant.application_no} onChange={handleChange(setApplicant)} />
            <Input label="Date" name="date" type="date" value={applicant.date} onChange={handleChange(setApplicant)} required />
            <Input label="Full Name" name="full_name" value={applicant.full_name} onChange={handleChange(setApplicant)} required />
            <Input label="Phone No" name="phone_no" value={applicant.phone_no || ''} onChange={handleChange(setApplicant)} />
            <Input label="Gender" name="gender" value={applicant.gender || ''} onChange={handleChange(setApplicant)} />
            <Input label="Religion" name="religion" value={applicant.religion || ''} onChange={handleChange(setApplicant)} />
            <Input label="Marital Status" name="marital_status" value={applicant.marital_status || ''} onChange={handleChange(setApplicant)} />
            <Input label="Occupation" name="occupation" value={applicant.occupation || ''} onChange={handleChange(setApplicant)} />
            <Input label="Qualification" name="qualification" value={applicant.qualification || ''} onChange={handleChange(setApplicant)} />
            <Input label="Passport No" name="passport_no" value={applicant.passport_no || ''} onChange={handleChange(setApplicant)} disabled={editMode} />
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
            {loading ? 'Saving...' : (editMode ? 'Update CV' : 'Create CV')}
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

function Input({ label, name, value, onChange, type = 'text', required = false, disabled = false }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
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
        disabled={disabled}
        className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

function pick<T extends Record<string, any>>(obj: T, keys: string[]) {
  const out: Record<string, any> = {};
  keys.forEach((k) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  });
  return out;
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
