import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";

interface FloatingFieldsetProps {
    label: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    className?: string;
    children: React.ReactElement<any>;
}

const FloatingFieldset: React.FC<FloatingFieldsetProps> = ({ label, prefix, suffix, className, children }) => {
    const [isFocused, setIsFocused] = useState(false);
    const fieldsetRef = useRef<HTMLFieldSetElement>(null);

    const childProps = isValidElement(children)
        ? (children.props as { value?: unknown; defaultValue?: unknown })
        : {};
    const rawValue = childProps.value ?? childProps.defaultValue;
    const [currentValue, setCurrentValue] = useState(rawValue);
    const isNativeControl = isValidElement(children) && (children.type === Form.Control || typeof children.type === "string");
    const isTextarea = isValidElement(children) && (children.props as { as?: string }).as === "textarea";
    const controlType = isValidElement(children) ? (children.props as { type?: string }).type : undefined;
    const hasNativeEmptyHint = controlType !== undefined && ["date", "time", "month", "week", "datetime-local"].includes(controlType);
    const isInvalid = isValidElement(children) && !!(children.props as { isInvalid?: boolean }).isInvalid;

    useEffect(() => {
        if (childProps.value !== undefined) {
            setCurrentValue(childProps.value);
        }
    }, [childProps.value]);

    useEffect(() => {
        if (!isNativeControl) return;
        const input = fieldsetRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select");
        if (input) setCurrentValue(input.value);
    });

    const hasValue = currentValue !== undefined && currentValue !== null && String(currentValue).trim() !== "";
    const floated = isFocused || hasValue;

    const control = isValidElement(children)
        ? cloneElement(children as React.ReactElement<any>, {
              onFocus: (e: React.FocusEvent<HTMLElement>) => {
                  setIsFocused(true);
                  (children.props as { onFocus?: (e: React.FocusEvent<HTMLElement>) => void }).onFocus?.(e);
              },
              onBlur: (e: React.FocusEvent<HTMLElement>) => {
                  setIsFocused(false);
                  const target = e.target as HTMLElement;
                  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
                      setCurrentValue(target.value);
                  }
                  (children.props as { onBlur?: (e: React.FocusEvent<HTMLElement>) => void }).onBlur?.(e);
              },
              onChange: (eOrValue: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
                  const nextValue = typeof eOrValue === "object" && eOrValue !== null && "target" in eOrValue
                      ? eOrValue.target.value
                      : eOrValue;
                  setCurrentValue(nextValue);
                  (children.props as { onChange?: (arg: typeof eOrValue) => void }).onChange?.(eOrValue);
              },
              ...(!isNativeControl ? { placeholder: "" } : {}),
          })
        : children;

    return (
        <fieldset
            ref={fieldsetRef}
            className={`floating-fieldset ${floated ? "floating-fieldset-floated" : ""} ${isInvalid ? "is-invalid" : ""} ${isTextarea ? "floating-fieldset-textarea" : ""} ${hasNativeEmptyHint ? "floating-fieldset-mask-native" : ""} ${className ?? ""}`}
        >
            <legend className="floating-fieldset-legend">{label}</legend>
            <div className="floating-fieldset-body">
                {prefix && <span className="floating-fieldset-affix">{prefix}</span>}
                <div className="floating-fieldset-input-wrap">
                    {control}
                    {!floated && <span className="floating-fieldset-ghost">{label}</span>}
                </div>
                {suffix && <span className="floating-fieldset-affix">{suffix}</span>}
            </div>
        </fieldset>
    );
};

export default FloatingFieldset;
