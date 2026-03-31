import { SuggestionsForm } from './SuggestionsForm'
import { SurveyForm } from './SurveyForm'

export function BetaFormsColumn() {
  return (
    <div
      className="flex flex-col gap-10 rounded-card border border-fig-border/30 bg-surface p-8 shadow-card sm:p-10 lg:gap-12"
      data-node-id="636:566"
    >
      <SurveyForm embedded />
      <div className="border-t border-fig-border pt-10">
        <SuggestionsForm embedded />
      </div>
    </div>
  )
}
