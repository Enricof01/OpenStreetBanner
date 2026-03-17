// MarkerEditDialog.tsx
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MarkerEditForm from "./MarkerEditForm";

export type MarkerStatus = "HUEPFBURGEN" | "EISLAUF" | "IN_TOUR" | "ERLEDIGT";


type MarkerDraft = {
    name: string;
    message: string;
    status: MarkerStatus;
}
type Props = {
  open: boolean;
  onClose: () => void;

  value: MarkerDraft;
  onSave: (draft: MarkerDraft) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;

  loading?: boolean;
  title?: string;
};

export default function MarkerEditDialog({
  open,
  onClose,
  value,
  onSave,
  onDelete,
  loading = false,
  title = "Standort bearbeiten",
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} disabled={loading} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <MarkerEditForm
          value={value}
          onSave={async (draft) => {
            await onSave(draft);
            onClose();
          }}
          onCancel={onClose}
          onDelete={
            onDelete
              ? async () => {
                  await onDelete();
                  onClose();
                }
              : undefined
          }
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}