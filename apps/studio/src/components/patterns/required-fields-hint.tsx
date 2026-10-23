export function RequiredFieldsHint() {
  return (
    <p className="text-muted-foreground text-xs">
      <span className="text-destructive" aria-hidden="true">
        *
      </span>{" "}
      Required fields
    </p>
  );
}
