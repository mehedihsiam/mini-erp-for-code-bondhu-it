import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col space-y-1.5", className)}>
        <Label htmlFor={generatedId}>{label}</Label>
        <Input id={generatedId} ref={ref} {...props} />
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
