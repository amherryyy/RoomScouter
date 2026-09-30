import { SubmitButton } from "../../components/submit-button";

type CatalogItem = { id: number; name: string };
type UtilitySelection = { utility_id: number; is_included: boolean; details: string | null };
type HouseRule = { id: string; rule_text: string; position: number };

type AttributeFormsProps = {
  facilities: CatalogItem[];
  selectedFacilityIds: number[];
  utilities: CatalogItem[];
  selectedUtilities: UtilitySelection[];
  rules: HouseRule[];
  facilityAction: (formData: FormData) => void | Promise<void>;
  utilityAction: (formData: FormData) => void | Promise<void>;
  ruleAction: (formData: FormData) => void | Promise<void>;
};

export function AttributeForms({
  facilities,
  selectedFacilityIds,
  utilities,
  selectedUtilities,
  rules,
  facilityAction,
  utilityAction,
  ruleAction,
}: AttributeFormsProps) {
  const selectedFacilities = new Set(selectedFacilityIds);
  const utilitySelections = new Map(selectedUtilities.map((selection) => [selection.utility_id, selection]));
  const ruleSlots = Array.from({ length: 10 }, (_, index) => rules[index]?.rule_text ?? "");

  return (
    <section className="attribute-editor" aria-labelledby="attributes-title">
      <div>
        <p className="eyebrow">Comparison details</p>
        <h2 id="attributes-title">Facilities, utilities, and rules</h2>
        <p>Changes to approved content require another review. Saving an unchanged section does not.</p>
      </div>

      <form action={facilityAction} className="attribute-card">
        <fieldset>
          <legend>Facilities</legend>
          <div className="choice-grid">
            {facilities.map((facility) => (
              <label className="check-row" key={facility.id}>
                <input
                  type="checkbox"
                  name="facilityIds"
                  value={facility.id}
                  defaultChecked={selectedFacilities.has(facility.id)}
                />
                <span>{facility.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <SubmitButton pendingLabel="Saving facilities…" className="secondary">Save facilities</SubmitButton>
      </form>

      <form action={utilityAction} className="attribute-card">
        <fieldset>
          <legend>Utilities</legend>
          <p className="field-help">Select each available utility, mark whether it is included, and add a short pricing note when useful.</p>
          <div className="utility-list">
            {utilities.map((utility) => {
              const selection = utilitySelections.get(utility.id);
              return (
                <div className="utility-row" key={utility.id}>
                  <label className="check-row">
                    <input type="checkbox" name="utilityIds" value={utility.id} defaultChecked={Boolean(selection)} />
                    <span>{utility.name}</span>
                  </label>
                  <label className="check-row compact-check">
                    <input type="checkbox" name={`utilityIncluded:${utility.id}`} defaultChecked={selection?.is_included ?? false} />
                    <span>Included in rent</span>
                  </label>
                  <label>
                    <span className="visually-hidden">{utility.name} details</span>
                    <input name={`utilityDetails:${utility.id}`} defaultValue={selection?.details ?? ""} maxLength={240} placeholder="Optional details" />
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>
        <SubmitButton pendingLabel="Saving utilities…" className="secondary">Save utilities</SubmitButton>
      </form>

      <form action={ruleAction} className="attribute-card">
        <fieldset>
          <legend>House rules</legend>
          <p className="field-help">Rules appear in this order. Clear a field to remove that rule.</p>
          <ol className="rule-list">
            {ruleSlots.map((rule, index) => (
              <li key={index}>
                <label className="visually-hidden" htmlFor={`rule-${index}`}>House rule {index + 1}</label>
                <input id={`rule-${index}`} name="rules" defaultValue={rule} minLength={3} maxLength={500} placeholder={`Rule ${index + 1}`} />
              </li>
            ))}
          </ol>
        </fieldset>
        <SubmitButton pendingLabel="Saving house rules…" className="secondary">Save house rules</SubmitButton>
      </form>
    </section>
  );
}
