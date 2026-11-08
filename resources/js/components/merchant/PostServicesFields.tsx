import { facilityChoices, paymentChoices, serviceChoices } from '@/types/business-profile';
import { CheckField } from './ProfileFields';
import type { PostFieldsProps } from './post-form';

export default function PostServicesFields({ data, setData }: PostFieldsProps) {
  const groups = [['service_options', 'Pilihan layanan', serviceChoices], ['facilities', 'Fasilitas di pos ini', facilityChoices], ['payment_methods', 'Metode pembayaran', paymentChoices]] as const;
  return <div className="profile-form-fields"><p className="profile-hint">Opsional. Pilih yang tersedia di pos ini; setiap pos boleh berbeda.</p>{groups.map(([key, title, choices]) => <fieldset className="profile-fieldset" key={key}><legend>{title}</legend><div className="profile-check-grid">{choices.map(([value, label]) => <CheckField key={value} label={label} checked={data[key].includes(value)} onChange={event => setData(key, event.target.checked ? [...data[key], value] : data[key].filter(item => item !== value))} />)}</div></fieldset>)}</div>;
}
