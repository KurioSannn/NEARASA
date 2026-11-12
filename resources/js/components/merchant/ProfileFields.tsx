import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Check, ChevronDown, LoaderCircle, Save } from 'lucide-react';
import Button from '@/components/Button';

type FieldProps = { id: string; label: string; hint?: string; error?: unknown };
const errorText = (error: unknown) => Array.isArray(error) ? error.join(' ') : typeof error === 'string' ? error : '';

function Field({ id, label, hint, error, children }: FieldProps & { children: ReactNode }) {
  return <div className="profile-field"><label htmlFor={id}>{label}</label>{children}{hint && <p id={`${id}-hint`} className="profile-hint">{hint}</p>}{errorText(error) && <p id={`${id}-error`} className="profile-field-error">{errorText(error)}</p>}</div>;
}

export function TextField({ id, label, hint, error, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return <Field id={id} label={label} hint={hint} error={error}><input id={id} className="text-input" aria-invalid={Boolean(error)} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined} {...props} /></Field>;
}

export function TextAreaField({ id, label, hint, error, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Field id={id} label={label} hint={hint} error={error}><textarea id={id} className="profile-textarea" aria-invalid={Boolean(error)} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined} rows={4} {...props} /></Field>;
}

export function SelectField({ id, label, hint, error, options, value, onChange, disabled }: FieldProps & {
  options: readonly (readonly [string, string])[];
  value?: string | number | readonly string[];
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const currentVal = String(value ?? '');
  const selectedOption = options.find(([val]) => val === currentVal);
  const displayLabel = selectedOption ? selectedOption[1] : options[0] ? options[0][1] : 'Pilih opsi';

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-2.5 bg-clay-50/80 hover:bg-[#fdeee9] border ${error ? 'border-red-400' : 'border-sand-border hover:border-terracotta-300'} text-clay-900 text-xs font-bold rounded-xl px-3.5 py-2.5 transition-all text-left cursor-pointer outline-none focus:ring-2 focus:ring-terracotta/20 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className={`w-4 h-4 text-clay-500 transition-transform duration-200 shrink-0 ${open ? 'rotate-180 text-terracotta' : ''}`} />
        </button>

        {open && !disabled && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-sand-border rounded-2xl shadow-xl p-1.5 z-50 max-h-56 overflow-y-auto space-y-1">
              {options.map(([optValue, optText]) => {
                const isSelected = optValue === currentVal;
                return (
                  <button
                    key={optValue}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onChange?.({ target: { value: optValue } });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors duration-150 flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-terracotta-50 text-terracotta font-extrabold border border-terracotta-200'
                        : 'text-clay-800 font-semibold hover:bg-[#fdeee9] hover:text-terracotta border border-transparent'
                    }`}
                  >
                    <span className="truncate">{optText}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Field>
  );
}

export function CheckField({ label, hint, ...props }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="profile-check"><input type="checkbox" {...props} /><span>{label}{hint && <small>{hint}</small>}</span></label>;
}

function SelectedImage({ file, label }: { file: File; label: string }) {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => { const next = URL.createObjectURL(file); setUrl(next); setFailed(false); return () => URL.revokeObjectURL(next); }, [file]);
  return failed ? <p className="profile-hint">Foto yang dipilih belum dapat ditampilkan. Periksa berkas foto.</p> : url ? <figure className="profile-selected-image"><img src={url} alt={`${label} yang dipilih, belum disimpan`} onError={() => setFailed(true)} /><figcaption>Foto dipilih · belum disimpan</figcaption></figure> : null;
}

export function FileField({ id, label, hint, error, onChange, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const [selected, setSelected] = useState<File | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (props.disabled) { setSelected(null); if (input.current) input.current.value = ''; } }, [props.disabled]);
  return <Field id={id} label={label} hint={hint} error={error}><div className={`profile-file-control${props.disabled ? ' is-disabled' : ''}`}><input ref={input} className="profile-file" id={id} type="file" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...props} onChange={event => { setSelected(event.target.files?.[0] ?? null); onChange?.(event); }} /><span className="profile-file-action" aria-hidden="true">Pilih berkas</span><span className="profile-file-name" aria-hidden="true">{selected ? selected.name : 'Belum ada berkas baru'}</span></div>{selected && <><p className="profile-hint">{Math.ceil(selected.size / 1024).toLocaleString('id-ID')} KB · belum disimpan</p><button type="button" className="profile-inline-link" onClick={() => { if (input.current) { input.current.value = ''; input.current.dispatchEvent(new Event('change', { bubbles: true })); } setSelected(null); }}>Batalkan pilihan berkas<span className="profile-sr-only"> {label.toLowerCase()}</span></button></>}{selected?.type.startsWith('image/') && !props.disabled && <SelectedImage file={selected} label={label} />}</Field>;
}

export function ErrorSummary({ errors }: { errors: Record<string, unknown> }) {
  const messages = [...new Set(Object.values(errors).map(errorText).filter(Boolean))];
  const summary = useRef<HTMLDivElement>(null);
  const signature = messages.join('\n');
  useEffect(() => { if (signature) summary.current?.focus(); }, [signature]);
  if (!messages.length) return null;
  return <div ref={summary} tabIndex={-1} className="profile-errors" role="alert"><AlertCircle size={18} /><div><strong>Periksa isian berikut.</strong><ul>{messages.map(message => <li key={message}>{message}</li>)}</ul></div></div>;
}

export function SaveBar({ processing, dirty, successful, progress, label, onCancel }: { processing: boolean; dirty: boolean; successful: boolean; progress?: number; label: string; onCancel?: () => void }) {
  return <div className="profile-save-area">{successful && !dirty && <p className="profile-success" role="status"><Check size={17} />{label} tersimpan.</p>}{processing && progress !== undefined && <div className="profile-upload-progress" role="status"><span>Mengunggah {Math.round(progress)}%</span><progress max={100} value={progress} /></div>}<div className="profile-save-bar"><p aria-live="polite">{processing ? 'Sedang menyimpan…' : dirty ? 'Ada perubahan belum disimpan' : 'Belum ada perubahan'}</p><div>{onCancel && <button type="button" className="profile-secondary" disabled={processing} onClick={onCancel}>Batal</button>}<Button disabled={processing} type="submit">{processing ? <LoaderCircle className="profile-spin" size={17} /> : <Save size={17} />}{processing ? 'Menyimpan…' : `Simpan ${label.toLowerCase()}`}</Button></div></div></div>;
}

export function SectionHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="profile-section-heading"><div><h2>{title}</h2><p>{description}</p></div>{action}</header>;
}

export const imageAccept = 'image/jpeg,image/png,image/webp';
export const imageHint = 'JPG, PNG, atau WebP. Maksimal 2 MB.';
