import { useId, useReducer } from 'react'

export interface DebugPanelProps<T extends string> {
  name: string
  labels: Record<T, string>
  getCurrentValue: Record<T, () => string>
  showOnStartup: Record<T, boolean>
}

/**
 * A debug panel component that allows toggling the visibility of various debug information.
 */
export function DebugPanel<T extends string>({
  name,
  labels,
  getCurrentValue,
  showOnStartup,
}: DebugPanelProps<T>) {
  const panelId = useId()
  const [show, toggleOption] = useReducer(
    (prev, key: T) => ({ ...prev, [key]: !prev[key] }),
    showOnStartup,
  )
  const options = Object.keys(labels) as T[]

  return (
    <>
      <h2 id={`${panelId}-header`}>Debug Panel: {name}</h2>
      <fieldset
        aria-labelledby={`${panelId}-header`}
        className="debug-panel__options surface"
      >
        <legend>Options</legend>
        {options.map((option) => (
          <label key={option} htmlFor={`${panelId}-${option}-toggle`}>
            <input
              id={`${panelId}-${option}-toggle`}
              type="checkbox"
              checked={show[option]}
              aria-checked={show[option]}
              onChange={() => toggleOption(option)}
            />{' '}
            {labels[option]}
          </label>
        ))}
      </fieldset>
      <div className="debug-panel__values">
        {options.map((option) =>
          show[option] ? (
            <pre
              key={option}
              className="debug-panel__value surface"
              role="log"
              aria-label={`Debug info for ${labels[option]}`}
              aria-live="off"
            >
              {getCurrentValue[option]()}
            </pre>
          ) : null,
        )}
      </div>
    </>
  )
}
