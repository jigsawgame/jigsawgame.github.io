import React, {useState} from "react";

const Switch = (props:any) => {
    return (
      <>
        <input
          checked={props.isOn}
          onChange={props.handleToggle}
          className="switch-checkbox"
          type="checkbox"
          id="switch-button"
        />
        <label
          style={{ background: props.isOn && props.color }}
          className="switch-label"
          htmlFor={`switch-button`}
        >
          <span className={`switch-button`} />
        </label>
      </>
    );
  };

  const MyCustomSwitch = (props:any) => {
    const [value, setValue] = useState(false);
    return (
        <Switch
        isOn={value}
        color="green"
        handleToggle={() => {
            setValue(!value)
            props.onChange(!value);
        }
        }
      />
    )
  };

  export {
      MyCustomSwitch
  }