// MarkerEditForm.tsx
import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

export type MarkerStatus = "HUEPFBURGEN" | "EISLAUF" | "IN_TOUR" | "ERLEDIGT";

export type MarkerDraft = {
  name: string;
  message: string;
  status: MarkerStatus;
};

type Props = {
  /** Initial values (e.g. selected marker data). */
  value: MarkerDraft;

  /** Called when user presses Save. Return a promise if you do an API call. */
  onSave: (draft: MarkerDraft) => void | Promise<void>;

  /** Optional: called when user presses Cancel. */
  onCancel?: () => void;

  /** Optional: allow deleting marker. */
  onDelete?: () => void | Promise<void>;

  /** Optional: show loading state while saving/deleting outside. */
  loading?: boolean;

  /** Optional: disable editing when no marker selected etc. */
  disabled?: boolean;

  /** Optional title shown in header. */
  title?: string;
};

const STATUS_OPTIONS: { value: MarkerStatus; label: string; color: "default" | "success" | "warning" | "info" | "error" }[] =
  [
    { value: "HUEPFBURGEN", label: "Hüpfburgen Banner", color: "info" },
    { value: "EISLAUF", label: "Eislauf Banner", color: "warning" },
    { value: "IN_TOUR", label: "In Tour", color: "default" },
    { value: "ERLEDIGT", label: "Erledigt", color: "success" },
  ];

export default function MarkerEditForm({
  value,
  onSave,
  onCancel,
  onDelete,
  loading = false,
  disabled = false,
  title = "Marker bearbeiten",
}: Props) {
  const [draft, setDraft] = React.useState<MarkerDraft>(value);
  const [touched, setTouched] = React.useState<{ name?: boolean; message?: boolean }>({});
  const [error, setError] = React.useState<string | null>(null);

  // Keep form in sync when selected marker changes
  React.useEffect(() => {
    setDraft(value);
    setTouched({});
    setError(null);
  }, [value]);

  const statusMeta = React.useMemo(
    () => STATUS_OPTIONS.find((s) => s.value === draft.status),
    [draft.status]
  );

  const nameError =
    touched.name && draft.name.trim().length === 0 ? "Name darf nicht leer sein." : undefined;

  const messageError =
    touched.message && draft.message.length > 500
      ? "Message ist zu lang (max. 500 Zeichen)."
      : undefined;

  const canSave = !disabled && !loading && !nameError && !messageError;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, message: true });
    setError(null);

    const trimmed: MarkerDraft = {
      ...draft,
      name: draft.name.trim(),
      message: draft.message.trim(),
    };

    if (trimmed.name.length === 0) return;
    if (trimmed.message.length > 500) return;

    try {
      await onSave(trimmed);
    } catch (err: any) {
      setError(err?.message ?? "Speichern fehlgeschlagen.");
    }
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6">{title}</Typography>
            {statusMeta ? <Chip size="small" label={statusMeta.label} color={statusMeta.color} /> : null}
          </Stack>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Name, Notiz und Status des Standorts anpassen.
          </Typography>
        }
      />
      <Divider />

      <CardContent>
        <Box component="form" onSubmit={handleSave}>
          <Stack spacing={2.2}>
            <TextField
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              error={!!nameError}
              helperText={nameError ?? "z.B. „Hauptstraße 12 – Laterne“"}
              fullWidth
              disabled={disabled || loading}
              inputProps={{ maxLength: 80 }}
            />

            <TextField
              label="Message / Notiz"
              value={draft.message}
              onChange={(e) => setDraft((p) => ({ ...p, message: e.target.value }))}
              onBlur={() => setTouched((p) => ({ ...p, message: true }))}
              error={!!messageError}
              helperText={messageError ?? `${draft.message.length}/500`}
              fullWidth
              multiline
              minRows={3}
              maxRows={7}
              disabled={disabled || loading}
              inputProps={{ maxLength: 500 }}
            />

            <FormControl fullWidth disabled={disabled || loading}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={draft.status}
                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as MarkerStatus }))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={s.label} color={s.color} />
                      <Typography variant="body2">{s.value}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Tipp: „In Tour“ beim Start, „Erledigt“ nach Austausch.
              </FormHelperText>
            </FormControl>

            {error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : null}

            <Divider />

            <Stack direction="row" spacing={1} justifyContent="space-between" flexWrap="wrap">
              <Stack direction="row" spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSave}
                >
                  Speichern
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
              </Stack>

              {onDelete ? (
                <Button
                  type="button"
                  color="error"
                  variant="text"
                  onClick={() => onDelete()}
                  disabled={loading}
                >
                  Löschen
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}