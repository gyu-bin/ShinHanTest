import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../../../hooks/useApi";
import { PresetEditDrawer } from "./ResourcePresetEditDrawer";

const RESOURCE_COLORS = {
  cpu: "#8884d8",
  memory: "#f08080",
  gpu: "#4caf50",
};

const LABELS = {
  cpu: "CPU (Core)",
  memory: "Memory (GB)",
  gpu: "GPU (Core)",
};

const ResourcePresetDetail: React.FC = () => {
  const { taskType } = useParams();
  const { get, delete: deleteFn } = useApi();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data = [], isLoading } = useQuery({
    queryKey: ["task_policy", refreshKey],
    queryFn: () =>
      get("/resources/task_policy").then((res: any) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        return [];
      }),
    staleTime: Infinity,
  });

  const filtered = data.filter(
    (item: any) => item.task_type.toLowerCase() === taskType?.toLowerCase(),
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <Box display="flex" mb={1}>
      <Box width="150px">
        <Typography color="text.secondary">{label}</Typography>
      </Box>
      <Box>
        <Typography>{value}</Typography>
      </Box>
    </Box>
  );

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteFn(`/resources/task_policy/${taskType}`);
        alert("삭제되었습니다.");
        navigate(-1); // 이전 페이지로
      } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>
        업무 프리셋 상세
      </Typography>
      <Typography variant="body2" mb={3}>
        <span style={{ color: "#3f51b5", fontWeight: 600 }}>{taskType}</span>{" "}
        업무에 사전 설정한 자원 할당량을 확인합니다.
      </Typography>

      {/* 기본정보 */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography fontWeight={600} mb={1}>
          기본정보
        </Typography>
        <InfoRow label="업무명" value={taskType ?? "-"} />
        <InfoRow label="유형" value="기본" />
      </Paper>

      {/* 등록정보 */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography fontWeight={600} mb={1}>
          등록정보
        </Typography>
        <InfoRow label="생성일시" value="2025-03-19 15:29:31" />
        <InfoRow label="최종업데이트 일시" value="2025-03-19 15:29:31" />
        <InfoRow label="생성자" value="김신한" />
      </Paper>

      {/* 자원 프리셋 카드 스타일 */}
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={600} mb={2}>
          자원 프리셋
        </Typography>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={200}
          >
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary">
            해당 프리셋 데이터가 없습니다.
          </Typography>
        ) : (
          <Box display="flex" gap={2} flexWrap="wrap">
            {filtered.map((preset: any) => (
              <Paper
                key={preset.size}
                sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}
              >
                <Typography fontWeight={600} mb={1}>
                  {preset.size.charAt(0).toUpperCase() + preset.size.slice(1)}
                </Typography>

                {(["cpu", "memory", "gpu"] as const).map((type) => {
                  const max = type === "cpu" ? 35 : type === "memory" ? 10 : 28; // 기준값
                  const percent = (preset[type] / max) * 100;

                  return (
                    <Box key={type} mb={1}>
                      <Typography variant="body2" fontWeight={500} mb={0.5}>
                        {type.toUpperCase()} (
                        {type === "memory" ? "GB" : "Core"})
                      </Typography>
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#eee",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${percent}%`,
                            height: "100%",
                            backgroundColor: RESOURCE_COLORS[type],
                          }}
                        />
                      </Box>
                      <Typography variant="caption">{preset[type]}</Typography>
                    </Box>
                  );
                })}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
      <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={() => setEditOpen(true)}>
            수정
          </Button>
        </Box>
        <PresetEditDrawer
          open={editOpen}
          onClose={() => setEditOpen(false)}
          presetName={taskType ?? "unknown"}
          presetData={filtered}
          onSave={() => {
            setRefreshKey((prev) => prev + 1); // 🔁 강제 리렌더
            setEditOpen(false); // 닫기
          }}
        />
        <Button variant="outlined" color="error" onClick={handleDelete}>
          삭제
        </Button>
      </Box>
    </Box>
  );
};

export default ResourcePresetDetail;
