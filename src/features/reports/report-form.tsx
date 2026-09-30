import { SubmitButton } from "../../components/submit-button";

type ReportFormProps = {
  id: string;
  label: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function ReportForm({ id, label, action }: ReportFormProps) {
  const reasonId = `report-reason-${id}`;
  const helpId = `report-help-${id}`;
  return (
    <details className="report-form" id={`report-${id}`}>
      <summary>{label}</summary>
      <form action={action}>
        <label htmlFor={reasonId}>Reason</label>
        <textarea
          id={reasonId}
          name="reason"
          minLength={10}
          maxLength={1000}
          aria-describedby={helpId}
          required
          placeholder="Explain what is inaccurate, unsafe, or inappropriate."
        />
        <p className="field-help" id={helpId}>Your report is private and cannot be changed after submission.</p>
        <SubmitButton pendingLabel="Submitting report…" className="danger-button">Submit report</SubmitButton>
      </form>
    </details>
  );
}
