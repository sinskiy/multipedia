import Field from "./base/field";
import field from "./any-field.module.css";
import classes from "./searchable-select.module.css";
import { cn } from "../lib/cn";
import { InputHTMLAttributes, useState } from "react";
import useComponentVisible from "../hooks/use-component-visible";

interface SearchableSelectProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name?: string;
  labelText?: string;
  error?: false | string[] | null | undefined;
  dropdownItems: string[];
}

export default function SearchableSelect({
  id,
  name = id,
  labelText = id,
  error,
  dropdownItems,
  ...props
}: SearchableSelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const searchResults = dropdownItems.filter((item) =>
    item.includes(searchValue)
  );

  const [showResults, setShowResults] = useState(false);

  const { ref, isComponentVisible } = useComponentVisible<HTMLDivElement>();

  return (
    <Field
      id={id}
      labelText={labelText}
      error={error}
      className={classes.field}
    >
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.currentTarget.value)}
        name={name}
        id={id}
        type="text"
        onFocus={() => setShowResults(true)}
        onBlur={() => setShowResults(false)}
        className={cn([
          field.input,
          error && field["input--error"],
          classes.input,
        ])}
        {...props}
      />
      <div
        className={classes["dropdown-wrapper"]}
        hidden={!showResults && !isComponentVisible}
        ref={ref}
      >
        <ul className={classes.dropdown} aria-live="polite">
          {searchResults.map((item) => (
            <li key={item}>
              <button onClick={() => setSearchValue(item)} type="button">
                {item}
              </button>
            </li>
          ))}
          {searchResults.length === 0 && (
            <p style={{ marginBottom: "0.5rem" }}>
              <i>nothing found</i>
            </p>
          )}
        </ul>
      </div>
    </Field>
  );
}
