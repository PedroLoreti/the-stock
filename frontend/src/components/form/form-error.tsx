import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/api/errors";

/** Shows the API error of a failed mutation inside a form. Renders nothing when there is none. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  );
}
