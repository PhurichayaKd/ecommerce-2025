import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    disabled,
    ...props 
  }, ref) => {
    return (
      <div className={styles.inputGroup}>
        {label && (
          <label className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <div className={styles.leftIcon}>
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={clsx(
              styles.input,
              leftIcon && styles.hasLeftIcon,
              rightIcon && styles.hasRightIcon,
              error && styles.error,
              disabled && styles.disabled,
              className
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className={styles.rightIcon}>
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input'

export default Input