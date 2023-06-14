// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { IconAlertCircle, IconLock } from "@tabler/icons-react";
import { useEffect } from "react";
import Form from "react-bootstrap/Form";
import { PrimaryButton, Tooltip } from "./Buttons";

export default function InputField(props) {
  useEffect(() => {
    if (props.class !== "clicker-id-input") return;
    const thisField = document.querySelector(`.${props.class}`);
    if (thisField) thisField.value = props.default;
  }, [props.default]);

  return (
    <div
      className={props.small ? "input-field-small" : "input-field"}
      id={props.class}
    >
      <div
        className="input-field-label"
        style={{ justifyContent: props.center ? "center" : "unset" }}
      >
        {props.label || "Title Text"}
        {props.disabled && <IconLock size="1em" stroke="0.15rem" />}
      </div>
      <div className="form-wrapper">
        <Form.Control
          className={props.class}
          placeholder={props.input || "Placeholder Text"}
          defaultValue={props.default}
          onChange={props.onChange}
          onKeyDown={props.onKeyDown}
          value={props.value}
          disabled={props.disabled}
          maxLength={props.maxLength}
          type={props.type}
          style={props.style}
        />
        {props.save && (
          <PrimaryButton
            label="Save"
            variant="clicker-save"
            style={{ padding: "0 1rem", margin: "auto" }}
            onClick={props.onClick}
          />
        )}
        {props.errorState && (
          <IconAlertCircle
            className="input-error-icon"
            size="1.25em"
            stroke="0.17rem"
            onMouseOver={(event) => {
              const field = event.target.parentNode.parentNode;
              if (field) {
                field.style.setProperty("--tooltip-point", "all");
                field.style.setProperty("--tooltip-show", "100%");
                field.style.setProperty("--icon-color", "#d59999eb");
              }
            }}
            onMouseLeave={(event) => {
              const field = event.target.parentNode.parentNode;
              if (field) {
                field.style.setProperty("--tooltip-point", "none");
                field.style.setProperty("--tooltip-show", 0);
                field.style.setProperty("--icon-color", "#ac494b");
              }
            }}
          />
        )}
      </div>
      {props.errorState && (
        <Tooltip
          className="err-tooltip"
          txt={props.errorState}
          onMouseOver={(event) => {
            const field = event.target.parentNode;
            if (field) {
              field.style.setProperty("--tooltip-point", "all");
              field.style.setProperty("--tooltip-show", "100%");
              field.style.setProperty("--icon-color", "#d59999eb");
            }
          }}
          onMouseLeave={(event) => {
            const field = event.target.parentNode;
            if (field) {
              field.style.setProperty("--tooltip-point", "none");
              field.style.setProperty("--tooltip-show", 0);
              field.style.setProperty("--icon-color", "#ac494b");
            }
          }}
        />
      )}
    </div>
  );
}

export function SelectField(props) {
  const today = new Date();
  const todayMon = today.getMonth() + 1;
  const todayYr = today.getFullYear();
  let options = [];

  for (let i = today.getFullYear(); i > 2022; i--) {
    if (todayMon > 7 || i != todayYr) {
      options.push(<option key={`Fall ${i}`}>{`Fall ${i}`}</option>);
    }
    if (todayMon > 5 || i != todayYr) {
      options.push(<option key={`Summer ${i}`}>{`Summer ${i}`}</option>);
    }
    options.push(<option key={`Spring ${i}`}>{`Spring ${i}`}</option>);
    options.push(
      <option key={`Intersession ${i}`}>{`Intersession ${i}`}</option>
    );
  }

  return (
    <div className={props.section ? "input-field-small" : "input-field"}>
      {props.label || "Title Text"}
      <div className="form-wrapper">
        <Form.Select
          name={props.class}
          className={props.class}
          placeholder="Select Semester"
          defaultValue={props.default || options[0]}
          onChange={props.onChange}
          onKeyDown={props.onKeyDown}
        >
          {options}
        </Form.Select>
      </div>
    </div>
  );
}
