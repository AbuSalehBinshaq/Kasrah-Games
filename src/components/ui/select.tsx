import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
}

const SelectValue = ({ children, placeholder }: SelectValueProps) => {
  return <span className={!children ? "text-gray-400" : ""}>{children || placeholder}</span>
}
SelectValue.displayName = "SelectValue"

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-300 bg-white p-1 text-gray-900 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SelectContent.displayName = "SelectContent"

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  value: string;
  selected?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, selected, ...props }, ref) => (
    <div
      ref={ref}
      role="option"
      aria-selected={selected}
      data-state={selected ? "checked" : "unchecked"}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-gray-900 outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      data-value={value}
      onClick={() => {
        // This will be handled by parent Select component
      }}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

interface SelectProps {
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

const Select = ({ children, onValueChange, defaultValue, value: controlledValue }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const selectValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  // Find SelectValue and SelectContent from children
  let triggerContent: React.ReactNode = null;
  let contentItems: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if ((child.type as any).displayName === 'SelectTrigger') {
        const childProps = child.props as any;
        triggerContent = React.cloneElement(child as any, {
          onClick: () => setIsOpen(!isOpen),
          children: React.Children.map(childProps.children, (triggerChild: any) => {
            if (React.isValidElement(triggerChild) && (triggerChild.type as any).displayName === 'SelectValue') {
              const triggerChildProps = triggerChild.props as any;
              return React.cloneElement(triggerChild as any, { children: selectValue || triggerChildProps.placeholder });
            }
            return triggerChild;
          })
        });
      } else if ((child.type as any).displayName === 'SelectContent') {
        const childProps = child.props as any;
        contentItems = React.Children.map(childProps.children, (item: any) => {
          if (React.isValidElement(item) && (item.type as any).displayName === 'SelectItem') {
            const itemProps = item.props as SelectItemProps;
            return React.cloneElement(item as any, {
              selected: itemProps.value === selectValue,
              onClick: () => handleSelect(itemProps.value)
            });
          }
          return item;
        });
      }
    }
  });

  return (
    <div className="relative">
      {triggerContent}
      {isOpen && contentItems.length > 0 && (
        <div className="absolute z-50 mt-1 w-full">
          <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-300 bg-white p-1 text-gray-900 shadow-md">
            {contentItems}
          </div>
        </div>
      )}
    </div>
  );
};
Select.displayName = "Select"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
