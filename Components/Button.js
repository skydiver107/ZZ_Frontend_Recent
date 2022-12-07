import React from "react";
import PropTypes from "prop-types";

export default function Button({
  className,
  hasBorder,
  disabled,
  variant = "white",
  text,
  children,
  clickHandler,
  ...rest
}) {
  return (
    <div
      {...rest}
      className={`d-inline-block button-wrapper ${
        hasBorder ? "btn-border" : ""
      }  ${className ? className : ""}`}
    >
      <button
        disabled={disabled}
        className={`button ${variant ? variant : ""} ${
          className ? className : ""
        }`}
        style={{ filter: disabled ? "" : 1 }}
        onClick={clickHandler}
      >
        {children || text}
      </button>
    </div>
  );
}

Button.prototype = {
  variant: PropTypes.oneOf(["white , blue", "purple"]),
};
