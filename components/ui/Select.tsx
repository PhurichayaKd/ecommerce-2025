import { SelectHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  children: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    placeholder,
    disabled,
    children,
    ...props 
  }, ref) => {
    return (
      <div className={styles.selectGroup}>
        {label && (
          <label className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <div className={styles.selectWrapper}>
          <select
            className={clsx(
              styles.select,
              error && styles.error,
              disabled && styles.disabled,
              className
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          
          {/* Custom arrow icon */}
          <div className={styles.arrow}>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 4.5L6 7.5L9 4.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        {(error || helperText) && (
          <div className={clsx(
            styles.helperText,
            error && styles.errorText
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select