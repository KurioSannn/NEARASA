import { useEffect } from 'react';

export type DirtyReporter = (section: string, dirty: boolean) => void;
export function useProfileDraft(section: string, dirty: boolean, report: DirtyReporter) {
  useEffect(() => { report(section, dirty); }, [section, dirty, report]);
  useEffect(() => () => report(section, false), [section, report]);
}
