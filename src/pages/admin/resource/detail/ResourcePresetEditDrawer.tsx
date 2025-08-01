import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  TextField,
  Slider,
  Input,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useApi } from "../../../../hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

const MAX_VALUES = { cpu: 35, memory: 10, gpu: 28 };
const SIZES = ["small", "medium", "large", "max"] as const;

type PresetItem = { size: string; cpu: number; memory: number; gpu: number };

interface PresetEditDrawerProps {
  open: boolean;
  onClose: () => void;
  presetName: string;
  presetData: PresetItem[];
  onSave?: () => void;
}

export const PresetEditDrawer: React.FC<PresetEditDrawerProps> = ({
  open,
  onClose,
  presetName,
  presetData,
  onSave,
}) => {
  const { put } = useApi();
  const queryClient = useQueryClient();
  const [name, setName] = useState(presetName);
  const [resources, setResources] = useState<
    Record<string, { cpu: number; memory: number; gpu: number }>
  >({});

  useEffect(() => {
    const init = presetData.reduce(
      (acc, cur) => {
        acc[cur.size] = { cpu: cur.cpu, memory: cur.memory, gpu: cur.gpu };
        return acc;
      },
      {} as Record<string, { cpu: number; memory: number; gpu: number }>,
    );
    setResources(init);
    setName(presetName);
  }, [presetData, presetName]);

  const handleChange = (
    size: string,
    type: "cpu" | "memory" | "gpu",
    value: number,
  ) => {
    setResources((prev) => ({
      ...prev,
      [size]: { ...prev[size], [type]: value },
    }));
  };

  const handleSave = async () => {
    const payload = SIZES.map((size) => ({
      task_type: name.toLowerCase(),
      size,
      cpu: resources[size]?.cpu ?? 0,
      memory: resources[size]?.memory ?? 0,
      gpu: resources[size]?.gpu ?? 0,
    }));
    try {
      await put("/resources/task_policy", payload);
      queryClient.invalidateQueries({ queryKey: ["task_policy"] });
      queryClient.invalidateQueries({ queryKey: ["taskPreset"] });
      onSave?.();
      onClose();
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  };

  const renderSlider = (size: string, type: "cpu" | "memory" | "gpu") => (
    <Box key={type} mb={2}>
      <Typography fontWeight={500} mb={1}>
        {type.toUpperCase()} ({type === "memory" ? "GB" : "Core"})
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Slider
          value={resources[size]?.[type] || 0}
          min={0}
          max={MAX_VALUES[type]}
          step={1}
          onChange={(_, newVal) => handleChange(size, type, newVal as number)}
          sx={{ flex: 1 }}
        />
        <Input
          type="number"
          value={resources[size]?.[type] || 0}
          onChange={(e) => handleChange(size, type, Number(e.target.value))}
          inputProps={{
            min: 0,
            max: MAX_VALUES[type],
            step: 1,
            style: { width: 60 },
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "50%" } }}
    >
      <Box p={3}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          업무 프리셋 수정
        </Typography>
        <Typography color="text.secondary" mb={2}>
          업무별로 필요한 자원 할당 프리셋을 설정해주세요.
        </Typography>

        <TextField
          fullWidth
          label="업무 프리셋명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Typography fontWeight={600} mb={2}>
          사이즈별 프리셋 설정
        </Typography>

        {Object.keys(resources).map((size) => (
          <Accordion key={size} defaultExpanded={size === "small"}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {(["cpu", "memory", "gpu"] as const).map((type) =>
                renderSlider(size, type),
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button variant="outlined" onClick={onClose}>
            취소
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            저장
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};
