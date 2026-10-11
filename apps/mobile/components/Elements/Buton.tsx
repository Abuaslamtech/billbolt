import React from "react";
import { Button as CanonicalButton, ButtonProps } from "./Button";

/**
 * @deprecated Use `import { Button } from "@/components/Elements/Button"` instead.
 * Retained for backward compatibility with auth screens.
 */
export function Button(props: ButtonProps) {
  return (
    <CanonicalButton
      fullWidth
      size="lg"
      className="mt-4"
      {...props}
    />
  );
}

export default Button;
export type { ButtonProps };
