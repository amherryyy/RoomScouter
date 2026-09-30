type ReportFormProps = {
  label: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function ReportForm({ label, action }: ReportFormProps) {
  return (
    <details className="report-form" id="reports">
      <summary>{label}</summary>
      <form action={action}>
        <label htmlFor={`report-reason-${label.replaceAll(" ", "-").toLowerCase()}`}>Reason</label>
        <textarea
          id={`report-reason-${label.replaceAll(" ", "-").toLowerCase()}`}
          name="reason"
          minLength={10}
          maxLength={1000}
          required
          placeholder="Explain what is inaccurate, unsafe, or inappropriate."
        />
        <p className="field-help">Your report is private and cannot be changed after submission.</p>
        <button type="submit" className="danger-button">Submit report</button>
      </form>
    </details>
  );
}
