import { useMemo } from 'react';
import { fhirBaseUrl, formatDate, parseDate, useFhirFetchAll } from '@openmrs/esm-framework';

export interface Resource {
  resourceType: string;
  id: string;
  meta: ResourceMeta;
  clinicalStatus: ClinicalStatus;
  code: Code;
  subject: Subject;
  onsetDateTime: string;
  recordedDate: string;
  recorder: Recorder;
}

export interface ResourceMeta {
  versionId: string;
  lastUpdated: string;
  tag: Array<ResourceMetaTag>;
}

export interface ResourceMetaTag {
  system: string;
  code: string;
  display: string;
}

export interface ClinicalStatus {
  coding: Array<Coding>;
}

export interface Coding {
  system: string;
  code: string;
}

export interface Code {
  coding: Array<ConditionCoding>;
  text: string;
}

export interface ConditionCoding {
  code: string;
  display?: string;
  system?: string;
}

export interface Subject {
  reference: string;
  type: string;
  display: string;
}

export interface Recorder {
  reference: string;
  type: string;
  display: string;
}

export interface Condition {
  id: string;
  status?: 'active' | 'inactive';
  display: string;
  patient: string;
  onsetDateTime: string;
  recordedDate: string;
  recorder: string;
}

export const usePatientConditions = (patientUuid: string) => {
  const url = `${fhirBaseUrl}/Condition?patient=${patientUuid}&_summary=data&clinical-status=active`;
  const { data, isLoading, mutate, error } = useFhirFetchAll<Resource>(url);

  const conditions = useMemo(() => {
    return data?.reduce<Array<Condition>>((prev, entry) => {
      if (entry?.resourceType === 'Condition') {
        const condition: Condition = {
          id: entry.id,
          display: entry?.code?.text,
          patient: entry?.subject?.display,
          recordedDate: entry?.recordedDate,
          recorder: entry?.recorder?.display,
          status: entry?.clinicalStatus?.coding[0]?.code as 'active' | 'inactive',
          onsetDateTime: formatDate(parseDate(entry.onsetDateTime)),
        };
        prev.push(condition);
      }
      return prev;
    }, []);
  }, [data]);

  return {
    conditions,
    isLoading,
    error,
    mutate,
  };
};

export const pageSizesOptions = [3, 5, 10, 20, 50, 100];
