import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type GeoState =
  | { status: "loading" | "idle"; coords?: undefined; error?: undefined }
  | { status: "ready"; coords: { lat: number; lng: number; accuracy?: number }; error?: undefined }
  | { status: "error"; coords?: undefined; error: string };

type Props = {
  geo: GeoState;
  onRetryGeo: () => void;

  saving: boolean;
  onSaveHere: () => void;

  routeMode: boolean;
  onToggleRouteMode: () => void;

  onPlanRoute: () => void;

  selectedCount?: number; // optional, wenn du ausgewählte Marker zählen willst

  selectionCheck: boolean;
  setSelectionCheck: (arg: boolean) => void;  //Slide button route auswählen
  selectedNodes: number[];
};

function Content({
  geo,
  onRetryGeo,
  saving,
  onSaveHere,
  routeMode,
  onToggleRouteMode,
  onPlanRoute,
  selectedCount = 0,
  selectionCheck,
  setSelectionCheck
}: Props) {


  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Plakat-Routen
          </Typography>
          <Chip size="small" label={routeMode ? "Route-Modus" : "Ansicht"} />
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Standort
              </Typography>

              {geo.status === "loading" && (
                <Typography variant="body2" color="text.secondary">
                  GPS wird geladen…
                </Typography>
              )}

              {geo.status === "error" && (
                <Alert
                  severity="error"
                  action={
                    <Button size="small" onClick={onRetryGeo}>
                      Nochmal
                    </Button>
                  }
                >
                  {geo.error}
                </Alert>
              )}

              {geo.status === "ready" && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Aktuell: {geo.coords.lat.toFixed(5)}, {geo.coords.lng.toFixed(5)}
                  </Typography>
                  {typeof geo.coords.accuracy === "number" && (
                    <Typography variant="caption" color="text.secondary">
                      Genauigkeit: ~{Math.round(geo.coords.accuracy)} m
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    onClick={onSaveHere}
                    disabled={saving}
                    fullWidth
                    sx={{ borderRadius: 2, py: 1.2, mt: 0.5 }}
                  >
                    {saving ? "Speichere…" : "Standort hier speichern"}
                  </Button>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Tour
              </Typography>

              <FormControlLabel
                control={<Switch checked={routeMode} onChange={onToggleRouteMode} />}
                label="Banner für Route auswählen"
              />

              <Divider />

              <Button                       //Button um route zu planen
                variant="contained"
                onClick={onPlanRoute}
                disabled={!routeMode}
                fullWidth
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                Route planen{selectedCount ? ` (${selectedCount})` : ""}
              </Button>

              {!routeMode && (
                <Typography variant="caption" color="text.secondary">
                  Aktiviere zuerst den Route-Modus, um Marker auswählen zu können.
                </Typography>
              )}

              <Typography variant="subtitle2" fontWeight={700}>
                Link zu Google maps:
                https://www.google.com/maps/dir/?api=1&origin=52.52,13.40&destination=52.52,13.40&waypoints=48.13,11.57|53.55,9.99
              </Typography>
            </Stack>
          </CardContent>
        </Card>


                <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                
              </Typography>

              <FormControlLabel
            control={<Switch checked = {selectionCheck} onChange = {() => setSelectionCheck(selectionCheck ? false : true)} /> }
                label="Neue Banner hinzufügen"
              />

              {/* <Divider /> */}
              



            </Stack>
          </CardContent>
          
        </Card>
      </Stack>
      
    </Box>
  );
}

export default function RouteSidebar(props: Props) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [open, setOpen] = React.useState(false);
  

  // Mobile: als Drawer, der über der Karte liegt
  if (isMobile) {
    return (
      <>
        {/* Floating Button um Drawer zu öffnen */}
        <Box
          sx={{
            position: "absolute",
            left: 12,
            top: 12,
            zIndex: 1000,
          }}
        >
          <Button style = {{position: "relative", right: "-400%"}} variant="contained" onClick={() => setOpen(true)} sx={{ borderRadius: 999 }}>
            Menü
          </Button>
        </Box>

        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}
        >
          <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
              Plakat-Routen
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          <Content {...props} />
        </Drawer>
      </>
    );
  }

  // Desktop: feste Sidebar links
  return (
    <Box
      sx={{
        width: 360,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100vh",
        overflow: "auto",
        backgroundColor: "background.paper",
      }}
    >
      <Content {...props} />
    </Box>
  );
}